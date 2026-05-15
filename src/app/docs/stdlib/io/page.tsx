import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "io, XS Stdlib" };

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "file-ops", label: "File operations", level: 2 },
  { id: "file-info", label: "File info", level: 2 },
  { id: "file-manipulation", label: "File manipulation", level: 2 },
  { id: "directories", label: "Directories", level: 2 },
  { id: "stdin", label: "Stdin", level: 2 },
  { id: "submodules", label: "stdout / stderr", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="io" headings={headings}>
      <H1>io</H1>
      <Lead>File I/O, directory utilities, stdin, and stdout/stderr sub-objects.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import io`} />

      <H2 id="file-ops">File operations</H2>

      <H3 id="fn-read-file">{`io.read_file(path: str) -> str`}</H3>
      <P>Read entire file as a string.</P>

      <H3 id="fn-write-file">{`io.write_file(path: str, data: str)`}</H3>
      <P>Write string to file, replacing any existing content.</P>

      <H3 id="fn-append-file">{`io.append_file(path: str, data: str)`}</H3>
      <P>Append string to file.</P>

      <H3 id="fn-read-lines">{`io.read_lines(path: str) -> [str]`}</H3>
      <P>Read file as an array of lines.</P>

      <H3 id="fn-write-lines">{`io.write_lines(path: str, lines: [str])`}</H3>
      <P>Write array of lines to file.</P>

      <H3 id="fn-read-bytes">{`io.read_bytes(path: str) -> [int]`}</H3>
      <P>Read file as a byte array.</P>

      <H3 id="fn-write-bytes">{`io.write_bytes(path: str, bytes: [int])`}</H3>
      <P>Write byte array to file.</P>

      <H3 id="fn-read-json">{`io.read_json(path: str) -> any`}</H3>
      <P>Read file and parse as JSON.</P>

      <H3 id="fn-write-json">{`io.write_json(path: str, val: any)`}</H3>
      <P>Serialize value to JSON and write to file.</P>

      <H2 id="file-info">File info</H2>

      <H3 id="fn-exists">{`io.exists(path: str) -> bool`}</H3>
      <P>True if path exists. Also available as <code>io.file_exists(path)</code>.</P>

      <H3 id="fn-size">{`io.size(path: str) -> int`}</H3>
      <P>File size in bytes. Also available as <code>io.file_size(path)</code>.</P>

      <H3 id="fn-file-info">{`io.file_info(path: str) -> map`}</H3>
      <P>Map of file metadata (size, mtime, etc.).</P>

      <H3 id="fn-is-file">{`io.is_file(path: str) -> bool`}</H3>
      <P>True if path is a regular file.</P>

      <H3 id="fn-is-dir">{`io.is_dir(path: str) -> bool`}</H3>
      <P>True if path is a directory.</P>

      <H2 id="file-manipulation">File manipulation</H2>

      <H3 id="fn-delete-file">{`io.delete_file(path: str)`}</H3>
      <P>Delete a file.</P>

      <H3 id="fn-copy-file">{`io.copy_file(src: str, dst: str)`}</H3>
      <P>Copy a file.</P>

      <H3 id="fn-move-file">{`io.move_file(src: str, dst: str)`}</H3>
      <P>Move a file.</P>

      <H3 id="fn-rename-file">{`io.rename_file(old: str, new: str)`}</H3>
      <P>Rename a file.</P>

      <H3 id="fn-symlink">{`io.symlink(target: str, link: str)`}</H3>
      <P>Create a symbolic link.</P>

      <H2 id="directories">Directories</H2>

      <H3 id="fn-make-dir">{`io.make_dir(path: str)`}</H3>
      <P>Create a directory recursively.</P>

      <H3 id="fn-list-dir">{`io.list_dir(path: str) -> [str]`}</H3>
      <P>List directory entries.</P>

      <H3 id="fn-glob">{`io.glob(pattern: str) -> [str]`}</H3>
      <P>Expand a glob pattern.</P>

      <H3 id="fn-temp">{`io.temp_file() -> str`}</H3>
      <P>Create a temporary file and return its path. <code>io.temp_dir()</code> creates a temporary directory.</P>

      <H2 id="stdin">Stdin</H2>

      <H3 id="fn-read-line">{`io.read_line(prompt?: str) -> str`}</H3>
      <P>Read a line from stdin, with optional prompt.</P>

      <H3 id="fn-stdin-read">{`io.stdin_read() -> str`}</H3>
      <P>Read all of stdin.</P>

      <H3 id="fn-stdin-readline">{`io.stdin_readline() -> str`}</H3>
      <P>Read one line from stdin.</P>

      <H3 id="fn-stdin-read-n">{`io.stdin_read_n(n: int) -> str`}</H3>
      <P>Read n bytes from stdin.</P>

      <H3 id="fn-stdin-lines">{`io.stdin_lines() -> [str]`}</H3>
      <P>Read all stdin lines as an array.</P>

      <H2 id="submodules">stdout / stderr</H2>
      <P>
        <code>io.stdout.write(s)</code>, <code>io.stdout.writeln(s)</code>, <code>io.stdout.flush()</code>
        <br />
        <code>io.stderr.write(s)</code>, <code>io.stderr.writeln(s)</code>, <code>io.stderr.flush()</code>
      </P>

      <H2 id="examples">Examples</H2>
      <Note>Snippets that touch the filesystem won't run in the playground.</Note>
      <CodeBlock
        noRun
        code={`import io

io.write_file("out.txt", "hello\\n")
let text = io.read_file("out.txt")
println(text)                    -- hello

let lines = io.read_lines("data.txt")
for line in lines { println(line) }

println(io.exists("out.txt"))   -- true
println(io.is_file("out.txt"))  -- true
io.stderr.writeln("an error message")`}
      />
    </DocLayout>
  );
}
