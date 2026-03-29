import { CodeBlock } from "@/components/code-block";
import Link from "next/link";
import { docsLinks } from "@/lib/docs-links";

export default function DocsPage() {
  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold tracking-tight">Documentation</h1>
      <p className="mb-8 text-muted">
        Everything you need to get started with XS.
      </p>

      <CodeBlock
        filename="hello.xs"
        code={`fn main() {
  println("hello, world")
}`}
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
          </Link>
        ))}
      </div>
    </div>
  );
}
