import type { ReactNode } from "react";

export function Wrap({ children, wide = false, className = "" }: { children: ReactNode; wide?: boolean; className?: string }) {
  const max = wide ? "max-w-[1180px]" : "max-w-[880px]";
  return <div className={`mx-auto ${max} px-7 w-full ${className}`}>{children}</div>;
}
