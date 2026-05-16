import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Tuples · XS Reference" },
  description: "Immutable fixed-size sequences; accessed by numeric index.",
};

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="tuples" headings={headings}>
      <H1>Tuples</H1>
      <Lead>Immutable fixed-size sequences; accessed by numeric index.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        Tuples are written with parentheses: <code>(1, "hello", true)</code>. Elements are
        accessed with <code>.0</code>, <code>.1</code>, etc. They are immutable and fixed-length.{" "}
        <code>len(t)</code> returns the element count. Tuples are commonly used as multiple
        return values and in destructuring bindings.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/tuples" />
    </DocLayout>
  );
}
