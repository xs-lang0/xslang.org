import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Functions, XS Reference" };

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="functions" headings={headings}>
      <H1>Functions</H1>
      <Lead>Named functions, lambdas, closures, overloading, generics, and function attributes.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        The last expression in a body is the implicit return value. <code>fn double(x) = x * 2</code>{" "}
        is a shorthand for single-expression bodies. Default parameters and variadic (<code>...args</code>)
        are supported. Functions with the same name but different arities coexist as overloads; the
        first exact-arity match wins. Closures capture by reference and mutations are visible to the
        outer scope. Type parameters use <code>{"<T>"}</code>; trait bounds use <code>T: Trait</code>.
        Attributes like <code>@test</code>, <code>@deprecated</code>, and{" "}
        <code>@scoped</code> control static analysis behavior. <code>fn main()</code> is auto-called
        if defined.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/functions" />
    </DocLayout>
  );
}
