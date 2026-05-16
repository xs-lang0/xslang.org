import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "collections, XS Stdlib · XS Docs" },
  description: "Higher-level data structures: Counter, Stack, PriorityQueue, Deque, Set, and OrderedMap.",
};

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "types", label: "Types", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="collections" headings={headings}>
      <H1>collections</H1>
      <Lead>Higher-level data structures: Counter, Stack, PriorityQueue, Deque, Set, and OrderedMap.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import collections`} />

      <H2 id="types">Types</H2>

      <H3 id="fn-counter">{`collections.Counter(arr: [any]) -> map`}</H3>
      <P>Returns a map of element counts from the array.</P>

      <H3 id="fn-stack">{`collections.Stack() -> Stack`}</H3>
      <P>
        Creates a LIFO stack. Methods: <code>push(v)</code>, <code>pop()</code>,{" "}
        <code>peek()</code>, <code>is_empty()</code>, <code>len()</code>.
      </P>

      <H3 id="fn-priority-queue">{`collections.PriorityQueue() -> PriorityQueue`}</H3>
      <P>Min-heap priority queue. Elements with lower priority values are dequeued first.</P>

      <H3 id="fn-deque">{`collections.Deque() -> Deque`}</H3>
      <P>Double-ended queue supporting efficient push/pop from both ends.</P>

      <H3 id="fn-set">{`collections.Set(arr?: [any]) -> Set`}</H3>
      <P>Set of unique elements. Pass an array to initialize. Supports <code>add</code>, <code>remove</code>, <code>has</code>, <code>len</code>.</P>

      <H3 id="fn-ordered-map">{`collections.OrderedMap() -> OrderedMap`}</H3>
      <P>Map that preserves insertion order. Useful when iteration order matters.</P>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        runnable
        code={`import collections

-- Counter
let c = collections.Counter(["a", "b", "a", "c", "a"])
println(c["a"])   -- 3
println(c["b"])   -- 1

-- Stack
let s = collections.Stack()
s.push(10)
s.push(20)
println(s.peek())  -- 20
println(s.pop())   -- 20
println(s.len())   -- 1

-- Set
let uniq = collections.Set([1, 2, 3, 2, 1])
println(uniq.len())  -- 3
println(uniq.has(2)) -- true`}
      />
    </DocLayout>
  );
}
