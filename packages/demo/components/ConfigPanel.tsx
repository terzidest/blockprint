"use client";

import { useEffect, useRef } from "react";
import { parseConfig } from "blockprint";
import { highlightJson } from "./highlightJson";
import type { Hover } from "./DemoShell";

interface ConfigPanelProps {
  config: unknown;
  hover: Hover;
  onHover: (hover: Hover) => void;
}

export function ConfigPanel({ config, hover, onHover }: ConfigPanelProps) {
  const entries = parseConfig(config);

  return (
    <div className="h-full overflow-y-auto bg-slate-900 p-3 font-mono text-[12.5px] leading-relaxed">
      <p className="px-2 pt-1 pb-3 font-sans text-[11px] font-semibold tracking-widest text-slate-400 uppercase">
        config — what a CMS would send
      </p>
      {entries.map((entry, index) => (
        <ConfigEntry
          key={index}
          json={JSON.stringify(entry, null, 2)}
          active={hover?.index === index}
          scrollTo={hover?.index === index && hover.source === "preview"}
          onEnter={() => onHover({ index, source: "config" })}
          onLeave={() => onHover(null)}
        />
      ))}
    </div>
  );
}

function ConfigEntry({
  json,
  active,
  scrollTo,
  onEnter,
  onLeave,
}: {
  json: string;
  active: boolean;
  scrollTo: boolean;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const ref = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (scrollTo) {
      ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [scrollTo]);

  return (
    <pre
      ref={ref}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={`mb-1.5 cursor-default overflow-x-auto rounded-lg p-2 whitespace-pre transition-colors ${
        active ? "bg-slate-700/70 ring-1 ring-sky-400" : "hover:bg-slate-800"
      }`}
    >
      {highlightJson(json)}
    </pre>
  );
}
