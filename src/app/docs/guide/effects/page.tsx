import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Effects, XS Guide" };

export const headings: Heading[] = [
  { id: "the-idea", label: "The idea", level: 2 },
  { id: "declare-perform-handle", label: "Declare, perform, handle", level: 2 },
  { id: "resuming", label: "Resuming with a value", level: 2 },
  { id: "accumulating", label: "Accumulating effects", level: 2 },
  { id: "multi-shot", label: "Multi-shot resume", level: 2 },
  { id: "vs-exceptions", label: "Effects vs exceptions", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="guide" slug="effects" headings={headings}>
      <H1>Effects</H1>
      <Lead>
        Algebraic effects let a function declare a side requirement without
        knowing how it will be satisfied. The handler decides, and can resume
        execution from the perform site.
      </Lead>

      <H2 id="the-idea">The idea</H2>

      <P>
        Exceptions let a function abort up the call stack. Effects go further:
        the handler can send a value back down to the point where the effect
        was performed, and execution continues from there. This makes effects
        useful for dependency injection, logging, non-determinism, and custom
        control flow.
      </P>

      <H2 id="declare-perform-handle">Declare, perform, handle</H2>

      <P>
        There are three steps. First, declare the effect as a named interface:
      </P>

      <CodeBlock
        code={`effect Ask {
  fn prompt(msg) -> str
}`}
      />

      <P>
        Second, perform the effect inside a function. The function does not
        know or care how <code>Ask.prompt</code> is implemented:
      </P>

      <CodeBlock
        code={`fn greet() {
  let name = perform Ask.prompt("name?")
  return "Hello, {name}!"
}`}
      />

      <P>
        Third, wrap the call in a <code>handle</code> block that provides the
        implementation:
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
println(result)                  -- Hello, World!`}
      />

      <H2 id="resuming">Resuming with a value</H2>

      <P>
        <code>resume(value)</code> inside a handler arm sends the value back
        to the <code>perform</code> site. Execution of the performing function
        continues from the next statement after the <code>perform</code>.
      </P>

      <CodeBlock
        runnable
        code={`effect Rand {
  fn next_int(lo, hi) -> int
}

fn roll_dice() {
  let a = perform Rand.next_int(1, 6)
  let b = perform Rand.next_int(1, 6)
  return a + b
}

-- deterministic handler for testing
let result = handle roll_dice() {
  Rand.next_int(lo, hi) => resume(3)
}
println(result)                  -- 6 (always 3 + 3)`}
      />

      <H2 id="accumulating">Accumulating effects</H2>

      <P>
        The handler body runs every time the effect is performed. You can use
        this to collect values, count calls, or build up a result.
      </P>

      <CodeBlock
        runnable
        code={`effect Log {
  fn log(msg)
}

var logs = []
handle {
  perform Log.log("first")
  perform Log.log("second")
  perform Log.log("third")
} {
  Log.log(msg) => {
    logs.push(msg)
    resume(null)
  }
}
println(logs)                    -- ["first", "second", "third"]`}
      />

      <P>
        The <code>handle</code> form accepts a block as the computation, not
        just a function call.
      </P>

      <H2 id="multi-shot">Multi-shot resume</H2>

      <P>
        A handler arm can call <code>resume</code> more than once. Each call
        re-enters the captured continuation, running the rest of the
        computation again with the new value. This is the basis for
        non-determinism and search.
      </P>

      <CodeBlock
        runnable
        code={`effect Choose {
  fn pick() -> int
}

fn compute() {
  let x = perform Choose.pick()
  return x * 10
}

var results = []
handle {
  let r = compute()
  results.push(r)
} {
  Choose.pick() => {
    resume(1)
    resume(2)
    resume(3)
  }
}
println(results)                 -- [10, 20, 30]`}
      />

      <H2 id="vs-exceptions">Effects vs exceptions</H2>

      <P>
        Exceptions abort and unwind; there is no way to resume. Effects are
        resumable: the handler gets control, does something, and hands control
        back to the performing function. Use exceptions when the error is
        unrecoverable at the call site; use effects when the callee needs
        information or a capability that the caller should supply.
      </P>

      <Note>
        Effects on the <code>--emit c</code> target use setjmp/longjmp for
        single-shot handlers. Full multi-shot resume on the C target is
        still under development.
      </Note>
    </DocLayout>
  );
}
