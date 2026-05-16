import { DocLayout } from "@/components/doc-layout";
import { RefSnippet } from "@/components/ref-snippet";
import { H1, H2, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Execution backends · XS Reference" },
  description: "Four ways to run XS: the bytecode VM (default), the tree-walker interpreter, the JIT, and transpilation to JS or C.",
};

export const headings: Heading[] = [
  { id: "summary", label: "Summary", level: 2 },
  { id: "canonical", label: "Canonical", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="reference" slug="backends" headings={headings}>
      <H1>Execution backends</H1>
      <Lead>Four ways to run XS: the bytecode VM (default), the tree-walker interpreter, the JIT, and transpilation to JS or C.</Lead>

      <H2 id="summary">Summary</H2>
      <P>
        The VM is the default and the production target; it is a few times faster than the
        interpreter on every workload. The interpreter (<code>--interp</code>) is reserved
        for the REPL and for plugins that need AST-level runtime hooks. Both backends are
        run against the same test suite on every commit and their outputs are diff&apos;d;
        a divergence fails the test even when each backend passes on its own. The JIT
        (<code>--jit</code>) is a single register-allocating tier targeting x86-64 and aarch64;
        protos with unsupported opcodes fall back to the VM. <code>xs build</code> compiles to
        <code>.xsc</code> bytecode for distribution without the source. WASM: build with{" "}
        <code>make wasm</code>; the binary is ~650KB and runs in any WASI runtime or the
        browser playground. Transpilers: <code>--emit js</code> targets browsers and Node.js;{" "}
        <code>--emit c</code> produces compilable C.
      </P>

      <H2 id="canonical">Canonical</H2>
      <RefSnippet slug="reference/execution-backends" />
    </DocLayout>
  );
}
