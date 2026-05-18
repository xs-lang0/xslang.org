"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/headings";

export function DocTOC({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    if (!headings.length) return;
    const els = headings
      .map(h => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!els.length) return;

    // Track which headings are currently visible; pick the topmost one.
    const visible = new Map<string, number>();
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.set(e.target.id, e.boundingClientRect.top);
        else visible.delete(e.target.id);
      }
      if (visible.size === 0) return;
      let bestId: string | null = null;
      let bestTop = Infinity;
      for (const [id, top] of visible) {
        if (top < bestTop) { bestTop = top; bestId = id; }
      }
      if (bestId) setActive(bestId);
    }, {
      // Trigger when a heading enters the upper third of the viewport.
      rootMargin: "-72px 0px -66% 0px",
      threshold: [0, 1],
    });

    for (const el of els) obs.observe(el);
    return () => obs.disconnect();
  }, [headings]);

  if (!headings.length) return null;
  return (
    <nav className="text-xs">
      <div className="font-semibold uppercase tracking-[0.06em] text-[color:var(--text-faint)] mb-3">On this page</div>
      <ul className="space-y-px border-l border-[color:var(--rule-soft)]">
        {headings.map(h => {
          const isActive = h.id === active;
          return (
            <li key={h.id} className={h.level === 3 ? "pl-3" : ""}>
              <a
                href={`#${h.id}`}
                className={`no-rule block py-1 pl-3 -ml-px border-l border-transparent transition-colors ${
                  isActive
                    ? "text-[color:var(--link)] border-l-[color:var(--link)]"
                    : "text-[color:var(--text-muted)] hover:text-[color:var(--text)]"
                }`}
              >
                {h.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
