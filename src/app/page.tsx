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
  {
    title: "Gradual typing",
    desc: "Start untyped, add types where they matter. The type system stays out of your way until you need it.",
  },
  {
    title: "Algebraic effects",
    desc: "First-class effects for error handling, async, logging, and more. Composable and resumable.",
  },
  {
    title: "Pattern matching",
    desc: "Deep structural matching with guards, destructuring, ranges, regex, and exhaustiveness checking.",
  },
  {
    title: "Zero dependencies",
    desc: "The compiler is pure C. No LLVM, no runtime bloat. Builds in seconds.",
  },
  {
    title: "Multi-target",
    desc: "Transpile to C, JavaScript, or WebAssembly from a single codebase.",
  },
  {
    title: "Full concurrency",
    desc: "Spawn, async/await, actors, channels, nurseries. Pick the model that fits.",
  },
  {
    title: "Package registry",
    desc: "Install packages with xsi, publish your own, and browse everything at reg.xslang.org.",
  },
  {
    title: "Reactive bindings",
    desc: "Variables that auto-update when dependencies change. Add contracts to enforce invariants at runtime.",
  },
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
    <div className="mx-auto max-w-5xl px-6">
      {/* hero */}
      <section className="flex flex-col gap-10 pt-[12rem] pb-24 md:flex-row md:items-start md:gap-12">
        <div className="flex flex-1 flex-col gap-5">
          <h1 className="text-4xl font-bold tracking-tight">
            One language for
            <br />
            <span className="text-accent">scripts, servers, and the browser.</span>
          </h1>
          <p className="max-w-md text-lg leading-relaxed text-muted">
            XS is a fast, expressive language with gradual typing, algebraic
            effects, and a strong toolchain. Written in C with no
            dependencies.
          </p>
          <div className="font-mono text-sm text-muted">
            <span className="text-accent">$</span> curl -fsSL https://xslang.org/install | sh
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/docs"
              className="rounded-md bg-accent-dim px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent"
            >
              Get started
            </Link>
            <Link
              href="/playground"
              className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-muted"
            >
              Try it online
            </Link>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <CodeBlock code={heroCode} filename="hello.xs" runnable />
        </div>
      </section>

      {/* features */}
      <section className="border-t border-border py-20">
        <h2 className="mb-12 text-2xl font-bold tracking-tight">Features</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title}>
              <h3 className="mb-2 font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* tooling */}
      <section className="border-t border-border py-20">
        <h2 className="mb-12 text-2xl font-bold tracking-tight">Tooling</h2>
        <p className="mb-6 text-muted">
          Everything you need, built in. No third-party toolchain required.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tooling.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm">
              <span className="text-accent">-</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* install */}
      <section className="border-t border-border py-20">
        <h2 className="mb-12 text-2xl font-bold tracking-tight">
          Works everywhere
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-muted">
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
            <p className="mb-4 text-muted">
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

      {/* concurrency preview */}
      <section className="border-t border-border py-20">
        <h2 className="mb-12 text-2xl font-bold tracking-tight">
          Concurrency that makes sense
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
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
      <section className="border-t border-border py-20 text-center">
        <h2 className="mb-4 text-2xl font-bold tracking-tight">
          Ready to try it?
        </h2>
        <p className="mb-8 text-muted">
          XS is open source and actively developed.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/docs"
            className="rounded-md bg-accent-dim px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent"
          >
            Read the docs
          </Link>
          <a
            href="https://github.com/xs-lang0/xs"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-muted"
          >
            View on GitHub
          </a>
        </div>
      </section>
    </div>
  );
}
