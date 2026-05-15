import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Data types, XS Reference" };

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="data-types" headings={headings}>
      <H1>Data types</H1>
      <Lead>Every value in XS has a type; the built-in ones cover the full range from scalars to collections.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        Integers are 64-bit signed and promote automatically to arbitrary-precision bigints on
        overflow. Floats are IEEE 754 double-precision. Strings accept single or double quotes.
        Arrays, tuples, maps, ranges, and regexes are all first-class. The <code>type()</code>{" "}
        function returns the lowercase type name at runtime.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/data-types" />
    </DocLayout>
  );
}
