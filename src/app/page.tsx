import Link from "next/link";
import { Wrap } from "@/components/wrap";
import { CodeBlock } from "@/components/code-block";
import { InstallRow } from "@/components/install-row";

const HERO = `-- effects, types, pattern matching, durations
effect Log { fn log(msg: str) }

actor Worker {
  @every(30s)
  fn tick() { perform Log.log("ping") }
}

handle spawn Worker {
  Log.log(msg) => { println(msg); resume(null) }
}`;

export default function Home() {
  return (
    <Wrap>
      <section className="pt-[72px] pb-14">
        <h1 className="text-[26px] font-semibold tracking-[-0.01em] text-[color:var(--text)] mb-[22px] reveal-load d1">
          XS is a programming language.
        </h1>

        <p className="text-[16.5px] leading-[1.7] text-[color:var(--text-muted)] mb-8 max-w-[64ch] reveal-load d2">
          It compiles a single source to native machine code, JavaScript, and WebAssembly. Pattern matching, algebraic effects, gradual typing, native durations. <code>~4 ms</code> cold start. The compiler, language server, debugger, formatter, linter, and package manager ship as one <code>~2.4 MB</code> binary with zero runtime dependencies. Open source, Apache-2.0.
        </p>

        <div className="reveal-load d3">
          <CodeBlock code={HERO} />
        </div>

        <div className="flex flex-col gap-1.5 mb-8 reveal-load d4">
          <InstallRow platform="macOS, Linux" prompt="$" cmd="curl -fsSL xslang.org/install | sh" copyText="curl -fsSL https://xslang.org/install | sh" primary />
          <InstallRow platform="Windows" prompt=">" cmd="irm xslang.org/install.ps1 | iex" copyText="irm https://xslang.org/install.ps1 | iex" />
          <InstallRow platform="Source" prompt="$" cmd="git clone github.com/xs-lang0/xs && cd xs && make" copyText="git clone https://github.com/xs-lang0/xs && cd xs && make && sudo make install" />
        </div>

        <div className="flex flex-wrap gap-[22px] pt-6 border-t border-[color:var(--rule-soft)] text-sm reveal-load d5">
          <Link href="/docs">Read the docs -&gt;</Link>
          <Link href="/playground">Open the playground</Link>
        </div>
      </section>
    </Wrap>
  );
}
