import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { MobileNavSheet } from "./mobile-nav-sheet";
import { Wrap } from "./wrap";

const LINKS = [
  { href: "/docs", label: "Docs" },
  { href: "/playground", label: "Playground" },
  { href: "/downloads", label: "Downloads" },
  { href: "https://github.com/xs-lang0/xs", label: "Source", external: true },
];

export function Nav() {
  return (
    <header className="border-b border-[color:var(--rule)]">
      <Wrap>
        <nav className="flex items-baseline justify-between gap-5 py-[18px]">
          <Link href="/" className="no-rule font-mono text-base font-medium text-[color:var(--text)] hover:text-[color:var(--link)] transition-colors">
            xs
          </Link>
          <div className="hidden md:flex items-baseline gap-[22px]">
            {LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className="no-rule text-sm text-[color:var(--text-muted)] hover:text-[color:var(--link)] transition-colors"
                {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {l.label}
              </Link>
            ))}
            <ThemeToggle />
          </div>
          <MobileNavSheet links={LINKS} />
        </nav>
      </Wrap>
    </header>
  );
}
