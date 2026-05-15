import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Regex, XS Reference" };

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="regex" headings={headings}>
      <H1>Regex</H1>
      <Lead>Regex is a first-class type with literal syntax and a Thompson NFA engine.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        Regex literals use forward slashes: <code>/[0-9]+/</code>. The engine is a Thompson NFA
        supporting POSIX extended syntax plus <code>\d</code>, <code>\w</code>, <code>\s</code>{" "}
        shortcuts, non-greedy quantifiers (<code>*?</code>, <code>+?</code>), non-capturing
        groups (<code>(?:...)</code>), and positive and negative lookaheads. Methods on a regex
        value: <code>.test()</code>, <code>.match()</code>, <code>.replace()</code>, and{" "}
        <code>.source()</code>. Regex literals also work directly as <code>match</code> patterns.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/regex" />
    </DocLayout>
  );
}
