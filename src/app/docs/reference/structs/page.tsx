import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Structs · XS Reference" },
  description: "Named product types with optional field defaults, impl blocks for methods, operator overloading, and struct-update spread syntax.",
};

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="structs" headings={headings}>
      <H1>Structs</H1>
      <Lead>Named product types with optional field defaults, impl blocks for methods, operator overloading, and struct-update spread syntax.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        Fields can carry type annotations and default values. Methods are added in separate{" "}
        <code>impl TypeName {"{ ... }"}</code> blocks; <code>self</code> is an explicit first
        parameter. Operator overloading works by naming a method with the operator symbol.
        The spread/update syntax <code>Type {"{ ...existing, field: val }"}</code> creates a
        new instance based on an existing one. The <code>derives</code> clause (or{" "}
        <code>#[derive(...)]</code>) auto-implements traits like <code>Eq</code> and{" "}
        <code>Hash</code>.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/structs" />
    </DocLayout>
  );
}
