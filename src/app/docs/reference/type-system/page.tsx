import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Type system, XS Reference" };

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="type-system" headings={headings}>
      <H1>Type system</H1>
      <Lead>Gradual typing: unannotated code runs silently; annotations are checked statically before execution.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        Primitive types include <code>int</code>/<code>i64</code>, <code>float</code>/
        <code>f64</code>, <code>str</code>, <code>bool</code>, <code>re</code>, and{" "}
        <code>any</code>. Composite types cover arrays (<code>[int]</code>), tuples{" "}
        (<code>(int, str)</code>), optionals (<code>int?</code>), and function types{" "}
        (<code>fn(int) -&gt; int</code>). The checker catches assignment mismatches, wrong
        argument types, return type errors, and unknown type names. Running with{" "}
        <code>--strict</code> requires annotations everywhere; <code>--lenient</code> downgrades
        errors to warnings. Use <code>_</code> as a placeholder where you want inference. Type
        aliases are declared with <code>type UserId = i64</code>.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/type-system" />
    </DocLayout>
  );
}
