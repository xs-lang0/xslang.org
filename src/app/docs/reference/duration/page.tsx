import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Duration, XS Reference" };

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="duration" headings={headings}>
      <H1>Duration</H1>
      <Lead>First-class duration literals with suffixes, arithmetic, and component accessors. No import required.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        Write a number immediately followed by a suffix: <code>5s</code>, <code>200ms</code>,{" "}
        <code>100ns</code>, <code>2m30s</code>. Supported suffixes: <code>ns</code>,{" "}
        <code>us</code>, <code>ms</code>, <code>s</code>, <code>m</code>, <code>h</code>,{" "}
        <code>d</code>. Internally stored as an <code>int64_t</code> nanosecond count with no
        float drift. Duration arithmetic: adding/subtracting durations gives a duration;
        dividing two durations gives a float ratio; multiplying by a scalar gives a duration.
        Comparing against a non-duration is a type error. Component accessors (<code>.s</code>,
        <code>.ms</code>, etc.) read the value in that unit. The repr picks the largest
        readable unit, so <code>90s</code> prints as <code>1m30s</code>.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/duration" />
    </DocLayout>
  );
}
