import Link from "next/link";
import { Wrap } from "./wrap";
import { XS_VERSION } from "@/lib/version";

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--rule)] mt-16">
      <Wrap>
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-6 font-mono text-xs text-[color:var(--text-faint)]">
          <span>XS, v{XS_VERSION}, Apache-2.0</span>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/docs" className="no-rule text-[color:var(--text-faint)] hover:text-[color:var(--link)] transition-colors">docs</Link>
            <Link href="/playground" className="no-rule text-[color:var(--text-faint)] hover:text-[color:var(--link)] transition-colors">playground</Link>
            <Link href="/downloads" className="no-rule text-[color:var(--text-faint)] hover:text-[color:var(--link)] transition-colors">downloads</Link>
            <a href="https://reg.xslang.org" className="no-rule text-[color:var(--text-faint)] hover:text-[color:var(--link)] transition-colors">registry</a>
            <a href="https://github.com/xs-lang0/xs" className="no-rule text-[color:var(--text-faint)] hover:text-[color:var(--link)] transition-colors">
              github.com/xs-lang0/xs
            </a>
          </nav>
        </div>
      </Wrap>
    </footer>
  );
}
