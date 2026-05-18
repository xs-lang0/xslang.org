import type { ReactNode } from "react";

export function H1({ children }: { children: ReactNode }) {
  return <h1 className="text-[34px] font-semibold tracking-[-0.02em] text-[color:var(--text)] mt-2 mb-5 leading-[1.15]">{children}</h1>;
}

export function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="group scroll-mt-20 text-[22px] font-semibold tracking-tight text-[color:var(--text)] mt-12 mb-3 pt-3 border-t border-[color:var(--rule-soft)]">
      <a href={`#${id}`} className="no-rule text-inherit hover:text-[color:var(--link)]">{children}</a>
    </h2>
  );
}

export function H3({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h3 id={id} className="scroll-mt-20 text-[17px] font-semibold tracking-tight text-[color:var(--text)] mt-8 mb-2">
      <a href={`#${id}`} className="no-rule text-inherit hover:text-[color:var(--link)]">{children}</a>
    </h3>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  return <p className="text-[16.5px] leading-[1.7] text-[color:var(--text-muted)] mb-7 max-w-[64ch]">{children}</p>;
}

export function P({ children }: { children: ReactNode }) {
  return <p className="text-[15.5px] leading-[1.75] text-[color:var(--text)] mb-4 max-w-[70ch]">{children}</p>;
}

export function UL({ children }: { children: ReactNode }) {
  return <ul className="list-disc pl-6 mb-4 text-[15.5px] leading-[1.75] text-[color:var(--text)] space-y-1.5 max-w-[70ch]">{children}</ul>;
}

export function OL({ children }: { children: ReactNode }) {
  return <ol className="list-decimal pl-6 mb-4 text-[15.5px] leading-[1.75] text-[color:var(--text)] space-y-1.5 max-w-[70ch]">{children}</ol>;
}

type CalloutKind = "note" | "warn" | "tip";

const CALLOUT: Record<CalloutKind, { label: string; bar: string; bg: string; tagFg: string }> = {
  note: {
    label: "note",
    bar: "var(--link)",
    bg: "color-mix(in srgb, var(--link) 7%, transparent)",
    tagFg: "var(--link)",
  },
  warn: {
    label: "warning",
    bar: "var(--kw)",
    bg: "color-mix(in srgb, var(--kw) 7%, transparent)",
    tagFg: "var(--kw)",
  },
  tip: {
    label: "tip",
    bar: "var(--num)",
    bg: "color-mix(in srgb, var(--num) 7%, transparent)",
    tagFg: "var(--num)",
  },
};

export function Callout({ kind = "note", title, children }: { kind?: CalloutKind; title?: string; children: ReactNode }) {
  const c = CALLOUT[kind];
  return (
    <aside
      className="my-6 border-l-2 px-4 py-3 rounded-r-[4px] text-[14.5px] leading-[1.65] text-[color:var(--text-muted)]"
      style={{ borderColor: c.bar, background: c.bg }}
    >
      <div
        className="font-mono text-[10.5px] uppercase tracking-[0.08em] mb-1.5"
        style={{ color: c.tagFg }}
      >
        {title ?? c.label}
      </div>
      <div>{children}</div>
    </aside>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <Callout kind="note">{children}</Callout>;
}

export function Warn({ children }: { children: ReactNode }) {
  return <Callout kind="warn">{children}</Callout>;
}

export function Tip({ children }: { children: ReactNode }) {
  return <Callout kind="tip">{children}</Callout>;
}

export function Grid({ cols = 2, children }: { cols?: 2 | 3; children: ReactNode }) {
  const c = cols === 3 ? "md:grid-cols-3" : "md:grid-cols-2";
  return <div className={`grid grid-cols-1 ${c} gap-5 my-6`}>{children}</div>;
}
