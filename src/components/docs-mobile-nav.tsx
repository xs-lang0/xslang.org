"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsLinks } from "./docs-nav";

export function DocsMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const current = docsLinks.find((l) => l.href === pathname)?.label ?? "Docs";

  return (
    <div className="mb-6 lg:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg border border-border px-4 py-2.5 text-sm"
      >
        <span>{current}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>
      {open && (
        <nav className="mt-2 flex flex-col gap-1 rounded-lg border border-border bg-surface p-2">
          {docsLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-background text-foreground font-medium"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
