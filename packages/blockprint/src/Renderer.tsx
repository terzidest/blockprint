import { Fragment, useMemo } from "react";
// Namespace import: React.Component must only be touched lazily — the
// react-server condition's build exports useMemo/Fragment but NOT Component,
// and the main entry must stay loadable from Server Components.
import * as React from "react";
import type { ComponentType, ReactNode } from "react";
import type {
  AnyComponent,
  BlockConfig,
  BlocksShape,
  FallbackProps,
  Registry,
} from "./types.ts";
import { parseConfig, ConfigError } from "./parseConfig.ts";
import { validateProps } from "./validateProps.ts";
import { DefaultFallback } from "./fallback.tsx";
import { isDev } from "./env.ts";

// Module-global on purpose: this is a config-authoring diagnostic, not a
// per-instance signal — a second Renderer repeating the same duplicate id
// will not re-warn. StrictMode double-invokes are deduped by the same set.
const warnedDuplicateIds = new Set<string | number>();

export type FallbackInfo = FallbackProps & { index: number };

export interface RendererProps<T extends BlocksShape> {
  /** Untrusted input; the outer shape is validated internally. */
  config: unknown;
  registry: Registry<T>;
  fallback?: ComponentType<FallbackProps>;
  /**
   * Wraps every rendered entry — blocks and fallbacks alike — with access to
   * the config entry and its index. The hook point for visual-editing
   * overlays, analytics boundaries, or per-block chrome.
   */
  wrapBlock?: (node: ReactNode, entry: BlockConfig, index: number) => ReactNode;
  /**
   * Telemetry hook for entries that resolve to a fallback (and render errors
   * caught by catchBlockErrors). Invoked synchronously so it works in Server
   * Components, and deduped per Renderer instance on (reason, type, index) —
   * so unstable config identities don't re-fire it. Expect one call per
   * environment (server render + client hydration), and possible doubling
   * under StrictMode in development.
   */
  onFallback?: (info: FallbackInfo) => void;
  /**
   * Rendered instead of throwing when the outer config shape is invalid.
   * Without it, invalid outer shape throws ConfigError (the default, so
   * boundary-less apps fail loudly rather than silently blank).
   */
  invalidConfigFallback?: ReactNode;
  /**
   * Wrap every block in an error boundary: a block that throws while
   * rendering becomes a `render-error` fallback instead of taking the page
   * down, and recovers when the entry changes. Client-side containment only —
   * React error boundaries do not catch during server rendering, and class
   * boundaries do not exist in Server Components, so enabling this outside a
   * client environment throws a descriptive error.
   */
  catchBlockErrors?: boolean;
}

interface ResolvedDef {
  component: AnyComponent;
  schema?: import("./standard-schema.ts").StandardSchemaV1<unknown, any>;
}

// `memo`/`forwardRef` components are exotic objects, not functions, so the
// bare-vs-definition split must discriminate on the `component` key.
function resolveDef(def: BlocksShape[string]): ResolvedDef {
  if (typeof def === "object" && def !== null && "component" in def) {
    return def;
  }
  return { component: def };
}

type PreparedEntry = { key: string | number; entry: BlockConfig } & (
  | { kind: "block"; component: AnyComponent; props: unknown }
  | { kind: "fallback"; fallbackProps: FallbackProps }
);

function prepare(
  config: unknown,
  registry: Registry<BlocksShape>,
  emitFallback: (info: FallbackInfo) => void,
): PreparedEntry[] {
  const entries = parseConfig(config);
  const seenKeys = new Set<string | number>();

  return entries.map((entry, index) => {
    let key = entry.id ?? `${entry.type}-${index}`;
    if (seenKeys.has(key)) {
      if (isDev() && !warnedDuplicateIds.has(key)) {
        warnedDuplicateIds.add(key);
        console.warn(
          `blockprint: duplicate block id "${key}" at config[${index}]; ids should be unique per config`,
        );
      }
      key = `${key}__dup${index}`;
    }
    seenKeys.add(key);

    const toFallback = (fallbackProps: FallbackProps): PreparedEntry => {
      emitFallback({ ...fallbackProps, index });
      return { key, entry, kind: "fallback", fallbackProps };
    };

    if (!Object.hasOwn(registry.blocks, entry.type)) {
      return toFallback({
        reason: "unknown-type",
        type: entry.type,
        props: entry.props,
      });
    }

    const { component, schema } = resolveDef(
      registry.blocks[entry.type] as BlocksShape[string],
    );

    if (!schema) {
      return { key, entry, kind: "block", component, props: entry.props };
    }

    const validation = validateProps(schema, entry.props);
    if (!validation.ok) {
      return toFallback({
        reason: "invalid-props",
        type: entry.type,
        props: entry.props,
        issues: validation.issues,
      });
    }
    return { key, entry, kind: "block", component, props: validation.value };
  });
}

