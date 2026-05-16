import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "net, XS Stdlib · XS Docs" },
  description: "Low-level TCP client/server and DNS lookup using raw POSIX sockets.",
};

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="net" headings={headings}>
      <H1>net</H1>
      <Lead>Low-level TCP client/server and DNS lookup using raw POSIX sockets.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import net`} />

      <Note>
        For HTTP-level client and server, use the <code>http</code> module.
        Networking is not available on WASM targets.
      </Note>

      <H2 id="functions">Functions</H2>

      <H3 id="fn-tcp-connect">{`net.tcp_connect(host: str, port: int) -> conn`}</H3>
      <P>Open a TCP connection to host:port, returning a connection object.</P>

      <H3 id="fn-tcp-listen">{`net.tcp_listen(port: int) -> listener`}</H3>
      <P>Bind and listen on the given TCP port, returning a listener object.</P>

      <H3 id="fn-resolve">{`net.resolve(host: str) -> str`}</H3>
      <P>DNS lookup - resolve a hostname to an IP address string.</P>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        noRun
        code={`import net

-- DNS lookup
let ip = net.resolve("example.com")
println(ip)

-- TCP client
let conn = net.tcp_connect("example.com", 80)
conn.write("GET / HTTP/1.0\\r\\nHost: example.com\\r\\n\\r\\n")
let resp = conn.read()
println(resp)
conn.close()

-- TCP server
let srv = net.tcp_listen(8080)
let client = srv.accept()
let msg = client.read()
client.write("echo: {msg}")
client.close()`}
      />
    </DocLayout>
  );
}
