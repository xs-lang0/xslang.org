import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Comprehensions and spread · XS Reference" },
  description: "List comprehensions, map comprehensions, and the spread operator for building collections concisely.",
};

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="comprehensions" headings={headings}>
      <H1>Comprehensions and spread</H1>
      <Lead>List comprehensions, map comprehensions, and the spread operator for building collections concisely.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        List comprehensions: <code>[expr for x in iterable if cond]</code>. Map comprehensions:{" "}
        <code>{"#{key: val for x in iterable if cond}"}</code>. Both support tuple destructuring
        in the binding position and an optional <code>if</code> filter. The spread operator
        (<code>...</code>) works in array literals, map literals, and struct update expressions.
        Struct spread creates a new instance while overriding specific fields.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/list-comprehensions" />
      <RefSnippet slug="reference/map-comprehensions" />
      <RefSnippet slug="reference/spread-operator" />
    </DocLayout>
  );
}
