"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { docsTree } from "@/lib/docs-tree";

const SECTION_KEY = "docs.section";
const scrollKey = (s: string) => `docs.scroll.${s}`;

function getSectionFromPath(path: string): string | null {
  for (const s of docsTree) {
    if (path.startsWith(`/docs/${s.id}/`) || path === `/docs/${s.id}`) {
      return s.id;
    }
  }
  return null;
}

function readLS(key: string): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(key); } catch { return null; }
}

function writeLS(key: string, val: string) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, val); } catch { /* ignore */ }
}

export function DocSidebar() {
  const path = usePathname();
  const pathSection = getSectionFromPath(path);

  // Initialise to whichever section the current URL points at. On the
  // /docs landing (no path section) fall back to docsTree[0]; the mount
  // effect below will swap in the persisted choice once localStorage
  // is reachable. This avoids the one-frame flash where the sidebar
  // showed Guide on every Reference / Stdlib navigation.
  const [activeSection, setActiveSection] = useState<string>(
    () => pathSection ?? docsTree[0].id
  );
  const [visible, setVisible] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On mount: if we're on the bare /docs landing, restore the user's
  // last-viewed section. On a real page, pathSection already won.
  useEffect(() => {
    if (!pathSection) {
      const persisted = readLS(SECTION_KEY);
      if (persisted && persisted !== activeSection) {
        setActiveSection(persisted);
      }
    } else {
      writeLS(SECTION_KEY, pathSection);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-switch section when navigating to a different section
  useEffect(() => {
    if (!pathSection) return;
    if (pathSection !== activeSection) {
      setVisible(false);
      setTimeout(() => {
        setActiveSection(pathSection);
        writeLS(SECTION_KEY, pathSection);
        setVisible(true);
      }, 180);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  // Restore scroll position when activeSection changes
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const saved = readLS(scrollKey(activeSection));
    if (saved !== null) {
      el.scrollTop = parseInt(saved, 10) || 0;
    }
  }, [activeSection]);

  // Save scroll position (debounced)
  const handleScroll = useCallback(() => {
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      const el = listRef.current;
      if (el) writeLS(scrollKey(activeSection), String(el.scrollTop));
    }, 100);
  }, [activeSection]);

  const switchSection = useCallback((id: string) => {
    if (id === activeSection) return;
    setVisible(false);
    setTimeout(() => {
      setActiveSection(id);
      writeLS(SECTION_KEY, id);
      setVisible(true);
    }, 180);
  }, [activeSection]);

  const section = docsTree.find(s => s.id === activeSection) ?? docsTree[0];

  return (
    <nav className="text-sm flex flex-col h-full">
      {/* Section tabs */}
      <div className="flex gap-2 mb-5 shrink-0">
        {docsTree.map(s => (
          <button
            key={s.id}
            onClick={() => switchSection(s.id)}
            className={`flex-1 py-2 px-2 rounded-[5px] text-[11px] font-semibold tracking-[0.06em] uppercase transition-colors duration-[180ms]
              ${activeSection === s.id
                ? "bg-[color:var(--link)] text-[color:var(--bg)]"
                : "text-[color:var(--text-faint)] hover:text-[color:var(--text)] hover:bg-[color:var(--rule-soft)]"
              }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Page list */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="overflow-y-auto flex-1"
        style={{ scrollbarWidth: "thin", scrollbarColor: "var(--rule) transparent" }}
      >
        <ul
          className="space-y-0.5"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 180ms var(--ease)",
          }}
        >
          {section.pages.map(p => {
            const href = `/docs/${section.id}/${p.slug}`;
            const active = path === href;
            return (
              <li key={p.slug}>
                <Link
                  href={href}
                  className={`no-rule block px-3 py-1 -ml-3 border-l-2 transition-all duration-[120ms]
                    ${active
                      ? "border-[color:var(--link)] text-[color:var(--text)]"
                      : "border-transparent text-[color:var(--text-muted)] hover:text-[color:var(--link)] hover:translate-x-[2px]"
                    }`}
                >
                  {p.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
