import type { Metadata } from "next";
import { Archivo_Black, Familjen_Grotesk, DM_Mono } from "next/font/google";
import Link from "next/link";
import { MobileNav } from "@/components/mobile-nav";
import "./globals.css";

const archivo = Archivo_Black({
  variable: "--font-archivo",
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
});

const familjen = Familjen_Grotesk({
  variable: "--font-familjen",
  subsets: ["latin"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
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
      className={`${archivo.variable} ${familjen.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center gap-2" aria-label="xs home">
                <span className="font-display text-3xl leading-none text-foreground">xs</span>
                <span className="pulse-dot" />
              </Link>
              <div className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="font-mono text-xs uppercase tracking-wider link-u text-foreground/75">
                    {link.label}
                  </Link>
                ))}
                <a
                  href="https://reg.xslang.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs uppercase tracking-wider link-u text-foreground/75"
                >
                  registry
                </a>
                <a
                  href="https://github.com/xs-lang0/xs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs uppercase tracking-wider link-u text-foreground/75"
                >
                  github ↗
                </a>
              </div>
              <MobileNav />
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="mt-32 border-t-2 border-accent">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-12 grid grid-cols-2 md:grid-cols-12 gap-8">
            <div className="col-span-2 md:col-span-5">
              <div className="font-display text-7xl md:text-8xl leading-none text-foreground">xs<span className="text-accent">.</span></div>
              <p className="mt-4 text-sm text-foreground/60 max-w-sm">
                One language for scripts, servers, and the browser. Written in C with no dependencies.
              </p>
            </div>
            <div className="md:col-span-2 md:col-start-7">
              <div className="label mb-3">read</div>
              <ul className="space-y-2 text-sm">
                <li><Link href="/docs" className="link-u text-foreground/80">docs</Link></li>
                <li><Link href="/examples" className="link-u text-foreground/80">examples</Link></li>
                <li><Link href="/playground" className="link-u text-foreground/80">playground</Link></li>
              </ul>
            </div>
            <div className="md:col-span-2">
              <div className="label mb-3">build</div>
              <ul className="space-y-2 text-sm">
                <li><a href="https://github.com/xs-lang0/xs" className="link-u text-foreground/80">github</a></li>
                <li><a href="https://reg.xslang.org" className="link-u text-foreground/80">registry</a></li>
              </ul>
            </div>
            <div className="md:col-span-3 md:text-right">
              <div className="label mb-3">version</div>
              <div className="font-mono text-sm text-foreground/80">v0.2.3</div>
              <div className="text-xs text-foreground/45 mt-1">apache-2.0</div>
              <div className="text-xs text-foreground/45 mt-3">© {new Date().getFullYear()} xslang.org</div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
