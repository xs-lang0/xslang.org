"use client";
import { useState } from "react";

export function CopyButton({ text, className = "" }: { text: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1200);
      }}
      className={`border border-[color:var(--rule)] bg-transparent font-mono text-[11px] uppercase tracking-[0.06em] px-[10px] py-1 rounded-[3px] transition-colors ${done ? "text-[color:var(--link)] border-[color:var(--link)]" : "text-[color:var(--text-faint)] hover:text-[color:var(--link)] hover:border-[color:var(--link)]"} ${className}`}
    >
      {done ? "copied" : "copy"}
    </button>
  );
}
