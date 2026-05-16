"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { EditorState, Compartment } from "@codemirror/state";
import { EditorView, keymap, highlightActiveLineGutter, highlightActiveLine, lineNumbers, drawSelection, highlightSpecialChars } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { StreamLanguage, syntaxHighlighting, HighlightStyle, LanguageSupport, indentOnInput, bracketMatching, foldKeymap, foldGutter, indentUnit, type StringStream } from "@codemirror/language";
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap, CompletionContext } from "@codemirror/autocomplete";
import { searchKeymap, search, highlightSelectionMatches } from "@codemirror/search";
import { tags as t } from "@lezer/highlight";

const KEYWORDS = new Set([
  "fn", "let", "var", "const", "mut", "if", "elif", "else", "match",
  "for", "while", "loop", "when", "return", "break", "continue", "in",
  "struct", "trait", "enum", "class", "impl", "spawn", "async", "await",
  "yield", "effect", "handle", "perform", "resume", "import", "export",
  "from", "use", "pub", "type", "module", "actor", "nursery",
  "try", "catch", "finally", "throw", "defer",
  "tag", "not", "and", "or", "is", "as", "inline", "unsafe", "static",
  "macro", "bind", "pause", "del", "assert", "panic", "do", "with", "load",
]);

const SELF_KW = new Set(["self", "super", "Self"]);
const BOOL_NULL = new Set(["true", "false", "null"]);

const TYPES = new Set([
  "int", "float", "str", "bool", "void", "any",
  "i8", "i16", "i32", "i64", "u8", "u16", "u32", "u64",
  "f32", "f64", "byte", "char", "re", "dyn", "never", "string", "unit",
  "list", "map", "set", "option", "result",
]);

const BUILTINS = new Set([
  "println", "print", "input", "read", "write", "format", "str", "int",
  "float", "bool", "len", "range", "typeof", "exit", "panic", "assert",
  "assert_eq", "abs", "min", "max", "round", "floor", "ceil", "sqrt",
  "pow", "log", "sin", "cos", "tan",
]);

const STDLIB_MODULES = new Set([
  "math", "string", "time", "io", "fs", "path", "random", "json", "os",
  "collections", "re", "crypto", "fmt", "net", "http", "async", "db",
  "log", "regex", "reflect", "process",
]);

const DECORATORS = [
  "on_start", "on_exit", "every", "after", "cron", "test", "bench",
  "deprecated", "inline", "memoize", "trace", "retry", "timeout",
  "debounce", "throttle",
];

type State = {
  // 0 = top, 1 = inside double, 2 = single, 3 = triple-double, 4 = triple-single
  str: 0 | 1 | 2 | 3 | 4;
  // brace depth inside a {...} interpolation; 0 means not in an interpolation
  interp: number;
  prevToken: string;
};

function startState(): State {
  return { str: 0, interp: 0, prevToken: "" };
}

function isIdentStart(c: string) {
  return /[A-Za-z_]/.test(c);
}
function isIdent(c: string) {
  return /[A-Za-z0-9_]/.test(c);
}

