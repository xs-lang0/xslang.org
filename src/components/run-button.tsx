"use client";

import { useState, useRef, useCallback } from "react";

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

async function runXS(code: string): Promise<string> {
  const xsScript = await getXSScript();

  return new Promise((resolve, reject) => {
    const workerCode = xsScript + "\n;" + `
      self.onmessage = async function(e) {
        try {
          const lines = [];
          const xs = await loadXS({
            wasmUrl: "${BASE_URL}/xs.wasm",
            stdout: (line) => lines.push(line),
            stderr: (line) => lines.push(line),
          });
          await xs.run(e.data);
          self.postMessage({ ok: true, output: lines.join("\\n") });
        } catch (err) {
          self.postMessage({ ok: false, output: String(err) });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: "application/javascript" });
    const worker = new Worker(URL.createObjectURL(blob));

    const timer = setTimeout(() => {
      worker.terminate();
      resolve("(timed out after " + (TIMEOUT_MS / 1000) + "s)");
    }, TIMEOUT_MS);

    worker.onmessage = (e) => {
      clearTimeout(timer);
      worker.terminate();
      if (e.data.ok) {
        resolve(e.data.output);
      } else {
        reject(new Error(e.data.output));
      }
    };

    worker.onerror = (e) => {
      clearTimeout(timer);
      worker.terminate();
      reject(new Error(String(e.message)));
    };

    worker.postMessage(code);
  });
}

export function RunnableBlock({ code: original }: { code: string }) {
  const [code, setCode] = useState(original);
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [output, setOutput] = useState("");
  const [error, setError] = useState(false);
  const [edited, setEdited] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleRun = useCallback(async () => {
    setState("running");
    setError(false);
    try {
      const result = await runXS(code);
      const timedOut = result.startsWith("(timed out");
      setOutput(result);
      setError(timedOut);
      setState("done");
    } catch (e) {
      setOutput(String(e));
      setError(true);
      setState("done");
    }
  }, [code]);

  const handleReset = useCallback(() => {
    setCode(original);
    setEdited(false);
    setOutput("");
    setState("idle");
    if (textareaRef.current) {
      textareaRef.current.value = original;
    }
  }, [original]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
    setEdited(e.target.value !== original);
  }, [original]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      ta.value = ta.value.substring(0, start) + "  " + ta.value.substring(end);
      ta.selectionStart = ta.selectionEnd = start + 2;
      setCode(ta.value);
      setEdited(ta.value !== original);
    }
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleRun();
    }
  }, [original, handleRun]);

  const lines = code.split("\n").length;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-end gap-2 border-b border-border px-3 py-1.5">
        {edited && (
          <button
            onClick={handleReset}
            className="rounded px-1.5 py-0.5 text-xs text-muted transition-colors hover:text-foreground"
          >
            reset
          </button>
        )}
        <button
          onClick={handleRun}
          disabled={state === "running"}
          className="rounded px-1.5 py-0.5 text-xs text-accent transition-colors hover:text-foreground disabled:opacity-50"
        >
          {state === "running" ? "running..." : "run"}
        </button>
      </div>
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
        className="block w-full resize-y border-none bg-transparent p-4 font-mono text-sm leading-relaxed text-foreground outline-none"
        style={{ tabSize: 2 }}
      />
      {state === "done" && (
        <pre
          className={`border-t border-border px-4 py-3 text-sm leading-relaxed ${
            error ? "text-red-400" : "text-muted"
          }`}
          style={{ maxHeight: 200, overflowY: "auto" }}
        >
          {output || "(no output)"}
        </pre>
      )}
    </div>
  );
}
