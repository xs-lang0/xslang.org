import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Structs and impl, XS Guide" };

export const headings: Heading[] = [
  { id: "declaration", label: "Declaration", level: 2 },
  { id: "impl-blocks", label: "Impl blocks", level: 2 },
  { id: "operator-overloading", label: "Operator overloading", level: 2 },
  { id: "spread-update", label: "Spread / update syntax", level: 2 },
  { id: "destructuring", label: "Destructuring", level: 2 },
  { id: "derives", label: "Derives", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="guide" slug="structs" headings={headings}>
      <H1>Structs and impl</H1>
      <Lead>
        Structs are named product types. Methods go in an <code>impl</code>{" "}
        block. Operators, spread syntax, and destructuring all work out of the
        box.
      </Lead>

      <H2 id="declaration">Declaration</H2>

      <CodeBlock
        runnable
        code={`struct Point { x, y }

let p = Point { x: 10, y: 20 }
println(p.x)                     -- 10
println(p.y)                     -- 20`}
      />

      <P>Fields can have type annotations and defaults:</P>

      <CodeBlock
        runnable
        code={`struct Config {
  host: str,
  port: int,
  debug: bool
}

struct Options {
  verbose = false,
  retries: int = 3,
  timeout: float = 30.0
}

let opts = Options {}
println(opts.retries)            -- 3

let custom = Options { verbose: true }
println(custom.verbose)          -- true
println(custom.retries)          -- 3`}
      />

      <H2 id="impl-blocks">Impl blocks</H2>

      <P>
        Methods take <code>self</code> explicitly. Static methods (no{" "}
        <code>self</code>) use the <code>static</code> keyword.
      </P>

      <CodeBlock
        runnable
        code={`struct Point { x, y }

impl Point {
  fn distance(self) -> float {
    return (self.x * self.x + self.y * self.y) ** 0.5
  }

  fn translate(self, dx, dy) {
    return Point { x: self.x + dx, y: self.y + dy }
  }

  static fn origin() {
    return Point { x: 0, y: 0 }
  }
}

let p = Point { x: 3, y: 4 }
println(p.distance())            -- 5.0

let moved = p.translate(1, 0)
println(moved.x)                 -- 4

let o = Point::origin()
println(o.x)                     -- 0`}
      />

      <H2 id="operator-overloading">Operator overloading</H2>

      <P>
        Define operators as method names in an impl block. Overloadable:
        <code>+</code>, <code>-</code>, <code>*</code>, <code>/</code>,{" "}
        <code>%</code>, <code>==</code>, <code>!=</code>, <code>{"<"}</code>,{" "}
        <code>{">"}</code>, <code>{"<="}</code>, <code>{">="}</code>,{" "}
        <code>++</code>, <code>{"&&"}</code>, <code>||</code>.
      </P>

      <CodeBlock
        runnable
        code={`struct Vec2 { x, y }

impl Vec2 {
  fn +(self, other) {
    return Vec2 { x: self.x + other.x, y: self.y + other.y }
  }
  fn *(self, scalar) {
    return Vec2 { x: self.x * scalar, y: self.y * scalar }
  }
  fn ==(self, other) {
    return self.x == other.x and self.y == other.y
  }
}

let a = Vec2 { x: 1, y: 2 }
let b = Vec2 { x: 3, y: 4 }
let c = a + b
println(c.x)                     -- 4
println(c.y)                     -- 6

let scaled = a * 3
println(scaled.x)                -- 3`}
      />

      <H2 id="spread-update">Spread / update syntax</H2>

      <P>
        Create a new struct based on an existing one, overriding specific
        fields. The original is not modified.
      </P>

      <CodeBlock
        runnable
        code={`struct Point { x, y }

let p = Point { x: 10, y: 20 }
let p2 = Point { ...p, y: 30 }

println(p.y)                     -- 20 (unchanged)
println(p2.x)                    -- 10 (copied from p)
println(p2.y)                    -- 30 (overridden)`}
      />

      <H2 id="destructuring">Destructuring</H2>

      <CodeBlock
        runnable
        code={`struct Point { x, y }

let p = Point { x: 100, y: 200 }
let Point { x: px, y: py } = p
println(px)                      -- 100
println(py)                      -- 200

-- works in match too
match p {
  Point { x, y } => println("({x}, {y})")
  _ => {}
}`}
      />

      <H2 id="derives">Derives</H2>

      <P>
        Auto-implement common traits with <code>derives</code> or the{" "}
        <code>#[derive(...)]</code> attribute syntax:
      </P>

      <CodeBlock
        runnable
        code={`struct Vec2 { x, y } derives Eq, Hash

let a = Vec2 { x: 1, y: 2 }
let b = Vec2 { x: 1, y: 2 }
println(a == b)                  -- true`}
      />

      <Note>
        Structs are data-oriented. For OOP with inheritance, see{" "}
        <a href="/docs/guide/classes-traits">Classes and traits</a>. For
        shared behaviour across types, see the traits section of the same page.
      </Note>
    </DocLayout>
  );
}
