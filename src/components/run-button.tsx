"use client";

import { useState, useRef } from "react";

const TIMEOUT_MS = 5000;

function runXS(code: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([`
      self.onmessage = async function(e) {
        const { code, baseUrl } = e.data;
        try {
          importScripts(baseUrl + "/xs.js");
          const lines = [];
          const xs = await loadXS({
            wasmUrl: baseUrl + "/xs.wasm",
            stdout: (line) => lines.push(line),
            stderr: (line) => lines.push(line),
          });
          await xs.run(code);
          self.postMessage({ ok: true, output: lines.join("\\n") });
        } catch (err) {
          self.postMessage({ ok: false, output: String(err) });
        }
      };
    `], { type: "application/javascript" });

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

    worker.postMessage({ code, baseUrl: "https://static.xslang.org" });
  });
}

export function RunButton({ code }: { code: string }) {
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [output, setOutput] = useState("");
  const [error, setError] = useState(false);
  const outputRef = useRef<HTMLPreElement>(null);

  const handleRun = async () => {
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
  };

  return (
    <>
      <button
        onClick={handleRun}
        disabled={state === "running"}
        className="absolute right-14 top-2 rounded px-1.5 py-0.5 text-xs text-accent transition-colors hover:text-foreground disabled:opacity-50"
      >
        {state === "running" ? "running..." : "run"}
      </button>
      {state === "done" && (
        <pre
          ref={outputRef}
          className={`border-t border-border px-4 py-3 text-sm leading-relaxed ${
            error ? "text-red-400" : "text-muted"
          }`}
          style={{ maxHeight: 200, overflowY: "auto" }}
        >
          {output || "(no output)"}
        </pre>
      )}
    </>
  );
}
