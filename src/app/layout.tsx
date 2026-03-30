import type { Metadata } from "next";
import { Fraunces, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "XS — A programming language",
  description:
    "A fast, expressive programming language with gradual typing, algebraic effects, and zero dependencies. Written in C.",
};

const navLinks = [
  { href: "/docs", label: "Docs" },
  { href: "/examples", label: "Examples" },
  { href: "/playground", label: "Playground" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${bricolage.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col grain">
        <header className="sticky top-0 z-50 bg-paper/85 backdrop-blur-sm border-b border-ink/15">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="flex items-baseline gap-2 group" aria-label="xs home">
                <span className="font-serif text-3xl leading-none text-ink" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1', letterSpacing: "-0.04em" }}>
                  xs
                </span>
                <span className="smallcaps text-ink/55 hidden sm:inline">
                  / type specimen
                </span>
              </Link>
              <div className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="nav-link smallcaps"
                  >
                    {link.label}
                  </Link>
                ))}
                <a
                  href="https://reg.xslang.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-link smallcaps"
                >
                  Registry
                </a>
                <a
                  href="https://github.com/xs-lang0/xs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nav-link smallcaps"
                >
                  GitHub
                </a>
                <span className="stamp">v0.2 · ed.04</span>
              </div>
              <MobileNav />
            </div>
          </div>
          <div className="ledger" aria-hidden="true" />
        </header>

        <main className="flex-1">{children}</main>

        <footer className="mt-32 border-t-[1.5px] border-ink/80 pt-10 pb-12 grain">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
            <div className="grid grid-cols-2 md:grid-cols-12 gap-8">
              <div className="col-span-2 md:col-span-5">
                <div
                  className="font-serif text-ink leading-none text-7xl md:text-9xl"
                  style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1', letterSpacing: "-0.06em" }}
                >
                  xs.
                </div>
                <p className="marginalia mt-4 max-w-xs">
                  A specimen of a small language with confident ideas: gradual typing, algebraic effects, and a single C codebase that compiles itself anywhere.
                </p>
              </div>

              <div className="md:col-span-2">
                <div className="smallcaps text-ink/55 mb-3">Read</div>
                <ul className="space-y-1.5 text-sm">
                  <li><Link href="/docs" className="hover:text-accent">Documentation</Link></li>
                  <li><Link href="/examples" className="hover:text-accent">Examples</Link></li>
                  <li><Link href="/playground" className="hover:text-accent">Playground</Link></li>
                </ul>
              </div>

              <div className="md:col-span-2">
                <div className="smallcaps text-ink/55 mb-3">Source</div>
                <ul className="space-y-1.5 text-sm">
                  <li><a href="https://github.com/xs-lang0/xs" className="hover:text-accent">GitHub</a></li>
                  <li><a href="https://reg.xslang.org" className="hover:text-accent">Registry</a></li>
                </ul>
              </div>

              <div className="md:col-span-3 md:text-right">
                <div className="smallcaps text-ink/55 mb-3">Colophon</div>
                <p className="text-xs text-muted leading-relaxed">
                  Set in <span className="font-serif italic">Fraunces</span>, Bricolage Grotesque, and JetBrains Mono. Printed on the open web. © {new Date().getFullYear()} xslang.org
                </p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
