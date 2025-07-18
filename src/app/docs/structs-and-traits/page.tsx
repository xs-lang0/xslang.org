import { CodeBlock } from "@/components/code-block";

export default function StructsPage() {
  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight">Structs and traits</h1>
      <p className="mb-8 text-muted">
        Structs, traits, enums, and classes. XS gives you multiple tools for
        organizing data and behavior.
      </p>

      <h2 className="mb-4 text-xl font-semibold">Structs</h2>
      <CodeBlock
        code={`struct Point { x, y }

-- with type annotations
struct Config {
  host: str,
  port: int,
  debug: bool
}

-- field defaults
struct Options {
  verbose = false,
  retries: int = 3,
  timeout: f64 = 30.0
}
let opts = Options {}               -- all defaults
let opts2 = Options { verbose: true } -- override one

-- struct spread/update
let p = Point { x: 10, y: 20 }
let p2 = Point { ...p, y: 30 }`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Impl blocks</h2>
      <CodeBlock
        code={`impl Point {
  fn distance(self) {
    return sqrt(self.x * self.x + self.y * self.y)
  }

  fn translate(self, dx, dy) {
    return Point { x: self.x + dx, y: self.y + dy }
  }

  static fn origin() {
    return Point { x: 0, y: 0 }
  }
}

let p = Point { x: 3, y: 4 }
println(p.distance())     -- 5
let o = Point.origin()`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Operator overloading</h2>
      <CodeBlock
        code={`impl Vec2 {
  fn +(self, other) {
    return Vec2 { x: self.x + other.x, y: self.y + other.y }
  }
  fn *(self, scalar) {
    return Vec2 { x: self.x * scalar, y: self.y * scalar }
  }
}

let c = Vec2 { x: 1, y: 2 } + Vec2 { x: 3, y: 4 }`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Traits</h2>
      <CodeBlock
        code={`trait Describe {
  fn describe(self) -> str
}

struct Dog { name, breed }
struct Car { make, year }

impl Describe for Dog {
  fn describe(self) -> str {
    return "{self.name} the {self.breed}"
  }
}

impl Describe for Car {
  fn describe(self) -> str {
    return "{self.year} {self.make}"
  }
}

-- default methods
trait Greet {
  fn hello(self) -> str {
    return "hello from {self.name}"
  }
  fn goodbye(self) -> str  -- no default, must implement
}

-- super traits
trait PrettyPrint: Display {
  fn pretty(self) -> str
}`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Enums</h2>
      <CodeBlock
        code={`-- simple enum
enum Color { Red, Green, Blue }
let c = Color::Red

-- with associated data
enum Shape {
  Circle(radius),
  Rect(w, h),
  Triangle(a, b, c)
}

let s = Shape::Circle(5)

-- pattern matching
fn describe(shape) {
  match shape {
    Shape::Circle(r)      => "circle r={r}"
    Shape::Rect(w, h)     => "rect {w}x{h}"
    Shape::Triangle(a, b, c) => "triangle {a},{b},{c}"
  }
}`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Classes</h2>
      <p className="mb-4 text-muted">
        Classes support constructors, fields with defaults, and single inheritance.
      </p>
      <CodeBlock
        code={`class Animal {
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

  fn fetch(self) {
    return "{self.name} fetches the ball"
  }
}

let d = Dog("Rex")
println(d.speak())   -- Rex says woof
println(d.fetch())   -- Rex fetches the ball`}
      />
    </div>
  );
}
