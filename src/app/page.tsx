import Link from "next/link";
import { Wrap } from "@/components/wrap";
import { CodeBlock } from "@/components/code-block";
import { InstallRow } from "@/components/install-row";
import { XS_VERSION } from "@/lib/version";

const SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "XS",
  alternateName: ["XS Lang", "xslang"],
  url: "https://xslang.org/",
  description:
    "A programming language. Anywhere, anytime, by anyone. One binary, no runtime dependencies; runs on a tree-walk interpreter, a bytecode VM, or a register-allocating JIT, and transpiles to JavaScript, C, and WebAssembly.",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "macOS, Linux, Windows, WebAssembly",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  license: "https://www.apache.org/licenses/LICENSE-2.0",
  author: { "@type": "Person", name: "xs-lang0", url: "https://github.com/xs-lang0" },
  sameAs: ["https://github.com/xs-lang0/xs"],
};

const HERO = `{- classic recursive fib, memoised -}
@memoize fn fib(n) {
    if n < 2 { return n }
    return fib(n - 1) + fib(n - 2)
}

println(fib(30))   -- 832040`;

// Plain-text rows, no UI chrome around them; the page is the table.
type Row = { label: string; value: string; note?: React.ReactNode };
const NUMBERS: Row[] = [
  { label: "startup, hello world",      value: "3 ms"       },
  { label: "C source (excluding BearSSL)", value: "132 KLOC" },
];

// fib(30) across every runtime. Lives in its own table so the eye reads
// "this column is JIT, this column is Node" without scanning labels.
const FIB30: { runtime: string; ms: string }[] = [
  { runtime: "xs --jit",       ms: "31 ms"  },
  { runtime: "xs (vm)",        ms: "138 ms" },
  { runtime: "node 20",        ms: "62 ms"  },
  { runtime: "cpython 3.13",   ms: "71 ms"  },
];

const BACKENDS: Row[] = [
  { label: "xs --interp",  value: "tree-walk interpreter", note: "for the REPL and AST-level plugin debugging" },
  { label: "xs (default)", value: "bytecode VM",           note: "what normal runs go through" },
  { label: "xs --jit",     value: "register-allocating JIT",note: "x86-64 + aarch64; opcodes outside its set fall back to the VM" },
  { label: "xs --emit c",  value: "C transpiler",          note: "self-contained C source for any reasonable compiler" },
  { label: "xs --emit js", value: "JavaScript transpiler", note: "Node or the browser; ships less than xs.wasm if you only need one program" },
  {
    label: "xs.wasm",
    value: "runtime build",
    note: (
      <>
        the same compiler running in a browser; ships a virtual filesystem
        and behaves like the native binary, so any XS program can be
        evaluated at runtime.{" "}
        <Link href="/docs/guide/embedding" className="text-[color:var(--link)]">
          how to embed it
        </Link>
        .
      </>
    ),
  },
];

