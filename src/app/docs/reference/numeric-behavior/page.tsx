import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Numeric behavior, XS Reference" };

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="numeric-behavior" headings={headings}>
      <H1>Numeric behavior</H1>
      <Lead>Integer division, modulo semantics, division by zero, float-to-int conversion, and overflow promotion.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        <code>/</code> truncates toward zero for integers (so <code>-7 / 2</code> is{" "}
        <code>-3</code>, not <code>-4</code>). <code>//</code> is floor division, which rounds
        toward negative infinity. Modulo sign follows the dividend. Division by zero raises a
        catchable runtime error; guard the divisor or wrap in <code>try/catch</code>.{" "}
        <code>int(x)</code> truncates toward zero. Integers automatically promote to
        arbitrary-precision bigints on overflow, with no action required.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/numeric-behavior" />
    </DocLayout>
  );
}
