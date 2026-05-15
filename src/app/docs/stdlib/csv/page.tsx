import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "csv, XS Stdlib" };

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="csv" headings={headings}>
      <H1>csv</H1>
      <Lead>Parse and generate CSV text.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import csv`} />

      <H2 id="functions">Functions</H2>

      <H3 id="fn-parse">{`csv.parse(str: str) -> [[str]]`}</H3>
      <P>Parse a CSV string into an array of rows, where each row is an array of string values.</P>

      <H3 id="fn-stringify">{`csv.stringify(rows: [[str]]) -> str`}</H3>
      <P>Serialize an array of rows back into a CSV string.</P>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        runnable
        code={`import csv

let text = "name,age,city\\nAlice,30,NY\\nBob,25,SF"
let rows = csv.parse(text)

println(rows[0])   -- [name, age, city]
println(rows[1])   -- [Alice, 30, NY]
println(rows[1][0]) -- Alice

-- round-trip
let out = csv.stringify(rows)
println(out)`}
      />
    </DocLayout>
  );
}
