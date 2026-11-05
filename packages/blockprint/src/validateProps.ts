import type { StandardSchemaV1 } from "./standard-schema.ts";

export type PropsValidation =
  | { ok: true; value: unknown }
  | {
      ok: false;
      reason: "invalid-props" | "async-schema";
      issues: ReadonlyArray<StandardSchemaV1.Issue>;
    };

/**
 * The single semantics for validating one block's props against its schema,
 * shared by the Renderer and the headless validateConfig. Synchronous by
 * contract: an async schema is a config mistake, reported as such.
 */
export function validateProps(
  schema: StandardSchemaV1<unknown, any>,
  props: unknown,
): PropsValidation {
  const result = schema["~standard"].validate(props);
  if (result instanceof Promise) {
    return {
      ok: false,
      reason: "async-schema",
      issues: [
        {
          message:
            "schema validated asynchronously; blockprint only supports synchronous schemas",
        },
      ],
    };
  }
  if (result.issues) {
    return { ok: false, reason: "invalid-props", issues: result.issues };
  }
  return { ok: true, value: result.value };
}
