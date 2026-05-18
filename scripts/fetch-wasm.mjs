#!/usr/bin/env node
// fetch xs.wasm from the latest GitHub release of xs-lang0/xs
//
// Pass --force to always re-fetch. Otherwise we compare the local .version
// stamp against the latest release tag and only download when they differ
// (or when the file is missing / zero-size).
import { writeFileSync, statSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const REPO = "xs-lang0/xs";
const ASSET = "xs.wasm";
const __dirname = dirname(fileURLToPath(import.meta.url));
const dest = join(__dirname, "..", "public", ASSET);
const stampFile = join(__dirname, "..", "public", ".xs-wasm-version");
const force = process.argv.includes("--force");

let localTag = null;
try { localTag = readFileSync(stampFile, "utf8").trim(); } catch { /* none */ }
let haveFile = false;
try { haveFile = statSync(dest).size > 0; } catch { /* none */ }

function withTimeout(ms) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  return { signal: c.signal, clear: () => clearTimeout(t) };
}

async function fetchWasm() {
  let release;
  try {
    const meta = withTimeout(15000);
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { signal: meta.signal });
    meta.clear();
    if (!res.ok) {
      console.warn(`fetch-wasm: release info ${res.status}; skipping`);
      process.exit(0);
    }
    release = await res.json();
  } catch (e) {
    console.warn(`fetch-wasm: ${e.message}; skipping`);
    process.exit(0);
  }

  const tag = release.tag_name;
  if (!force && haveFile && localTag === tag) {
    console.log(`${ASSET} is up to date (${tag}), skipping fetch`);
    process.exit(0);
  }
  if (haveFile && localTag !== tag) console.log(`local ${ASSET} is ${localTag || "unstamped"}, latest is ${tag}; updating`);
  else if (force) console.log(`forcing re-fetch of ${ASSET}`);

  const asset = release.assets?.find((a) => a.name === ASSET);
  if (!asset) {
    console.warn(`fetch-wasm: ${ASSET} not in release ${tag}; skipping`);
    process.exit(0);
  }

  console.log(`downloading ${ASSET} from ${tag}...`);
  try {
    const dl = withTimeout(60000);
    const download = await fetch(asset.browser_download_url, { signal: dl.signal });
    dl.clear();
    if (!download.ok) {
      console.warn(`fetch-wasm: download ${download.status}; skipping`);
      process.exit(0);
    }
    const buf = Buffer.from(await download.arrayBuffer());
    writeFileSync(dest, buf);
    writeFileSync(stampFile, tag + "\n");
    console.log(`saved ${ASSET} (${(buf.length / 1024).toFixed(0)} KB) at ${tag}`);
  } catch (e) {
    console.warn(`fetch-wasm: ${e.message}; skipping`);
    process.exit(0);
  }
}

fetchWasm();
