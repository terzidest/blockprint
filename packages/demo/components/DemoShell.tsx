"use client";

import { useState } from "react";
import { presets } from "../presets";
import { ConfigPanel } from "./ConfigPanel";
import { PreviewPanel } from "./PreviewPanel";

export type Hover = { index: number; source: "config" | "preview" } | null;

export function DemoShell() {
  const [activeKey, setActiveKey] = useState(presets[0]!.key);
  const [hover, setHover] = useState<Hover>(null);
  const preset = presets.find((candidate) => candidate.key === activeKey)!;

  return (
    <div className="flex h-dvh flex-col bg-slate-50 text-slate-900">
      <header className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-black/8 bg-white px-5 py-3">
        <div className="flex items-baseline gap-3">
          <h1 className="font-mono text-lg font-bold tracking-tight">blockprint</h1>
          <p className="hidden text-sm text-slate-500 sm:block">
            one renderer · one registry · pages from JSON
          </p>
        </div>
        <nav className="flex gap-1 rounded-lg bg-slate-100 p-1" role="tablist">
          {presets.map((candidate) => (
            <button
              key={candidate.key}
              role="tab"
              aria-selected={candidate.key === activeKey}
              onClick={() => {
                setActiveKey(candidate.key);
                setHover(null);
              }}
              className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                candidate.key === activeKey
                  ? candidate.key === "broken"
                    ? "bg-red-600 text-white shadow-sm"
                    : "bg-white text-slate-900 shadow-sm"
                  : candidate.key === "broken"
                    ? "text-red-600 hover:bg-red-50"
                    : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {candidate.label}
            </button>
          ))}
        </nav>
        <div className="ml-auto flex gap-4 font-mono text-xs">
          <a
            className="text-slate-500 hover:text-slate-900 hover:underline"
            href="https://www.npmjs.com/package/blockprint"
          >
            npm
          </a>
          <a
            className="text-slate-500 hover:text-slate-900 hover:underline"
            href="https://github.com/terzidest/blockprint"
          >
            github
          </a>
        </div>
      </header>

      <p
        className={`border-b px-5 py-2 text-[13px] ${
          preset.key === "broken"
            ? "border-red-200 bg-red-50 text-red-800"
            : "border-black/8 bg-white text-slate-500"
        }`}
      >
        {preset.note}
      </p>

      <main className="grid min-h-0 flex-1 lg:grid-cols-[minmax(340px,420px)_1fr]">
        {/* Config: below preview on mobile, left pane on desktop */}
        <div className="order-2 min-h-0 border-t border-black/8 max-lg:h-72 lg:order-1 lg:border-t-0 lg:border-r">
          <ConfigPanel config={preset.config} hover={hover} onHover={setHover} />
        </div>
        <div className="order-1 min-h-0 lg:order-2">
          <PreviewPanel
            config={preset.config}
            theme={preset.theme}
            hover={hover}
            onHover={setHover}
          />
        </div>
      </main>
    </div>
  );
}
