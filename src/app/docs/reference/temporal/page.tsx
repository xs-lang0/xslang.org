import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, Lead, P, Note } from "@/components/prose";
import Link from "next/link";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Temporal decorators · XS Reference" },
  description: "Scheduling via decorators: @every, @delayed, @cron, @watch.",
};

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "every", label: "@every", level: 2 },
  { id: "delayed", label: "@delayed", level: 2 },
  { id: "cron", label: "@cron", level: 2 },
  { id: "watch", label: "@watch", level: 2 },
  { id: "lifetime", label: "Runtime lifetime", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="temporal" headings={headings}>
      <H1>Temporal decorators</H1>
      <Lead>
        Scheduling decorators register a named function with the runtime so it
        fires without a direct caller. Every form takes a <code>Duration</code>
        {" "}literal (or a plain number, treated as milliseconds).
      </Lead>

      <H2 id="summary">Summary</H2>
      <P>
        Four decorators cover scheduling: <code>@every(dur)</code> for an
        interval, <code>@delayed(dur)</code> for a one-shot delay,{" "}
        <code>@cron("expr")</code> for cron expressions, and{" "}
        <code>@watch("path")</code> for filesystem changes. They attach to a
        named function declaration, not to a bare block. The earlier
        statement-form syntax (<code>every 1s {`{`} ... {`}`}</code>) is no
        longer accepted; the parser only knows the decorator form.
      </P>

      <H2 id="every">@every</H2>
      <P>Repeats the body at a fixed interval.</P>
      <CodeBlock
        noRun
        code={`@every(1s)
fn tick() {
    metrics.flush()
}`}
      />

      <H2 id="delayed">@delayed</H2>
      <P>Runs the body once after the given delay, then unregisters.</P>
      <CodeBlock
        noRun
        code={`@delayed(500ms)
fn warmup() {
    prefetch()
}`}
      />

      <H2 id="cron">@cron</H2>
      <P>
        Takes a five-field cron expression (<code>min hour day month
        weekday</code>) and fires whenever the local clock matches.
      </P>
      <CodeBlock
        noRun
        code={`@cron("0 9 * * 1-5")
fn weekday_morning() {
    digest.send()
}`}
      />

      <H2 id="watch">@watch</H2>
      <P>
        Fires whenever the watched path changes on disk. Useful for hot-reload
        loops in development.
      </P>
      <CodeBlock
        noRun
        code={`@watch("./config.toml")
fn reload() {
    config.reload()
}`}
      />

      <H2 id="lifetime">Runtime lifetime</H2>
      <P>
        The runtime stays alive while any persistent trigger is registered.
        Once every <code>@delayed</code> has fired and every <code>@every</code>
        / <code>@cron</code> / <code>@watch</code> has been quiesced (typically
        with <code>@once</code>), the process exits naturally.{" "}
        <code>xs.exit(n)</code> forces a shutdown and still fires{" "}
        <code>@on_exit</code> handlers.
      </P>
      <Note>
        <code>@once</code> only composes with a repeating trigger. Stacked as{" "}
        <code>@once @every(5s) fn hb() {`{`} ... {`}`}</code>, it makes the
        trigger fire exactly once. Attaching it to a one-shot decorator is a
        parse error.
      </Note>

      <P>
        See also <Link href="/docs/reference/decorators" className="text-[color:var(--link)]">decorators</Link>{" "}
        for the full list (lifecycle, signal, discovery, wrapping).
      </P>
    </DocLayout>
  );
}
