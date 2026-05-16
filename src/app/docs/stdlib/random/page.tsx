import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "random, XS Stdlib · XS Docs" },
  description: "Pseudorandom number generation, sampling, and shuffling.",
};

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="random" headings={headings}>
      <H1>random</H1>
      <Lead>Pseudorandom number generation, sampling, and shuffling.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import random`} />

      <H2 id="functions">Functions</H2>

      <H3 id="fn-int">{`random.int(min: int, max: int) -> int`}</H3>
      <P>Random integer in [min, max], inclusive on both ends.</P>

      <H3 id="fn-float">{`random.float() -> float`}</H3>
      <P>Random float in [0.0, 1.0) (half-open upper bound).</P>

      <H3 id="fn-bool">{`random.bool() -> bool`}</H3>
      <P>Random boolean.</P>

      <H3 id="fn-choice">{`random.choice(arr: [any]) -> any`}</H3>
      <P>Random element from an array.</P>

      <H3 id="fn-shuffle">{`random.shuffle(arr: [any])`}</H3>
      <P>Shuffle array in-place.</P>

      <H3 id="fn-sample">{`random.sample(arr: [any], n: int) -> [any]`}</H3>
      <P>Return n random elements without replacement.</P>

      <H3 id="fn-seed">{`random.seed(n: int)`}</H3>
      <P>Set the random seed for reproducible output.</P>

      <Note>
        <code>random.int(lo, hi)</code> is inclusive on both ends, unlike Python&apos;s
        exclusive <code>randrange</code>. To get Python-like behavior: <code>random.int(lo, hi - 1)</code>.
      </Note>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        runnable
        code={`import random

random.seed(42)
println(random.int(1, 10))               -- int in [1, 10]
println(random.float())                  -- float in [0.0, 1.0)
println(random.bool())                   -- true or false

let colors = ["red", "green", "blue"]
println(random.choice(colors))           -- random element

let nums = [1, 2, 3, 4, 5]
random.shuffle(nums)
println(nums)

println(random.sample([10, 20, 30, 40], 2))  -- 2 without replacement`}
      />
    </DocLayout>
  );
}
