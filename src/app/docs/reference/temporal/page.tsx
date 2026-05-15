import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Temporal primitives, XS Reference" };

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="temporal" headings={headings}>
      <H1>Temporal primitives</H1>
      <Lead>Scheduling constructs built into the language: <code>every</code>, <code>after</code>, <code>timeout</code>, and <code>debounce</code>.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        All four forms take a <code>Duration</code> (or a plain number interpreted as
        milliseconds) and a block. <code>every 1s {"{ ... }"}</code> runs the block on that
        interval. <code>after 500ms {"{ ... }"}</code> runs it once after a delay.{" "}
        <code>timeout 2s {"{ ... } else { ... }"}</code> runs the first block with a time
        limit and falls back to the else block. <code>debounce 300ms {"{ ... }"}</code> defers
        execution until the interval has passed without another call. In the interpreter,
        <code>every</code> fires once (deterministic script execution); when transpiled to JS it
        maps to <code>setInterval</code>.
      </P>
      <Note>
        These are syntax constructs, not functions from a module. They work without any import.
      </Note>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/temporal-primitives" />
    </DocLayout>
  );
}
