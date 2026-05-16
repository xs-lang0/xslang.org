import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Variables · XS Reference" },
  description: "Three binding forms, reactive bindings, contracts, and destructuring.",
};

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="variables" headings={headings}>
      <H1>Variables</H1>
      <Lead>Three binding forms, reactive bindings, contracts, and destructuring.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        <code>let</code> is immutable (reassignment is a runtime error), <code>var</code> is
        mutable, and <code>const</code> is identical to <code>let</code> at runtime but signals
        intent. All three accept optional type annotations. <code>bind</code> creates a reactive
        binding that recomputes automatically when its dependencies change; cascading is supported.
        <code>where</code> clauses add runtime-checked contracts to any binding or function
        parameter. Array, tuple, and struct destructuring work in any binding position.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/variables" />
    </DocLayout>
  );
}
