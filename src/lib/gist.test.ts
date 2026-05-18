import { describe, it, expect } from "vitest";
import { parseGistRef } from "./gist";

describe("parseGistRef", () => {
  it("accepts a bare 32-char hex ID", () => {
    expect(parseGistRef("0123456789abcdef0123456789abcdef")).toBe("0123456789abcdef0123456789abcdef");
  });

  it("lowercases uppercase IDs", () => {
    expect(parseGistRef("ABCDEF0123456789ABCDEF0123456789")).toBe("abcdef0123456789abcdef0123456789");
  });

  it("extracts ID from a user URL", () => {
    expect(parseGistRef("https://gist.github.com/octocat/aaaa1111bbbb2222cccc3333dddd4444"))
      .toBe("aaaa1111bbbb2222cccc3333dddd4444");
  });

  it("extracts ID from a no-user URL", () => {
    expect(parseGistRef("https://gist.github.com/aaaa1111bbbb2222cccc3333dddd4444"))
      .toBe("aaaa1111bbbb2222cccc3333dddd4444");
  });

  it("strips trailing path segments", () => {
    expect(parseGistRef("https://gist.github.com/octocat/aaaa1111bbbb2222cccc3333dddd4444/raw"))
      .toBe("aaaa1111bbbb2222cccc3333dddd4444");
  });

  it("rejects empty and non-hex input", () => {
    expect(parseGistRef("")).toBeNull();
    expect(parseGistRef("not a gist")).toBeNull();
    expect(parseGistRef("https://github.com/repo/issues/1")).toBeNull();
  });
});
