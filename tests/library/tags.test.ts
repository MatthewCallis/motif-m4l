import { describe, expect, it } from "vitest";
import { motifHasTag, motifMatchesTagFilter, normalizeTags } from "../../src/library/tags.js";

describe("motif tags", () => {
  it("normalizes, rejects, and dedupes tag lists", () => {
    expect(normalizeTags(undefined)).toEqual({ ok: true, value: [] });
    expect(normalizeTags([" Demo ", "demo", "lick"])).toEqual({
      ok: true,
      value: ["Demo", "lick"],
    });
    expect(normalizeTags("demo")).toEqual({
      ok: false,
      error: "tags must be an array of strings",
    });
    expect(normalizeTags([1])).toEqual({
      ok: false,
      error: "tags[0] must be a string",
    });
    expect(normalizeTags([""])).toEqual({
      ok: false,
      error: "tags[0] cannot be empty",
    });
  });

  it("matches tags case-insensitively and ignores blanks", () => {
    expect(motifHasTag(["Demo", "lick"], "demo")).toBe(true);
    expect(motifHasTag(["Demo"], "scale")).toBe(false);
    expect(motifHasTag(undefined, "demo")).toBe(false);
    expect(motifHasTag(["Demo"], "   ")).toBe(false);
  });

  it("combines selected tags with AND and OR", () => {
    expect(motifMatchesTagFilter(["demo"], [], "and")).toBe(true);
    expect(motifMatchesTagFilter(["demo", "scale"], ["demo", "lick"], "and")).toBe(false);
    expect(motifMatchesTagFilter(["demo", "scale"], ["demo", "scale"], "and")).toBe(true);
    expect(motifMatchesTagFilter(["demo"], ["lick", "demo"], "or")).toBe(true);
    expect(motifMatchesTagFilter(["demo"], ["lick"], "or")).toBe(false);
  });
});
