import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "async, XS Stdlib" };

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="async" headings={headings}>
      <H1>async</H1>
      <Lead>Task spawning, async channels, and combinators for concurrent programming.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import async`} />

      <Note>
        XS also supports <code>async fn</code> / <code>await</code> syntax and the <code>spawn</code> keyword
        directly in the language. This module provides the underlying primitives.
      </Note>

      <H2 id="functions">Functions</H2>

      <H3 id="fn-spawn">{`async.spawn(fn: () -> any) -> task`}</H3>
      <P>Run a function as an async task, returning a task handle.</P>

      <H3 id="fn-sleep">{`async.sleep(secs: float)`}</H3>
      <P>Async sleep that yields control to other tasks.</P>

      <H3 id="fn-channel">{`async.channel() -> channel`}</H3>
      <P>Create an unbounded channel for passing values between tasks.</P>

      <H3 id="fn-select">{`async.select(channels: [channel]) -> any`}</H3>
      <P>Poll multiple channels and return the value from whichever is ready first.</P>

      <H3 id="fn-all">{`async.all(tasks: [task]) -> [any]`}</H3>
      <P>Wait for all tasks to complete and return an array of their results.</P>

      <H3 id="fn-race">{`async.race(tasks: [task]) -> any`}</H3>
      <P>Return the result of whichever task completes first.</P>

      <H3 id="fn-resolve">{`async.resolve(val: any) -> task`}</H3>
      <P>Create an already-resolved task with the given value.</P>

      <H3 id="fn-reject">{`async.reject(err: any) -> task`}</H3>
      <P>Create an already-rejected task with the given error.</P>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        noRun
        code={`import async

-- spawn two tasks and wait for both
let t1 = async.spawn(fn() {
    async.sleep(0.1)
    return "first"
})
let t2 = async.spawn(fn() {
    async.sleep(0.05)
    return "second"
})

let results = async.all([t1, t2])
println(results)  -- ["first", "second"]

-- race: first to finish wins
let winner = async.race([t1, t2])
println(winner)

-- channel
let ch = async.channel()
async.spawn(fn() { ch.send("hello") })
println(ch.recv())  -- hello`}
      />
    </DocLayout>
  );
}
