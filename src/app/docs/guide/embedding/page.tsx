import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "Embedding xs.wasm · XS Guide" },
  description: "Run XS in the browser by loading xs.wasm and xs.js from static.xslang.org. Same compiler the playground uses, with a virtual filesystem and captured stdout.",
};

export const headings: Heading[] = [
  { id: "what-it-is", label: "What it is", level: 2 },
  { id: "minimal", label: "Minimal page", level: 2 },
  { id: "options", label: "loadXS options", level: 2 },
  { id: "vs-emit-js", label: "vs --emit js", level: 2 },
];

const MIN_HTML = `<!doctype html>
<script src="https://static.xslang.org/xs.js"></script>
<script>
  const xs = await loadXS();
  await xs.run('println("hello from the browser")');
</script>`;

const STDOUT_HTML = `const xs = await loadXS({
  stdout: (line) => document.getElementById("out").append(line + "\\n"),
});
await xs.run(\`
  for i in 1..=3 {
    println("tick " + str(i))
  }
\`);`;

const FS_HTML = `const xs = await loadXS({
  fs: { files: { "main.xs": "use util\\nutil.greet(\\"world\\")",
                 "util.xs": "fn greet(name) { println(\\"hi \\" + name) }" } },
});
await xs.exec(["xs", "main.xs"]);`;

const STDIN_HTML = `const xs = await loadXS({
  worker: true,
  stdin: async () => prompt("?") + "\\n",
});
await xs.run('let n = input("number: "); println(int(n) * 2)');`;

export default function Page() {
  return (
    <DocLayout section="guide" slug="embedding" headings={headings}>
      <H1>Embedding xs.wasm</H1>
      <Lead>
        Run XS in the browser by loading <code>xs.wasm</code> and{" "}
        <code>xs.js</code> from <code>static.xslang.org</code>. Same compiler
        the playground uses, with a virtual filesystem and captured stdout.
      </Lead>

      <H2 id="what-it-is">What it is</H2>
      <P>
        <code>static.xslang.org/xs.wasm</code> is the compiler itself, built
        with <code>wasi-sdk</code>. <code>xs.js</code> is a thin wrapper that
        instantiates the module, exposes a virtual filesystem, and routes
        stdout / stderr / stdin through callbacks. After <code>loadXS()</code>{" "}
        resolves, <code>xs.run(source)</code> evaluates an XS program and{" "}
        <code>xs.exec(argv)</code> runs the same CLI a native install would.
      </P>

      <H2 id="minimal">Minimal page</H2>
      <CodeBlock code={MIN_HTML} />
      <P>
        That is the whole setup. The script tag pulls the wrapper from the
        CDN; the wrapper fetches and instantiates the wasm itself.
      </P>

      <H2 id="options">loadXS options</H2>
      <P>
        Capture stdout instead of writing to <code>console.log</code>:
      </P>
      <CodeBlock code={STDOUT_HTML} />
      <P>
        Preload files into the virtual filesystem so <code>use</code> and{" "}
        <code>import</code> resolve:
      </P>
      <CodeBlock code={FS_HTML} />
      <P>
        Run <code>input()</code> against a JS prompt. <code>worker: true</code>{" "}
        spawns the wasm in a Web Worker so blocking stdin works without
        freezing the main thread; it requires a SharedArrayBuffer (cross-
        origin isolated page).
      </P>
      <CodeBlock code={STDIN_HTML} />

      <H2 id="vs-emit-js">vs --emit js</H2>
      <P>
        <code>xs --emit js</code> rewrites your XS program as JavaScript that
        runs directly in Node or a browser, no XS runtime needed. It is the
        right path if you want a small, dependency-free bundle of one
        program.
      </P>
      <P>
        <code>xs.wasm</code> is the opposite trade. The whole compiler is
        running on the page; you can write or evaluate any XS program at
        runtime, files persist in IndexedDB if you ask, and behaviour
        matches the native binary instead of mapping through JS semantics.
        It is what the playground uses. If you are building a code editor,
        a tutorial, or anything that needs to run user-supplied XS, embed
        <code> xs.wasm</code>; otherwise <code>--emit js</code> ships less.
      </P>

      <Note>
        TLS is unavailable in the browser build (the runtime cannot open raw
        sockets). HTTP requests must go through <code>fetch</code> from the
        host page. <code>xs.fetch(url, path)</code> on the SDK does exactly
        that and writes the response to a virtual file.
      </Note>
    </DocLayout>
  );
}
