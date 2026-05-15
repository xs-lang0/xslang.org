import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Algebraic effects, XS Reference" };

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="effects" headings={headings}>
      <H1>Algebraic effects</H1>
      <Lead>Declare an effect, perform it at the call site, and handle it further up the stack - all without knowing the handler in advance.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        Effects are declared with <code>effect Name {"{ fn op(args) -> RetType }"}</code>.
        Code performs an operation with <code>perform Name.op(args)</code>, which suspends until
        a handler intercepts it. Handlers use <code>handle expr {"{ Name.op(args) => resume(val) }"}</code>.
        <code>resume</code> returns a value to the perform site and execution continues from
        there. Multi-shot resume lets a handler call <code>resume</code> more than once from a
        single perform, useful for backtracking and non-determinism. On the VM and JIT, a stack
        snapshot is captured at perform time and replayed for each resume.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/algebraic-effects" />
    </DocLayout>
  );
}
