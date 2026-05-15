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
        This downloads the XS installer (xsi), which sets up{" "}
        <code>/usr/local/xs/</code> with the compiler, VM, package manager, and
        all built-in tools. Requires <code>sudo</code>. After install:
      </P>

      <CodeBlock
        code={`/usr/local/xs/
  bin/     -- xs, xsi (added to PATH)
  lib/     -- globally installed packages
  cache/   -- download cache
  env      -- shell environment setup`}
      />

      <H3 id="windows">Windows (PowerShell)</H3>

      <CodeBlock code={`irm https://xslang.org/install.ps1 | iex`} />

      <P>
        Installs to <code>C:\xs\</code> and adds <code>C:\xs\bin</code> to the
        system PATH. Requires an elevated PowerShell session (run as
        Administrator).
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
    </DocLayout>
  );
}
