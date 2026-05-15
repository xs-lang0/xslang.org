import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "fmt, XS Stdlib" };

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="fmt" headings={headings}>
      <H1>fmt</H1>
      <Lead>Human-readable number and string formatting utilities.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import fmt`} />

      <H2 id="functions">Functions</H2>

      <H3 id="fn-number">{`fmt.number(n: float, decimals: int) -> str`}</H3>
      <P>Format number with fixed decimal places.</P>

      <H3 id="fn-hex">{`fmt.hex(n: int) -> str`}</H3>
      <P>Format integer as hex string, e.g. <code>"0xff"</code>.</P>

      <H3 id="fn-bin">{`fmt.bin(n: int) -> str`}</H3>
      <P>Format integer as binary string, e.g. <code>"0b1010"</code>.</P>

      <H3 id="fn-pad">{`fmt.pad(s: str, n: int) -> str`}</H3>
      <P>Right-pad string to width n with spaces.</P>

      <H3 id="fn-comma">{`fmt.comma(n: float) -> str`}</H3>
      <P>Format number with comma thousand separators, e.g. <code>"1,000,000"</code>.</P>

      <H3 id="fn-filesize">{`fmt.filesize(n: int) -> str`}</H3>
      <P>Human-readable file size, e.g. <code>"1.2 MB"</code>.</P>

      <H3 id="fn-ordinal">{`fmt.ordinal(n: int) -> str`}</H3>
      <P>Ordinal string, e.g. <code>"1st"</code>, <code>"2nd"</code>, <code>"3rd"</code>, <code>"11th"</code>.</P>

      <H3 id="fn-pluralize">{`fmt.pluralize(word: str, n: int) -> str`}</H3>
      <P>Returns <code>{`"{n} {word}"`}</code> with the word pluralized if needed, e.g. <code>"1 item"</code> or <code>"2 items"</code>.</P>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        runnable
        code={`import fmt

println(fmt.hex(255))            -- 0xff
println(fmt.bin(10))             -- 0b1010
println(fmt.comma(1000000))      -- 1,000,000
println(fmt.filesize(1536))      -- 1.5 KB
println(fmt.filesize(1073741824)) -- 1.0 GB
println(fmt.ordinal(1))          -- 1st
println(fmt.ordinal(11))         -- 11th
println(fmt.ordinal(22))         -- 22nd
println(fmt.number(3.14159, 2))  -- 3.14
println(fmt.pluralize("item", 1)) -- 1 item
println(fmt.pluralize("item", 2)) -- 2 items`}
      />
    </DocLayout>
  );
}
