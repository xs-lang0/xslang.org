import { CodeBlock } from "@/components/code-block";

export default function BrowserSDKPage() {
  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight">Browser SDK</h1>
      <p className="mb-8 text-muted">
        Run XS in any webpage with a single script tag. No server, no build step, no dependencies.
      </p>

      <h2 className="mb-4 text-xl font-semibold">Quick start</h2>
      <CodeBlock
        filename="index.html"
        code={`<!DOCTYPE html>
<html>
<head>
  <script src="https://xslang.org/xs.js"><\/script>
</head>
<body>
  <p id="out"></p>
  <script>
    (async () => {
      const xs = await loadXS()
      const output = await xs.run(\`println("hello world")\`)
      document.getElementById("out").textContent = output
    })()
  <\/script>
</body>
</html>`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">API</h2>

      <h3 className="mb-3 mt-8 text-lg font-medium">loadXS(config?)</h3>
      <p className="mb-4 text-muted">
        Loads the XS runtime. Returns a promise that resolves to the runtime object.
        Call with no arguments for defaults, or pass a config object to customize everything.
      </p>

      <h3 className="mb-3 mt-8 text-lg font-medium">xs.run(code)</h3>
      <p className="mb-4 text-muted">
        Run a string of XS code. Returns a promise that resolves to the captured stdout as a string.
        Each call gets a fresh WASM instance, so there is no state leaking between runs.
      </p>
      <CodeBlock
        code={`const xs = await loadXS()
const output = await xs.run(\`
  for i in 1..=5 {
    println("count: " + str(i))
  }
\`)
console.log(output)
// "count: 1\\ncount: 2\\ncount: 3\\ncount: 4\\ncount: 5"`}
      />

      <h3 className="mb-3 mt-8 text-lg font-medium">xs.exec(args)</h3>
      <p className="mb-4 text-muted">
        Run with full CLI arguments. Returns a promise that resolves to the exit code.
        Use this for type checking, transpilation, or any CLI feature.
      </p>
      <CodeBlock
        code={`const xs = await loadXS({ stdout: (line) => console.log(line) })

xs.writeFile("app.xs", \`
  fn greet(name: str) -> str {
    return "hello, " + name
  }
  println(greet("world"))
\`)

const exitCode = await xs.exec(["xs", "/app.xs"])  // prints "hello, world"
const checkCode = await xs.exec(["xs", "--check", "/app.xs"])  // type check only`}
      />

      <h3 className="mb-3 mt-8 text-lg font-medium">xs.writeFile(path, content)</h3>
      <p className="mb-4 text-muted">
        Write a file to the virtual filesystem. Use this to set up multi-file programs
        before calling <code className="text-foreground">exec()</code>.
      </p>

      <h3 className="mb-3 mt-8 text-lg font-medium">xs.readFile(path)</h3>
      <p className="mb-4 text-muted">
        Read a file from the virtual filesystem. Returns the content as a string, or null if not found.
      </p>

      <h3 className="mb-3 mt-8 text-lg font-medium">xs.listFiles()</h3>
      <p className="mb-4 text-muted">
        List all files in the virtual filesystem. Returns an array of path strings.
      </p>

      <h3 className="mb-3 mt-8 text-lg font-medium">xs.deleteFile(path)</h3>
      <p className="mb-4 text-muted">
        Delete a file from the virtual filesystem.
      </p>

      <h3 className="mb-3 mt-8 text-lg font-medium">xs.reset(clearFs?)</h3>
      <p className="mb-4 text-muted">
        Reset the WASM instance. Pass <code className="text-foreground">false</code> to
        keep the filesystem intact.
      </p>

      <h3 className="mb-3 mt-8 text-lg font-medium">xs.memory / xs.instance</h3>
      <p className="mb-4 text-muted">
        Direct access to the underlying <code className="text-foreground">WebAssembly.Memory</code> and{" "}
        <code className="text-foreground">WebAssembly.Instance</code> for advanced use.
      </p>

      <h2 className="mb-4 mt-12 text-xl font-semibold">Configuration</h2>
      <p className="mb-4 text-muted">
        Every layer of the runtime is configurable. Pass options to{" "}
        <code className="text-foreground">loadXS()</code> to customize behavior.
      </p>
      <CodeBlock
        code={`const xs = await loadXS({

  // where to fetch the WASM binary (default: https://xslang.org/xs.wasm)
  wasmUrl: "https://xslang.org/xs.wasm",

  // I/O callbacks
  stdout: (line) => console.log(line),
  stderr: (line) => console.error(line),
  stdin: () => prompt("input:"),

  // environment variables passed to the XS process
  env: {
    HOME: "/",
    XS_NO_COLOR: "1",
  },

  // persistent mode: filesystem and state survive between exec() calls
  // useful for installing packages, loading plugins, building up state
  persistent: true,

  // pre-populate the virtual filesystem
  fs: {
    files: {
      "lib.xs": \`fn double(x) { return x * 2 }\`,
      "data.txt": "some data",
    },
  },

  // or bring your own filesystem implementation
  // fs: {
  //   open(path, flags) { ... },
  //   read(fd, buf, len) { ... },
  //   write(fd, data) { ... },
  //   seek(fd, offset, whence) { ... },
  //   close(fd) { ... },
  //   filesize(fd) { ... },
  //   writeFile(path, content) { ... },
  //   readFile(path) { ... },
  //   listFiles() { ... },
  //   deleteFile(path) { ... },
  // },

  // override individual WASI syscalls
  wasi: {
    fd_write(fd, iovPtr, iovLen, nwrittenPtr) {
      // custom stdout handling
    },
    clock_time_get(clockId, precision, timePtr) {
      // custom clock
    },
  },

  // add custom WASM import modules (advanced)
  imports: {
    env: {
      custom_func() { return 42; },
    },
  },
})`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Streaming output</h2>
      <p className="mb-4 text-muted">
        Use the <code className="text-foreground">stdout</code> callback for real-time output
        instead of waiting for <code className="text-foreground">xs.run()</code> to return.
      </p>
      <CodeBlock
        filename="stream.html"
        code={`<pre id="log"></pre>
<script>
  (async () => {
    const log = document.getElementById("log")
    const xs = await loadXS({
      stdout: (line) => { log.textContent += line + "\\n" },
      stderr: (line) => { log.textContent += "[err] " + line + "\\n" },
    })
    await xs.run(\`
      for i in 1..=100 {
        println("processing item " + str(i))
      }
      println("done")
    \`)
  })()
<\/script>`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Persistent mode</h2>
      <p className="mb-4 text-muted">
        By default, each <code className="text-foreground">run()</code> call gets a fresh WASM instance.
        Enable <code className="text-foreground">persistent: true</code> to keep state across calls,
        which is needed for package management, plugins, or building up an environment.
      </p>
      <CodeBlock
        code={`const xs = await loadXS({ persistent: true })

// install a package (filesystem persists)
await xs.exec(["xs", "install", "json-utils"])

// use it in a later run
const output = await xs.run(\`
  use "json-utils"
  println(json.parse('{"a": 1}'))
\`)`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Self-hosting</h2>
      <p className="mb-4 text-muted">
        To serve the SDK from your own domain, download both files and point{" "}
        <code className="text-foreground">wasmUrl</code> at your copy.
      </p>
      <CodeBlock
        code={`<!-- serve xs.js and xs.wasm from your own CDN -->
<script src="https://your-cdn.com/xs.js"><\/script>
<script>
  (async () => {
    const xs = await loadXS({ wasmUrl: "https://your-cdn.com/xs.wasm" })
    const output = await xs.run(\`println("self-hosted")\`)
  })()
<\/script>`}
      />
    </div>
  );
}
