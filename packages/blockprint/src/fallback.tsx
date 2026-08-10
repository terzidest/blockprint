import type { FallbackProps } from "./types";

// Ambient declaration instead of @types/node: bundlers replace
// process.env.NODE_ENV statically, and the library has no other Node surface.
declare const process: { env: { NODE_ENV?: string } };

export function DefaultFallback(props: FallbackProps) {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const detail =
    props.reason === "invalid-props"
      ? props.issues.map((issue) => issue.message).join("; ")
      : "no component registered for this type";

  return (
    <div
      role="note"
      style={{
        border: "1px dashed #c00",
        borderRadius: 4,
        padding: "8px 12px",
        fontFamily: "monospace",
        fontSize: 13,
        color: "#c00",
      }}
    >
      blockprint: block &quot;{props.type}&quot; not rendered ({props.reason}):{" "}
      {detail}
    </div>
  );
}
