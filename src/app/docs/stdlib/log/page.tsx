import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "log, XS Stdlib · XS Docs" },
  description: "Simple leveled logging to stderr.",
};

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="log" headings={headings}>
      <H1>log</H1>
      <Lead>Simple leveled logging to stderr.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import log`} />

      <Note>
        For structured logging with sinks, spans, and JSON output, see the <code>tracing</code> module.
      </Note>

      <H2 id="functions">Functions</H2>

      <H3 id="fn-debug">{`log.debug(msg: str)`}</H3>
      <P>Log a debug message.</P>

      <H3 id="fn-info">{`log.info(msg: str)`}</H3>
      <P>Log an info message.</P>

      <H3 id="fn-warn">{`log.warn(msg: str)`}</H3>
      <P>Log a warning message.</P>

      <H3 id="fn-error">{`log.error(msg: str)`}</H3>
      <P>Log an error message.</P>

      <H3 id="fn-set-level">{`log.set_level(level: str)`}</H3>
      <P>Set the minimum log level. Messages below this level are silenced. Levels in order: <code>"debug"</code>, <code>"info"</code>, <code>"warn"</code>, <code>"error"</code>.</P>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        runnable
        code={`import log

log.info("server started")
log.warn("disk space low")
log.error("connection failed")
log.debug("connecting to host")

-- suppress everything below warn
log.set_level("warn")
log.debug("this won't print")
log.info("this won't print either")
log.warn("this will print")`}
      />
    </DocLayout>
  );
}
