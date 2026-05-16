import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "String methods · XS Reference" },
  description: "The complete list of methods available on every string value.",
};

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="string-methods" headings={headings}>
      <H1>String methods</H1>
      <Lead>The complete list of methods available on every string value.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        String methods cover case conversion, trimming, searching, splitting, replacing,
        padding, classification, and parsing. <code>.len()</code> counts Unicode codepoints,
        not bytes; use <code>.bytes().len()</code> for raw byte length. Indexing with{" "}
        <code>s[i]</code> works in bytes; negative indices count from the end and out-of-bounds
        returns <code>null</code>. Several methods have aliases: <code>.find()</code> /{" "}
        <code>.index_of()</code>, <code>.ltrim()</code> / <code>.trim_start()</code>, etc.
      </P>
      <Note>
        The <code>string</code> stdlib module provides additional utilities (levenshtein,
        similarity, HTML escaping, case conversion) beyond what&apos;s available as methods.
      </Note>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/string-methods" />
    </DocLayout>
  );
}
