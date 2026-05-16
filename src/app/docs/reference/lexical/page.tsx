import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Lexical structure · XS Reference" },
  description: "Comments and statement separators: the two most basic rules of XS source text.",
};

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="lexical" headings={headings}>
      <H1>Lexical structure</H1>
      <Lead>Comments and statement separators: the two most basic rules of XS source text.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        Line comments start with <code>--</code>; block comments use <code>{"{-"}</code> and
        {" "}<code>{"-}"}</code> and nest correctly, so you can comment out code that already
        contains block comments. Shebang lines (<code>#!/usr/bin/env xs</code>) are silently
        ignored. Statements are separated by newlines or semicolons; both forms work anywhere,
        including inside blocks.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/comments" />
      <RefSnippet slug="reference/statement-separators" />
    </DocLayout>
  );
}
