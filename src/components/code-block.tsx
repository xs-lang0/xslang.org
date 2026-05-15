export type Token = { type: string; text: string };

const KEYWORDS = new Set([
  "fn", "let", "var", "const", "mut", "if", "elif", "else", "match",
  "for", "while", "loop", "when", "return", "break", "continue", "in",
  "struct", "trait", "enum", "class", "impl", "spawn", "async", "await",
  "yield", "effect", "handle", "perform", "resume", "import", "export",
  "from", "use", "pub", "type", "true", "false", "null", "self", "super",
  "module", "actor", "nursery", "try", "catch", "finally", "throw", "defer",
  "tag", "not", "and", "or", "is", "as", "inline", "unsafe", "static",
  "macro", "bind", "pause", "del", "assert", "panic", "do", "with", "load",
]);

const TYPES = new Set([
  "int", "float", "str", "bool", "void", "any", "Self",
  "i8", "i16", "i32", "i64", "u8", "u16", "u32", "u64",
  "f32", "f64", "byte", "char", "re", "dyn", "never", "string", "unit",
]);

export const TOKEN_COLORS: Record<string, string> = {
  keyword:    "var(--kw)",
  string:     "var(--str)",
  "str-tag":  "var(--kw)",       // r"..." / c"..." / """...""" prefix
  "str-esc":  "var(--num)",      // \n \t \" etc inside strings
  "str-interp": "var(--typ)",    // {expr} braces inside strings
  comment:    "var(--com)",
  type:       "var(--typ)",
  fn:         "var(--fn)",
  number:     "var(--num)",
  duration:   "var(--num)",      // 30s, 100ms, 1us
  "dur-unit": "var(--kw)",       // the unit suffix (s, ms, ns, m, h, d)
  bool:       "var(--num)",
  "self":     "var(--kw)",       // self / super distinct from keywords
  op:         "var(--text-muted)",
  arrow:      "var(--kw)",       // => -> |>
  punct:      "var(--text-faint)",
  attr:       "var(--kw)",
  "attr-arg": "var(--typ)",
};

// Walk the body of a string literal and emit tokens for the wrapping
// quotes, the literal chars, escape sequences (\n, \", \\, etc.), and
// {expr} interpolation. The whole thing renders as a single highlighted
// chunk; the caller doesn't need to know where the string ends.
function emitInterpolatedString(tokens: Token[], src: string) {
  // Determine the quote run: ' " " or """ ' """ (raw r"" / c"" already
  // had the prefix stripped by the caller, src starts at the open quote).
  let i = 0;
  let openLen = 1;
  if (src.startsWith('"""') || src.startsWith("'''")) openLen = 3;
  const quote = src[0];
  const closeRun = src.slice(0, openLen);

  // Open quote(s) as plain string tokens
  tokens.push({ type: "string", text: src.slice(0, openLen) });
  i = openLen;

  // Find body end (where the matching close run starts)
  let endBody = src.length;
  if (src.endsWith(closeRun) && src.length > openLen) {
    endBody = src.length - openLen;
  }

  let runStart = i;
  const flushRun = (to: number) => {
    if (to > runStart) tokens.push({ type: "string", text: src.slice(runStart, to) });
  };

  while (i < endBody) {
    const c = src[i];
    if (c === "\\" && i + 1 < endBody) {
      flushRun(i);
      tokens.push({ type: "str-esc", text: src.slice(i, i + 2) });
      i += 2;
      runStart = i;
      continue;
    }
    if (c === "{") {
      // Find matching close brace, ignoring quoted content inside expr
      let depth = 1;
      let j = i + 1;
      let inStr: string | null = null;
      while (j < endBody && depth > 0) {
        const cj = src[j];
        if (inStr) {
          if (cj === "\\") { j += 2; continue; }
          if (cj === inStr) inStr = null;
        } else {
          if (cj === '"' || cj === "'") inStr = cj;
          else if (cj === "{") depth++;
          else if (cj === "}") depth--;
        }
        if (depth === 0) break;
        j++;
      }
      flushRun(i);
      tokens.push({ type: "str-interp", text: src.slice(i, j + 1) });
      i = j + 1;
      runStart = i;
      continue;
    }
    i++;
  }
  flushRun(endBody);
  // Close quote(s)
  if (endBody < src.length) {
    tokens.push({ type: "string", text: src.slice(endBody) });
  }
  void quote;
}

