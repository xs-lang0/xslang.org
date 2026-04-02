import { CodeBlock } from "@/components/code-block";

const examples = [
  {
    title: "FizzBuzz",
    desc: "The classic interview question, but with pattern matching instead of if/else chains.",
    code: `fn fizzbuzz(n) {
  match (n % 3, n % 5) {
    (0, 0) => "FizzBuzz"
    (0, _) => "Fizz"
    (_, 0) => "Buzz"
    _      => "{n}"
  }
}

fn main() {
  for i in 1..=100 {
    println(fizzbuzz(i))
  }
}`,
  },
  {
    title: "Generators",
    desc: "Lazy infinite sequences using fn* and yield. Pull values on demand.",
    code: `fn* fibonacci() {
  var a = 0
  var b = 1
  loop {
    yield a
    let tmp = a
    a = b
    b = tmp + b
  }
}

fn main() {
  for n in fibonacci() {
    if n > 100 { break }
    println(n)
  }
}`,
  },
  {
    title: "Tagged blocks",
    desc: "Build your own control flow. Retry logic, timing, resource management, whatever you need.",
    code: `-- retry a block up to n times
tag retry(n) {
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

-- measure execution time
tag timed() {
  import time
  let start = time.clock()
  let result = yield
  println("took {time.clock() - start}s")
  return result
}

timed() {
  heavy_computation()
}`,
  },
  {
    title: "Error handling with effects",
    desc: "Handle errors without exceptions or Result types. Effects let the caller decide what happens.",
    code: `effect Fail {
  fn fail(msg)
}

fn parse_int(s) {
  for ch in s.chars() {
    if not ch.is_digit() {
      perform Fail.fail("not a number: {s}")
    }
  }
  return s.parse_int()
}

fn main() {
  let result = handle {
    let n = parse_int("42")
    let m = parse_int("abc")
    n + m
  } {
    Fail.fail(msg) => {
      println("error: {msg}")
      resume(0)
    }
  }
  println(result)  -- 42
}`,
  },
  {
    title: "Structs and operator overloading",
    desc: "Define custom types and make them work with +, -, and other operators.",
    code: `struct Vec2 { x, y }

impl Vec2 {
  static fn new(x, y) {
    return Vec2 { x: x, y: y }
  }

  fn +(self, other) {
    return Vec2 { x: self.x + other.x, y: self.y + other.y }
  }

  fn magnitude(self) {
    return sqrt(self.x * self.x + self.y * self.y)
  }
}

fn main() {
  let a = Vec2.new(3.0, 4.0)
  let b = Vec2.new(1.0, 2.0)
  let c = a + b
  println("magnitude: {c.magnitude()}")
}`,
  },
  {
    title: "List comprehensions",
    desc: "Filter, map, and transform collections in a single expression.",
    code: `-- squares
let squares = [x * x for x in 0..10]
println(squares)  -- [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

-- filtered
let evens = [x for x in 0..20 if x % 2 == 0]
println(evens)    -- [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]

-- map comprehension
let sq = #{x: x * x for x in [1, 2, 3, 4, 5]}
println(sq)       -- {1: 1, 2: 4, 3: 9, 4: 16, 5: 25}

-- nested with destructuring
let pairs = [(x, y) for x in 0..3 for y in 0..3 if x != y]`,
  },
  {
    title: "Inline C",
    desc: "Drop to C when you need raw performance. The inline block compiles directly to native code.",
    code: `fn fast_hash(data) {
  inline c {
    uint64_t h = 0x525201;
    const char *s = xs_to_cstr(args[0]);
    while (*s) h = h * 31 + *s++;
    xs_return_int(h);
  }
  return 0  -- fallback for interpreter mode
}

fn main() {
  println(fast_hash("hello world"))
}`,
  },
  {
    title: "Nurseries",
    desc: "Structured concurrency that guarantees all spawned tasks finish before moving on.",
    code: `let pipe = channel()
var output = []

nursery {
  -- producer
  spawn {
    for i in 1..=5 {
      pipe.send(i * 10)
    }
  }

  -- consumer
  spawn {
    for i in 0..5 {
      output.push(pipe.recv())
    }
  }
}

-- all tasks complete before we get here
println(output)  -- [10, 20, 30, 40, 50]`,
  },
  {
    title: "Reactive signals",
    desc: "Observable values that automatically propagate changes to anything that depends on them.",
    code: `let count = signal(0)

let doubled = derived(fn() { count.get() * 2 })

count.subscribe(fn(val) {
  println("count changed to {val}")
})

count.set(5)
println(doubled.get())  -- 10

count.set(10)
println(doubled.get())  -- 20`,
  },
  {
    title: "Reactive bindings",
    desc: "Variables that auto-update when their dependencies change. Like a spreadsheet.",
    code: `var price = 10
var qty = 3
bind total = price * qty
bind tax = total * 0.1
bind final_price = total + tax

println("total: {total}")         -- 30
println("with tax: {final_price}") -- 33.0

qty = 5
println("total: {total}")         -- 50
println("with tax: {final_price}") -- 55.0`,
  },
  {
    title: "Gradual contracts",
    desc: "Add runtime constraints to types with where clauses. Only checked when you write them.",
    code: `fn create_user(name: str where name.len > 0, age: int where age >= 0) {
  return #{name: name, age: age}
}

println(create_user("alice", 30))

try {
  create_user("", 25)
} catch e {
  println(e)  -- contract violation
}`,
  },
  {
    title: "Named arguments",
    desc: "Call functions with named parameters for clarity. Mix with positional args freely.",
    code: `fn connect(host, port, ssl) {
  let proto = if ssl { "https" } else { "http" }
  return "{proto}://{host}:{port}"
}

println(connect(host: "localhost", port: 8080, ssl: false))
println(connect("api.example.com", port: 443, ssl: true))`,
  },
  {
    title: "Do expressions",
    desc: "Blocks that return values, and resource management that cleans up automatically.",
    code: `let grade = do {
  let score = 85
  if score >= 90 { "A" }
  elif score >= 80 { "B" }
  else { "C" }
}
println(grade)  -- B

struct File { name }
impl File {
  fn read(self) { return "contents of {self.name}" }
  fn close(self) { println("closed {self.name}") }
}

with File { name: "data.txt" } as f {
  println(f.read())
}
-- auto-calls f.close()`,
  },
];

export default function ExamplesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="mb-4 text-3xl font-bold tracking-tight">Examples</h1>
      <p className="mb-4 text-muted">
        A collection of XS code showing off various features.
      </p>
      <p className="mb-12 text-sm text-muted">
        Want to run these yourself?{" "}
        <a href="/playground" className="text-accent transition-colors hover:text-foreground">
          Try the playground
        </a>.
      </p>

      <div className="flex flex-col gap-12">
        {examples.map((ex) => (
          <section key={ex.title}>
            <h2 className="mb-1 text-lg font-semibold">{ex.title}</h2>
            <p className="mb-4 text-sm text-muted">{ex.desc}</p>
            <CodeBlock code={ex.code} />
          </section>
        ))}
      </div>
    </div>
  );
}
