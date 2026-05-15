import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "CLI reference, XS Reference" };

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="cli" headings={headings}>
      <H1>CLI reference</H1>
      <Lead>All commands and flags exposed by the <code>xs</code> binary.</Lead>

      <H2 id="summary">Summary</H2>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/cli" />
    </DocLayout>
  );
}
