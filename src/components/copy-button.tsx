"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute right-2 top-2 px-2 py-0.5 font-mono text-[0.7rem] uppercase tracking-wider text-foreground/45 hover:text-accent transition-colors"
    >
      {copied ? "copied" : "copy"}
    </button>
  );
}
