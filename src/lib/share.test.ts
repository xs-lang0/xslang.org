import { describe, it, expect } from "vitest";
import { encodeWorkspace, decodeWorkspace, decodeLegacySingle } from "./share";

describe("encodeWorkspace / decodeWorkspace", () => {
  it("round trips a single file", async () => {
    const ws = { files: { "main.xs": `println("hi")` }, active: "main.xs" };
    const enc = await encodeWorkspace(ws);
    const dec = await decodeWorkspace(enc);
    expect(dec).toEqual(ws);
  });

  it("round trips a multi-file workspace and keeps active", async () => {
    const ws = {
      files: {
        "main.xs": `use util\nutil.greet("world")`,
        "util.xs": `fn greet(name) { println("hi " + name) }`,
        "notes.xs": `-- scratchpad`,
      },
      active: "util.xs",
    };
    const enc = await encodeWorkspace(ws);
    const dec = await decodeWorkspace(enc);
    expect(dec).toEqual(ws);
  });

  it("falls back to the first file when active points at a missing name", async () => {
    const ws = { files: { "a.xs": "x", "b.xs": "y" }, active: "missing.xs" };
    const enc = await encodeWorkspace(ws);
    const dec = await decodeWorkspace(enc);
    expect(dec?.active).toBe("a.xs");
  });

  it("rejects total garbage", async () => {
    expect(await decodeWorkspace("!!!not valid!!!")).toBeNull();
    expect(await decodeWorkspace("")).toBeNull();
  });
});

describe("legacy single-file share", () => {
  it("decodes a pre-versioning #s= payload as shared.xs", async () => {
    // Build a legacy payload the way the old encoder did: raw base64-url
    // of UTF-8 source text, no version byte.
    const src = `println("legacy")`;
    const b64 = btoa(src).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const dec = await decodeWorkspace(b64);
    expect(dec).toEqual({ files: { "shared.xs": src }, active: "shared.xs" });
  });

  it("decodeLegacySingle ignores anything that looks like a workspace JSON", () => {
    const json = `{"f":{"a.xs":"x"},"a":"a.xs"}`;
    const b64 = btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    expect(decodeLegacySingle(b64)).toBeNull();
  });
});
