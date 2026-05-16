"use client";

import { useEffect, useRef } from "react";

export type ConfirmKind = "default" | "danger";

type Props = {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  kind?: ConfirmKind;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "confirm",
  cancelLabel = "cancel",
  kind = "default",
  onConfirm,
  onCancel,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onCancel(); }
      else if (e.key === "Enter") { e.preventDefault(); onConfirm(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onConfirm, onCancel]);

  if (!open) return null;

  const confirmColor = kind === "danger" ? "var(--kw)" : "var(--link)";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ animation: "modal-fade-in 140ms ease-out both" }}
      onClick={onCancel}
    >
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
        aria-hidden
      />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] rounded-[8px] border border-[color:var(--rule)] bg-[color:var(--panel)] shadow-xl"
        style={{ animation: "modal-pop-in 180ms cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <div className="px-5 pt-4 pb-3">
          {title && (
            <div className="font-mono text-[12px] uppercase tracking-[0.08em] text-[color:var(--text-faint)] mb-2">
              {title}
            </div>
          )}
          <div className="font-mono text-[14px] text-[color:var(--text)] leading-[1.55] break-words">
            {message}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-4 pb-4 pt-2">
          <button
            onClick={onCancel}
            className="font-mono text-[12px] px-3 py-1.5 rounded-[6px] border border-[color:var(--rule)] bg-transparent text-[color:var(--text-muted)] hover:text-[color:var(--text)] hover:border-[color:var(--text-muted)] transition-colors"
          >{cancelLabel}</button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className="font-mono text-[12px] px-3 py-1.5 rounded-[6px] border bg-[color:var(--panel)] transition-colors"
            style={{
              borderColor: confirmColor,
              color: confirmColor,
            }}
          >{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
