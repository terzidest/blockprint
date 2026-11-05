import type { ComponentType } from "react";
import type { StandardSchemaV1 } from "./standard-schema.ts";
import type { BlocksShape, Registry } from "./types.ts";
import type { Manifest, OutputOf } from "./manifest.ts";

/**
 * Maps every compatible entry to `unknown` (an identity when intersected) and
 * every entry whose schema output is not assignable to its component's props
 * to an impossible shape — so the type error lands on the offending key with
 * a message naming it.
 */
export type ValidateBlocks<T extends BlocksShape> = {
  [K in keyof T]: T[K] extends {
    component: ComponentType<infer P>;
    schema: StandardSchemaV1<unknown, infer S>;
  }
    ? [S] extends [P]
      ? unknown
      : {
          schema: `schema output is not assignable to props of '${K & string}'`;
        }
    : unknown;
};

/**
 * One component per manifest key, each able to accept its schema's output.
 * Contravariance does the per-key checking: a component requiring a prop the
 * schema doesn't produce fails on that key.
 */
export type ComponentsFor<M extends Manifest> = {
  [K in keyof M]: ComponentType<OutputOf<M[K]>>;
};

/** Rejects component keys that have no manifest entry. */
export type NoExtraComponents<C, M> = {
  [K in Exclude<keyof C, keyof M>]: never;
};

export type JoinedShape<M extends Manifest, C extends ComponentsFor<M>> = {
  [K in keyof M]: { component: C[K]; schema: M[K]["schema"] };
};

export function createRegistry<T extends BlocksShape>(
  blocks: T & ValidateBlocks<T>,
): Registry<T>;
export function createRegistry<M extends Manifest, C extends ComponentsFor<M>>(
  manifest: M,
  components: C & NoExtraComponents<C, M>,
): Registry<JoinedShape<M, C>>;
export function createRegistry(
  first: Record<string, unknown>,
  components?: Record<string, unknown>,
): Registry<BlocksShape> {
  if (components === undefined) {
    return { blocks: first as BlocksShape };
  }
  const blocks: Record<string, unknown> = {};
  for (const key of Object.keys(first)) {
    const component = components[key];
    if (component === undefined) {
      throw new Error(
        `createRegistry: no component provided for manifest block '${key}'`,
      );
    }
    blocks[key] = {
      component,
      schema: (first[key] as { schema: unknown }).schema,
    };
  }
  return { blocks: blocks as BlocksShape };
}
