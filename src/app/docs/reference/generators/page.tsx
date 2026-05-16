import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Generators · XS Reference" },
  description: "Generator functions use fn* and yield to produce values lazily on demand.",
};

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="generators" headings={headings}>
      <H1>Generators</H1>
      <Lead>Generator functions use <code>fn*</code> and <code>yield</code> to produce values lazily on demand.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        A generator function is declared with <code>fn*</code>. Each <code>yield</code> pauses
        execution and emits a value; the function resumes when the next value is requested.
        Generators integrate directly with <code>for..in</code> loops, so they work anywhere
        an iterable is expected.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/generators" />
    </DocLayout>
  );
}
