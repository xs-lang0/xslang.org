import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Testing, XS Guide" };

export const headings: Heading[] = [
  { id: "test-attribute", label: "@test attribute", level: 2 },
  { id: "assertions", label: "Assertions", level: 2 },
  { id: "running-tests", label: "Running tests", level: 2 },
  { id: "test-module", label: "test stdlib module", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="guide" slug="testing" headings={headings}>
      <H1>Testing</H1>
      <Lead>
        Mark functions with <code>@test</code> and run <code>xs test</code>.
        Assertions are built in. No test framework to install.
      </Lead>

      <H2 id="test-attribute">@test attribute</H2>

      <P>
        Decorate any function with <code>@test</code> (or equivalently{" "}
        <code>#[test]</code>) to register it as a test case.{" "}
        <code>xs test</code> discovers and runs them automatically.
      </P>

      <CodeBlock
        runnable
        code={`@test
fn test_addition() {
  assert_eq(1 + 1, 2)
  assert_eq(10 + 5, 15)
}

@test
fn test_strings() {
  assert("hello".len() == 5)
  assert("hello".contains("ell"))
}

-- #[test] is equivalent
#[test]
fn test_types() {
  assert(42 is int)
  assert("hi" is str)
}`}
      />

      <H2 id="assertions">Assertions</H2>

      <P>
        <code>assert(cond, msg?)</code> panics if the condition is falsy.{" "}
        <code>assert_eq(a, b)</code> panics and shows both values if they are
        not equal.
      </P>

      <CodeBlock
        runnable
        code={`assert(1 + 1 == 2)
assert(true, "should be true")
assert_eq(2 * 3, 6)

try {
  assert_eq(1, 2)
} catch e {
  println("caught: {e}")         -- shows the mismatch
}`}
      />

      <H2 id="running-tests">Running tests</H2>

      <P>
        <code>xs test</code> scans for files matching{" "}
        <code>test_*.xs</code> or <code>*_test.xs</code> and runs all{" "}
        <code>@test</code> functions in them.
      </P>

      <CodeBlock
        code={`xs test                   -- run all tests
xs test math              -- run tests matching "math"
xs test --watch           -- rerun on file changes`}
      />

      <P>Sample output:</P>

      <CodeBlock
        code={`Running tests...
  PASS  test_math.xs (0.012s)
  FAIL  test_parser.xs (0.005s)
    FAIL: test_addition
      assert_eq: 3 != 4

Results: 1 passed, 1 failed, 2 total (0.017s)`}
      />

      <P>
        A test file fails if any assertion panics or an unhandled exception is
        thrown during a test function.
      </P>

      <H2 id="test-module">test stdlib module</H2>

      <P>
        For more control, import the <code>test</code> module and register
        tests programmatically:
      </P>

      <CodeBlock
        runnable
        code={`import test

test.run("adds correctly", fn() {
  test.assert_eq(1 + 1, 2)
})

test.run("string methods", fn() {
  test.assert_eq("hello".upper(), "HELLO")
  test.assert_ne("hello", "world")
})

test.summary()`}
      />

      <P>
        <code>test.assert_ne(a, b)</code> asserts that <code>a</code> and{" "}
        <code>b</code> are not equal. <code>test.summary()</code> prints a
        summary and exits with code 1 if any test failed.
      </P>

      <Note>
        The built-in <code>assert_eq</code> and <code>assert</code> functions
        are available everywhere without any import. The <code>test</code>{" "}
        module adds <code>run</code>, <code>summary</code>, and{" "}
        <code>assert_ne</code>.
      </Note>
    </DocLayout>
  );
}
