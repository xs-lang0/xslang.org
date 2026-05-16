import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "thread, XS Stdlib · XS Docs" },
  description: "OS-level thread spawning and thread identification.",
};

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="thread" headings={headings}>
      <H1>thread</H1>
      <Lead>OS-level thread spawning and thread identification.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import thread`} />

      <Note>
        Threads share the GIL. Blocking I/O, channel receives, and <code>sleep</code> release the GIL
        so spawned threads can run in true parallel during those waits. For task-based concurrency
        without directly managing OS threads, use the <code>async</code> module or the <code>spawn</code> keyword.
      </Note>

      <H2 id="functions">Functions</H2>

      <H3 id="fn-spawn">{`thread.spawn(fn: () -> any) -> handle`}</H3>
      <P>Spawn a new OS thread and return a handle. Call <code>.join()</code> on the handle to wait for completion.</P>

      <H3 id="fn-id">{`thread.id() -> int`}</H3>
      <P>Current thread ID.</P>

      <H3 id="fn-cpu-count">{`thread.cpu_count() -> int`}</H3>
      <P>Number of logical CPU cores available.</P>

      <H3 id="fn-sleep">{`thread.sleep(secs: float)`}</H3>
      <P>Sleep the current thread for the given number of seconds.</P>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        noRun
        code={`import thread

println("cores: {thread.cpu_count()}")

let t = thread.spawn(fn() {
    thread.sleep(0.1)
    println("from thread {thread.id()}")
    return 42
})

println("main thread: {thread.id()}")
let result = t.join()
println("thread returned: {result}")`}
      />
    </DocLayout>
  );
}
