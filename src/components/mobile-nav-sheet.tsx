"use client";
import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

type NavLink = { href: string; label: string; external?: boolean };

export function MobileNavSheet({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        aria-label="open menu"
        onClick={() => setOpen(o => !o)}
        className="inline-flex h-8 w-8 items-center justify-center text-[color:var(--text-muted)] hover:text-[color:var(--link)]"
      >
        <span className="font-mono text-lg leading-none">{open ? "x" : "="}</span>
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-[60px] z-20 border-b border-[color:var(--rule)] bg-[color:var(--bg)]">
          <div className="mx-auto max-w-[880px] px-7 py-5 flex flex-col gap-3">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="no-rule text-base text-[color:var(--text-muted)] hover:text-[color:var(--link)]"
                {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {l.label}
              </Link>
            ))}
            <ThemeToggle />
          </div>
        </div>
      )}
    </div>
  );
}
