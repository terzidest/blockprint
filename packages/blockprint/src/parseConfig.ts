import type { BlockConfig } from "./types";

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

/**
 * The single boundary where untrusted input becomes a typed config. Validates
 * the outer shape only; per-block props are validated against their registered
 * schema at render time.
 */
export function parseConfig(input: unknown): BlockConfig[] {
  if (!Array.isArray(input)) {
    throw new ConfigError(
      `config must be an array, received ${input === null ? "null" : typeof input}`,
    );
  }

  return input.map((entry, index) => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      throw new ConfigError(`config[${index}] must be an object`);
    }
    const { type, props, id } = entry as Record<string, unknown>;
    if (typeof type !== "string" || type.length === 0) {
      throw new ConfigError(
        `config[${index}].type must be a non-empty string`,
      );
    }
    if (id !== undefined && typeof id !== "string" && typeof id !== "number") {
      throw new ConfigError(
        `config[${index}].id must be a string or number when present`,
      );
    }
    return id === undefined ? { type, props } : { type, props, id };
  });
}
