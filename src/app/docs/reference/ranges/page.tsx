import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Ranges · XS Reference" },
  description: "Exclusive and inclusive integer ranges used in for loops, match patterns, and membership tests.",
};

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="ranges" headings={headings}>
      <H1>Ranges</H1>
      <Lead>Exclusive and inclusive integer ranges used in for loops, match patterns, and membership tests.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        <code>0..10</code> is exclusive (0 through 9); <code>0..=10</code> is inclusive (0
        through 10). Ranges are a first-class type; <code>type(r)</code> returns{" "}
        <code>"range"</code> and <code>len(r)</code> gives the count. The <code>in</code>{" "}
        operator tests membership. Range patterns work in <code>match</code> arms.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/ranges" />
    </DocLayout>
  );
}
