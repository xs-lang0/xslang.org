"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { encodeWorkspace } from "@/lib/share";

type Props = {
  files: Record<string, string>;
  active: string;
  onClose: () => void;
};

type Tab = "link" | "embed";

const TAB_BTN_BASE = "font-mono text-[11.5px] px-3 py-1.5 border-b-2 -mb-px transition-colors";

// Mirror the share-button style from the playground so the copy controls
// don't look like they came from a different page. The cancel-style only
// muted text + rule border, the active style picks up the accent colour.
const COPY_BTN = "font-mono text-[11.5px] px-3 py-1.5 rounded-[6px] border border-[color:var(--link)] text-[color:var(--link)] bg-transparent hover:bg-[color:var(--rule-soft)] transition-colors";

const TEXTAREA_CLASS = "w-full font-mono text-[12px] bg-[color:var(--bg)] border border-[color:var(--rule)] rounded-[6px] px-3 py-2 text-[color:var(--text-muted)] outline-none focus:border-[color:var(--link)] transition-colors resize-none";

// Anything beyond this (in encoded characters) probably won't fit in the
// URL bar of some shells / chat clients, so suggest gist import instead.
const URL_SOFT_LIMIT = 16 * 1024;

export function ShareModal({ files, active, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("link");
  const [encoded, setEncoded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [embedHeight, setEmbedHeight] = useState(420);
  const [embedTheme, setEmbedTheme] = useState<"auto" | "light" | "dark">("auto");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await encodeWorkspace({ files, active });
        if (!cancelled) { setEncoded(s); setError(null); }
      } catch (err) {
        if (!cancelled) {
          setEncoded(null);
          setError(err instanceof Error ? err.message : "could not encode workspace");
        }
      }
    })();
    return () => { cancelled = true; };
  }, [files, active]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); onClose(); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const origin = useMemo(() => {
    if (typeof window === "undefined") return "https://xslang.org";
    return window.location.origin;
  }, []);

  const shareUrl = encoded ? `${origin}/playground#s=${encoded}` : "";

  const embedParams = useMemo(() => {
    if (!encoded) return "";
    const p = new URLSearchParams();
    p.set("code", encoded);
    if (active) p.set("file", active);
    if (embedTheme !== "auto") p.set("theme", embedTheme);
    return p.toString();
  }, [encoded, active, embedTheme]);

  const embedUrl = encoded ? `${origin}/embed?${embedParams}` : "";
  const embedSnippet = encoded
    ? `<iframe src="${embedUrl}" width="100%" height="${embedHeight}" frameborder="0" allow="cross-origin-isolated" loading="lazy" style="border:1px solid #ccc;border-radius:6px"></iframe>`
    : "";

  const tooBig = encoded ? encoded.length > URL_SOFT_LIMIT : false;
  const sizeKB = encoded ? (encoded.length / 1024).toFixed(1) : "0";

  const copy = async (text: string, label: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      setCopied("copy failed, select manually");
      setTimeout(() => setCopied(null), 2200);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="share workspace"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ animation: "modal-fade-in 140ms ease-out both" }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" aria-hidden />
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[560px] rounded-[8px] border border-[color:var(--rule)] bg-[color:var(--panel)] shadow-xl"
        style={{ animation: "modal-pop-in 180ms cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <div className="px-5 pt-4 pb-2 font-mono text-[12px] uppercase tracking-[0.08em] text-[color:var(--text-faint)] flex items-center justify-between">
          <span>share</span>
          <button
            onClick={onClose}
            aria-label="close"
            className="text-[color:var(--text-faint)] hover:text-[color:var(--text)] text-[16px] leading-none px-1"
          >×</button>
        </div>

        <div className="px-5 border-b border-[color:var(--rule)] flex items-center gap-1">
          <button
            onClick={() => setTab("link")}
            className={TAB_BTN_BASE + (tab === "link"
              ? " border-[color:var(--link)] text-[color:var(--link)]"
              : " border-transparent text-[color:var(--text-muted)] hover:text-[color:var(--text)]")}
          >link</button>
          <button
            onClick={() => setTab("embed")}
            className={TAB_BTN_BASE + (tab === "embed"
              ? " border-[color:var(--link)] text-[color:var(--link)]"
              : " border-transparent text-[color:var(--text-muted)] hover:text-[color:var(--text)]")}
          >embed</button>
        </div>

        <div className="px-5 py-4 min-h-[180px]">
          {!encoded && !error && (
            <div className="font-mono text-[12.5px] text-[color:var(--text-muted)]">encoding workspace...</div>
          )}
          {error && (
            <div className="font-mono text-[12.5px] text-[color:var(--kw)]">
              {error}
            </div>
          )}

          {encoded && tab === "link" && (
            <div className="space-y-3">
              <p className="font-mono text-[12px] text-[color:var(--text-muted)] leading-[1.55]">
                a paste-link to the whole workspace. opens in the playground with the same files and active tab.
              </p>
              <textarea
                readOnly
                value={shareUrl}
                rows={3}
                className={TEXTAREA_CLASS}
                onFocus={(e) => e.currentTarget.select()}
              />
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] text-[color:var(--text-faint)]">
                  {Object.keys(files).length} file{Object.keys(files).length === 1 ? "" : "s"}, {sizeKB} KB encoded
                  {tooBig && (
                    <span className="ml-2 text-[color:var(--kw)]">large; consider a gist</span>
                  )}
                </span>
                <button onClick={() => copy(shareUrl, "link")} className={COPY_BTN}>
                  {copied === "link" ? "copied" : "copy link"}
                </button>
              </div>
            </div>
          )}

          {encoded && tab === "embed" && (
            <div className="space-y-3">
              <p className="font-mono text-[12px] text-[color:var(--text-muted)] leading-[1.55]">
                drop this iframe on any page to embed a runnable copy of these files. the editor is read/write inside the frame; nothing leaks back to your site.
              </p>
              <div className="flex items-center gap-4 flex-wrap font-mono text-[11.5px] text-[color:var(--text-muted)]">
                <label className="flex items-center gap-2">
                  <span>height</span>
                  <input
                    type="number"
                    min={200}
                    max={1200}
                    step={20}
                    value={embedHeight}
                    onChange={(e) => setEmbedHeight(Math.max(200, Math.min(1200, Number(e.target.value) || 420)))}
                    className="w-20 bg-[color:var(--bg)] border border-[color:var(--rule)] rounded-[4px] px-2 py-1 text-[color:var(--text)] outline-none focus:border-[color:var(--link)]"
                  />
                </label>
                <label className="flex items-center gap-2">
                  <span>theme</span>
                  <select
                    value={embedTheme}
                    onChange={(e) => setEmbedTheme(e.target.value as typeof embedTheme)}
                    className="bg-[color:var(--bg)] border border-[color:var(--rule)] rounded-[4px] px-2 py-1 text-[color:var(--text)] outline-none focus:border-[color:var(--link)]"
                  >
                    <option value="auto">auto</option>
                    <option value="light">light</option>
                    <option value="dark">dark</option>
                  </select>
                </label>
              </div>
              <textarea
                readOnly
                value={embedSnippet}
                rows={5}
                className={TEXTAREA_CLASS}
                onFocus={(e) => e.currentTarget.select()}
              />
              <div className="flex items-center justify-between gap-3">
                <a
                  href={embedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[11px] text-[color:var(--text-faint)] hover:text-[color:var(--link)] underline decoration-dotted underline-offset-[3px]"
                >preview</a>
                <button onClick={() => copy(embedSnippet, "embed")} className={COPY_BTN}>
                  {copied === "embed" ? "copied" : "copy snippet"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
