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
      className="absolute right-2 top-2 px-1.5 py-0.5 text-xs font-mono text-paper/40 hover:text-paper transition-colors"
    >
      {copied ? "copied!" : "copy"}
    </button>
  );
}
