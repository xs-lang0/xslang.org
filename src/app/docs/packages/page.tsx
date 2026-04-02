import { CodeBlock } from "@/components/code-block";

export default function PackagesPage() {
  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Packages</h1>

      <p className="mb-6 text-muted">
        XS ships with <code className="text-foreground">xsi</code>, a built-in package manager
        and installer. Packages are hosted on{" "}
        <a href="https://reg.xslang.org" className="text-foreground underline underline-offset-2">
          reg.xslang.org
        </a>
        , where you can browse, search, and view package details.
      </p>

      <h2 className="mb-4 text-xl font-semibold">Installing packages</h2>
      <p className="mb-2 text-sm text-muted">
        Install a package into the current project:
      </p>
      <CodeBlock code={`xsi get http-server`} />

      <p className="mb-2 mt-4 text-sm text-muted">
        Install globally (available everywhere):
      </p>
      <CodeBlock code={`xsi get -g json-utils`} />

      <p className="mb-6 mt-2 text-sm text-muted">
        Local packages go to <code className="text-foreground">.xs_lib/</code> in your project
        directory. Global packages go to <code className="text-foreground">~/.xs/packages/</code>.
      </p>

      <h2 className="mb-4 text-xl font-semibold">Managing packages</h2>
      <p className="mb-2 text-sm text-muted">List installed packages:</p>
      <CodeBlock code={`xsi list`} />

      <p className="mb-2 mt-4 text-sm text-muted">Remove a package:</p>
      <CodeBlock code={`xsi remove http-server`} />

      <p className="mb-2 mt-4 text-sm text-muted">Search for packages:</p>
      <CodeBlock code={`xsi search json`} />

      <p className="mb-2 mt-4 text-sm text-muted">View package details:</p>
      <CodeBlock code={`xsi info http-server`} />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Using packages</h2>
      <p className="mb-4 text-sm text-muted">
        Import an installed package with <code className="text-foreground">use</code>:
      </p>
      <CodeBlock
        filename="app.xs"
        code={`use "http-server"
use "json-utils"

let data = json_utils::parse('{"name": "xs"}')
println(data.name)

http_server::serve(8080, fn(req) {
  return { status: 200, body: "hello" }
})`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Package metadata</h2>
      <p className="mb-4 text-sm text-muted">
        Every package needs an <code className="text-foreground">xs.toml</code> at the project root:
      </p>
      <CodeBlock
        filename="xs.toml"
        code={`[package]
name = "my-lib"
version = "0.1.0"
description = "A useful library"
author = "you"

[deps]
json-utils = "1.2.0"`}
      />

      <h2 className="mb-4 mt-12 text-xl font-semibold">Publishing</h2>
      <p className="mb-2 text-sm text-muted">
        Authenticate first, then publish a tarball URL to the registry:
      </p>
      <CodeBlock
        code={`xsi login
xsi publish https://github.com/you/my-lib/releases/v0.1.0.tar.gz`}
      />
      <p className="mt-2 text-sm text-muted">
        The registry fetches the tarball, validates the <code className="text-foreground">xs.toml</code>,
        and makes the package available for anyone to install.
      </p>
    </div>
  );
}
