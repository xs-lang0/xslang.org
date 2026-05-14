"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { docsTree } from "@/lib/docs-tree";

export function DocSidebar() {
  const path = usePathname();
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(docsTree.map(s => [s.id, true]))
  );

  return (
    <nav className="text-sm">
      {docsTree.map(s => {
        const isOpen = open[s.id];
        return (
          <div key={s.id} className="mb-5">
            <button
              onClick={() => setOpen(o => ({ ...o, [s.id]: !o[s.id] }))}
              className="w-full text-left font-semibold uppercase tracking-[0.06em] text-xs text-[color:var(--text-faint)] mb-2"
            >
              {s.label}
            </button>
            {isOpen && (
              <ul className="space-y-0.5">
                {s.pages.map(p => {
                  const href = `/docs/${s.id}/${p.slug}`;
                  const active = path === href;
                  return (
                    <li key={p.slug}>
                      <Link
                        href={href}
                        className={`no-rule block px-3 py-1 -ml-3 border-l-2 transition-colors ${active ? "border-[color:var(--link)] text-[color:var(--text)]" : "border-transparent text-[color:var(--text-muted)] hover:text-[color:var(--link)]"}`}
                      >
                        {p.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}
