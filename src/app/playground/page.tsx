"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Wrap } from "@/components/wrap";
import { XSEditor, type XSEditorHandle } from "@/components/xs-codemirror";
import { PlaygroundFiles } from "@/components/playground-files";

// xs.js + xs.wasm are served same-origin so the playground's COOP / COEP
// headers cover them. RUNTIME_VERSION is the cache-buster; bump the -rN
// suffix when xs.js changes even if the xsypy binary version stayed put.
const RUNTIME_VERSION = "1.2.32-r4";

function staticBase(): string {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

type XS = {
  run: (code: string) => Promise<string>;
  writeFile: (path: string, content: string | Uint8Array) => void | Promise<void>;
  terminate?: () => void;
};

type OutChunk = { kind: "out" | "err" | "in"; text: string };

const DEFAULT_FILE = "main.xs";
const DEFAULT_FILE_CONTENT = `println("hello, world!")\n`;
const STORAGE_FILES = "xs_files_v1";
const STORAGE_ACTIVE = "xs_active_v1";

const RUN_BTN = "inline-flex items-center gap-2 border border-[color:var(--link)] bg-[color:var(--link)] text-[color:var(--bg)] px-3.5 py-1.5 rounded-[6px] font-mono text-xs font-medium hover:bg-[color:var(--link-hover)] hover:border-[color:var(--link-hover)] transition-colors";
const STOP_BTN = "inline-flex items-center gap-1.5 border border-[color:var(--kw)] bg-[color:var(--panel)] px-3.5 py-1.5 rounded-[6px] font-mono text-xs text-[color:var(--kw)] hover:bg-[color:var(--kw)] hover:text-[color:var(--bg)] transition-colors";

function uniqueName(base: string, taken: Record<string, unknown>): string {
  if (!(base in taken)) return base;
  const dot = base.lastIndexOf(".");
  const stem = dot > 0 ? base.slice(0, dot) : base;
  const ext = dot > 0 ? base.slice(dot) : "";
  for (let i = 2; i < 10000; i++) {
    const candidate = `${stem}-${i}${ext}`;
    if (!(candidate in taken)) return candidate;
  }
  return base;
}

export default function PlaygroundPage() {
  return <Playground />;
}

function Playground() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<Record<string, string>>({ [DEFAULT_FILE]: DEFAULT_FILE_CONTENT });
  const [activeFile, setActiveFile] = useState(DEFAULT_FILE);
  const [chunks, setChunks] = useState<OutChunk[]>([]);
  const [running, setRunning] = useState(false);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [stdinValue, setStdinValue] = useState("");

  const editorRef = useRef<XSEditorHandle>(null);
  const outputRef = useRef<HTMLPreElement>(null);
  const stdinInputRef = useRef<HTMLInputElement>(null);
  const xsRef = useRef<XS | null>(null);
  const stdoutCbRef = useRef<((line: string) => void) | null>(null);
  const stderrCbRef = useRef<((line: string) => void) | null>(null);
  const stdinResolverRef = useRef<((v: string) => void) | null>(null);
  const activeFileRef = useRef(activeFile);
  useEffect(() => { activeFileRef.current = activeFile; }, [activeFile]);

  const code = files[activeFile] ?? "";

  // setCode goes through a ref so a still-in-flight keystroke fired after
  // the user clicks a different file slot doesn't write to the old file.
  const setCode = useCallback((next: string) => {
    const name = activeFileRef.current;
    setFiles(prev => prev[name] === next ? prev : { ...prev, [name]: next });
  }, []);

  const appendChunk = useCallback((kind: OutChunk["kind"], text: string) => {
    setChunks(prev => {
      const last = prev[prev.length - 1];
      if (last && last.kind === kind) {
        return [...prev.slice(0, -1), { kind, text: last.text + text }];
      }
      return [...prev, { kind, text }];
    });
  }, []);

  // Hydrate files + active from localStorage. First paint is the SSR
  // skeleton until this lands, which prevents a hello-world flash.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_FILES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          const restored: Record<string, string> = {};
          for (const [k, v] of Object.entries(parsed)) {
            if (typeof v === "string") restored[k] = v;
          }
          if (Object.keys(restored).length > 0) {
            setFiles(restored);
            const a = localStorage.getItem(STORAGE_ACTIVE);
            const initial = a && restored[a] ? a : Object.keys(restored)[0];
            setActiveFile(initial);
            editorRef.current?.setValue(restored[initial]);
          }
        }
      }
    } catch { /* ignore */ }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(STORAGE_FILES, JSON.stringify(files)); } catch { /* ignore */ }
  }, [files, mounted]);
  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(STORAGE_ACTIVE, activeFile); } catch { /* ignore */ }
  }, [activeFile, mounted]);

  const bootRuntime = useCallback(async () => {
    return new Promise<XS | null>((resolve) => {
      const base = staticBase();
      const existing = (window as unknown as { loadXS?: unknown }).loadXS;
      const start = async () => {
        try {
          // @ts-expect-error loadXS is attached to window by the script
          const runtime: XS = await window.loadXS({
            wasmUrl: `${base}/xs.wasm?v=${RUNTIME_VERSION}`,
            worker: true,
            stdout: (line: string) => stdoutCbRef.current?.(line + "\n"),
            stderr: (line: string) => stderrCbRef.current?.(line + "\n"),
            stdoutPartial: (text: string) => stdoutCbRef.current?.(text),
            stderrPartial: (text: string) => stderrCbRef.current?.(text),
            stdin: () => new Promise<string>((res) => {
              stdinResolverRef.current = (value: string) => res(value);
              setWaitingForInput(true);
              setTimeout(() => stdinInputRef.current?.focus(), 0);
            }),
          });
          resolve(runtime);
        } catch {
          resolve(null);
        }
      };
      if (existing) { start(); return; }
      const s = document.createElement("script");
      s.src = `${base}/xs.js?v=${RUNTIME_VERSION}`;
      s.onload = start;
      s.onerror = () => resolve(null);
      document.head.appendChild(s);
    });
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    (async () => {
      const rt = await bootRuntime();
      if (cancelled) return;
      if (!rt) { appendChunk("err", "could not load XS runtime\n"); setLoading(false); return; }
      xsRef.current = rt;
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [mounted, bootRuntime, appendChunk]);

  // Keep the worker VFS in sync with local state so `use`/`import` between
  // files resolve at runtime.
  useEffect(() => {
    if (!mounted) return;
    const xs = xsRef.current;
    if (!xs) return;
    const t = setTimeout(() => {
      for (const [path, content] of Object.entries(files)) {
        try { void xs.writeFile(path, content); } catch { /* ignore */ }
      }
    }, 200);
    return () => clearTimeout(t);
  }, [files, mounted]);

  // Auto-scroll output on new chunks / stdin prompt.
  useEffect(() => {
    const el = outputRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chunks, waitingForInput]);

  const handleRun = useCallback(async () => {
    if (!xsRef.current || running) return;
    setRunning(true);
    setChunks([]);
    let produced = false;
    stdoutCbRef.current = (t) => { produced = true; appendChunk("out", t); };
    stderrCbRef.current = (t) => { produced = true; appendChunk("err", t); };
    try {
      for (const [path, content] of Object.entries(files)) {
        try { await xsRef.current.writeFile(path, content); } catch { /* ignore */ }
      }
      await xsRef.current.run(files[activeFile] ?? "");
      if (!produced) appendChunk("out", "(no output)\n");
    } catch {
      appendChunk("err", "(runtime crashed; reloading...)\n");
      try { xsRef.current.terminate?.(); } catch { /* ignore */ }
      xsRef.current = null;
      const fresh = await bootRuntime();
      if (fresh) xsRef.current = fresh;
    } finally {
      stdoutCbRef.current = null;
      stderrCbRef.current = null;
      stdinResolverRef.current = null;
      setWaitingForInput(false);
      setRunning(false);
    }
  }, [files, activeFile, running, appendChunk, bootRuntime]);

  const handleStop = useCallback(async () => {
    if (!running) return;
    appendChunk("err", "(cancelled)\n");
    try { xsRef.current?.terminate?.(); } catch { /* ignore */ }
    xsRef.current = null;
    stdoutCbRef.current = null;
    stderrCbRef.current = null;
    if (stdinResolverRef.current) {
      try { stdinResolverRef.current(""); } catch { /* ignore */ }
      stdinResolverRef.current = null;
    }
    setWaitingForInput(false);
    setRunning(false);
    const fresh = await bootRuntime();
    if (fresh) xsRef.current = fresh;
  }, [running, appendChunk, bootRuntime]);

  const submitStdin = useCallback(() => {
    const cb = stdinResolverRef.current;
    if (!cb) return;
    appendChunk("in", stdinValue + "\n");
    cb(stdinValue);
    stdinResolverRef.current = null;
    setWaitingForInput(false);
    setStdinValue("");
  }, [stdinValue, appendChunk]);

  const handleStdinKey = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); submitStdin(); }
    else if (e.key === "c" && e.ctrlKey) { e.preventDefault(); handleStop(); }
  }, [submitStdin, handleStop]);

  const switchFile = useCallback((name: string) => {
    if (!(name in files) || name === activeFileRef.current) return;
    const cur = editorRef.current?.getValue();
    const oldName = activeFileRef.current;
    setFiles(prev => {
      const next = { ...prev };
      if (cur !== undefined && prev[oldName] !== cur) next[oldName] = cur;
      return next;
    });
    setActiveFile(name);
    activeFileRef.current = name;
    editorRef.current?.setValue(files[name]);
  }, [files]);

  const handleNewBlank = useCallback(() => {
    const name = uniqueName("untitled.xs", files);
    setFiles(prev => ({ ...prev, [name]: "" }));
    setActiveFile(name);
    activeFileRef.current = name;
    editorRef.current?.setValue("");
    setTimeout(() => editorRef.current?.focus(), 0);
  }, [files]);

  const handleDelete = useCallback((name: string) => {
    if (Object.keys(files).length <= 1) return;
    if (!confirm(`delete ${name}?`)) return;
    setFiles(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    if (activeFile === name) {
      const rest = Object.keys(files).filter(n => n !== name);
      const fallback = rest[0];
      setActiveFile(fallback);
      activeFileRef.current = fallback;
      editorRef.current?.setValue(files[fallback]);
    }
  }, [files, activeFile]);

  if (!mounted) {
    return (
      <Wrap wide>
        <section className="pt-10 pb-12">
          <div className="rounded-[6px] border border-[color:var(--rule)] bg-[color:var(--panel)] min-h-[60vh]" />
        </section>
      </Wrap>
    );
  }

  return (
    <Wrap wide>
      <section className="pt-10 pb-12">
        <div className="mb-3 flex items-center gap-3 font-mono text-xs">
          {running ? (
            <button onClick={handleStop} className={STOP_BTN}>
              <span aria-hidden>■</span> stop
            </button>
          ) : (
            <button onClick={handleRun} disabled={loading} className={RUN_BTN + " disabled:opacity-40 disabled:cursor-not-allowed"}>
              <span aria-hidden>▶</span> {loading ? "loading" : "run"}
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row min-h-[70vh] rounded-[6px] border border-[color:var(--rule)] overflow-hidden bg-[color:var(--panel)]">
          {/* 1. files */}
          <div className="border-b md:border-b-0 md:border-r border-[color:var(--rule)] bg-[color:var(--panel)] shrink-0 md:w-[180px]">
            <PlaygroundFiles
              files={files}
              activeFile={activeFile}
              onSelect={switchFile}
              onNewBlank={handleNewBlank}
              onDelete={handleDelete}
            />
          </div>

          {/* 2. editor */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <XSEditor
              ref={editorRef}
              initialValue={code}
              onChange={setCode}
              onRun={handleRun}
            />
          </div>

          {/* 3. output */}
          <div
            className="flex flex-col overflow-hidden border-t md:border-t-0 md:border-l border-[color:var(--rule)] bg-[color:var(--bg)] shrink-0 md:w-[34%] max-md:h-[40vh]"
          >
            <pre
              ref={outputRef}
              onClick={() => waitingForInput && stdinInputRef.current?.focus()}
              className="flex-1 overflow-auto p-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-[color:var(--text-muted)]"
            >
              {chunks.length === 0
                ? <span className="text-[color:var(--text-faint)]">{"(no output yet)"}</span>
                : chunks.map((c, i) => (
                    <span
                      key={i}
                      style={{ color: c.kind === "err" ? "var(--kw)" : c.kind === "in" ? "var(--link)" : "var(--text)" }}
                    >{c.text}</span>
                  ))
              }
              {waitingForInput && (
                <>
                  <span style={{ color: "var(--link)" }} className="select-none">{"› "}</span>
                  <input
                    ref={stdinInputRef}
                    autoFocus
                    value={stdinValue}
                    onChange={(e) => setStdinValue(e.target.value)}
                    onKeyDown={handleStdinKey}
                    className="bg-transparent border-none outline-none font-mono text-[13px] text-[color:var(--text)]"
                    style={{
                      caretColor: "var(--link)",
                      width: `${Math.max(8, stdinValue.length + 2)}ch`,
                      minWidth: "8ch",
                    }}
                    spellCheck={false}
                    autoCapitalize="off"
                    autoComplete="off"
                  />
                </>
              )}
            </pre>
          </div>
        </div>
      </section>
    </Wrap>
  );
}
