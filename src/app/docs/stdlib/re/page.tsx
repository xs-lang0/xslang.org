import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "re, XS Stdlib" };

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="re" headings={headings}>
      <H1>re</H1>
      <Lead>Regular expression matching, searching, and replacement using the Thompson NFA engine.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import re`} />

      <H2 id="functions">Functions</H2>

      <H3 id="fn-test">{`re.test(pattern: str, str: str) -> bool`}</H3>
      <P>True if pattern matches anywhere in str. Also available as <code>re.is_match(pattern, str)</code>.</P>

      <H3 id="fn-match">{`re.match(pattern: str, str: str) -> str | null`}</H3>
      <P>Return the first match as a string, or null if no match.</P>

      <H3 id="fn-find-all">{`re.find_all(pattern: str, str: str) -> [str]`}</H3>
      <P>Return an array of all non-overlapping matches.</P>

      <H3 id="fn-replace">{`re.replace(pattern: str, str: str, repl: str) -> str`}</H3>
      <P>Replace the first match with repl.</P>

      <H3 id="fn-replace-all">{`re.replace_all(pattern: str, str: str, repl: str) -> str`}</H3>
      <P>Replace all matches with repl.</P>

      <H3 id="fn-split">{`re.split(pattern: str, str: str) -> [str]`}</H3>
      <P>Split str by pattern, returning an array of parts.</P>

      <H3 id="fn-groups">{`re.groups(pattern: str, str: str) -> [str]`}</H3>
      <P>Return capture groups from the first match as an array.</P>

      <Note>
        XS uses a Thompson NFA engine (src/core/regex.c) which guarantees linear-time matching.
        Patterns follow POSIX ERE syntax. Backslash sequences like <code>\d</code> work as expected.
      </Note>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        runnable
        code={`import re

println(re.match("\\d+", "abc 123 def"))       -- 123
println(re.find_all("\\d+", "1 2 3"))          -- ["1", "2", "3"]
println(re.replace("\\d+", "abc 123", "N"))    -- abc N
println(re.replace_all("\\d+", "1 2 3", "N")) -- N N N
println(re.split("\\s+", "a b c"))             -- ["a", "b", "c"]
println(re.test("^\\d+$", "123"))              -- true
println(re.test("^\\d+$", "abc"))              -- false

-- capture groups
let m = re.groups("(\\w+)@(\\w+)", "user@host")
println(m[0])  -- user
println(m[1])  -- host`}
      />
    </DocLayout>
  );
}
