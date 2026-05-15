import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Duration and temporal, XS Guide" };

export const headings: Heading[] = [
  { id: "duration-literals", label: "Duration literals", level: 2 },
  { id: "arithmetic", label: "Arithmetic and accessors", level: 2 },
  { id: "temporal", label: "Temporal decorators", level: 2 },
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

      <H2 id="temporal">Temporal decorators</H2>

      <P>
        To schedule a function to run on an interval or after a delay, use the
        decorator forms. These work on any named function declaration.
      </P>

      <P>
        <strong>@every</strong> runs the decorated function repeatedly at a
        fixed interval:
      </P>

      <CodeBlock
        noRun
        code={`@every(1s)
fn tick() {
  println("tick")
}`}
      />

      <P>
        <strong>@after</strong> runs the function once after the given delay:
      </P>

      <CodeBlock
        noRun
        code={`@after(500ms)
fn delayed() {
  println("delayed hello")
}`}
      />

      <P>
        <strong>@cron</strong> accepts a standard cron expression string:
      </P>

      <CodeBlock
        noRun
        code={`@cron("0 9 * * 1-5")
fn weekday_morning() {
  println("good morning")
}`}
      />

      <Note>
        Temporal decorators keep the runtime alive while registered. Use them
        with event loops and server processes. The <code>@every</code> decorator
        is more useful than a bare loop because the runtime can sleep between
        ticks and release the GIL.
      </Note>
    </DocLayout>
  );
}
