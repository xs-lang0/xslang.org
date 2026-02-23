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
};

type XS = {
  run: (code: string) => Promise<string>;
  exec: (args: string[]) => Promise<number>;
  writeFile: (path: string, content: string) => void;
};

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

export default function PlaygroundPage() {
  const [selected, setSelected] = useState("Hello world");
  const [code, setCode] = useState(samples["Hello world"]);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [splitPercent, setSplitPercent] = useState(60);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const xsRef = useRef<XS | null>(null);

  const highlighted = useMemo(() => highlightXS(code), [code]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/xs.js";
    script.onload = async () => {
      try {
        // @ts-expect-error - loadXS from loaded script
        const runtime = await window.loadXS();
        xsRef.current = runtime;
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
    try {
      const result = await xsRef.current.run(code);
      setOutput(result || "(no output)");
    } catch {
      setOutput("error: runtime crashed, try again");
    } finally {
      setRunning(false);
    }
  }, [code, running]);

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
      // detect if mobile (stacked) or desktop (side-by-side)
      const isVertical = rect.width < 768;
      let pct: number;
      if (isVertical) {
        pct = ((e.clientY - rect.top) / rect.height) * 100;
      } else {
        pct = ((e.clientX - rect.left) / rect.width) * 100;
      }
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
      let pct: number;
      if (isVertical) {
        pct = ((e.touches[0].clientY - rect.top) / rect.height) * 100;
      } else {
        pct = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
      }
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

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 sm:px-6 py-6 sm:py-8 h-[calc(100vh-7rem)]">
      {/* toolbar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight">Playground</h1>
        <div className="flex items-center gap-2 sm:gap-3">
          <select
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value);
              setCode(samples[e.target.value]);
              setOutput("");
            }}
            className="rounded-md border border-border bg-surface px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-foreground outline-none"
          >
            {Object.keys(samples).map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <button
            onClick={handleRun}
            disabled={running || loading}
            className="rounded-md bg-accent-dim px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-accent disabled:opacity-50"
          >
            {loading ? "Loading..." : running ? "Running..." : "Run"}
          </button>
        </div>
      </div>

      {/* editor + output with resizable split */}
      {/* desktop: side-by-side, mobile: stacked */}
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
            playground.xs
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
              {/* highlighted layer (behind) */}
              <pre
                ref={highlightRef}
                className="absolute inset-0 pt-4 pb-4 pl-4 pr-4 font-mono text-sm leading-relaxed pointer-events-none overflow-hidden whitespace-pre-wrap break-words"
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: highlighted + "\n" }}
              />
              {/* textarea (on top, transparent text, visible caret) */}
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

      {/* restrictions note */}
      <div className="text-xs text-muted space-y-1 hidden sm:block">
        <p>
          Runs the real XS interpreter compiled to WebAssembly.{" "}
          <span className="text-foreground">Not available:</span>{" "}
          networking, file system, native plugins, JIT, REPL, LSP/DAP, profiler, input().
        </p>
      </div>
    </div>
  );
}
