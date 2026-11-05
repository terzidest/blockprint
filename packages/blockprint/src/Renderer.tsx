import { Fragment, useMemo } from "react";
import type { ComponentType, ReactNode } from "react";
import type { StandardSchemaV1 } from "./standard-schema.ts";
import type {
  AnyComponent,
  BlockConfig,
  BlocksShape,
  FallbackProps,
  Registry,
} from "./types.ts";
import { parseConfig } from "./parseConfig.ts";
import { DefaultFallback } from "./fallback.tsx";
import { isDev } from "./env.ts";

// StrictMode double-invokes render (and therefore the memo) in development;
// remember what we've already warned about so each duplicate id logs once.
const warnedDuplicateIds = new Set<string | number>();

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
}

interface ResolvedDef {
  component: AnyComponent;
  schema?: StandardSchemaV1<unknown, any>;
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

    if (!Object.hasOwn(registry.blocks, entry.type)) {
      return {
        key,
        entry,
        kind: "fallback" as const,
        fallbackProps: {
          reason: "unknown-type" as const,
          type: entry.type,
          props: entry.props,
        },
      };
    }

    const { component, schema } = resolveDef(
      registry.blocks[entry.type] as BlocksShape[string],
    );

    if (!schema) {
      return {
        key,
        entry,
        kind: "block" as const,
        component,
        props: entry.props,
      };
    }

    const result = schema["~standard"].validate(entry.props);
    // React render is synchronous; async schemas are a config mistake and
    // are contained like any other invalid block.
    if (result instanceof Promise) {
      return {
        key,
        entry,
        kind: "fallback" as const,
        fallbackProps: {
          reason: "invalid-props" as const,
          type: entry.type,
          props: entry.props,
          issues: [
            {
              message:
                "schema validated asynchronously; blockprint only supports synchronous schemas",
            },
          ],
        },
      };
    }
    if (result.issues) {
      return {
        key,
        entry,
        kind: "fallback" as const,
        fallbackProps: {
          reason: "invalid-props" as const,
          type: entry.type,
          props: entry.props,
          issues: result.issues,
        },
      };
    }
    return {
      key,
      entry,
      kind: "block" as const,
      component,
      props: result.value,
    };
  });
}

export function Renderer<T extends BlocksShape>({
  config,
  registry,
  fallback,
  wrapBlock,
}: RendererProps<T>): ReactNode {
  const Fallback = fallback ?? DefaultFallback;
  // Parsing and schema validation run once per (config, registry) identity,
  // not on every render; a consumer recreating the config array each render
  // opts out of the caching, not the correctness.
  const prepared = useMemo(() => prepare(config, registry), [config, registry]);

  return prepared.map((item, index) => {
    const node =
      item.kind === "block" ? (
        <item.component {...(item.props as object | undefined)} />
      ) : (
        <Fallback {...item.fallbackProps} />
      );
    // The key lives on a Fragment so it survives whatever wrapBlock returns.
    return (
      <Fragment key={item.key}>
        {wrapBlock ? wrapBlock(node, item.entry, index) : node}
      </Fragment>
    );
  });
}
