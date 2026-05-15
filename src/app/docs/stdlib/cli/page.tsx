import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "cli, XS Stdlib" };

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="cli" headings={headings}>
      <H1>cli</H1>
      <Lead>Declarative command-line argument parsing.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import cli`} />

      <Note>
        The parser is built up declaratively then <code>cli.parse()</code> is called once.
        Results are returned as a map with <code>flags</code>, <code>options</code>, and <code>positional</code> keys.
      </Note>

      <H2 id="functions">Functions</H2>

      <H3 id="fn-flag">{`cli.flag(name: str, help?: str)`}</H3>
      <P>Declare a boolean flag, e.g. <code>--verbose</code>. Absent flags are false.</P>

      <H3 id="fn-option">{`cli.option(name: str, default?: any, help?: str)`}</H3>
      <P>Declare a value option, e.g. <code>--port 8080</code>. Can specify a default value.</P>

      <H3 id="fn-positional">{`cli.positional(name: str, help?: str)`}</H3>
      <P>Declare a required positional argument.</P>

      <H3 id="fn-parse">{`cli.parse(args: [str]) -> map`}</H3>
      <P>Parse the given argument array against the declared spec. Returns a map of <code>{`{flags, options, positional}`}</code>.</P>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        noRun
        code={`import cli

cli.flag("verbose")
cli.flag("dry-run")
cli.option("port", 8080, "port to listen on")
cli.option("output", "out.txt", "output file")
cli.positional("input")

let opts = cli.parse(argv)

if opts.flags["verbose"] {
    println("verbose mode")
}

let port = opts.options["port"]
let input = opts.positional[0]
println("port={port}, input={input}")`}
      />
    </DocLayout>
  );
}
