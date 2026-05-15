import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "test, XS Stdlib" };

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="test" headings={headings}>
      <H1>test</H1>
      <Lead>Lightweight test registration, assertions, and result reporting.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import test`} />

      <Note>
        The <code>xs test</code> CLI command discovers and runs test files automatically.
        You can also use <code>@test</code> as a decorator alias for <code>test.run</code>.
      </Note>

      <H2 id="functions">Functions</H2>

      <H3 id="fn-assert">{`test.assert(cond: bool)`}</H3>
      <P>Assert that cond is truthy, failing the current test if not.</P>

      <H3 id="fn-assert-eq">{`test.assert_eq(a: any, b: any)`}</H3>
      <P>Assert structural equality between a and b.</P>

      <H3 id="fn-assert-ne">{`test.assert_ne(a: any, b: any)`}</H3>
      <P>Assert that a and b are not equal.</P>

      <H3 id="fn-run">{`test.run(name: str, fn: () -> void)`}</H3>
      <P>Register a named test case. The function runs immediately in script mode or when <code>xs test</code> collects the file.</P>

      <H3 id="fn-summary">{`test.summary()`}</H3>
      <P>Print a summary of passed/failed tests and exit with code 1 if any failed.</P>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        runnable
        code={`import test

test.run("arithmetic", fn() {
    test.assert_eq(1 + 1, 2)
    test.assert_eq(10 - 3, 7)
    test.assert(5 > 4)
})

test.run("strings", fn() {
    test.assert_eq("hello".upper(), "HELLO")
    test.assert_ne("a", "b")
})

test.summary()`}
      />
    </DocLayout>
  );
}
