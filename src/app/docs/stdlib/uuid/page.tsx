import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "uuid, XS Stdlib · XS Docs" },
  description: "Generate and validate UUIDs.",
};

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="uuid" headings={headings}>
      <H1>uuid</H1>
      <Lead>Generate and validate UUIDs.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import uuid`} />

      <H2 id="functions">Functions</H2>

      <H3 id="fn-v4">{`uuid.v4() -> str`}</H3>
      <P>Generate a random UUID v4 string in the standard 8-4-4-4-12 hyphenated format.</P>

      <H3 id="fn-is-valid">{`uuid.is_valid(s: str) -> bool`}</H3>
      <P>Check if a string is a valid UUID (36 chars, correct format and hex digits).</P>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        runnable
        code={`import uuid

let id = uuid.v4()
println(id)                        -- e.g. 7f3e2a1b-4c5d-4e6f-8a9b-0c1d2e3f4a5b
println(uuid.is_valid(id))         -- true
println(uuid.is_valid("not-uuid")) -- false`}
      />
    </DocLayout>
  );
}
