import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "tracing, XS Stdlib" };

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "levels", label: "Log levels", level: 2 },
  { id: "sinks", label: "Sinks", level: 2 },
  { id: "spans", label: "Spans", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="tracing" headings={headings}>
      <H1>tracing</H1>
      <Lead>Structured logging and span-based distributed tracing with pluggable sinks.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import tracing`} />

      <H2 id="levels">Log levels</H2>

      <H3 id="fn-set-level">{`tracing.set_level(level: str)`}</H3>
      <P>Set the minimum level. Levels in order: <code>"trace"</code>, <code>"debug"</code>, <code>"info"</code>, <code>"warn"</code>, <code>"error"</code>. Messages below the level are dropped.</P>

      <H3 id="fn-get-level">{`tracing.get_level() -> str`}</H3>
      <P>Return the current minimum level string.</P>

      <H3 id="fn-log-shortcuts">Shortcut emitters</H3>
      <P>
        <code>tracing.trace(msg, attrs?)</code>,{" "}
        <code>tracing.debug(msg, attrs?)</code>,{" "}
        <code>tracing.info(msg, attrs?)</code>,{" "}
        <code>tracing.warn(msg, attrs?)</code>,{" "}
        <code>tracing.error(msg, attrs?)</code>{" "}
        - emit a structured event at the named level. The optional <code>attrs</code> map is merged into the record.
      </P>

      <H3 id="fn-event">{`tracing.event(level: str, msg: str, attrs?: map)`}</H3>
      <P>Emit a single event at an arbitrary level.</P>

      <H2 id="sinks">Sinks</H2>

      <H3 id="fn-add-sink">{`tracing.add_sink(fn: (record: map) -> void)`}</H3>
      <P>Register a sink function called for every record that passes the level filter. Records carry <code>name</code>, <code>level</code>, <code>ts</code> (epoch nanoseconds), and <code>kind</code> (<code>"event"</code> or <code>"span"</code>).</P>

      <H3 id="fn-remove-sinks">{`tracing.remove_sinks()`}</H3>
      <P>Clear all registered sinks.</P>

      <H3 id="fn-console-sink">{`tracing.console_sink(record: map)`}</H3>
      <P>Built-in sink that writes colorized text to stderr. Pass to <code>add_sink</code>.</P>

      <H3 id="fn-json-sink">{`tracing.json_sink(record: map)`}</H3>
      <P>Built-in sink that writes one JSON line per record to stderr. Use <code>tracing.json_sink_path(path)</code> to redirect to a file.</P>

      <H3 id="fn-json-sink-path">{`tracing.json_sink_path(path?: str)`}</H3>
      <P>Set the output file for <code>json_sink</code>. Omit path to reset to stderr.</P>

      <H2 id="spans">Spans</H2>

      <H3 id="fn-start-span">{`tracing.start_span(name: str, attrs?: map) -> handle`}</H3>
      <P>Open a span and return a handle. The span is open until <code>end_span</code> is called.</P>

      <H3 id="fn-end-span">{`tracing.end_span(handle: map, attrs?: map)`}</H3>
      <P>Close a span. Fires all sinks with a span record including <code>duration_ns</code>.</P>

      <H3 id="fn-with-span">{`tracing.with_span(name: str, fn: () -> any) -> any`}</H3>
      <P>Run a function inside a span. <code>end_span</code> is called even if the function throws. Returns the function&apos;s result.</P>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        runnable
        code={`import tracing

tracing.add_sink(tracing.console_sink)
tracing.set_level("debug")

tracing.info("server started", #{"port": 8080})
tracing.warn("high memory usage", #{"mb": 512})

let result = tracing.with_span("db.query", fn() {
    -- simulate work
    tracing.debug("running query")
    return 42
})
println(result)  -- 42`}
      />
    </DocLayout>
  );
}
