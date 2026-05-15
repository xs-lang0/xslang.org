import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Pattern matching, XS Guide" };

export const headings: Heading[] = [
  { id: "basics", label: "Basics", level: 2 },
  { id: "pattern-types", label: "Pattern types", level: 2 },
  { id: "guards", label: "Guards", level: 2 },
  { id: "or-patterns", label: "Or-patterns", level: 2 },
  { id: "at-capture", label: "At-capture", level: 2 },
  { id: "exhaustiveness", label: "Exhaustiveness", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="guide" slug="pattern-matching" headings={headings}>
      <H1>Pattern matching</H1>
      <Lead>
        <code>match</code> scrutinises a value against a sequence of patterns
        and runs the first arm that matches. It is an expression: it returns
        the matched arm{"'"}s value.
      </Lead>

      <H2 id="basics">Basics</H2>

      <CodeBlock
        runnable
        code={`let x = 3

let label = match x {
  0 => "zero"
  1 => "one"
  _ => "other"
}
println(label)                   -- other`}
      />

      <P>
        The wildcard <code>_</code> matches anything and discards the value.
        A bare name like <code>n</code> also matches anything but binds the
        value.
      </P>

      <H2 id="pattern-types">Pattern types</H2>

      <CodeBlock
        runnable
        code={`-- literal patterns
match "hello" {
  "hello" => println("got hello")
  "bye"   => println("got bye")
  _       => println("other")
}

-- tuple destructuring
let point = (3, 0)
match point {
  (0, 0) => println("origin")
  (x, 0) => println("on x-axis at {x}")
  (0, y) => println("on y-axis at {y}")
  (x, y) => println("({x}, {y})")
}`}
      />

      <CodeBlock
        runnable
        code={`-- range patterns
fn classify(age) {
  match age {
    0..18   => "minor"
    18..=65 => "adult"
    _       => "senior"
  }
}
println(classify(5))
println(classify(30))
println(classify(70))`}
      />

      <CodeBlock
        runnable
        code={`-- struct destructuring
struct Circle { radius }
struct Rect { w, h }

fn describe(shape) {
  match shape {
    Circle { radius } => "circle r={radius}"
    Rect { w, h }     => "rect {w}x{h}"
  }
}
println(describe(Circle { radius: 5 }))
println(describe(Rect { w: 3, h: 4 }))`}
      />

      <CodeBlock
        runnable
        code={`-- slice patterns (arrays)
fn first_or(arr, default) {
  match arr {
    []             => default
    [x, ..rest]    => x
  }
}
println(first_or([], "none"))
println(first_or([10, 20, 30], "none"))`}
      />

      <CodeBlock
        runnable
        code={`-- regex patterns
fn classify_str(s) {
  match s {
    /^[0-9]+$/    => "number"
    /^[a-z]+$/    => "lowercase word"
    _             => "other"
  }
}
println(classify_str("123"))
println(classify_str("hello"))
println(classify_str("Hello!"))`}
      />

      <CodeBlock
        runnable
        code={`-- string prefix patterns
fn check_url(url) {
  match url {
    "https://" ++ rest => "secure: {rest}"
    "http://" ++ rest  => "insecure: {rest}"
    _                  => "unknown"
  }
}
println(check_url("https://xslang.org"))
println(check_url("ftp://files.example.com"))`}
      />

      <H2 id="guards">Guards</H2>

      <P>
        Append <code>if condition</code> after a pattern to add a guard. The
        arm only matches if the pattern fits and the guard is truthy.
      </P>

      <CodeBlock
        runnable
        code={`fn describe(n) {
  match n {
    0          => "zero"
    n if n < 0 => "negative: {n}"
    n if n > 100 => "big: {n}"
    n          => "normal: {n}"
  }
}
println(describe(0))
println(describe(-5))
println(describe(200))
println(describe(42))`}
      />

      <H2 id="or-patterns">Or-patterns</H2>

      <CodeBlock
        runnable
        code={`fn is_vowel(ch) {
  match ch {
    "a" | "e" | "i" | "o" | "u" => true
    _ => false
  }
}
println(is_vowel("e"))           -- true
println(is_vowel("b"))           -- false`}
      />

      <H2 id="at-capture">At-capture</H2>

      <P>
        <code>n @ pattern</code> tests the value against the pattern and also
        binds it to <code>n</code>.
      </P>

      <CodeBlock
        runnable
        code={`fn label(n) {
  match n {
    x @ 1..=9  => "small: {x}"
    x @ 10..99 => "medium: {x}"
    x          => "large: {x}"
  }
}
println(label(5))
println(label(42))
println(label(999))`}
      />

      <H2 id="exhaustiveness">Exhaustiveness</H2>

      <P>
        The semantic analyser checks that all enum variants are covered. For
        non-enum types, a wildcard or variable pattern makes a match
        exhaustive. A match that cannot cover all cases is a compile-time error.
      </P>

      <Note>
        Enum matching is covered in the{" "}
        <a href="/docs/guide/enums">enums</a> chapter with examples showing
        how the exhaustiveness check works in practice.
      </Note>
    </DocLayout>
  );
}
