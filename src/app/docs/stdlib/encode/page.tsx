import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "encode, XS Stdlib · XS Docs" },
  description: "Base64, hex, and URL encoding/decoding utilities.",
};

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="encode" headings={headings}>
      <H1>encode</H1>
      <Lead>Base64, hex, and URL encoding/decoding utilities.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import encode`} />

      <H2 id="functions">Functions</H2>

      <H3 id="fn-b64-encode">{`encode.base64_encode(data: str) -> str`}</H3>
      <P>Encode a string as base64.</P>

      <H3 id="fn-b64-decode">{`encode.base64_decode(data: str) -> str`}</H3>
      <P>Decode a base64 string.</P>

      <H3 id="fn-hex-encode">{`encode.hex_encode(data: str) -> str`}</H3>
      <P>Encode a string as a lowercase hex string.</P>

      <H3 id="fn-hex-decode">{`encode.hex_decode(data: str) -> str`}</H3>
      <P>Decode a hex string back to bytes.</P>

      <H3 id="fn-url-encode">{`encode.url_encode(s: str) -> str`}</H3>
      <P>URL-encode a string (percent-encoding).</P>

      <H3 id="fn-url-decode">{`encode.url_decode(s: str) -> str`}</H3>
      <P>Decode a percent-encoded URL string.</P>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        runnable
        code={`import encode

println(encode.base64_encode("hello"))    -- aGVsbG8=
println(encode.base64_decode("aGVsbG8=")) -- hello

println(encode.hex_encode("AB"))          -- 4142
println(encode.hex_decode("4142"))        -- AB

println(encode.url_encode("a b+c"))       -- a%20b%2Bc
println(encode.url_decode("a%20b%2Bc"))   -- a b+c`}
      />
    </DocLayout>
  );
}
