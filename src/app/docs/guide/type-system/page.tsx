import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Type system · XS Guide" },
  description: "XS uses gradual typing. Code runs fine without annotations. Add them where you want enforcement; the checker activates only on annotated code.",
};

export const headings: Heading[] = [
  { id: "gradual-typing", label: "Gradual typing", level: 2 },
  { id: "annotations", label: "Type annotations", level: 2 },
  { id: "primitive-types", label: "Primitive types", level: 2 },
  { id: "composite-types", label: "Composite types", level: 2 },
  { id: "checking-modes", label: "Checking modes", level: 2 },
  { id: "type-aliases", label: "Type aliases", level: 2 },
  { id: "generics", label: "Generics", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="guide" slug="type-system" headings={headings}>
      <H1>Type system</H1>
      <Lead>
        XS uses gradual typing. Code runs fine without annotations. Add them
        where you want enforcement; the checker activates only on annotated
        code.
      </Lead>

      <H2 id="gradual-typing">Gradual typing</H2>

      <P>
        Unannotated code is never flagged. The type checker infers types where
        it can and silently passes through everything it cannot determine
        statically.
      </P>

      <CodeBlock
        runnable
        code={`-- no annotations, no errors, runs fine
let x = 42
let y = x + 1
fn foo(a, b) { return a + b }
println(foo(x, y))`}
      />

      <P>
        Add an annotation and the checker enforces that specific location:
      </P>

      <CodeBlock
        code={`let x: int = "hello"
-- error[T0001]: type mismatch: expected 'int', got 'str'
--   hint: use int() or float() to convert a string to a number`}
      />

      <H2 id="annotations">Type annotations</H2>

      <P>
        Annotations go after a colon on bindings, after parameter names, and
        after <code>-{">"}</code> for return types.
      </P>

      <CodeBlock
        runnable
        code={`let count: int = 42
var name: str = "XS"
const PI: float = 3.14159

fn add(a: int, b: int) -> int {
  return a + b
}

println(add(3, 4))`}
      />

      <H2 id="primitive-types">Primitive types</H2>

      <CodeBlock
        code={`int / i64      -- 64-bit signed integer (default)
i8, i16, i32   -- smaller signed integers
u8, u16, u32, u64  -- unsigned integers
float / f64    -- 64-bit float (default)
f32            -- 32-bit float
str / string   -- string
bool           -- boolean
char           -- character
byte           -- alias for u8
re             -- regex
any / dyn      -- any type (disables checking)
void / unit    -- no value
never          -- function that never returns`}
      />

      <P>
        Use <code>is</code> for runtime type checks and <code>as</code> for
        casts:
      </P>

      <CodeBlock
        runnable
        code={`println(42 is int)               -- true
println("hi" is str)             -- true
println(42 as float)             -- 42.0
println(42 as str)               -- 42
println("42" as int)             -- 42`}
      />

      <H2 id="composite-types">Composite types</H2>

      <CodeBlock
        runnable
        code={`let nums: [int] = [1, 2, 3]
let pair: (int, str) = (42, "hello")
let maybe: int? = null
let transform: fn(int) -> int = fn(x) { x * 2 }

println(nums)
println(pair.0)
println(maybe)
println(transform(5))`}
      />

      <H2 id="checking-modes">Checking modes</H2>

      <CodeBlock
        code={`xs script.xs              -- normal: check annotated code, then run
xs --check script.xs      -- check only, don't execute
xs --strict script.xs     -- require annotations on everything
xs --lenient script.xs    -- downgrade type errors to warnings`}
      />

      <P>
        In strict mode, every binding, parameter, and return type must be
        annotated:
      </P>

      <CodeBlock
        code={`-- xs --strict:
let x = 42
-- error[S0010]: missing type annotation for 'x' in strict mode

-- fix:
let x: int = 42`}
      />

      <H2 id="type-aliases">Type aliases</H2>

      <CodeBlock
        runnable
        code={`type UserId = int
type Handler = fn(str) -> bool

let id: UserId = 42
println(id)`}
      />

      <H2 id="generics">Generics</H2>

      <P>
        Functions, structs, and enums can declare type parameters. Parameters
        can have variance markers and trait bounds.
      </P>

      <CodeBlock
        runnable
        code={`fn identity<T>(x: T) -> T {
  return x
}

fn first<T>(arr: [T]) -> T {
  return arr[0]
}

println(identity(42))
println(identity("hello"))
println(first([10, 20, 30]))`}
      />

      <CodeBlock
        code={`-- with trait bound
fn display<T: Describe>(item: T) -> str {
  return item.describe()
}

-- covariant (+T) and contravariant (-T) variance
struct Box<+T>  { inner }
struct Sink<-T> { accept }`}
      />

      <Note>
        Use <code>_</code> as an inferred placeholder: <code>let x: _ = 42</code>{" "}
        lets the checker fill in the type without you writing it out.
      </Note>
    </DocLayout>
  );
}
