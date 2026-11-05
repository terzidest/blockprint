import type { FallbackProps } from "./types.ts";
import { isDev } from "./env.ts";

export function DefaultFallback(props: FallbackProps) {
  if (!isDev()) {
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
