"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { XSEditor, type XSEditorHandle } from "@/components/xs-codemirror";
import { useXSRuntime, type RuntimeChunk } from "@/components/use-xs-runtime";
import { decodeWorkspace } from "@/lib/share";

const RUNTIME_VERSION = "1.2.17";

const FALLBACK = `println("paste a ?code=... to embed your own program")`;

const RUN_BTN = "inline-flex items-center gap-1.5 border border-[color:var(--link)] bg-[color:var(--link)] text-[color:var(--bg)] px-3 py-1 rounded-[5px] font-mono text-[11.5px] font-medium hover:bg-[color:var(--link-hover)] hover:border-[color:var(--link-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors";
const STOP_BTN = "inline-flex items-center gap-1.5 border border-[color:var(--kw)] bg-transparent text-[color:var(--kw)] px-3 py-1 rounded-[5px] font-mono text-[11.5px] hover:bg-[color:var(--kw)] hover:text-[color:var(--bg)] transition-colors";
const TAB = "px-2 py-1 rounded-[4px] font-mono text-[11px] cursor-pointer";

export default function EmbedPage() {
  const [files, setFiles] = useState<Record<string, string>>({ "main.xs": FALLBACK });
  const [active, setActive] = useState<string>("main.xs");
  const [ready, setReady] = useState(false);
  const [chunks, setChunks] = useState<RuntimeChunk[]>([]);
  const [waitingStdin, setWaitingStdin] = useState(false);
  const [stdinValue, setStdinValue] = useState("");
  const editorRef = useRef<XSEditorHandle>(null);
  const outputRef = useRef<HTMLPreElement>(null);
  const stdinInputRef = useRef<HTMLInputElement>(null);
  const activeRef = useRef(active);
  useEffect(() => { activeRef.current = active; }, [active]);

  // Lock in the theme from ?theme= before anything paints colour. The
  // root layout already runs ThemeScript for the saved theme, but embed
  // overrides on a per-frame basis -- the surrounding page picks.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const theme = sp.get("theme");
    if (theme === "light" || theme === "dark") {
      document.documentElement.dataset.theme = theme;
    }
  }, []);

  // Decode ?code= once on mount. Async because the encoder is gzip-based.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (typeof window === "undefined") return;
      const sp = new URLSearchParams(window.location.search);
      const code = sp.get("code");
      const fileParam = sp.get("file");
      if (!code) { setReady(true); return; }
      const ws = await decodeWorkspace(code);
      if (cancelled) return;
      if (ws) {
        setFiles(ws.files);
        const fallback = fileParam && fileParam in ws.files ? fileParam : ws.active;
        setActive(fallback);
        activeRef.current = fallback;
        // Defer until the next paint so the editor instance exists.
        setTimeout(() => editorRef.current?.setValue(ws.files[fallback] ?? ""), 0);
      } else {
        setChunks([{ kind: "err", text: "(invalid ?code= payload)\n" }]);
      }
      setReady(true);
    })();
    return () => { cancelled = true; };
  }, []);

  const appendChunk = useCallback((kind: "out" | "err", text: string) => {
    setChunks(prev => {
      if (prev.length && prev[prev.length - 1].kind === kind) {
        const next = prev.slice();
        next[next.length - 1] = { kind, text: next[next.length - 1].text + text };
        return next;
      }
      return [...prev, { kind, text }];
    });
  }, []);

  const onStdinRequest = useCallback(() => {
    setWaitingStdin(true);
    setTimeout(() => stdinInputRef.current?.focus(), 0);
  }, []);

  const { loading, running, run, stop, resolveStdin } = useXSRuntime({
    version: RUNTIME_VERSION,
    onChunk: appendChunk,
    onStdinRequest,
  });

  const onChange = useCallback((next: string) => {
    const name = activeRef.current;
    setFiles(prev => prev[name] === next ? prev : { ...prev, [name]: next });
  }, []);

  const handleRun = useCallback(async () => {
    setChunks([]);
    await run(active, files);
  }, [run, active, files]);

  const submitStdin = useCallback(() => {
    if (!resolveStdin(stdinValue)) return;
    setChunks(prev => [...prev, { kind: "in", text: stdinValue + "\n" }]);
    setWaitingStdin(false);
    setStdinValue("");
  }, [stdinValue, resolveStdin]);

  const handleStdinKey = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); submitStdin(); }
    else if (e.key === "c" && e.ctrlKey) { e.preventDefault(); stop(); }
  }, [submitStdin, stop]);

  const switchFile = useCallback((name: string) => {
    if (!(name in files) || name === activeRef.current) return;
    const cur = editorRef.current?.getValue();
    const oldName = activeRef.current;
    setFiles(prev => {
      const next = { ...prev };
      if (cur !== undefined && prev[oldName] !== cur) next[oldName] = cur;
      return next;
    });
    setActive(name);
    activeRef.current = name;
    editorRef.current?.setValue(files[name]);
  }, [files]);

  useEffect(() => {
    const el = outputRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chunks, waitingStdin]);

  const code = files[active] ?? "";

  const fileNames = useMemo(() => Object.keys(files), [files]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[color:var(--bg)] text-[color:var(--text)]">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[color:var(--rule)] bg-[color:var(--panel)] shrink-0">
        {running ? (
          <button onClick={stop} className={STOP_BTN}>
            <span aria-hidden>■</span> stop
          </button>
        ) : (
          <button
            onClick={handleRun}
            disabled={loading || !ready}
            className={RUN_BTN}
            title="run (Ctrl+Enter)"
          >
            <span aria-hidden>▶</span>
            {loading ? "loading" : "run"}
          </button>
        )}
        {fileNames.length > 1 && (
          <div className="flex items-center gap-1 ml-2 flex-1 overflow-x-auto">
            {fileNames.map(name => (
              <button
                key={name}
                onClick={() => switchFile(name)}
                className={TAB + (name === active
                  ? " bg-[color:var(--rule-soft)] text-[color:var(--text)]"
                  : " text-[color:var(--text-muted)] hover:text-[color:var(--text)]")}
              >{name}</button>
            ))}
          </div>
        )}
        {fileNames.length <= 1 && (
          <span className="ml-2 font-mono text-[11px] text-[color:var(--text-faint)]">{active}</span>
        )}
        <PlaygroundLink />
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-w-0 border-r border-[color:var(--rule)]">
          <XSEditor
            ref={editorRef}
            initialValue={code}
            onChange={onChange}
            onRun={handleRun}
          />
        </div>
        <div className="w-[40%] min-w-[200px] flex flex-col bg-[color:var(--panel)]">
          <div className="px-3 py-1.5 border-b border-[color:var(--rule)] font-mono text-[10.5px] uppercase tracking-[0.08em] text-[color:var(--text-faint)] flex items-center justify-between">
            <span>output</span>
            {chunks.length > 0 && !running && (
              <button
                onClick={() => setChunks([])}
                className="text-[color:var(--text-faint)] hover:text-[color:var(--text)] normal-case tracking-normal"
              >clear</button>
            )}
          </div>
          <pre
            ref={outputRef}
            onClick={() => waitingStdin && stdinInputRef.current?.focus()}
            className="flex-1 overflow-auto p-3 font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-[color:var(--text-muted)]"
          >
            {chunks.length === 0
              ? <span className="text-[color:var(--text-faint)]">{"-- press run"}</span>
              : chunks.map((c, i) => (
                  <span
                    key={i}
                    style={{
                      color: c.kind === "err"
                        ? "var(--kw)"
                        : c.kind === "in"
                          ? "var(--link)"
                          : "var(--text)",
                    }}
                  >{c.text}</span>
                ))
            }
            {waitingStdin && (
              <>
                <span style={{ color: "var(--link)" }} className="select-none">{"› "}</span>
                <input
                  ref={stdinInputRef}
                  autoFocus
                  value={stdinValue}
                  onChange={(e) => setStdinValue(e.target.value)}
                  onKeyDown={handleStdinKey}
                  className="bg-transparent border-none outline-none font-mono text-[12px] text-[color:var(--text)]"
                  style={{
                    caretColor: "var(--link)",
                    width: `${Math.max(8, stdinValue.length + 2)}ch`,
                    minWidth: "8ch",
                    verticalAlign: "baseline",
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
    </div>
  );
}

// Deferred so the href only resolves on the client. Building it inline
// during render produces an SSR href that differs from the post-hydration
// one (the URL params aren't visible during SSR), triggering a React
// hydration mismatch. Reading window.location via useSyncExternalStore
// gives us a single-source-of-truth on the client without the cascading
// effect pattern.
function PlaygroundLink() {
  const href = useSyncExternalStore(
    () => () => {},
    () => {
      const code = new URLSearchParams(window.location.search).get("code");
      return `${window.location.origin}/playground${code ? `#s=${code}` : ""}`;
    },
    () => "/playground",
  );
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="ml-auto font-mono text-[10.5px] text-[color:var(--text-faint)] hover:text-[color:var(--link)]"
    >open in playground ↗</a>
  );
}
