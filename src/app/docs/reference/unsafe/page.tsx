import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Unsafe blocks · XS Reference" },
  description: "unsafe {\"{ }\"} marks a block as explicitly unchecked, primarily as a code-intent signal.",
};

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="unsafe" headings={headings}>
      <H1>Unsafe blocks</H1>
      <Lead><code>unsafe {"{ }"}</code> marks a block as explicitly unchecked, primarily as a code-intent signal.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        At the moment, <code>unsafe</code> is a parsing and AST annotation. The runtime does
        not restrict what happens inside it. Its value is communicating to readers and future
        tooling that the enclosed code is intentionally outside normal safety guarantees, such
        as FFI calls or low-level buffer manipulation.
      </P>
      <Note>
        Future versions of XS may enforce actual restrictions inside unsafe blocks, similar to
        how Rust unsafe works. For now it is purely declarative.
      </Note>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/unsafe-blocks" />
    </DocLayout>
  );
}
