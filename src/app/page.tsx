import { CodeBlock } from "@/components/code-block";
import Link from "next/link";

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
  { title: "Gradual typing", desc: "Start untyped, add types where they matter. The type system stays out of your way until you need it." },
  { title: "Algebraic effects", desc: "First-class effects for error handling, async, logging, and more. Composable and resumable." },
  { title: "Pattern matching", desc: "Deep structural matching with guards, destructuring, ranges, regex, and exhaustiveness checking." },
  { title: "Zero dependencies", desc: "The compiler is pure C. No LLVM, no runtime bloat. Builds in seconds." },
  { title: "Multi-target", desc: "Transpile to C, JavaScript, or WebAssembly from a single codebase." },
  { title: "Full concurrency", desc: "Spawn, async/await, actors, channels, nurseries. Pick the model that fits." },
  { title: "Package registry", desc: "Install packages with xsi, publish your own, and browse everything at reg.xslang.org." },
  { title: "Reactive bindings", desc: "Variables that auto-update when dependencies change. Add contracts to enforce invariants at runtime." },
];

const tooling = [
  "Bytecode VM + JIT compiler",
  "LSP with completions and diagnostics",
  "DAP debugger",
  "Formatter and linter",
  "Test runner",
  "VSCode extension",
  "Plugin system",
  "Package registry (xsi)",
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* hero */}
      <section className="grid gap-10 pt-20 pb-20 md:grid-cols-2 md:gap-12 md:items-start">
        <div className="flex flex-col gap-5">
          <h1
            className="font-serif text-ink leading-[0.95]"
            style={{ fontSize: "clamp(2.6rem, 5.6vw, 4.2rem)", fontVariationSettings: '"opsz" 144, "SOFT" 70', letterSpacing: "-0.035em" }}
          >
            One language for{" "}
            <span className="text-accent italic" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 80, "WONK" 1' }}>
              scripts, servers, and the browser.
            </span>
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-ink/70">
            XS is a fast, expressive language with gradual typing, algebraic effects, and a strong toolchain. Written in C with no dependencies.
          </p>
          <div className="font-mono text-sm text-ink/60 border-y border-ink/15 py-2.5">
            <span className="text-accent">$</span> curl -fsSL https://xslang.org/install | sh
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
            >
              Get started <span aria-hidden>→</span>
            </Link>
            <Link
              href="/playground"
              className="inline-flex items-center border border-ink/30 px-5 py-2.5 text-sm font-medium text-ink hover:border-ink transition-colors"
            >
              Try it online
            </Link>
          </div>
        </div>
        <div className="min-w-0">
          <CodeBlock code={heroCode} runnable />
        </div>
      </section>

      {/* features */}
      <section className="border-t border-ink/15 py-20">
        <h2
          className="font-serif text-ink mb-12"
          style={{ fontSize: "clamp(1.8rem, 3.2vw, 2.4rem)", fontVariationSettings: '"opsz" 144, "SOFT" 50', letterSpacing: "-0.025em" }}
        >
          Features
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title}>
              <h3 className="font-serif text-lg text-ink mb-2" style={{ fontVariationSettings: '"opsz" 30, "SOFT" 50' }}>
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-ink/70">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* tooling */}
      <section className="border-t border-ink/15 py-20">
        <h2
          className="font-serif text-ink mb-3"
          style={{ fontSize: "clamp(1.8rem, 3.2vw, 2.4rem)", fontVariationSettings: '"opsz" 144, "SOFT" 50', letterSpacing: "-0.025em" }}
        >
          Tooling
        </h2>
        <p className="mb-8 text-ink/70">Everything you need, built in. No third-party toolchain required.</p>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tooling.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-ink/85">
              <span className="text-accent">→</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* install */}
      <section className="border-t border-ink/15 py-20">
        <h2
          className="font-serif text-ink mb-12"
          style={{ fontSize: "clamp(1.8rem, 3.2vw, 2.4rem)", fontVariationSettings: '"opsz" 144, "SOFT" 50', letterSpacing: "-0.025em" }}
        >
          Works everywhere
        </h2>
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-ink/70">
              Install on any platform with a single command. No dependencies, no runtime, no setup.
            </p>
            <CodeBlock
              code={`# linux / macos
curl -fsSL https://xslang.org/install | sh

# windows (powershell)
irm https://xslang.org/install.ps1 | iex

# or build from source
git clone https://github.com/xs-lang0/xs
cd xs && make && make install`}
            />
          </div>
          <div>
            <p className="mb-4 text-ink/70">
              Manage packages with the built-in installer. Browse the registry at reg.xslang.org.
            </p>
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

      {/* concurrency */}
      <section className="border-t border-ink/15 py-20">
        <h2
          className="font-serif text-ink mb-12"
          style={{ fontSize: "clamp(1.8rem, 3.2vw, 2.4rem)", fontVariationSettings: '"opsz" 144, "SOFT" 50', letterSpacing: "-0.025em" }}
        >
          Concurrency that makes sense
        </h2>
        <div className="grid gap-8 lg:grid-cols-2">
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
println(c.get())  -- 2`}
          />
        </div>
      </section>

      {/* cta */}
      <section className="border-t border-ink/15 py-20 text-center">
        <h2
          className="font-serif text-ink mb-4"
          style={{ fontSize: "clamp(1.8rem, 3.2vw, 2.4rem)", fontVariationSettings: '"opsz" 144, "SOFT" 50', letterSpacing: "-0.025em" }}
        >
          Ready to try it?
        </h2>
        <p className="mb-8 text-ink/70">XS is open source and actively developed.</p>
        <div className="flex justify-center gap-3">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
          >
            Read the docs <span aria-hidden>→</span>
          </Link>
          <a
            href="https://github.com/xs-lang0/xs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center border border-ink/30 px-5 py-2.5 text-sm font-medium text-ink hover:border-ink transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </section>
    </div>
  );
}