export default function Home() {
  return (
    <Wrap>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
      />
      <section className="pt-[72px] pb-14">
        <div className="flex items-baseline gap-3 mb-[18px] reveal-load d1">
          <h1 className="text-[44px] font-semibold tracking-[-0.025em] leading-[1] text-[color:var(--text)]">
            XS
          </h1>
          <span className="font-mono text-[12px] text-[color:var(--text-faint)]">v{XS_VERSION}</span>
        </div>

        <p className="text-[20px] leading-[1.45] tracking-[-0.005em] text-[color:var(--text)] mb-6 max-w-[36ch] reveal-load d2">
          A programming language. Anywhere, anytime, by anyone.
        </p>

        <p className="text-[15px] leading-[1.7] text-[color:var(--text-muted)] mb-8 max-w-[64ch] reveal-load d2">
          One statically-linked binary contains the compiler, the
          language server, the debugger, the formatter, the linter, the
          test runner, the profiler, and the package manager. The same
          source runs unchanged on Linux, macOS, Windows, WASI, iOS,
          Android, ESP32, and Raspberry Pi.
        </p>

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-6 my-7 max-w-[560px] reveal-load d2">
          {[
            { n: "6", t: "backends" },
            { n: "3", t: "transpile targets" },
            { n: "0", t: "runtime deps" },
            { n: "2.9", t: "MB binary" },
          ].map(s => (
            <div key={s.t} className="border-l border-[color:var(--rule-soft)] pl-3">
              <dt className="font-mono text-[22px] tabular-nums text-[color:var(--text)] tracking-tight leading-[1.1]">{s.n}</dt>
              <dd className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[color:var(--text-faint)] mt-1">{s.t}</dd>
            </div>
          ))}
        </dl>

        <div className="reveal-load d3">
          <CodeBlock code={HERO} runnable filename="hero.xs" />
        </div>

        <div className="flex flex-col gap-1.5 mt-8 reveal-load d4">
          <InstallRow platform="macOS, Linux" prompt="$" cmd="curl -fsSL xslang.org/install | sh" copyText="curl -fsSL https://xslang.org/install | sh" primary />
          <InstallRow platform="Windows" prompt=">" cmd="irm xslang.org/install.ps1 | iex" copyText="irm https://xslang.org/install.ps1 | iex" />
          <InstallRow platform="Source" prompt="$" cmd="git clone github.com/xs-lang0/xs && cd xs && make" copyText="git clone https://github.com/xs-lang0/xs && cd xs && make && sudo make install" />
        </div>

        <p className="text-[12px] text-[color:var(--text-faint)] mt-3 mb-12 reveal-load d4">
          Both installers verify the GitHub release against its published
          SHA-256 sums before running anything. Static binaries with
          checksums also live at{" "}
          <Link href="/downloads" className="text-[color:var(--text-muted)] hover:text-[color:var(--text)]">
            /downloads
          </Link>
          .
        </p>

        <h2 className="text-[14px] uppercase tracking-[0.10em] text-[color:var(--text-faint)] mt-12 mb-4 font-mono reveal-load d5">
          Benchmarks
        </h2>
        <dl className="font-mono text-[13.5px] leading-[1.85] reveal-load d5 mb-5">
          {NUMBERS.map((r) => (
            <div key={r.label} className="grid grid-cols-[1fr_auto] gap-x-6 border-b border-[color:var(--rule-soft)] py-[3px]">
              <dt className="text-[color:var(--text-muted)]">{r.label}</dt>
              <dd className="text-[color:var(--text)] tabular-nums">{r.value}</dd>
            </div>
          ))}
        </dl>

        <div className="reveal-load d5">
          <div className="font-mono text-[12px] uppercase tracking-[0.08em] text-[color:var(--text-faint)] mb-2">fib(30)</div>
          <table className="font-mono text-[13.5px] w-full border-collapse">
            <thead>
              <tr className="border-b border-[color:var(--rule-soft)]">
                {FIB30.map((c) => (
                  <th key={c.runtime} className="text-left text-[color:var(--text-muted)] font-normal py-[3px] pr-6">
                    {c.runtime}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {FIB30.map((c) => (
                  <td key={c.runtime} className="text-[color:var(--text)] tabular-nums py-[5px] pr-6">
                    {c.ms}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[11.5px] text-[color:var(--text-faint)] mt-3 max-w-[60ch] reveal-load d5">
          Measured on a Linux x86-64 box, each binary cold from disk,
          best of three runs. Reproduce with{" "}
          <code className="font-mono">bash tests/bench_backends.sh</code>{" "}
          in the source tree. The JIT and VM numbers come from the same
          build that ships in releases.
        </p>

        <h2 className="text-[14px] uppercase tracking-[0.10em] text-[color:var(--text-faint)] mt-12 mb-4 font-mono reveal-load d5">
          Backends
        </h2>
        <dl className="font-mono text-[13.5px] leading-[1.75] reveal-load d5">
          {BACKENDS.map((r) => (
            <div key={r.label} className="grid grid-cols-[160px_1fr] gap-x-4 border-b border-[color:var(--rule-soft)] py-2">
              <dt className="text-[color:var(--text-muted)]">{r.label}</dt>
              <dd>
                <div className="text-[color:var(--text)]">{r.value}</div>
                {r.note && <div className="text-[12px] text-[color:var(--text-faint)] mt-[2px]">{r.note}</div>}
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap gap-[22px] pt-8 mt-12 border-t border-[color:var(--rule-soft)] text-sm reveal-load d5">
          <Link href="/docs">Read the docs -&gt;</Link>
          <Link href="/playground">Open the playground</Link>
          <a href="https://github.com/xs-lang0/xs" target="_blank" rel="noopener noreferrer">Source on GitHub</a>
        </div>
      </section>
    </Wrap>
  );
}
