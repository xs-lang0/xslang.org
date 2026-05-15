import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Duration and temporal, XS Guide" };

export const headings: Heading[] = [
  { id: "duration-literals", label: "Duration literals", level: 2 },
  { id: "arithmetic", label: "Arithmetic and accessors", level: 2 },
  { id: "temporal", label: "Temporal primitives", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="guide" slug="duration" headings={headings}>
      <H1>Duration and temporal</H1>
      <Lead>
        Duration is a first-class type. Write <code>5s</code>,{" "}
        <code>200ms</code>, <code>2m30s</code> anywhere a value is expected.
        No import required.
      </Lead>

      <H2 id="duration-literals">Duration literals</H2>

      <P>
        Append a time suffix immediately after a number (no whitespace).
        Supported suffixes: <code>ns</code>, <code>us</code>, <code>ms</code>,{" "}
        <code>s</code>, <code>m</code>, <code>h</code>, <code>d</code>.
        Compound forms like <code>2m30s</code> or <code>1h15m</code> work too.
      </P>

      <CodeBlock
        runnable
        code={`let timeout = 5s
let frame   = 200ms
let warmup  = 2m30s
let tick    = 100ns

println(timeout)                 -- 5s
println(warmup)                  -- 2m30s
println(warmup + 1s)             -- 2m31s`}
      />

      <P>
        Internally, every duration is a 64-bit integer count of nanoseconds.
        The repr picks the largest readable unit and trims trailing zeros:
        <code>1500ns</code> prints as <code>1.5us</code>, <code>90s</code>{" "}
        prints as <code>1m30s</code>.
      </P>

      <H2 id="arithmetic">Arithmetic and accessors</H2>

      <P>
        Duration arithmetic is exact (integer nanoseconds, no float drift).
        Dividing two durations gives a float ratio.
      </P>

      <CodeBlock
        runnable
        code={`let a = 1s
let b = 500ms
println(a + b)                   -- 1.5s
println(a - b)                   -- 500ms
println(a * 3)                   -- 3s
println(a / b)                   -- 2.0 (ratio)

let dt = 750ms
println(dt.ns)                   -- 750000000
println(dt.s)                    -- 0.75
println(dt.ms)                   -- 750.0`}
      />

      <P>
        Component accessors: <code>.ns</code> returns an int; <code>.us</code>,{" "}
        <code>.ms</code>, <code>.s</code>, <code>.m</code>, <code>.h</code>,{" "}
        <code>.d</code> return floats.
      </P>

      <H2 id="temporal">Temporal primitives</H2>

      <P>
        Scheduling constructs take a duration. They also accept plain numbers
        interpreted as milliseconds for compatibility.
      </P>

      <P>
        <strong>every</strong> runs a block repeatedly at a fixed interval. In
        the interpreter, the body runs once for deterministic script execution.
        Transpiled to JS, it maps to <code>setInterval</code>.
      </P>

      <CodeBlock
        noRun
        code={`every 1s {
  println("tick")
}`}
      />

      <P>
        <strong>after</strong> runs a block once after a delay:
      </P>

      <CodeBlock
        noRun
        code={`after 500ms {
  println("delayed hello")
}`}
      />

      <P>
        <strong>timeout</strong> runs a block with a time limit. If it
        finishes in time, the result is used. Otherwise the <code>else</code>{" "}
        fallback runs:
      </P>

      <CodeBlock
        noRun
        code={`timeout 2s {
  let result = slow_computation()
  println(result)
} else {
  println("timed out")
}`}
      />

      <P>
        <strong>debounce</strong> coalesces repeated calls: if the block is
        triggered more than once within the window, only the last call actually
        runs.
      </P>

      <CodeBlock
        noRun
        code={`var query = ""
fn on_input(text) {
  query = text
  debounce 300ms {
    println("search: {query}")
  }
}`}
      />

      <Note>
        Temporal primitives are more useful in scripts that run a server or
        event loop. The <code>every</code> and <code>@every</code> decorator
        both keep the runtime alive while registered.
      </Note>
    </DocLayout>
  );
}
