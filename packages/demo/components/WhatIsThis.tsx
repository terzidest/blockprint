"use client";

import { useEffect, useState } from "react";

export function WhatIsThis({ onShowBroken }: { onShowBroken: () => void }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-slate-300 px-3 py-1 font-sans text-xs font-semibold text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
      >
        What is this?
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="What is blockprint?"
            onClick={(event) => event.stopPropagation()}
            className="max-h-full w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-7 font-sans text-left shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-mono text-lg font-bold">
                What you&apos;re looking at
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-full px-2 py-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-3 text-[14px] leading-relaxed text-slate-700">
              <p>
                Websites are often built from reusable blocks — a banner, a
                product grid, a signup form.{" "}
                <span className="font-mono font-semibold">blockprint</span> is a
                small library that lets a content team rearrange those blocks by
                editing a simple list, without a developer rebuilding the page.
              </p>
              <p>
                And when the list contains a mistake — a block that doesn&apos;t
                exist, a value of the wrong kind — the page shows a tidy notice
                in that spot instead of breaking.
              </p>
            </div>

            <div className="mt-5 flex flex-col items-center gap-1.5 rounded-xl bg-slate-50 px-4 py-4 sm:flex-row sm:justify-center sm:gap-3">
              <DiagramNode emoji="📄" label="content list" sub="(JSON)" />
              <Arrow />
              <DiagramNode emoji="🧩" label="blockprint" sub="+ your blocks" />
              <Arrow />
              <DiagramNode emoji="🖥️" label="finished page" sub="" />
            </div>
            <p className="mt-2 text-center text-xs text-slate-400">
              Like a printing press: the blocks are the carved stamps, the list
              is the arrangement, blockprint is the press.
            </p>

            <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-[13px] text-slate-600">
              <p>
                <span className="font-semibold text-slate-800">Technical?</span>{" "}
                The left panel is the actual data — hit <b>Edit</b> and try to
                break it.
              </p>
              <p>
                <span className="font-semibold text-slate-800">
                  Not technical?
                </span>{" "}
                <button
                  onClick={() => {
                    setOpen(false);
                    onShowBroken();
                  }}
                  className="font-semibold text-sky-600 underline underline-offset-2 hover:text-sky-800"
                >
                  See the safety net in action →
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DiagramNode({
  emoji,
  label,
  sub,
}: {
  emoji: string;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex min-w-28 flex-col items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-center shadow-sm">
      <span className="text-xl">{emoji}</span>
      <span className="text-xs font-semibold text-slate-800">{label}</span>
      {sub && <span className="text-[10px] text-slate-400">{sub}</span>}
    </div>
  );
}

function Arrow() {
  return (
    <span aria-hidden className="text-lg text-slate-400">
      <span className="hidden sm:inline">→</span>
      <span className="sm:hidden">↓</span>
    </span>
  );
}
