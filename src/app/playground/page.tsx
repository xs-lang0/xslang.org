"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { highlightXS } from "@/components/xs-highlighter";

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
  exec: (args: string[]) => Promise<number>;
  writeFile: (path: string, content: string) => void;
  readFile: (path: string) => string | null;
  listFiles: () => string[];
  deleteFile: (path: string) => boolean;
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

function LineNumbers({ code }: { code: string }) {
  const count = code.split("\n").length;
  return (
    <div className="select-none text-right pr-4 pt-4 pb-4 text-xs leading-relaxed text-muted/40 font-mono shrink-0 w-12 border-r border-border">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>{i + 1}</div>
      ))}
    </div>
  );
}

const DEFAULT_FILE = "main.xs";

export default function PlaygroundPage() {
  const [files, setFiles] = useState<Record<string, string>>({
    [DEFAULT_FILE]: samples["Hello world"],
  });
  const [activeFile, setActiveFile] = useState(DEFAULT_FILE);
  const [selected, setSelected] = useState("Hello world");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [splitPercent, setSplitPercent] = useState(60);
  const [dragging, setDragging] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const xsRef = useRef<XS | null>(null);

  const code = files[activeFile] ?? "";
  const setCode = useCallback((next: string) => {
    setFiles(prev => ({ ...prev, [activeFile]: next }));
  }, [activeFile]);

  const highlighted = useMemo(() => highlightXS(code), [code]);

  // Decode #s=... share fragment on first paint
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash.startsWith("#s=")) {
      const decoded = decodeShare(hash.slice(3));
      if (decoded) {
        setFiles(prev => ({ ...prev, [DEFAULT_FILE]: decoded }));
        setActiveFile(DEFAULT_FILE);
      }
    }
  }, []);

  // Boot the runtime in worker mode with persisted IDB-backed VFS
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/xs.js";
    script.onload = async () => {
      try {
        // @ts-expect-error - loadXS from loaded script
        const runtime = await window.loadXS({
          persist: "playground",
          worker: true,
          stdin: async () => {
            // Async prompt-based stdin so XS programs can read input()
            const value = window.prompt("input?") ?? "";
            return value + "\n";
          },
        });
        xsRef.current = runtime;
        // Hydrate file list from persisted VFS
        const persisted = runtime.listFiles().filter((p: string) => p.endsWith(".xs"));
        if (persisted.length > 0) {
          const loaded: Record<string, string> = {};
          for (const path of persisted) {
            const content = runtime.readFile(path);
            if (content !== null) loaded[path] = content;
          }
          if (loaded[activeFile] === undefined) {
            loaded[activeFile] = files[activeFile];
          }
          setFiles(prev => ({ ...prev, ...loaded }));
        }
        setLoading(false);
      } catch {
        setOutput("error: could not load XS runtime");
        setLoading(false);
      }
    };
    document.head.appendChild(script);
    return () => { script.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist edits back to the VFS so they survive reloads
  useEffect(() => {
    const xs = xsRef.current;
    if (!xs) return;
    const t = setTimeout(() => {
      for (const [path, content] of Object.entries(files)) {
        xs.writeFile(path, content);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [files]);

  const handleRun = useCallback(async () => {
    if (!xsRef.current || running) return;
    setRunning(true);
    setOutput("");
    try {
      // Make sure the active file's latest content is on disk before exec
      for (const [path, content] of Object.entries(files)) {
        xsRef.current.writeFile(path, content);
      }
      const result = await xsRef.current.run(files[activeFile] ?? "");
      setOutput(result || "(no output)");
    } catch {
      setOutput("error: runtime crashed, try again");
    } finally {
      setRunning(false);
    }
  }, [files, activeFile, running]);

  const handleNewFile = useCallback(() => {
    const name = window.prompt("new file name (foo.xs):");
    if (!name) return;
    const path = name.endsWith(".xs") ? name : name + ".xs";
    if (files[path] !== undefined) {
      setActiveFile(path);
      return;
    }
    setFiles(prev => ({ ...prev, [path]: "" }));
    setActiveFile(path);
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
    if (xsRef.current) xsRef.current.deleteFile(activeFile);
    const remaining = Object.keys(next);
    setFiles(next);
    setActiveFile(remaining[0]);
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

  // sync scroll between line numbers and textarea
  const handleEditorScroll = () => {
    if (textareaRef.current) {
      const st = textareaRef.current.scrollTop;
      const sl = textareaRef.current.scrollLeft;
      if (lineNumRef.current) lineNumRef.current.scrollTop = st;
      if (highlightRef.current) {
        highlightRef.current.scrollTop = st;
        highlightRef.current.scrollLeft = sl;
      }
    }
  };

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

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 sm:px-6 py-6 sm:py-8 h-[calc(100vh-7rem)]">
      {/* toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight">Playground</h1>
        <div className="flex items-center gap-2 sm:gap-3">
          <select
            value={activeFile}
            onChange={(e) => setActiveFile(e.target.value)}
            className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs sm:text-sm text-foreground outline-none"
          >
            {fileList.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <button
            onClick={handleNewFile}
            title="new file"
            className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs sm:text-sm text-foreground hover:bg-accent-dim/10"
          >+</button>
          <button
            onClick={handleDeleteFile}
            title="delete current file"
            className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs sm:text-sm text-foreground hover:bg-accent-dim/10"
          >-</button>
          <select
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value);
              setFiles(prev => ({ ...prev, [activeFile]: samples[e.target.value] }));
              setOutput("");
            }}
            className="rounded-md border border-border bg-surface px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-foreground outline-none"
          >
            {Object.keys(samples).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <button
            onClick={handleShare}
            title="copy share link"
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs sm:text-sm text-foreground hover:bg-accent-dim/10"
          >share</button>
          <button
            onClick={handleRun}
            disabled={running || loading}
            className="rounded-md bg-accent-dim px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-accent disabled:opacity-50"
          >
            {loading ? "Loading..." : running ? "Running..." : "Run"}
          </button>
        </div>
      </div>

      {shareNote && (
        <div className="text-xs text-accent">{shareNote}</div>
      )}

      {/* editor + output with resizable split */}
      <div
        ref={containerRef}
        className="flex flex-1 min-h-0 flex-col md:flex-row"
        style={{ userSelect: dragging ? "none" : "auto" }}
      >
        {/* editor panel */}
        <div
          className="flex flex-col overflow-hidden rounded-t-lg md:rounded-l-lg md:rounded-tr-none border border-border"
          style={{
            flexBasis: `${splitPercent}%`,
            flexShrink: 0,
            minHeight: 100,
            minWidth: 100,
          }}
        >
          <div className="border-b border-border px-4 py-1.5 text-xs text-muted">
            {activeFile}
          </div>
          <div className="flex flex-1 overflow-hidden">
            <div
              ref={lineNumRef}
              className="overflow-hidden shrink-0"
              style={{ overflowY: "hidden" }}
            >
              <LineNumbers code={code} />
            </div>
            <div className="flex-1 relative overflow-hidden">
              <pre
                ref={highlightRef}
                className="absolute inset-0 pt-4 pb-4 pl-4 pr-4 font-mono text-sm leading-relaxed pointer-events-none overflow-hidden whitespace-pre-wrap break-words"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: highlighted + "\n" }}
              />
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onScroll={handleEditorScroll}
                spellCheck={false}
                className="absolute inset-0 w-full h-full resize-none bg-transparent pt-4 pb-4 pl-4 pr-4 font-mono text-sm leading-relaxed text-transparent caret-foreground outline-none"
                style={{ caretColor: "var(--color-foreground)" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleRun();
                  }
                  if (e.key === "Tab") {
                    e.preventDefault();
                    const t = e.currentTarget;
                    const start = t.selectionStart;
                    const end = t.selectionEnd;
                    setCode(code.substring(0, start) + "  " + code.substring(end));
                    setTimeout(() => {
                      t.selectionStart = t.selectionEnd = start + 2;
                    }, 0);
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* resize handle */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="shrink-0 flex items-center justify-center
            md:w-2 md:cursor-col-resize md:hover:bg-accent-dim/30
            h-2 md:h-auto cursor-row-resize hover:bg-accent-dim/30
            bg-border transition-colors z-10"
        >
          <div className="hidden md:block w-0.5 h-8 rounded-full bg-muted/30" />
          <div className="md:hidden h-0.5 w-8 rounded-full bg-muted/30" />
        </div>

        {/* output panel */}
        <div
          className="flex flex-col overflow-hidden rounded-b-lg md:rounded-r-lg md:rounded-bl-none border border-border border-t-0 md:border-t md:border-l-0"
          style={{
            flexBasis: `${100 - splitPercent}%`,
            flexShrink: 0,
            minHeight: 80,
            minWidth: 80,
          }}
        >
          <div className="border-b border-border px-4 py-1.5 text-xs text-muted">
            output
          </div>
          <pre className="flex-1 overflow-auto bg-surface p-4 font-mono text-sm leading-relaxed text-muted whitespace-pre-wrap">
            {output || "-- press Ctrl+Enter or click Run"}
          </pre>
        </div>
      </div>

      <div className="text-xs text-muted space-y-1 hidden sm:block">
        <p>
          Real XS interpreter via WebAssembly. Files persist locally;
          input() prompts for stdin. <span className="text-foreground">Not available:</span>{" "}
          networking, native plugins, JIT, REPL.
        </p>
      </div>
    </div>
  );
}
