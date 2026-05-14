import { describe, it, expect } from "vitest";
import { sliceByHeading, slugify } from "./build-docs.mjs";

describe("sliceByHeading", () => {
  it("slices a markdown doc by H2", () => {
    const md = "## A\nfirst\n## B\nsecond\n## C\nthird\n";
    const out = sliceByHeading(md);
    expect(Object.keys(out)).toEqual(["a", "b", "c"]);
    expect(out.a.trim()).toBe("first");
    expect(out.c.trim()).toBe("third");
  });
  it("includes H3 children under their H2", () => {
    const md = "## A\nfirst\n### A1\nsubfirst\n## B\nsecond\n";
    expect(sliceByHeading(md).a).toContain("subfirst");
  });
});

describe("slugify", () => {
  it("lowercases and dasherises", () => {
    expect(slugify("Pattern Matching")).toBe("pattern-matching");
    expect(slugify("Try / Catch / Finally")).toBe("try-catch-finally");
    expect(slugify("`@scoped` bindings")).toBe("scoped-bindings");
  });
});
