"use client";

import { useState } from "react";

const samples: Record<string, string> = {
  "Hello world": `fn main() {
  println("hello, world")
}`,
  "Pattern matching": `enum Color {
  Red,
  Green,
  Blue,
  Custom(r, g, b)
}

fn to_hex(c) {
  match c {
    Color::Red             => "#ff0000"
    Color::Green           => "#00ff00"
    Color::Blue            => "#0000ff"
    Color::Custom(r, g, b) => "#{r:02x}{g:02x}{b:02x}"
  }
}

fn main() {
  let colors = [Color::Red, Color::Green, Color::Custom(255, 128, 0)]
  for c in colors {
    println(to_hex(c))
  }
}`,
  "Effects": `effect Logger {
  fn log(level, msg)
}

fn process(items) {
  for item in items {
    perform Logger.log("info", "processing: {item}")
  }
}

fn main() {
  handle {
    process(["a", "b", "c"])
  } {
    Logger.log(level, msg) => {
      println("[{level}] {msg}")
      resume(null)
    }
  }
}`,
  "Generators": `fn* range_step(start, stop, step) {
  var i = start
  while i < stop {
    yield i
    i = i + step
  }
}

fn main() {
  for n in range_step(0, 20, 3) {
    println(n)
  }
}`,
  "Structs": `struct Vec2 { x, y }

impl Vec2 {
  static fn new(x, y) {
    return Vec2 { x: x, y: y }
  }

  fn +(self, other) {
    return Vec2 { x: self.x + other.x, y: self.y + other.y }
  }

  fn magnitude(self) {
    return sqrt(self.x * self.x + self.y * self.y)
  }
}

fn main() {
  let a = Vec2.new(3.0, 4.0)
  let b = Vec2.new(1.0, 2.0)
  let c = a + b
  println("magnitude: {c.magnitude()}")
}`,
};

export default function PlaygroundPage() {
  const [selected, setSelected] = useState("Hello world");
  const [code, setCode] = useState(samples["Hello world"]);
  const [output, setOutput] = useState("");

  function handleRun() {
    setOutput("-- playground is not yet connected to a backend\n-- this is a preview of the editor experience");
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
            className="rounded-md bg-accent-dim px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent"
          >
            Run
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
          />
        </div>

        <div className="flex w-80 flex-col overflow-hidden rounded-lg border border-border">
          <div className="border-b border-border px-4 py-2 text-xs text-muted">
            output
          </div>
          <pre className="flex-1 overflow-auto bg-surface p-4 font-mono text-sm leading-relaxed text-muted">
            {output || "-- click Run to execute"}
          </pre>
        </div>
      </div>
    </div>
  );
}
