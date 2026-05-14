import { Wrap } from "./wrap";
import { XS_VERSION } from "@/lib/version";

export function Footer() {
  return (
    <footer className="border-t border-[color:var(--rule)] mt-16">
      <Wrap>
        <div className="flex flex-wrap items-center justify-between gap-2 py-6 font-mono text-xs text-[color:var(--text-faint)]">
          <span>XS, v{XS_VERSION}, Apache-2.0</span>
          <a href="https://github.com/xs-lang0/xs" className="no-rule text-[color:var(--text-faint)] hover:text-[color:var(--link)] transition-colors">
            github.com/xs-lang0/xs
          </a>
        </div>
      </Wrap>
    </footer>
  );
}
