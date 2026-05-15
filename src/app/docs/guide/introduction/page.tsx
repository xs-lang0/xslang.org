import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, Lead, P, UL, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Introduction, XS Guide" };

export const headings: Heading[] = [
  { id: "what-it-is", label: "What it is", level: 2 },
  { id: "key-features", label: "Key features", level: 2 },
  { id: "next-steps", label: "Next steps", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="guide" slug="introduction" headings={headings}>
      <H1>Introduction</H1>
      <Lead>
        XS is a general-purpose language that scales from 5-line scripts to
        large systems, with gradual typing, multiple backends, and zero
        external dependencies.
      </Lead>

      <P>
        The core idea: one language for scripting, systems, and the web. Types
        are optional until you want them. The same source file can run on the
        bytecode VM, get compiled to native via C, or transpile to JavaScript
        or WebAssembly.
      </P>

      <H2 id="what-it-is">What it is</H2>

      <P>
        XS is written in C and builds on Linux, macOS, and Windows with no
        build or runtime dependencies. The binary is around 2.4 MB stripped.
        Install it with a single command and run scripts immediately.
      </P>

      <CodeBlock
        runnable
        code={`-- types are optional
fn fib(n) {
  if n <= 1 { return n }
  return fib(n - 1) + fib(n - 2)
}

println(fib(10))`}
      />

      <P>
        Add annotations when you want enforcement. The type checker only
        activates on annotated code and passes everything else through silently.
      </P>

      <CodeBlock
        runnable
        code={`fn fib(n: int) -> int {
  if n <= 1 { return n }
  return fib(n - 1) + fib(n - 2)
}

println(fib(10))`}
      />

      <H2 id="key-features">Key features</H2>

      <P>
        A quick tour of what makes XS worth learning. Each of these has its own
        guide chapter.
      </P>

      <P>
        <strong>Gradual typing.</strong> Write untyped code, annotate where it
        matters, enforce everything with <code>--strict</code>. No separate
        typed and untyped worlds.
      </P>

      <CodeBlock
        runnable
        code={`let x = 42          -- untyped, fine
let y: int = 42     -- annotated, checked
println(x + y)`}
      />

      <P>
        <strong>Pattern matching.</strong> Scrutinise any value against
        literals, destructured structs, ranges, regex, and more. The semantic
        analyser verifies exhaustiveness.
      </P>

      <CodeBlock
        runnable
        code={`fn describe(n) {
  match n {
    0          => "zero"
    x if x < 0 => "negative"
    1..=9      => "single digit"
    _          => "big"
  }
}

println(describe(-3))
println(describe(7))
println(describe(100))`}
      />

      <P>
        <strong>Algebraic effects.</strong> Declare side requirements as named
        effects; let callers decide how they are handled. Effects are resumable,
        so the handler can send a value back to the perform site.
      </P>

      <CodeBlock
        runnable
        code={`effect Ask {
  fn prompt(msg) -> str
}

fn greet() {
  let name = perform Ask.prompt("name?")
  return "Hello, {name}!"
}

let result = handle greet() {
  Ask.prompt(msg) => resume("World")
}

println(result)`}
      />

      <P>
        <strong>Multiple backends.</strong> The bytecode VM is the default.
        The JIT compiles hot paths to native x86-64 or aarch64. The transpilers
        produce standalone JavaScript, C, or WASM.
      </P>

      <P>
        <strong>Concurrency.</strong> Spawn real OS threads, pass messages over
        channels, model state with actors, bound task lifetimes with nurseries.
        Async/await for I/O-bound work.
      </P>

      <P>
        <strong>Structs, classes, and traits.</strong> Both data-oriented
        struct+impl+trait and OOP class+inheritance. Pick what fits the problem.
      </P>

      <P>
        <strong>Zero dependencies.</strong> No "also install openssl". BearSSL
        is bundled for TLS. HTTP uses raw POSIX sockets. Works offline and on
        air-gapped machines.
      </P>

      <Note>
        XS is production-ready as of v1.0. The language is stable; breaking
        changes go through a deprecation cycle.
      </Note>

      <H2 id="next-steps">Next steps</H2>

      <P>
        The guide reads top to bottom: each chapter builds on the last. Start
        with installation and a first program, then work through types,
        functions, and the more advanced features.
      </P>

      <UL>
        <li>
          <a href="/docs/guide/installation">Installation</a> - get XS on your
          machine in one command
        </li>
        <li>
          <a href="/docs/guide/first-program">Your first program</a> - write,
          run, and explore the REPL
        </li>
        <li>
          <a href="/docs/guide/variables">Variables and bindings</a> - let, var,
          const, destructuring
        </li>
      </UL>
    </DocLayout>
  );
}
