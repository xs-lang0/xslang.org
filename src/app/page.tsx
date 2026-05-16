import Link from "next/link";
import { Wrap } from "@/components/wrap";
import { CodeBlock } from "@/components/code-block";
import { InstallRow } from "@/components/install-row";

// Schema.org payload Google reads for the rich-result panel. Kept inline
// rather than in a component so it lands in the HTML the crawler sees first.
const SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "XS",
  alternateName: ["XS Lang", "xslang"],
  url: "https://xslang.org/",
  description:
    "One language for everything. Pattern matching, algebraic effects, gradual typing, real concurrency. Compiles to native, JavaScript, and WebAssembly. Zero runtime dependencies.",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "macOS, Linux, Windows",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  license: "https://www.apache.org/licenses/LICENSE-2.0",
  author: { "@type": "Person", name: "xs-lang0", url: "https://github.com/xs-lang0" },
  sameAs: ["https://github.com/xs-lang0/xs"],
};

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
      />
      <section className="pt-[72px] pb-14">
        <h1 className="text-[26px] font-semibold tracking-[-0.01em] text-[color:var(--text)] mb-[22px] reveal-load d1">
          XS is a programming language.
        </h1>

        <p className="text-[16.5px] leading-[1.7] text-[color:var(--text-muted)] mb-8 max-w-[64ch] reveal-load d2">
          <code>~4 ms</code> cold start. One <code>~2.4 MB</code> binary, zero runtime dependencies. Tree-walk interpreter, bytecode VM, register-allocating JIT for x86-64 and aarch64, plus transpilers to JavaScript, C, and WebAssembly. Pattern matching, algebraic effects, gradual typing, real concurrency, native durations. Open source, Apache-2.0.
        </p>

        <div className="reveal-load d3">
          <CodeBlock code={HERO} />
        </div>

        <p className="text-[12.5px] mt-2 mb-8 text-[color:var(--text-faint)] reveal-load d3">
          The snippet uses effects, actors, decorators, and pattern matching. Each piece has its own chapter in the guide.
        </p>

        <div className="flex flex-col gap-1.5 reveal-load d4">
          <InstallRow platform="macOS, Linux" prompt="$" cmd="curl -fsSL xslang.org/install | sh" copyText="curl -fsSL https://xslang.org/install | sh" primary />
          <InstallRow platform="Windows" prompt=">" cmd="irm xslang.org/install.ps1 | iex" copyText="irm https://xslang.org/install.ps1 | iex" />
          <InstallRow platform="Source" prompt="$" cmd="git clone github.com/xs-lang0/xs && cd xs && make" copyText="git clone https://github.com/xs-lang0/xs && cd xs && make && sudo make install" />
        </div>

        <p className="text-[12px] text-[color:var(--text-faint)] mt-3 mb-8 reveal-load d4">
          Both installers verify the GitHub release with its published SHA-256 sums file before running anything. Static binaries and checksums are also on{" "}
          <Link href="/downloads" className="text-[color:var(--text-muted)] hover:text-[color:var(--text)]">/downloads</Link>{" "}
          if you would rather not pipe a script. After install, run <code>xs</code> for the REPL or <code>xs --version</code> to confirm the build.
        </p>

        <div className="flex flex-wrap gap-[22px] pt-6 border-t border-[color:var(--rule-soft)] text-sm reveal-load d5">
          <Link href="/docs">Read the docs -&gt;</Link>
          <Link href="/playground">Open the playground</Link>
          <a href="https://github.com/xs-lang0/xs" target="_blank" rel="noopener noreferrer">Source on GitHub</a>
        </div>
      </section>
    </Wrap>
  );
}
