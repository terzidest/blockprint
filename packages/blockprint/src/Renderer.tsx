import { Component, Fragment, useMemo } from "react";
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

// StrictMode double-invokes render (and therefore the memo) in development;
// remember what we've already warned about so each duplicate id logs once.
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
   * Telemetry hook, invoked synchronously whenever an entry resolves to a
   * fallback (and from the error boundary for render errors). Synchronous so
   * it works in Server Components; expect one invocation per environment
   * (server render + client hydration) and doubled calls under StrictMode —
   * dedupe downstream if exactness matters.
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
   * down. Client-side containment only — React error boundaries do not catch
   * during server rendering, and class boundaries require a client
   * environment, so enable this from a client component.
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
  onFallback?: (info: FallbackInfo) => void,
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
      onFallback?.({ ...fallbackProps, index });
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
  renderFallback: (error: unknown) => ReactNode;
  onError?: (error: unknown) => void;
  children: ReactNode;
}

class BlockBoundary extends Component<BoundaryProps, { error?: unknown }> {
  override state: { error?: unknown } = {};

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  override componentDidCatch(error: unknown) {
    this.props.onError?.(error);
  }

  override render() {
    return "error" in this.state
      ? this.props.renderFallback(this.state.error)
      : this.props.children;
  }
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

  // Parsing and schema validation run once per (config, registry) identity.
  // onFallback is deliberately not a dependency: it is only invoked inside a
  // recompute, which always closes over the current render's value — listing
  // it would defeat the memo for inline callbacks.
  const prepared = useMemo(() => {
    try {
      return { entries: prepare(config, registry, onFallback) };
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

  return prepared.entries.map((item, index) => {
    let node: ReactNode =
      item.kind === "block" ? (
        <item.component {...(item.props as object | undefined)} />
      ) : (
        <Fallback {...item.fallbackProps} />
      );

    if (catchBlockErrors && item.kind === "block") {
      node = (
        <BlockBoundary
          renderFallback={(error) => (
            <Fallback
              reason="render-error"
              type={item.entry.type}
              props={item.entry.props}
              error={error}
            />
          )}
          onError={(error) =>
            onFallback?.({
              reason: "render-error",
              type: item.entry.type,
              props: item.entry.props,
              error,
              index,
            })
          }
        >
          {node}
        </BlockBoundary>
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