const xsParser = StreamLanguage.define<State>({
  name: "xs",
  startState,
  tokenTable: {
    function: t.function(t.variableName),
  },
  token(stream, state) {
    // Inside an interpolation expression — fall through to normal tokenizing
    // until a } closes us back into the surrounding string.
    if (state.str !== 0 && state.interp === 0) {
      return tokenString(stream, state);
    }

    if (stream.eatSpace()) return null;

    // Line comment
    if (stream.match("--")) {
      stream.skipToEnd();
      return "lineComment";
    }
    // C-style block comment (rare, but supported defensively)
    if (stream.match("/*")) {
      let prev: string | null = null;
      while (!stream.eol()) {
        const c = stream.next() ?? "";
        if (prev === "*" && c === "/") return "blockComment";
        prev = c;
      }
      return "blockComment";
    }

    // String literals (open)
    const cur = stream.peek() ?? "";
    if (cur === '"' || cur === "'") {
      // Triple?
      if (stream.match('"""')) { state.str = 3; return "string"; }
      if (stream.match("'''")) { state.str = 4; return "string"; }
      stream.next();
      state.str = cur === '"' ? 1 : 2;
      return "string";
    }

    // Prefixed string  r"..." / c"..."
    if ((cur === "r" || cur === "c" || cur === "b") && (stream.string[stream.pos + 1] === '"' || stream.string[stream.pos + 1] === "'")) {
      stream.next();
      return "operator"; // prefix mark, then on next call we'll open the string
    }

    // Closing brace of an interpolation
    if (state.interp > 0 && stream.peek() === "}") {
      state.interp--;
      stream.next();
      return state.interp === 0 ? "string" : "punctuation";
    }
    if (state.interp > 0 && stream.peek() === "{") {
      state.interp++;
      stream.next();
      return "punctuation";
    }

    // Decorator: @name
    if (stream.match(/^@[A-Za-z_][A-Za-z0-9_]*/)) {
      return "attributeName";
    }

    // Numbers (incl. hex / float / duration suffix like 30s, 100ms, 1m30s500ms)
    if (/[0-9]/.test(cur)) {
      // Hex
      if (stream.match(/^0x[0-9a-fA-F_]+/)) {
        // optional duration suffix? probably not for hex; skip
        return "number";
      }
      // Number, optional decimal, optional exponent
      stream.match(/^[0-9_]+(\.[0-9_]+)?([eE][+-]?[0-9]+)?/);
      // Duration suffix chains: ns, us, ms, s, m, h, d (allow chain like 1m30s)
      let matched = false;
      while (stream.match(/^(ns|us|ms|s|m|h|d)/)) {
        matched = true;
        // Optional more digits then another suffix
        if (!stream.match(/^[0-9_]+(\.[0-9_]+)?/)) break;
      }
      void matched;
      return "number";
    }

    // Identifier / keyword
    if (isIdentStart(cur)) {
      let word = "";
      while (!stream.eol() && isIdent(stream.peek() ?? "")) {
        word += stream.next();
      }
      // Module/path: import X::Y::Z  -> X is "namespace"
      if (KEYWORDS.has(word)) { state.prevToken = word; return "keyword"; }
      if (SELF_KW.has(word)) { state.prevToken = word; return "self"; }
      if (BOOL_NULL.has(word)) { state.prevToken = word; return "bool"; }
      if (TYPES.has(word)) { state.prevToken = word; return "typeName"; }
      if (BUILTINS.has(word)) { state.prevToken = word; return "function"; }
      if (STDLIB_MODULES.has(word)) { state.prevToken = word; return "namespace"; }
      // Heuristic: ALLCAPS or PascalCase = type/enum
      if (/^[A-Z]/.test(word)) {
        state.prevToken = word;
        return "typeName";
      }
      // function-call shape: identifier followed by (
      const peek = stream.peek();
      if (peek === "(") { state.prevToken = word; return "function"; }
      state.prevToken = word;
      return "variableName";
    }

    // Operators
    if (stream.match(/^(=>|->|\|>|::|\.\.=|\.\.|<=|>=|==|!=|&&|\|\||<<|>>|\+\+|--|\+=|-=|\*=|\/=)/)) {
      return "operator";
    }
    if (stream.match(/^[+\-*\/%<>=!&|^~?:]/)) {
      return "operator";
    }
    if (stream.match(/^[(){}\[\];,.]/)) {
      return "punctuation";
    }

    stream.next();
    return null;
  },
  languageData: {
    commentTokens: { line: "--" },
    closeBrackets: {
      brackets: ["(", "[", "{", '"', "'"],
    },
    indentOnInput: /^\s*[}\])]$/,
  },
  indent(_state, textAfter, context) {
    const breakPos = context.simulatedBreak;
    if (breakPos == null) return null;
    const prev = context.lineAt(breakPos, -1);
    const prevText = prev.text;
    const baseIndentMatch = /^[ \t]*/.exec(prevText);
    let indent = baseIndentMatch ? baseIndentMatch[0].length : 0;
    // Strip a line-trailing -- comment so trailing tokens like `{ -- start`
    // still bump the indent.
    const trimmed = prevText.replace(/--.*$/, "").trim();
    if (/[{(\[]\s*$/.test(trimmed)) indent += context.unit;
    if (/^\s*[}\])]/.test(textAfter)) indent = Math.max(0, indent - context.unit);
    return indent;
  },
});

