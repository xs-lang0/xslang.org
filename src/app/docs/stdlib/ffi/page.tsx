import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "ffi, XS Stdlib" };

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="ffi" headings={headings}>
      <H1>ffi</H1>
      <Lead>Foreign function interface for calling symbols in shared libraries.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import ffi`} />

      <Note>
        Use sparingly. Most needs are covered by stdlib modules. FFI uses <code>dlopen</code> on Unix
        and <code>LoadLibrary</code> on Windows. Not available on WASM targets.
      </Note>

      <H2 id="functions">Functions</H2>

      <H3 id="fn-load">{`ffi.load(path: str) -> lib`}</H3>
      <P>Open a shared library (<code>.so</code>, <code>.dylib</code>, or <code>.dll</code>), returning a library handle.</P>

      <H3 id="fn-sym">{`ffi.sym(lib: lib, name: str) -> sym`}</H3>
      <P>Resolve a symbol from a loaded library by name.</P>

      <H3 id="fn-call">{`ffi.call(sym: sym, ret_type: str, arg_types: [str], args: [any]) -> any`}</H3>
      <P>Invoke a resolved symbol. Type strings include <code>"double"</code>, <code>"int"</code>, <code>"str"</code>, <code>"void"</code>.</P>

      <H3 id="fn-close">{`ffi.close(lib: lib)`}</H3>
      <P>Release a library handle.</P>

      <H3 id="fn-typeof">{`ffi.typeof(value: any) -> str`}</H3>
      <P>Return the FFI type tag for a value.</P>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        noRun
        code={`import ffi

let lib = ffi.load("libm.so.6")
let cos_fn = ffi.sym(lib, "cos")
let result = ffi.call(cos_fn, "double", ["double"], [0.0])
println(result)  -- 1.0
ffi.close(lib)`}
      />
    </DocLayout>
  );
}
