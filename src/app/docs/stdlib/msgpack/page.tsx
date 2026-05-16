import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "msgpack, XS Stdlib · XS Docs" },
  description: "MessagePack binary serialization - compact, fast, and schema-free.",
};

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="msgpack" headings={headings}>
      <H1>msgpack</H1>
      <Lead>MessagePack binary serialization - compact, fast, and schema-free.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import msgpack`} />

      <H2 id="functions">Functions</H2>

      <H3 id="fn-encode">{`msgpack.encode(val: any) -> [int]`}</H3>
      <P>Encode an XS value to a MessagePack byte array.</P>

      <H3 id="fn-decode">{`msgpack.decode(bytes: [int]) -> any`}</H3>
      <P>Decode a MessagePack byte array back to an XS value.</P>

      <H3 id="fn-encode-stream">{`msgpack.encode_stream(val: any) -> [int]`}</H3>
      <P>Encode a value to a streaming MessagePack byte array (suitable for appending multiple values).</P>

      <H3 id="fn-decode-stream">{`msgpack.decode_stream(bytes: [int]) -> any`}</H3>
      <P>Decode from a streaming MessagePack byte sequence.</P>

      <H3 id="fn-size">{`msgpack.size(val: any) -> int`}</H3>
      <P>Return the number of bytes the value would occupy when encoded, without allocating the output.</P>

      <H3 id="fn-roundtrip">{`msgpack.roundtrip(val: any) -> any`}</H3>
      <P>Encode then decode a value in one call - useful for verifying serialization fidelity.</P>

      <H3 id="fn-benchmark">{`msgpack.benchmark(val: any, iters?: int) -> map`}</H3>
      <P>Benchmark encode/decode performance over a number of iterations. Returns a map with <code>encode_ms</code>, <code>decode_ms</code>, <code>bytes</code>, and <code>iterations</code>.</P>

      <H3 id="fn-pack-primitives">Low-level pack helpers</H3>
      <P>
        <code>msgpack.pack_int(n)</code>, <code>msgpack.pack_float(n)</code>, <code>msgpack.pack_str(s)</code> - encode a single primitive to a byte array. Useful when hand-building binary frames.
      </P>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        runnable
        code={`import msgpack

let data = #{"name": "Alice", "score": 99, "tags": ["a", "b"]}

let bytes = msgpack.encode(data)
println("encoded bytes: {bytes.len()}")
println("json would be: {msgpack.size(data)} bytes approx")

let back = msgpack.decode(bytes)
println(back["name"])   -- Alice
println(back["score"])  -- 99

-- round-trip check
let ok = msgpack.roundtrip(data)
println(ok["name"])     -- Alice`}
      />
    </DocLayout>
  );
}
