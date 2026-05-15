import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Concurrency, XS Reference" };

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="concurrency" headings={headings}>
      <H1>Concurrency</H1>
      <Lead>Spawn, async/await, channels, actors, and nurseries for structured concurrency.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        <code>spawn {"{ block }"}</code> runs on a real OS thread; <code>await t</code> blocks
        until it finishes and returns the body&apos;s value. Bytecode execution is GIL-serialized,
        but blocking calls (sleep, channel recv, I/O) release the GIL so siblings actually run.
        Channels are FIFO queues; bounded channels block the sender when full. <code>close()</code>{" "}
        marks a channel done; <code>recv</code> on a drained closed channel returns{" "}
        <code>null</code>; <code>recv_pair()</code> distinguishes a sent <code>null</code> from
        a closed channel. <code>select([ch1, ch2])</code> returns the first ready channel.
        Actors encapsulate state and respond to typed method calls or raw messages via{" "}
        <code>!</code>. Nurseries guarantee all spawned tasks finish before the nursery exits;
        one task throwing cancels siblings cooperatively.
      </P>
      <Note>
        <code>async fn</code> / <code>await</code> is a lightweight wrapper around{" "}
        <code>spawn</code>; both produce awaitables that can be passed to nurseries.
      </Note>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/concurrency" />
    </DocLayout>
  );
}
