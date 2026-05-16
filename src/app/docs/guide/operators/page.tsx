import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Operators and arithmetic · XS Guide" },
  description: "XS has the usual arithmetic and comparison operators, plus a pipe operator, null coalescing, and optional chaining.",
};

export const headings: Heading[] = [
  { id: "arithmetic", label: "Arithmetic", level: 2 },
  { id: "comparison", label: "Comparison", level: 2 },
  { id: "logical", label: "Logical operators", level: 2 },
  { id: "pipe", label: "Pipe operator", level: 2 },
  { id: "null-coalesce", label: "Null coalesce", level: 2 },
  { id: "optional-chaining", label: "Optional chaining", level: 2 },
  { id: "membership", label: "Membership", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="guide" slug="operators" headings={headings}>
      <H1>Operators and arithmetic</H1>
      <Lead>
        XS has the usual arithmetic and comparison operators, plus a pipe
        operator, null coalescing, and optional chaining.
      </Lead>

      <H2 id="arithmetic">Arithmetic</H2>

      <CodeBlock
        runnable
        code={`println(3 + 4)       -- 7
println(10 - 3)      -- 7
println(4 * 5)       -- 20
println(10 / 3)      -- 3  (integer division truncates toward zero)
println(10 % 3)      -- 1
println(2 ** 10)     -- 1024
println(-7 // 2)     -- -4 (floor division: toward negative infinity)`}
      />

      <P>
        Integer division (<code>/</code>) truncates toward zero, so{" "}
        <code>(-7) / 2</code> is <code>-3</code>, not <code>-4</code>. Floor
        division (<code>//</code>) rounds toward negative infinity.
      </P>

      <P>
        Division by zero raises a catchable runtime error -- it does not
        silently produce <code>null</code> or <code>NaN</code>:
      </P>

      <CodeBlock
        runnable
        code={`try {
  let d = 10 / 0
} catch e {
  println(e.kind)    -- division by zero
}`}
      />

      <P>
        Integers are signed 64-bit and promote to arbitrary-precision bigints
        on overflow:
      </P>

      <CodeBlock
        runnable
        code={`println(2 ** 100)
-- 1267650600228229401496703205376`}
      />

      <H2 id="comparison">Comparison</H2>

      <CodeBlock
        runnable
        code={`println(5 == 5)      -- true
println(5 != 3)      -- true
println(3 < 5)       -- true
println(5 >= 5)      -- true

-- spaceship: returns -1, 0, or 1
println(5 <=> 3)     -- 1
println(3 <=> 5)     -- -1
println(5 <=> 5)     -- 0`}
      />

      <H2 id="logical">Logical operators</H2>

      <P>
        Both keyword and symbol forms work. They short-circuit and return the
        last evaluated operand, not necessarily <code>true</code> or{" "}
        <code>false</code>.
      </P>

      <CodeBlock
        runnable
        code={`println(true and false)   -- false
println(true && false)    -- false
println(false or true)    -- true
println(false || true)    -- true
println(not true)         -- false
println(!true)            -- false`}
      />

      <H2 id="pipe">Pipe operator</H2>

      <P>
        <code>x |&gt; f</code> passes <code>x</code> as the first argument to{" "}
        <code>f</code>. Chain multiple pipes to build readable data pipelines.
      </P>

      <CodeBlock
        runnable
        code={`fn double(x) { x * 2 }
fn inc(x) { x + 1 }

let result = 5 |> double |> inc
println(result)      -- 11

-- works with multi-arg functions too
let n = [1, 2, 3] |> len
println(n)           -- 3`}
      />

      <H2 id="null-coalesce">Null coalesce</H2>

      <P>
        <code>??</code> returns the left side when it is not null, otherwise
        the right side.
      </P>

      <CodeBlock
        runnable
        code={`let val = null ?? 42
println(val)         -- 42

let other = 10 ?? 99
println(other)       -- 10`}
      />

      <H2 id="optional-chaining">Optional chaining</H2>

      <P>
        <code>?.</code> short-circuits to <code>null</code> when the receiver
        is null, instead of throwing.
      </P>

      <CodeBlock
        runnable
        code={`let obj = #{"a": #{"b": 42}}
println(obj?.a?.b)   -- 42
println(obj?.x?.y)   -- null (no error)`}
      />

      <H2 id="membership">Membership</H2>

      <CodeBlock
        runnable
        code={`println(2 in [1, 2, 3])          -- true
println("ell" in "hello")        -- true (substring)
println("a" in #{"a": 1})        -- true (map key)
let r = 1..5
println(3 in r)                  -- true (range)
println(5 not in [1, 2, 3])      -- true`}
      />

      <Note>
        Type casts use <code>as</code> (<code>42 as float</code>) and runtime
        type checks use <code>is</code> (<code>42 is int</code>). Both are
        described in the{" "}
        <a href="/docs/guide/type-system">type system</a> chapter.
      </Note>
    </DocLayout>
  );
}
