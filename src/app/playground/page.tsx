"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Wrap } from "@/components/wrap";
import { XSEditor, type XSEditorHandle } from "@/components/xs-codemirror";
import { PlaygroundFiles } from "@/components/playground-files";
import { DialogsProvider, useDialogs } from "@/components/confirm-modal";
import { PlaygroundSettings, loadPrefs, savePrefs, DEFAULT_PREFS, type EditorPrefs } from "@/components/playground-settings";
import { ShareModal } from "@/components/share-modal";
import { decodeWorkspace } from "@/lib/share";
import { fetchGist, parseGistRef } from "@/lib/gist";

// Same-origin xs.js / xs.wasm so the /playground route's COOP/COEP isolation
// (set in next.config.ts) actually allows SharedArrayBuffer for stdin. A
// cross-origin fetch under COEP: require-corp would need a CORP header on
// the asset, which static.xslang.org doesn't currently send.
//
// Resolved at boot, not at module load, because window isn't available during
// SSR. The blob worker spawned by xs.js can't resolve a leading-slash relative
// URL — its base URL is the blob: scheme.
function staticBase(): string {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

// Cache-bust on every shipped fix to xs.js / xs.wasm. /xs.js is served with a
// 1-hour public cache, so without this users keep running the previous
// build's runtime until their TTL rolls. Bump when either asset changes.
const RUNTIME_VERSION = "1.2.32";

type Example = { key: string; label: string; description: string; content: string };
type ExampleGroup = { category: string; items: Example[] };

const EXAMPLE_GROUPS: ExampleGroup[] = [
  {
    category: "basics",
    items: [
      { key: "hello-world", label: "hello world", description: "println, string concatenation, let bindings.", content: `println("hello, world!")

let name = "XS"
println("welcome to " + name)` },
      { key: "fizzbuzz", label: "fizzbuzz", description: "for loops and match guards.", content: `for i in 1..=20 {
    match 0 {
        _ if i % 15 == 0 => println("FizzBuzz")
        _ if i % 3 == 0  => println("Fizz")
        _ if i % 5 == 0  => println("Buzz")
        _                 => println(str(i))
    }
}` },
      { key: "interactive-input", label: "interactive input", description: "input() blocks on the playground stdin field.", content: `let name = input("what's your name? ")
println("hi, " + name + "!")

let n = int(input("enter a number: "))
println("doubled: " + str(n * 2))` },
    ],
  },
  {
    category: "functions",
    items: [
      { key: "fibonacci", label: "fibonacci", description: "recursive functions and ranges.", content: `fn fib(n) {
    if n <= 1 { return n }
    return fib(n - 1) + fib(n - 2)
}

for i in 0..10 {
    println("fib(" + str(i) + ") = " + str(fib(i)))
}` },
      { key: "closures", label: "closures", description: "returning a function that captures outer state.", content: `fn make_counter(start) {
    var n = start
    return fn() {
        n = n + 1
        return n
    }
}

let count = make_counter(0)
println(count())
println(count())
println(count())` },
      { key: "generators", label: "generators", description: "fn* with yield, consumed by for-in.", content: `fn* range_step(start, stop, step) {
    var i = start
    while i < stop {
        yield i
        i = i + step
    }
}

for n in range_step(0, 20, 3) {
    println(n)
}` },
      { key: "error-handling", label: "error handling", description: "throw / try / catch, plus a fall-through return.", content: `fn safe_divide(a, b) {
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
println(safe_divide(42, 7))` },
    ],
  },
  {
    category: "types",
    items: [
      { key: "pattern-matching", label: "pattern matching", description: "match arms with guards, literal and wildcard patterns.", content: `fn describe(value) {
    match value {
        0          => "zero"
        n if n > 0 => "positive: " + str(n)
        _          => "negative"
    }
}

println(describe(0))
println(describe(42))
println(describe(-7))` },
      { key: "enums", label: "enums", description: "tagged unions destructured by match.", content: `enum Shape {
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
println(area(Shape::Rect(3, 4)))` },
      { key: "structs", label: "structs", description: "named fields with an impl block.", content: `struct Point { x, y }

impl Point {
    fn distance(self, other) {
        let dx = self.x - other.x
        let dy = self.y - other.y
        return (dx * dx + dy * dy) ** 0.5
    }
}

let a = Point(0, 0)
let b = Point(3, 4)
println(a.distance(b))` },
    ],
  },
  {
    category: "advanced",
    items: [
      { key: "durations", label: "durations", description: "first-class time values with unit suffixes.", content: `let warmup = 2m30s
let frame  = 16ms

println(typeof(warmup))    -- duration
println(warmup)            -- 2m30s
println(warmup + frame)    -- 2m30.016s
println((1500ms).s)        -- 1.5
println(2s / 250ms)        -- 8` },
      { key: "decorators", label: "decorators", description: "lifecycle hooks: @on_start, @every, @on_exit.", content: `var ticks = 0

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
}` },
      { key: "json-roundtrip", label: "json roundtrip", description: "parse a JSON string, mutate, and re-stringify.", content: `import json

let raw = "{\\"name\\": \\"xs\\", \\"version\\": \\"1.2\\", \\"tags\\": [\\"lang\\", \\"wasm\\"]}"
let obj = json.parse(raw)
obj["tags"].push("playground")
println(json.stringify(obj))` },
    ],
  },
];

const samples: Record<string, string> = Object.fromEntries(
  EXAMPLE_GROUPS.flatMap(g => g.items.map(i => [i.key, i.content]))
);

type XS = {
  run: (code: string) => Promise<string>;
  exec: (argv: string[]) => Promise<{ stdout: string; stderr: string }>;
  writeFile: (path: string, content: string | Uint8Array) => void | Promise<void>;
  readFile: (path: string) => string | null | Promise<string | null>;
  listFiles: () => string[] | Promise<string[]>;
  deleteFile: (path: string) => boolean | Promise<boolean>;
  terminate?: () => void;
};

const DEFAULT_FILE = "main.xs";
const STORAGE_FILES = "xs_files_v1";
const STORAGE_ACTIVE = "xs_active_v1";
const STORAGE_LAYOUT = "xs_layout_v1";

const BTN = "inline-flex items-center gap-1.5 border border-[color:var(--rule)] bg-[color:var(--panel)] px-3 py-1.5 rounded-[6px] font-mono text-xs text-[color:var(--text)] hover:border-[color:var(--link)] hover:text-[color:var(--link)] focus-visible:outline-none focus-visible:border-[color:var(--link)] transition-colors";
const RUN_BTN = "inline-flex items-center gap-2 border border-[color:var(--link)] bg-[color:var(--link)] text-[color:var(--bg)] px-3.5 py-1.5 rounded-[6px] font-mono text-xs font-medium hover:bg-[color:var(--link-hover)] hover:border-[color:var(--link-hover)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-[color:var(--link)] transition-colors";
const STOP_BTN = "inline-flex items-center gap-1.5 border border-[color:var(--kw)] bg-[color:var(--panel)] px-3.5 py-1.5 rounded-[6px] font-mono text-xs text-[color:var(--kw)] hover:bg-[color:var(--kw)] hover:text-[color:var(--bg)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--kw)] transition-colors";
const KBD = "inline-flex items-center px-1.5 rounded-[3px] border border-[color:var(--bg)] font-mono text-[10px] leading-[1.4] opacity-90";

type OutChunk = { kind: "out" | "err" | "in"; text: string };
type RightTab = "output" | "emit-c" | "emit-js" | "emit-wasm" | "emit-ast" | "emit-bytecode";
type EmitCache = Partial<Record<RightTab, { forSource: string; text: string; isError: boolean }>>;

const RIGHT_TABS: { key: RightTab; label: string; emitArg?: string; lang?: string }[] = [
  { key: "output",       label: "output" },
  { key: "emit-c",       label: "C",       emitArg: "c",        lang: "c" },
  { key: "emit-js",      label: "JS",      emitArg: "js",       lang: "javascript" },
  { key: "emit-wasm",    label: "wasm",    emitArg: "wasm",     lang: "wasm" },
  { key: "emit-ast",     label: "AST",     emitArg: "ast",      lang: "lisp" },
  { key: "emit-bytecode",label: "bytecode",emitArg: "bytecode", lang: "asm" },
];

// Pull out file:line:col addresses inside stderr text and emphasise them so
// the eye lands on the location instead of scanning the whole error blob.
// Matches `file.xs:LINE[:COL]` (we want to jump to it), `line N[:M]`, and a
// bare `N:M` at line start. The first form is the only one we can actually
// route to a file, the other two get styled but stay non-interactive.
const ADDR_RE = /(\b[A-Za-z0-9_./-]+\.xs:\d+(?::\d+)?|\bline\s+\d+(?::\d+)?|\b\d+:\d+\b)/g;
const FILE_REF_RE = /^([A-Za-z0-9_./-]+\.xs):(\d+)(?::(\d+))?$/;

function renderError(
  text: string,
  jumpToFile?: (file: string, line: number, col?: number) => void,
) {
  if (!ADDR_RE.test(text)) return text;
  ADDR_RE.lastIndex = 0;
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = ADDR_RE.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const token = m[0];
    const fref = FILE_REF_RE.exec(token);
    if (fref && jumpToFile) {
      const file = fref[1];
      const line = parseInt(fref[2], 10);
      const col = fref[3] ? parseInt(fref[3], 10) : undefined;
      out.push(
        <button
          key={key++}
          type="button"
          onClick={() => jumpToFile(file, line, col)}
          className="font-medium underline decoration-dotted underline-offset-[3px] hover:decoration-solid cursor-pointer"
          style={{ color: "var(--num)" }}
          title="open in editor"
        >{token}</button>
      );
    } else {
      out.push(
        <span
          key={key++}
          className="font-medium underline decoration-dotted underline-offset-[3px]"
          style={{ color: "var(--num)" }}
        >{token}</span>
      );
    }
    last = m.index + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

type Layout = { files: number; output: number };
const DEFAULT_LAYOUT: Layout = { files: 200, output: 38 };

function loadLayout(): Layout {
  if (typeof window === "undefined") return DEFAULT_LAYOUT;
  try {
    const raw = localStorage.getItem(STORAGE_LAYOUT);
    if (!raw) return DEFAULT_LAYOUT;
    const parsed = JSON.parse(raw);
    return {
      files: typeof parsed.files === "number" ? parsed.files : DEFAULT_LAYOUT.files,
      output: typeof parsed.output === "number" ? parsed.output : DEFAULT_LAYOUT.output,
    };
  } catch { return DEFAULT_LAYOUT; }
}

function uniqueName(base: string, taken: Record<string, string>): string {
  if (!(base in taken)) return base;
  const dot = base.lastIndexOf(".");
  const stem = dot >= 0 ? base.slice(0, dot) : base;
  const ext = dot >= 0 ? base.slice(dot) : "";
  for (let i = 2; i < 1000; i++) {
    const cand = `${stem}-${i}${ext}`;
    if (!(cand in taken)) return cand;
  }
  return base + "-" + Date.now();
}

function exampleToFilename(name: string): string {
  return name.endsWith(".xs") ? name : name + ".xs";
}

export default function PlaygroundPage() {
  return (
    <DialogsProvider>
      <Playground />
    </DialogsProvider>
  );
}

function Playground() {
  const dialogs = useDialogs();
  const [mounted, setMounted] = useState(false);
  const [files, setFiles] = useState<Record<string, string>>({ [DEFAULT_FILE]: samples["hello-world"] });
  const [activeFile, setActiveFile] = useState(DEFAULT_FILE);
  const [chunks, setChunks] = useState<OutChunk[]>([]);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState<Layout>(DEFAULT_LAYOUT);
  const [draggingFiles, setDraggingFiles] = useState(false);
  const [draggingOutput, setDraggingOutput] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [runMs, setRunMs] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [rightTab, setRightTab] = useState<RightTab>("output");
  const [emitCache, setEmitCache] = useState<EmitCache>({});
  const [emitLoading, setEmitLoading] = useState<RightTab | null>(null);
  const [cursor, setCursor] = useState<{ line: number; col: number }>({ line: 1, col: 1 });
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [stdinValue, setStdinValue] = useState("");
  const [filesPanelOpen, setFilesPanelOpen] = useState(true);
  const [editorPrefs, setEditorPrefs] = useState<EditorPrefs>(DEFAULT_PREFS);
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<XSEditorHandle>(null);
  const stdinInputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLPreElement>(null);
  const xsRef = useRef<XS | null>(null);
  const stdoutCbRef = useRef<((line: string) => void) | null>(null);
  const stderrCbRef = useRef<((line: string) => void) | null>(null);
  const stdinResolverRef = useRef<((value: string) => void) | null>(null);

  const code = files[activeFile] ?? "";
  // Mirror activeFile in a ref so setCode never captures a stale name via
  // closure. Without this, a keystroke that fires onChange after the
  // user clicks a different file (but before React commits the new
  // activeFile to setCode's closure) writes the new file's content into
  // the OLD file's slot -- the file-overwrite bug the panel hit.
  const activeFileRef = useRef(activeFile);
  useEffect(() => { activeFileRef.current = activeFile; }, [activeFile]);
  const setCode = useCallback((next: string) => {
    const name = activeFileRef.current;
    setFiles(prev => prev[name] === next ? prev : { ...prev, [name]: next });
  }, []);

  const appendChunk = useCallback((kind: OutChunk["kind"], text: string) => {
    setChunks(prev => {
      if (prev.length && prev[prev.length - 1].kind === kind) {
        const next = prev.slice();
        next[next.length - 1] = { kind, text: next[next.length - 1].text + text };
        return next;
      }
      return [...prev, { kind, text }];
    });
  }, []);

  // Mount: hydrate everything from localStorage, then flip the mounted
  // flag to swap the SSR skeleton for the real UI. Avoids the hello-world
  // flash because the first paint of the real UI already has the user's
  // last-active file content. Share-link hydration is async (gzip-aware
  // decoder) so the rest of mount is wrapped in the same task.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let nextFiles: Record<string, string> | null = null;
      let nextActive: string | null = null;
      try {
        const raw = localStorage.getItem(STORAGE_FILES);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") {
            nextFiles = {};
            for (const [k, v] of Object.entries(parsed)) {
              if (typeof v === "string") nextFiles[k] = v;
            }
          }
        }
        const a = localStorage.getItem(STORAGE_ACTIVE);
        if (a) nextActive = a;
      } catch { /* ignore */ }

      // Share fragment overrides. v1+ payloads carry a whole workspace;
      // legacy payloads (raw base64 of one source file) are decoded as
      // a single shared.xs added next to whatever the user already had,
      // matching the old behaviour.
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      if (hash.startsWith("#s=")) {
        const ws = await decodeWorkspace(hash.slice(3));
        if (ws) {
          const isLegacySingle =
            Object.keys(ws.files).length === 1 &&
            ws.active === "shared.xs" &&
            "shared.xs" in ws.files;
          if (isLegacySingle) {
            const base = nextFiles && Object.keys(nextFiles).length > 0
              ? nextFiles
              : { [DEFAULT_FILE]: samples["hello-world"] };
            const sharedName = uniqueName("shared.xs", base);
            nextFiles = { ...base, [sharedName]: ws.files["shared.xs"] };
            nextActive = sharedName;
          } else {
            // Multi-file share replaces the workspace wholesale -- the
            // sharer's intent is "look at this project," not "merge into
            // mine." Local state stays in localStorage until the user
            // changes anything (the persistence effect will overwrite then).
            nextFiles = { ...ws.files };
            nextActive = ws.active;
          }
        }
      }

      if (cancelled) return;
      if (nextFiles && Object.keys(nextFiles).length > 0) {
        setFiles(nextFiles);
        const fallback = nextActive && nextFiles[nextActive] ? nextActive : Object.keys(nextFiles)[0];
        setActiveFile(fallback);
        editorRef.current?.setValue(nextFiles[fallback]);
      }
      setLayout(loadLayout());
      setEditorPrefs(loadPrefs());
      setMounted(true);
    })();
    return () => { cancelled = true; };
  }, []);

  // Persist files + active file to localStorage on change.
  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(STORAGE_FILES, JSON.stringify(files)); } catch { /* ignore */ }
  }, [files, mounted]);
  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(STORAGE_ACTIVE, activeFile); } catch { /* ignore */ }
  }, [activeFile, mounted]);
  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(STORAGE_LAYOUT, JSON.stringify(layout)); } catch { /* ignore */ }
  }, [layout, mounted]);
  useEffect(() => {
    if (!mounted) return;
    savePrefs(editorPrefs);
  }, [editorPrefs, mounted]);

  // Boot the runtime once. The xsRef is stable across all example / file switches.
  // bootRuntime is also re-callable to recreate the runtime after a cancel.
  const bootRuntime = useCallback(async () => {
    return new Promise<XS | null>((resolve) => {
      const base = staticBase();
      const existing = (window as unknown as { loadXS?: unknown }).loadXS;
      const start = async () => {
        try {
          // @ts-expect-error - loadXS is attached to window by the script
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
        } catch (err) {
          console.error("loadXS failed:", err);
          resolve(null);
        }
      };
      if (existing) { start(); return; }
      const script = document.createElement("script");
      script.src = `${base}/xs.js?v=${RUNTIME_VERSION}`;
      script.onload = start;
      script.onerror = () => resolve(null);
      document.head.appendChild(script);
    });
  }, []);

  useEffect(() => {
    if (!mounted) return;
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
      setLoading(false);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Keep the worker VFS in sync with our local file state so use / import
  // statements between files actually find their targets at runtime. localStorage
  // remains the source of truth — this is just a one-way push to the VM.
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

  useEffect(() => {
    const el = outputRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chunks, waitingForInput]);

  const handleRun = useCallback(async () => {
    if (!xsRef.current || running) return;
    setRunning(true);
    setChunks([]);
    setShowOutput(true);
    setRunMs(null);
    setRightTab("output");
    editorRef.current?.setMarkers([]);
    let produced = false;
    let stderrAcc = "";
    stdoutCbRef.current = (text: string) => { produced = true; appendChunk("out", text); };
    stderrCbRef.current = (text: string) => { produced = true; stderrAcc += text; appendChunk("err", text); };
    const t0 = performance.now();
    try {
      // Make sure the latest content is in the worker VFS before run.
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
      setRunMs(performance.now() - t0);
      stdoutCbRef.current = null;
      stderrCbRef.current = null;
      stdinResolverRef.current = null;
      setWaitingForInput(false);
      setRunning(false);
      // Mine accumulated stderr for `file:line[:col]` addresses pointing
      // at the active file (or the synthesised __run__.xs the runtime
      // stamps on inline scripts) and surface them as red lint markers.
      const markers: Array<{ line: number; col?: number; severity: "error"; message: string }> = [];
      const re = /([A-Za-z0-9_./-]+\.xs):(\d+)(?::(\d+))?/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(stderrAcc)) !== null) {
        const f = m[1].replace(/^\/+/, "");
        if (f !== activeFile && f !== "__run__.xs" && f !== "_run_.xs") continue;
        const lineStart = stderrAcc.lastIndexOf("\n", m.index) + 1;
        const lineEnd = stderrAcc.indexOf("\n", m.index);
        const ctx = stderrAcc.slice(lineStart, lineEnd === -1 ? undefined : lineEnd).trim();
        markers.push({
          line: parseInt(m[2], 10),
          col: m[3] ? parseInt(m[3], 10) : undefined,
          severity: "error",
          message: ctx || "runtime error here",
        });
      }
      if (markers.length > 0) editorRef.current?.setMarkers(markers);
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

  // Pulls `xs --emit <kind> /file.xs` through the worker. Wasm output is
  // binary so it's reported as a short summary instead of a wall of bytes.
  const fetchEmit = useCallback(async (tab: RightTab, source: string) => {
    const meta = RIGHT_TABS.find(t => t.key === tab);
    if (!meta?.emitArg || !xsRef.current) return;
    setEmitLoading(tab);
    try {
      const file = "/__emit__.xs";
      await xsRef.current.writeFile(file, source);
      const res = await xsRef.current.exec(["--emit", meta.emitArg, file]);
      let text = res.stdout || "";
      let isError = false;
      if (res.stderr && !text) {
        text = res.stderr;
        isError = true;
      }
      if (meta.emitArg === "wasm" && text) {
        // Stdout is the raw wasm module. Render a short summary plus a
        // hex preview of the first 64 bytes -- nobody wants a megabyte
        // of binary in a code panel.
        const bytes = new TextEncoder().encode(text);
        const head = Array.from(bytes.slice(0, 64))
          .map(b => b.toString(16).padStart(2, "0")).join(" ");
        const isWasm = bytes.length >= 4 && bytes[0] === 0x00 && bytes[1] === 0x61 && bytes[2] === 0x73 && bytes[3] === 0x6d;
        text = `${bytes.length} bytes${isWasm ? " (\\0asm magic)" : ""}\n\nfirst 64 bytes:\n${head}`;
      }
      setEmitCache(prev => ({ ...prev, [tab]: { forSource: source, text, isError } }));
    } catch (e) {
      setEmitCache(prev => ({ ...prev, [tab]: { forSource: source, text: String((e as Error)?.message ?? e), isError: true } }));
    } finally {
      setEmitLoading(null);
    }
  }, []);

  // When the active right-pane tab is an emit view and the source has
  // changed (or there's no cached output yet), refetch. Output tab and
  // bytecode get the active file's text; emit views always do too.
  const activeSource = files[activeFile] ?? "";
  useEffect(() => {
    if (rightTab === "output") return;
    const cached = emitCache[rightTab];
    if (cached && cached.forSource === activeSource) return;
    if (emitLoading === rightTab) return;
    fetchEmit(rightTab, activeSource);
  }, [rightTab, activeSource, emitCache, emitLoading, fetchEmit]);

  const switchFile = useCallback((name: string) => {
    // Use `in` so an empty file still counts as present -- a fresh
    // `main.xs` you haven't typed into yet is "" and `!files[name]`
    // would reject the switch, locking you out of an empty file.
    if (!(name in files)) return;
    if (name === activeFileRef.current) return;
    // Flush any in-flight edits in the editor into the OLD file's slot
    // before swapping. CodeMirror's onChange is debounced via React's
    // batching so a still-in-flight keystroke would otherwise vanish.
    const cur = editorRef.current?.getValue();
    const oldName = activeFileRef.current;
    setFiles(prev => {
      const next = { ...prev };
      if (cur !== undefined && prev[oldName] !== cur) next[oldName] = cur;
      return next;
    });
    setActiveFile(name);
    activeFileRef.current = name; // keep ref ahead of React commit
    editorRef.current?.setValue(files[name]);
  }, [files]);

  // Jump-to-error handler. The transpiler stamps `_run_.xs` on synthesised
  // run scripts; we map that back to the active file so clicking a runtime
  // error's file:line:col jumps to the actual source the user is editing.
  const jumpToError = useCallback((file: string, line: number, col?: number) => {
    const stripped = file.replace(/^\/+/, "");
    const target = (stripped === "__run__.xs" || stripped === "_run_.xs")
      ? activeFileRef.current
      : (stripped in files ? stripped : null);
    if (!target) return;
    if (target !== activeFileRef.current) switchFile(target);
    // setValue runs synchronously inside switchFile so the doc is current
    // by the next microtask -- defer one tick so gotoLine sees fresh doc.
    requestAnimationFrame(() => editorRef.current?.gotoLine(line, col));
  }, [files, switchFile]);

  const validateFilename = useCallback((existing: Record<string, string>, ignore?: string) => {
    return (raw: string): string | null => {
      const v = raw.trim();
      if (!v) return "name required";
      if (!/^[A-Za-z0-9._\-/]+$/.test(v)) return "only letters, digits, . _ - / allowed";
      const cleaned = v.endsWith(".xs") ? v : v + ".xs";
      if (cleaned !== ignore && cleaned in existing) return `${cleaned} already exists`;
      return null;
    };
  }, []);

  const handleNewBlank = useCallback(async () => {
    const name = await dialogs.prompt({
      title: "new file",
      message: "name your file (.xs is added if you leave it off)",
      defaultValue: uniqueName("untitled.xs", files),
      placeholder: "scratch.xs",
      confirmLabel: "create",
      validate: validateFilename(files),
    });
    if (!name) return;
    const cleaned = name.trim().endsWith(".xs") ? name.trim() : name.trim() + ".xs";
    setFiles(prev => ({ ...prev, [cleaned]: "" }));
    setActiveFile(cleaned);
    activeFileRef.current = cleaned; // sync ref before setValue so any
                                     // in-flight onChange routes to the new file
    editorRef.current?.setValue("");
    setTimeout(() => editorRef.current?.focus(), 0);
  }, [files, dialogs, validateFilename]);

  const handleLoadExample = useCallback((sampleName: string) => {
    const fileName = uniqueName(exampleToFilename(sampleName), files);
    const content = samples[sampleName];
    setFiles(prev => ({ ...prev, [fileName]: content }));
    setActiveFile(fileName);
    activeFileRef.current = fileName;
    editorRef.current?.setValue(content);
    setTimeout(() => editorRef.current?.focus(), 0);
  }, [files]);

  const handleRename = useCallback(async (oldName: string, newName: string) => {
    const cleaned = newName.trim().endsWith(".xs") ? newName.trim() : newName.trim() + ".xs";
    if (cleaned === oldName) return;
    if (cleaned in files) {
      await dialogs.alert({
        title: "rename failed",
        message: `${cleaned} already exists. Pick another name.`,
      });
      return;
    }
    setFiles(prev => {
      const next: Record<string, string> = {};
      for (const [k, v] of Object.entries(prev)) {
        if (k === oldName) next[cleaned] = v;
        else next[k] = v;
      }
      return next;
    });
    if (xsRef.current) { try { void xsRef.current.deleteFile(oldName); } catch { /* ignore */ } }
    if (activeFile === oldName) {
      setActiveFile(cleaned);
      activeFileRef.current = cleaned;
    }
  }, [files, activeFile, dialogs]);

  const handleDelete = useCallback(async (name: string) => {
    if (Object.keys(files).length <= 1) {
      await dialogs.alert({
        title: "can't delete",
        message: "you need at least one file. Create another first, then delete this one.",
      });
      return;
    }
    const ok = await dialogs.confirm({
      title: "delete file",
      message: `Delete ${name}? This can't be undone.`,
      confirmLabel: "delete",
      kind: "danger",
    });
    if (!ok) return;
    const next = { ...files };
    delete next[name];
    if (xsRef.current) { try { void xsRef.current.deleteFile(name); } catch { /* ignore */ } }
    setFiles(next);
    if (activeFile === name) {
      const remaining = Object.keys(next);
      setActiveFile(remaining[0]);
      activeFileRef.current = remaining[0];
      editorRef.current?.setValue(next[remaining[0]]);
    }
  }, [files, activeFile, dialogs]);

  const handleDuplicate = useCallback(async (name: string) => {
    const suggested = uniqueName(name, files);
    const dup = await dialogs.prompt({
      title: "duplicate file",
      message: `name the copy of ${name}`,
      defaultValue: suggested,
      confirmLabel: "duplicate",
      validate: validateFilename(files),
    });
    if (!dup) return;
    const cleaned = dup.trim().endsWith(".xs") ? dup.trim() : dup.trim() + ".xs";
    setFiles(prev => ({ ...prev, [cleaned]: prev[name] }));
    setActiveFile(cleaned);
    activeFileRef.current = cleaned;
    editorRef.current?.setValue(files[name]);
  }, [files, dialogs, validateFilename]);

  const handleShare = useCallback(async () => {
    setShareOpen(true);
  }, []);

  const handleLoadGist = useCallback(async () => {
    const ref = await dialogs.prompt({
      title: "load from gist",
      message: "paste a gist URL or ID. only .xs files are imported.",
      placeholder: "https://gist.github.com/user/abc123...",
      confirmLabel: "load",
      validate: (raw) => {
        const v = raw.trim();
        if (!v) return "paste a gist URL or ID";
        if (!parseGistRef(v)) return "doesn't look like a gist URL or ID";
        return null;
      },
    });
    if (!ref) return;
    const id = parseGistRef(ref);
    if (!id) return;
    let imported: Record<string, string>;
    try {
      imported = await fetchGist(id);
    } catch (err) {
      await dialogs.alert({
        title: "gist failed",
        message: err instanceof Error ? err.message : "could not fetch the gist",
      });
      return;
    }
    const names = Object.keys(imported);
    if (names.length === 0) {
      await dialogs.alert({
        title: "no .xs files",
        message: "this gist doesn't contain any .xs files.",
      });
      return;
    }
    const collisions = names.filter(n => n in files);
    if (collisions.length > 0) {
      const ok = await dialogs.confirm({
        title: "overwrite existing?",
        message: `${collisions.length === 1 ? "this file" : "these files"} already exist and will be replaced: ${collisions.join(", ")}.`,
        confirmLabel: "overwrite",
        kind: "danger",
      });
      if (!ok) return;
    }
    setFiles(prev => ({ ...prev, ...imported }));
    const first = names[0];
    setActiveFile(first);
    activeFileRef.current = first;
    editorRef.current?.setValue(imported[first]);
    setShareNote(`loaded ${names.length} file${names.length === 1 ? "" : "s"} from gist`);
    setTimeout(() => setShareNote(null), 2500);
  }, [dialogs, files]);

  // Drag handles
  useEffect(() => {
    if (!draggingFiles && !draggingOutput) return;
    const onMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (draggingFiles) {
        const px = Math.max(140, Math.min(420, e.clientX - rect.left));
        setLayout(l => ({ ...l, files: px }));
      } else if (draggingOutput) {
        const pct = ((rect.right - e.clientX) / rect.width) * 100;
        setLayout(l => ({ ...l, output: Math.max(20, Math.min(70, pct)) }));
      }
    };
    const onUp = () => { setDraggingFiles(false); setDraggingOutput(false); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [draggingFiles, draggingOutput]);

  const fileCount = useMemo(() => Object.keys(files).length, [files]);

  // Cmd / Ctrl + K opens the command palette from anywhere on the page.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(o => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Command-palette action set. Rebuilt when handlers / files / examples
  // change so closures capture fresh state. Each action ends up driving
  // an existing UI handler, so the palette is purely a navigation surface.
  const paletteActions = useMemo<PaletteAction[]>(() => {
    const acts: PaletteAction[] = [];
    acts.push({ id: "run",        label: "run active file",   group: "run", hint: "^⏎", run: handleRun });
    acts.push({ id: "stop",       label: "stop running",      group: "run", run: handleStop });
    acts.push({ id: "share",      label: "share workspace",   group: "io",  run: handleShare });
    acts.push({ id: "gist",       label: "load gist",         group: "io",  run: handleLoadGist });
    acts.push({ id: "newfile",    label: "new blank file",    group: "file", run: handleNewBlank });
    acts.push({ id: "togglefiles",label: "toggle files panel",group: "view", run: () => setFilesPanelOpen(o => !o) });
    acts.push({ id: "clearout",   label: "clear output",      group: "view", run: () => { setChunks([]); setShowOutput(false); setRunMs(null); } });
    for (const tab of RIGHT_TABS) {
      acts.push({
        id: "tab-" + tab.key,
        label: "show " + tab.label + (tab.emitArg ? " (emit " + tab.emitArg + ")" : ""),
        group: "view",
        run: () => setRightTab(tab.key),
      });
    }
    for (const name of Object.keys(files)) {
      acts.push({
        id: "switch-" + name,
        label: "open " + name,
        group: "file",
        run: () => switchFile(name),
      });
    }
    for (const group of EXAMPLE_GROUPS) {
      for (const item of group.items) {
        acts.push({
          id: "example-" + item.key,
          label: "load example: " + item.label,
          hint: item.description,
          group: "example",
          run: () => handleLoadExample(item.key),
        });
      }
    }
    return acts;
  }, [files, handleRun, handleStop, handleShare, handleLoadGist, handleNewBlank, handleLoadExample, switchFile]);

  // SSR-safe skeleton: render the chrome but no editor / output content until
  // we've read localStorage. Prevents the flash of the default hello-world
  // example on every refresh.
  if (!mounted) {
    return (
      <Wrap wide>
        <section className="pt-10 pb-12">
          <div className="flex items-center gap-3 flex-wrap mb-4 font-mono text-xs">
            <span className={BTN + " opacity-40"}>loading...</span>
          </div>
          <div className="rounded-[6px] border border-[color:var(--rule)] bg-[color:var(--panel)] min-h-[60vh]" />
        </section>
      </Wrap>
    );
  }

  return (
    <Wrap wide>
      <section className="pt-10 pb-12">
        <div className="flex items-center gap-3 flex-wrap mb-4 font-mono text-xs">
          {running ? (
            <button onClick={handleStop} className={STOP_BTN} title="stop the running program">
              <span aria-hidden>■</span> stop
            </button>
          ) : (
            <button
              onClick={handleRun}
              disabled={loading}
              className={RUN_BTN + " disabled:opacity-40 disabled:cursor-not-allowed"}
              title="run the active file (Ctrl+Enter)"
            >
              <span aria-hidden>▶</span>
              {loading ? "loading" : "run"}
              <span className={KBD + " ml-1"} aria-hidden>{"^⏎"}</span>
            </button>
          )}
          {running && (
            <span className="text-[color:var(--text-muted)]">
              running<span style={{ animation: "running-blink 1.2s step-start infinite" }}>...</span>
            </span>
          )}
          <button onClick={() => setPaletteOpen(true)} className={BTN} title="command palette (Ctrl+K)">
            <span>commands</span>
            <span className={KBD + " ml-1"} aria-hidden>{"^K"}</span>
          </button>
          <button onClick={handleShare} className={BTN} title="share or embed this workspace">share</button>
          <button onClick={handleLoadGist} className={BTN} title="import .xs files from a public gist">gist</button>
          <PlaygroundSettings prefs={editorPrefs} onChange={setEditorPrefs} />
          <button
            onClick={() => setFilesPanelOpen(o => !o)}
            className={BTN + " md:hidden"}
            aria-label="toggle files panel"
          >{filesPanelOpen ? "hide files" : "files"}</button>
          <span className="text-[color:var(--text-faint)] ml-auto hidden md:inline">{fileCount} file{fileCount === 1 ? "" : "s"}</span>
          {shareNote && (
            <span className="text-[color:var(--text-muted)]">{shareNote}</span>
          )}
        </div>

        <div
          ref={containerRef}
          className="flex flex-col md:flex-row min-h-[60vh] rounded-[6px] border border-[color:var(--rule)] overflow-hidden bg-[color:var(--panel)]"
          style={{ userSelect: (draggingFiles || draggingOutput) ? "none" : "auto" }}
        >
          {/* files panel */}
          {filesPanelOpen && (
            <>
              <div
                className="border-b md:border-b-0 md:border-r border-[color:var(--rule)] bg-[color:var(--panel)] shrink-0"
                style={{ width: layout.files, minWidth: 140, maxWidth: "60%" }}
              >
                <PlaygroundFiles
                  files={files}
                  activeFile={activeFile}
                  exampleGroups={EXAMPLE_GROUPS}
                  onSelect={switchFile}
                  onNewBlank={handleNewBlank}
                  onLoadExample={handleLoadExample}
                  onRename={handleRename}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                />
              </div>
              <div
                onMouseDown={() => setDraggingFiles(true)}
                className="hidden md:block w-1 cursor-col-resize bg-transparent hover:bg-[color:var(--rule-soft)] transition-colors shrink-0"
              />
            </>
          )}

          {/* editor */}
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <div className="border-b border-[color:var(--rule)] flex items-stretch overflow-x-auto font-mono text-xs">
              {Object.keys(files).map(name => {
                const active = name === activeFile;
                const onlyFile = fileCount === 1;
                return (
                  <div
                    key={name}
                    className={
                      "group flex items-stretch border-r border-[color:var(--rule)] whitespace-nowrap transition-colors " +
                      (active
                        ? "text-[color:var(--text)] bg-[color:var(--bg)] border-b border-b-[color:var(--link)]"
                        : "text-[color:var(--text-faint)] hover:text-[color:var(--text-muted)]")
                    }
                  >
                    <button
                      onClick={() => switchFile(name)}
                      className="pl-3 py-1.5"
                      title={name}
                    >{name}</button>
                    <button
                      onClick={() => handleDelete(name)}
                      disabled={onlyFile}
                      className={
                        "px-2 py-1.5 text-[10px] opacity-0 group-hover:opacity-100 disabled:hidden hover:text-[color:var(--kw)] transition-opacity"
                      }
                      title={onlyFile ? "can't close the last file" : "close (delete) " + name}
                      aria-label={"close " + name}
                    >×</button>
                  </div>
                );
              })}
              <button
                onClick={handleNewBlank}
                className="px-3 py-1.5 border-r border-[color:var(--rule)] text-[color:var(--text-faint)] hover:text-[color:var(--text)]"
                title="new file"
                aria-label="new file"
              >+</button>
              <div className="flex-1" />
              <span className="px-3 py-1.5 text-[10px] text-[color:var(--text-faint)] whitespace-nowrap">^⏎ to run, ^K for actions</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <XSEditor
                ref={editorRef}
                initialValue={code}
                onChange={setCode}
                onRun={handleRun}
                onCursorChange={(line, col) => setCursor({ line, col })}
                opts={editorPrefs}
              />
            </div>
          </div>

          {/* output divider */}
          <div
            onMouseDown={() => setDraggingOutput(true)}
            className="hidden md:block w-1 cursor-col-resize bg-[color:var(--rule)] hover:bg-[color:var(--rule-soft)] transition-colors shrink-0"
          />

          {/* right pane: tabs across output + emit views */}
          <div
            className="flex flex-col overflow-hidden border-t md:border-t-0 border-[color:var(--rule)] bg-[color:var(--panel)] shrink-0"
            style={{ width: `${layout.output}%`, minWidth: 240 }}
          >
            <div className="border-b border-[color:var(--rule)] flex items-stretch font-mono text-xs">
              {RIGHT_TABS.map(tab => {
                const active = rightTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setRightTab(tab.key)}
                    className={
                      "px-3 py-1.5 border-r border-[color:var(--rule)] transition-colors " +
                      (active
                        ? "text-[color:var(--text)] bg-[color:var(--bg)]"
                        : "text-[color:var(--text-faint)] hover:text-[color:var(--text-muted)]")
                    }
                    title={tab.emitArg ? `xs --emit ${tab.emitArg}` : "stdout / stderr from run"}
                  >{tab.label}</button>
                );
              })}
              <div className="flex-1 border-r border-[color:var(--rule)]" />
              <div className="flex items-center gap-3 px-3">
                {rightTab === "output" && runMs != null && !running && (
                  <span className="text-[10px] text-[color:var(--text-faint)]" title="wall time of the most recent run">
                    {runMs < 10 ? runMs.toFixed(1) : Math.round(runMs)}ms
                  </span>
                )}
                {rightTab === "output" && chunks.length > 0 && !running && (
                  <>
                    <button
                      onClick={async () => {
                        const text = chunks.map(c => c.text).join("");
                        try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1200); }
                        catch { /* permission denied; silent */ }
                      }}
                      className="text-[10px] text-[color:var(--text-faint)] hover:text-[color:var(--text)]"
                      title="copy output to clipboard"
                    >{copied ? "copied" : "copy"}</button>
                    <button
                      onClick={() => { setChunks([]); setShowOutput(false); setRunMs(null); }}
                      className="text-[10px] text-[color:var(--text-faint)] hover:text-[color:var(--text)]"
                    >clear</button>
                  </>
                )}
                {rightTab !== "output" && emitCache[rightTab] && !emitCache[rightTab]!.isError && (
                  <>
                    <span className="text-[10px] text-[color:var(--text-faint)]">
                      {emitCache[rightTab]!.text.split("\n").length} lines
                    </span>
                    <button
                      onClick={async () => {
                        const text = emitCache[rightTab]!.text;
                        try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1200); }
                        catch { /* ignore */ }
                      }}
                      className="text-[10px] text-[color:var(--text-faint)] hover:text-[color:var(--text)]"
                      title="copy emit output"
                    >{copied ? "copied" : "copy"}</button>
                  </>
                )}
              </div>
            </div>
            {rightTab === "output" ? (
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
                    >
                      {c.kind === "err" ? renderError(c.text, jumpToError) : c.text}
                    </span>
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
            ) : (
              <pre
                className="flex-1 overflow-auto p-4 font-mono text-[12.5px] leading-relaxed whitespace-pre text-[color:var(--text)]"
                style={{ tabSize: 4 }}
              >
                {emitLoading === rightTab ? (
                  <span className="text-[color:var(--text-faint)]">
                    {"-- "}emitting{" "}{rightTab.replace("emit-", "")}{"..."}
                  </span>
                ) : emitCache[rightTab] ? (
                  <span style={{ color: emitCache[rightTab]!.isError ? "var(--kw)" : "var(--text)" }}>
                    {emitCache[rightTab]!.text || `-- (empty ${rightTab.replace("emit-", "")} output)`}
                  </span>
                ) : (
                  <span className="text-[color:var(--text-faint)]">{"-- loading..."}</span>
                )}
              </pre>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3 font-mono text-[10px] text-[color:var(--text-faint)] border border-[color:var(--rule)] rounded-[6px] px-3 py-1 bg-[color:var(--panel)]">
          <span>XS v{RUNTIME_VERSION}</span>
          <span className="text-[color:var(--rule)]">|</span>
          <span>{activeFile}</span>
          <span className="text-[color:var(--rule)]">|</span>
          <span>line {cursor.line}, col {cursor.col}</span>
          <div className="flex-1" />
          {running ? (
            <span className="text-[color:var(--link)]">running</span>
          ) : runMs != null ? (
            <span>last run {runMs < 10 ? runMs.toFixed(1) : Math.round(runMs)}ms</span>
          ) : (
            <span>idle</span>
          )}
        </div>

        <p className="mt-3 text-xs text-[color:var(--text-faint)] hidden sm:block">
          Real XS interpreter via WebAssembly. Files persist locally in your browser. Networking, native plugins, JIT, and the REPL aren&apos;t available.
        </p>
      </section>
      {shareOpen && (
        <ShareModal
          files={files}
          active={activeFile}
          onClose={() => setShareOpen(false)}
        />
      )}
      {paletteOpen && (
        <CommandPalette
          onClose={() => setPaletteOpen(false)}
          actions={paletteActions}
        />
      )}
    </Wrap>
  );
}

