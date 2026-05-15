import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Strings, XS Reference" };

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="strings" headings={headings}>
      <H1>Strings</H1>
      <Lead>Single and double quotes are interchangeable; both support interpolation, escape sequences, format specs, and raw variants.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        Expressions inside <code>{"{braces}"}</code> are evaluated and embedded inline.
        An optional <code>:spec</code> after the expression controls formatting, following
        Python&apos;s mini-language for width, alignment, precision, and base. Triple-quoted
        strings handle multi-line text with automatic indentation stripping. Raw strings
        (<code>r"..."</code>) skip all escape processing and interpolation. Color strings
        (<code>c"bold;red;text"</code>) embed ANSI sequences at parse time. Concatenation uses{" "}
        <code>++</code>.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/strings" />
    </DocLayout>
  );
}
