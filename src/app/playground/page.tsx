"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Wrap } from "@/components/wrap";
import { XSEditor, type XSEditorHandle } from "@/components/xs-codemirror";

// Same-origin xs.js / xs.wasm so the /playground route's COOP/COEP isolation
// (set in next.config.ts) actually allows SharedArrayBuffer for stdin. A
// cross-origin fetch under COEP: require-corp would need a CORP header on
// the asset, which static.xslang.org doesn't currently send.
const STATIC_BASE = "";

const samples: Record<string, string> = {
  "Hello world": `println("hello, world!")

let name = "XS"
println("welcome to " + name)`,
  "FizzBuzz": `for i in 1..=20 {
    match 0 {
        _ if i % 15 == 0 => println("FizzBuzz")
        _ if i % 3 == 0  => println("Fizz")
        _ if i % 5 == 0  => println("Buzz")
        _                 => println(str(i))
    }
}`,
  "Pattern matching": `fn describe(value) {
    match value {
        0          => "zero"
        n if n > 0 => "positive: " + str(n)
        _          => "negative"
    }
}

println(describe(0))
println(describe(42))
println(describe(-7))`,
  "Fibonacci": `fn fib(n) {
    if n <= 1 { return n }
    return fib(n - 1) + fib(n - 2)
}

for i in 0..10 {
    println("fib(" + str(i) + ") = " + str(fib(i)))
}`,
  "Closures": `fn make_counter(start) {
    var n = start
    return fn() {
        n = n + 1
        return n
    }
}

let count = make_counter(0)
println(count())
println(count())
println(count())`,
  "Error handling": `fn safe_divide(a, b) {
    try {
        if b == 0 {
            throw "cannot divide by zero"
        }
        return a / b
    } catch e {
        println("error: " + e)
        return null
    }
}

println(safe_divide(10, 3))
println(safe_divide(10, 0))
println(safe_divide(42, 7))`,
  "Generators": `fn* range_step(start, stop, step) {
    var i = start
    while i < stop {
        yield i
        i = i + step
    }
}

for n in range_step(0, 20, 3) {
    println(n)
}`,
  "Enums": `enum Shape {
    Circle(r)
    Rect(w, h)
}

fn area(s) {
    match s {
        Shape::Circle(r) => 3.14159 * r * r
        Shape::Rect(w, h) => w * h
    }
}

println(area(Shape::Circle(5)))
println(area(Shape::Rect(3, 4)))`,
  "Durations": `let warmup = 2m30s
let frame  = 16ms

println(typeof(warmup))    -- duration
println(warmup)            -- 2m30s
println(warmup + frame)    -- 2m30.016s
println((1500ms).s)        -- 1.5
println(2s / 250ms)        -- 8`,
  "Interactive input": `let name = input("what's your name? ")
println("hi, " + name + "!")

let n = int(input("enter a number: "))
println("doubled: " + str(n * 2))`,
  "Decorators": `var ticks = 0

@on_start fn boot() {
    println("starting")
}

@every(50ms) fn tick() {
    ticks = ticks + 1
    if ticks >= 3 {
        println("ran {ticks} times")
        exit(0)
    }
}

@on_exit fn bye() {
    println("done")
}`,
};

type XS = {
  run: (code: string) => Promise<string>;
  writeFile: (path: string, content: string | Uint8Array) => void | Promise<void>;
  readFile: (path: string) => string | null | Promise<string | null>;
  listFiles: () => string[] | Promise<string[]>;
  deleteFile: (path: string) => boolean | Promise<boolean>;
  terminate?: () => void;
};

// URL fragment sharing: #s=<base64-of-utf8-source>. Kept minimal so a
// shared link still works even if someone strips the surrounding URL.
function encodeShare(code: string): string {
  const utf8 = new TextEncoder().encode(code);
  let bin = "";
  for (let i = 0; i < utf8.length; i++) bin += String.fromCharCode(utf8[i]);
  const b64 = btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return b64;
}

