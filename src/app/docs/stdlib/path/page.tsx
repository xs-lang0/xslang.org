import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "path, XS Stdlib" };

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="path" headings={headings}>
      <H1>path</H1>
      <Lead>Cross-platform path manipulation utilities.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import path`} />

      <H2 id="functions">Functions</H2>

      <H3 id="fn-join">{`path.join(parts...) -> str`}</H3>
      <P>Join path components with the platform separator.</P>

      <H3 id="fn-basename">{`path.basename(p: str) -> str`}</H3>
      <P>Return the filename component of a path.</P>

      <H3 id="fn-dirname">{`path.dirname(p: str) -> str`}</H3>
      <P>Return the directory component of a path.</P>

      <H3 id="fn-ext">{`path.ext(p: str) -> str`}</H3>
      <P>Return the file extension including the dot, e.g. <code>".txt"</code>.</P>

      <H3 id="fn-stem">{`path.stem(p: str) -> str`}</H3>
      <P>Return the filename without extension.</P>

      <H3 id="prop-sep">{`path.sep`}</H3>
      <P>Platform path separator (<code>"/"</code> on Unix, <code>"\\"</code> on Windows).</P>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        runnable
        code={`import path

println(path.basename("/foo/bar/baz.txt"))  -- baz.txt
println(path.dirname("/foo/bar/baz.txt"))   -- /foo/bar
println(path.ext("/foo/bar/baz.txt"))       -- .txt
println(path.stem("/foo/bar/baz.txt"))      -- baz
println(path.join("/foo", "bar", "baz"))    -- /foo/bar/baz
println(path.sep)                           -- /`}
      />
    </DocLayout>
  );
}
