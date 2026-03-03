import { CodeBlock } from "@/components/code-block";
import Link from "next/link";
import { docsLinks } from "@/lib/docs-links";

export default function DocsPage() {
  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight">Documentation</h1>
      <p className="mb-8 text-muted">
        XS is a gradually typed language that compiles to C, JavaScript, and
        WebAssembly. It has algebraic effects, pattern matching, and built-in
        concurrency, all from a single codebase with zero dependencies.
      </p>

      <CodeBlock
        filename="hello.xs"
        code={`println("hello, world")`}
      />

      <p className="mt-4 mb-8 text-sm text-muted">
        Run it with <code className="text-foreground">xs run hello.xs</code>.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {docsLinks.slice(1).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg border border-border p-4 transition-colors hover:border-muted"
          >
            <span className="text-sm font-medium">{link.label}</span>
            <p className="mt-1 text-xs text-muted">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
