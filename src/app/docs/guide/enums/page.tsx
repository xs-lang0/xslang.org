import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Enums, XS Guide" };

export const headings: Heading[] = [
  { id: "simple-enums", label: "Simple enums", level: 2 },
  { id: "associated-data", label: "Associated data", level: 2 },
  { id: "pattern-matching", label: "Pattern matching on enums", level: 2 },
  { id: "result-option", label: "Result and Option", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="guide" slug="enums" headings={headings}>
      <H1>Enums</H1>
      <Lead>
        Enums are algebraic data types. Variants can carry associated data.
        Pattern matching on enums is exhaustiveness-checked.
      </Lead>

      <H2 id="simple-enums">Simple enums</H2>

      <CodeBlock
        runnable
        code={`enum Direction { North, South, East, West }

let d = Direction::North
println(d)                       -- Direction::North

match d {
  Direction::North => println("going north")
  Direction::South => println("going south")
  Direction::East  => println("going east")
  Direction::West  => println("going west")
}`}
      />

      <H2 id="associated-data">Associated data</H2>

      <P>
        Variants can hold one or more values. Construct them like function
        calls.
      </P>

      <CodeBlock
        runnable
        code={`enum Shape {
  Circle(radius),
  Rect(w, h),
  Triangle(a, b, c)
}

let s1 = Shape::Circle(5)
let s2 = Shape::Rect(3, 4)
let s3 = Shape::Triangle(3, 4, 5)

println(s1)                      -- Shape::Circle(5)
println(s2)                      -- Shape::Rect(3, 4)`}
      />

      <H2 id="pattern-matching">Pattern matching on enums</H2>

      <P>
        The semantic analyser verifies that all variants are covered. A missing
        variant is a compile-time error (unless a wildcard is present).
      </P>

      <CodeBlock
        runnable
        code={`enum Shape {
  Circle(radius),
  Rect(w, h),
  Triangle(a, b, c)
}

fn area(shape) {
  match shape {
    Shape::Circle(r)      => 3.14159 * r * r
    Shape::Rect(w, h)     => w * h
    Shape::Triangle(a, b, c) => {
      let s = (a + b + c) / 2.0
      (s * (s - a) * (s - b) * (s - c)) ** 0.5
    }
  }
}

println(area(Shape::Circle(5)))
println(area(Shape::Rect(3, 4)))`}
      />

      <CodeBlock
        runnable
        code={`enum Status {
  Loading,
  Done(value),
  Error(msg)
}

fn describe(s) {
  match s {
    Status::Loading     => "loading..."
    Status::Done(v)     => "done: {v}"
    Status::Error(msg)  => "error: {msg}"
  }
}

println(describe(Status::Loading))
println(describe(Status::Done(42)))
println(describe(Status::Error("timeout")))`}
      />

      <H2 id="result-option">Result and Option</H2>

      <P>
        XS has built-in <code>Ok</code>, <code>Err</code>, <code>Some</code>,
        and <code>None</code> constructors for common result/option patterns.
        They are regular values you can match on.
      </P>

      <CodeBlock
        runnable
        code={`fn safe_div(a, b) {
  if b == 0 { return Err("division by zero") }
  return Ok(a / b)
}

let result = safe_div(10, 2)
match result {
  Ok(val)   => println("result: {val}")
  Err(msg)  => println("error: {msg}")
}

let bad = safe_div(5, 0)
match bad {
  Ok(val)   => println("result: {val}")
  Err(msg)  => println("error: {msg}")
}`}
      />

      <Note>
        The variant limit per enum is 256, a constraint from the C
        implementation. Hitting this limit is very unlikely in practice.
      </Note>
    </DocLayout>
  );
}
