"use client";

import { useState, useRef, useEffect, useCallback } from "react";

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
};

type XSModule = {
  callMain: (args: string[]) => void;
  FS: {
    writeFile: (path: string, data: string) => void;
  };
};

export default function PlaygroundPage() {
  const [selected, setSelected] = useState("Hello world");
  const [code, setCode] = useState(samples["Hello world"]);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const xsRef = useRef<XSModule | null>(null);

  useEffect(() => {
    // load WASM module
    const script = document.createElement("script");
    script.src = "/xs_wasm.js";
    script.onload = async () => {
      try {
        // @ts-expect-error - createXS is loaded by script
        const mod = await window.createXS({
          print: () => {},
          printErr: () => {},
          locateFile: (path: string) => path === "xs_wasm.wasm" ? "/xs_wasm.wasm" : "/" + path,
        });
        xsRef.current = mod;
        setLoading(false);
      } catch {
        setOutput("error: could not load XS runtime");
        setLoading(false);
      }
    };
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, []);

  const handleRun = useCallback(async () => {
    if (!xsRef.current || running) return;
    setRunning(true);

    const lines: string[] = [];

    try {
      // re-create module for clean state
      // @ts-expect-error - createXS from loaded script
      const xs = await window.createXS({
        print: (text: string) => lines.push(text),
        printErr: (text: string) => lines.push(text),
        locateFile: (path: string) => path === "xs_wasm.wasm" ? "/xs_wasm.wasm" : "/" + path,
      });

      xs.FS.writeFile("/playground.xs", code);

      try {
        xs.callMain(["/playground.xs"]);
      } catch (e: unknown) {
        if (e instanceof Error && !e.message.includes("exit")) {
          lines.push("error: " + e.message);
        }
      }

      setOutput(lines.join("\n") || "(no output)");
    } catch {
      setOutput("error: runtime crashed, try again");
    } finally {
      setRunning(false);
    }
  }, [code, running]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 h-[calc(100vh-7rem)]">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Playground</h1>
        <div className="flex items-center gap-3">
          <select
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value);
              setCode(samples[e.target.value]);
              setOutput("");
            }}
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground outline-none"
          >
            {Object.keys(samples).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <button
            onClick={handleRun}
            disabled={running || loading}
            className="rounded-md bg-accent-dim px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent disabled:opacity-50"
          >
            {loading ? "Loading..." : running ? "Running..." : "Run"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border">
          <div className="border-b border-border px-4 py-2 text-xs text-muted">
            playground.xs
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 resize-none bg-surface p-4 font-mono text-sm leading-relaxed text-foreground outline-none"
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

        <div className="flex w-80 flex-col overflow-hidden rounded-lg border border-border">
          <div className="border-b border-border px-4 py-2 text-xs text-muted">
            output
          </div>
          <pre className="flex-1 overflow-auto bg-surface p-4 font-mono text-sm leading-relaxed text-muted whitespace-pre-wrap">
            {output || "-- press Ctrl+Enter or click Run"}
          </pre>
        </div>
      </div>

      <div className="text-xs text-muted space-y-1">
        <p>
          The playground runs the real XS interpreter compiled to WebAssembly.
          Most features work exactly like the native binary.
        </p>
        <p>
          <span className="text-foreground">Not available here:</span>{" "}
          networking (http, sockets), file system access, native plugins (.so/.dll),
          JIT compilation, REPL, LSP/DAP, and profiler timing.
          The <code className="text-foreground">input()</code> function is also disabled.
        </p>
      </div>
    </div>
  );
}
