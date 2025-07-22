"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsLinks } from "@/lib/docs-links";

export function DocsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {docsLinks.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              active
                ? "bg-surface text-foreground font-medium"
                : "text-muted hover:text-foreground"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
