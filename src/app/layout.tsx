import type { Metadata } from "next";
import { Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import "./globals.css";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "XS — A programming language",
  description:
    "A fast, expressive programming language with gradual typing, algebraic effects, and zero dependencies. Written in C.",
};

const navLinks = [
  { href: "/docs", label: "docs" },
  { href: "/examples", label: "examples" },
  { href: "/playground", label: "playground" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hanken.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-sm border-b border-border">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex h-14 items-center justify-between">
              <Link
                href="/"
                className="font-mono text-base font-medium text-foreground"
                aria-label="xs home"
              >
                xs<span className="text-accent">/</span>
              </Link>
              <div className="hidden md:flex items-center gap-7">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="font-mono text-sm link-underline text-foreground/80">
                    {link.label}
                  </Link>
                ))}
                <a
                  href="https://reg.xslang.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm link-underline text-foreground/80"
                >
                  registry
                </a>
                <a
                  href="https://github.com/xs-lang0/xs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm link-underline text-foreground/80"
                >
                  github
                </a>
              </div>
              <MobileNav />
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-border py-10 mt-24">
          <div className="mx-auto max-w-6xl px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div>
              <div className="font-mono text-foreground mb-3">xs<span className="text-accent">/</span></div>
              <p className="text-muted text-xs leading-relaxed">
                A small language for scripts, servers, and the browser. Written in C.
              </p>
            </div>
            <div>
              <div className="label mb-3">-- read</div>
              <ul className="space-y-1.5">
                <li><Link href="/docs" className="link-underline text-foreground/80">docs</Link></li>
                <li><Link href="/examples" className="link-underline text-foreground/80">examples</Link></li>
                <li><Link href="/playground" className="link-underline text-foreground/80">playground</Link></li>
              </ul>
            </div>
            <div>
              <div className="label mb-3">-- source</div>
              <ul className="space-y-1.5">
                <li><a href="https://github.com/xs-lang0/xs" className="link-underline text-foreground/80">github</a></li>
                <li><a href="https://reg.xslang.org" className="link-underline text-foreground/80">registry</a></li>
              </ul>
            </div>
            <div className="text-xs text-muted">
              <div className="label mb-3">-- info</div>
              v0.2.3 · apache-2.0<br />
              © {new Date().getFullYear()} xslang.org
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
