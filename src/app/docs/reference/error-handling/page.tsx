import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Error handling · XS Reference" },
  description: "try/catch/finally, throw, panic, and defer for recoverable and unrecoverable errors.",
};

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="error-handling" headings={headings}>
      <H1>Error handling</H1>
      <Lead><code>try/catch/finally</code>, <code>throw</code>, <code>panic</code>, and <code>defer</code> for recoverable and unrecoverable errors.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        Any value can be thrown: strings, ints, maps, whatever makes sense. <code>finally</code>{" "}
        always runs, even when an exception is thrown. <code>panic(msg)</code> terminates
        immediately and is not catchable. <code>defer</code> schedules a block to run on
        function return, in LIFO order, even through exceptions. <code>todo()</code> and{" "}
        <code>unreachable()</code> both panic and are used as code-structure markers.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/error-handling" />
    </DocLayout>
  );
}
