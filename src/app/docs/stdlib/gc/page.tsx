import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "gc, XS Stdlib" };

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="gc" headings={headings}>
      <H1>gc</H1>
      <Lead>Manual control of the garbage collector for benchmarks and tight-loop tuning.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import gc`} />

      <Note>
        Day-to-day code doesn&apos;t need this module. The GC runs automatically.
        Use it only when you need precise control over collection timing.
      </Note>

      <H2 id="functions">Functions</H2>

      <H3 id="fn-collect">{`gc.collect()`}</H3>
      <P>Trigger a garbage collection cycle immediately.</P>

      <H3 id="fn-disable">{`gc.disable()`}</H3>
      <P>Disable automatic collection. Manual <code>gc.collect()</code> calls still work.</P>

      <H3 id="fn-enable">{`gc.enable()`}</H3>
      <P>Re-enable automatic collection after a <code>gc.disable()</code>.</P>

      <H3 id="fn-stats">{`gc.stats() -> map`}</H3>
      <P>Return a map of collection counters and current tracked-object counts.</P>

      <H3 id="fn-set-threshold">{`gc.set_threshold(n: int)`}</H3>
      <P>Set the allocation count threshold that triggers a young-generation collection.</P>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        runnable
        code={`import gc

-- check stats before
let before = gc.stats()
println(before)

-- disable, allocate a bunch, then collect manually
gc.disable()
let big = []
for i in 0..10000 { big.push(i) }
gc.collect()
gc.enable()

let after_stats = gc.stats()
println(after_stats)`}
      />
    </DocLayout>
  );
}
