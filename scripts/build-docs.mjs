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

function extractFromTsx(src) {
  // Two metadata shapes are in use:
  //   title: "Concurrency · XS Guide"
  //   title: { absolute: "Concurrency · XS Guide" }
  // Try the absolute form first; fall back to the bare string. Without this
  // every page indexed as "Untitled" after the title format change.
  let titleM = /title:\s*\{\s*absolute:\s*["'`]([^"'`]+)["'`]/.exec(src);
  if (!titleM) titleM = /title:\s*["'`]([^"'`]+)["'`]/.exec(src);
  const headingsM = /export\s+const\s+headings\s*=\s*(\[[\s\S]*?\])\s*;?\s*\n/.exec(src);
  let headings = [];
  if (headingsM) {
    try {
      headings = Function(`"use strict"; return ${headingsM[1]};`)();
    } catch {
      headings = [];
    }
  }
  const text = src
    .replace(/<[^>]+>/g, " ")
    .replace(/[{}]/g, " ")
    .replace(/import .*?;/g, " ")
    .replace(/export .*?;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return { title: titleM ? titleM[1] : "Untitled", headings, body: text.slice(0, 4000) };
}

async function buildIndex() {
  const pages = walkDocs(DOCS_DIR);
  const index = pages.map(p => {
    const src = readFileSync(p.file, "utf8");
    const ex = extractFromTsx(src);
    return { slug: p.slug, ...ex };
  });
  writeFileSync(join(PUBLIC, "docs-index.json"), JSON.stringify(index));
  console.log(`docs-index.json: ${index.length} pages`);
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
