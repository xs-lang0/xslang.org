import type { ReactNode } from "react";

export function H1({ children }: { children: ReactNode }) {
  return <h1 className="text-[32px] font-semibold tracking-tight text-[color:var(--text)] mt-2 mb-4">{children}</h1>;
}

export function H2({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="group text-[22px] font-semibold tracking-tight text-[color:var(--text)] mt-12 mb-3 pt-3 border-t border-[color:var(--rule-soft)]">
      <a href={`#${id}`} className="no-rule text-inherit hover:text-[color:var(--link)]">{children}</a>
    </h2>
  );
}

export function H3({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h3 id={id} className="text-[17px] font-semibold tracking-tight text-[color:var(--text)] mt-8 mb-2">
      <a href={`#${id}`} className="no-rule text-inherit hover:text-[color:var(--link)]">{children}</a>
    </h3>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  return <p className="text-[16.5px] leading-[1.7] text-[color:var(--text-muted)] mb-7 max-w-[64ch]">{children}</p>;
}

export function P({ children }: { children: ReactNode }) {
  return <p className="text-[15.5px] leading-[1.7] text-[color:var(--text)] mb-4 max-w-[68ch]">{children}</p>;
}

export function UL({ children }: { children: ReactNode }) {
  return <ul className="list-disc pl-6 mb-4 text-[15.5px] leading-[1.7] text-[color:var(--text)] space-y-1.5">{children}</ul>;
}

export function OL({ children }: { children: ReactNode }) {
  return <ol className="list-decimal pl-6 mb-4 text-[15.5px] leading-[1.7] text-[color:var(--text)] space-y-1.5">{children}</ol>;
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <aside className="my-6 border-l-2 border-[color:var(--link)] bg-[color:var(--panel)] px-4 py-3 text-[14.5px] leading-[1.65] text-[color:var(--text-muted)]">
      {children}
    </aside>
  );
}

export function Warn({ children }: { children: ReactNode }) {
  return (
    <aside className="my-6 border-l-2 border-[color:var(--kw)] bg-[color:var(--panel)] px-4 py-3 text-[14.5px] leading-[1.65] text-[color:var(--text-muted)]">
      {children}
    </aside>
  );
}

export function Grid({ cols = 2, children }: { cols?: 2 | 3; children: ReactNode }) {
  const c = cols === 3 ? "md:grid-cols-3" : "md:grid-cols-2";
  return <div className={`grid grid-cols-1 ${c} gap-5 my-6`}>{children}</div>;
}
