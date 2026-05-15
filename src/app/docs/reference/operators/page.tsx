import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Operators, XS Reference" };

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="operators" headings={headings}>
      <H1>Operators</H1>
      <Lead>Arithmetic, comparison, logical, bitwise, pipe, membership, type, and compound assignment operators with a full precedence table.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        Assignment has the lowest precedence; postfix access and call have the highest.
        The pipe operator <code>|&gt;</code> rebinds <code>x |&gt; f</code> as <code>f(x)</code>{" "}
        and chains left-to-right. Null coalescing (<code>??</code>) returns the left operand
        if it is not <code>null</code>. Optional chaining (<code>?.</code>) short-circuits to{" "}
        <code>null</code> instead of throwing on a missing field. The spaceship operator{" "}
        (<code>&lt;=&gt;</code>) returns <code>-1</code>, <code>0</code>, or <code>1</code>.{" "}
        Logical <code>and</code>/<code>or</code> short-circuit and return the last evaluated
        operand, not a boolean.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/operators" />
    </DocLayout>
  );
}
