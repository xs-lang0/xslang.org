"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type XS = {
  run: (code: string) => Promise<string>;
  writeFile: (path: string, content: string | Uint8Array) => void | Promise<void>;
  readFile: (path: string) => string | null | Promise<string | null>;
  listFiles: () => string[] | Promise<string[]>;
  deleteFile: (path: string) => boolean | Promise<boolean>;
  terminate?: () => void;
};

export type RuntimeChunk = { kind: "out" | "err" | "in"; text: string };

type Options = {
  // Bump in lock-step with the asset version on the main playground.
  version: string;
  // Called once a line / partial chunk arrives. The caller decides how to
  // coalesce adjacent same-kind chunks.
  onChunk: (kind: "out" | "err", text: string) => void;
  // Notified when the program calls input(). The caller is expected to
  // surface a prompt UI and then call resolveStdin(value) or stop().
  onStdinRequest?: () => void;
};

// Boots xs.js / xs.wasm in a worker and exposes a run / stop / runtime
// triple. The stdin path is split into onStdinRequest (out) and the
// resolveStdin returned helper (in); that keeps the caller in charge of
// any UI for the input prompt without re-implementing the boot.
export function useXSRuntime(opts: Options) {
  const { version, onChunk, onStdinRequest } = opts;
  const xsRef = useRef<XS | null>(null);
  const stdoutCbRef = useRef<((text: string) => void) | null>(null);
  const stderrCbRef = useRef<((text: string) => void) | null>(null);
  const stdinResolverRef = useRef<((value: string) => void) | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  // Keep the callback refs current without re-booting the worker when the
  // parent passes a new closure each render.
  const onChunkRef = useRef(onChunk);
  const onStdinRequestRef = useRef(onStdinRequest);
  useEffect(() => { onChunkRef.current = onChunk; }, [onChunk]);
  useEffect(() => { onStdinRequestRef.current = onStdinRequest; }, [onStdinRequest]);

  const boot = useCallback(async (): Promise<XS | null> => {
    return new Promise<XS | null>((resolve) => {
      const base = typeof window === "undefined" ? "" : window.location.origin;
      const existing = (window as unknown as { loadXS?: unknown }).loadXS;
      const start = async () => {
        try {
          // @ts-expect-error - loadXS is attached to window by the script
          const runtime: XS = await window.loadXS({
            wasmUrl: `${base}/xs.wasm?v=${version}`,
            worker: true,
            stdout: (line: string) => stdoutCbRef.current?.(line + "\n"),
            stderr: (line: string) => stderrCbRef.current?.(line + "\n"),
            stdoutPartial: (text: string) => stdoutCbRef.current?.(text),
            stderrPartial: (text: string) => stderrCbRef.current?.(text),
            stdin: () => new Promise<string>((res) => {
              stdinResolverRef.current = (value: string) => res(value);
              onStdinRequestRef.current?.();
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
      script.src = `${base}/xs.js?v=${version}`;
      script.onload = start;
      script.onerror = () => resolve(null);
      document.head.appendChild(script);
    });
  }, [version]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const rt = await boot();
      if (cancelled) return;
      xsRef.current = rt;
      setLoading(false);
      if (!rt) onChunkRef.current("err", "error: could not load XS runtime\n");
    })();
    return () => { cancelled = true; };
  }, [boot]);

  const syncFiles = useCallback(async (files: Record<string, string>) => {
    const xs = xsRef.current;
    if (!xs) return;
    for (const [path, content] of Object.entries(files)) {
      try { await xs.writeFile(path, content); } catch { /* ignore */ }
    }
  }, []);

  const run = useCallback(async (entry: string, files: Record<string, string>) => {
    const xs = xsRef.current;
    if (!xs || running) return;
    setRunning(true);
    let produced = false;
    stdoutCbRef.current = (text) => { produced = true; onChunkRef.current("out", text); };
    stderrCbRef.current = (text) => { produced = true; onChunkRef.current("err", text); };
    try {
      await syncFiles(files);
      await xs.run(files[entry] ?? "");
      if (!produced) onChunkRef.current("out", "(no output)\n");
    } catch {
      onChunkRef.current("err", "(runtime crashed; reloading...)\n");
      try { xs.terminate?.(); } catch { /* ignore */ }
      xsRef.current = null;
      const fresh = await boot();
      if (fresh) xsRef.current = fresh;
    } finally {
      stdoutCbRef.current = null;
      stderrCbRef.current = null;
      stdinResolverRef.current = null;
      setRunning(false);
    }
  }, [running, syncFiles, boot]);

  const stop = useCallback(async () => {
    if (!running) return;
    onChunkRef.current("err", "(cancelled)\n");
    try { xsRef.current?.terminate?.(); } catch { /* ignore */ }
    xsRef.current = null;
    stdoutCbRef.current = null;
    stderrCbRef.current = null;
    if (stdinResolverRef.current) {
      try { stdinResolverRef.current(""); } catch { /* ignore */ }
      stdinResolverRef.current = null;
    }
    setRunning(false);
    const fresh = await boot();
    if (fresh) xsRef.current = fresh;
  }, [running, boot]);

  const resolveStdin = useCallback((value: string) => {
    const r = stdinResolverRef.current;
    if (!r) return false;
    r(value);
    stdinResolverRef.current = null;
    return true;
  }, []);

  return { loading, running, run, stop, resolveStdin, syncFiles };
}
