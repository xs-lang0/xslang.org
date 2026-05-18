import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Embed",
  robots: { index: false, follow: false },
};

// The embed route shares the root <html>/<body> with the rest of the site
// but the root layout's Nav and Footer hide themselves when the pathname
// is /embed (see ChromeGate). The page itself reads ?theme= and sets
// data-theme on documentElement before the editor mounts.
export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
