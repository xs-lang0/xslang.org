"use client";
import { useEffect, useState } from "react";

type Mode = "light" | "dark" | "system";

function readMode(): Mode {
  if (typeof window === "undefined") return "system";
  const v = localStorage.getItem("theme");
  return v === "light" || v === "dark" ? v : "system";
}

function applyMode(m: Mode) {
  const el = document.documentElement;
  if (m === "system") {
    delete el.dataset.theme;
    localStorage.removeItem("theme");
  } else {
    el.dataset.theme = m;
    localStorage.setItem("theme", m);
  }
}

const ICON: Record<Mode, string> = {
  light: "M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6L4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4",
  dark: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z",
  system: "M3 5h18v11H3zM8 21h8M12 16v5",
};

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("system");
  useEffect(() => setMode(readMode()), []);

  function cycle() {
    const next: Mode = mode === "light" ? "dark" : mode === "dark" ? "system" : "light";
    setMode(next);
    applyMode(next);
  }

  return (
    <button
      aria-label={`theme: ${mode}, click to cycle`}
      onClick={cycle}
      className="inline-flex h-6 w-6 items-center justify-center text-[color:var(--text-muted)] hover:text-[color:var(--link)] transition-colors"
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {mode === "light" && <circle cx="12" cy="12" r="4" />}
        <path d={ICON[mode]} />
      </svg>
    </button>
  );
}
