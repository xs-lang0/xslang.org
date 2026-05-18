#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DOCS_DIR = join(ROOT, "src", "app", "docs");
const PUBLIC = join(ROOT, "public");
const XSYPY = process.env.XSYPY_PATH ?? join(ROOT, "..", "xsypy");

export function slugify(s) {
  return s
    .toLowerCase()
    .replace(/`/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function sliceByHeading(md) {
  const lines = md.split("\n");
  const out = {};
  let cur = null;
  let buf = [];
  for (const line of lines) {
    const m = /^##\s+(.+)$/.exec(line);
    if (m) {
      if (cur) out[cur] = buf.join("\n");
      cur = slugify(m[1]);
      buf = [];
    } else if (cur) {
      buf.push(line);
    }
  }
  if (cur) out[cur] = buf.join("\n");
  return out;
}

function walkDocs(dir, base = "") {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walkDocs(full, base ? `${base}/${e}` : e));
    else if (e === "page.tsx" && base) out.push({ slug: base, file: full });
  }
  return out;
}

// Pull the bare title out of `metadata = { title: ... }`. Two shapes are in
// use across the docs: a plain string and `{ absolute: "..." }`. Either way,
// the index uses the underlying text.
function extractTitle(src) {
  const abs = /title:\s*\{\s*absolute:\s*["'`]([^"'`]+)["'`]/.exec(src);
  if (abs) return abs[1];
  const flat = /title:\s*["'`]([^"'`]+)["'`]/.exec(src);
  return flat ? flat[1] : "Untitled";
}

// `headings` is declared with an explicit type annotation (`: Heading[]`).
// The original regex required a bare `=` after the name and missed it. Match
// both forms.
function extractHeadings(src) {
  const m = /export\s+const\s+headings(?:\s*:\s*Heading\[\])?\s*=\s*(\[[\s\S]*?\])\s*;?\s*\n/.exec(src);
  if (!m) return [];
  try {
    return Function(`"use strict"; return ${m[1]};`)();
  } catch {
    return [];
  }
}

// The page body is JSX. Walk through it, dropping anything that is not human
// prose: imports, exports, code blocks, attributes, JSX tags, JS expression
// braces. Preserve a small set of inline tags (`code`, `a`, `em`, etc.) by
// keeping their text content.
function extractProse(src) {
  let body = src;

  // Drop the `export default function Page() { return (` preamble and the
  // matching trailing `); }`. The lead chunk would otherwise contain those
  // as visible "prose".
  body = body
    .replace(/export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{\s*return\s*\(/g, " ")
    .replace(/\)\s*;?\s*\}\s*$/g, " ");

  // Drop CodeBlock blocks entirely. They live in a `code={`...`}` template
  // literal, sometimes spanning many lines, and including them buries the
  // real prose under raw source text.
  body = body.replace(/code=\{`[\s\S]*?`\}/g, " ");

  // Generic template-literal contents elsewhere are safe to drop too.
  body = body.replace(/`[^`]*`/g, " ");

  // Strip JSX expression braces but keep their textual content where it
  // looks like prose. The crude pass below handles the common cases:
  //   {" "}     -> a space
  //   {"foo"}   -> foo
  //   {anything else} -> dropped
  body = body
    .replace(/\{" "\}/g, " ")
    .replace(/\{["'`]([^"'`]+)["'`]\}/g, "$1")
    .replace(/\{[^{}]*\}/g, " ");

  // Drop all JSX tags but keep their inner text.
  body = body.replace(/<\/?[A-Za-z][^>]*>/g, " ");

  // HTML entities the prose tends to use.
  body = body
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  // Collapse whitespace.
  return body.replace(/\s+/g, " ").trim();
}

// Find every `<H2 id="...">label</H2>` and `<H3 id="...">label</H3>` in the
// raw source and return them in document order with byte offsets, so we can
// slice the prose between them later.
function findHeadingMarkers(src) {
  const re = /<H([23])\s+id=["']([^"']+)["']\s*>\s*([\s\S]*?)\s*<\/H\1>/g;
  const out = [];
  let m;
  while ((m = re.exec(src)) !== null) {
    out.push({
      level: Number(m[1]),
      id: m[2],
      label: m[3].replace(/<[^>]+>/g, "").trim(),
      offset: m.index,
      end: m.index + m[0].length,
    });
  }
  return out;
}

// Build per-section chunks. Each chunk represents the prose under one H2
// (with its child H3s folded in). The chunk's anchor is the H2's id; the
// label is the H2's label.
function chunkSections(src, pageTitle, pageSlug) {
  const markers = findHeadingMarkers(src);
  const h2s = markers.filter(h => h.level === 2);
  const chunks = [];

  // Lead paragraph: the prose between the page's `return (` and the first
  // H2. Worth indexing as the page-level entry so a query that matches the
  // lead still surfaces the page even if it doesn't match the title.
  const returnIdx = src.search(/return\s*\(/);
  const leadStart = returnIdx >= 0 ? returnIdx + src.slice(returnIdx).indexOf("(") + 1 : 0;
  const leadEnd = h2s.length > 0 ? h2s[0].offset : src.length;
  const leadSrc = src.slice(Math.max(leadStart, 0), leadEnd);
  const leadProse = extractProse(leadSrc);
  if (leadProse) {
    chunks.push({
      pageTitle,
      pageSlug,
      sectionHeading: "",
      sectionAnchor: "",
      bodyText: leadProse.slice(0, 2000),
    });
  }

  for (let i = 0; i < h2s.length; i++) {
    const h = h2s[i];
    const next = h2s[i + 1];
    const sliceEnd = next ? next.offset : src.length;
    const sectionSrc = src.slice(h.end, sliceEnd);
    const prose = extractProse(sectionSrc);
    chunks.push({
      pageTitle,
      pageSlug,
      sectionHeading: h.label,
      sectionAnchor: h.id,
      bodyText: prose.slice(0, 2000),
    });
  }

  // Pages with no H2 at all (the bare landing pages, mostly) still need an
  // entry so the title remains searchable.
  if (chunks.length === 0) {
    chunks.push({
      pageTitle,
      pageSlug,
      sectionHeading: "",
      sectionAnchor: "",
      bodyText: "",
    });
  }
  return chunks;
}

async function buildIndex() {
  const pages = walkDocs(DOCS_DIR);
  const entries = [];
  for (const p of pages) {
    const src = readFileSync(p.file, "utf8");
    const title = extractTitle(src);
    const headings = extractHeadings(src);
    const chunks = chunkSections(src, title, p.slug);
    for (const c of chunks) entries.push(c);
    // Keep the headings array on the first chunk so any future consumer can
    // still see the structured TOC without re-parsing the source.
    if (entries.length && headings.length) {
      entries[entries.length - chunks.length].headings = headings;
    }
  }
  writeFileSync(join(PUBLIC, "docs-index.json"), JSON.stringify(entries));
  const pageCount = pages.length;
  console.log(`docs-index.json: ${entries.length} chunks across ${pageCount} pages`);
}

async function buildRefSnips() {
  const dest = join(PUBLIC, "refsnips.json");
  const lang = join(XSYPY, "LANGUAGE.md");
  const cmd = join(XSYPY, "COMMANDS.md");
  if (!existsSync(lang)) {
    console.warn(`build-docs: ${lang} not found, leaving refsnips.json as is`);
    return;
  }
  const out = {};
  const slices = sliceByHeading(readFileSync(lang, "utf8"));
  for (const k of Object.keys(slices)) out[`reference/${k}`] = slices[k];
  if (existsSync(cmd)) out["reference/cli"] = readFileSync(cmd, "utf8");
  writeFileSync(dest, JSON.stringify(out));
  console.log(`refsnips.json: ${Object.keys(out).length} slugs`);
}

async function main() { await buildIndex(); await buildRefSnips(); }
if (import.meta.url === `file://${process.argv[1]}`) main();
