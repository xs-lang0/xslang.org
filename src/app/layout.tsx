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
  title: { default: "XS", template: "%s · XS" },
  description: "A programming language. Anywhere, anytime, by anyone. One binary, no runtime dependencies; runs on a tree-walk interpreter, a bytecode VM, or a register-allocating JIT, and transpiles to JavaScript, C, and WebAssembly.",
  applicationName: "XS",
  keywords: ["xs", "xs language", "xs lang", "xslang", "programming language"],
  authors: [{ name: "xs-lang0" }],
  creator: "xs-lang0",
  publisher: "xs-lang0",
  alternates: { canonical: "https://xslang.org/" },
  openGraph: {
    title: "XS",
    description: "A programming language. Anywhere, anytime, by anyone.",
    url: "https://xslang.org/",
    siteName: "XS",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "XS",
    description: "A programming language. Anywhere, anytime, by anyone.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
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
