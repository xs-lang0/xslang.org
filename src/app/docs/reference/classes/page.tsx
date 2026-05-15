import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Classes, XS Reference" };

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="classes" headings={headings}>
      <H1>Classes</H1>
      <Lead>Classes add constructors, field defaults, and single inheritance on top of the struct/impl model.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        The constructor method is always named <code>init</code>. Instantiate with{" "}
        <code>ClassName(args)</code>. Fields can have defaults declared directly in the class
        body. Inheritance uses <code>class Dog : Animal</code>; subclasses call{" "}
        <code>super.init(...)</code> to initialize parent fields. Methods can be overridden.
        Classes and structs/impl coexist in XS; use structs when you don&apos;t need
        inheritance.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/classes" />
    </DocLayout>
  );
}
