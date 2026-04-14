import { CodeBlock } from "@/components/code-block";
import Link from "next/link";
import {
  CircleMark,
  UnderlineMark,
  ArrowMark,
  StarMark,
  BracketMark,
} from "@/components/sketch-marks";

const heroCode = `-- pattern matching
fn describe(value) {
  match value {
    0          => "zero"
    n if n > 0 => "positive: {n}"
    _          => "negative"
  }
}

-- algebraic effects
effect Log {
  fn log(msg)
}

fn greet(name) {
  perform Log.log("hello, {name}!")
}

handle greet("world") {
  Log.log(msg) => {
    println(msg)
    resume(null)
  }
}`;

const features = [
  ["Gradual typing", "Start untyped. Add types where they earn their keep. The type checker stays out of your way until you ask."],
  ["Algebraic effects", "First-class effects for errors, async, logging, and more. Composable. Resumable. Worth the curve."],
  ["Pattern matching", "Deep structural matching on tuples, arrays, structs, enums, and maps with guards, ranges, and regex."],
  ["Zero dependencies", "The compiler is pure C. No LLVM, no runtime, no version drift. Builds in seconds."],
  ["Fast startup", "~4 ms to spin up a script. Beats Node and Python for small CLI tools. The VM is roughly on par with CPython for compute."],
  ["Full concurrency", "Spawn, async/await, actors, channels, nurseries. Pick the model that fits the problem in front of you."],
  ["Multi-target", "One source, native C, JavaScript, WebAssembly, plus iOS / Android / ESP32 cross-compile targets out of the box."],
  ["Reactive bindings", "Variables that auto-update with their dependencies. Add contracts to enforce invariants at runtime."],
  ["Plugin system", "Plugins are XS scripts with direct access to the lexer, parser, and runtime. Add keywords, hook evaluation, override syntax."],
  ["Concurrent GC", "Generational refcount with cycle detection; XS_GC_CONCURRENT moves the sweep onto a worker thread so pause time stays bounded."],
  ["Procedural macros", "@[macro] markers turn ordinary functions into compile-time macros, with reflection-driven derive helpers as worked examples."],
  ["Scoped data", "@scoped lets a binding skip the GC when escape analysis proves it can't outlive its block. Systems-programming subset, no syntax tax."],
];

