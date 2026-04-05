"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/docs", label: "Docs" },
  { href: "/examples", label: "Examples" },
  { href: "/playground", label: "Playground" },
  { href: "https://reg.xslang.org", label: "Registry", external: true },
  { href: "https://github.com/xs-lang0/xs", label: "GitHub", external: true },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center text-ink border-[1.5px] border-ink"
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
        <div className="absolute left-0 right-0 top-16 z-50 border-y-[1.5px] border-ink bg-paper px-6 py-6 grain">
          <nav className="flex flex-col gap-4">
            {links.map((link) => {
              const active = pathname.startsWith(link.href) && !link.external;
              return link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-serif text-3xl text-ink leading-none"
                  style={{ fontVariationSettings: '"opsz" 144, "SOFT" 70' }}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                  <span className="smallcaps text-ink/40 ml-2 align-middle">↗</span>
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-serif text-3xl leading-none ${
                    active ? "text-accent" : "text-ink"
                  }`}
                  style={{ fontVariationSettings: '"opsz" 144, "SOFT" 70' }}
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
