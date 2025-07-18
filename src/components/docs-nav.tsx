"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const docsLinks = [
  { href: "/docs", label: "Overview" },
  { href: "/docs/getting-started", label: "Getting started" },
  { href: "/docs/types", label: "Type system" },
  { href: "/docs/functions", label: "Functions" },
  { href: "/docs/pattern-matching", label: "Pattern matching" },
  { href: "/docs/effects", label: "Effects" },
  { href: "/docs/structs-and-traits", label: "Structs and traits" },
  { href: "/docs/concurrency", label: "Concurrency" },
  { href: "/docs/interop", label: "Interop" },
  { href: "/docs/tooling", label: "Tooling" },
];

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
