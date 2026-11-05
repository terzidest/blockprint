import type { FallbackProps } from "blockprint";

/**
 * The demo's custom fallback. Deliberately loud: blockprint's default
 * fallback renders nothing in production builds, so a deployed demo must
 * bring its own to make failure visible.
 */
export function FallbackCard(props: FallbackProps) {
  return (
    <section className="px-8 py-4">
      <div className="rounded-xl border-2 border-dashed border-red-300 bg-red-50 p-5 font-sans">
        <p className="text-sm font-bold text-red-700">
          {props.reason === "unknown-type"
            ? `Unknown block type: "${props.type}"`
            : props.reason === "render-error"
              ? `Block "${props.type}" crashed while rendering`
              : `Invalid props for "${props.type}"`}
        </p>
        {props.reason === "unknown-type" ? (
          <p className="mt-1 text-sm text-red-600/80">
            No component is registered under this name — likely a typo in the
            CMS. The page keeps rendering; this block falls back.
          </p>
        ) : props.reason === "render-error" ? (
          <p className="mt-1 text-sm text-red-600/80">
            {props.error instanceof Error ? props.error.message : String(props.error)}
          </p>
        ) : (
          <ul className="mt-1 space-y-0.5 text-sm text-red-600/80">
            {props.issues.map((issue, index) => (
              <li key={index}>
                {issue.path?.length
                  ? `${issue.path.map((segment) => (typeof segment === "object" ? String(segment.key) : String(segment))).join(".")}: `
                  : ""}
                {issue.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
