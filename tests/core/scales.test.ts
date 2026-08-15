import { describe, expect, it } from "vitest";
import { knownScaleIntervals } from "../../src/core/scales.js";

describe("knownScaleIntervals", () => {
  it("looks up Live labels and strips a leading root name", () => {
    expect(knownScaleIntervals("Major")).toEqual([0, 2, 4, 5, 7, 9, 11]);
    expect(knownScaleIntervals("D Major")).toEqual([0, 2, 4, 5, 7, 9, 11]);
    expect(knownScaleIntervals("F♯ Minor")).toEqual([0, 2, 3, 5, 7, 8, 10]);
    expect(knownScaleIntervals("Bb Dorian")).toEqual([0, 2, 3, 5, 7, 9, 10]);
  });

  it("returns undefined for unknown or blank names", () => {
    expect(knownScaleIntervals("")).toBeUndefined();
    expect(knownScaleIntervals("Not A Scale")).toBeUndefined();
  });
});
