import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "hash, XS Stdlib · XS Docs" },
  description: "Common hash functions returning hex digests.",
};

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="hash" headings={headings}>
      <H1>hash</H1>
      <Lead>Common hash functions returning hex digests.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import hash`} />

      <H2 id="functions">Functions</H2>

      <H3 id="fn-md5">{`hash.md5(data: str) -> str`}</H3>
      <P>MD5 hex digest of data.</P>

      <H3 id="fn-sha256">{`hash.sha256(data: str) -> str`}</H3>
      <P>SHA-256 hex digest of data.</P>

      <Note>
        For SHA-1, HMAC-SHA256, HKDF, PBKDF2, AES, and cryptographically-secure random
        bytes, use the <code>crypto</code> module.
      </Note>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        runnable
        code={`import hash

println(hash.sha256("hello"))
-- 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824

println(hash.md5("hello"))
-- 5d41402abc4b2a76b9719d911017c592`}
      />
    </DocLayout>
  );
}