// --- Command palette ------------------------------------------------------
type PaletteAction = { id: string; label: string; hint?: string; group: string; run: () => void };

function CommandPalette({ actions, onClose }: { actions: PaletteAction[]; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions
      .map(a => {
        const hay = (a.label + " " + a.group + " " + (a.hint ?? "")).toLowerCase();
        let score = 0;
        let qi = 0;
        for (let i = 0; i < hay.length && qi < q.length; i++) {
          if (hay[i] === q[qi]) { score += (i === 0 || hay[i - 1] === " " ? 2 : 1); qi++; }
        }
        if (qi < q.length) return null;
        return { action: a, score };
      })
      .filter((x): x is { action: PaletteAction; score: number } => x !== null)
      .sort((a, b) => b.score - a.score)
      .map(x => x.action);
  }, [actions, query]);

  useEffect(() => { setFocused(0); }, [query]);

  const choose = (idx: number) => {
    const act = filtered[idx];
    if (!act) return;
    onClose();
    requestAnimationFrame(() => act.run());
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
    if (e.key === "Enter") { e.preventDefault(); choose(focused); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setFocused(i => Math.min(filtered.length - 1, i + 1)); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); setFocused(i => Math.max(0, i - 1)); return; }
  };

  return (
    <div
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] bg-black/40 backdrop-blur-sm"
    >
      <div className="w-[560px] max-w-[92vw] rounded-[8px] border border-[color:var(--rule)] bg-[color:var(--panel)] shadow-2xl overflow-hidden">
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKey}
          placeholder="type a command, file, or example..."
          className="w-full px-4 py-3 bg-transparent border-b border-[color:var(--rule)] font-mono text-sm text-[color:var(--text)] outline-none placeholder:text-[color:var(--text-faint)]"
          spellCheck={false}
          autoComplete="off"
        />
        <div className="max-h-[40vh] overflow-y-auto py-1">
          {filtered.length === 0 && (
            <div className="px-4 py-3 font-mono text-xs text-[color:var(--text-faint)]">no matches</div>
          )}
          {filtered.map((a, i) => (
            <button
              key={a.id}
              onClick={() => choose(i)}
              onMouseEnter={() => setFocused(i)}
              className={
                "w-full text-left px-4 py-1.5 flex items-center gap-3 font-mono text-[13px] " +
                (i === focused ? "bg-[color:var(--rule-soft)] text-[color:var(--text)]" : "text-[color:var(--text-muted)]")
              }
            >
              <span className="text-[10px] uppercase tracking-[0.06em] text-[color:var(--text-faint)] w-16 shrink-0">{a.group}</span>
              <span className="flex-1 truncate">{a.label}</span>
              {a.hint && <span className="text-[10px] text-[color:var(--text-faint)]">{a.hint}</span>}
            </button>
          ))}
        </div>
        <div className="px-4 py-1.5 border-t border-[color:var(--rule)] flex items-center gap-3 font-mono text-[10px] text-[color:var(--text-faint)]">
          <span>↑↓ navigate</span>
          <span>↵ run</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
