import { CodeBlock } from "@/components/code-block";

export default function InteropPage() {
  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight">Interop</h1>
      <p className="mb-8 text-muted">
        Inline C for performance-critical code and FFI.
        Transpile to C, JavaScript, or WebAssembly from a single codebase.
      </p>

      <h2 className="mb-4 text-xl font-semibold">Inline C</h2>
      <p className="mb-4 text-muted">
        <code className="text-foreground">inline c</code> embeds raw C code inside an XS function.
        In the interpreter, inline C blocks are skipped with a warning -- use the C transpiler target to compile them.
      </p>
      <CodeBlock
        filename="hash.xs"
        code={`fn fast_hash(data) {
  inline c {
    uint64_t h = 0x525201;
    const char *s = xs_to_cstr(args[0]);
    while (*s) h = h * 31 + *s++;
    xs_return_int(h);
  }
  return 0  -- fallback for interpreter mode
}`}
      />
      <p className="mt-4 text-sm text-muted">
        The C code has access to arguments via <code className="text-foreground">args[]</code> and
        returns values using helper macros
        like <code className="text-foreground">xs_return_int()</code>.
      </p>

      <h2 className="mb-4 mt-12 text-xl font-semibold">Transpile targets</h2>
      <CodeBlock
        code={`xs transpile --target c    main.xs   -- emit C source
xs transpile --target js   main.xs   -- emit JavaScript
xs transpile --target wasm main.xs   -- emit WebAssembly`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Modules and imports</h2>
      <CodeBlock
        code={`-- standard library
import math
println(math.sqrt(16))  -- 4

-- selective import
from math import { sqrt, PI }
println(sqrt(25))  -- 5

-- file imports
use "utils.xs"
println(utils.helper())

-- with alias
use "utils.xs" as u
println(u.helper())

-- selective from file
use "utils.xs" { helper, VERSION }

-- inline modules
module Utils {
  fn double(x) { return x * 2 }
  fn triple(x) { return x * 3 }
}
println(Utils.double(5))  -- 10`}
      />
    </div>
  );
}
