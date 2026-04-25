import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import { XS_VERSION } from "@/lib/version";
import "./globals.css";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "XS - A programming language",
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
      className={`${hanken.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b-[1.5px] border-rule">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="flex items-baseline gap-1.5 group" aria-label="xs home">
                <span className="text-2xl font-bold leading-none text-ink tracking-tight">xs</span>
                <span className="text-2xl font-bold leading-none text-accent">.</span>
              </Link>
              <div className="hidden md:flex items-center gap-7">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="scratch text-sm font-medium text-ink/85">
                    {link.label}
                  </Link>
                ))}
                <a
                  href="https://reg.xslang.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="scratch text-sm font-medium text-ink/85"
                >
                  Registry
                </a>
                <a
                  href="https://github.com/xs-lang0/xs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="scratch text-sm font-medium text-ink/85"
                >
                  GitHub
                </a>
              </div>
              <MobileNav />
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t-[1.5px] border-rule mt-24">
          <div className="mx-auto max-w-5xl px-6 lg:px-8 py-8 flex flex-wrap items-center justify-between gap-4 text-sm text-ink/70">
            <div>
              <span className="font-bold text-ink">xs<span className="text-accent">.</span></span>
              <span className="mx-3 text-ink/30">·</span>
              v{XS_VERSION}
              <span className="mx-3 text-ink/30">·</span>
              apache-2.0
            </div>
            <div className="flex gap-6">
              <a href="https://github.com/xs-lang0/xs" className="scratch">GitHub</a>
              <a href="https://reg.xslang.org" className="scratch">Registry</a>
              <Link href="/docs" className="scratch">Docs</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
