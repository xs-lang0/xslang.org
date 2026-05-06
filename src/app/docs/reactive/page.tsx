import { CodeBlock } from "@/components/code-block";

export default function ReactivePage() {
  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Reactive primitives</h1>

      <p className="mb-6 text-muted">
        XS has built-in support for reactive bindings and runtime contracts.
        These features work together to make programs more declarative without
        adding external dependencies.
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

    </div>
  );
}
