type Token = { type: string; text: string };

const KEYWORDS = new Set([
  "fn", "let", "var", "const", "mut", "if", "elif", "else", "match",
  "for", "while", "loop", "return", "break", "continue", "in",
  "struct", "trait", "enum", "class", "impl", "spawn", "async", "await",
  "yield", "effect", "handle", "perform", "resume", "import", "from", "use",
  "pub", "type", "true", "false", "null", "self", "super", "module",
  "actor", "nursery", "try", "catch", "finally", "throw", "defer",
  "tag", "not", "and", "or", "is", "as", "inline", "unsafe", "static",
]);

const TYPES = new Set([
  "int", "float", "str", "bool", "void", "any", "Self",
  "i8", "i16", "i32", "i64", "u8", "u16", "u32", "u64",
  "f32", "f64", "byte", "char", "re", "dyn", "never", "string", "unit",
]);

const TOKEN_COLORS: Record<string, string> = {
  keyword: "#c084fc",
  string: "#86efac",
  comment: "#525252",
  type: "#67e8f9",
  fn: "#fbbf24",
  number: "#f9a8d4",
  op: "#94a3b8",
  punct: "#525252",
  attr: "#fb923c",
};

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    // line comments (--)
    if (code[i] === "-" && code[i + 1] === "-") {
      let end = code.indexOf("\n", i);
      if (end === -1) end = code.length;
      tokens.push({ type: "comment", text: code.slice(i, end) });
      i = end;
      continue;
    }

    // block comments ({- ... -})
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

    // shell comments (#) at start of line for shebang / build commands
    if (code[i] === "#" && (i === 0 || code[i - 1] === "\n")) {
      let end = code.indexOf("\n", i);
      if (end === -1) end = code.length;
      tokens.push({ type: "comment", text: code.slice(i, end) });
      i = end;
      continue;
    }

    // attributes (@word or #[...])
    if (code[i] === "@" && i + 1 < code.length && /[a-zA-Z]/.test(code[i + 1])) {
      let j = i + 1;
      while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) j++;
      tokens.push({ type: "attr", text: code.slice(i, j) });
      i = j;
      continue;
    }

    // strings (double or single quoted)
    if (code[i] === '"' || code[i] === "'") {
      const quote = code[i];
      // triple-quoted
      if (code[i + 1] === quote && code[i + 2] === quote) {
        let j = i + 3;
        while (j < code.length) {
          if (code[j] === quote && code[j + 1] === quote && code[j + 2] === quote) { j += 3; break; }
          if (code[j] === "\\") j++;
          j++;
        }
        tokens.push({ type: "string", text: code.slice(i, j) });
        i = j;
        continue;
      }
      let j = i + 1;
      while (j < code.length && code[j] !== quote && code[j] !== "\n") {
        if (code[j] === "\\") j++;
        j++;
      }
      if (j < code.length && code[j] === quote) j++;
      tokens.push({ type: "string", text: code.slice(i, j) });
      i = j;
      continue;
    }

    // numbers
    if (/[0-9]/.test(code[i])) {
      let j = i;
      if (code[j] === "0" && (code[j + 1] === "x" || code[j + 1] === "b" || code[j + 1] === "o")) {
        j += 2;
        while (j < code.length && /[0-9a-fA-F_]/.test(code[j])) j++;
      } else {
        while (j < code.length && /[0-9._e]/.test(code[j])) j++;
      }
      tokens.push({ type: "number", text: code.slice(i, j) });
      i = j;
      continue;
    }

    // identifiers / keywords
    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) j++;
      const word = code.slice(i, j);

      // check for fn* (generator)
      if (word === "fn" && code[j] === "*") {
        tokens.push({ type: "keyword", text: "fn*" });
        i = j + 1;
        continue;
      }

      const followedByParen = code.slice(j).match(/^\s*\(/);

      if (KEYWORDS.has(word)) {
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

    // operators
    if ("=<>!+-*/%&|^~?".includes(code[i])) {
      let j = i;
      while (j < code.length && "=<>!+-*/%&|^~?".includes(code[j])) j++;
      tokens.push({ type: "op", text: code.slice(i, j) });
      i = j;
      continue;
    }

    // double colon
    if (code[i] === ":" && code[i + 1] === ":") {
      tokens.push({ type: "punct", text: "::" });
      i += 2;
      continue;
    }

    // punctuation
    if ("(){}[];:,.@#".includes(code[i])) {
      tokens.push({ type: "punct", text: code[i] });
      i++;
      continue;
    }

    // whitespace / other
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
}: {
  code: string;
  filename?: string;
  runnable?: boolean;
}) {
  const trimmed = code.trim();

  if (runnable) {
    return <RunnableBlock code={trimmed} />;
  }

  const tokens = tokenize(trimmed);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      {filename && (
        <div className="border-b border-border px-4 py-2 text-xs text-muted">
          {filename}
        </div>
      )}
      <div className="relative">
        <CopyButton text={trimmed} />
        <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
          <code>
            {tokens.map((token, i) => {
              const color = TOKEN_COLORS[token.type];
              return color ? (
                <span key={i} style={{ color }}>
                  {token.text}
                </span>
              ) : (
                token.text
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}
