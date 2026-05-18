import Link from "next/link";
import { Wrap } from "@/components/wrap";

export const metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <Wrap>
      <section className="pt-[88px] pb-20 text-center sm:text-left">
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[color:var(--text-faint)] mb-3">404</p>
        <h1 className="text-[34px] font-semibold tracking-[-0.02em] text-[color:var(--text)] mb-4">page not found</h1>
        <p className="text-[15.5px] leading-[1.7] text-[color:var(--text-muted)] mb-8 max-w-[58ch]">
          The address you followed does not match a page on this site. The
          link may be outdated, or the page may have been renamed.
        </p>

        <div className="font-mono text-[13px] text-[color:var(--text-muted)] border border-[color:var(--rule)] rounded-[6px] bg-[color:var(--panel)] p-4 max-w-[480px] mx-auto sm:mx-0">
          <p className="text-[color:var(--text-faint)] mb-2">try:</p>
          <ul className="space-y-1.5">
            <li>
              <span className="text-[color:var(--text-faint)] select-none">-&gt; </span>
              <Link href="/docs" className="text-[color:var(--text)]">/docs</Link>
              <span className="text-[color:var(--text-faint)]">, the language reference and stdlib</span>
            </li>
            <li>
              <span className="text-[color:var(--text-faint)] select-none">-&gt; </span>
              <Link href="/playground" className="text-[color:var(--text)]">/playground</Link>
              <span className="text-[color:var(--text-faint)]"> run XS in your browser</span>
            </li>
            <li>
              <span className="text-[color:var(--text-faint)] select-none">-&gt; </span>
              <Link href="/downloads" className="text-[color:var(--text)]">/downloads</Link>
              <span className="text-[color:var(--text-faint)]"> binaries for every platform</span>
            </li>
            <li>
              <span className="text-[color:var(--text-faint)] select-none">-&gt; </span>
              <Link href="/" className="text-[color:var(--text)]">/</Link>
              <span className="text-[color:var(--text-faint)]"> the home page</span>
            </li>
          </ul>
        </div>
      </section>
    </Wrap>
  );
}
