import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Number methods, XS Reference" };

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="number-methods" headings={headings}>
      <H1>Number methods</H1>
      <Lead>Methods available directly on integer and float values.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        Numbers in XS are first-class objects. Common methods: <code>.abs()</code>,{" "}
        <code>.clamp(lo, hi)</code>, <code>.to_str()</code>, <code>.is_even()</code>, and{" "}
        <code>.is_odd()</code>. Call them directly on literals with parentheses:{" "}
        <code>(-5).abs()</code>. For a broader set of math operations, use the{" "}
        <code>math</code> stdlib module.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/number-methods" />
    </DocLayout>
  );
}