function tokenString(stream: StringStream, state: State): string | null {
  // We're inside a string literal of state.str type.
  // Walk until we hit \, {, or the matching close run.
  const single = state.str === 1 || state.str === 2;
  const closeChar = (state.str === 1 || state.str === 3) ? '"' : "'";
  const closeRun = single ? closeChar : closeChar.repeat(3);

  while (!stream.eol()) {
    const c = stream.peek() ?? "";
    if (c === "\\") {
      // If we were already at the start of the call, emit the escape
      if (stream.pos > stream.start) return "string";
      stream.next();
      const nxt = stream.peek();
      if (nxt) stream.next();
      return "escape";
    }
    if (c === "{") {
      if (stream.pos > stream.start) return "string";
      stream.next();
      state.interp = 1;
      return "punctuation";
    }
    if (single ? c === closeChar : stream.match(closeRun, false)) {
      if (stream.pos > stream.start) return "string";
      // consume the close run
      if (single) stream.next();
      else { stream.next(); stream.next(); stream.next(); }
      state.str = 0;
      return "string";
    }
    stream.next();
  }
  // For single-quoted strings, end-of-line closes the string (XS behavior is
  // permissive enough; this avoids "rest of file is a string" surprises).
  if (single) state.str = 0;
  return "string";
}

const xsHighlight = HighlightStyle.define([
  { tag: t.keyword, color: "var(--kw)", fontWeight: "500" },
  { tag: t.controlKeyword, color: "var(--kw)", fontWeight: "500" },
  { tag: t.string, color: "var(--str)" },
  { tag: t.escape, color: "var(--num)" },
  { tag: t.lineComment, color: "var(--com)", fontStyle: "italic" },
  { tag: t.blockComment, color: "var(--com)", fontStyle: "italic" },
  { tag: t.typeName, color: "var(--typ)" },
  { tag: t.namespace, color: "var(--typ)" },
  { tag: t.function(t.variableName), color: "var(--fn)" },
  { tag: t.variableName, color: "var(--text)" },
  { tag: t.number, color: "var(--num)" },
  { tag: t.bool, color: "var(--num)" },
  { tag: t.self, color: "var(--kw)" },
  { tag: t.operator, color: "var(--text-muted)" },
  { tag: t.punctuation, color: "var(--text-faint)" },
  { tag: t.attributeName, color: "var(--kw)" },
]);

function xsLanguage() {
  return new LanguageSupport(xsParser);
}

function buildCompletion() {
  const STATIC_WORDS: { label: string; type: string; detail?: string }[] = [];
  for (const w of KEYWORDS) STATIC_WORDS.push({ label: w, type: "keyword" });
  for (const w of TYPES) STATIC_WORDS.push({ label: w, type: "type" });
  for (const w of BUILTINS) STATIC_WORDS.push({ label: w, type: "function" });
  for (const w of STDLIB_MODULES) STATIC_WORDS.push({ label: w, type: "namespace" });
  for (const w of SELF_KW) STATIC_WORDS.push({ label: w, type: "keyword" });
  for (const w of BOOL_NULL) STATIC_WORDS.push({ label: w, type: "constant" });

  return (ctx: CompletionContext) => {
    // Decorator completions when typing @
    const atToken = ctx.matchBefore(/@\w*/);
    if (atToken && atToken.from !== atToken.to) {
      return {
        from: atToken.from + 1,
        options: DECORATORS.map(d => ({ label: d, type: "function" })),
        validFor: /^\w*$/,
      };
    }

    const word = ctx.matchBefore(/[A-Za-z_][A-Za-z0-9_]*/);
    if (!word || (word.from === word.to && !ctx.explicit)) return null;

    // Pull all identifiers from the document for local-name completions.
    const text = ctx.state.doc.toString();
    const seen = new Set<string>();
    const localOpts: { label: string; type: string }[] = [];
    const re = /[A-Za-z_][A-Za-z0-9_]*/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      const tok = m[0];
      if (seen.has(tok)) continue;
      seen.add(tok);
      if (KEYWORDS.has(tok) || TYPES.has(tok) || BUILTINS.has(tok)) continue;
      if (SELF_KW.has(tok) || BOOL_NULL.has(tok)) continue;
      localOpts.push({ label: tok, type: /^[A-Z]/.test(tok) ? "type" : "variable" });
    }

    return {
      from: word.from,
      options: [...STATIC_WORDS, ...localOpts],
      validFor: /^[A-Za-z0-9_]*$/,
    };
  };
}

