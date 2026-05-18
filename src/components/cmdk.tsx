"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { search, type Chunk, type Hit } from "./cmdk-fuzzy";

export function CmdK() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [index, setIndex] = useState<Chunk[] | null>(null);
  const router = useRouter();
  const hits: Hit[] = useMemo(() => index ? search(index, q) : [], [index, q]);

  const close = useCallback(() => { setOpen(false); setQ(""); }, []);

  useEffect(() => {
    function key(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const editing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(o => !o);
        return;
      }
      if (e.key === "/" && !open && !editing) {
        e.preventDefault();
        setOpen(true);
        return;
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open]);

  // The search button lives in a separate component (DocSearchButton). It
  // dispatches a window event so this dialog can stay layout-level without
  // any prop drilling or shared context provider.
  useEffect(() => {
    function onOpen() { setOpen(true); }
    window.addEventListener("xs:cmdk-open", onOpen);
    return () => window.removeEventListener("xs:cmdk-open", onOpen);
  }, []);

  useEffect(() => {
    if (!open || index) return;
    fetch("/docs-index.json").then(r => r.json()).then(d => setIndex(d));
  }, [open, index]);

  const onQueryChange = useCallback((value: string) => {
    setQ(value);
    setActive(0);
  }, []);

  const go = useCallback((h: Hit) => {
    const path = h.sectionAnchor
      ? `/docs/${h.pageSlug}#${h.sectionAnchor}`
      : `/docs/${h.pageSlug}`;
    router.push(path);
    close();
  }, [router, close]);

  if (!open) return null;
  return (
    <div role="dialog" aria-label="search docs" className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-24" onClick={close}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-[620px] mx-4 border border-[color:var(--rule)] bg-[color:var(--panel)] rounded-[6px]">
        <input
          autoFocus
          value={q}
          onChange={e => onQueryChange(e.target.value)}
          onKeyDown={e => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, hits.length - 1)); }
            if (e.key === "ArrowUp")   { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
            if (e.key === "Enter" && hits[active]) go(hits[active]);
          }}
          placeholder="search docs"
          className="w-full bg-transparent border-b border-[color:var(--rule)] px-4 py-3 text-[color:var(--text)] font-mono text-sm outline-none placeholder:text-[color:var(--text-faint)]"
        />
        <ul className="max-h-[60vh] overflow-y-auto py-2">
          {hits.length === 0 && q && <li className="px-4 py-3 text-sm text-[color:var(--text-faint)]">no matches</li>}
          {hits.map((h, i) => {
            const cleanTitle = h.pageTitle.replace(/\s*[·,]\s*XS\s+(Guide|Reference|Stdlib|Docs)\s*$/i, "");
            return (
              <li
                key={`${h.pageSlug}::${h.sectionAnchor}::${i}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(h)}
                className={`px-4 py-2.5 cursor-pointer ${i === active ? "bg-[color:var(--rule-soft)]" : ""}`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0 flex items-baseline gap-2">
                    <span className="text-[color:var(--text)] font-medium truncate">{cleanTitle}</span>
                    {h.sectionHeading && (
                      <span className="text-[color:var(--text-muted)] text-sm truncate">› {h.sectionHeading}</span>
                    )}
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-[color:var(--text-faint)] shrink-0">{h.section}</span>
                </div>
                {h.snippet.length > 1 && (
                  <div className="mt-1 text-xs leading-snug text-[color:var(--text-muted)] line-clamp-2">
                    {h.snippet.map((s, j) =>
                      s.mark
                        ? <mark key={j} className="bg-transparent text-[color:var(--link)] font-medium">{s.text}</mark>
                        : <span key={j}>{s.text}</span>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
