import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Control flow · XS Guide" },
  description: "Braces are always required. if is an expression. loop can return a value. Loops can be labeled for nested breaks.",
};

export const headings: Heading[] = [
  { id: "if-elif-else", label: "if / elif / else", level: 2 },
  { id: "while", label: "while", level: 2 },
  { id: "for", label: "for", level: 2 },
  { id: "loop", label: "loop", level: 2 },
  { id: "break-continue", label: "break and continue", level: 2 },
  { id: "labeled-loops", label: "Labeled loops", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="guide" slug="control-flow" headings={headings}>
      <H1>Control flow</H1>
      <Lead>
        Braces are always required. <code>if</code> is an expression.{" "}
        <code>loop</code> can return a value. Loops can be labeled for nested
        breaks.
      </Lead>

      <H2 id="if-elif-else">if / elif / else</H2>

      <CodeBlock
        runnable
        code={`let x = 5

if x > 0 {
  println("positive")
} elif x < 0 {
  println("negative")
} else {
  println("zero")
}

-- if as an expression
let sign = if x > 0 { "+" } else if x < 0 { "-" } else { "0" }
println(sign)`}
      />

      <H2 id="while">while</H2>

      <CodeBlock
        runnable
        code={`var i = 0
while i < 5 {
  print("{i} ")
  i += 1
}
println()`}
      />

      <H2 id="for">for</H2>

      <P>
        <code>for</code> iterates over arrays, ranges, strings (via{" "}
        <code>.chars()</code>), maps, and any generator.
      </P>

      <CodeBlock
        runnable
        code={`-- over array
for x in [10, 20, 30] {
  print("{x} ")
}
println()

-- over range (exclusive)
for i in 0..5 {
  print("{i} ")
}
println()

-- over range (inclusive)
for i in 1..=3 {
  print("{i} ")
}
println()`}
      />

      <CodeBlock
        runnable
        code={`-- over map: iterates key-value pairs
let m = #{"a": 1, "b": 2, "c": 3}
for (k, v) in m {
  println("{k} = {v}")
}`}
      />

      <H2 id="loop">loop</H2>

      <P>
        <code>loop</code> runs forever until an explicit <code>break</code>.
        It can return a value via <code>break</code>.
      </P>

      <CodeBlock
        runnable
        code={`var n = 0
let result = loop {
  n += 1
  if n >= 5 { break n * 10 }
}
println(result)      -- 50`}
      />

      <H2 id="break-continue">break and continue</H2>

      <CodeBlock
        runnable
        code={`for i in 0..10 {
  if i % 2 == 0 { continue }   -- skip even
  if i > 7 { break }            -- stop early
  print("{i} ")
}
println()                       -- 1 3 5 7`}
      />

      <H2 id="labeled-loops">Labeled loops</H2>

      <P>
        Labels let you break or continue an outer loop from inside a nested one.
      </P>

      <CodeBlock
        runnable
        code={`var found = false
outer: for i in 0..5 {
  for j in 0..5 {
    if i * j == 6 {
      println("found: i={i}, j={j}")
      found = true
      break outer
    }
  }
}
println(found)       -- true`}
      />
    </DocLayout>
  );
}