export function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    if (code[i] === "-" && code[i + 1] === "-") {
      let end = code.indexOf("\n", i);
      if (end === -1) end = code.length;
      tokens.push({ type: "comment", text: code.slice(i, end) });
      i = end;
      continue;
    }

    if (code[i] === "{" && code[i + 1] === "-") {
      let depth = 1;
      let j = i + 2;
      while (j < code.length && depth > 0) {
        if (code[j] === "{" && code[j + 1] === "-") { depth++; j += 2; continue; }
        if (code[j] === "-" && code[j + 1] === "}") { depth--; j += 2; continue; }
        j++;
      }
      tokens.push({ type: "comment", text: code.slice(i, j) });
      i = j;
      continue;
    }

    if (code[i] === "#" && (i === 0 || code[i - 1] === "\n")) {
      let end = code.indexOf("\n", i);
      if (end === -1) end = code.length;
      tokens.push({ type: "comment", text: code.slice(i, end) });
      i = end;
      continue;
    }

    if (code[i] === "@" && i + 1 < code.length && /[a-zA-Z]/.test(code[i + 1])) {
      let j = i + 1;
      while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) j++;
      tokens.push({ type: "attr", text: code.slice(i, j) });
      i = j;
      continue;
    }

    // String-prefixed forms: r"..." (raw), c"..." (color/byte). Emit
    // the prefix as its own token so it's visually distinct.
    if ((code[i] === "r" || code[i] === "c") && (code[i + 1] === '"' || code[i + 1] === "'")) {
      tokens.push({ type: "str-tag", text: code[i] });
      i++;
      // fall through into the string handling below
    }

    if (code[i] === '"' || code[i] === "'") {
      const quote = code[i];
      // Triple-quoted block string
      if (code[i + 1] === quote && code[i + 2] === quote) {
        let j = i + 3;
        while (j < code.length) {
          if (code[j] === quote && code[j + 1] === quote && code[j + 2] === quote) { j += 3; break; }
          if (code[j] === "\\") j++;
          j++;
        }
        emitInterpolatedString(tokens, code.slice(i, j));
        i = j;
        continue;
      }
      let j = i + 1;
      while (j < code.length && code[j] !== quote && code[j] !== "\n") {
        if (code[j] === "\\") j++;
        j++;
      }
      if (j < code.length && code[j] === quote) j++;
      emitInterpolatedString(tokens, code.slice(i, j));
      i = j;
      continue;
    }

    if (/[0-9]/.test(code[i])) {
      let j = i;
      if (code[j] === "0" && (code[j + 1] === "x" || code[j + 1] === "b" || code[j + 1] === "o")) {
        j += 2;
        while (j < code.length && /[0-9a-fA-F_]/.test(code[j])) j++;
        tokens.push({ type: "number", text: code.slice(i, j) });
        i = j;
        continue;
      }
      while (j < code.length && /[0-9._e]/.test(code[j])) j++;
      // Duration suffix? `1s`, `100ms`, `2m30s`, `5us`, `7ns`, `3h`, `1d`
      const after = code.slice(j);
      const durM = after.match(/^(ns|us|ms|s|m|h|d)/);
      if (durM && !/^[a-zA-Z_]/.test(after.slice(durM[0].length))) {
        tokens.push({ type: "duration", text: code.slice(i, j) });
        tokens.push({ type: "dur-unit", text: durM[0] });
        i = j + durM[0].length;
        // chain (e.g. 2m30s)
        while (i < code.length && /[0-9]/.test(code[i])) {
          let k = i;
          while (k < code.length && /[0-9]/.test(code[k])) k++;
          const more = code.slice(k);
          const mUnit = more.match(/^(ns|us|ms|s|m|h|d)/);
          if (!mUnit) break;
          tokens.push({ type: "duration", text: code.slice(i, k) });
          tokens.push({ type: "dur-unit", text: mUnit[0] });
          i = k + mUnit[0].length;
        }
        continue;
      }
      tokens.push({ type: "number", text: code.slice(i, j) });
      i = j;
      continue;
    }

    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) j++;
      const word = code.slice(i, j);

      if (word === "fn" && code[j] === "*") {
        tokens.push({ type: "keyword", text: "fn*" });
        i = j + 1;
        continue;
      }

      const followedByParen = code.slice(j).match(/^\s*\(/);

      if (word === "true" || word === "false" || word === "null") {
        tokens.push({ type: "bool", text: word });
      } else if (word === "self" || word === "super" || word === "Self") {
        tokens.push({ type: "self", text: word });
      } else if (KEYWORDS.has(word)) {
        tokens.push({ type: "keyword", text: word });
      } else if (TYPES.has(word)) {
        tokens.push({ type: "type", text: word });
      } else if (followedByParen) {
        tokens.push({ type: "fn", text: word });
      } else {
        tokens.push({ type: "ident", text: word });
      }
      i = j;
      continue;
    }

    // Multi-char arrows / pipes: =>, ->, |>
    if (
      (code[i] === "=" && code[i + 1] === ">") ||
      (code[i] === "-" && code[i + 1] === ">") ||
      (code[i] === "|" && code[i + 1] === ">")
    ) {
      tokens.push({ type: "arrow", text: code.slice(i, i + 2) });
      i += 2;
      continue;
    }

    if ("=<>!+-*/%&|^~?".includes(code[i])) {
      let j = i;
      while (j < code.length && "=<>!+-*/%&|^~?".includes(code[j])) j++;
      tokens.push({ type: "op", text: code.slice(i, j) });
      i = j;
      continue;
    }

    if (code[i] === ":" && code[i + 1] === ":") {
      tokens.push({ type: "punct", text: "::" });
      i += 2;
      continue;
    }

    if ("(){}[];:,.@#".includes(code[i])) {
      tokens.push({ type: "punct", text: code[i] });
      i++;
      continue;
    }

    tokens.push({ type: "plain", text: code[i] });
    i++;
  }

  return tokens;
}

