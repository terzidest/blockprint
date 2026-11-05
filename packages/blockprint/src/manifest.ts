import type { StandardSchemaV1 } from "./standard-schema.ts";

/**
 * Editor metadata for one field of a block's input. blockprint stores this
 * and does not interpret it — form generation decides what the keys mean.
 * Shallow by design: nested paths are out of scope.
 */
export interface FieldMeta {
  label?: string;
  help?: string;
  widget?: string;
  [key: string]: unknown;
}

export type FieldsFor<S extends StandardSchemaV1> =
  StandardSchemaV1.InferInput<S> extends Record<string, any>
    ? { [K in keyof StandardSchemaV1.InferInput<S> & string]?: FieldMeta }
    : never;

/**
 * A component-free block definition: everything an admin, a server, or a
 * test needs to know about a block, importable without the component.
 */
export interface BlockDefinition<
  S extends StandardSchemaV1 = StandardSchemaV1,
> {
  readonly schema: S;
  /** Display name; falls back to the manifest key. */
  readonly label?: string;
  /** Starting props for a newly inserted block, in the schema's INPUT shape. */
  readonly defaults?: StandardSchemaV1.InferInput<S>;
  /** One-line description of an instance, from the schema's OUTPUT shape. */
  readonly summary?: (props: StandardSchemaV1.InferOutput<S>) => string;
  readonly fields?: FieldsFor<S>;
  /** Reserved for future migration tooling. */
  readonly version?: number;
}

export type Manifest = Record<string, BlockDefinition<any>>;

/** The rendered/validated props of a definition (schema OUTPUT). */
export type OutputOf<D extends BlockDefinition<any>> =
  StandardSchemaV1.InferOutput<D["schema"]>;

/** The authorable props of a definition (schema INPUT; defaults optional). */
export type InputOf<D extends BlockDefinition<any>> =
  StandardSchemaV1.InferInput<D["schema"]>;

/**
 * Identity at runtime; the generic captures the schema so defaults check
 * against the schema's input and summary receives its output.
 */
export function defineBlock<S extends StandardSchemaV1>(
  definition: BlockDefinition<S> & { schema: S },
): BlockDefinition<S> {
  return definition;
}
