"use client";

import { useEffect, useRef } from "react";
import { parseConfig } from "blockprint";
import { highlightJson } from "./highlightJson";
import type { Hover } from "./DemoShell";

interface ConfigPanelProps {
  config: unknown;
  hover: Hover;
  onHover: (hover: Hover) => void;
  onMove: (index: number, delta: -1 | 1) => void;
  editMode: boolean;
  draft: string;
  dirty: boolean;
  error: string | null;
  onToggleEdit: () => void;
  onDraftChange: (text: string) => void;
  onReset: () => void;
}

export function ConfigPanel({
  config,
  hover,
  onHover,
  onMove,
  editMode,
  draft,
  dirty,
  error,
  onToggleEdit,
  onDraftChange,
  onReset,
}: ConfigPanelProps) {
  const entries = parseConfig(config);

  return (
    <div className="flex h-full flex-col bg-slate-900">
      <div className="flex items-center justify-between gap-2 px-5 pt-4 pb-2">
        <p className="font-sans text-[11px] font-semibold tracking-widest text-slate-400 uppercase">
          config — what a CMS would send
        </p>
        <div className="flex items-center gap-2 font-sans text-[11px] font-semibold">
          {dirty && (
            <button
              onClick={onReset}
              className="text-slate-400 hover:text-white"
            >
              Reset
            </button>
          )}
          <button
            onClick={onToggleEdit}
            className={`rounded px-2.5 py-1 transition-colors ${
              editMode
                ? "bg-sky-400 text-sky-950 hover:bg-sky-300"
                : "bg-slate-700 text-slate-100 hover:bg-slate-600"
            }`}
          >
            {editMode ? "Done" : "Edit"}
          </button>
        </div>
      </div>

      {editMode ? (
        <>
          <p className="px-5 pb-2 font-sans text-[11px] leading-relaxed text-slate-500">
            Edit freely — the page re-renders live. Typo a block type or break a
            prop and watch the fallback catch it.
          </p>
          {error && (
            <p className="mx-3 mb-2 rounded-md bg-red-950/80 px-3 py-2 font-mono text-[11px] leading-relaxed text-red-300">
              {error} — showing the last valid config
            </p>
          )}
          <textarea
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            aria-label="Editable page config JSON"
            className="min-h-0 flex-1 resize-none bg-slate-900 p-4 pt-1 font-mono text-[12.5px] leading-relaxed text-slate-200 outline-none"
          />
        </>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto p-3 pt-1 font-mono text-[12.5px] leading-relaxed">
          {entries.map((entry, index) => (
            <ConfigEntry
              key={index}
              json={JSON.stringify(entry, null, 2)}
              active={hover?.index === index}
              scrollTo={hover?.index === index && hover.source === "preview"}
              onEnter={() => onHover({ index, source: "config" })}
              onLeave={() => onHover(null)}
              canUp={index > 0}
              canDown={index < entries.length - 1}
              onMove={(delta) => onMove(index, delta)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ConfigEntry({
  json,
  active,
  scrollTo,
  onEnter,
  onLeave,
  canUp,
  canDown,
  onMove,
}: {
  json: string;
  active: boolean;
  scrollTo: boolean;
  onEnter: () => void;
  onLeave: () => void;
  canUp: boolean;
  canDown: boolean;
  onMove: (delta: -1 | 1) => void;
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
      className={`relative mb-1.5 rounded-lg transition-colors ${
        active ? "bg-slate-700/70 ring-1 ring-sky-400" : "hover:bg-slate-800"
      }`}
    >
      <div className="absolute top-1.5 right-1.5 flex flex-col">
        <ArrowButton
          label="Move block up"
          disabled={!canUp}
          onClick={() => onMove(-1)}
        >
          ▲
        </ArrowButton>
        <ArrowButton
          label="Move block down"
          disabled={!canDown}
          onClick={() => onMove(1)}
        >
          ▼
        </ArrowButton>
      </div>
      <pre className="cursor-default overflow-x-auto p-2 pr-7 whitespace-pre">
        {highlightJson(json)}
      </pre>
    </div>
  );
}

function ArrowButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="rounded px-1 py-0.5 text-[9px] text-slate-500 transition-colors not-disabled:hover:bg-slate-600 not-disabled:hover:text-white disabled:opacity-25"
    >
      {children}
    </button>
  );
}
