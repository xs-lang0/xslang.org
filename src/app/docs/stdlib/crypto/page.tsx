import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "crypto, XS Stdlib" };

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="crypto" headings={headings}>
      <H1>crypto</H1>
      <Lead>Cryptographic hashes, HMAC, key derivation, AES, and random bytes via embedded BearSSL.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import crypto`} />

      <H2 id="functions">Functions</H2>

      <H3 id="fn-hashes">Hashes</H3>
      <P>
        <code>crypto.sha256(data)</code> - SHA-256 hex digest.
        <br />
        <code>crypto.sha1(data)</code> - SHA-1 hex digest.
        <br />
        <code>crypto.md5(data)</code> - MD5 hex digest.
        <br />
        <code>crypto.hash(algo, data)</code> - hash by algorithm name (<code>"sha256"</code>, <code>"sha1"</code>, <code>"md5"</code>).
      </P>

      <H3 id="fn-hmac">{`crypto.hmac_sha256(key: str, data: str) -> str`}</H3>
      <P>HMAC-SHA256 hex digest.</P>

      <H3 id="fn-kdf">Key derivation</H3>
      <P>
        <code>crypto.hkdf(key, salt, info, len)</code> - HKDF key derivation, returns hex string of len bytes.
        <br />
        <code>crypto.pbkdf2(pw, salt, iters, len)</code> - PBKDF2 key derivation.
      </P>

      <H3 id="fn-aes">AES</H3>
      <P>
        <code>crypto.aes_encrypt(key, iv, data)</code> - AES encryption.
        <br />
        <code>crypto.aes_decrypt(key, iv, data)</code> - AES decryption.
      </P>

      <H3 id="fn-codec">Encoding</H3>
      <P>
        <code>crypto.hex_encode(data)</code> / <code>crypto.hex_decode(s)</code> - hex codec.
        <br />
        <code>crypto.base64_encode(data)</code> / <code>crypto.base64_decode(s)</code> - base64 codec.
      </P>

      <H3 id="fn-random">Random</H3>
      <P>
        <code>crypto.random_bytes(n)</code> - n cryptographically random bytes as a hex string.
        <br />
        <code>crypto.random_int(min, max)</code> - secure random integer.
      </P>

      <H3 id="fn-uuid4">{`crypto.uuid4() -> str`}</H3>
      <P>Generate a random UUID v4 string.</P>

      <H3 id="fn-constant-time-eq">{`crypto.constant_time_eq(a: str, b: str) -> bool`}</H3>
      <P>Timing-safe string comparison to prevent timing attacks.</P>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        runnable
        code={`import crypto

println(crypto.sha256("hello"))
println(crypto.uuid4())          -- e.g. 8cbe806c-cd27-4d93-afd1-dbfa3f1b4f93

let key = "secret"
let msg = "payload"
println(crypto.hmac_sha256(key, msg))

-- timing-safe comparison
let a = "token_abc"
let b = "token_abc"
println(crypto.constant_time_eq(a, b))  -- true`}
      />
    </DocLayout>
  );
}
