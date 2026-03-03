"use client";

import { useState, useRef } from "react";

let xsPromise: Promise<unknown> | null = null;

function getXS() {
  if (xsPromise) return xsPromise;
  xsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://static.xslang.org/xs.js";
    script.onload = () => {
      // @ts-expect-error loadXS is global from xs.js
      resolve(window.loadXS({ wasmUrl: "https://static.xslang.org/xs.wasm" }));
    };
    script.onerror = () => reject(new Error("failed to load xs.js"));
    document.head.appendChild(script);
  });
  return xsPromise;
}

async function runXS(code: string): Promise<string> {
  await getXS();
  // @ts-expect-error loadXS is global from xs.js
  const inst = await window.loadXS({
    wasmUrl: "https://static.xslang.org/xs.wasm",
  });
  const lines: string[] = [];
  // @ts-expect-error inst from loadXS
  const fresh = await window.loadXS({
    wasmUrl: "https://static.xslang.org/xs.wasm",
    stdout: (line: string) => lines.push(line),
    stderr: (line: string) => lines.push(line),
  });
  await fresh.run(code);
  return lines.join("\n");
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
      setOutput(result);
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
