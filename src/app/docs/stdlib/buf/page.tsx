import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "buf, XS Stdlib · XS Docs" },
  description: "Growable byte buffer for binary protocols and low-level I/O.",
};

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="buf" headings={headings}>
      <H1>buf</H1>
      <Lead>Growable byte buffer for binary protocols and low-level I/O.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import buf`} />

      <Note>All multi-byte reads and writes are little-endian.</Note>

      <H2 id="functions">Functions</H2>

      <H3 id="fn-new">{`buf.new(cap?: int) -> Buffer`}</H3>
      <P>Create a new buffer with optional initial capacity.</P>

      <H3 id="fn-write">Write functions</H3>
      <P>
        <code>buf.write_u8(b, v)</code> - append one byte.
        <br />
        <code>buf.write_u16(b, v)</code> - append 2-byte little-endian integer.
        <br />
        <code>buf.write_u32(b, v)</code> - append 4-byte little-endian integer.
        <br />
        <code>buf.write_u64(b, v)</code> - append 8-byte little-endian integer.
        <br />
        <code>buf.write_str(b, s)</code> - append the raw bytes of a string.
      </P>

      <H3 id="fn-read">Read functions</H3>
      <P>
        <code>buf.read_u8(b)</code>, <code>buf.read_u16(b)</code>, <code>buf.read_u32(b)</code>,{" "}
        <code>buf.read_u64(b)</code> - read at the current cursor position, advancing the cursor.
      </P>

      <H3 id="fn-to-str">{`buf.to_str(b: Buffer) -> str`}</H3>
      <P>Convert the buffer contents to a string.</P>

      <H3 id="fn-to-hex">{`buf.to_hex(b: Buffer) -> str`}</H3>
      <P>Return a hex dump of the buffer bytes.</P>

      <H3 id="fn-len">{`buf.len(b: Buffer) -> int`}</H3>
      <P>Number of bytes written so far.</P>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        runnable
        code={`import buf

let b = buf.new()
buf.write_u8(b, 0xFF)
buf.write_u32(b, 1234)
buf.write_str(b, "hi")

println(buf.len(b))    -- 7
println(buf.to_hex(b)) -- hex representation`}
      />
    </DocLayout>
  );
}
