import { CodeBlock } from "@/components/code-block";

export default function PatternMatchingPage() {
  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight">Pattern matching</h1>
      <p className="mb-8 text-muted">
        <code className="text-foreground">match</code> is an expression that returns the value of the matched arm.
        The semantic analyzer checks for exhaustiveness.
      </p>

      <h2 className="mb-4 text-xl font-semibold">Basics</h2>
      <CodeBlock
        code={`let result = match value {
  0 => "zero"
  1 => "one"
  n if n > 100 => "big: {n}"
  _ => "other"
}`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Pattern types</h2>
      <CodeBlock
        code={`-- literals
match data {
  42      => "exact int"
  "hello" => "exact string"
  true    => "boolean"
  null    => "null"
}

-- tuple destructuring
match point {
  (0, 0) => "origin"
  (x, 0) => "on x-axis at {x}"
  (0, y) => "on y-axis at {y}"
  (x, y) => "({x}, {y})"
}

-- enum destructuring
match result {
  Ok(val)  => "success: {val}"
  Err(msg) => "error: {msg}"
}

-- or patterns
match ch {
  "a" | "e" | "i" | "o" | "u" => "vowel"
  _ => "consonant"
}

-- range patterns
match age {
  0..18   => "minor"
  18..=65 => "adult"
  _       => "senior"
}

-- slice patterns
match arr {
  [first, ..rest] => "head: {first}, rest: {rest}"
  []              => "empty"
}

-- @ capture (bind and test)
match value {
  n @ 1..=10 => "small: {n}"
  n          => "other: {n}"
}

-- regex patterns
match input {
  /^[0-9]+$/ => "number"
  /^[a-z]+$/ => "word"
  _          => "other"
}

-- string prefix patterns
match url {
  "https://" ++ rest => "secure: {rest}"
  "http://" ++ rest  => "insecure: {rest}"
  _                  => "unknown protocol"
}`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Enums</h2>
      <CodeBlock
        code={`enum Shape {
  Circle(radius),
  Rect(w, h),
  Point
}

fn area(s) {
  match s {
    Shape::Circle(r)   => 3.14159 * r * r
    Shape::Rect(w, h)  => w * h
    Shape::Point       => 0.0
  }
}

let s = Shape::Circle(5)
println(area(s))  -- 78.53975`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Struct destructuring</h2>
      <CodeBlock
        code={`struct Point { x, y }

match shape {
  Circle { radius }  => "circle r={radius}"
  Rect { w, h }      => "rect {w}x{h}"
}

-- in let bindings
let Point { x: a, y: b } = Point { x: 100, y: 200 }
println(a)  -- 100`}
      />
    </div>
  );
}
