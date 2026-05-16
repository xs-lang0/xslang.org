import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "time, XS Stdlib · XS Docs" },
  description: "Wall-clock access, sleep, stopwatch, and timestamp formatting.",
};

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="time" headings={headings}>
      <H1>time</H1>
      <Lead>Wall-clock access, sleep, stopwatch, and timestamp formatting.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import time`} />

      <H2 id="functions">Functions</H2>

      <H3 id="fn-now">{`time.now() -> float`}</H3>
      <P>Current Unix timestamp as a float (seconds since epoch).</P>

      <H3 id="fn-now-ms">{`time.now_ms() -> int`}</H3>
      <P>Current time in milliseconds since epoch.</P>

      <H3 id="fn-clock">{`time.clock() -> float`}</H3>
      <P>Monotonic clock value in seconds - use this for timing, not <code>now()</code>. Also available as <code>time.monotonic()</code>.</P>

      <H3 id="fn-millis">{`time.millis() -> int`}</H3>
      <P>Current time in milliseconds (alias for <code>now_ms</code>).</P>

      <H3 id="fn-sleep">{`time.sleep(secs: float)`}</H3>
      <P>Sleep the current thread for the given number of seconds. Accepts fractional values.</P>

      <H3 id="fn-sleep-ms">{`time.sleep_ms(ms: int)`}</H3>
      <P>Sleep for the given number of milliseconds.</P>

      <H3 id="fn-stopwatch">{`time.stopwatch() -> map`}</H3>
      <P>Returns a stopwatch object with an <code>elapsed()</code> method that returns seconds since creation.</P>

      <H3 id="fn-format">{`time.format(t: float, fmt: str) -> str`}</H3>
      <P>Format a Unix timestamp as a string using a strftime-style format string.</P>

      <H3 id="fn-parse">{`time.parse(s: str, fmt: str) -> float`}</H3>
      <P>Parse a formatted time string into a Unix timestamp.</P>

      <H3 id="fn-components">Components</H3>
      <P>
        <code>time.year(t)</code>, <code>time.month(t)</code>, <code>time.day(t)</code>,{" "}
        <code>time.hour(t)</code>, <code>time.minute(t)</code>, <code>time.second(t)</code> - extract individual components from a timestamp.
      </P>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        runnable
        code={`import time

let t = time.now()
println("unix time: {t}")

-- stopwatch
let sw = time.stopwatch()
-- do some work
println("elapsed: {sw.elapsed()}s")

-- components
let y = time.year(t)
let m = time.month(t)
let d = time.day(t)
println("{y}-{m}-{d}")

-- format
println(time.format(t, "%Y-%m-%d %H:%M:%S"))`}
      />
    </DocLayout>
  );
}
