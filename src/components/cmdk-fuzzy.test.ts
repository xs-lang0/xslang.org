import { describe, it, expect } from "vitest";
import { matchScore } from "./cmdk-fuzzy";

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