interface BoundaryProps {
  /** New identity resets a caught error, so edited entries get retried. */
  resetKey: unknown;
  renderFallback: (error: unknown) => ReactNode;
  onError?: (error: unknown) => void;
  children?: ReactNode;
}

interface BoundaryState {
  hasError: boolean;
  error?: unknown;
}

interface BoundaryInstance {
  props: BoundaryProps;
  state: BoundaryState;
  setState(state: BoundaryState): void;
  render(): ReactNode;
}

let LazyBoundary: ComponentType<BoundaryProps> | undefined;

/**
 * The boundary class is created on first use so React.Component is never
 * touched at module load — the react-server build doesn't export it.
 */
function getBlockBoundary(): ComponentType<BoundaryProps> {
  if (LazyBoundary) return LazyBoundary;

  const Base = (React as unknown as Record<string, unknown>).Component as
    | (new (props: BoundaryProps) => BoundaryInstance)
    | undefined;
  if (typeof Base !== "function") {
    throw new Error(
      "blockprint: catchBlockErrors requires a client React environment — error boundaries are not available in Server Components",
    );
  }

  class BlockBoundary extends Base {
    state: BoundaryState = { hasError: false };

    static getDerivedStateFromError(error: unknown): BoundaryState {
      return { hasError: true, error };
    }

    componentDidCatch(error: unknown) {
      this.props.onError?.(error);
    }

    componentDidUpdate(previous: BoundaryProps) {
      if (this.state.hasError && previous.resetKey !== this.props.resetKey) {
        this.setState({ hasError: false, error: undefined });
      }
    }

    render() {
      return this.state.hasError
        ? this.props.renderFallback(this.state.error)
        : this.props.children;
    }
  }

  LazyBoundary = BlockBoundary as unknown as ComponentType<BoundaryProps>;
  return LazyBoundary;
}

export function Renderer<T extends BlocksShape>({
  config,
  registry,
  fallback,
  wrapBlock,
  onFallback,
  invalidConfigFallback,
  catchBlockErrors,
}: RendererProps<T>): ReactNode {
  const Fallback = fallback ?? DefaultFallback;

  // Per-instance dedupe for onFallback: unstable config identities (inline
  // arrays, `x ?? []`) re-run the memo, but telemetry fires at most once per
  // (reason, type, index) for the life of this Renderer instance.
  const firedFallbacks = useMemo(() => new Set<string>(), []);

  // Parsing and schema validation run once per (config, registry) identity.
  // onFallback is deliberately not a dependency: it is only invoked inside a
  // recompute, which always closes over the current render's value — listing
  // it would defeat the memo for inline callbacks.
  const prepared = useMemo(() => {
    const emitFallback = (info: FallbackInfo) => {
      const dedupeKey = `${info.reason}:${info.type}:${info.index}`;
      if (firedFallbacks.has(dedupeKey)) return;
      firedFallbacks.add(dedupeKey);
      onFallback?.(info);
    };
    try {
      return { entries: prepare(config, registry, emitFallback) };
    } catch (error) {
      if (error instanceof ConfigError) return { configError: error };
      throw error;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, registry]);

  if ("configError" in prepared) {
    if (invalidConfigFallback !== undefined) return invalidConfigFallback;
    throw prepared.configError;
  }

  const Boundary = catchBlockErrors ? getBlockBoundary() : undefined;

  return prepared.entries.map((item, index) => {
    let node: ReactNode =
      item.kind === "block" ? (
        <item.component {...(item.props as object | undefined)} />
      ) : (
        <Fallback {...item.fallbackProps} />
      );

    if (Boundary && item.kind === "block") {
      node = (
        <Boundary
          resetKey={item.entry}
          renderFallback={(error) => (
            <Fallback
              reason="render-error"
              type={item.entry.type}
              props={item.entry.props}
              error={error}
            />
          )}
          onError={(error) => {
            const dedupeKey = `render-error:${item.entry.type}:${index}`;
            if (firedFallbacks.has(dedupeKey)) return;
            firedFallbacks.add(dedupeKey);
            onFallback?.({
              reason: "render-error",
              type: item.entry.type,
              props: item.entry.props,
              error,
              index,
            });
          }}
        >
          {node}
        </Boundary>
      );
    }

    // The key lives on a Fragment so it survives whatever wrapBlock returns.
    return (
      <Fragment key={item.key}>
        {wrapBlock ? wrapBlock(node, item.entry, index) : node}
      </Fragment>
    );
  });
}
