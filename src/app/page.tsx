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
  { title: "gradual typing", desc: "Start untyped, add types where they matter. The type system stays out of your way until you need it." },
  { title: "algebraic effects", desc: "First-class effects for error handling, async, logging. Composable and resumable." },
  { title: "pattern matching", desc: "Deep structural matching with guards, destructuring, ranges, regex, and exhaustiveness checking." },
  { title: "zero dependencies", desc: "The compiler is pure C. No LLVM, no runtime bloat. Builds in seconds." },
  { title: "multi-target", desc: "Transpile to C, JavaScript, or WebAssembly from a single codebase." },
  { title: "full concurrency", desc: "Spawn, async/await, actors, channels, nurseries. Pick the model that fits." },
  { title: "package registry", desc: "Install packages with xsi, publish your own, browse at reg.xslang.org." },
  { title: "reactive bindings", desc: "Variables that auto-update when dependencies change. Add contracts to enforce invariants." },
];

const tooling = [
  "bytecode VM + JIT compiler",
  "LSP with completions and diagnostics",
  "DAP debugger",
  "formatter and linter",
  "test runner",
  "VSCode extension",
  "plugin system",
  "package registry (xsi)",
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* hero */}
      <section className="grid gap-10 pt-16 pb-20 lg:pt-24 lg:pb-28 md:grid-cols-12 md:gap-10 fade-in">
        <div className="md:col-span-7 flex flex-col gap-6">
          <div className="label">-- the language</div>
          <h1 className="text-[clamp(2.4rem,5.4vw,4rem)] font-semibold tracking-tight leading-[1.02] text-foreground">
            One language for{" "}
            <span className="text-accent">scripts, servers, and the&nbsp;browser.</span>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-foreground/70">
            XS is a fast, expressive language with gradual typing, algebraic effects, and a strong toolchain. Written in C with no dependencies.
          </p>

          <div className="flex items-center gap-2 font-mono text-sm border border-border bg-surface px-3 py-2.5 max-w-fit">
            <span className="text-accent">$</span>
            <span className="text-foreground/85">curl -fsSL https://xslang.org/install | sh</span>
          </div>

          <div className="flex flex-wrap gap-3 mt-1">
            <Link
              href="/docs"
              className="inline-flex items-center gap-1.5 bg-accent text-background px-4 py-2 text-sm font-medium hover:bg-foreground transition-colors"
            >
              get started <span aria-hidden>→</span>
            </Link>
            <Link
              href="/playground"
              className="inline-flex items-center gap-1.5 border border-border-2 px-4 py-2 text-sm font-medium text-foreground hover:border-accent hover:text-accent transition-colors"
            >
              try in browser
            </Link>
          </div>
        </div>

        <div className="md:col-span-5 min-w-0">
          <CodeBlock code={heroCode} runnable filename="hello.xs" />
        </div>
      </section>

      <SectionDivider label="features" />
      <section className="py-16">
        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <article key={f.title}>
              <h3 className="text-base font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed text-foreground/65">{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <SectionDivider label="tooling" />
      <section className="py-16">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <h2 className="text-2xl font-semibold text-foreground mb-3 tracking-tight">
              The tooling comes built in.
            </h2>
            <p className="text-foreground/70 leading-relaxed">
              No third-party toolchain to wire up. No version drift between editor, runtime, and CI.
            </p>
          </div>
          <ul className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 self-center">
            {tooling.map((item) => (
              <li key={item} className="flex items-center gap-3 py-2 border-b border-border text-sm text-foreground/85">
                <span className="text-accent font-mono">→</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <SectionDivider label="install" />
      <section className="py-16">
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-foreground mb-3">Install the toolchain</h3>
            <p className="text-foreground/70 mb-4 text-sm leading-relaxed">
              One binary on every desk. No runtime to install separately.
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
            <h3 className="font-semibold text-foreground mb-3">Install a package</h3>
            <p className="text-foreground/70 mb-4 text-sm leading-relaxed">
              Use xsi to fetch from <a href="https://reg.xslang.org" className="text-accent hover:underline">reg.xslang.org</a>.
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

      <SectionDivider label="concurrency" />
      <section className="py-16">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <h2 className="text-2xl font-semibold text-foreground mb-3 tracking-tight">
              Concurrency that makes sense.
            </h2>
            <p className="text-foreground/70 leading-relaxed text-sm">
              Spawn lightweight tasks. Send messages over channels. Model state with actors. Pick the shape, keep the speed.
            </p>
          </div>
          <div className="lg:col-span-8 grid md:grid-cols-2 gap-6">
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
        </div>
      </section>

      <SectionDivider label="get started" />
      <section className="py-20 text-center">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground mb-3">
          Ready to try it?
        </h2>
        <p className="text-foreground/70 mb-8">
          XS is open source and actively developed.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/docs"
            className="inline-flex items-center gap-1.5 bg-accent text-background px-5 py-2.5 text-sm font-medium hover:bg-foreground transition-colors"
          >
            read the docs <span aria-hidden>→</span>
          </Link>
          <a
            href="https://github.com/xs-lang0/xs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 border border-border-2 px-5 py-2.5 text-sm font-medium text-foreground hover:border-accent hover:text-accent transition-colors"
          >
            view on github
          </a>
        </div>
      </section>
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 border-t border-border pt-3">
      <span className="label-accent">-- {label}</span>
    </div>
  );
}
