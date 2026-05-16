import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Classes and traits · XS Guide" },
  description: "Classes support single inheritance with constructors and field defaults. Traits define shared behaviour across unrelated types. Both integrate with the type system.",
};

export const headings: Heading[] = [
  { id: "classes", label: "Classes", level: 2 },
  { id: "inheritance", label: "Inheritance", level: 2 },
  { id: "traits", label: "Traits", level: 2 },
  { id: "default-methods", label: "Default methods", level: 2 },
  { id: "super-traits", label: "Super traits and associated types", level: 2 },
  { id: "when-to-use", label: "When to use which", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="guide" slug="classes-traits" headings={headings}>
      <H1>Classes and traits</H1>
      <Lead>
        Classes support single inheritance with constructors and field defaults.
        Traits define shared behaviour across unrelated types. Both integrate
        with the type system.
      </Lead>

      <H2 id="classes">Classes</H2>

      <P>
        The constructor method is named <code>init</code>. Instantiate with{" "}
        <code>ClassName(args)</code>.
      </P>

      <CodeBlock
        runnable
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

let cat = Animal("Cat")
cat.sound = "meow"
println(cat.speak())             -- Cat says meow`}
      />

      <H2 id="inheritance">Inheritance</H2>

      <P>
        Use <code>class Dog : Animal</code> to extend a class. Call{" "}
        <code>super.init(...)</code> to initialize parent fields. Methods can
        be overridden freely.
      </P>

      <CodeBlock
        runnable
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
println(d.speak())               -- Rex says woof
println(d.fetch())               -- Rex fetches the ball`}
      />

      <H2 id="traits">Traits</H2>

      <P>
        Traits define a contract: a set of method signatures a type must
        implement. A type can implement multiple traits.
      </P>

      <CodeBlock
        runnable
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

let d = Dog { name: "Rex", breed: "Shepherd" }
println(d.describe())            -- Rex the Shepherd

let car = Car { make: "Volvo", year: 2024 }
println(car.describe())          -- 2024 Volvo`}
      />

      <H2 id="default-methods">Default methods</H2>

      <P>
        Traits can provide default implementations. Types only need to override
        them when they want different behaviour.
      </P>

      <CodeBlock
        runnable
        code={`trait Greet {
  fn hello(self) -> str {
    return "hello from {self.name}"
  }
  fn goodbye(self) -> str      -- no default: must implement
}

struct Person { name }

impl Greet for Person {
  -- hello() uses the default implementation
  fn goodbye(self) -> str { return "bye from {self.name}" }
}

let p = Person { name: "Alice" }
println(p.hello())               -- hello from Alice
println(p.goodbye())             -- bye from Alice`}
      />

      <H2 id="super-traits">Super traits and associated types</H2>

      <P>
        A trait can declare that implementing it also requires another trait.
        Traits can also declare associated type names.
      </P>

      <CodeBlock
        code={`trait Display {
  fn display(self) -> str
}

-- PrettyPrint requires Display to be implemented first
trait PrettyPrint: Display {
  fn pretty(self) -> str
}

-- associated type
trait Iterator {
  type Item
  fn next(self) -> Item
}`}
      />

      <P>
        The semantic analyser enforces trait implementations: missing required
        methods, parameter count mismatches, and return type mismatches are
        all caught before execution.
      </P>

      <H2 id="when-to-use">When to use which</H2>

      <P>
        Use <strong>structs + traits</strong> when you have plain data that
        different parts of the codebase should process in different ways. The
        separation of data and behaviour keeps things composable.
      </P>

      <P>
        Use <strong>classes</strong> when you need encapsulated mutable state,
        a natural inheritance hierarchy, or are modelling entities with
        identity (database rows, UI components, game objects).
      </P>

      <Note>
        XS does not enforce the orphan rule the same way Rust does, but the
        semantic analyser will flag an impl where neither the trait nor the
        type is defined in the same file.
      </Note>
    </DocLayout>
  );
}
