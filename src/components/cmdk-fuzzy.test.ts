import { describe, it, expect } from "vitest";
import { matchScore, scoreChunk, makeSnippet, search, type Chunk } from "./cmdk-fuzzy";

describe("matchScore", () => {
  it("returns 0 for no overlap", () => {
    expect(matchScore("xyz", "pattern matching")).toBe(0);
  });
  it("scores prefix higher than substring", () => {
    expect(matchScore("pat", "pattern matching")).toBeGreaterThan(matchScore("pat", "type pattern"));
  });
  it("scores word-initial higher than mid-word", () => {
    expect(matchScore("pm", "pattern matching")).toBeGreaterThan(matchScore("pm", "complement"));
  });
  it("is case-insensitive", () => {
    expect(matchScore("Pat", "pattern matching")).toBe(matchScore("pat", "pattern matching"));
  });
});

const chunk = (over: Partial<Chunk>): Chunk => ({
  pageTitle: "Pattern matching · XS Guide",
  pageSlug: "guide/pattern-matching",
  sectionHeading: "",
  sectionAnchor: "",
  bodyText: "",
  ...over,
});

describe("scoreChunk", () => {
  it("title hit beats heading hit beats body hit", () => {
    const titleC = chunk({ pageTitle: "Pattern matching · XS Guide" });
    const headingC = chunk({ pageTitle: "Other · XS Guide", sectionHeading: "Pattern matching tips" });
    const bodyC = chunk({ pageTitle: "Other · XS Guide", bodyText: "the pattern matching arms" });
    const t = scoreChunk(titleC, "pattern matching");
    const h = scoreChunk(headingC, "pattern matching");
    const b = scoreChunk(bodyC, "pattern matching");
    expect(t).toBeGreaterThan(h);
    expect(h).toBeGreaterThan(b);
  });

  it("returns zero for empty query", () => {
    expect(scoreChunk(chunk({ pageTitle: "anything" }), "")).toBe(0);
  });

  it("rewards multiple body matches over a single one", () => {
    const single = chunk({ pageTitle: "x", bodyText: "checks exhaustiveness once in this paragraph and moves on" });
    const dense = chunk({ pageTitle: "x", bodyText: "exhaustiveness exhaustiveness checks for exhaustiveness in arms" });
    expect(scoreChunk(dense, "exhaustiveness")).toBeGreaterThan(scoreChunk(single, "exhaustiveness"));
  });
});

describe("makeSnippet", () => {
  it("wraps the first match in a marked part", () => {
    const parts = makeSnippet("the quick brown fox jumps over the lazy dog", "brown");
    const marked = parts.find(p => p.mark);
    expect(marked?.text).toBe("brown");
  });
  it("returns leading text when no match", () => {
    const parts = makeSnippet("nothing relevant here", "xyzzz");
    expect(parts.length).toBe(1);
    expect(parts[0].mark).toBe(false);
  });
  it("clips long text on either side of the match", () => {
    const long = "a".repeat(200) + " needle " + "b".repeat(200);
    const parts = makeSnippet(long, "needle", 30);
    const total = parts.map(p => p.text).join("");
    expect(total.length).toBeLessThan(long.length);
    expect(total).toContain("needle");
  });
});

describe("search", () => {
  const idx: Chunk[] = [
    chunk({ pageTitle: "Pattern matching · XS Guide", pageSlug: "guide/pattern-matching", sectionHeading: "", sectionAnchor: "" }),
    chunk({ pageTitle: "Pattern matching · XS Guide", pageSlug: "guide/pattern-matching", sectionHeading: "Guards", sectionAnchor: "guards", bodyText: "guards filter arms with a boolean expression" }),
    chunk({ pageTitle: "Effects · XS Guide", pageSlug: "guide/effects", sectionHeading: "Resume", sectionAnchor: "resume", bodyText: "the handler can resume back to the perform site with a value, returning control to the original computation" }),
  ];

  it("finds a body-only phrase", () => {
    const hits = search(idx, "perform site");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].pageSlug).toBe("guide/effects");
    expect(hits[0].sectionAnchor).toBe("resume");
  });

  it("ranks title matches above body matches", () => {
    const hits = search(idx, "pattern");
    expect(hits[0].pageSlug).toBe("guide/pattern-matching");
  });

  it("returns nothing for an empty query", () => {
    expect(search(idx, "")).toEqual([]);
  });

  it("caps results per page", () => {
    const dupes: Chunk[] = [];
    for (let i = 0; i < 10; i++) {
      dupes.push(chunk({ pageSlug: "guide/x", sectionHeading: `Section ${i}`, sectionAnchor: `s${i}`, bodyText: "needle" }));
    }
    const hits = search(dupes, "needle");
    expect(hits.length).toBeLessThanOrEqual(3);
  });
});
