import { Fragment } from "react";
import type { ComponentType, ReactNode } from "react";
import type { StandardSchemaV1 } from "./standard-schema";
import type {
  AnyComponent,
  BlockConfig,
  BlocksShape,
  FallbackProps,
  Registry,
} from "./types";
import { parseConfig } from "./parseConfig";
import { DefaultFallback } from "./fallback";

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

export function Renderer<T extends BlocksShape>({
  config,
  registry,
  fallback,
  wrapBlock,
}: RendererProps<T>): ReactNode {
  const Fallback = fallback ?? DefaultFallback;
  const entries = parseConfig(config);

  return entries.map((entry, index) => {
    const key = entry.id ?? `${entry.type}-${index}`;
    const node = renderEntry(entry, registry, Fallback);
    // The key lives on a Fragment so it survives whatever wrapBlock returns.
    return (
      <Fragment key={key}>
        {wrapBlock ? wrapBlock(node, entry, index) : node}
      </Fragment>
    );
  });
}

function renderEntry(
  entry: BlockConfig,
  registry: Registry<BlocksShape>,
  Fallback: ComponentType<FallbackProps>,
): ReactNode {
  if (!Object.hasOwn(registry.blocks, entry.type)) {
    return (
      <Fallback reason="unknown-type" type={entry.type} props={entry.props} />
    );
  }

  const { component: Component, schema } = resolveDef(
    registry.blocks[entry.type] as BlocksShape[string],
  );

  let props = entry.props;
  if (schema) {
    const result = schema["~standard"].validate(entry.props);
    // React render is synchronous; async schemas are a config mistake and
    // are contained like any other invalid block.
    if (result instanceof Promise) {
      return (
        <Fallback
          reason="invalid-props"
          type={entry.type}
          props={entry.props}
          issues={[
            {
              message:
                "schema validated asynchronously; blockprint only supports synchronous schemas",
            },
          ]}
        />
      );
    }
    if (result.issues) {
      return (
        <Fallback
          reason="invalid-props"
          type={entry.type}
          props={entry.props}
          issues={result.issues}
        />
      );
    }
    props = result.value;
  }

  return <Component {...(props as object | undefined)} />;
}
