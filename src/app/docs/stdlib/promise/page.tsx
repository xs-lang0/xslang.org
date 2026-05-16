import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "promise, XS Stdlib · XS Docs" },
  description: "Low-level Promise constructor and combinators that back the async/await runtime.",
};

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="promise" headings={headings}>
      <H1>promise</H1>
      <Lead>Low-level Promise constructor and combinators that back the async/await runtime.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import promise`} />

      <Note>
        Most code should use the <code>async fn</code> / <code>await</code> syntax and the <code>async</code> module
        instead of constructing promises manually. This module exposes the underlying runtime primitives.
      </Note>

      <H2 id="functions">Functions</H2>

      <H3 id="fn-new">{`promise.new(fn: (resolve, reject) -> void) -> Promise`}</H3>
      <P>Construct a new promise. Call <code>resolve(val)</code> or <code>reject(err)</code> from within fn to settle it.</P>

      <H3 id="fn-resolve">{`promise.resolve(val: any) -> Promise`}</H3>
      <P>Create an already-resolved promise with the given value.</P>

      <H3 id="fn-reject">{`promise.reject(err: any) -> Promise`}</H3>
      <P>Create an already-rejected promise with the given error.</P>

      <H3 id="fn-all">{`promise.all(promises: [Promise]) -> Promise`}</H3>
      <P>Resolve when all promises resolve; reject as soon as any rejects. Result is an array of values.</P>

      <H3 id="fn-race">{`promise.race(promises: [Promise]) -> Promise`}</H3>
      <P>Settle with the first promise to settle (resolve or reject).</P>

      <H3 id="fn-any">{`promise.any(promises: [Promise]) -> Promise`}</H3>
      <P>Resolve with the first promise to resolve; reject only if all reject.</P>

      <H3 id="fn-all-settled">{`promise.all_settled(promises: [Promise]) -> Promise`}</H3>
      <P>Wait for all promises to settle, returning an array of result maps regardless of outcome.</P>

      <H3 id="fn-then">{`promise.then(p: Promise, on_resolve: fn, on_reject?: fn) -> Promise`}</H3>
      <P>Attach fulfillment and optional rejection handlers, returning a new promise.</P>

      <H3 id="fn-catch-err">{`promise.catch_err(p: Promise, on_reject: fn) -> Promise`}</H3>
      <P>Attach a rejection handler.</P>

      <H3 id="fn-finally-do">{`promise.finally_do(p: Promise, fn: () -> void) -> Promise`}</H3>
      <P>Run fn when the promise settles, regardless of outcome.</P>

      <H3 id="fn-sleep">{`promise.sleep(ms: int) -> Promise`}</H3>
      <P>Return a promise that resolves after ms milliseconds.</P>

      <H3 id="fn-timeout">{`promise.timeout(p: Promise, ms: int) -> Promise`}</H3>
      <P>Return a promise that rejects with a timeout error if p doesn&apos;t settle within ms milliseconds.</P>

      <H3 id="fn-state">{`promise.state(p: Promise) -> str`}</H3>
      <P>Return the current state: <code>"pending"</code>, <code>"resolved"</code>, or <code>"rejected"</code>.</P>

      <H3 id="fn-value">{`promise.value(p: Promise) -> any`}</H3>
      <P>Return the resolved value or rejection error if settled, null if still pending.</P>

      <H3 id="fn-drain">{`promise.drain()`}</H3>
      <P>Flush the microtask queue, running all pending callbacks. Normally called automatically.</P>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        noRun
        code={`import promise

-- construct manually
let p = promise.new(fn(resolve, reject) {
    resolve(42)
})
println(promise.state(p))   -- resolved
println(promise.value(p))   -- 42

-- combinators
let a = promise.resolve(1)
let b = promise.resolve(2)
let both = promise.all([a, b])
promise.drain()
println(promise.value(both))  -- [1, 2]

-- chaining
let result = promise.then(
    promise.resolve(10),
    fn(v) { v * 2 }
)
promise.drain()
println(promise.value(result))  -- 20`}
      />
    </DocLayout>
  );
}
