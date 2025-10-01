import { CodeBlock } from "@/components/code-block";
import Link from "next/link";

export default function GettingStartedPage() {
  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Getting started</h1>

      <h2 className="mb-4 text-xl font-semibold">Installation</h2>
      <p className="mb-4 text-muted">Install XS with a single command:</p>

      <div className="mb-2">
        <p className="mb-2 text-sm text-muted">Linux / macOS:</p>
        <CodeBlock code={`curl -fsSL xslang.org/install | sh`} />
      </div>

      <div className="mb-4">
        <p className="mb-2 mt-4 text-sm text-muted">Windows (PowerShell):</p>
        <CodeBlock code={`irm xslang.org/install.ps1 | iex`} />
      </div>

      <p className="mb-4 text-sm text-muted">
        This downloads the XS installer, which sets up{" "}
        <code className="text-foreground">~/.xs/</code> with the compiler, VM,
        package manager, and all built-in tools.
      </p>

      <p className="mb-2 text-sm text-muted">Verify the installation:</p>
      <CodeBlock code={`xs --version`} />
      <p className="mb-4 mt-2 text-sm text-muted">
        You should see the installed version printed.
      </p>

      <p className="mb-4 text-sm text-muted">Or build from source:</p>
      <CodeBlock
        code={`git clone https://github.com/xs-lang0/xs
cd xs
make
make install`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Hello world</h2>
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

      <h2 className="mb-4 mt-12 text-xl font-semibold">Variables</h2>
      <CodeBlock
        filename="variables.xs"
        code={`let x = 42          -- immutable binding
var y = "hello"     -- mutable binding
const MAX = 100     -- constant (same as let, signals intent)

-- destructuring
let [a, b, c] = [1, 2, 3]
let (x, y) = (10, 20)

-- with type annotations
let count: int = 42
var name: str = "XS"`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Control flow</h2>
      <CodeBlock
        filename="control.xs"
        code={`-- if/elif/else (braces required)
if x > 0 {
  println("positive")
} elif x < 0 {
  println("negative")
} else {
  println("zero")
}

-- if as expression
let sign = if x > 0 { "+" } else { "-" }

-- for loops
for i in 0..5 { println(i) }
for x in [1, 2, 3] { println(x) }
for (k, v) in map { println("{k} = {v}") }

-- while and loop
while condition { do_stuff() }
loop {
  if done { break }
}

-- labeled loops
outer: for i in range(5) {
  for j in range(5) {
    if i * j == 6 { break outer }
  }
}`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Strings</h2>
      <CodeBlock
        filename="strings.xs"
        code={`-- both quotes work, both support interpolation
let s = "hello {name}!"
let s2 = 'also works: {1 + 2}'

-- string concat uses ++
"hello" ++ " world"

-- raw strings (no interpolation, no escapes)
let pat = r"\\d+\\.\\d+"

-- triple-quoted for multiline
let text = """
  line one
  line two
"""

-- color strings (ANSI terminal colors)
let err = c"bold;red;Error!"
let ok  = c"green;Success"`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Error handling</h2>
      <CodeBlock
        filename="errors.xs"
        code={`-- try/catch/finally
try {
  throw "something went wrong"
} catch e {
  println("Error: {e}")
} finally {
  println("cleanup")
}

-- defer (runs when function returns, LIFO order)
fn example() {
  defer { println("last") }
  defer { println("first") }
  println("body")
}

-- panic for unrecoverable errors (not catchable)
panic("fatal: invariant violated")`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Comments</h2>
      <p className="mb-4 text-sm text-muted">
        XS uses <code className="text-foreground">--</code> for line comments
        and <code className="text-foreground">{"{- -}"}</code> for block comments.
      </p>
      <CodeBlock
        code={`-- this is a line comment
{- this is a
   block comment -}`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">What&apos;s next?</h2>
      <div className="flex flex-col gap-2 text-sm">
        <Link href="/docs/functions" className="text-muted transition-colors hover:text-foreground">
          Functions - closures, generators, default args
        </Link>
        <Link href="/docs/pattern-matching" className="text-muted transition-colors hover:text-foreground">
          Pattern matching - guards, destructuring, ranges
        </Link>
        <Link href="/docs/types" className="text-muted transition-colors hover:text-foreground">
          Type system - gradual typing and annotations
        </Link>
      </div>
    </div>
  );
}
