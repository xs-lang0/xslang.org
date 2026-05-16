import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Modules and packages · XS Guide" },
  description: "import loads standard library modules. use loads local files or directories. module defines an inline namespace. The package manager connects to reg.xslang.org .",
};

export const headings: Heading[] = [
  { id: "stdlib-import", label: "Importing stdlib", level: 2 },
  { id: "file-import", label: "Importing files", level: 2 },
  { id: "exporting", label: "Exporting names", level: 2 },
  { id: "inline-modules", label: "Inline modules", level: 2 },
  { id: "packages", label: "Packages", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="guide" slug="modules" headings={headings}>
      <H1>Modules and packages</H1>
      <Lead>
        <code>import</code> loads standard library modules.{" "}
        <code>use</code> loads local files or directories.{" "}
        <code>module</code> defines an inline namespace. The package manager
        connects to{" "}
        <a href="https://reg.xslang.org" target="_blank" rel="noreferrer">
          reg.xslang.org
        </a>
        .
      </Lead>

      <H2 id="stdlib-import">Importing stdlib</H2>

      <CodeBlock
        runnable
        code={`import math
println(math.sqrt(16))           -- 4.0
println(math.PI)                 -- 3.141592653589793

-- alias
import math as m
println(m.factorial(5))          -- 120

-- selective import
from math import { sqrt, PI }
println(sqrt(25))                -- 5.0`}
      />

      <P>
        Every standard library module must be explicitly imported. The semantic
        analyser reports an error for references to module names that have no
        matching <code>import</code>.
      </P>

      <Note>
        The full stdlib is 36 modules: <code>math</code>, <code>string</code>,{" "}
        <code>time</code>, <code>io</code>, <code>fs</code>, <code>path</code>,{" "}
        <code>json</code>, <code>re</code>, <code>os</code>,{" "}
        <code>collections</code>, <code>random</code>, <code>fmt</code>,{" "}
        <code>net</code>, <code>http</code>, <code>async</code>,{" "}
        <code>db</code>, and more. See the Stdlib section of the docs.
      </Note>

      <H2 id="file-import">Importing files</H2>

      <P>
        <code>use</code> imports a local <code>.xs</code> file as a module.
        The namespace is derived from the filename.
      </P>

      <CodeBlock
        code={`-- use "utils.xs" imports as utils.*
use "utils.xs"
println(utils.helper())

-- with alias
use "utils.xs" as u
println(u.helper())

-- selective import
use "utils.xs" { helper, VERSION }
println(helper())`}
      />

      <P>
        For directories, <code>use "lib/"</code> imports all <code>.xs</code>{" "}
        files in the directory.
      </P>

      <H2 id="exporting">Exporting names</H2>

      <P>
        Cross-file imports respect <code>pub</code>. A name in the imported
        file is visible through the namespace only if its declaration is
        marked public; everything else stays file-local.
      </P>

      <CodeBlock
        code={`-- math_utils.xs
pub fn double(x) { return x * 2 }      -- visible
pub let TAU = 6.2831                   -- visible
pub const E  = 2.71828                 -- visible
pub struct Point { x: int, y: int }    -- visible
pub enum Status { Ok, Failed }         -- visible (variants too)

fn _helper(x) { return x + 1 }         -- private, file-local
let _seed = 42                         -- private, file-local`}
      />

      <CodeBlock
        code={`use "math_utils.xs"

println(math_utils.double(5))          -- 10
println(math_utils.TAU)                -- 6.2831
println(math_utils._helper)            -- null (private)`}
      />

      <P>
        <code>@export("alias")</code> on a function exposes it under a public
        name distinct from the local name. Useful when the in-file name reads
        better with one convention and the published name with another.
      </P>

      <CodeBlock
        code={`-- color.xs
@export("rgbToHex")
fn rgb_to_hex(r, g, b) {
    return "#" + fmt.hex(r) + fmt.hex(g) + fmt.hex(b)
}`}
      />

      <CodeBlock
        code={`use "color.xs"
color.rgbToHex(255, 128, 0)            -- callable under the alias
color.rgb_to_hex(255, 128, 0)          -- still works under the local name too`}
      />

      <P>
        A file with no <code>pub</code> or <code>@export</code> anywhere falls
        back to exposing every top-level binding. That keeps short scripts
        and quick experiments working without ceremony; once you mark even
        one declaration <code>pub</code>, the strict rule kicks in.
      </P>

      <H2 id="inline-modules">Inline modules</H2>

      <P>
        Declare a named module directly in a file with <code>module</code>:
      </P>

      <CodeBlock
        runnable
        code={`module Utils {
  fn double(x) { return x * 2 }
  fn triple(x) { return x * 3 }
}

println(Utils.double(5))         -- 10
println(Utils.triple(4))         -- 12`}
      />

      <H2 id="packages">Packages</H2>

      <P>
        XS packages are hosted on{" "}
        <a href="https://reg.xslang.org" target="_blank" rel="noreferrer">
          reg.xslang.org
        </a>
        . The package manager talks to the registry over HTTPS.
      </P>

      <CodeBlock
        code={`xs new myapp          -- scaffold a project (creates xs.toml)
xs add http-client    -- add a dependency
xs install            -- install all from xs.toml
xs remove http-client -- remove a package
xs update             -- update all to latest compatible versions`}
      />

      <P>
        Packages install to <code>.xs_lib/</code> in the project directory.
        Import them the same way as stdlib:
      </P>

      <CodeBlock
        code={`import http_client
let resp = http_client.get("https://api.example.com/data")`}
      />

      <P>Publishing a package:</P>

      <CodeBlock
        code={`xs login              -- store your registry token
xs publish            -- build tarball, POST to reg.xslang.org`}
      />

      <CodeBlock
        code={`xs search json        -- search the registry`}
      />
    </DocLayout>
  );
}
