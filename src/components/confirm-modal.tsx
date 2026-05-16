"use client";

import { useEffect, useRef, useState, useCallback, useMemo, createContext, useContext, type ReactNode } from "react";

export type ConfirmKind = "default" | "danger";

type ModalShellProps = {
  title?: string;
  children: ReactNode;
  onClose: () => void;
};

function ModalShell({ title, children, onClose }: ModalShellProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ animation: "modal-fade-in 140ms ease-out both" }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" aria-hidden />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[440px] rounded-[8px] border border-[color:var(--rule)] bg-[color:var(--panel)] shadow-xl"
        style={{ animation: "modal-pop-in 180ms cubic-bezier(0.22,1,0.36,1) both" }}
      >
        {title && (
          <div className="px-5 pt-4 pb-1 font-mono text-[12px] uppercase tracking-[0.08em] text-[color:var(--text-faint)]">
            {title}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

const cancelBtn = "font-mono text-[12px] px-3 py-1.5 rounded-[6px] border border-[color:var(--rule)] bg-transparent text-[color:var(--text-muted)] hover:text-[color:var(--text)] hover:border-[color:var(--text-muted)] transition-colors";
const okBtn = "font-mono text-[12px] px-3 py-1.5 rounded-[6px] border bg-[color:var(--panel)] transition-colors hover:bg-[color:var(--rule-soft)]";

type ConfirmProps = {
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
}: ConfirmProps) {
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
  const color = kind === "danger" ? "var(--kw)" : "var(--link)";

  return (
    <ModalShell title={title} onClose={onCancel}>
      <div className="px-5 pt-3 pb-3 font-mono text-[14px] text-[color:var(--text)] leading-[1.55] break-words">
        {message}
      </div>
      <div className="flex items-center justify-end gap-2 px-4 pb-4 pt-2">
        <button onClick={onCancel} className={cancelBtn}>{cancelLabel}</button>
        <button
          ref={confirmRef}
          onClick={onConfirm}
          className={okBtn}
          style={{ borderColor: color, color }}
        >{confirmLabel}</button>
      </div>
    </ModalShell>
  );
}

type PromptProps = {
  open: boolean;
  title?: string;
  message?: string;
  defaultValue?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  validate?: (value: string) => string | null;
  onSubmit: (value: string) => void;
  onCancel: () => void;
};

export function PromptModal({
  open,
  title,
  message,
  defaultValue = "",
  placeholder,
  confirmLabel = "ok",
  cancelLabel = "cancel",
  validate,
  onSubmit,
  onCancel,
}: PromptProps) {
  // Parent (DialogsProvider) only mounts this when open, so the useState
  // initializer runs fresh per open and we never need to reset value mid-life.
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 30);
    return () => clearTimeout(id);
  }, [open]);

  const error = validate ? validate(value) : null;

  const submit = useCallback(() => {
    if (error) return;
    onSubmit(value);
  }, [error, value, onSubmit]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onCancel(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <ModalShell title={title} onClose={onCancel}>
      <div className="px-5 pt-3 pb-2 font-mono text-[13px] text-[color:var(--text-muted)] leading-[1.5]">
        {message}
      </div>
      <div className="px-5 pb-1">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); submit(); }
          }}
          placeholder={placeholder}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          className="w-full font-mono text-[13.5px] bg-[color:var(--bg)] border border-[color:var(--rule)] rounded-[6px] px-3 py-2 text-[color:var(--text)] outline-none focus:border-[color:var(--link)] transition-colors"
        />
        <div className="min-h-[18px] mt-1.5 font-mono text-[11px] text-[color:var(--kw)]">
          {error ?? ""}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 px-4 pb-4 pt-1">
        <button onClick={onCancel} className={cancelBtn}>{cancelLabel}</button>
        <button
          onClick={submit}
          disabled={!!error}
          className={okBtn + " disabled:opacity-40 disabled:cursor-not-allowed"}
          style={{ borderColor: "var(--link)", color: "var(--link)" }}
        >{confirmLabel}</button>
      </div>
    </ModalShell>
  );
}

