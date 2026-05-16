"use client";

import { useEffect, useRef, useState } from "react";

export type EditorPrefs = {
  wordWrap: boolean;
  fontSize: "S" | "M" | "L";
  tabSize: 2 | 4;
  lineNumbers: boolean;
};

export const DEFAULT_PREFS: EditorPrefs = {
  wordWrap: false,
  fontSize: "M",
  tabSize: 4,
  lineNumbers: true,
};

const STORAGE_KEY = "xs_editor_prefs_v1";

export function loadPrefs(): EditorPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const p = JSON.parse(raw);
    return {
      wordWrap: typeof p.wordWrap === "boolean" ? p.wordWrap : DEFAULT_PREFS.wordWrap,
      fontSize: p.fontSize === "S" || p.fontSize === "L" ? p.fontSize : "M",
      tabSize: p.tabSize === 2 ? 2 : 4,
      lineNumbers: typeof p.lineNumbers === "boolean" ? p.lineNumbers : DEFAULT_PREFS.lineNumbers,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(p: EditorPrefs) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

type Props = {
  prefs: EditorPrefs;
  onChange: (next: EditorPrefs) => void;
};

const ROW = "flex items-center justify-between gap-3 py-1.5";
const SEG = "rounded-[4px] border border-[color:var(--rule)] px-2 py-[3px] text-[11px]";
const SEG_ACTIVE = "bg-[color:var(--text)] text-[color:var(--bg)] border-[color:var(--text)]";

export function PlaygroundSettings({ prefs, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Click-outside / Escape to close.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const update = <K extends keyof EditorPrefs>(k: K, v: EditorPrefs[K]) =>
    onChange({ ...prefs, [k]: v });

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="editor settings"
        title="editor settings"
        className="rounded-[4px] border border-[color:var(--rule)] bg-[color:var(--panel)] hover:bg-[color:var(--rule-soft)] text-[color:var(--text-muted)] hover:text-[color:var(--text)] px-2 py-[3px] text-xs"
      >
        settings
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="editor settings"
          className="absolute right-0 top-full mt-1 z-20 w-[260px] rounded-[6px] border border-[color:var(--rule)] bg-[color:var(--panel)] shadow-lg p-3 font-mono text-[11.5px]"
        >
          <div className={ROW}>
            <span className="text-[color:var(--text-muted)]">word wrap</span>
            <button
              className={`${SEG} ${prefs.wordWrap ? SEG_ACTIVE : ""}`}
              onClick={() => update("wordWrap", !prefs.wordWrap)}
            >{prefs.wordWrap ? "on" : "off"}</button>
          </div>
          <div className={ROW}>
            <span className="text-[color:var(--text-muted)]">line numbers</span>
            <button
              className={`${SEG} ${prefs.lineNumbers ? SEG_ACTIVE : ""}`}
              onClick={() => update("lineNumbers", !prefs.lineNumbers)}
            >{prefs.lineNumbers ? "on" : "off"}</button>
          </div>
          <div className={ROW}>
            <span className="text-[color:var(--text-muted)]">font size</span>
            <div className="flex gap-1">
              {(["S", "M", "L"] as const).map(sz => (
                <button
                  key={sz}
                  className={`${SEG} ${prefs.fontSize === sz ? SEG_ACTIVE : ""}`}
                  onClick={() => update("fontSize", sz)}
                >{sz}</button>
              ))}
            </div>
          </div>
          <div className={ROW}>
            <span className="text-[color:var(--text-muted)]">tab size</span>
            <div className="flex gap-1">
              {([2, 4] as const).map(n => (
                <button
                  key={n}
                  className={`${SEG} ${prefs.tabSize === n ? SEG_ACTIVE : ""}`}
                  onClick={() => update("tabSize", n)}
                >{n}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
