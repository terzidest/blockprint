import type { ComponentType } from "react";
import type { StandardSchemaV1 } from "./standard-schema";

export type AnyComponent = ComponentType<any>;

export type BlockDef =
  | AnyComponent
  | { component: AnyComponent; schema?: StandardSchemaV1<unknown, any> };

export type BlocksShape = Record<string, BlockDef>;

/**
 * The props a definition delivers at runtime. When a schema is present it is
 * the source of truth: the component receives the schema's parsed output.
 */
export type PropsOfDef<D> = D extends {
  schema: StandardSchemaV1<unknown, infer S>;
}
  ? S
  : D extends { component: ComponentType<infer P> }
    ? P
    : D extends ComponentType<infer P>
      ? P
      : never;

export interface Registry<T extends BlocksShape> {
  readonly blocks: T;
}

/**
 * A single entry as it arrives from a CMS. Deliberately open: `type` is any
 * string, because untrusted configs may contain types the registry has never
 * seen — those route to the fallback instead of crashing.
 */
export interface BlockConfig {
  type: string;
  props?: unknown;
  id?: string | number;
}

/**
 * The props a consumer may author for a definition. With a schema this is the
 * schema's INPUT type — authored configs are pre-validation data, so fields
 * with defaults are optional. (The component still receives the parsed
 * output; see PropsOfDef.)
 */
export type InputOfDef<D> = D extends {
  schema: StandardSchemaV1<infer I, any>;
}
  ? I
  : PropsOfDef<D>;

/**
 * The closed, fully typed config union for a given registry — for configs
 * authored in TypeScript rather than fetched from a CMS. Block names
 * autocomplete and props are checked per block.
 */
export type ConfigFor<R extends Registry<BlocksShape>> =
  R extends Registry<infer T>
    ? Array<
        {
          [K in keyof T]: {
            type: K;
            props: InputOfDef<T[K]>;
            id?: string | number;
          };
        }[keyof T]
      >
    : never;

export type FallbackProps =
  | { reason: "unknown-type"; type: string; props: unknown }
  | {
      reason: "invalid-props";
      type: string;
      props: unknown;
      issues: ReadonlyArray<StandardSchemaV1.Issue>;
    };
