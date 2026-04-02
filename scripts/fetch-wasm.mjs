#!/usr/bin/env node
// fetch xs.wasm from the latest GitHub release of xs-lang0/xs
import { writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const REPO = "xs-lang0/xs";
const ASSET = "xs.wasm";
const __dirname = dirname(fileURLToPath(import.meta.url));
const dest = join(__dirname, "..", "public", ASSET);

if (existsSync(dest)) {
  console.log(`${ASSET} already exists, skipping fetch`);
  process.exit(0);
}

async function fetchWasm() {
  // get latest release
  const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`);
  if (!res.ok) {
    console.error(`failed to fetch release info: ${res.status}`);
    process.exit(1);
  }
  const release = await res.json();
  const asset = release.assets.find((a) => a.name === ASSET);
  if (!asset) {
    console.error(`${ASSET} not found in release ${release.tag_name}`);
    console.error("available assets:", release.assets.map((a) => a.name).join(", "));
    process.exit(1);
  }

  console.log(`downloading ${ASSET} from ${release.tag_name}...`);
  const download = await fetch(asset.browser_download_url);
  if (!download.ok) {
    console.error(`download failed: ${download.status}`);
    process.exit(1);
  }

  const buf = Buffer.from(await download.arrayBuffer());
  writeFileSync(dest, buf);
  console.log(`saved ${ASSET} (${(buf.length / 1024).toFixed(0)} KB)`);
}

fetchWasm();
