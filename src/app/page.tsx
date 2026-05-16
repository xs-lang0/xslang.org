import Link from "next/link";
import { Wrap } from "@/components/wrap";
import { CodeBlock } from "@/components/code-block";
import { InstallRow } from "@/components/install-row";

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

const HERO = `fn fib(n) {
    if n < 2 { return n }
    return fib(n - 1) + fib(n - 2)
}

println(fib(30))    -- 832040`;

// Plain-text rows, no UI chrome around them; the page is the table.
type Row = { label: string; value: string; note?: string };
const NUMBERS: Row[] = [
  { label: "startup, hello world",      value: "3 ms"       },
  { label: "fib(30) on the JIT",        value: "31 ms"      },
  { label: "fib(30) on the VM",         value: "180 ms"     },
  { label: "fib(30) on Node 20",        value: "62 ms"      },
  { label: "fib(30) on CPython 3.13",   value: "71 ms"      },
  { label: "binary size, stripped",     value: "2.9 MB"     },
  { label: "C source (excluding BearSSL)", value: "132 KLOC" },
  { label: "regression + conformance",  value: "76 files"   },
];

const BACKENDS: Row[] = [
  { label: "xs --interp",  value: "tree-walk interpreter", note: "REPL, plugin debugging, source-of-truth behaviour" },
  { label: "xs (default)", value: "bytecode VM",           note: "what normal runs go through" },
  { label: "xs --jit",     value: "register-allocating JIT",note: "x86-64 + aarch64; opcodes outside its set fall back to the VM" },
  { label: "xs --emit c",  value: "C transpiler",          note: "self-contained C source for any reasonable compiler" },
  { label: "xs --emit js", value: "JavaScript transpiler", note: "for Node and the browser" },
  { label: "xs.wasm",      value: "runtime build",         note: "the same compiler running in a browser" },
];

export default function Home() {
  return (
    <Wrap>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }}
      />
      <section className="pt-[72px] pb-14">
        <h1 className="text-[26px] font-semibold tracking-[-0.01em] text-[color:var(--text)] mb-[18px] reveal-load d1">
          XS
        </h1>

        <p className="text-[16.5px] leading-[1.7] text-[color:var(--text-muted)] mb-8 max-w-[64ch] reveal-load d2">
          A programming language. Anywhere, anytime, by anyone.
        </p>

        <p className="text-[15px] leading-[1.7] text-[color:var(--text-muted)] mb-8 max-w-[64ch] reveal-load d2">
          The distribution is one statically-linked binary. It contains
          the compiler, the language server, the debugger, the formatter,
          the linter, the test runner, the profiler, and the package
          manager. There is nothing else to install.
        </p>

        <p className="text-[15px] leading-[1.7] text-[color:var(--text-muted)] mb-8 max-w-[64ch] reveal-load d2">
          Source compiles to native machine code, JavaScript, or
          WebAssembly. The same source runs unchanged on Linux, macOS,
          Windows, WASI, iOS, Android, ESP32, and Raspberry Pi.
        </p>

        <div className="reveal-load d3">
          <CodeBlock code={HERO} />
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
          . After install, <code>xs</code> drops into a REPL.
        </p>

        <h2 className="text-[14px] uppercase tracking-[0.10em] text-[color:var(--text-faint)] mt-12 mb-4 font-mono reveal-load d5">
          Numbers
        </h2>
        <dl className="font-mono text-[13.5px] leading-[1.85] reveal-load d5 mb-3">
          {NUMBERS.map((r) => (
            <div key={r.label} className="grid grid-cols-[1fr_auto] gap-x-6 border-b border-[color:var(--rule-soft)] py-[3px]">
              <dt className="text-[color:var(--text-muted)]">{r.label}</dt>
              <dd className="text-[color:var(--text)] tabular-nums">{r.value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-[11.5px] text-[color:var(--text-faint)] mt-3 max-w-[60ch] reveal-load d5">
          Measured on a Linux x86-64 box, each binary cold from disk,
          best of three runs. Reproduce with{" "}
          <code className="font-mono">bash tests/bench_backends.sh</code>{" "}
          in the source tree. The JIT and VM numbers come from the same
          build that ships in releases.
        </p>

        <h2 className="text-[14px] uppercase tracking-[0.10em] text-[color:var(--text-faint)] mt-12 mb-4 font-mono reveal-load d5">
          Six places it runs
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

        <h2 className="text-[14px] uppercase tracking-[0.10em] text-[color:var(--text-faint)] mt-12 mb-4 font-mono reveal-load d5">
          Stability
        </h2>
        <p className="text-[14.5px] leading-[1.7] text-[color:var(--text-muted)] max-w-[64ch] reveal-load d5">
          v1.0 is the API-stable baseline. The 1.x line will not break a
          program; deprecated behaviour gets one release before it is
          removed. Per-feature, per-backend coverage is on{" "}
          <Link href="/docs/reference/backends" className="text-[color:var(--link)]">
            /docs/reference/backends
          </Link>
          .
        </p>

        <h2 className="text-[14px] uppercase tracking-[0.10em] text-[color:var(--text-faint)] mt-12 mb-4 font-mono reveal-load d5">
          The honest part
        </h2>
        <p className="text-[14.5px] leading-[1.7] text-[color:var(--text-muted)] max-w-[64ch] reveal-load d5 mb-4">
          <code>spawn</code> creates real OS threads. The bytecode VM
          holds a global lock during its dispatch loop, so two
          pure-compute threads take turns rather than running in
          parallel. The lock releases around sleep, I/O, channel
          receive, and the like, so spawn-and-block parallelises the way
          you would expect. Same model that CPython uses.
        </p>
        <p className="text-[14.5px] leading-[1.7] text-[color:var(--text-muted)] max-w-[64ch] reveal-load d5 mb-4">
          HTTPS uses an embedded BearSSL with a permissive x509 wrapper:
          certificates are parsed, the trust chain is not validated.
          Documented gap; suitable for self-hosted clients, not for
          general public HTTPS in production.
        </p>
        <p className="text-[14.5px] leading-[1.7] text-[color:var(--text-muted)] max-w-[64ch] reveal-load d5">
          Effect handlers on <code>--emit c</code> are single-shot.
          <code>perform</code> on <code>--emit wasm</code> traps. Native
          plugins do not load through the WebAssembly build.
        </p>

        <div className="flex flex-wrap gap-[22px] pt-8 mt-12 border-t border-[color:var(--rule-soft)] text-sm reveal-load d5">
          <Link href="/docs">Read the docs -&gt;</Link>
          <Link href="/playground">Open the playground</Link>
          <a href="https://github.com/xs-lang0/xs" target="_blank" rel="noopener noreferrer">Source on GitHub</a>
        </div>
      </section>
    </Wrap>
  );
}
