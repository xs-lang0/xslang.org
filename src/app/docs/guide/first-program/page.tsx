import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Your first program · XS Guide" },
  description: "Write a file, run it, then poke around in the REPL.",
};

export const headings: Heading[] = [
  { id: "hello-world", label: "Hello, world", level: 2 },
  { id: "repl", label: "The REPL", level: 2 },
  { id: "a-small-program", label: "A small program", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="guide" slug="first-program" headings={headings}>
      <H1>Your first program</H1>
      <Lead>Write a file, run it, then poke around in the REPL.</Lead>

      <H2 id="hello-world">Hello, world</H2>

      <P>
        Create a file <code>hello.xs</code>:
      </P>

      <CodeBlock
        filename="hello.xs"
        runnable
        code={`println("Hello, world!")`}
      />

      <P>Run it:</P>

      <CodeBlock code={`xs hello.xs`} />

      <P>
        That is all there is to it. No main function required for simple scripts,
        though you can define one and it gets called automatically:
      </P>

      <CodeBlock
        filename="hello.xs"
        runnable
        code={`fn main() {
  println("Hello, world!")
}`}
      />

      <H2 id="repl">The REPL</H2>

      <P>
        Run <code>xs</code> with no arguments to start the interactive
        Read-Eval-Print Loop:
      </P>

      <CodeBlock code={`xs`} />

      <P>
        Type XS expressions and see results immediately. Multi-line input works:
        lines ending with <code>{"{"}</code>, <code>(</code>, <code>[</code>, or{" "}
        <code>\</code> continue on the next line automatically. Useful REPL
        commands:
      </P>

      <CodeBlock
        code={`:t 42           -- show inferred type of an expression
:env            -- list all bindings in the current session
:clear          -- clear the current session state
:quit           -- exit (:q also works)`}
      />

      <H2 id="a-small-program">A small program</H2>

      <P>
        Here is a slightly more interesting example that covers variables,
        a conditional, and a loop:
      </P>

      <CodeBlock
        filename="greet.xs"
        runnable
        code={`let names = ["Alice", "Bob", "Charlie"]

for name in names {
  let greeting = if name == "Bob" {
    "hey, {name}!"
  } else {
    "hello, {name}!"
  }
  println(greeting)
}`}
      />

      <P>
        A few things to notice: <code>if</code> is an expression and returns
        the value of the taken branch. String interpolation uses{" "}
        <code>{"{name}"}</code> inside the string. Comments start with{" "}
        <code>--</code>.
      </P>

      <Note>
        XS uses <code>--</code> for line comments and{" "}
        <code>{"{- -}"}</code> for nestable block comments. No <code>//</code>{" "}
        or <code>#</code> (except for shebang lines at the top of a file).
      </Note>
    </DocLayout>
  );
}
