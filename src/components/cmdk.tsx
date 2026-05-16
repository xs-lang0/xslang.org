"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { search, type Hit } from "./cmdk-fuzzy";

type Page = { slug: string; title: string };

export function CmdK() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const indexRef = useRef<Page[] | null>(null);
  const router = useRouter();

  useEffect(() => {
    function key(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);

  useEffect(() => {
    if (!open || indexRef.current) return;
    fetch("/docs-index.json").then(r => r.json()).then(d => { indexRef.current = d; });
  }, [open]);

  useEffect(() => {
    if (!indexRef.current) { setHits([]); return; }
    setHits(search(indexRef.current, q));
    setActive(0);
  }, [q, open]);

  function go(h: Hit) {
    router.push(`/docs/${h.slug}`);
    setOpen(false);
    setQ("");
  }

  if (!open) return null;
  return (
    <div role="dialog" className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-24" onClick={() => setOpen(false)}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-[560px] mx-4 border border-[color:var(--rule)] bg-[color:var(--panel)] rounded-[6px]">
        <input
          autoFocus
          value={q}
          onChange={e => setQ(e.target.value)}
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
          {hits.map((h, i) => (
            <li
              key={h.slug}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(h)}
              className={`px-4 py-2 cursor-pointer flex items-baseline justify-between ${i === active ? "bg-[color:var(--rule-soft)]" : ""}`}
            >
              <span className="text-[color:var(--text)]">
                {/* The section column on the right already says Guide /
                 * Reference / Stdlib; trim the redundant suffix from the
                 * title so the row reads as just the topic. */}
                {h.title.replace(/\s*[·,]\s*XS\s+(Guide|Reference|Stdlib|Docs)\s*$/i, "")}
              </span>
              <span className="font-mono text-xs text-[color:var(--text-faint)]">{h.section}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
