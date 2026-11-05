/**
 * React-free entry point (`blockprint/config`): the boundary validator, the
 * manifest system, and headless config validation — importable from Node
 * backends and editor apps without a React peer. Keep this module's import
 * graph free of React, including type-only imports.
 */
export { parseConfig, ConfigError } from "./parseConfig.ts";
export { defineBlock } from "./manifest.ts";
export type {
  BlockDefinition,
  FieldMeta,
  FieldsFor,
  InputOf,
  Manifest,
  OutputOf,
} from "./manifest.ts";
export { validateConfig } from "./validateConfig.ts";
export type { ValidatedEntry, ValidationReport } from "./validateConfig.ts";
export type { BlockConfig } from "./block-config.ts";
export type { StandardSchemaV1 } from "./standard-schema.ts";
