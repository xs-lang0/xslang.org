import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Numeric literals · XS Reference" },
  description: "Decimal, hex, binary, octal, and scientific notation for integers and floats.",
};

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="numeric-literals" headings={headings}>
      <H1>Numeric literals</H1>
      <Lead>Decimal, hex, binary, octal, and scientific notation for integers and floats.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        Integer literals can be written in decimal, hexadecimal (<code>0x</code>), binary{" "}
        (<code>0b</code>), or octal (<code>0o</code>). Underscores are allowed as digit separators
        anywhere in the literal. Float literals use a decimal point or scientific notation{" "}
        (<code>e</code>/<code>E</code> exponent). On overflow, integers silently promote to
        arbitrary-precision bigints.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/numeric-literals" />
    </DocLayout>
  );
}
