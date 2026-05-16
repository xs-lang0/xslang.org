import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Functions and closures · XS Guide" },
  description: "Functions are first-class values. XS supports default parameters, variadic args, closures, generators, and overloading by argument count.",
};

export const headings: Heading[] = [
  { id: "basics", label: "Basics", level: 2 },
  { id: "defaults-variadic", label: "Default args and variadic", level: 2 },
  { id: "closures", label: "Closures", level: 2 },
  { id: "generators", label: "Generators", level: 2 },
  { id: "overloading", label: "Overloading", level: 2 },
  { id: "attributes", label: "Function attributes", level: 2 },
  { id: "generic-params", label: "Generic type params", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="guide" slug="functions" headings={headings}>
      <H1>Functions and closures</H1>
      <Lead>
        Functions are first-class values. XS supports default parameters,
        variadic args, closures, generators, and overloading by argument count.
      </Lead>

      <H2 id="basics">Basics</H2>

      <CodeBlock
        runnable
        code={`-- basic declaration
fn greet(name) {
  println("Hello, {name}!")
}
greet("world")

-- expression body shorthand
fn double(x) = x * 2
println(double(5))

-- implicit return (last expression)
fn square(x) { x * x }
println(square(4))

-- with type annotations
fn add(a: int, b: int) -> int {
  return a + b
}
println(add(3, 4))`}
      />

      <P>
        <code>fn main()</code> is auto-called if defined. In scripts without a
        main, the top-level code runs directly.
      </P>

      <H2 id="defaults-variadic">Default args and variadic</H2>

      <CodeBlock
        runnable
        code={`fn greet(name, greeting = "hello") {
  return "{greeting}, {name}"
}
println(greet("world"))          -- hello, world
println(greet("world", "hi"))    -- hi, world`}
      />

      <CodeBlock
        runnable
        code={`fn sum(...args) {
  var total = 0
  for a in args { total += a }
  return total
}
println(sum(1, 2, 3))            -- 6
println(sum())                   -- 0`}
      />

      <H2 id="closures">Closures</H2>

      <P>
        Closures capture variables by reference through an environment chain.
        Mutations inside the closure are visible to the outer scope.
      </P>

      <CodeBlock
        runnable
        code={`fn make_counter() {
  var count = 0
  return fn() {
    count += 1
    return count
  }
}

let c = make_counter()
println(c())                     -- 1
println(c())                     -- 2
println(c())                     -- 3`}
      />

      <CodeBlock
        runnable
        code={`-- arrow lambda syntax
let inc = (x) => x + 1
let mul = (a, b) => a * b

println(inc(5))                  -- 6
println(mul(3, 4))               -- 12`}
      />

      <H2 id="generators">Generators</H2>

      <P>
        Generator functions use <code>fn*</code> and <code>yield</code> to
        produce values lazily. They work with <code>for..in</code> loops.
      </P>

      <CodeBlock
        runnable
        code={`fn* count_up(n) {
  var i = 0
  while i < n {
    yield i
    i += 1
  }
}

for x in count_up(5) {
  print("{x} ")
}
println()                        -- 0 1 2 3 4`}
      />

      <H2 id="overloading">Overloading</H2>

      <P>
        Multiple functions with the same name are dispatched by argument count.
        First exact arity match wins.
      </P>

      <CodeBlock
        runnable
        code={`fn area(r) = 3.14159 * r * r
fn area(w, h) = w * h

println(area(5))                 -- 78.53975
println(area(3, 4))              -- 12`}
      />

      <P>
        Functions defined later in a file can call functions defined earlier,
        and also vice versa (mutual recursion is fine):
      </P>

      <CodeBlock
        runnable
        code={`fn is_even(n) {
  if n == 0 { return true }
  return is_odd(n - 1)
}
fn is_odd(n) {
  if n == 0 { return false }
  return is_even(n - 1)
}
println(is_even(10))             -- true
println(is_odd(7))               -- true`}
      />

      <H2 id="attributes">Function attributes</H2>

      <CodeBlock
        noRun
        code={`-- @test: marks the function as a test case (run by xs test)
@test
fn test_add() {
  assert_eq(1 + 2, 3)
}

-- @deprecated: warns callers at check time
@deprecated("use new_add() instead")
fn old_add(a, b) { return a + b }`}
      />

      <P>
        Test functions produce no visible output when called directly. Run{" "}
        <code>xs test</code> to discover and execute them.
      </P>

      <Note>
        <code>@scoped</code> on a <code>let</code> or <code>var</code> tells
        the checker the value must not outlive the current block, which lets
        the runtime skip cycle detection for that value.
      </Note>

      <H2 id="generic-params">Generic type params</H2>

      <CodeBlock
        runnable
        code={`fn identity<T>(x: T) -> T {
  return x
}

fn first<T>(arr: [T]) -> T {
  return arr[0]
}

println(identity(42))
println(first(["a", "b", "c"]))`}
      />
    </DocLayout>
  );
}