const xsTheme = EditorView.theme({
  "&": {
    fontSize: "13px",
    fontFamily: "var(--mono)",
    backgroundColor: "transparent",
    color: "var(--text)",
    height: "100%",
  },
  // Both cm-content and cm-gutters need the SAME vertical padding AND the
  // SAME line-height, otherwise line numbers walk away from their code line
  // by a few px per row.
  ".cm-content": {
    fontFamily: "var(--mono)",
    caretColor: "var(--text)",
    padding: "14px 0",
    lineHeight: "1.7",
  },
  ".cm-line": {
    padding: "0 18px 0 14px",
    lineHeight: "1.7",
  },
  ".cm-scroller": {
    fontFamily: "var(--mono)",
    lineHeight: "1.7",
  },
  ".cm-gutters": {
    backgroundColor: "transparent",
    color: "var(--text-faint)",
    border: "none",
    borderRight: "1px solid var(--rule)",
  },
  ".cm-gutterElement": {
    lineHeight: "1.7",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 14px 0 12px",
    minWidth: "2.5ch",
    color: "var(--text-faint)",
  },
  ".cm-foldGutter .cm-gutterElement": {
    padding: "0 4px",
    color: "var(--text-faint)",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "transparent",
    color: "var(--text-muted)",
  },
  ".cm-activeLine": {
    backgroundColor: "color-mix(in srgb, var(--rule-soft) 35%, transparent)",
  },
  ".cm-cursor": {
    borderLeft: "1.5px solid var(--text)",
  },
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-selectionBackground, ::selection": {
    backgroundColor: "color-mix(in srgb, var(--link) 28%, transparent) !important",
  },
  ".cm-matchingBracket": {
    backgroundColor: "color-mix(in srgb, var(--link) 25%, transparent)",
    outline: "1px solid color-mix(in srgb, var(--link) 60%, transparent)",
  },
  ".cm-tooltip-autocomplete": {
    backgroundColor: "var(--panel)",
    border: "1px solid var(--rule)",
    borderRadius: "6px",
    fontFamily: "var(--mono)",
    fontSize: "12px",
    color: "var(--text)",
  },
  ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
    backgroundColor: "color-mix(in srgb, var(--link) 22%, transparent)",
    color: "var(--text)",
  },
  ".cm-tooltip.cm-tooltip-autocomplete > ul > li": {
    padding: "3px 8px",
  },
  ".cm-completionLabel": {
    color: "var(--text)",
  },
  ".cm-completionDetail": {
    color: "var(--text-muted)",
    marginLeft: "8px",
  },
  ".cm-searchMatch": {
    backgroundColor: "color-mix(in srgb, var(--num) 30%, transparent)",
  },
  ".cm-panels": {
    backgroundColor: "var(--panel)",
    color: "var(--text)",
    borderTop: "1px solid var(--rule)",
  },
  ".cm-panels input, .cm-panels button": {
    backgroundColor: "var(--bg)",
    color: "var(--text)",
    border: "1px solid var(--rule)",
    borderRadius: "4px",
    padding: "2px 6px",
    fontFamily: "var(--mono)",
    fontSize: "12px",
  },
});

export type XSEditorHandle = {
  getValue: () => string;
  setValue: (next: string) => void;
  focus: () => void;
};

