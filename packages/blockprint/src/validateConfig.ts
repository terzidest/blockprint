import type { BlockConfig } from "./block-config.ts";
import type { Manifest } from "./manifest.ts";
import type { StandardSchemaV1 } from "./standard-schema.ts";
import { parseConfig, ConfigError } from "./parseConfig.ts";
import { validateProps } from "./validateProps.ts";

export type ValidatedEntry =
  | { index: number; entry: BlockConfig; ok: true; value: unknown }
  | { index: number; entry: BlockConfig; ok: false; reason: "unknown-type" }
  | {
      index: number;
      entry: BlockConfig;
      ok: false;
      reason: "invalid-props" | "async-schema";
      issues: ReadonlyArray<StandardSchemaV1.Issue>;
    };

export interface ValidationReport {
  /**
   * Outer shape valid and no entry failed validation. Unknown types do NOT
   * flip this — they are the renderer's fallback case and whether they are
   * acceptable is the caller's policy (check `unknownTypes` for strictness).
   */
  ok: boolean;
  /** Outer-shape failure; when present, `entries` is empty. */
  error?: { message: string };
  entries: ValidatedEntry[];
  /** Distinct types with no manifest entry, in order of first appearance. */
  unknownTypes: string[];
  /** Ids appearing more than once, in order of first duplication. */
  duplicateIds: Array<string | number>;
}

/**
 * Total, headless validation of an untrusted config against a manifest —
 * never throws. One function for save-time validation, tests, loaders, and
 * editors; the Renderer applies the same per-entry semantics.
 */
export function validateConfig(
  manifest: Manifest,
  config: unknown,
): ValidationReport {
  let parsed: BlockConfig[];
  try {
    parsed = parseConfig(config);
  } catch (error) {
    return {
      ok: false,
      error: {
        message:
          error instanceof ConfigError ? error.message : String(error),
      },
      entries: [],
      unknownTypes: [],
      duplicateIds: [],
    };
  }

  const unknownTypes: string[] = [];
  const duplicateIds: Array<string | number> = [];
  const seenIds = new Set<string | number>();

  const entries = parsed.map((entry, index): ValidatedEntry => {
    if (entry.id !== undefined) {
      if (seenIds.has(entry.id) && !duplicateIds.includes(entry.id)) {
        duplicateIds.push(entry.id);
      }
      seenIds.add(entry.id);
    }

    if (!Object.hasOwn(manifest, entry.type)) {
      if (!unknownTypes.includes(entry.type)) unknownTypes.push(entry.type);
      return { index, entry, ok: false, reason: "unknown-type" };
    }

    const validation = validateProps(manifest[entry.type]!.schema, entry.props);
    if (!validation.ok) {
      return {
        index,
        entry,
        ok: false,
        reason: validation.reason,
        issues: validation.issues,
      };
    }
    return { index, entry, ok: true, value: validation.value };
  });

  const ok = entries.every(
    (item) => item.ok || item.reason === "unknown-type",
  );
  return { ok, entries, unknownTypes, duplicateIds };
}