type AlertProps = {
  open: boolean;
  title?: string;
  message: string;
  okLabel?: string;
  onClose: () => void;
};

export function AlertModal({ open, title, message, okLabel = "ok", onClose }: AlertProps) {
  const okRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    okRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") { e.preventDefault(); onClose(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <ModalShell title={title} onClose={onClose}>
      <div className="px-5 pt-3 pb-3 font-mono text-[14px] text-[color:var(--text)] leading-[1.55] break-words">
        {message}
      </div>
      <div className="flex items-center justify-end gap-2 px-4 pb-4 pt-2">
        <button
          ref={okRef}
          onClick={onClose}
          className={okBtn}
          style={{ borderColor: "var(--link)", color: "var(--link)" }}
        >{okLabel}</button>
      </div>
    </ModalShell>
  );
}

// Imperative API. Call site looks like:
//   const value = await dialogs.prompt({ title, message, defaultValue, validate });
// resolves with the entered value, or null on cancel. confirm resolves bool.
type ConfirmOpts = Omit<ConfirmProps, "open" | "onConfirm" | "onCancel">;
type PromptOpts = Omit<PromptProps, "open" | "onSubmit" | "onCancel">;
type AlertOpts = Omit<AlertProps, "open" | "onClose">;

export type DialogsAPI = {
  confirm: (opts: ConfirmOpts) => Promise<boolean>;
  prompt: (opts: PromptOpts) => Promise<string | null>;
  alert: (opts: AlertOpts) => Promise<void>;
};

const DialogsContext = createContext<DialogsAPI | null>(null);

export function useDialogs(): DialogsAPI {
  const ctx = useContext(DialogsContext);
  if (!ctx) throw new Error("useDialogs must be used inside <DialogsProvider>");
  return ctx;
}

type ConfirmState = ConfirmOpts & { resolve: (v: boolean) => void };
type PromptState  = PromptOpts  & { resolve: (v: string | null) => void };
type AlertState   = AlertOpts   & { resolve: () => void };

export function DialogsProvider({ children }: { children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [promptState,  setPromptState]  = useState<PromptState  | null>(null);
  const [alertState,   setAlertState]   = useState<AlertState   | null>(null);

  const api = useMemo<DialogsAPI>(() => ({
    confirm: (opts) => new Promise((resolve) => setConfirmState({ ...opts, resolve })),
    prompt:  (opts) => new Promise((resolve) => setPromptState({ ...opts, resolve })),
    alert:   (opts) => new Promise((resolve) => setAlertState({ ...opts, resolve })),
  }), []);

  return (
    <DialogsContext.Provider value={api}>
      {children}
      {confirmState && (
        <ConfirmModal
          open
          title={confirmState.title}
          message={confirmState.message}
          confirmLabel={confirmState.confirmLabel}
          cancelLabel={confirmState.cancelLabel}
          kind={confirmState.kind}
          onConfirm={() => { confirmState.resolve(true); setConfirmState(null); }}
          onCancel={() => { confirmState.resolve(false); setConfirmState(null); }}
        />
      )}
      {promptState && (
        <PromptModal
          open
          title={promptState.title}
          message={promptState.message}
          defaultValue={promptState.defaultValue}
          placeholder={promptState.placeholder}
          confirmLabel={promptState.confirmLabel}
          cancelLabel={promptState.cancelLabel}
          validate={promptState.validate}
          onSubmit={(v) => { promptState.resolve(v); setPromptState(null); }}
          onCancel={() => { promptState.resolve(null); setPromptState(null); }}
        />
      )}
      {alertState && (
        <AlertModal
          open
          title={alertState.title}
          message={alertState.message}
          okLabel={alertState.okLabel}
          onClose={() => { alertState.resolve(); setAlertState(null); }}
        />
      )}
    </DialogsContext.Provider>
  );
}
