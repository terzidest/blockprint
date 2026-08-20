import type { ReactNode } from "react";

const TOKEN =
  /("(?:[^"\\]|\\.)*")(\s*:)?|-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b|\btrue\b|\bfalse\b|\bnull\b/g;

/** Minimal JSON syntax highlighter — no dependency needed for four colors. */
export function highlightJson(json: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;

  for (const match of json.matchAll(TOKEN)) {
    const index = match.index;
    if (index > last) {
      nodes.push(
        <span key={key++} className="text-slate-500">
          {json.slice(last, index)}
        </span>,
      );
    }
    const [full, string, colon] = match;
    if (string !== undefined) {
      if (colon !== undefined) {
        nodes.push(
          <span key={key++} className="text-sky-300">
            {string}
          </span>,
          <span key={key++} className="text-slate-500">
            {colon}
          </span>,
        );
      } else {
        nodes.push(
          <span key={key++} className="text-emerald-300">
            {string}
          </span>,
        );
      }
    } else if (full === "true" || full === "false" || full === "null") {
      nodes.push(
        <span key={key++} className="text-rose-400">
          {full}
        </span>,
      );
    } else {
      nodes.push(
        <span key={key++} className="text-amber-300">
          {full}
        </span>,
      );
    }
    last = index + full.length;
  }

  if (last < json.length) {
    nodes.push(
      <span key={key++} className="text-slate-500">
        {json.slice(last)}
      </span>,
    );
  }

  return nodes;
}
