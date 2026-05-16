import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playground",
  description: "Run XS in the browser. The real compiler, compiled to WebAssembly. Files persist locally; share runs via URL.",
  alternates: { canonical: "https://xslang.org/playground" },
  openGraph: {
    title: "XS Playground",
    description: "Run XS in the browser. The real compiler, compiled to WebAssembly. Edit, run, share.",
    url: "https://xslang.org/playground",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "XS Playground",
    description: "Run XS in the browser. The real compiler, compiled to WebAssembly.",
  },
};

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return children;
}
