import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Arrays, XS Reference" };

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="arrays" headings={headings}>
      <H1>Arrays</H1>
      <Lead>Ordered, mutable, heterogeneous sequences with a large built-in method set.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        Mutating methods (<code>.push()</code>, <code>.pop()</code>, <code>.sort()</code>,{" "}
        <code>.reverse()</code>) modify in-place and return <code>null</code>. Non-mutating
        variants (<code>.sorted()</code>, <code>.reversed()</code>) return a new array. Negative
        indexing counts from the end; out-of-bounds throws an <code>IndexError</code>. Use{" "}
        <code>.get(i)</code> for a nullable lookup. The repeat syntax <code>[val; n]</code>{" "}
        creates an array with <code>n</code> copies of <code>val</code>. Spread with{" "}
        <code>[...arr, x]</code> builds a new array.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/arrays" />
    </DocLayout>
  );
}
