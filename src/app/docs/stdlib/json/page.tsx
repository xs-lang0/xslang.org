import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "json, XS Stdlib" };

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="json" headings={headings}>
      <H1>json</H1>
      <Lead>JSON parsing and serialization.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import json`} />

      <H2 id="functions">Functions</H2>

      <H3 id="fn-parse">{`json.parse(str: str) -> any`}</H3>
      <P>Parse a JSON string into an XS value. Raises <code>JsonError</code> on invalid input.</P>

      <H3 id="fn-parse-safe">{`json.parse_safe(str: str) -> any`}</H3>
      <P>Same as <code>parse</code> but returns <code>null</code> instead of raising on invalid input.</P>

      <H3 id="fn-stringify">{`json.stringify(val: any) -> str`}</H3>
      <P>Serialize an XS value to a compact JSON string.</P>

      <H3 id="fn-pretty">{`json.pretty(val: any) -> str`}</H3>
      <P>Serialize to JSON with indentation for readability.</P>

      <H3 id="fn-valid">{`json.valid(str: str) -> bool`}</H3>
      <P>Check if a string is valid JSON without parsing it.</P>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        runnable
        code={`import json

let s = json.stringify(#{"a": 1, "b": [1, 2, 3]})
println(s)                       -- {"a":1,"b":[1,2,3]}

let m = json.parse(s)
println(m["a"])                  -- 1
println(m["b"][1])               -- 2

println(json.valid("[1,2,3]"))   -- true
println(json.valid("oops"))      -- false

let bad = json.parse_safe("not json")
println(bad)                     -- null

println(json.pretty(#{"x": 1, "y": 2}))`}
      />
    </DocLayout>
  );
}
