import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "string, XS Stdlib" };

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="string" headings={headings}>
      <H1>string</H1>
      <Lead>Extra string utilities beyond the built-in string methods.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import string`} />

      <Note>
        Most everyday string operations (split, trim, starts_with, etc.) are built-in methods on
        string values. This module covers the extras that don&apos;t fit neatly as methods.
      </Note>

      <H2 id="functions">Functions</H2>

      <H3 id="fn-pad-left">{`string.pad_left(s: str, n: int, ch?: str) -> str`}</H3>
      <P>Left-pad string to total width n, using ch (default space).</P>

      <H3 id="fn-pad-right">{`string.pad_right(s: str, n: int, ch?: str) -> str`}</H3>
      <P>Right-pad string to total width n.</P>

      <H3 id="fn-center">{`string.center(s: str, n: int, ch?: str) -> str`}</H3>
      <P>Center string in a field of width n.</P>

      <H3 id="fn-truncate">{`string.truncate(s: str, n: int, suffix?: str) -> str`}</H3>
      <P>Truncate string to total length n, appending suffix if truncated.</P>

      <H3 id="fn-camel-to-snake">{`string.camel_to_snake(s: str) -> str`}</H3>
      <P>Convert <code>helloWorld</code> to <code>hello_world</code>.</P>

      <H3 id="fn-snake-to-camel">{`string.snake_to_camel(s: str) -> str`}</H3>
      <P>Convert <code>hello_world</code> to <code>helloWorld</code>.</P>

      <H3 id="fn-escape-html">{`string.escape_html(s: str) -> str`}</H3>
      <P>Escape HTML special characters (<code>&lt;</code> <code>&gt;</code> <code>&amp;</code> <code>"</code>).</P>

      <H3 id="fn-is-numeric">{`string.is_numeric(s: str) -> bool`}</H3>
      <P>True if the string represents a valid number.</P>

      <H3 id="fn-words">{`string.words(s: str) -> [str]`}</H3>
      <P>Split string into words on whitespace.</P>

      <H3 id="fn-levenshtein">{`string.levenshtein(a: str, b: str) -> int`}</H3>
      <P>Edit distance between two strings.</P>

      <H3 id="fn-similarity">{`string.similarity(a: str, b: str) -> float`}</H3>
      <P>Similarity score from 0.0 to 1.0 based on edit distance.</P>

      <H3 id="fn-repeat">{`string.repeat(s: str, n: int) -> str`}</H3>
      <P>Repeat string n times.</P>

      <H3 id="fn-chars">{`string.chars(s: str) -> [str]`}</H3>
      <P>Split string into an array of single characters.</P>

      <H3 id="fn-bytes">{`string.bytes(s: str) -> [int]`}</H3>
      <P>Convert string to an array of byte values.</P>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        runnable
        code={`import string

println(string.words("hello world foo"))      -- ["hello", "world", "foo"]
println(string.camel_to_snake("helloWorld"))  -- hello_world
println(string.snake_to_camel("hello_world")) -- helloWorld
println(string.levenshtein("kitten", "sitting")) -- 3
println(string.escape_html("<b>hi</b>"))      -- &lt;b&gt;hi&lt;/b&gt;
println(string.is_numeric("3.14"))            -- true
println(string.pad_left("7", 3, "0"))         -- 007
println(string.truncate("hello world", 8, "...")) -- hello...
println(string.repeat("ab", 3))              -- ababab`}
      />
    </DocLayout>
  );
}
