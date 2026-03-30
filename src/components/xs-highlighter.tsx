"use client";

/*
 * Simple XS syntax highlighter based on the VSCode tmLanguage grammar.
 * Renders highlighted code as positioned HTML overlaying the textarea.
 */

const RULES: [RegExp, string][] = [
  // comments (must be first)
  [/--.*$/gm, "text-muted"],
  // strings (triple, raw, double, single)
  [/"""[\s\S]*?"""/g, "text-green-400"],
  [/r"[^"]*"/g, "text-green-400"],
  [/c"(?:[^"\\]|\\.)*"/g, "text-green-400"],
  [/"(?:[^"\\]|\\.)*"/g, "text-green-400"],
  [/'(?:[^'\\]|\\.)*'/g, "text-green-400"],
  // numbers
  [/\b0x[0-9a-fA-F_]+\b/g, "text-orange-300"],
  [/\b0o[0-7_]+\b/g, "text-orange-300"],
  [/\b0b[01_]+\b/g, "text-orange-300"],
  [/\b\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?\b/g, "text-orange-300"],
  // keywords - control
  [/\b(?:if|else|elif|while|for|in|loop|match|when|return|break|continue|try|catch|finally|throw|defer|yield|async|await|every|after|timeout|debounce)\b/g, "text-purple-400"],
  // keywords - declaration
  [/\b(?:fn\*?|let|var|const|struct|enum|trait|impl|class|type|macro|tag|bind|adapt)\b/g, "text-blue-400"],
  // keywords - import
  [/\b(?:import|export|from|use|module|as)\b/g, "text-blue-400"],
  // keywords - other
  [/\b(?:pub|mut|static|inline|unsafe|effect|perform|handle|resume|spawn|nursery|actor)\b/g, "text-purple-400"],
  // logical operators
  [/\b(?:and|or|not|is)\b/g, "text-purple-400"],
  // builtins
  [/\b(?:print|println|eprint|eprintln|input|len|type|range|assert|assert_eq|panic|typeof|dbg|pprint|repr|exit|todo|unreachable|copy|clone|signal|derived|str|int|float|push|pop)\b/g, "text-yellow-300"],
  // constants
  [/\b(?:true|false|null)\b/g, "text-orange-300"],
  // self/super
  [/\b(?:self|super)\b/g, "text-red-300"],
];

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function highlightXS(code: string): string {
  // build an array of [start, end, className] spans
  const spans: { start: number; end: number; cls: string }[] = [];

  for (const [re, cls] of RULES) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(code)) !== null) {
      spans.push({ start: m.index, end: m.index + m[0].length, cls });
    }
  }

  // sort by start position, earlier first
  spans.sort((a, b) => a.start - b.start || b.end - a.end);

  // remove overlapping spans (first match wins)
  const filtered: typeof spans = [];
  let lastEnd = 0;
  for (const s of spans) {
    if (s.start >= lastEnd) {
      filtered.push(s);
      lastEnd = s.end;
    }
  }

  // build HTML
  let html = "";
  let pos = 0;
  for (const s of filtered) {
    if (s.start > pos) {
      html += escapeHtml(code.slice(pos, s.start));
    }
    html += `<span class="${s.cls}">${escapeHtml(code.slice(s.start, s.end))}</span>`;
    pos = s.end;
  }
  if (pos < code.length) {
    html += escapeHtml(code.slice(pos));
  }

  return html;
}
