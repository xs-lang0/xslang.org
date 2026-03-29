import { CodeBlock } from "@/components/code-block";

const sections = [
  { id: "install", label: "Installation" },
  { id: "hello", label: "Hello world" },
  { id: "types", label: "Type system" },
  { id: "functions", label: "Functions" },
  { id: "matching", label: "Pattern matching" },
  { id: "effects", label: "Effects" },
  { id: "structs", label: "Structs and traits" },
  { id: "concurrency", label: "Concurrency" },
  { id: "interop", label: "Interop" },
  { id: "tooling", label: "Tooling" },
];

export default function DocsPage() {
  return (
    <div className="mx-auto flex max-w-5xl gap-12 px-6 py-16">
      <aside className="hidden w-48 shrink-0 lg:block">
        <nav className="sticky top-20 flex flex-col gap-2">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1">
        <h1 className="mb-12 text-3xl font-bold tracking-tight">Documentation</h1>

        <section id="install" className="mb-16">
          <h2 className="mb-4 text-xl font-semibold">Installation</h2>
          <p className="mb-4 text-muted">Install XS with a single command:</p>
          <CodeBlock code={`curl -fsSL xslang.org/install | sh`} />
          <p className="mt-4 text-sm text-muted">
            This installs the <code className="text-foreground">xs</code> compiler, the VM, and all
            built-in tools. Supports Linux, macOS, and Windows (via WSL).
          </p>
          <p className="mt-3 text-sm text-muted">Or build from source:</p>
          <CodeBlock
            code={`git clone https://github.com/xs-lang0/xs
cd xs
make
make install`}
          />
        </section>

        <section id="hello" className="mb-16">
          <h2 className="mb-4 text-xl font-semibold">Hello world</h2>
          <CodeBlock
            filename="hello.xs"
            code={`fn main() {
  println("hello, world")
}`}
          />
          <p className="mt-4 text-sm text-muted">
            Run it with <code className="text-foreground">xs run hello.xs</code>.
            The <code className="text-foreground">main()</code> function is auto-called if defined.
          </p>
        </section>

        <section id="types" className="mb-16">
          <h2 className="mb-4 text-xl font-semibold">Type system</h2>
          <p className="mb-4 text-muted">
            XS has gradual typing. You can start without types and add them incrementally.
            The checker only enforces annotated code.
          </p>
          <CodeBlock
            filename="types.xs"
            code={`-- untyped, works fine
let x = 42
let name = "xs"

-- typed, compiler checks these
let count: int = 42
var name: str = "xs"
const MAX: i64 = 100

-- function signatures
fn add(a: int, b: int) -> int {
  return a + b
}

-- generics
fn first<T>(arr: [T]) -> T {
  return arr[0]
}

-- composite types
let nums: [int] = [1, 2, 3]
let pair: (int, str) = (42, "hello")
let maybe: int? = null`}
          />
        </section>

        <section id="functions" className="mb-16">
          <h2 className="mb-4 text-xl font-semibold">Functions</h2>
          <p className="mb-4 text-muted">
            Functions support overloading, default arguments, variadic params, and expression bodies.
          </p>
          <CodeBlock
            filename="functions.xs"
            code={`-- expression body shorthand
fn double(x) = x * 2

-- implicit return (last expression)
fn square(x) { x * x }

-- overloading by arity
fn greet() { println("hello!") }
fn greet(name) { println("hello, {name}!") }

-- default parameters
fn connect(host, port = 8080) {
  println("connecting to {host}:{port}")
}

-- variadic
fn sum(...args) {
  var total = 0
  for a in args { total = total + a }
  return total
}

-- closures
fn make_counter() {
  var count = 0
  return fn() {
    count = count + 1
    return count
  }
}

-- arrow lambdas
let inc = (x) => x + 1`}
          />
        </section>

        <section id="matching" className="mb-16">
          <h2 className="mb-4 text-xl font-semibold">Pattern matching</h2>
          <CodeBlock
            filename="match.xs"
            code={`enum Shape {
  Circle(radius),
  Rect(w, h),
  Point
}

fn area(s) {
  match s {
    Shape::Circle(r) => 3.14159 * r * r
    Shape::Rect(w, h) => w * h
    Shape::Point => 0.0
  }
}

-- guards, ranges, regex, or-patterns
fn classify(data) {
  match data {
    n @ 1..=10          => "small: {n}"
    "a" | "e" | "i"    => "vowel"
    /^[0-9]+$/          => "number string"
    [first, ..rest]     => "list starting with {first}"
    (x, y)              => "pair: ({x}, {y})"
    _                   => "unknown"
  }
}

-- string prefix patterns
fn parse_url(url) {
  match url {
    "https://" ++ rest => "secure: {rest}"
    "http://" ++ rest  => "insecure: {rest}"
    _                  => "unknown protocol"
  }
}`}
          />
        </section>

        <section id="effects" className="mb-16">
          <h2 className="mb-4 text-xl font-semibold">Effects</h2>
          <p className="mb-4 text-muted">
            Algebraic effects let you perform operations without knowing how
            they'll be handled. The handler decides. Think of it as exceptions
            you can resume from.
          </p>
          <CodeBlock
            filename="effects.xs"
            code={`effect Ask {
  fn prompt(msg) -> str
}

fn greet() {
  let name = perform Ask.prompt("name?")
  return "Hello, {name}!"
}

-- the handler decides what prompt() returns
let result = handle greet() {
  Ask.prompt(msg) => resume("World")
}
println(result)  -- Hello, World!

-- effects with accumulation
effect Log {
  fn log(msg)
}

var logs = []
handle {
  perform Log.log("first")
  perform Log.log("second")
} {
  Log.log(msg) => {
    logs.push(msg)
    resume(null)
  }
}
println(logs)  -- ["first", "second"]`}
          />
        </section>

        <section id="structs" className="mb-16">
          <h2 className="mb-4 text-xl font-semibold">Structs and traits</h2>
          <CodeBlock
            filename="structs.xs"
            code={`struct Point { x, y }

impl Point {
  fn distance(self) {
    return sqrt(self.x * self.x + self.y * self.y)
  }

  fn translate(self, dx, dy) {
    return Point { x: self.x + dx, y: self.y + dy }
  }

  -- operator overloading
  fn +(self, other) {
    return Point { x: self.x + other.x, y: self.y + other.y }
  }
}

-- traits
trait Describe {
  fn describe(self) -> str
}

impl Describe for Point {
  fn describe(self) -> str {
    return "({self.x}, {self.y})"
  }
}

-- struct spread/update
let p = Point { x: 10, y: 20 }
let p2 = Point { ...p, y: 30 }

-- classes with inheritance
class Animal {
  name = ""
  sound = "..."

  fn init(self, name) {
    self.name = name
  }

  fn speak(self) {
    return "{self.name} says {self.sound}"
  }
}

class Dog : Animal {
  fn init(self, name) {
    super.init(name)
    self.sound = "woof"
  }
}`}
          />
        </section>

        <section id="concurrency" className="mb-16">
          <h2 className="mb-4 text-xl font-semibold">Concurrency</h2>
          <p className="mb-4 text-muted">
            XS supports multiple concurrency models. Use whichever fits your problem.
          </p>
          <CodeBlock
            filename="concurrency.xs"
            code={`-- spawn lightweight tasks
spawn { println("in background") }

-- async/await
async fn compute(x) {
  return x * 2
}
let r = await compute(21)  -- 42

-- channels
let ch = channel()
spawn {
  ch.send("ping")
  ch.send("pong")
}
println(ch.recv())  -- ping
println(ch.recv())  -- pong

-- nurseries (structured concurrency)
var results = []
nursery {
  spawn { results.push("a") }
  spawn { results.push("b") }
  spawn { results.push("c") }
}
-- all tasks complete before we get here

-- actors
actor Cache {
  var data = #{}

  fn set(key, val) { data[key] = val }
  fn get(key) { return data[key] }
}

let c = spawn Cache
c.set("x", 42)
println(c.get("x"))  -- 42`}
          />
        </section>

        <section id="interop" className="mb-16">
          <h2 className="mb-4 text-xl font-semibold">Interop</h2>
          <p className="mb-4 text-muted">
            Inline C for performance-critical code. Use <code className="text-foreground">xs transpile</code> to
            compile to C, JS, or WASM.
          </p>
          <CodeBlock
            filename="interop.xs"
            code={`fn fast_hash(data) {
  inline c {
    uint64_t h = 0x525201;
    const char *s = xs_to_cstr(args[0]);
    while (*s) h = h * 31 + *s++;
    xs_return_int(h);
  }
  return 0  -- fallback for interpreter mode
}`}
          />
          <div className="mt-4">
            <CodeBlock
              code={`xs transpile --target c    main.xs
xs transpile --target js   main.xs
xs transpile --target wasm main.xs`}
            />
          </div>
        </section>

        <section id="tooling" className="mb-16">
          <h2 className="mb-4 text-xl font-semibold">Tooling</h2>
          <CodeBlock
            code={`xs run main.xs          -- run a file
xs build main.xs        -- compile to binary
xs test                 -- run tests
xs fmt                  -- format code
xs lint                 -- lint code
xs lsp                  -- start language server
xs debug main.xs        -- start debugger
xs --check main.xs      -- type check only
xs --strict main.xs     -- require all annotations`}
          />
        </section>
      </div>
    </div>
  );
}
