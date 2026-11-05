export { createRegistry } from "./createRegistry.ts";
export { Renderer } from "./Renderer.tsx";
export type { RendererProps, FallbackInfo } from "./Renderer.tsx";
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
export type { ComponentsFor, JoinedShape } from "./createRegistry.ts";
export type {
  BlockConfig,
  BlockDef,
  BlocksShape,
  ConfigFor,
  FallbackProps,
  InputFor,
  PropsFor,
  Registry,
} from "./types.ts";
export type { StandardSchemaV1 } from "./standard-schema.ts";
