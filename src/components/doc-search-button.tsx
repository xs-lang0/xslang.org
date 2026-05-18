"use client";
import { useSyncExternalStore } from "react";

function dispatchOpen() {
  window.dispatchEvent(new CustomEvent("xs:cmdk-open"));
}

// Detect Mac vs the rest so the hint chip shows the right modifier. Using
// useSyncExternalStore keeps the SSR snapshot consistent (Ctrl) and lets
// the client hydrate to the correct value on Mac without an effect.
function detectMac(): boolean {
  const ua = navigator.userAgent || "";
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform || navigator.platform || "";
  return /Mac|iPhone|iPad|iPod/i.test(platform) || /Mac OS X/i.test(ua);
}

const subscribeNoop = () => () => {};
function useIsMac(): boolean {
  return useSyncExternalStore(subscribeNoop, detectMac, () => false);
}

export function DocSearchButton({ variant = "block" }: { variant?: "block" | "compact" }) {
  const mac = useIsMac();
  const hint = mac ? "⌘ K" : "Ctrl K";
  const compact = variant === "compact";
  return (
    <button
      type="button"
      aria-label="search docs"
      onClick={dispatchOpen}
      className={
        compact
          ? "inline-flex items-center justify-center h-8 w-8 rounded-[5px] border border-[color:var(--rule)] text-[color:var(--text-muted)] hover:text-[color:var(--link)] hover:border-[color:var(--link)] transition-colors"
          : "group w-full flex items-center gap-2 h-9 px-3 rounded-[5px] border border-[color:var(--rule)] bg-[color:var(--bg)] text-left text-sm text-[color:var(--text-faint)] hover:border-[color:var(--link)] hover:text-[color:var(--text-muted)] transition-colors"
      }
    >
      <svg
        viewBox="0 0 24 24" width="14" height="14" fill="none"
        stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
        className="shrink-0"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3.5-3.5" />
      </svg>
      {!compact && (
        <>
          <span className="flex-1 truncate">Search docs...</span>
          <kbd className="font-mono text-[10px] tracking-[0.04em] text-[color:var(--text-faint)] border border-[color:var(--rule)] rounded-[3px] px-1.5 py-[1px]">
            {hint}
          </kbd>
        </>
      )}
    </button>
  );
}
