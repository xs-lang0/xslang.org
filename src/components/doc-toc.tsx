import type { Heading } from "@/lib/headings";

export function DocTOC({ headings }: { headings: Heading[] }) {
  if (!headings.length) return null;
  return (
    <nav className="text-xs">
      <div className="font-semibold uppercase tracking-[0.06em] text-[color:var(--text-faint)] mb-3">On this page</div>
      <ul className="space-y-1.5">
        {headings.map(h => (
          <li key={h.id} className={h.level === 3 ? "pl-3" : ""}>
            <a href={`#${h.id}`} className="no-rule text-[color:var(--text-muted)] hover:text-[color:var(--link)]">{h.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
