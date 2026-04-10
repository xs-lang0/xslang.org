"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/docs", label: "docs" },
  { href: "/examples", label: "examples" },
  { href: "/playground", label: "playground" },
  { href: "https://reg.xslang.org", label: "registry", external: true },
  { href: "https://github.com/xs-lang0/xs", label: "github", external: true },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center text-foreground border border-border-2"
        aria-label="Toggle menu"
      >
        {open ? (
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 4l10 10M14 4L4 14" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M2 5h14M2 13h14" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-16 z-50 border-y-2 border-accent bg-background px-6 py-6">
          <nav className="flex flex-col gap-4">
            {links.map((link) => {
              const active = pathname.startsWith(link.href) && !link.external;
              return link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-display text-3xl text-foreground hover:text-accent"
                  onClick={() => setOpen(false)}
                >
                  {link.label} <span className="text-accent">↗</span>
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-display text-3xl ${active ? "text-accent" : "text-foreground hover:text-accent"}`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
