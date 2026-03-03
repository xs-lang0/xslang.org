import { CodeBlock } from "@/components/code-block";

export default function ReactivePage() {
  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Reactive primitives</h1>

      <p className="mb-6 text-muted">
        XS has built-in support for reactive bindings, runtime contracts, and
        target-specific code via adapt blocks. These features work together to make
        programs more declarative without adding external dependencies.
      </p>

      <h2 className="mb-4 text-xl font-semibold">Reactive bindings</h2>
      <p className="mb-4 text-sm text-muted">
        A <code className="text-foreground">bind</code> declaration creates a variable
        that automatically recomputes whenever its dependencies change:
      </p>
      <CodeBlock
        runnable
        filename="reactive.xs"
        code={`var price = 10
var qty = 3
bind total = price * qty    -- auto-updates when price or qty changes
println(total)              -- 30

price = 20
println(total)              -- 60

bind doubled = total * 2    -- cascading bindings
println(doubled)            -- 120
qty = 1
println(total)              -- 20
println(doubled)            -- 40`}
      />

      <p className="mb-4 mt-4 text-sm text-muted">
        On the first evaluation, <code className="text-foreground">bind</code> tracks which
        variables are read, then recomputes the expression whenever any of them change.
        Bindings can cascade, so updating <code className="text-foreground">price</code> will
        update <code className="text-foreground">total</code>, which in turn
        updates <code className="text-foreground">doubled</code>.
      </p>

      <p className="mb-6 text-sm text-muted">
        Reactive bindings are currently supported in the interpreter only. The VM and
        transpiler targets treat <code className="text-foreground">bind</code> as a
        regular <code className="text-foreground">let</code>.
      </p>

      <h2 className="mb-4 mt-12 text-xl font-semibold">Gradual contracts</h2>
      <p className="mb-4 text-sm text-muted">
        Use <code className="text-foreground">where</code> clauses to attach runtime
        constraints to variables and function parameters:
      </p>
      <CodeBlock
        runnable
        filename="contracts.xs"
        code={`let age: int where age > 0 and age < 150 = 25
let name: str where name.len > 0 = "xs"

-- violations throw at runtime
let bad: int where bad > 0 = -1  -- throws: contract violation`}
      />

      <p className="mb-4 mt-4 text-sm text-muted">
        Contracts work on function parameters too:
      </p>
      <CodeBlock
        runnable
        code={`fn divide(a: int, b: int where b != 0) {
  return a / b
}

divide(10, 2)   -- 5
divide(10, 0)   -- throws: contract violation on b`}
      />

      <p className="mb-6 mt-4 text-sm text-muted">
        Contracts are gradual. If you don&apos;t write a <code className="text-foreground">where</code> clause,
        there&apos;s no check. Add them where correctness matters and skip them where it doesn&apos;t.
      </p>

      <h2 className="mb-4 mt-12 text-xl font-semibold">Adapt blocks</h2>
      <p className="mb-4 text-sm text-muted">
        Write different implementations for different compilation targets using{" "}
        <code className="text-foreground">adapt</code>:
      </p>
      <CodeBlock
        runnable
        filename="platform.xs"
        code={`adapt fn greet(name: str) -> str {
  native { return "hello, " + name }
  js { return "hello from JS, " + name }
  wasm { return "hello from WASM, " + name }
}

println(greet("world"))  -- "hello, world" in the interpreter`}
      />

      <p className="mb-4 mt-4 text-sm text-muted">
        The interpreter and VM use the <code className="text-foreground">native</code> block.
        When transpiling to JavaScript, the <code className="text-foreground">js</code> block
        is used instead, and so on for WASM. This lets you write platform-specific code
        without preprocessor macros or conditional compilation flags.
      </p>

      <p className="mb-4 text-sm text-muted">
        Adapt functions support all normal function features, including type annotations,
        contracts, and default parameters:
      </p>
      <CodeBlock
        runnable
        code={`adapt fn read_file(path: str where path.len > 0) -> str {
  native {
    -- use built-in file I/O
    return fs::read(path)
  }
  js {
    -- use Node.js fs module
    return js_fs_read(path)
  }
}`}
      />
    </div>
  );
}
