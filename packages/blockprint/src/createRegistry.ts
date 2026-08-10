import type { ComponentType } from "react";
import type { StandardSchemaV1 } from "./standard-schema";
import type { BlocksShape, Registry } from "./types";

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

export function createRegistry<T extends BlocksShape>(
  blocks: T & ValidateBlocks<T>,
): Registry<T> {
  return { blocks: blocks as T };
}
