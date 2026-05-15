#!/usr/bin/env node
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const REPO = "xs-lang0/xs";
const __dirname = dirname(fileURLToPath(import.meta.url));
const dest = join(__dirname, "..", "public", "releases.json");

const PLATFORMS = [
  { match: /linux.*x86_?64|linux.*x64/i, platform: "linux-x64" },
  { match: /linux.*arm64|linux.*aarch64/i, platform: "linux-arm64" },
  { match: /macos.*x86_?64|darwin.*x64/i, platform: "macos-x64" },
  { match: /macos.*arm64|darwin.*arm64/i, platform: "macos-arm64" },
  { match: /windows.*x64|win.*x64/i, platform: "windows-x64" },
  { match: /\.wasm$/i, platform: "wasm" },
];

function classify(name) {
  for (const p of PLATFORMS) if (p.match.test(name)) return p.platform;
  return null;
}

export function parseReleases(raw) {
  return raw
    .filter(r => !r.draft && !r.prerelease)
    .map(r => {
      const grouped = {};
      for (const a of r.assets) {
        const isSha = a.name.endsWith(".sha256");
        const realName = isSha ? a.name.replace(/\.sha256$/, "") : a.name;
        const plat = classify(realName);
        if (!plat) continue;
        grouped[plat] = grouped[plat] ?? { platform: plat, name: realName, url: "", size: 0 };
        if (isSha) grouped[plat].sha256Url = a.browser_download_url;
        else { grouped[plat].url = a.browser_download_url; grouped[plat].size = a.size; }
      }
      return {
        tag: r.tag_name,
        name: r.name ?? r.tag_name,
        published: r.published_at,
        body: r.body ?? "",
        assets: Object.values(grouped),
      };
    })
    .sort((a, b) => b.published.localeCompare(a.published));
}

async function main() {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 15000);
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=50`, { signal: c.signal });
    if (!res.ok) throw new Error(`github api ${res.status}`);
    const raw = await res.json();
    const out = parseReleases(raw);
    writeFileSync(dest, JSON.stringify(out, null, 2));
    console.log(`wrote ${out.length} releases`);
  } catch (e) {
    console.warn(`fetch-releases: ${e.message}; writing empty list`);
    writeFileSync(dest, "[]");
  } finally {
    clearTimeout(t);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
