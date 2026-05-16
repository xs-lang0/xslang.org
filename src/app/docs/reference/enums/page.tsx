import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Enums · XS Reference" },
  description: "Sum types with optional associated data, accessed via Enum::Variant and destructured in pattern matching.",
};

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="enums" headings={headings}>
      <H1>Enums</H1>
      <Lead>Sum types with optional associated data, accessed via <code>Enum::Variant</code> and destructured in pattern matching.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        Simple enums have no payload; variants are accessed as <code>Color::Red</code>. Variants
        can carry positional data: <code>Shape::Circle(radius)</code>. Enums are matched with{" "}
        <code>match</code>, which can destructure the payload in the same arm. The semantic
        analyzer checks that match arms cover all variants when no wildcard is present. The
        internal limit is 256 variants per enum (C implementation constraint).
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/enums" />
    </DocLayout>
  );
}
