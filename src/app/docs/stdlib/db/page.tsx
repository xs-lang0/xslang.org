import { DocLayout } from "@/components/doc-layout";
import { CodeBlock } from "@/components/code-block";
import { H1, H2, H3, Lead, P, Note } from "@/components/prose";
import type { Heading } from "@/lib/headings";

export const metadata = {
  title: { absolute: "db, XS Stdlib · XS Docs" },
  description: "Embedded SQL database (SQLite-style) for persistent local storage.",
};

export const headings: Heading[] = [
  { id: "import", label: "Import", level: 2 },
  { id: "functions", label: "Functions", level: 2 },
  { id: "examples", label: "Examples", level: 2 },
];

export default function Page() {
  return (
    <DocLayout section="stdlib" slug="db" headings={headings}>
      <H1>db</H1>
      <Lead>Embedded SQL database (SQLite-style) for persistent local storage.</Lead>

      <H2 id="import">Import</H2>
      <CodeBlock code={`import db`} />

      <Note>Not available on WASM targets.</Note>

      <H2 id="functions">Functions</H2>

      <H3 id="fn-open">{`db.open(path: str) -> connection`}</H3>
      <P>Open a database file at the given path, creating it if it doesn't exist.</P>

      <H3 id="fn-exec">{`db.exec(sql: str)`}</H3>
      <P>Execute a SQL statement that doesn't return rows (CREATE, INSERT, UPDATE, DELETE).</P>

      <H3 id="fn-query">{`db.query(sql: str) -> [[any]]`}</H3>
      <P>Execute a SELECT query and return rows as an array of arrays.</P>

      <H3 id="fn-close">{`db.close()`}</H3>
      <P>Close the database connection.</P>

      <H2 id="examples">Examples</H2>
      <CodeBlock
        noRun
        code={`import db

let conn = db.open("app.db")

conn.exec("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)")
conn.exec("INSERT INTO users (name) VALUES ('Alice')")
conn.exec("INSERT INTO users (name) VALUES ('Bob')")

let rows = conn.query("SELECT id, name FROM users")
for row in rows {
    println("{row[0]}: {row[1]}")
}
-- 1: Alice
-- 2: Bob

conn.close()`}
      />
    </DocLayout>
  );
}
