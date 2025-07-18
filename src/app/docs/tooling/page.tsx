import { CodeBlock } from "@/components/code-block";

export default function ToolingPage() {
  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight">Tooling</h1>
      <p className="mb-8 text-muted">
        Everything is built in. No third-party toolchain required.
      </p>

      <h2 className="mb-4 text-xl font-semibold">CLI commands</h2>
      <CodeBlock
        code={`xs run main.xs          -- run a file
xs build main.xs        -- compile to binary
xs test                 -- run tests
xs fmt                  -- format code
xs lint                 -- lint code
xs lsp                  -- start language server
xs debug main.xs        -- start debugger
xs --check main.xs      -- type check only
xs --strict main.xs     -- require all annotations
xs transpile --target c main.xs  -- transpile`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Testing</h2>
      <p className="mb-4 text-muted">
        Mark functions with <code className="text-foreground">@test</code> and
        run <code className="text-foreground">xs test</code>.
      </p>
      <CodeBlock
        filename="math_test.xs"
        code={`@test
fn test_addition() {
  assert_eq(1 + 1, 2)
}

@test
fn test_string_len() {
  assert("hello".len() == 5)
}

@test
fn test_array_sort() {
  let arr = [3, 1, 2]
  assert_eq(arr.sorted(), [1, 2, 3])
}`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">LSP</h2>
      <p className="mb-4 text-muted">
        The language server provides completions, diagnostics, go-to-definition,
        and hover info. Start it
        with <code className="text-foreground">xs lsp</code> or use the VSCode extension
        which starts it automatically.
      </p>

      <h2 className="mb-4 mt-12 text-xl font-semibold">Formatter</h2>
      <p className="mb-4 text-muted">
        <code className="text-foreground">xs fmt</code> formats your code in-place.
        Opinionated, consistent, no config needed.
      </p>
      <CodeBlock
        code={`-- format a file
xs fmt main.xs

-- format everything
xs fmt .

-- check without modifying
xs fmt --check main.xs`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Debugger</h2>
      <p className="mb-4 text-muted">
        DAP-compatible debugger. Works with VSCode and any DAP client.
      </p>
      <CodeBlock
        code={`-- start debugging
xs debug main.xs

-- set breakpoints in your editor,
-- step through code, inspect variables`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Plugins</h2>
      <p className="mb-4 text-muted">
        Extend the compiler with plugins that run at build time.
      </p>
      <CodeBlock
        filename="xs.toml"
        code={`[project]
name = "my-app"
version = "0.1.0"

[plugins]
auto-log = "./plugins/auto-log.xs"`}
      />
    </div>
  );
}
