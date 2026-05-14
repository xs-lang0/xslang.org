import { describe, it, expect } from "vitest";
import { parseReleases } from "./fetch-releases.mjs";

describe("parseReleases", () => {
  it("normalises GitHub release JSON into our shape", () => {
    const raw = [
      {
        tag_name: "v1.2.1",
        name: "v1.2.1",
        published_at: "2026-05-06T12:00:00Z",
        body: "first line\n\nsecond paragraph",
        assets: [
          { name: "xs-linux-x64.tar.gz", browser_download_url: "u1", size: 2400000 },
          { name: "xs-linux-x64.tar.gz.sha256", browser_download_url: "u2", size: 65 },
          { name: "xs.wasm", browser_download_url: "u3", size: 1000000 },
        ],
        prerelease: false,
        draft: false,
      },
    ];
    const out = parseReleases(raw);
    expect(out).toHaveLength(1);
    expect(out[0].tag).toBe("v1.2.1");
    const linux = out[0].assets.find(a => a.platform === "linux-x64");
    expect(linux.url).toBe("u1");
    expect(linux.sha256Url).toBe("u2");
  });

  it("filters drafts and prereleases", () => {
    const raw = [
      { tag_name: "v1.0", published_at: "2026-01-01T00:00:00Z", body: "", assets: [], prerelease: true, draft: false },
      { tag_name: "v1.1", published_at: "2026-02-01T00:00:00Z", body: "", assets: [], prerelease: false, draft: true },
      { tag_name: "v1.2", published_at: "2026-03-01T00:00:00Z", body: "", assets: [], prerelease: false, draft: false },
    ];
    expect(parseReleases(raw).map(r => r.tag)).toEqual(["v1.2"]);
  });
});
