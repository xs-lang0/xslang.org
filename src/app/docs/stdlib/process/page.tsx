import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "process, XS Stdlib" };

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="process" headings={headings}>
      <H1>process</H1>
      <Lead>Run shell commands and inspect the current process.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import process`} />

      <H2 id="functions">Functions</H2>

      <H3 id="fn-pid">{`process.pid() -> int`}</H3>
      <P>Current process ID.</P>

      <H3 id="fn-run">{`process.run(cmd: str) -> map`}</H3>
      <P>
        Run a shell command and wait for it to finish. Returns a map with:
        <code>ok</code> (bool), <code>stdout</code> (str), <code>code</code> (int).
      </P>

      <Note>Not available on WASM targets.</Note>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        noRun
        code={`import process

println(process.pid())

let r = process.run("echo hello")
println(r["stdout"])  -- hello
println(r["ok"])      -- true
println(r["code"])    -- 0

-- check a command exists
let which = process.run("which git")
if which["ok"] {
    println("git found at: {which["stdout"].trim()}")
} else {
    println("git not found")
}`}
      />
    </DocLayout>
  );
}
