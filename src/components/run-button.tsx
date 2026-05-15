"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { flushSync } from "react-dom";
import { tokenize, TOKEN_COLORS } from "@/components/code-block";
import { CopyButton } from "@/components/copy-button";

const TIMEOUT_MS = 5000;
const BASE_URL = "https://static.xslang.org";

let xsScriptCache: string | null = null;

async function getXSScript(): Promise<string> {
  if (xsScriptCache) return xsScriptCache;
  const res = await fetch(BASE_URL + "/xs.js");
  if (!res.ok) throw new Error("failed to fetch xs.js: " + res.status);
  xsScriptCache = await res.text();
  return xsScriptCache;
}

type RunOpts = {
  onLine?: (line: string) => void;
  onDone?: (timedOut: boolean) => void;
  onError?: (msg: string) => void;
};

async function runXS(code: string, opts: RunOpts = {}): Promise<void> {
  const xsScript = await getXSScript();

  const workerCode = xsScript + "\n;" + `
    self.onmessage = async function(e) {
      const post = (line) => self.postMessage({ kind: "line", line });
      try {
        const xs = await loadXS({
          wasmUrl: "${BASE_URL}/xs.wasm",
          stdout: post,
          stderr: post,
        });
        await xs.run(e.data);
        self.postMessage({ kind: "done" });
      } catch (err) {
        self.postMessage({ kind: "error", message: String(err) });
      }
    };
  `;

  return new Promise((resolve) => {
    const blob = new Blob([workerCode], { type: "application/javascript" });
    const worker = new Worker(URL.createObjectURL(blob));

    const timer = setTimeout(() => {
      worker.terminate();
      opts.onLine?.("(timed out after " + (TIMEOUT_MS / 1000) + "s)");
      opts.onDone?.(true);
      resolve();
    }, TIMEOUT_MS);

    worker.onmessage = (e) => {
      const m = e.data;
      if (m.kind === "line") {
        opts.onLine?.(m.line);
      } else if (m.kind === "done") {
        clearTimeout(timer);
        worker.terminate();
        opts.onDone?.(false);
        resolve();
      } else if (m.kind === "error") {
        clearTimeout(timer);
        worker.terminate();
        opts.onError?.(m.message);
        resolve();
      }
    };

    worker.onerror = (e) => {
      clearTimeout(timer);
      worker.terminate();
      opts.onError?.(String(e.message));
      resolve();
    };

    worker.postMessage(code);
  });
}

function Highlighted({ code }: { code: string }) {
  const tokens = useMemo(() => tokenize(code), [code]);
  return (
    <>
      {tokens.map((token, i) => {
        const color = TOKEN_COLORS[token.type];
        return color ? (
          <span key={i} style={{ color }}>{token.text}</span>
        ) : (
          <span key={i}>{token.text}</span>
        );
      })}
      {"\n"}
    </>
  );
}

const editorTextStyle: React.CSSProperties = {
  fontFamily: "var(--mono)",
  fontSize: "13px",
  lineHeight: "1.65",
  letterSpacing: 0,
  wordSpacing: 0,
  textIndent: 0,
  tabSize: 2,
  fontVariantLigatures: "none",
  fontFeatureSettings: '"calt" 0',
  fontWeight: 400,
  fontStyle: "normal",
  margin: 0,
};

export function RunnableBlock({ code: original, filename }: { code: string; filename?: string }) {
  const [code, setCode] = useState(original);
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [output, setOutput] = useState("");
  const [error, setError] = useState(false);
  const [runFlash, setRunFlash] = useState(false);
  const [resetFlash, setResetFlash] = useState(false);
  const [mounted, setMounted] = useState(false);
  const edited = code !== original;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);

  // Code block mount animation - only fires once
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleRun = useCallback(async () => {
    setRunFlash(true);
    setTimeout(() => setRunFlash(false), 200);
    setState("running");
    setError(false);
    setOutput("");
    let buf = "";
    await runXS(code, {
      onLine: (line) => {
        buf += (buf ? "\n" : "") + line;
        // Force a synchronous render per line so React doesn't batch
        // multiple postMessage-delivered lines into a single paint.
        flushSync(() => setOutput(buf));
      },
      onDone: (timedOut) => {
        setError(timedOut);
        setState("done");
      },
      onError: (msg) => {
        setOutput(msg);
        setError(true);
        setState("done");
      },
    });
  }, [code]);

  const handleReset = useCallback(() => {
    setResetFlash(true);
    setTimeout(() => setResetFlash(false), 200);
    setCode(original);
    setOutput("");
    setState("idle");
    if (textareaRef.current) textareaRef.current.value = original;
  }, [original]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      ta.value = ta.value.substring(0, start) + "  " + ta.value.substring(end);
      ta.selectionStart = ta.selectionEnd = start + 2;
      setCode(ta.value);
    }
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleRun();
    }
  }, [handleRun]);

  const lines = code.split("\n").length;

  return (
    <div
      ref={blockRef}
      className={`my-6 rounded-[6px] border bg-[color:var(--panel)] transition-all duration-[180ms] ${mounted ? "code-mount" : ""} ${resetFlash ? "reset-flash border-[color:var(--link)]" : "border-[color:var(--rule)]"}`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-[color:var(--rule)] px-4 py-2">
        <span className="font-mono text-xs text-[color:var(--text-faint)]">{filename ?? "scratch.xs"}</span>
        <div className="flex items-center gap-3">
          <CopyButton text={code} />
          <button
            onClick={handleReset}
            disabled={!edited}
            className="font-mono text-[11px] uppercase tracking-[0.06em] text-[color:var(--text-faint)] hover:text-[color:var(--link)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-[color:var(--text-faint)]"
          >
            reset
          </button>
          <button
            onClick={handleRun}
            disabled={state === "running"}
            className={`font-mono text-[11px] uppercase tracking-[0.06em] font-medium text-[color:var(--link)] hover:text-[color:var(--link-hover)] transition-colors disabled:opacity-50 ${runFlash ? "run-flash" : ""}`}
          >
            {state === "running" ? (
              <span>running<span className="running-dot">...</span></span>
            ) : "run"}
          </button>
        </div>
      </div>
      <div className="relative overflow-x-auto runnable-editor">
        <pre
          className="pointer-events-none absolute inset-0 px-[18px] py-4 text-[color:var(--text)]"
          aria-hidden="true"
          style={editorTextStyle}
        >
          <code style={editorTextStyle}><Highlighted code={code} /></code>
        </pre>
        <textarea
          ref={textareaRef}
          defaultValue={original}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          rows={Math.max(lines + 1, 3)}
          className="relative block w-full resize-y border-none bg-transparent px-[18px] py-4 outline-none"
          style={{
            ...editorTextStyle,
            color: "transparent",
            WebkitTextFillColor: "transparent",
            caretColor: "var(--link)",
          }}
        />
      </div>
      {(state === "running" || state === "done") && (
        <pre
          className={`output-slide border-t border-[color:var(--rule)] px-4 py-3 font-mono text-[13px] leading-[1.65] whitespace-pre-wrap ${
            error ? "text-[color:var(--kw)]" : "text-[color:var(--text-muted)]"
          }`}
          style={{ maxHeight: 200, overflowY: "auto" }}
        >
          {output || (state === "running" ? "" : "(no output)")}
        </pre>
      )}
    </div>
  );
}
