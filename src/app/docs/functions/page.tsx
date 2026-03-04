import { CodeBlock } from "@/components/code-block";

export default function FunctionsPage() {
  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight">Functions</h1>
      <p className="mb-8 text-muted">
        Functions support overloading, default arguments, variadic params,
        expression bodies, closures, and attributes.
      </p>

      <h2 className="mb-4 text-xl font-semibold">Basics</h2>
      <CodeBlock
        runnable
        code={`-- basic function
fn greet(name) {
  println("Hello, {name}!")
}

-- with return value and types
fn add(a: int, b: int) -> int {
  return a + b
}

-- expression body shorthand
fn double(x) = x * 2

-- implicit return (last expression)
fn square(x) { x * x }`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Overloading</h2>
      <p className="mb-4 text-muted">
        Multiple functions with the same name, dispatched by argument count.
      </p>
      <CodeBlock
        runnable
        code={`fn greet() { println("hello!") }
fn greet(name) { println("hello, {name}!") }
fn greet(name, greeting) { println("{greeting}, {name}!") }

greet()                  -- hello!
greet("Alice")           -- hello, Alice!
greet("Bob", "hey")      -- hey, Bob!`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Default and variadic</h2>
      <CodeBlock
        runnable
        code={`-- default parameters
fn connect(host, port = 8080) {
  println("connecting to {host}:{port}")
}
connect("localhost")       -- port defaults to 8080

-- variadic
fn sum(...args) {
  var total = 0
  for a in args { total = total + a }
  return total
}
println(sum(1, 2, 3))     -- 6`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Lambdas and closures</h2>
      <CodeBlock
        runnable
        code={`-- anonymous function
let sq = fn(x) { x * x }

-- arrow lambda
let inc = (x) => x + 1

-- closures capture by reference
fn make_counter() {
  var count = 0
  return fn() {
    count = count + 1
    return count
  }
}
let c = make_counter()
println(c())  -- 1
println(c())  -- 2

-- pipe operator
let result = 5 |> double |> double  -- 20`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Attributes</h2>
      <CodeBlock
        runnable
        code={`-- @pure: sema-checked, no side effects allowed
@pure
fn add(a, b) { return a + b }

-- @test: marks a test case
@test
fn test_math() {
  assert_eq(1 + 1, 2)
}

-- @deprecated: warns callers
@deprecated("use new_api() instead")
fn old_api() { return 42 }

-- pub: visible to importers
pub fn helper() { return 42 }`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Generators</h2>
      <CodeBlock
        runnable
        code={`fn* count_up(n) {
  var i = 0
  while i < n {
    yield i
    i = i + 1
  }
}

for x in count_up(5) {
  print("{x} ")  -- 0 1 2 3 4
}`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Tagged blocks</h2>
      <p className="mb-4 text-muted">
        User-defined control structures. Define a tag, then call it with a trailing block.
      </p>
      <CodeBlock
        code={`tag retry(n) {
  var attempts = 0
  loop {
    try {
      let result = yield
      return result
    } catch e {
      attempts = attempts + 1
      if attempts >= n {
        throw "failed after {n} attempts: {e}"
      }
    }
  }
}

retry(3) {
  http.get("https://flaky-api.com")
}

tag timed() {
  import time
  let start = time.clock()
  let result = yield
  println("took {time.clock() - start}s")
  return result
}`}
      />
    </div>
  );
}
