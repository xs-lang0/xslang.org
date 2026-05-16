import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "base64, XS Stdlib · XS Docs" },
  description: "Base64 encode and decode strings.",
};

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="base64" headings={headings}>
      <H1>base64</H1>
      <Lead>Base64 encode and decode strings.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import base64`} />

      <Note>
        The <code>encode</code> module and <code>crypto</code> module also expose base64 functions.
        This module is the dedicated, minimal interface.
      </Note>

      <H2 id="functions">Functions</H2>

      <H3 id="fn-encode">{`base64.encode(data: str) -> str`}</H3>
      <P>Encode a string to base64.</P>

      <H3 id="fn-decode">{`base64.decode(data: str) -> str`}</H3>
      <P>Decode a base64 string back to its original bytes.</P>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        runnable
        code={`import base64

let encoded = base64.encode("hello, world")
println(encoded)               -- aGVsbG8sIHdvcmxk

let decoded = base64.decode(encoded)
println(decoded)               -- hello, world

-- round-trip
let data = "XS language 2026"
println(base64.decode(base64.encode(data)) == data)  -- true`}
      />
    </DocLayout>
  );
}
