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
    n: "01",
    title: "Gradual typing",
    desc: "Start untyped. Add types where they earn their keep. The checker stays out of your way until you ask.",
  },
  {
    n: "02",
    title: "Algebraic effects",
    desc: "First-class effects for errors, async, logging. Composable. Resumable. Worth the learning curve.",
  },
  {
    n: "03",
    title: "Pattern matching",
    desc: "Deep structural matching with guards, ranges, regex, and exhaustiveness. The compiler tells you what you missed.",
  },
  {
    n: "04",
    title: "Zero dependencies",
    desc: "The compiler is pure C. No LLVM. No runtime weight. It builds in seconds and ships in kilobytes.",
  },
  {
    n: "05",
    title: "Multi-target",
    desc: "One source file. Three backends: native C, JavaScript, WebAssembly. No conditional code paths.",
  },
  {
    n: "06",
    title: "Full concurrency",
    desc: "Spawn, async/await, actors, channels, nurseries. Pick the model that fits the problem in front of you.",
  },
  {
    n: "07",
    title: "Package registry",
    desc: "Install with xsi. Publish with one command. Browse the catalog at reg.xslang.org.",
  },
  {
    n: "08",
    title: "Reactive bindings",
    desc: "Variables that auto-update with their dependencies. Add contracts to enforce invariants at runtime.",
  },
];

const tooling = [
  ["i.", "Bytecode VM with JIT compiler"],
  ["ii.", "LSP with completions and diagnostics"],
  ["iii.", "DAP debugger for any editor"],
  ["iv.", "Built-in formatter and linter"],
  ["v.", "Test runner with coverage"],
  ["vi.", "First-party VSCode extension"],
  ["vii.", "Plugin system for extensions"],
  ["viii.", "Package registry via xsi"],
];

