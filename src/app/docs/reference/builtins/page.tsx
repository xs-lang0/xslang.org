import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Built-in functions, XS Reference" };

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="builtins" headings={headings}>
      <H1>Built-in functions</H1>
      <Lead>Everything available without an import: I/O, type checking, conversion, math, collections, functional helpers, and debugging.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        Built-ins are always in scope. I/O: <code>println</code>, <code>print</code>,{" "}
        <code>eprintln</code>, <code>input</code>. Type: <code>type()</code>, <code>typeof()</code>,
        and the <code>is_*</code> predicates. Conversion: <code>int()</code>, <code>float()</code>,
        <code>str()</code>, <code>bool()</code>, <code>chr()</code>, <code>ord()</code>. Math:
        <code>abs</code>, <code>min</code>, <code>max</code>, <code>sqrt</code>, <code>floor</code>,
        <code>ceil</code>, <code>round</code>. Collections: <code>len</code>, <code>range</code>,
        <code>enumerate</code>, <code>zip</code>, <code>flatten</code>, <code>sorted</code>,
        <code>sum</code>. Functional: <code>map</code>, <code>filter</code>, <code>reduce</code>.
        Debugging: <code>assert</code>, <code>assert_eq</code>, <code>dbg</code>, <code>repr</code>,
        <code>pprint</code>, <code>panic</code>, <code>todo</code>, <code>unreachable</code>.
        Constants: <code>PI</code>, <code>E</code>, <code>INF</code>, <code>NAN</code>.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/built-in-functions" />
    </DocLayout>
  );
}
