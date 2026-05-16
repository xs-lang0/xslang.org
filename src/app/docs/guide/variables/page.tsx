import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Variables and bindings · XS Guide" },
  description: "Three binding forms: immutable let, mutable var, and constant const. All support type annotations and destructuring.",
};

export const headings: Heading[] = [
  { id: "let-var-const", label: "let, var, const", level: 2 },
  { id: "type-annotations", label: "Type annotations", level: 2 },
  { id: "destructuring", label: "Destructuring", level: 2 },
  { id: "deleting", label: "Deleting variables", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="guide" slug="variables" headings={headings}>
      <H1>Variables and bindings</H1>
      <Lead>
        Three binding forms: immutable <code>let</code>, mutable{" "}
        <code>var</code>, and constant <code>const</code>. All support type
        annotations and destructuring.
      </Lead>

      <H2 id="let-var-const">let, var, const</H2>

      <CodeBlock
        runnable
        code={`let x = 42          -- immutable: cannot reassign
var y = "hello"     -- mutable: can reassign with =
const MAX = 100     -- same as let at runtime, signals intent

y = "world"         -- ok
println(x)
println(y)
println(MAX)`}
      />

      <P>
        Reassigning a <code>let</code> binding is a runtime error.{" "}
        <code>const</code> is identical to <code>let</code> at runtime; the
        distinction is for the reader.
      </P>

      <CodeBlock
        runnable
        code={`var count = 0
count += 1
count += 1
println(count)       -- 2`}
      />

      <P>
        Compound assignment (<code>+=</code>, <code>-=</code>, <code>*=</code>,
        etc.) requires <code>var</code>.
      </P>

      <H2 id="type-annotations">Type annotations</H2>

      <P>
        Annotations are optional. Add them where you want the type checker to
        enforce correctness.
      </P>

      <CodeBlock
        runnable
        code={`let count: int = 42
var name: str = "XS"
const PI: f64 = 3.14159

println(count)
println(name)
println(PI)`}
      />

      <P>
        Without annotations, code runs fine and the checker stays silent. With
        annotations, the checker catches mismatches before execution:
      </P>

      <CodeBlock
        code={`let x: int = "oops"
-- error[T0001]: type mismatch: expected 'int', got 'str'`}
      />

      <Note>
        See the <a href="/docs/guide/type-system">type system</a> chapter for
        the full list of primitive types, composite types, and checking modes.
      </Note>

      <H2 id="destructuring">Destructuring</H2>

      <P>Unpack arrays, tuples, and structs in a single binding:</P>

      <CodeBlock
        runnable
        code={`-- array destructuring (exact length match required)
let [a, b, c] = [1, 2, 3]
println(a)           -- 1

-- tuple destructuring
let (x, y) = (10, 20)
println(x)           -- 10

-- nested tuple
let (p, (q, r)) = (1, (2, 3))
println(r)           -- 3`}
      />

      <CodeBlock
        runnable
        code={`-- struct destructuring
struct Point { x, y }
let p = Point { x: 100, y: 200 }
let Point { x: px, y: py } = p
println(px)          -- 100
println(py)          -- 200`}
      />

      <H2 id="deleting">Deleting variables</H2>

      <P>
        <code>del</code> removes a name from the current scope. Accessing it
        afterward throws a runtime error.
      </P>

      <CodeBlock
        runnable
        code={`var x = 42
println(x)           -- 42
del x

try {
  println(x)
} catch e {
  println("x is gone")
}`}
      />
    </DocLayout>
  );
}
