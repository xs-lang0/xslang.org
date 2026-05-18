"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Hide global chrome (nav / footer / cmdk / page-fade) on the chromeless
// /embed route so external iframes don't have to crop our header off.
// Anything else gets the normal site shell.
export function ChromeGate({ children }: { children: ReactNode }) {
  const path = usePathname() || "";
  if (path === "/embed" || path.startsWith("/embed/")) return null;
  return <>{children}</>;
}
