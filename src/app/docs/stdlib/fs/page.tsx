import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "fs, XS Stdlib" };

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "reading", label: "Reading files", level: 2 },
  { id: "writing", label: "Writing files", level: 2 },
  { id: "metadata", label: "Metadata", level: 2 },
  { id: "manipulation", label: "File manipulation", level: 2 },
  { id: "directories", label: "Directories", level: 2 },
  { id: "path-utils", label: "Path utilities", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="fs" headings={headings}>
      <H1>fs</H1>
      <Lead>Filesystem operations: reading, writing, metadata, directories, and path utilities.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import fs`} />

      <Note>All fs calls are synchronous and not available on WASM targets.</Note>

      <H2 id="reading">Reading files</H2>

      <H3 id="fn-read">{`fs.read(path: str) -> str`}</H3>
      <P>Read the entire file as a string.</P>

      <H3 id="fn-read-bytes">{`fs.read_bytes(path: str) -> [int]`}</H3>
      <P>Read the entire file as a byte array.</P>

      <H3 id="fn-read-lines">{`fs.read_lines(path: str) -> [str]`}</H3>
      <P>Read the file and split on newlines, returning an array of lines.</P>

      <H3 id="fn-read-stream">{`fs.read_stream(path: str) -> reader`}</H3>
      <P>Open a streaming reader. The returned object has <code>.read(n)</code> and <code>.close()</code> methods.</P>

      <H2 id="writing">Writing files</H2>

      <H3 id="fn-write">{`fs.write(path: str, str: str)`}</H3>
      <P>Write a string to the file, replacing any existing content.</P>

      <H3 id="fn-write-bytes">{`fs.write_bytes(path: str, arr: [int])`}</H3>
      <P>Write a byte array to the file.</P>

      <H3 id="fn-write-stream">{`fs.write_stream(path: str) -> writer`}</H3>
      <P>Open a streaming writer with <code>.write(s)</code> and <code>.close()</code> methods.</P>

      <H3 id="fn-append">{`fs.append(path: str, str: str)`}</H3>
      <P>Append a string to the file.</P>

      <H2 id="metadata">Metadata</H2>

      <H3 id="fn-exists">{`fs.exists(path: str) -> bool`}</H3>
      <P>True if the path exists.</P>

      <H3 id="fn-is-file">{`fs.is_file(path: str) -> bool`}</H3>
      <P>True if path is a regular file.</P>

      <H3 id="fn-is-dir">{`fs.is_dir(path: str) -> bool`}</H3>
      <P>True if path is a directory.</P>

      <H3 id="fn-size">{`fs.size(path: str) -> int`}</H3>
      <P>File size in bytes.</P>

      <H3 id="fn-stat">{`fs.stat(path: str) -> map`}</H3>
      <P>Map with keys: <code>size</code>, <code>mtime</code>, <code>is_dir</code>, <code>is_file</code>, <code>mode</code>.</P>

      <H2 id="manipulation">File manipulation</H2>

      <H3 id="fn-remove">{`fs.remove(path: str)`}</H3>
      <P>Delete a file.</P>

      <H3 id="fn-rename">{`fs.rename(from: str, to: str)`}</H3>
      <P>Move or rename a file.</P>

      <H3 id="fn-copy">{`fs.copy(from: str, to: str)`}</H3>
      <P>Copy a file.</P>

      <H3 id="fn-chmod">{`fs.chmod(path: str, mode: int)`}</H3>
      <P>Set POSIX permission bits.</P>

      <H3 id="fn-symlink">{`fs.symlink(target: str, link: str)`}</H3>
      <P>Create a symbolic link.</P>

      <H3 id="fn-readlink">{`fs.readlink(path: str) -> str`}</H3>
      <P>Read the target of a symbolic link. <code>fs.realpath(path)</code> resolves all symlinks to an absolute path.</P>

      <H2 id="directories">Directories</H2>

      <H3 id="fn-mkdir">{`fs.mkdir(path: str)`}</H3>
      <P>Create a directory. <code>fs.mkdir_p(path)</code> creates parents if needed.</P>

      <H3 id="fn-rmdir">{`fs.rmdir(path: str)`}</H3>
      <P>Remove an empty directory.</P>

      <H3 id="fn-list">{`fs.list(path: str) -> [str]`}</H3>
      <P>List direct children of a directory. Also available as <code>fs.ls(path)</code>.</P>

      <H3 id="fn-walk">{`fs.walk(path: str) -> iter`}</H3>
      <P>Recursive iterator yielding maps with keys <code>path</code>, <code>is_dir</code>, and metadata.</P>

      <H3 id="fn-glob">{`fs.glob(pat: str) -> [str]`}</H3>
      <P>Expand a glob pattern relative to the current directory.</P>

      <H3 id="fn-watch">{`fs.watch(path: str, fn: (event) -> void)`}</H3>
      <P>Run fn when the file or directory at path changes.</P>

      <H3 id="fn-temp">{`fs.temp_dir() -> str`}</H3>
      <P>Return a platform temp directory path. <code>fs.temp_file(prefix?)</code> creates a temp file.</P>

      <H2 id="path-utils">Path utilities</H2>

      <H3 id="fn-join">{`fs.join(a: str, b: str, ...) -> str`}</H3>
      <P>Join path components with the platform separator.</P>

      <H3 id="fn-basename">{`fs.basename(path: str) -> str`}</H3>
      <P>Filename component.</P>

      <H3 id="fn-dirname">{`fs.dirname(path: str) -> str`}</H3>
      <P>Directory component.</P>

      <H3 id="fn-ext">{`fs.ext(path: str) -> str`}</H3>
      <P>File extension including the dot.</P>

      <H3 id="fn-abs">{`fs.abs(path: str) -> str`}</H3>
      <P>Absolute path from the current directory.</P>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        noRun
        code={`import fs

fs.write("/tmp/hi.txt", "hello")
let s = fs.read("/tmp/hi.txt")
println(s)  -- hello

for line in fs.read_lines("/etc/hosts") {
    println(line)
}

let info = fs.stat("/tmp/hi.txt")
println(info["size"])    -- 5

fs.mkdir_p("/tmp/a/b/c")
for entry in fs.walk("/tmp/a") {
    println(entry["path"])
}

-- streaming write
let w = fs.write_stream("/tmp/big.txt")
for i in 0..1000 {
    w.write("line {i}\n")
}
w.close()`}
      />
    </DocLayout>
  );
}
