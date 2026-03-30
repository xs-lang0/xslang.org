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
      className="absolute right-2 top-2 rounded px-1.5 py-0.5 text-xs text-muted transition-colors hover:text-foreground"
    >
      {copied ? "copied!" : "copy"}
    </button>
  );
}