export default function Home() {
  return (
    <div>
      {/* masthead */}
      <div className="border-b border-ink/15">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-2.5 flex items-center justify-between text-[0.62rem] smallcaps text-ink/55">
          <span>The XS Specimen / № 0.2.3</span>
          <span className="hidden sm:inline">A Programming Language for Scripts, Servers, and the Browser</span>
          <span>Vol. IV — MMXXVI</span>
        </div>
      </div>

      {/* hero */}
      <section className="mx-auto max-w-[1400px] px-6 lg:px-10 pt-14 lg:pt-20 pb-24 relative">
        <div className="grid grid-cols-12 gap-6 lg:gap-10">
          {/* left margin: kicker + marginalia */}
          <aside className="col-span-12 md:col-span-3 reveal" style={{ animationDelay: "100ms" }}>
            <div className="smallcaps text-accent mb-4">↳ Lede / 2026</div>
            <p className="marginalia">
              A small language built around a single conviction: the compiler is for you, not against you. Three backends, eight features, zero dependencies.
            </p>
            <div className="ledger mt-6 max-w-[200px] draw-rule" style={{ animationDelay: "300ms" }} />
            <div className="mt-6 smallcaps text-ink/55">By the team, in C.</div>
          </aside>

          {/* center: massive wordmark + tagline */}
          <div className="col-span-12 md:col-span-9">
            <h1 className="display text-ink leading-[0.78]">
              <span className="reveal-letter" style={{ fontSize: "clamp(7rem, 22vw, 22rem)", animationDelay: "0ms" }}>x</span>
              <span className="reveal-letter text-accent" style={{ fontSize: "clamp(7rem, 22vw, 22rem)", animationDelay: "180ms", fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}>s</span>
              <span className="reveal-letter" style={{ fontSize: "clamp(7rem, 22vw, 22rem)", animationDelay: "320ms" }}>.</span>
            </h1>
            <p
              className="display-italic text-ink/85 mt-4 max-w-[28ch] reveal"
              style={{ animationDelay: "420ms", fontSize: "clamp(1.6rem, 3.4vw, 2.6rem)" }}
            >
              one language for scripts, servers,&nbsp;and the browser.
            </p>
          </div>
        </div>

        {/* sub-row: install line, ctas, code paste */}
        <div className="grid grid-cols-12 gap-6 lg:gap-10 mt-16">
          <div className="col-span-12 md:col-span-6 lg:col-span-5 md:col-start-4 reveal" style={{ animationDelay: "560ms" }}>
            <div className="smallcaps text-ink/55 mb-3">↪ Install in one line</div>
            <div className="font-mono text-sm border-y border-ink py-3 flex items-center gap-3 select-all">
              <span className="text-accent">$</span>
              <span className="text-ink">curl -fsSL https://xslang.org/install | sh</span>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 bg-ink text-paper px-5 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
              >
                Read the docs <span aria-hidden>→</span>
              </Link>
              <Link
                href="/playground"
                className="inline-flex items-center gap-2 border-[1.5px] border-ink px-5 py-2.5 text-sm font-medium hover:bg-ink hover:text-paper transition-colors"
              >
                Try it in the browser
              </Link>
            </div>
          </div>

          <div className="col-span-12 md:col-span-12 lg:col-span-7 reveal -rotate-[0.3deg]" style={{ animationDelay: "700ms" }}>
            <CodeBlock code={heroCode} runnable />
          </div>
        </div>
      </section>

      {/* §01 features */}
      <section className="mx-auto max-w-[1400px] px-6 lg:px-10 py-24">
        <SectionHeader index="§ 01" title="Features" subtitle="Eight ideas that hold the language together." />

        <div className="grid grid-cols-12 gap-x-6 gap-y-12 lg:gap-y-16 mt-16">
          {features.map((f, i) => (
            <article
              key={f.n}
              className={`col-span-12 sm:col-span-6 lg:col-span-3 feature-row group ${
                i % 2 === 0 ? "md:translate-y-0" : "md:translate-y-6"
              }`}
            >
              <div className="flex items-baseline gap-3 mb-3">
                <span
                  className="font-serif text-accent leading-none"
                  style={{ fontSize: "2.2rem", fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}
                >
                  {f.n}
                </span>
                <span className="ledger flex-1 max-w-12 opacity-50" />
              </div>
              <h3 className="font-serif text-2xl leading-tight tracking-tight text-ink mb-2">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-ink/70">{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* §02 tooling */}
      <section className="bg-ink text-paper py-24 grain">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <div className="grid grid-cols-12 gap-x-6 gap-y-10">
            <aside className="col-span-12 md:col-span-4">
              <div className="smallcaps text-paper/55 mb-4">§ 02</div>
              <h2
                className="font-serif text-paper leading-[0.95] mb-6"
                style={{ fontSize: "clamp(2.6rem, 5.6vw, 4.6rem)", fontVariationSettings: '"opsz" 144, "SOFT" 80, "WONK" 0', letterSpacing: "-0.035em" }}
              >
                The tooling<br />comes <em>built in</em>.
              </h2>
              <p className="marginalia text-paper/70 max-w-md">
                No third-party toolchain to wire up. No version drift between editor, runtime, and CI. The whole stack ships as one binary.
              </p>
            </aside>

            <ul className="col-span-12 md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-1">
              {tooling.map(([num, item]) => (
                <li
                  key={item}
                  className="flex items-baseline gap-4 py-3 border-b border-paper/15"
                >
                  <span className="font-mono text-xs text-accent w-8 shrink-0">{num}</span>
                  <span className="font-serif text-xl text-paper" style={{ fontVariationSettings: '"opsz" 30, "SOFT" 50' }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* §03 concurrency */}
      <section className="mx-auto max-w-[1400px] px-6 lg:px-10 py-24">
        <SectionHeader index="§ 03" title="Concurrency that holds up" subtitle="Spawn lightweight tasks. Send messages over channels. Or model state with actors. Pick the shape, keep the speed." />

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mt-16">
          <figure>
            <figcaption className="smallcaps text-ink/55 mb-3 flex items-center gap-3">
              <span>fig. a / channels</span>
              <span className="ledger flex-1 opacity-50" />
            </figcaption>
            <div className="rotate-[0.4deg]">
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
            </div>
          </figure>

          <figure className="md:translate-y-10">
            <figcaption className="smallcaps text-ink/55 mb-3 flex items-center gap-3">
              <span>fig. b / actors</span>
              <span className="ledger flex-1 opacity-50" />
            </figcaption>
            <div className="-rotate-[0.4deg]">
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
          </figure>
        </div>
      </section>

      {/* §04 install */}
      <section className="border-y border-ink/80 grain">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-24">
          <SectionHeader index="§ 04" title="Works everywhere" subtitle="One binary on every desk. One package manager for the whole language." />

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 mt-16">
            <div>
              <div className="smallcaps text-accent mb-3">a / installing the toolchain</div>
              <CodeBlock
                code={`# linux / macos
curl -fsSL https://xslang.org/install | sh

# windows (powershell)
irm https://xslang.org/install.ps1 | iex

# or build from source
git clone https://github.com/xs-lang0/xs
cd xs && make && make install`}
              />
              <p className="marginalia mt-4">
                The installer is a shell script. The compiler is a single C binary. There is no runtime to install separately.
              </p>
            </div>

            <div className="lg:translate-y-8">
              <div className="smallcaps text-accent mb-3">b / managing packages</div>
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
              <p className="marginalia mt-4">
                xsi reads from <a href="https://reg.xslang.org" className="text-accent underline underline-offset-2">reg.xslang.org</a> by default. Mirror it, vendor it, or run your own.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* end mark / cta */}
      <section className="mx-auto max-w-[1400px] px-6 lg:px-10 py-32 text-center relative">
        <div className="smallcaps text-ink/55 mb-6">— end of issue —</div>
        <h2
          className="font-serif text-ink leading-[0.85] mx-auto"
          style={{ fontSize: "clamp(3rem, 9vw, 8rem)", fontVariationSettings: '"opsz" 144, "SOFT" 80, "WONK" 1', letterSpacing: "-0.04em" }}
        >
          start <em className="text-accent">writing</em>.
        </h2>
        <p className="marginalia mt-6 max-w-md mx-auto">
          Open source. Apache-2.0 licensed. Actively developed in the open.
        </p>
        <div className="flex justify-center gap-3 mt-10">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 bg-ink text-paper px-6 py-3 text-sm font-medium hover:bg-accent transition-colors"
          >
            Read the docs <span aria-hidden>→</span>
          </Link>
          <a
            href="https://github.com/xs-lang0/xs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-[1.5px] border-ink px-6 py-3 text-sm font-medium hover:bg-ink hover:text-paper transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  index,
  title,
  subtitle,
}: {
  index: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="grid grid-cols-12 gap-x-6 items-end">
      <div className="col-span-12 md:col-span-3">
        <div className="smallcaps text-accent mb-4">{index}</div>
        <div className="ledger max-w-[120px]" />
      </div>
      <div className="col-span-12 md:col-span-9 mt-6 md:mt-0">
        <h2
          className="font-serif text-ink leading-[0.95]"
          style={{ fontSize: "clamp(2.4rem, 5.5vw, 4.4rem)", fontVariationSettings: '"opsz" 144, "SOFT" 70, "WONK" 0', letterSpacing: "-0.035em" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="marginalia mt-4 max-w-2xl text-ink/70" style={{ fontSize: "1rem" }}>
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}
