import { CodeBlock } from "@/components/code-block";

export default function TypesPage() {
  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight">Type system</h1>
      <p className="mb-8 text-muted">
        XS has gradual typing. Code runs fine without annotations. Add them where you
        want enforcement -- the checker only kicks in on annotated code.
      </p>

      <h2 className="mb-4 text-xl font-semibold">Basics</h2>
      <CodeBlock
        runnable
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

-- with trait bounds
fn display<T: Describe>(item: T) -> str {
  return item.describe()
}`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Primitive types</h2>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="pb-2 pr-8 font-medium">Type</th>
              <th className="pb-2 font-medium">Description</th>
            </tr>
          </thead>
          <tbody className="text-muted">
            {[
              ["int / i64", "64-bit signed integer (default)"],
              ["i8, i16, i32", "Smaller signed integers"],
              ["u8, u16, u32, u64", "Unsigned integers"],
              ["float / f64", "64-bit float (default)"],
              ["f32", "32-bit float"],
              ["str / string", "String"],
              ["bool", "Boolean"],
              ["char", "Character"],
              ["byte", "Alias for u8"],
              ["re", "Regex"],
              ["any / dyn", "Any type (disables checking)"],
              ["void / unit", "No value"],
              ["never", "Function that never returns"],
            ].map(([type, desc]) => (
              <tr key={type} className="border-b border-border/50">
                <td className="py-2 pr-8 font-mono text-foreground">{type}</td>
                <td className="py-2">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-4 text-xl font-semibold">Composite types</h2>
      <CodeBlock
        runnable
        code={`-- arrays
let nums: [int] = [1, 2, 3]

-- tuples
let pair: (int, str) = (42, "hello")

-- optional (nullable)
let maybe: int? = null

-- function types
let transform: fn(int) -> int = fn(x) { x * 2 }

-- generic types
let items: array<int> = [1, 2, 3]
let lookup: map<str, int> = #{"a": 1}

-- nested
let grid: [[int]] = [[1, 2], [3, 4]]`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Type aliases</h2>
      <CodeBlock
        runnable
        code={`type UserId = i64
type Handler = fn(str) -> bool`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Checking modes</h2>
      <CodeBlock
        code={`xs script.xs            -- normal: check annotated code, then run
xs --check script.xs    -- check only, don't execute
xs --strict script.xs   -- require annotations everywhere
xs --lenient script.xs  -- downgrade type errors to warnings`}
      />
    </div>
  );
}
