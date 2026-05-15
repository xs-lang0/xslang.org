import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "url, XS Stdlib" };

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="url" headings={headings}>
      <H1>url</H1>
      <Lead>URL parsing and percent-encoding utilities.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import url`} />

      <H2 id="functions">Functions</H2>

      <H3 id="fn-parse">{`url.parse(str: str) -> map`}</H3>
      <P>Parse a URL string into a component map with keys like <code>scheme</code>, <code>host</code>, <code>path</code>, <code>query</code>, <code>fragment</code>.</P>

      <H3 id="fn-encode">{`url.encode(s: str) -> str`}</H3>
      <P>Percent-encode a string for use in a URL.</P>

      <H3 id="fn-decode">{`url.decode(s: str) -> str`}</H3>
      <P>Decode a percent-encoded URL string.</P>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        runnable
        code={`import url

let parts = url.parse("https://example.com/path?q=hello#top")
println(parts["scheme"])   -- https
println(parts["host"])     -- example.com
println(parts["path"])     -- /path
println(parts["query"])    -- q=hello
println(parts["fragment"]) -- top

println(url.encode("hello world"))   -- hello%20world
println(url.decode("hello%20world")) -- hello world`}
      />
    </DocLayout>
  );
}