import { CopyButton } from "@/components/copy-button";
import { RunnableBlock } from "@/components/run-button";

export function CodeBlock({
  code,
  filename,
  runnable,
  noRun,
}: {
  code: string;
  filename?: string;
  runnable?: boolean;
  noRun?: boolean;
}) {
  const trimmed = code.trim();

  if (runnable && !noRun) {
    return <RunnableBlock code={trimmed} filename={filename} />;
  }

  const tokens = tokenize(trimmed);

  return (
    <div className="my-6 rounded-[6px] border border-[color:var(--rule)] bg-[color:var(--panel)]">
      {filename && (
        <div className="flex items-center justify-between border-b border-[color:var(--rule)] px-4 py-2 font-mono text-xs text-[color:var(--text-faint)]">
          <span>{filename}</span>
        </div>
      )}
      <div className="relative">
        <div className="absolute right-3 top-3"><CopyButton text={trimmed} /></div>
        <pre className="overflow-x-auto px-[18px] py-4 text-[13px] leading-[1.65] text-[color:var(--text)]">
          <code>
            {tokens.map((t, i) => {
              const c = TOKEN_COLORS[t.type];
              return c ? (
                <span
                  key={i}
                  style={{
                    color: c,
                    fontWeight: t.type === "keyword" || t.type === "fn" ? 500 : undefined,
                    fontStyle: t.type === "comment" ? "italic" : undefined,
                  }}
                >
                  {t.text}
                </span>
              ) : (
                t.text
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}
