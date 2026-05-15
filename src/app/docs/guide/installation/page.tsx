import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = { title: "Installation, XS Guide" };

export const headings: Heading[] = [
  { id: "one-liner", label: "One-liner install", level: 2 },
  { id: "from-source", label: "Build from source", level: 2 },
  { id: "verify", label: "Verify", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="guide" slug="installation" headings={headings}>
      <H1>Installation</H1>
      <Lead>
        Install XS with a single command. No dependencies, no package manager
        prerequisites.
      </Lead>

      <H2 id="one-liner">One-liner install</H2>

      <H3 id="linux-macos">Linux and macOS</H3>

      <CodeBlock code={`curl -fsSL https://xslang.org/install | sh`} />

      <P>
        Verifies the SHA-256 against the release sums file, then drops the{" "}
        <code>xs</code> binary into <code>/usr/local/bin/</code>. Requires{" "}
        <code>sudo</code> if that path is not writable. Override the location
        with <code>XS_INSTALL_DIR=$HOME/.local/bin</code>. After install:
      </P>

      <CodeBlock code={`xs --version
xs upgrade           -- pull the latest release, replace this binary
xs uninstall         -- remove`} />

      <H3 id="windows">Windows (PowerShell)</H3>

      <CodeBlock code={`irm https://xslang.org/install.ps1 | iex`} />

      <P>
        Installs to <code>C:\xs\bin\</code> and adds it to the system PATH.
        Requires an elevated PowerShell session (run as Administrator).
      </P>

      <H2 id="from-source">Build from source</H2>

      <P>
        Needs gcc or clang and GNU make. No other build or runtime dependencies.
      </P>

      <CodeBlock
        code={`git clone https://github.com/xs-lang0/xs
cd xs
make
make install`}
      />

      <P>Available make targets:</P>

      <CodeBlock
        code={`make              -- produces ./xs (or xs.exe on Windows)
make debug        -- -g -O0 with AddressSanitizer + UBSan
make release      -- -O3 with LTO, stripped
make test         -- runs the full test suite
make install      -- installs to /usr/local/bin/xs
make wasm         -- produces xs.wasm via wasi-sdk`}
      />

      <Note>
        HTTPS is handled by the bundled BearSSL tree under{" "}
        <code>src/tls/bearssl/</code>. You do not need openssl or any other TLS
        library installed.
      </Note>

      <H2 id="verify">Verify</H2>

      <CodeBlock code={`xs --version`} />

      <P>
        You should see the installed version. Then run the REPL to confirm
        everything works:
      </P>

      <CodeBlock code={`xs`} />

      <P>
        Type <code>println("hello")</code> and press Enter. Type{" "}
        <code>:quit</code> to exit.
      </P>

      <Note>
        The browser playground loads <code>xs.js</code> (the JS shim) and{" "}
        <code>xs.wasm</code> (the runtime) from{" "}
        <a href="https://static.xslang.org">static.xslang.org</a>. This is a
        Vercel-hosted CDN of the WASM build cut from the same source as the
        native binaries. If you embed the playground on your own page, you can
        fetch from the same URL.
      </Note>
    </DocLayout>
  );
}
