import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "toml, XS Stdlib" };

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="toml" headings={headings}>
      <H1>toml</H1>
      <Lead>Parse TOML configuration files and strings into XS maps.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import toml`} />

      <H2 id="functions">Functions</H2>

      <H3 id="fn-parse">{`toml.parse(s: str) -> map`}</H3>
      <P>Parse a TOML string and return a map. Supports strings, integers, floats, booleans, arrays, and sections (as nested maps). Unknown or malformed entries are silently skipped.</P>

      <Note>
        Serialization (map to TOML) is not in the current module. To write config files use <code>json</code> or build the string with interpolation.
      </Note>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        runnable
        code={`import toml

let src = \`
[server]
host = "localhost"
port = 8080
debug = true

[database]
url = "postgres://localhost/mydb"
pool = 5
\`

let cfg = toml.parse(src)
println(cfg["server"]["host"])     -- localhost
println(cfg["server"]["port"])     -- 8080
println(cfg["server"]["debug"])    -- true
println(cfg["database"]["pool"])   -- 5`}
      />
    </DocLayout>
  );
}
