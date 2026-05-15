import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Modules and imports, XS Reference" };

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="modules" headings={headings}>
      <H1>Modules and imports</H1>
      <Lead><code>import</code> for stdlib, <code>use</code> for files or directories, and inline <code>module</code> blocks for declaring sub-namespaces.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        Standard library modules require an explicit <code>import math</code>; the semantic
        analyzer rejects references to stdlib names without a matching import. File imports use{" "}
        <code>use "path/to/file.xs"</code>; the module name defaults to the filename stem.
        Both forms accept <code>as alias</code> and selective imports with{" "}
        <code>{"from mod import { name }"}</code>. Importing a directory with{" "}
        <code>use "dir/"</code> loads all <code>.xs</code> files in it. Inline modules are
        declared with <code>module Name {"{ ... }"}</code> and accessed by name.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/modules-and-imports" />
    </DocLayout>
  );
}