export type EditorOpts = {
  wordWrap?: boolean;
  fontSize?: "S" | "M" | "L";
  tabSize?: 2 | 4;
  lineNumbers?: boolean;
};

type Props = {
  initialValue: string;
  onChange?: (next: string) => void;
  onRun?: () => void;
  className?: string;
  opts?: EditorOpts;
};

const FONT_SIZES = { S: "12px", M: "13px", L: "15px" } as const;

function buildOptsExtensions(opts: EditorOpts) {
  const ext = [];
  if (opts.wordWrap) ext.push(EditorView.lineWrapping);
  if (opts.lineNumbers !== false) ext.push(lineNumbers());
  ext.push(indentUnit.of(" ".repeat(opts.tabSize ?? 4)));
  ext.push(EditorView.theme({
    "&": { fontSize: FONT_SIZES[opts.fontSize ?? "M"] },
  }));
  return ext;
}

export const XSEditor = forwardRef<XSEditorHandle, Props>(function XSEditor(
  { initialValue, onChange, onRun, className, opts = {} }, ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onRunRef = useRef(onRun);
  // setValue() programmatic swaps must not be reported back as user
  // edits -- otherwise the parent's onChange handler captures the new
  // file's content under the OLD activeFile (the swap happens before
  // React's setActiveFile commits) and clobbers the wrong slot. The
  // file-panel switch bug was exactly this: editing in file A, clicking
  // file B, the new content of B was written into A.
  const suppressChangeRef = useRef(false);
  useEffect(() => { onChangeRef.current = onChange; });
  useEffect(() => { onRunRef.current = onRun; });

  // Compartment so we can swap value externally without recreating the view.
  const themeCompartmentRef = useRef(new Compartment());
  const optsCompartmentRef = useRef(new Compartment());
  // Stash latest opts in a ref so the create-once effect below can read
  // them without re-mounting the editor on every render.
  const optsRef = useRef(opts);
  useEffect(() => { optsRef.current = opts; }, [opts]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (viewRef.current) return; // singleton

    const updateListener = EditorView.updateListener.of((u) => {
      if (!u.docChanged) return;
      if (suppressChangeRef.current) return;
      if (onChangeRef.current) onChangeRef.current(u.state.doc.toString());
    });

    const runKey = keymap.of([
      {
        key: "Mod-Enter",
        run: () => { onRunRef.current?.(); return true; },
      },
      {
        key: "Mod-s",
        preventDefault: true,
        run: () => true, // swallow Cmd/Ctrl-S so the browser doesn't try to save the page
      },
    ]);

    const state = EditorState.create({
      doc: initialValue,
      extensions: [
        optsCompartmentRef.current.of(buildOptsExtensions(optsRef.current)),
        foldGutter(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        drawSelection(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        autocompletion({ override: [buildCompletion()], activateOnTyping: true, defaultKeymap: true }),
        highlightActiveLine(),
        highlightSelectionMatches(),
        search({ top: true }),
        xsLanguage(),
        themeCompartmentRef.current.of([syntaxHighlighting(xsHighlight), xsTheme]),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...foldKeymap,
          ...completionKeymap,
          indentWithTab,
        ]),
        runKey,
        updateListener,
      ],
    });

    viewRef.current = new EditorView({ state, parent: containerRef.current });

    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live-reconfigure the view when opts change, no remount.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: optsCompartmentRef.current.reconfigure(buildOptsExtensions(opts)),
    });
  }, [opts]);

  useImperativeHandle(ref, () => ({
    getValue: () => viewRef.current?.state.doc.toString() ?? "",
    setValue: (next: string) => {
      const view = viewRef.current;
      if (!view) return;
      const cur = view.state.doc.toString();
      if (cur === next) return;
      suppressChangeRef.current = true;
      try {
        view.dispatch({ changes: { from: 0, to: cur.length, insert: next } });
      } finally {
        suppressChangeRef.current = false;
      }
    },
    focus: () => viewRef.current?.focus(),
  }));

  return <div ref={containerRef} className={className} style={{ height: "100%" }} />;
});
