import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, Lead, P, UL } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Introduction · XS Guide" },
  description: "What XS is, what ships in the binary, and where to start reading.",
};

export const headings: Heading[] = [
  { id: "what-it-is", label: "What it is", level: 2 },
  { id: "what-ships", label: "What ships in the binary", level: 2 },
  { id: "what-it-does", label: "What it does", level: 2 },
  { id: "next-steps", label: "Next steps", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="guide" slug="introduction" headings={headings}>
      <H1>Introduction</H1>
      <Lead>
        What XS is, what ships in the binary, and where to start reading.
      </Lead>

      <H2 id="what-it-is">What it is</H2>

      <P>
        XS is a programming language. Anywhere, anytime, by anyone.
      </P>

      <P>
        The same source compiles to native machine code, JavaScript, or
        WebAssembly, and runs unchanged on Linux, macOS, Windows, WASI, iOS,
        Android, ESP32, and Raspberry Pi. Types are optional. Write a script
        the way you would write a script; add types when the program grows
        large enough that they pay for themselves.
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
        Add annotations when something benefits from enforcement. The type
        checker only activates on annotated code; everything else passes
        through.
      </P>

      <CodeBlock
        runnable
        code={`fn fib(n: int) -> int {
  if n <= 1 { return n }
  return fib(n - 1) + fib(n - 2)
}

println(fib(10))`}
      />

      <H2 id="what-ships">What ships in the binary</H2>

      <P>
        One statically-linked binary, around 2.9 MB on Linux x86-64. It
        contains the compiler, the language server, the debugger, the
        formatter, the linter, the test runner, the profiler, and the
        package manager. There is nothing else to install. HTTPS uses an
        embedded BearSSL; HTTP uses raw POSIX sockets. The binary builds
        with gcc or clang and GNU make from a clean checkout.
      </P>

      <H2 id="what-it-does">What it does</H2>

      <P>
        Pattern matching with literal, range, struct, and enum patterns;
        guards on any arm; the semantic analyser checks exhaustiveness.
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
        Algebraic effects: declare a side requirement as a named effect, let
        the caller decide how it is handled. The handler can resume back to
        the perform site with a value.
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
        Concurrency primitives: <code>spawn</code> for real OS threads,
        channels for message passing, actors for encapsulated state,
        nurseries for structured concurrency, async / await for I/O. The
        bytecode VM holds a global lock during its dispatch loop, so two
        pure-compute threads take turns rather than running in parallel; the
        lock releases around sleep, I/O, and channel receive, so
        spawn-and-block parallelises the way you would expect. Same model as
        CPython.
      </P>

      <P>
        Backends: a tree-walk interpreter for the REPL and AST-level plugin
        hooks, a bytecode VM for the default path, a register-allocating JIT
        for x86-64 and aarch64, plus transpilers to C, JavaScript, and
        WebAssembly. The interp and the VM are diff&apos;d against each
        other on every commit; a divergence fails the test even if each
        backend passes on its own.
      </P>

      <H2 id="next-steps">Next steps</H2>

      <P>
        The guide reads top to bottom: each chapter builds on the last.
      </P>

      <UL>
        <li>
          <a href="/docs/guide/installation">Installation</a> — get XS on a
          machine.
        </li>
        <li>
          <a href="/docs/guide/first-program">Your first program</a> — write,
          run, REPL.
        </li>
        <li>
          <a href="/docs/guide/variables">Variables and bindings</a> — let,
          var, const, destructuring.
        </li>
      </UL>
    </DocLayout>
  );
}
