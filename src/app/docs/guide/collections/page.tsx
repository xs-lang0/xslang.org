import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Collections, XS Guide" };

export const headings: Heading[] = [
  { id: "arrays", label: "Arrays", level: 2 },
  { id: "tuples", label: "Tuples", level: 2 },
  { id: "maps", label: "Maps", level: 2 },
  { id: "ranges", label: "Ranges", level: 2 },
  { id: "comprehensions", label: "Comprehensions", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="guide" slug="collections" headings={headings}>
      <H1>Collections</H1>
      <Lead>
        Arrays, tuples, maps, and ranges. Each has its own literal syntax
        and a full set of methods.
      </Lead>

      <H2 id="arrays">Arrays</H2>

      <P>
        Arrays are ordered, mutable, and can hold values of any type.
      </P>

      <CodeBlock
        runnable
        code={`var arr = [1, 2, 3, 4, 5]

-- access (negative indices count from the end)
println(arr[0])                  -- 1
println(arr[-1])                 -- 5

-- mutation
arr.push(6)
println(arr.pop())               -- 6

-- non-mutating transforms
println(arr.map(fn(x) { x * 2 }))    -- [2, 4, 6, 8, 10]
println(arr.filter(fn(x) { x > 2 })) -- [3, 4, 5]
println(arr.reduce(fn(acc, x) { acc + x }, 0))  -- 15`}
      />

      <CodeBlock
        runnable
        code={`let arr = [3, 1, 4, 1, 5, 9]

println(arr.len())               -- 6
println(arr.sum())               -- 23
println(arr.min())               -- 1
println(arr.max())               -- 9
println(arr.sorted())            -- [1, 1, 3, 4, 5, 9]
println(arr.contains(4))         -- true
println(arr.index_of(4))         -- 2`}
      />

      <CodeBlock
        runnable
        code={`-- repeat syntax
let zeros = [0; 5]
println(zeros)                   -- [0, 0, 0, 0, 0]

-- spread
let a = [1, 2, 3]
let b = [...a, 4, 5]
println(b)                       -- [1, 2, 3, 4, 5]`}
      />

      <Note>
        <code>.reverse()</code> and <code>.sort()</code> modify in-place and
        return null. <code>.reversed()</code> and <code>.sorted()</code> return
        new arrays.
      </Note>

      <H2 id="tuples">Tuples</H2>

      <P>
        Tuples are immutable fixed-size sequences. Access elements with numeric
        field syntax.
      </P>

      <CodeBlock
        runnable
        code={`let t = (1, "hello", true)
println(t.0)                     -- 1
println(t.1)                     -- hello
println(t.2)                     -- true
println(len(t))                  -- 3

-- destructure
let (x, y) = (10, 20)
println(x + y)                   -- 30`}
      />

      <H2 id="maps">Maps</H2>

      <P>
        Map literals use <code>#{"{"}</code> to distinguish them from blocks.
        Keys can be strings or integers. Maps preserve insertion order.
      </P>

      <CodeBlock
        runnable
        code={`var m = #{"name": "Alice", "age": 30}

println(m["name"])               -- Alice
m["city"] = "London"
println(m.len())                 -- 3

println(m.keys())                -- ["name", "age", "city"]
println(m.has("age"))            -- true
println(m.get("missing", "n/a")) -- n/a`}
      />

      <CodeBlock
        runnable
        code={`-- spread and merge
let base = #{"a": 1, "b": 2}
let extended = #{...base, "c": 3}
println(extended)`}
      />

      <H2 id="ranges">Ranges</H2>

      <P>
        Ranges are lazy sequences of integers. <code>0..10</code> excludes 10;{" "}
        <code>0..=10</code> includes it.
      </P>

      <CodeBlock
        runnable
        code={`for i in 0..5 {
  print("{i} ")
}
println()                        -- 0 1 2 3 4

for i in 1..=3 {
  print("{i} ")
}
println()                        -- 1 2 3

let r = 1..5
println(3 in r)                  -- true
println(len(0..10))              -- 10`}
      />

      <H2 id="comprehensions">Comprehensions</H2>

      <P>
        Array and map comprehensions provide a concise alternative to explicit
        loops.
      </P>

      <CodeBlock
        runnable
        code={`let squares = [x * x for x in 0..6]
println(squares)                 -- [0, 1, 4, 9, 16, 25]

let evens = [x for x in 0..10 if x % 2 == 0]
println(evens)                   -- [0, 2, 4, 6, 8]

let sq_map = #{x: x * x for x in [1, 2, 3]}
println(sq_map)                  -- {1: 1, 2: 4, 3: 9}`}
      />
    </DocLayout>
  );
}
