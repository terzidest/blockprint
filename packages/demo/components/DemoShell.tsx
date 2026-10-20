"use client";

import { useEffect, useMemo, useState } from "react";
import { parseConfig } from "blockprint";
import { presets } from "../presets";
import { ConfigPanel } from "./ConfigPanel";
import { PreviewPanel } from "./PreviewPanel";

export type Hover = { index: number; source: "config" | "preview" } | null;

export function DemoShell() {
  const [activeKey, setActiveKey] = useState(presets[0]!.key);
  const [hover, setHover] = useState<Hover>(null);
  const [editMode, setEditMode] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [applied, setApplied] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string | null>(null);
  const preset = presets.find((candidate) => candidate.key === activeKey)!;

  const presetJson = useMemo(
    () => JSON.stringify(preset.config, null, 2),
    [preset],
  );
  const draft = drafts[preset.key] ?? presetJson;

  // Debounced apply: valid JSON with a valid outer shape becomes the live
  // config; anything else surfaces as an error while the last good config
  // keeps rendering. parseConfig is the library's own boundary validator,
  // used here the way a real app would use it at fetch time.
  useEffect(() => {
    if (!editMode) return;
    const handle = setTimeout(() => {
      try {
        const parsed: unknown = JSON.parse(draft);
        parseConfig(parsed);
        setApplied((prev) => ({ ...prev, [preset.key]: parsed }));
        setError(null);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : String(caught));
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [draft, editMode, preset.key]);

  const effectiveConfig = editMode
    ? (applied[preset.key] ?? preset.config)
    : preset.config;

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
                setError(null);
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
          <ConfigPanel
            config={preset.config}
            hover={editMode ? null : hover}
            onHover={setHover}
            editMode={editMode}
            draft={draft}
            dirty={draft !== presetJson}
            error={error}
            onToggleEdit={() => {
              setEditMode((on) => !on);
              setHover(null);
              setError(null);
            }}
            onDraftChange={(text) =>
              setDrafts((prev) => ({ ...prev, [preset.key]: text }))
            }
            onReset={() => {
              setDrafts((prev) => ({ ...prev, [preset.key]: presetJson }));
              setApplied((prev) => ({ ...prev, [preset.key]: preset.config }));
              setError(null);
            }}
          />
        </div>
        <div className="order-1 min-h-0 lg:order-2">
          <PreviewPanel
            config={effectiveConfig}
            theme={preset.theme}
            hover={editMode ? null : hover}
            onHover={setHover}
          />
        </div>
      </main>
    </div>
  );
}
