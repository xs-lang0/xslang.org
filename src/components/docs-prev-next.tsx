"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsLinks } from "@/lib/docs-links";

export function DocsPrevNext() {
  const pathname = usePathname();
  const index = docsLinks.findIndex((link) => link.href === pathname);

  if (index === -1) return null;

  const prev = index > 0 ? docsLinks[index - 1] : null;
  const next = index < docsLinks.length - 1 ? docsLinks[index + 1] : null;

  if (!prev && !next) return null;

  return (
    <nav className="mt-16 flex justify-between border-t border-border pt-6">
      {prev ? (
        <Link
          href={prev.href}
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          &larr; {prev.label}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={next.href}
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          {next.label} &rarr;
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
