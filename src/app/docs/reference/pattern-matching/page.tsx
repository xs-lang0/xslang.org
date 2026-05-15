import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Pattern matching, XS Reference" };

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="pattern-matching" headings={headings}>
      <H1>Pattern matching</H1>
      <Lead><code>match</code> is an expression; its arms cover literals, tuples, structs, enums, ranges, slices, regex, string prefixes, or-patterns, and guards.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        <code>match</code> returns the value of the matched arm. A guard clause (<code>n if cond</code>)
        adds a runtime condition on top of a pattern. The <code>@</code> operator captures and
        tests simultaneously: <code>n @ 1..=10</code> binds <code>n</code> and requires it to be
        in range. Slice patterns (<code>[first, ..rest]</code>) destructure arrays. The semantic
        analyzer verifies exhaustiveness: every match must have a wildcard or cover all variants.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/pattern-matching" />
    </DocLayout>
  );
}
