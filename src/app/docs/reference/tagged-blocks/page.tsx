import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Tagged blocks · XS Reference" },
  description: "User-defined control structures: define a tag, call it with a trailing block, and let the tag body control execution via yield.",
};

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="tagged-blocks" headings={headings}>
      <H1>Tagged blocks</H1>
      <Lead>User-defined control structures: define a tag, call it with a trailing block, and let the tag body control execution via <code>yield</code>.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        Tags are defined with <code>tag name(params) {"{ body }"}</code>. Callers pass a
        trailing block <code>name(args) {"{ ... }"}</code>. Inside the tag body,{" "}
        <code>yield</code> runs the caller&apos;s block and returns its value. The tag can
        yield multiple times (retry loops, timing wrappers) or conditionally. Tagged blocks
        desugar to regular function calls with the trailing block as a zero-argument lambda.
        They work at statement level and inside <code>let</code>/<code>var</code> assignments.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/tagged-blocks" />
    </DocLayout>
  );
}
