/**
 * React-free entry point (`blockprint/config`): the boundary validator and
 * config types, importable from Node backends without a React peer. Keep
 * this module (and its imports) free of React — servers validating stored
 * configs want exactly this and nothing more.
 */
export { parseConfig, ConfigError } from "./parseConfig.ts";
export type { BlockConfig } from "./types.ts";
export type { StandardSchemaV1 } from "./standard-schema.ts";
