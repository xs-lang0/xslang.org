import Link from "next/link";
import { adjacent } from "@/lib/docs-tree";

export function DocsPager({ section, slug }: { section: string; slug: string }) {
  const { prev, next } = adjacent(section, slug);
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="docs pagination"
      className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-3"
    >
      {prev ? (
        <Link
          href={`/docs/${prev.section}/${prev.slug}`}
          className="no-rule group block border border-[color:var(--rule)] hover:border-[color:var(--link)] rounded-[6px] px-4 py-3 transition-colors"
        >
          <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[color:var(--text-faint)] mb-1">
            <span aria-hidden>&lt;-</span> previous
          </div>
          <div className="text-[14px] text-[color:var(--text)] group-hover:text-[color:var(--link)] transition-colors">
            {prev.label}
          </div>
        </Link>
      ) : <div />}
      {next ? (
        <Link
          href={`/docs/${next.section}/${next.slug}`}
          className="no-rule group block border border-[color:var(--rule)] hover:border-[color:var(--link)] rounded-[6px] px-4 py-3 transition-colors text-right"
        >
          <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-[color:var(--text-faint)] mb-1">
            next <span aria-hidden>-&gt;</span>
          </div>
          <div className="text-[14px] text-[color:var(--text)] group-hover:text-[color:var(--link)] transition-colors">
            {next.label}
          </div>
        </Link>
      ) : <div />}
    </nav>
  );
}
