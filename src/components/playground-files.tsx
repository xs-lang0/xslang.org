"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export type FileEntry = { name: string; content: string };

type Props = {
  files: Record<string, string>;
  activeFile: string;
  examples: Record<string, string>;
  onSelect: (name: string) => void;
  onNewBlank: () => void;
  onLoadExample: (sampleName: string) => void;
  onRename: (oldName: string, newName: string) => void;
  onDelete: (name: string) => void;
  onDuplicate: (name: string) => void;
};

const ROW_BTN = "w-full text-left px-2 py-[3px] rounded-[4px] flex items-center gap-2 group transition-colors";

function FileRow({
  name,
  active,
  onSelect,
  onRename,
  onDelete,
  onDuplicate,
}: {
  name: string;
  active: boolean;
  onSelect: () => void;
  onRename: (next: string) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const submit = () => {
    const next = draft.trim();
    if (next && next !== name) onRename(next);
    setEditing(false);
    setDraft(name);
  };

  if (editing) {
    return (
      <div className={ROW_BTN + " bg-[color:var(--rule-soft)]"}>
        <span className="text-[color:var(--text-faint)] text-[10px] w-3">●</span>
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={submit}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") { setEditing(false); setDraft(name); }
          }}
          className="flex-1 bg-transparent border border-[color:var(--rule)] outline-none px-1 py-0 text-[12px] font-mono text-[color:var(--text)]"
        />
      </div>
    );
  }

  return (
    <div className={ROW_BTN + (active
      ? " bg-[color:var(--rule-soft)] text-[color:var(--text)]"
      : " text-[color:var(--text-muted)] hover:bg-[color:var(--rule-soft)] hover:text-[color:var(--text)]")}>
      <button
        onClick={onSelect}
        onDoubleClick={() => setEditing(true)}
        className="flex-1 text-left flex items-center gap-2 min-w-0 cursor-pointer"
      >
        <span
          aria-hidden
          className={"text-[10px] w-3 shrink-0 " + (active ? "text-[color:var(--link)]" : "text-[color:var(--text-faint)]")}
        >●</span>
        <span className="truncate text-[12.5px] font-mono">{name}</span>
      </button>
      <div className="relative" ref={menuRef}>
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
          className="opacity-0 group-hover:opacity-100 px-1.5 py-0 rounded text-[color:var(--text-muted)] hover:bg-[color:var(--bg)] hover:text-[color:var(--text)] transition-opacity"
          aria-label="file actions"
          tabIndex={-1}
        >⋯</button>
        {menuOpen && (
          <div className="absolute right-0 top-5 z-20 min-w-[120px] border border-[color:var(--rule)] bg-[color:var(--panel)] rounded-[6px] py-1 shadow-md">
            <button
              onClick={() => { setMenuOpen(false); setEditing(true); }}
              className="w-full text-left px-3 py-1 text-[12px] font-mono text-[color:var(--text)] hover:bg-[color:var(--rule-soft)]"
            >rename</button>
            <button
              onClick={() => { setMenuOpen(false); onDuplicate(); }}
              className="w-full text-left px-3 py-1 text-[12px] font-mono text-[color:var(--text)] hover:bg-[color:var(--rule-soft)]"
            >duplicate</button>
            <button
              onClick={() => { setMenuOpen(false); onDelete(); }}
              className="w-full text-left px-3 py-1 text-[12px] font-mono text-[color:var(--kw)] hover:bg-[color:var(--rule-soft)]"
            >delete</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function PlaygroundFiles({
  files,
  activeFile,
  examples,
  onSelect,
  onNewBlank,
  onLoadExample,
  onRename,
  onDelete,
  onDuplicate,
}: Props) {
  const [examplesOpen, setExamplesOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("xs_examples_open") === "1";
  });

  const toggleExamples = useCallback(() => {
    setExamplesOpen(o => {
      const next = !o;
      try { localStorage.setItem("xs_examples_open", next ? "1" : "0"); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const fileNames = Object.keys(files).sort();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-3 py-1.5 border-b border-[color:var(--rule)] flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.08em] text-[color:var(--text-faint)] font-mono">files</span>
        <button
          onClick={onNewBlank}
          title="new file"
          className="text-[color:var(--text-muted)] hover:text-[color:var(--link)] px-1 text-[14px] leading-none"
        >+</button>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        <div className="px-1 space-y-px">
          {fileNames.map(name => (
            <FileRow
              key={name}
              name={name}
              active={name === activeFile}
              onSelect={() => onSelect(name)}
              onRename={(next) => onRename(name, next)}
              onDelete={() => onDelete(name)}
              onDuplicate={() => onDuplicate(name)}
            />
          ))}
        </div>

        <div className="mt-3 border-t border-[color:var(--rule)] pt-1">
          <button
            onClick={toggleExamples}
            className="w-full px-3 py-1.5 flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-[color:var(--text-faint)] font-mono hover:text-[color:var(--text-muted)]"
          >
            <span className="text-[9px]">{examplesOpen ? "▾" : "▸"}</span>
            examples
            <span className="ml-auto text-[10px] text-[color:var(--text-faint)] normal-case">{Object.keys(examples).length}</span>
          </button>
          {examplesOpen && (
            <div className="px-1 pb-1 space-y-px">
              {Object.keys(examples).map(name => (
                <button
                  key={name}
                  onClick={() => onLoadExample(name)}
                  className="w-full text-left px-2 py-[3px] rounded-[4px] flex items-center gap-2 text-[12.5px] font-mono text-[color:var(--text-muted)] hover:bg-[color:var(--rule-soft)] hover:text-[color:var(--text)]"
                  title={`open as new file`}
                >
                  <span aria-hidden className="text-[10px] w-3 text-[color:var(--text-faint)]">↗</span>
                  <span className="truncate">{name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
