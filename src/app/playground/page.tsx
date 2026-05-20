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

const samples: Record<string, string> = {
  "hello-world": `println("hello, world!")

let name = "XS"
println("welcome to " + name)`,
  "fizzbuzz": `for i in 1..=20 {
    match 0 {
        _ if i % 15 == 0 => println("FizzBuzz")
        _ if i % 3 == 0  => println("Fizz")
        _ if i % 5 == 0  => println("Buzz")
        _                 => println(str(i))
    }
}`,
  "pattern-matching": `fn describe(value) {
    match value {
        0          => "zero"
        n if n > 0 => "positive: " + str(n)
        _          => "negative"
    }
}

println(describe(0))
println(describe(42))
println(describe(-7))`,
  "fibonacci": `fn fib(n) {
    if n <= 1 { return n }
    return fib(n - 1) + fib(n - 2)
}

for i in 0..10 {
    println("fib(" + str(i) + ") = " + str(fib(i)))
}`,
  "closures": `fn make_counter(start) {
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
  "error-handling": `fn safe_divide(a, b) {
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
  "generators": `fn* range_step(start, stop, step) {
    var i = start
    while i < stop {
        yield i
        i = i + step
    }
}

for n in range_step(0, 20, 3) {
    println(n)
}`,
  "enums": `enum Shape {
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
  "durations": `let warmup = 2m30s
let frame  = 16ms

println(typeof(warmup))    -- duration
println(warmup)            -- 2m30s
println(warmup + frame)    -- 2m30.016s
println((1500ms).s)        -- 1.5
println(2s / 250ms)        -- 8`,
  "interactive-input": `let name = input("what's your name? ")
println("hi, " + name + "!")

let n = int(input("enter a number: "))
println("doubled: " + str(n * 2))`,
  "decorators": `var ticks = 0

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

const DEFAULT_FILE = "main.xs";
const STORAGE_FILES = "xs_files_v1";
const STORAGE_ACTIVE = "xs_active_v1";
const STORAGE_LAYOUT = "xs_layout_v1";

const BTN = "inline-flex items-center gap-1.5 border border-[color:var(--rule)] bg-[color:var(--panel)] px-3 py-1.5 rounded-[6px] font-mono text-xs text-[color:var(--text)] hover:border-[color:var(--link)] hover:text-[color:var(--link)] focus-visible:outline-none focus-visible:border-[color:var(--link)] transition-colors";
const RUN_BTN = "inline-flex items-center gap-2 border border-[color:var(--link)] bg-[color:var(--link)] text-[color:var(--bg)] px-3.5 py-1.5 rounded-[6px] font-mono text-xs font-medium hover:bg-[color:var(--link-hover)] hover:border-[color:var(--link-hover)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-[color:var(--link)] transition-colors";
const STOP_BTN = "inline-flex items-center gap-1.5 border border-[color:var(--kw)] bg-[color:var(--panel)] px-3.5 py-1.5 rounded-[6px] font-mono text-xs text-[color:var(--kw)] hover:bg-[color:var(--kw)] hover:text-[color:var(--bg)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--kw)] transition-colors";
const KBD = "inline-flex items-center px-1.5 rounded-[3px] border border-[color:var(--bg)] font-mono text-[10px] leading-[1.4] opacity-90";

type OutChunk = { kind: "out" | "err" | "in"; text: string };

// Pull out file:line:col addresses inside stderr text and emphasise them so
// the eye lands on the location instead of scanning the whole error blob.
// Matches forms like `main.xs:5:12`, `at script.xs:42`, or a bare `5:12` at
// the start of a line. Anything that doesn't match is rendered as-is.
const ADDR_RE = /(\b[A-Za-z0-9_./-]+\.xs:\d+(?::\d+)?|\bline\s+\d+(?::\d+)?|\b\d+:\d+\b)/g;
function renderError(text: string) {
  if (!ADDR_RE.test(text)) return text;
  ADDR_RE.lastIndex = 0;
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = ADDR_RE.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(
      <span
        key={key++}
        className="font-medium underline decoration-dotted underline-offset-[3px]"
        style={{ color: "var(--num)" }}
      >{m[0]}</span>
    );
    last = m.index + m[0].length;
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
  const [waitingForInput, setWaitingForInput] = useState(false);
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
    let produced = false;
    stdoutCbRef.current = (text: string) => { produced = true; appendChunk("out", text); };
    stderrCbRef.current = (text: string) => { produced = true; appendChunk("err", text); };
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
                  examples={samples}
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
            <div className="border-b border-[color:var(--rule)] px-4 py-1.5 font-mono text-xs text-[color:var(--text-faint)] flex items-center justify-between">
              <span>{activeFile}</span>
              <span className="text-[10px] text-[color:var(--text-faint)]">Ctrl+Enter to run</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <XSEditor
                ref={editorRef}
                initialValue={code}
                onChange={setCode}
                onRun={handleRun}
                opts={editorPrefs}
              />
            </div>
          </div>

          {/* output divider */}
          <div
            onMouseDown={() => setDraggingOutput(true)}
            className="hidden md:block w-1 cursor-col-resize bg-[color:var(--rule)] hover:bg-[color:var(--rule-soft)] transition-colors shrink-0"
          />

          {/* output */}
          <div
            className="flex flex-col overflow-hidden border-t md:border-t-0 border-[color:var(--rule)] bg-[color:var(--panel)] shrink-0"
            style={{ width: `${layout.output}%`, minWidth: 200 }}
          >
            <div className="border-b border-[color:var(--rule)] px-4 py-1.5 font-mono text-xs text-[color:var(--text-faint)] flex items-center justify-between">
              <span>output</span>
              {chunks.length > 0 && !running && (
                <button
                  onClick={() => { setChunks([]); setShowOutput(false); }}
                  className="text-[10px] text-[color:var(--text-faint)] hover:text-[color:var(--text)]"
                >clear</button>
              )}
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
                    >
                      {c.kind === "err" ? renderError(c.text) : c.text}
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
          </div>
        </div>

        <p className="mt-4 text-xs text-[color:var(--text-faint)] hidden sm:block">
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
    </Wrap>
  );
}
