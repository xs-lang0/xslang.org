import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Decorators, XS Reference" };

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="decorators" headings={headings}>
      <H1>Decorators</H1>
      <Lead>Two categories: trigger decorators that schedule a function, and wrapping decorators that intercept every call.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        Trigger decorators (<code>@on_start</code>, <code>@on_exit</code>, <code>@every(dur)</code>,
        <code>@cron("...")</code>, <code>@delayed(dur)</code>, <code>@watch("path")</code>,
        <code>@on_signal("INT")</code>) fire the function automatically; the runtime stays alive
        while persistent triggers are registered. Wrapping decorators (<code>@memoize</code>,{" "}
        <code>@retry(n)</code>, <code>@trace</code>, <code>@timed</code>) replace the bound name
        with a dispatcher that intercepts calls and delegates to the original. Multiple decorators
        compose in declaration order, outermost first. <code>@once</code> only composes with
        repeating triggers and makes them fire exactly once.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/decorators" />
    </DocLayout>
  );
}
