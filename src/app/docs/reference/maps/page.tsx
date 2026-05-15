import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Maps, XS Reference" };

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="maps" headings={headings}>
      <H1>Maps</H1>
      <Lead>Hash maps with insertion-order iteration and a <code>#{"{}"}</code> literal syntax.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        Map literals use <code>#{"{"}</code>/<code>{"}"}</code> to distinguish them from blocks.
        Keys can be strings or integers. Access uses bracket notation; setting a new key creates
        it. Iteration over a map yields keys in insertion order. Maps support spread with{" "}
        <code>{"#{...m, key: val}"}</code>. The <code>.merge()</code> method produces a new map
        where the right side wins on key conflicts.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/maps" />
    </DocLayout>
  );
}
