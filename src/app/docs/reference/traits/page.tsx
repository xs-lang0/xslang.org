import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Traits · XS Reference" },
  description: "Named interfaces with default method implementations, supertrait requirements, associated types, and static checking.",
};

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="traits" headings={headings}>
      <H1>Traits</H1>
      <Lead>Named interfaces with default method implementations, supertrait requirements, associated types, and static checking.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        A trait declares method signatures; types implement them with{" "}
        <code>impl TraitName for TypeName</code>. Default implementations can be overridden.
        Supertraits require another trait to be implemented first. Associated types let a trait
        declare type names that implementing types define. The semantic analyzer enforces the
        orphan rule (no implementing foreign traits for foreign types), missing required methods,
        and signature mismatches.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/traits" />
    </DocLayout>
  );
}
