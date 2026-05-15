import type { Metadata } from "next";
import { IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeScript } from "@/components/theme-script";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { CmdK } from "@/components/cmdk";
import { PageFade } from "@/components/page-fade";
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
  metadataBase: new URL("https://xslang.org"),
  title: { default: "XS, a programming language", template: "%s, XS" },
  description: "A fast, expressive programming language with gradual typing, algebraic effects, and zero dependencies. Compiles to native, JavaScript, and WebAssembly.",
  openGraph: {
    title: "XS, a programming language",
    description: "Native, JavaScript, WebAssembly. Pattern matching, algebraic effects, gradual typing. ~2.4 MB binary, zero runtime dependencies.",
    url: "https://xslang.org/",
    siteName: "XS",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "XS, a programming language", description: "Native, JavaScript, WebAssembly. ~2.4 MB binary." },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <Nav />
        <PageFade>
          <main className="flex-1">{children}</main>
        </PageFade>
        <Footer />
        <CmdK />
      </body>
    </html>
  );
}
