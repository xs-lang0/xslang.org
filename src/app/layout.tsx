import type { Metadata } from "next";
import { IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeScript } from "@/components/theme-script";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { CmdK } from "@/components/cmdk";
import "./globals.css";

const sans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "XS, a programming language",
  description: "A fast, expressive programming language with gradual typing, algebraic effects, and zero dependencies.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        <CmdK />
      </body>
    </html>
  );
}
