"use client";

import { useState } from "react";

const samples: Record<string, string> = {
  "Hello world": `fn main() {
  println("hello, world!")
}`,
  "Pattern matching": `fn describe(value) {
  match value {
    0          => "zero"
    n if n > 0 => "positive: " + str(n)
    _          => "negative"
  }
}

fn main() {
  println(describe(0))
  println(describe(42))
  println(describe(-7))
}`,
  "Classes": `class Animal {
  fn new(name, sound) {
    self.name = name
    self.sound = sound
  }
  fn speak(self) {
    println(self.name + " says " + self.sound)
  }
}

fn main() {
  let dog = Animal("Rex", "woof")
  let cat = Animal("Milo", "meow")
  dog.speak()
  cat.speak()
}`,
  "Closures": `fn make_counter(start) {
  var n = start
  return fn() {
    n = n + 1
    return n
  }
}

fn main() {
  let count = make_counter(0)
  println(count())
  println(count())
  println(count())
}`,
  "Error handling": `fn safe_divide(a, b) {
  try {
    if b == 0 {
      throw "cannot divide by zero"
    }
    return a / b
  } catch e {
    println("error: " + e)
    return 0
  }
}

fn main() {
  println(safe_divide(10, 3))
  println(safe_divide(10, 0))
}`,
  "FizzBuzz": `fn main() {
  for i in 1..=20 {
    match 0 {
      _ if i % 15 == 0 => println("FizzBuzz")
      _ if i % 3 == 0  => println("Fizz")
      _ if i % 5 == 0  => println("Buzz")
      _                 => println(str(i))
    }
  }
}`,
};

function runJS(js: string): string {
  const lines: string[] = [];

  const sandbox = {
    console: {
      log: (...args: unknown[]) => {
        lines.push(args.map((a) => {
          if (a === null || a === undefined) return String(a);
          if (typeof a === "object") {
            try { return JSON.stringify(a); } catch { return String(a); }
          }
          return String(a);
        }).join(" "));
      },
    },
    Math,
    Array,
    Object,
    String,
    Number,
    JSON,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    prompt: () => "",
    Error,
  };

  const keys = Object.keys(sandbox);
  const vals = Object.values(sandbox);

  try {
    const fn = new Function(...keys, js);
    fn(...vals);
  } catch (e: unknown) {
    if (e instanceof Error) {
      lines.push("error: " + e.message);
    } else {
      lines.push("error: " + String(e));
    }
  }

  return lines.join("\n");
}

export default function PlaygroundPage() {
  const [selected, setSelected] = useState("Hello world");
  const [code, setCode] = useState(samples["Hello world"]);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);

  async function handleRun() {
    setOutput("transpiling...");
    setRunning(true);

    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (data.error) {
        setOutput("error: " + data.error);
        return;
      }

      const result = runJS(data.js);
      setOutput(result || "(no output)");
    } catch {
      setOutput("error: could not connect to server");
    } finally {
      setRunning(false);
    }
  }

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
            disabled={running}
            className="rounded-md bg-accent-dim px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent disabled:opacity-50"
          >
            {running ? "Running..." : "Run"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border">
          <div className="border-b border-border px-4 py-2 text-xs text-muted">
            main.xs
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
              // tab inserts 2 spaces
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
    </div>
  );
}
