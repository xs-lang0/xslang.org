import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Error handling · XS Guide" },
  description: "XS uses try/catch for recoverable errors and panic for unrecoverable ones. defer runs cleanup code regardless of how a function exits.",
};

export const headings: Heading[] = [
  { id: "try-catch-finally", label: "try / catch / finally", level: 2 },
  { id: "throw", label: "throw", level: 2 },
  { id: "panic", label: "panic", level: 2 },
  { id: "defer", label: "defer", level: 2 },
  { id: "when-to-use", label: "When to use which", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="guide" slug="error-handling" headings={headings}>
      <H1>Error handling</H1>
      <Lead>
        XS uses <code>try</code>/<code>catch</code> for recoverable errors and{" "}
        <code>panic</code> for unrecoverable ones. <code>defer</code> runs
        cleanup code regardless of how a function exits.
      </Lead>

      <H2 id="try-catch-finally">try / catch / finally</H2>

      <CodeBlock
        runnable
        code={`try {
  throw "something went wrong"
} catch e {
  println("caught: {e}")
} finally {
  println("cleanup (always runs)")
}`}
      />

      <P>
        You can throw any value: strings, numbers, maps, structs. The caught
        value is whatever was thrown.
      </P>

      <CodeBlock
        runnable
        code={`try {
  throw #{"kind": "NotFound", "msg": "file missing"}
} catch e {
  println(e["kind"])             -- NotFound
  println(e["msg"])              -- file missing
}`}
      />

      <P>
        Exceptions propagate up the call stack until caught. Nest try/catch
        to rethrow with context:
      </P>

      <CodeBlock
        runnable
        code={`try {
  try {
    throw "inner error"
  } catch e {
    throw "outer: {e}"
  }
} catch e {
  println(e)                     -- outer: inner error
}`}
      />

      <H2 id="throw">throw</H2>

      <CodeBlock
        runnable
        code={`fn divide(a, b) {
  if b == 0 { throw "division by zero" }
  return a / b
}

try {
  println(divide(10, 2))         -- 5
  println(divide(10, 0))
} catch e {
  println("error: {e}")
}`}
      />

      <H2 id="panic">panic</H2>

      <P>
        <code>panic</code> terminates the process immediately. It prints to
        stderr and exits with code 1. It is not catchable by try/catch.
      </P>

      <CodeBlock
        code={`panic("fatal: invariant violated")
-- xs: panic: fatal: invariant violated`}
      />

      <P>
        Related: <code>todo(msg?)</code> panics with "not implemented" and{" "}
        <code>unreachable()</code> panics if somehow reached. Both signal
        programmer intent rather than runtime conditions.
      </P>

      <H2 id="defer">defer</H2>

      <P>
        <code>defer</code> schedules a block to run when the enclosing function
        returns. Multiple defers execute in LIFO order. Defers run even if an
        exception is thrown.
      </P>

      <CodeBlock
        runnable
        code={`fn example() {
  defer { println("third") }
  defer { println("second") }
  defer { println("first") }
  println("body")
}

example()
-- body
-- first
-- second
-- third`}
      />

      <CodeBlock
        runnable
        code={`fn with_error() {
  defer { println("cleanup") }
  throw "oops"
}

try {
  with_error()
} catch e {
  println("caught: {e}")
}
-- cleanup runs before the catch block gets the error`}
      />

      <H2 id="when-to-use">When to use which</H2>

      <P>
        <strong>throw / catch</strong> for recoverable errors: bad input,
        missing resources, validation failures. The caller can handle them
        and continue.
      </P>

      <P>
        <strong>panic</strong> for invariant violations: states that should
        never occur if the program is correct. There is nothing sensible to do
        except crash and report.
      </P>

      <P>
        <strong>defer</strong> for cleanup that must happen regardless of
        success or failure: closing files, releasing locks, logging completion.
      </P>

      <Note>
        For effects-based error handling (declaring errors as effects and
        letting callers choose the recovery strategy), see the{" "}
        <a href="/docs/guide/effects">effects</a> chapter.
      </Note>
    </DocLayout>
  );
}
