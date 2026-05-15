const REPO = "xs-lang0/xs";
const REVALIDATE_SECONDS = 300;

export type Asset = {
  platform: string;
  name: string;
  url: string;
  size: number;
  sha256Url?: string;
};

export type Release = {
  tag: string;
  name: string;
  published: string;
  body: string;
  assets: Asset[];
};

const PLATFORMS = [
  { match: /linux.*x86_?64|linux.*x64|linux.*amd64/i, platform: "linux-x64" },
  { match: /linux.*arm64|linux.*aarch64/i, platform: "linux-arm64" },
  { match: /macos.*x86_?64|darwin.*x64|darwin.*amd64/i, platform: "macos-x64" },
  { match: /macos.*arm64|darwin.*arm64/i, platform: "macos-arm64" },
  { match: /(windows|win).*(x86_?64|x64|amd64)/i, platform: "windows-x64" },
  { match: /\.wasm$/i, platform: "wasm" },
];

function classify(name: string): string | null {
  for (const p of PLATFORMS) if (p.match.test(name)) return p.platform;
  return null;
}

type RawAsset = { name: string; browser_download_url: string; size: number };
type RawRelease = {
  tag_name: string;
  name?: string;
  published_at: string;
  body?: string;
  assets: RawAsset[];
  prerelease: boolean;
  draft: boolean;
};

export function parseReleases(raw: RawRelease[]): Release[] {
  return raw
    .filter(r => !r.draft && !r.prerelease)
    .map(r => {
      const grouped: Record<string, Asset> = {};
      for (const a of r.assets) {
        const isSha = a.name.endsWith(".sha256");
        const realName = isSha ? a.name.replace(/\.sha256$/, "") : a.name;
        const plat = classify(realName);
        if (!plat) continue;
        grouped[plat] = grouped[plat] ?? {
          platform: plat,
          name: realName,
          url: "",
          size: 0,
        };
        if (isSha) grouped[plat].sha256Url = a.browser_download_url;
        else {
          grouped[plat].url = a.browser_download_url;
          grouped[plat].size = a.size;
        }
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

export async function fetchReleases(): Promise<Release[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/releases?per_page=50`,
      { next: { revalidate: REVALIDATE_SECONDS } },
    );
    if (!res.ok) return [];
    const raw = (await res.json()) as RawRelease[];
    return parseReleases(raw);
  } catch {
    return [];
  }
}
