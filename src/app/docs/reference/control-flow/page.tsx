import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Control flow · XS Reference" },
  description: "if/elif/else, while, for, loop, break/continue, labeled loops, and break-with-value.",
};

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="control-flow" headings={headings}>
      <H1>Control flow</H1>
      <Lead>if/elif/else, while, for, loop, break/continue, labeled loops, and break-with-value.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        Braces are always required. <code>if</code> is an expression and returns the taken
        branch value. <code>for</code> iterates over arrays, ranges, strings, and maps
        (yielding key-value tuples when destructured). <code>loop</code> runs forever until{" "}
        <code>break</code>; <code>break val</code> makes the loop expression return that value.
        Labeled loops let you <code>break outer</code> or <code>continue outer</code> from a
        nested loop.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/control-flow" />
    </DocLayout>
  );
}
