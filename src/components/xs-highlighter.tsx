"use client";

import { tokenize, TOKEN_COLORS } from "@/components/code-block";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function highlightXS(code: string): string {
  const tokens = tokenize(code);
  let html = "";
  for (const t of tokens) {
    const color = TOKEN_COLORS[t.type];
    const escaped = escapeHtml(t.text);
    if (!color) {
      html += escaped;
      continue;
    }
    const weight = t.type === "keyword" || t.type === "fn" ? "500" : "inherit";
    html += `<span style="color:${color};font-weight:${weight}">${escaped}</span>`;
  }
  return html;
}