function decodeShare(s: string): string | null {
  try {
    let b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

const DEFAULT_FILE = "main.xs";

const BTN = "inline-flex items-center gap-1.5 border border-[color:var(--rule)] bg-[color:var(--panel)] px-3 py-1.5 rounded-[6px] font-mono text-xs text-[color:var(--text)] hover:border-[color:var(--link)] hover:text-[color:var(--link)] transition-colors";

const STOP_BTN = "inline-flex items-center gap-1.5 border border-[color:var(--kw)] bg-[color:var(--panel)] px-3 py-1.5 rounded-[6px] font-mono text-xs text-[color:var(--kw)] hover:bg-[color:var(--kw)] hover:text-[color:var(--bg)] transition-colors";

type OutChunk = { kind: "out" | "err" | "in"; text: string };

export default function PlaygroundPage() {
  const [files, setFiles] = useState<Record<string, string>>({
    [DEFAULT_FILE]: samples["Hello world"],
  });
  const [activeFile, setActiveFile] = useState(DEFAULT_FILE);
  const [selected, setSelected] = useState("Hello world");
  const [chunks, setChunks] = useState<OutChunk[]>([]);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [splitPercent, setSplitPercent] = useState(60);
  const [dragging, setDragging] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const [showOutput, setShowOutput] = useState(false);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [stdinValue, setStdinValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<XSEditorHandle>(null);
  const stdinInputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLPreElement>(null);
  // xsRef persists across example switches - never cleared on content change
  const xsRef = useRef<XS | null>(null);
  const stdoutCbRef = useRef<((line: string) => void) | null>(null);
  const stderrCbRef = useRef<((line: string) => void) | null>(null);
  const stdinResolverRef = useRef<((value: string) => void) | null>(null);

  const code = files[activeFile] ?? "";
  const setCode = useCallback((next: string) => {
    setFiles(prev => prev[activeFile] === next ? prev : { ...prev, [activeFile]: next });
  }, [activeFile]);

  const appendChunk = useCallback((kind: OutChunk["kind"], text: string) => {
    setChunks(prev => {
      // Coalesce contiguous runs of the same kind for cheaper re-renders.
      if (prev.length && prev[prev.length - 1].kind === kind) {
        const next = prev.slice();
        next[next.length - 1] = { kind, text: next[next.length - 1].text + text };
        return next;
      }
      return [...prev, { kind, text }];
    });
  }, []);

  // Decode #s=... share fragment on first paint
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash.startsWith("#s=")) {
      const decoded = decodeShare(hash.slice(3));
      if (decoded) {
        setFiles(prev => ({ ...prev, [DEFAULT_FILE]: decoded }));
        setActiveFile(DEFAULT_FILE);
        editorRef.current?.setValue(decoded);
      }
    }
  }, []);

  // Boot the runtime once. The xsRef is stable across all example / file switches.
  // bootRuntime is also re-callable to recreate the runtime after a cancel.
  const bootRuntime = useCallback(async () => {
    return new Promise<XS | null>((resolve) => {
      // If xs.js is already loaded on the page, reuse it.
      const existing = (window as unknown as { loadXS?: unknown }).loadXS;
      const start = async () => {
        try {
          // @ts-expect-error - loadXS is attached to window by the script
          const runtime: XS = await window.loadXS({
            wasmUrl: `${STATIC_BASE}/xs.wasm`,
            persist: "playground",
            worker: true,
            stdout: (line: string) => stdoutCbRef.current?.(line + "\n"),
            stderr: (line: string) => stderrCbRef.current?.(line + "\n"),
            // Pre-stdin partial flush — no trailing newline so the input field
            // can sit right after the prompt text.
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

      const script = document.createElement("script");
      script.src = `${STATIC_BASE}/xs.js`;
      script.onload = start;
      script.onerror = () => resolve(null);
      document.head.appendChild(script);
    });
  }, []);

  // Initial boot + hydrate persisted files. Worker mode means listFiles/readFile
  // return Promises - awaiting them is what makes persistence + the no-error
  // initial state work.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const runtime = await bootRuntime();
      if (cancelled) return;
      if (!runtime) {
        appendChunk("err", "error: could not load XS runtime");
        setLoading(false);
        return;
      }
      xsRef.current = runtime;
      try {
        const persisted = (await runtime.listFiles()).filter((p: string) => p.endsWith(".xs"));
        if (persisted.length > 0) {
          const loaded: Record<string, string> = {};
          for (const path of persisted) {
            const content = await runtime.readFile(path);
            if (typeof content === "string") loaded[path] = content;
          }
          if (Object.keys(loaded).length > 0) {
            setFiles(prev => {
              const merged = { ...prev, ...loaded };
              // If main.xs got hydrated, push it back into the editor.
              if (loaded[activeFile] !== undefined) {
                editorRef.current?.setValue(loaded[activeFile]);
              }
              return merged;
            });
          }
        }
      } catch {
        // Persistence is best-effort; don't surface errors here.
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist edits back to the VFS so they survive reloads
  useEffect(() => {
    const xs = xsRef.current;
    if (!xs) return;
    const t = setTimeout(() => {
      for (const [path, content] of Object.entries(files)) {
        try { void xs.writeFile(path, content); } catch { /* ignore */ }
      }
    }, 250);
    return () => clearTimeout(t);
  }, [files]);

  // Auto-scroll output to bottom on new chunks.
  useEffect(() => {
    const el = outputRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chunks, waitingForInput]);

  const handleRun = useCallback(async () => {
    if (!xsRef.current || running) return;
    setRunning(true);
    setChunks([]);
    setShowOutput(true);
    let produced = false;
    stdoutCbRef.current = (text: string) => {
      produced = true;
      appendChunk("out", text);
    };
    stderrCbRef.current = (text: string) => {
      produced = true;
      appendChunk("err", text);
    };
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
    // Spin up a new worker so the next run works.
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
    if (e.key === "Enter") {
      e.preventDefault();
      submitStdin();
    } else if (e.key === "c" && e.ctrlKey) {
      e.preventDefault();
      handleStop();
    }
  }, [submitStdin, handleStop]);

  const handleNewFile = useCallback(() => {
    const name = window.prompt("new file name (foo.xs):");
    if (!name) return;
    const path = name.endsWith(".xs") ? name : name + ".xs";
    if (files[path] !== undefined) {
      setActiveFile(path);
      editorRef.current?.setValue(files[path]);
      return;
    }
    setFiles(prev => ({ ...prev, [path]: "" }));
    setActiveFile(path);
    editorRef.current?.setValue("");
  }, [files]);

  const handleDeleteFile = useCallback(() => {
    if (Object.keys(files).length <= 1) {
      setShareNote("can't delete the last file");
      setTimeout(() => setShareNote(null), 1500);
      return;
    }
    if (!window.confirm(`delete ${activeFile}?`)) return;
    const next = { ...files };
    delete next[activeFile];
    if (xsRef.current) { try { void xsRef.current.deleteFile(activeFile); } catch { /* ignore */ } }
    const remaining = Object.keys(next);
    setFiles(next);
    setActiveFile(remaining[0]);
    editorRef.current?.setValue(next[remaining[0]]);
  }, [files, activeFile]);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}${window.location.pathname}#s=${encodeShare(code)}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareNote("share link copied to clipboard");
    } catch {
      window.history.replaceState(null, "", `#s=${encodeShare(code)}`);
      setShareNote("URL updated; copy to share");
    }
    setTimeout(() => setShareNote(null), 2500);
  }, [code]);

  // drag to resize
  const handleMouseDown = () => setDragging(true);

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const isVertical = rect.width < 768;
      const pct = isVertical
        ? ((e.clientY - rect.top) / rect.height) * 100
        : ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.max(20, Math.min(80, pct)));
    };

    const handleMouseUp = () => setDragging(false);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  // touch drag for mobile
  const handleTouchStart = () => setDragging(true);

  useEffect(() => {
    if (!dragging) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current || !e.touches[0]) return;
      const rect = containerRef.current.getBoundingClientRect();
      const isVertical = rect.width < 768;
      const pct = isVertical
        ? ((e.touches[0].clientY - rect.top) / rect.height) * 100
        : ((e.touches[0].clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.max(20, Math.min(80, pct)));
    };

    const handleTouchEnd = () => setDragging(false);
    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);
    return () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [dragging]);

  const fileList = useMemo(() => Object.keys(files).sort(), [files]);

  // When the active file changes from a select, sync the editor.
  useEffect(() => {
    if (editorRef.current && editorRef.current.getValue() !== code) {
      editorRef.current.setValue(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFile]);

  return (
    <Wrap wide>
      <section className="pt-10 pb-12">
        {/* toolbar */}
        <div className="flex items-center gap-3 flex-wrap mb-4 font-mono text-xs">
          {running ? (
            <button onClick={handleStop} className={STOP_BTN}>stop</button>
          ) : (
            <button
              onClick={handleRun}
              disabled={loading}
              className={BTN + " disabled:opacity-40"}
            >
              {loading ? "loading..." : "run"}
            </button>
          )}
          {running && (
            <span className="text-[color:var(--text-muted)]">
              running<span style={{ animation: "running-blink 1.2s step-start infinite" }}>...</span>
            </span>
          )}
          <button onClick={handleShare} className={BTN}>share</button>
          <button
            onClick={() => {
              setFiles(prev => ({ ...prev, [activeFile]: samples[selected] }));
              editorRef.current?.setValue(samples[selected]);
              setChunks([]);
              setShowOutput(false);
            }}
            className={BTN}
          >reset</button>
          <select
            value={selected}
            onChange={(e) => {
              const name = e.target.value;
              setSelected(name);
              setFiles(prev => ({ ...prev, [activeFile]: samples[name] }));
              editorRef.current?.setValue(samples[name]);
              setChunks([]);
              setShowOutput(false);
            }}
            className="border border-[color:var(--rule)] bg-[color:var(--panel)] px-3 py-1.5 rounded-[6px] font-mono text-xs text-[color:var(--text)] outline-none hover:border-[color:var(--link)] transition-colors"
          >
            {Object.keys(samples).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <select
            value={activeFile}
            onChange={(e) => setActiveFile(e.target.value)}
            className="border border-[color:var(--rule)] bg-[color:var(--panel)] px-3 py-1.5 rounded-[6px] font-mono text-xs text-[color:var(--text)] outline-none hover:border-[color:var(--link)] transition-colors"
          >
            {fileList.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <button onClick={handleNewFile} title="new file" className={BTN}>+</button>
          <button onClick={handleDeleteFile} title="delete current file" className={BTN}>-</button>
          {shareNote && (
            <span className="text-[color:var(--text-muted)]">{shareNote}</span>
          )}
        </div>

        {/* editor + output with resizable split */}
        <div
          ref={containerRef}
          className="flex flex-col md:flex-row min-h-[60vh]"
          style={{ userSelect: dragging ? "none" : "auto" }}
        >
          {/* editor panel */}
          <div
            className="flex flex-col overflow-hidden rounded-t-[6px] md:rounded-l-[6px] md:rounded-tr-none border border-[color:var(--rule)] bg-[color:var(--panel)]"
            style={{
              flexBasis: `${splitPercent}%`,
              flexShrink: 0,
              minHeight: 100,
              minWidth: 100,
            }}
          >
            <div className="border-b border-[color:var(--rule)] px-4 py-1.5 font-mono text-xs text-[color:var(--text-faint)]">
              {activeFile}
            </div>
            <div className="flex-1 overflow-hidden">
              <XSEditor
                ref={editorRef}
                initialValue={code}
                onChange={setCode}
                onRun={handleRun}
              />
            </div>
          </div>

          {/* resize handle */}
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className="shrink-0 flex items-center justify-center
              md:w-2 md:cursor-col-resize md:hover:bg-[color:var(--rule-soft)]
              h-2 md:h-auto cursor-row-resize hover:bg-[color:var(--rule-soft)]
              bg-[color:var(--rule)] transition-colors z-10"
          >
            <div className="hidden md:block w-0.5 h-8 rounded-full bg-[color:var(--text-faint)]" />
            <div className="md:hidden h-0.5 w-8 rounded-full bg-[color:var(--text-faint)]" />
          </div>

          {/* output panel */}
          <div
            className="flex flex-col overflow-hidden rounded-b-[6px] md:rounded-r-[6px] md:rounded-bl-none border border-[color:var(--rule)] border-t-0 md:border-t md:border-l-0 bg-[color:var(--panel)]"
            style={{
              flexBasis: `${100 - splitPercent}%`,
              flexShrink: 0,
              minHeight: 80,
              minWidth: 80,
            }}
          >
            <div className="border-b border-[color:var(--rule)] px-4 py-1.5 font-mono text-xs text-[color:var(--text-faint)]">
              output
            </div>
            <pre
              ref={outputRef}
              onClick={() => waitingForInput && stdinInputRef.current?.focus()}
              className="flex-1 overflow-auto p-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-[color:var(--text-muted)]"
              style={showOutput ? { animation: "output-slide-in 220ms cubic-bezier(0.22,1,0.36,1) both" } : {}}
            >
              {chunks.length === 0
                ? <span className="text-[color:var(--text-faint)]">{"-- press Ctrl+Enter or click run"}</span>
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
                      color: "var(--text)",
                      width: `${Math.max(8, stdinValue.length + 2)}ch`,
                      minWidth: "8ch",
                      verticalAlign: "baseline",
                    }}
                    spellCheck={false}
                    autoCapitalize="off"
                    autoComplete="off"
                  />
                  <span style={{ color: "var(--text-faint)" }} className="ml-2 text-[11px] select-none">↵ submit</span>
                </>
              )}
            </pre>
          </div>
        </div>

        <p className="mt-4 text-xs text-[color:var(--text-faint)] hidden sm:block">
          Real XS interpreter via WebAssembly. Files persist locally; input() reads from the prompt below the output. Not available: networking, native plugins, JIT, REPL.
        </p>
        <p className="mt-1 text-xs text-[color:var(--text-faint)] hidden sm:block">
          The playground loads <code className="font-mono">xs.js</code> and <code className="font-mono">xs.wasm</code> from{" "}
          <a href="https://static.xslang.org" target="_blank" rel="noopener noreferrer" className="text-[color:var(--link)]">static.xslang.org</a>.
          This is a Vercel-hosted CDN of the WASM build, cut from the same source as the native binaries.
          If you embed the playground on your own page, you can fetch from the same URL.
        </p>
      </section>
    </Wrap>
  );
}
