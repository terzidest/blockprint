"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Renderer } from "blockprint";
import { registry } from "../registry";
import { FallbackCard } from "./FallbackCard";
import type { Hover } from "./DemoShell";

interface PreviewPanelProps {
  config: unknown;
  theme: string;
  hover: Hover;
  onHover: (hover: Hover) => void;
}

export function PreviewPanel({ config, theme, hover, onHover }: PreviewPanelProps) {
  return (
    <div className="h-full overflow-y-auto">
      {/* faux browser chrome */}
      <div className="sticky top-0 z-10 flex items-center gap-1.5 border-b border-black/8 bg-slate-100/95 px-4 py-2.5 backdrop-blur">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        <span className="ml-3 rounded-md bg-white px-3 py-0.5 text-[11px] text-black/40">
          rendered by &lt;Renderer /&gt;
        </span>
      </div>
      <div className={`preview-surface ${theme}`}>
        <Renderer
          config={config}
          registry={registry}
          fallback={FallbackCard}
          wrapBlock={(node, entry, index) => (
            <HoverZone
              type={entry.type}
              active={hover?.index === index}
              scrollTo={hover?.index === index && hover.source === "config"}
              onEnter={() => onHover({ index, source: "preview" })}
              onLeave={() => onHover(null)}
            >
              {node}
            </HoverZone>
          )}
        />
      </div>
    </div>
  );
}

function HoverZone({
  type,
  active,
  scrollTo,
  onEnter,
  onLeave,
  children,
}: {
  type: string;
  active: boolean;
  scrollTo: boolean;
  onEnter: () => void;
  onLeave: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollTo) {
      ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [scrollTo]);

  return (
    <div
      ref={ref}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={`relative transition-shadow ${
        active ? "shadow-[inset_0_0_0_2px_#38bdf8]" : ""
      }`}
    >
      {active && (
        <span className="absolute top-1.5 right-1.5 z-20 rounded bg-sky-400 px-1.5 py-0.5 font-mono text-[10px] font-bold text-sky-950">
          {type}
        </span>
      )}
      {children}
    </div>
  );
}
