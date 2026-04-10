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
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex h-14 items-center justify-between">
              <Link
                href="/"
                className="font-serif text-2xl leading-none text-ink"
                style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1', letterSpacing: "-0.04em" }}
                aria-label="xs home"
              >
                xs
              </Link>
              <div className="hidden md:flex items-center gap-7">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="text-sm text-ink/70 hover:text-ink transition-colors">
                    {link.label}
                  </Link>
                ))}
                <a
                  href="https://reg.xslang.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-ink/70 hover:text-ink transition-colors"
                >
                  Registry
                </a>
                <a
                  href="https://github.com/xs-lang0/xs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-ink/70 hover:text-ink transition-colors"
                >
                  GitHub
                </a>
              </div>
              <MobileNav />
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-ink/15 py-8 text-sm text-ink/60">
          <div className="mx-auto max-w-6xl px-6 flex items-center justify-between">
            <span>xslang.org</span>
            <div className="flex gap-6">
              <a href="https://github.com/xs-lang0/xs" className="hover:text-ink transition-colors">GitHub</a>
              <a href="https://reg.xslang.org" className="hover:text-ink transition-colors">Registry</a>
              <Link href="/docs" className="hover:text-ink transition-colors">Docs</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
