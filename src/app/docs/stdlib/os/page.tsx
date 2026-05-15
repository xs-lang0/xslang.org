import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "os, XS Stdlib" };

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "properties", label: "Properties", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="os" headings={headings}>
      <H1>os</H1>
      <Lead>Process info, environment variables, and filesystem utilities at the OS level.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import os`} />

      <H2 id="properties">Properties</H2>

      <H3 id="prop-platform">{`os.platform`}</H3>
      <P>Platform string: <code>"linux"</code>, <code>"darwin"</code>, or <code>"windows"</code>.</P>

      <H3 id="prop-sep">{`os.sep`}</H3>
      <P>Path separator (<code>"/"</code> or <code>"\\"</code>).</P>

      <H3 id="prop-args">{`os.args`}</H3>
      <P>Command-line arguments as an array of strings.</P>

      <H2 id="functions">Functions</H2>

      <H3 id="fn-pid">{`os.pid() -> int`}</H3>
      <P>Current process ID.</P>

      <H3 id="fn-ppid">{`os.ppid() -> int`}</H3>
      <P>Parent process ID.</P>

      <H3 id="fn-cwd">{`os.cwd() -> str`}</H3>
      <P>Current working directory.</P>

      <H3 id="fn-chdir">{`os.chdir(path: str)`}</H3>
      <P>Change working directory.</P>

      <H3 id="fn-home">{`os.home() -> str`}</H3>
      <P>Home directory path.</P>

      <H3 id="fn-tempdir">{`os.tempdir() -> str`}</H3>
      <P>Platform temp directory path.</P>

      <H3 id="fn-cpu-count">{`os.cpu_count() -> int`}</H3>
      <P>Number of logical CPU cores.</P>

      <H3 id="fn-exit">{`os.exit(code: int)`}</H3>
      <P>Exit the process with the given exit code. Fires any <code>@on_exit</code> handlers first.</P>

      <H3 id="fn-fs">Filesystem</H3>
      <P>
        <code>os.mkdir(path)</code>, <code>os.rmdir(path)</code>, <code>os.remove(path)</code>,{" "}
        <code>os.rename(old, new)</code>, <code>os.exists(path)</code>, <code>os.is_file(path)</code>,{" "}
        <code>os.is_dir(path)</code>, <code>os.list_dir(path)</code>, <code>os.glob(pattern)</code>
      </P>

      <H3 id="fn-env">Environment variables</H3>
      <P>
        <code>os.env(key)</code> / <code>os.getenv(key)</code> - get an environment variable.
        <br />
        <code>os.setenv(key, val)</code> - set an environment variable.
        <br />
        <code>os.hasenv(key)</code> - check if a variable is set.
        <br />
        <code>os.environ()</code> - all environment variables as a map.
      </P>

      <H2 id="examples">Examples</H2>
      <Note>OS calls won't run in the playground.</Note>
      <CodeBlock
        noRun
        code={`import os

println(os.platform)             -- linux
println(os.cwd())                -- /home/user
println(os.env("HOME"))          -- /home/user
println(os.pid())                -- 12345
println(os.cpu_count())          -- 8

if os.hasenv("DEBUG") {
    println("debug mode")
}

let all = os.environ()
for k, v in all { println("{k}={v}") }`}
      />
    </DocLayout>
  );
}
