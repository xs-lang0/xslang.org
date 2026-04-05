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
      className="absolute right-3 top-3 smallcaps text-paper/40 hover:text-accent transition-colors"
    >
      {copied ? "copied ✓" : "copy"}
    </button>
  );
}
