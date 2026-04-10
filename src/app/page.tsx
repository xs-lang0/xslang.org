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
  { n: "01", title: "Gradual typing", desc: "Start untyped, add types where they matter. The type system stays out of your way until you need it." },
  { n: "02", title: "Algebraic effects", desc: "First-class effects for error handling, async, logging. Composable and resumable." },
  { n: "03", title: "Pattern matching", desc: "Deep structural matching with guards, ranges, regex, and exhaustiveness checking." },
  { n: "04", title: "Zero dependencies", desc: "The compiler is pure C. No LLVM, no runtime bloat. Builds in seconds." },
  { n: "05", title: "Multi-target", desc: "Transpile to C, JavaScript, or WebAssembly from a single codebase." },
  { n: "06", title: "Full concurrency", desc: "Spawn, async/await, actors, channels, nurseries. Pick the model that fits." },
  { n: "07", title: "Package registry", desc: "Install with xsi, publish your own, browse at reg.xslang.org." },
  { n: "08", title: "Reactive bindings", desc: "Variables that auto-update with their dependencies. Add contracts at runtime." },
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
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 dotgrid opacity-60" />
        <div className="halo" style={{ width: 720, height: 720, top: -240, left: -180 }} />
        <div className="halo" style={{ width: 480, height: 480, top: 280, right: -120, opacity: 0.35 }} />

        <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10 pt-20 pb-28 lg:pt-28 lg:pb-32">
          <div className="grid grid-cols-12 gap-8 items-start">
            <div className="col-span-12 lg:col-span-7 fade-up">
              <div className="label-lime mb-5 flex items-center gap-2">
                <span className="pulse-dot" /> xs / v0.2.3 — april 2026
              </div>
              <h1
                className="font-display text-foreground"
                style={{ fontSize: "clamp(3rem, 8.5vw, 7rem)", lineHeight: 0.92, letterSpacing: "-0.04em" }}
              >
                one language.
                <br />
                <span className="text-accent">three targets.</span>
                <br />
                zero deps.
              </h1>
              <p className="mt-7 max-w-xl text-lg lg:text-xl leading-relaxed text-foreground/75">
                XS is a fast, expressive language with gradual typing, algebraic effects, and a strong toolchain. Compile to C, JavaScript, or WebAssembly from a single codebase.
              </p>

              <div className="mt-8 inline-flex items-center gap-3 font-mono text-sm border border-border-2 bg-surface px-4 py-3 select-all">
                <span className="text-accent">$</span>
                <span className="text-foreground/90">curl&nbsp;-fsSL&nbsp;https://xslang.org/install&nbsp;|&nbsp;sh</span>
                <span className="caret" />
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/docs" className="btn-lime">get started <span aria-hidden>→</span></Link>
                <Link href="/playground" className="btn-ghost">try in browser</Link>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-5 min-w-0 fade-up" style={{ animationDelay: "180ms" }}>
              <CodeBlock code={heroCode} runnable filename="hello.xs" />
            </div>
          </div>

          {/* metric strip */}
          <div className="relative mt-20 grid grid-cols-2 md:grid-cols-4 border-t-2 border-accent">
            {[
              ["~50kb", "compiler binary"],
              ["3", "compile targets"],
              ["0", "external deps"],
              ["~7s", "cold build"],
            ].map(([k, v], i) => (
              <div
                key={k}
                className={`px-5 py-7 ${i > 0 ? "border-l border-border" : ""}`}
              >
                <div className="font-display text-4xl lg:text-5xl text-foreground leading-none">{k}</div>
                <div className="label mt-3">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative mx-auto max-w-[1400px] px-6 lg:px-10 py-24">
        <SectionHead kicker="01 / what you get" title="Features" lead="Eight ideas that hold the language together." />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <article key={f.n} className="feat" data-n={f.n}>
              <div className="label-lime mb-4">{f.n}</div>
              <h3 className="font-display text-xl text-foreground mb-2 leading-tight">{f.title}</h3>
              <p className="text-sm leading-relaxed text-foreground/70 relative z-10">{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* TOOLING */}
      <section className="relative bg-surface border-y border-border">
        <div className="absolute inset-0 dotgrid opacity-40" />
        <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10 py-24">
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <SectionHead kicker="02 / batteries in" title="The whole toolchain. One binary." lead="No third-party setup. No version drift between editor, runtime, and CI. Everything ships together." compact />
            </div>
            <ul className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-0 self-center">
              {tooling.map((item, i) => (
                <li
                  key={item}
                  className="flex items-baseline gap-4 py-3.5 border-b border-border text-base text-foreground/85"
                >
                  <span className="font-mono text-xs text-accent w-8">{String(i + 1).padStart(2, "0")}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CONCURRENCY */}
      <section className="relative mx-auto max-w-[1400px] px-6 lg:px-10 py-24">
        <SectionHead kicker="03 / parallelism" title="Concurrency that holds up." lead="Lightweight tasks. Channels. Actors. Nurseries. Pick the shape, keep the speed." />
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
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
      <section className="relative bg-surface border-y border-border">
        <div className="absolute inset-0 dotgrid opacity-40" />
        <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10 py-24">
          <SectionHead kicker="04 / ship it" title="Works everywhere." lead="One binary. One package manager. Every platform." />
          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            <div>
              <div className="label-lime mb-3">a / install the toolchain</div>
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
              <div className="label-lime mb-3">b / install a package</div>
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
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="halo" style={{ width: 720, height: 720, bottom: -300, left: "50%", transform: "translateX(-50%)" }} />
        <div className="relative mx-auto max-w-[1400px] px-6 lg:px-10 py-32 text-center">
          <h2
            className="font-display text-foreground inline-block"
            style={{ fontSize: "clamp(3rem, 9vw, 8rem)", lineHeight: 0.9, letterSpacing: "-0.04em" }}
          >
            start writing<span className="text-accent">.</span>
          </h2>
          <p className="mt-6 text-lg text-foreground/75 max-w-md mx-auto">
            Open source. Apache-2.0. Actively developed in the open.
          </p>
          <div className="mt-10 flex justify-center gap-3">
            <Link href="/docs" className="btn-lime">read the docs <span aria-hidden>→</span></Link>
            <a href="https://github.com/xs-lang0/xs" target="_blank" rel="noopener noreferrer" className="btn-ghost">view on github ↗</a>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHead({
  kicker,
  title,
  lead,
  compact,
}: {
  kicker: string;
  title: string;
  lead?: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "" : "max-w-3xl"}>
      <div className="label-lime mb-4">{kicker}</div>
      <h2
        className="font-display text-foreground"
        style={{ fontSize: compact ? "clamp(2rem,4vw,3rem)" : "clamp(2.4rem,5.4vw,4.4rem)", letterSpacing: "-0.035em", lineHeight: 0.95 }}
      >
        {title}
      </h2>
      {lead && <p className="mt-5 text-base lg:text-lg text-foreground/70 max-w-2xl leading-relaxed">{lead}</p>}
    </div>
  );
}
