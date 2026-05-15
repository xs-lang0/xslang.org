import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Temporal decorators, XS Reference" };

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="temporal" headings={headings}>
      <H1>Temporal decorators</H1>
      <Lead>Scheduling via decorators: <code>@every</code>, <code>@after</code>, and <code>@cron</code>.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        Apply <code>@every(duration)</code> to a function to run it repeatedly at a fixed interval.
        Apply <code>@after(duration)</code> to run it once after a delay. Apply{" "}
        <code>@cron("expr")</code> to run it on a cron schedule. All three forms accept a{" "}
        <code>Duration</code> literal (or a plain number treated as milliseconds).
        These are decorator forms - they attach to a named function declaration, not to a bare block.
      </P>
      <Note>
        Temporal decorators keep the runtime alive while registered. They require an active event loop
        to fire (i.e., the program must not exit immediately). Use <code>@on_start</code> and{" "}
        <code>@on_exit</code> alongside them when you need boot/teardown hooks.
      </Note>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/temporal-primitives" />
    </DocLayout>
  );
}
