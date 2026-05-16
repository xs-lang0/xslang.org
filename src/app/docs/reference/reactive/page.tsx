import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Reactive bindings · XS Reference" },
  description: "bind declares a name that auto-recomputes when any of its dependencies change.",
};

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="reactive" headings={headings}>
      <H1>Reactive bindings</H1>
      <Lead><code>bind</code> declares a name that auto-recomputes when any of its dependencies change.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        <code>bind total = price * qty</code> tracks which <code>var</code> bindings are
        read during the first evaluation. When any of them are reassigned, the bound expression
        re-runs and <code>total</code> updates. Cascading works: a binding that depends on
        another binding updates correctly when the chain changes. Reactivity runs on the
        interpreter, VM, and JIT. Transpiler targets (<code>--emit js/c/wasm</code>) lower{" "}
        <code>bind</code> to a plain <code>let</code> since static targets cannot hook variable
        mutation at runtime.
      </P>
      <Note>
        The older <code>signal()</code> / <code>derived()</code> / <code>subscribe()</code> API
        was removed in v1.2. <code>bind</code> covers the same use cases with less surface area.
      </Note>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/reactive-bindings" />
    </DocLayout>
  );
}