const tooling = [
  "bytecode VM with JIT compiler",
  "LSP with completions and diagnostics",
  "DAP debugger for any editor",
  "built-in formatter and linter",
  "test runner with coverage",
  "first-party VSCode extension",
  "plugin system for extensions",
  "package registry via xsi",
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8">
      {/* HERO */}
      <section className="pt-16 pb-20 lg:pt-24 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-7">
            <h1 className="text-[clamp(2.4rem,5.4vw,3.8rem)] font-bold tracking-tight leading-[1.05]">
              <span className="relative inline-block">
                One
                <CircleMark className="absolute -inset-3 w-[calc(100%+1.5rem)] h-[calc(100%+1.5rem)] text-accent pointer-events-none" />
              </span>{" "}
              language for{" "}
              <span className="relative inline-block">
                scripts, servers, browsers, and mobile.
                <UnderlineMark className="absolute -bottom-1 left-0 w-full h-2 text-accent" />
              </span>
            </h1>

            <p className="mt-7 text-lg leading-relaxed text-ink/75 max-w-2xl">
              Why XS instead of Python or Node? <strong>Faster startup, a real type system when you want one, and the same code runs natively, in the VM, or in your browser.</strong> Pre-1.0: see the <Link href="/docs/status" className="underline">status page</Link> for what&rsquo;s solid and what still has sharp edges.
            </p>

            {/* install line */}
            <div className="mt-8 relative inline-flex items-center max-w-full">
              <div className="absolute -left-12 -top-3 hidden lg:block">
                <ArrowMark className="w-12 h-12 text-accent" />
              </div>
              <div className="font-mono text-sm bg-soft border-[1.5px] border-rule px-4 py-2.5 select-all">
                <span className="text-accent font-medium">$</span>{" "}
                <span className="text-ink">curl -fsSL https://xslang.org/install | sh</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-7">
              <Link href="/docs" className="btn-solid">
                Get started <span aria-hidden>→</span>
              </Link>
              <Link href="/playground" className="btn-line">
                Try it in the browser
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 min-w-0 mt-2">
            <CodeBlock code={heroCode} runnable filename="hello.xs" />
          </div>
        </div>
      </section>

      {/* TARGETS DIAGRAM */}
      <section className="py-12 border-t-[1.5px] border-rule">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Write once<span className="text-accent">.</span>
              <br />
              Ship anywhere.
            </h2>
            <p className="mt-3 text-ink/70 leading-relaxed">
              The XS compiler emits idiomatic output for three different runtimes from the same source.
            </p>
          </div>

          <div className="md:col-span-8">
            <TargetsDiagram />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 border-t-[1.5px] border-rule">
        <div className="flex items-baseline gap-4 mb-10">
          <h2 className="text-3xl font-bold tracking-tight">What you get</h2>
          <StarMark className="w-5 h-5 text-accent" />
        </div>
        <ul className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
          {features.map(([title, desc]) => (
            <li key={title} className="flex gap-4">
              <span className="font-mono text-sm text-accent pt-1.5 select-none">→</span>
              <div>
                <h3 className="font-bold text-lg mb-1.5 text-ink">{title}</h3>
                <p className="text-sm text-ink/70 leading-relaxed">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* TOOLING */}
      <section className="py-16 border-t-[1.5px] border-rule">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <h2 className="text-3xl font-bold tracking-tight">
              Toolchain in one binary.
            </h2>
            <p className="mt-3 text-ink/70 leading-relaxed">
              No LSP server to wire up separately. No formatter to install. No debugger to configure. Everything ships with the compiler.
            </p>
          </div>
          <div className="md:col-span-7">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              {tooling.map((item) => (
                <li key={item} className="py-2.5 border-b border-rule/15 text-ink/85 flex items-baseline gap-3">
                  <span className="text-accent font-bold">·</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CONCURRENCY */}
      <section className="py-16 border-t-[1.5px] border-rule">
        <div className="relative">
          <h2 className="text-3xl font-bold tracking-tight inline-block relative">
            Concurrency that
            <span className="text-accent"> fits the problem</span>.
          </h2>
        </div>
        <p className="mt-3 text-ink/70 leading-relaxed max-w-2xl">
          Lightweight tasks. Channels. Actors. Nurseries. Pick whichever shape suits the work.
        </p>

        <div className="mt-10 grid lg:grid-cols-2 gap-6">
          <CodeBlock
            filename="channels.xs"
            runnable
            code={`let ch = channel()

spawn {
  for i in 0..10 {
    ch.send(i)
  }
}

for i in 0..10 {
  println(ch.recv())
}`}
          />
          <CodeBlock
            filename="actors.xs"
            runnable
            code={`actor Counter {
  var count = 0

  fn increment() {
    count = count + 1
  }

  fn get() { return count }
}

let c = spawn Counter
c.increment()
c.increment()
println(c.get())`}
          />
        </div>
      </section>

      {/* INSTALL */}
      <section className="py-16 border-t-[1.5px] border-rule">
        <h2 className="text-3xl font-bold tracking-tight">Install it.</h2>
        <p className="mt-3 text-ink/70 leading-relaxed max-w-2xl">
          One binary on every platform. No runtime to install separately. Manage packages with the built-in installer.
        </p>

        <div className="mt-10 grid lg:grid-cols-2 gap-8">
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-ink/55 mb-2">a / toolchain</div>
            <CodeBlock
              code={`# linux / macos
curl -fsSL https://xslang.org/install | sh

# windows (powershell)
irm https://xslang.org/install.ps1 | iex

# build from source
git clone https://github.com/xs-lang0/xs
cd xs && make && make install`}
            />
          </div>
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-ink/55 mb-2">b / packages</div>
            <CodeBlock
              code={`# install a package
xsi get json-utils

# use it
use "json-utils"
let data = json.parse('{"name": "xs"}')
println(data.name)

# search the registry
xsi search http`}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t-[1.5px] border-rule">
        <div className="flex items-start gap-6">
          <BracketMark className="w-6 h-32 text-accent shrink-0 mt-2" side="left" />
          <div className="flex-1">
            <h2 className="text-[clamp(2.2rem,5vw,3.6rem)] font-bold tracking-tight leading-[1.05]">
              Open source.
              <br />
              Apache-2.0.
              <br />
              <span className="text-accent">Actively developed.</span>
            </h2>
            <p className="mt-5 text-ink/70 max-w-xl">
              XS is open source and built in the open.
            </p>
            <div className="flex flex-wrap gap-3 mt-7">
              <Link href="/docs" className="btn-solid">
                Read the docs <span aria-hidden>→</span>
              </Link>
              <a href="https://github.com/xs-lang0/xs" target="_blank" rel="noopener noreferrer" className="btn-line">
                View on GitHub
              </a>
            </div>
          </div>
          <BracketMark className="w-6 h-32 text-accent shrink-0 mt-2" side="right" />
        </div>
      </section>
    </div>
  );
}

function TargetsDiagram() {
  return (
    <svg viewBox="0 0 600 200" className="w-full h-auto" aria-label="XS compiles to C, JavaScript, and WebAssembly">
      {/* SOURCE node */}
      <g>
        <rect
          x="30" y="80" width="120" height="50"
          fill="#fdfbf4"
          stroke="#1a1815"
          strokeWidth="1.8"
        />
        <text x="90" y="110" textAnchor="middle" fontFamily="var(--font-jetbrains), monospace" fontSize="14" fill="#1a1815" fontWeight="500">
          hello.xs
        </text>
      </g>

      {/* arrows fan out */}
      <g stroke="#ff6b00" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* to C */}
        <path d="M150 95 Q 250 60, 360 50" />
        <path d="M353 44 L 363 50 L 354 56" />
        {/* to JS */}
        <path d="M150 105 Q 250 105, 360 105" />
        <path d="M353 99 L 363 105 L 354 111" />
        {/* to Wasm */}
        <path d="M150 115 Q 250 150, 360 162" />
        <path d="M353 156 L 363 162 L 354 168" />
      </g>

      {/* target nodes */}
      <g>
        <rect x="370" y="30" width="180" height="40" fill="#fdfbf4" stroke="#1a1815" strokeWidth="1.5" />
        <text x="385" y="55" fontFamily="var(--font-hanken), sans-serif" fontSize="14" fontWeight="600" fill="#1a1815">
          native C
        </text>
        <text x="540" y="55" textAnchor="end" fontFamily="var(--font-jetbrains), monospace" fontSize="11" fill="#6c655a">
          .c
        </text>

        <rect x="370" y="85" width="180" height="40" fill="#fdfbf4" stroke="#1a1815" strokeWidth="1.5" />
        <text x="385" y="110" fontFamily="var(--font-hanken), sans-serif" fontSize="14" fontWeight="600" fill="#1a1815">
          JavaScript
        </text>
        <text x="540" y="110" textAnchor="end" fontFamily="var(--font-jetbrains), monospace" fontSize="11" fill="#6c655a">
          .js
        </text>

        <rect x="370" y="142" width="180" height="40" fill="#fdfbf4" stroke="#1a1815" strokeWidth="1.5" />
        <text x="385" y="167" fontFamily="var(--font-hanken), sans-serif" fontSize="14" fontWeight="600" fill="#1a1815">
          WebAssembly
        </text>
        <text x="540" y="167" textAnchor="end" fontFamily="var(--font-jetbrains), monospace" fontSize="11" fill="#6c655a">
          .wasm
        </text>
      </g>

      {/* tiny scribble next to source */}
      <g stroke="#ff6b00" strokeWidth="1.4" fill="none" strokeLinecap="round">
        <path d="M55 55 Q 65 50, 75 56 Q 80 62, 70 67" />
        <path d="M68 65 L 72 70 L 65 71" />
      </g>
    </svg>
  );
}
