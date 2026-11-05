import type { ComponentType } from "react";
import type { StandardSchemaV1 } from "./standard-schema.ts";

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

export type { BlockConfig } from "./block-config.ts";

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

/**
 * The props a given block type's component receives at render time (schema
 * OUTPUT when a schema exists). For building editors and tooling against a
 * registry without importing its components' modules at runtime.
 */
export type PropsFor<
  R extends Registry<BlocksShape>,
  K extends keyof R["blocks"],
> = PropsOfDef<R["blocks"][K]>;

/**
 * The props a given block type accepts when authoring a config (schema INPUT
 * when a schema exists — defaulted fields optional).
 */
export type InputFor<
  R extends Registry<BlocksShape>,
  K extends keyof R["blocks"],
> = InputOfDef<R["blocks"][K]>;

export type FallbackProps =
  | { reason: "unknown-type"; type: string; props: unknown }
  | {
      reason: "invalid-props";
      type: string;
      props: unknown;
      issues: ReadonlyArray<StandardSchemaV1.Issue>;
    }
  | {
      /** A block component threw while rendering (catchBlockErrors only). */
      reason: "render-error";
      type: string;
      props: unknown;
      error: unknown;
    };
