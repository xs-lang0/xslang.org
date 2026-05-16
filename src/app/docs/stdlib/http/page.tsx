import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "http, XS Stdlib · XS Docs" },
  description: "HTTP client and server using raw POSIX sockets with optional BearSSL for HTTPS.",
};

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "client", label: "HTTP client", level: 2 },
  { id: "server", label: "HTTP server", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="http" headings={headings}>
      <H1>http</H1>
      <Lead>HTTP client and server using raw POSIX sockets with optional BearSSL for HTTPS.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import http`} />

      <Note>
        HTTP functions are not available on WASM targets or on MinGW builds.
        HTTPS is supported on Linux and macOS via the embedded BearSSL library.
      </Note>

      <H2 id="client">HTTP client</H2>

      <H3 id="fn-get">{`http.get(url: str, opts?: map) -> map`}</H3>
      <P>Send a GET request and return a response map with <code>status</code>, <code>body</code>, <code>headers</code>.</P>

      <H3 id="fn-post">{`http.post(url: str, body?: str, opts?: map) -> map`}</H3>
      <P>Send a POST request with an optional body string.</P>

      <H3 id="fn-put">{`http.put(url: str, body?: str, opts?: map) -> map`}</H3>
      <P>Send a PUT request.</P>

      <H3 id="fn-delete">{`http.delete(url: str, opts?: map) -> map`}</H3>
      <P>Send a DELETE request.</P>

      <H3 id="fn-patch">{`http.patch(url: str, body?: str, opts?: map) -> map`}</H3>
      <P>Send a PATCH request.</P>

      <H3 id="fn-request">{`http.request(opts: map) -> map`}</H3>
      <P>
        Low-level request builder. <code>opts</code> may include <code>method</code>, <code>url</code>,{" "}
        <code>headers</code>, <code>body</code>.
      </P>

      <H2 id="server">HTTP server</H2>

      <H3 id="fn-serve">{`http.serve(port: int, handler: fn | router)`}</H3>
      <P>
        Start an HTTP server on the given port. The handler receives a request map with{" "}
        <code>method</code>, <code>path</code>, <code>query</code>, <code>headers</code>, <code>body</code>,{" "}
        and must return a response map with at least <code>status</code> and <code>body</code>.
        Alternatively, pass a router map with a <code>routes</code> key for path-based dispatch.
      </P>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        noRun
        code={`import http

-- client: GET
let r = http.get("https://httpbin.org/get")
println(r["status"])  -- 200
println(r["body"])

-- client: POST with JSON body
import json
let body = json.stringify(#{"name": "Alice"})
let r2 = http.post("https://httpbin.org/post", body, #{
    "headers": #{"content-type": "application/json"}
})
println(r2["status"])

-- server: simple echo
http.serve(8080, fn(req) {
    return #{
        "status": 200,
        "body": "path was: {req["path"]}"
    }
})`}
      />
    </DocLayout>
  );
}
