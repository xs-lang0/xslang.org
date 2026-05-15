import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Reactive bindings and contracts, XS Guide" };

export const headings: Heading[] = [
  { id: "reactive-bindings", label: "Reactive bindings", level: 2 },
  { id: "cascading", label: "Cascading dependencies", level: 2 },
  { id: "contracts", label: "Contracts", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="guide" slug="reactive" headings={headings}>
      <H1>Reactive bindings and contracts</H1>
      <Lead>
        <code>bind</code> creates a variable that recomputes automatically when
        its dependencies change. <code>where</code> clauses add runtime
        enforcement to bindings and parameters.
      </Lead>

      <H2 id="reactive-bindings">Reactive bindings</H2>

      <P>
        <code>bind total = price * qty</code> tracks which variables are read
        when the expression is first evaluated. When any of those variables are
        reassigned, the binding recomputes.
      </P>

      <CodeBlock
        runnable
        code={`var price = 10
var qty = 3
bind total = price * qty
println(total)                   -- 30

price = 20
println(total)                   -- 60

qty = 5
println(total)                   -- 100`}
      />

      <P>
        Works with strings and any expression:
      </P>

      <CodeBlock
        runnable
        code={`var name = "world"
bind greeting = "hello " ++ name
println(greeting)                -- hello world

name = "xs"
println(greeting)                -- hello xs`}
      />

      <H2 id="cascading">Cascading dependencies</H2>

      <P>
        A <code>bind</code> can depend on another <code>bind</code>. When the
        root dependency changes, all downstream bindings update in order.
      </P>

      <CodeBlock
        runnable
        code={`var price = 10
var qty = 2
bind total = price * qty
bind doubled = total * 2

println(total)                   -- 20
println(doubled)                 -- 40

price = 5
println(total)                   -- 10
println(doubled)                 -- 20`}
      />

      <Note>
        Reactivity is implemented in the bytecode VM and JIT by replaying the
        bound expression on dependency change. The transpilers (<code>--emit js</code>,{" "}
        <code>--emit c</code>, <code>--emit wasm</code>) lower <code>bind</code>{" "}
        as a regular <code>let</code> since static targets cannot observe
        variable mutation through the same hook.
      </Note>

      <H2 id="contracts">Contracts</H2>

      <P>
        Add a <code>where</code> clause after a type annotation to enforce a
        condition at runtime. The condition is checked when the binding is
        evaluated or the parameter is passed.
      </P>

      <CodeBlock
        runnable
        code={`let age: int where age > 0 and age < 150 = 25
println(age)                     -- 25

try {
  let bad: int where bad > 100 = 5
} catch e {
  println(e)                     -- contract violation
}`}
      />

      <P>
        Contracts on function parameters enforce preconditions at call sites:
      </P>

      <CodeBlock
        runnable
        code={`fn divide(a: int, b: int where b != 0) {
  return a / b
}

println(divide(10, 2))           -- 5

try {
  divide(10, 0)
} catch e {
  println(e)                     -- contract violation
}`}
      />

      <P>
        Contracts are gradual: omitting a <code>where</code> clause means no
        checking. Add them where the invariant matters and the cost of checking
        is justified.
      </P>
    </DocLayout>
  );
}
