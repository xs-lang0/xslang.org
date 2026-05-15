#!/usr/bin/env node
// fetch xs.wasm from the latest GitHub release of xs-lang0/xs
import { writeFileSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const REPO = "xs-lang0/xs";
const ASSET = "xs.wasm";
const __dirname = dirname(fileURLToPath(import.meta.url));
const dest = join(__dirname, "..", "public", ASSET);

try {
  const st = statSync(dest);
  if (st.size > 0) {
    console.log(`${ASSET} already exists (${(st.size / 1024).toFixed(0)} KB), skipping fetch`);
    process.exit(0);
  }
  console.log(`${ASSET} is 0 bytes, re-fetching`);
} catch {
  // file doesn't exist, proceed with fetch
}

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

  const asset = release.assets?.find((a) => a.name === ASSET);
  if (!asset) {
    console.warn(`fetch-wasm: ${ASSET} not in release ${release.tag_name}; skipping`);
    process.exit(0);
  }

  console.log(`downloading ${ASSET} from ${release.tag_name}...`);
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
    console.log(`saved ${ASSET} (${(buf.length / 1024).toFixed(0)} KB)`);
  } catch (e) {
    console.warn(`fetch-wasm: ${e.message}; skipping`);
    process.exit(0);
  }
}

fetchWasm();
