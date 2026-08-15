import { describe, it, expect } from "vitest";
import {
  normalizeScaleIntervals,
  quantizePitchToScale,
  transposeByScaleDegree,
  transposeHybrid,
} from "../../src/core/pitch.js";

const MAJOR = [0, 2, 4, 5, 7, 9, 11];

describe("pitch mapping", () => {
  it("quantizePitchToScale keeps members and resolves ties downward", () => {
    expect(quantizePitchToScale(60, 0, MAJOR)).toBe(60);
    expect(quantizePitchToScale(61, 0, MAJOR)).toBe(60);
    expect(quantizePitchToScale(60, 2, MAJOR)).toBe(59);
  });

  it("normalizeScaleIntervals: keeps an explicit root without duplicating it", () => {
    expect(normalizeScaleIntervals([0, 2, 4, 5, 7, 9, 11])).toEqual([0, 2, 4, 5, 7, 9, 11]);
  });

  it("normalizeScaleIntervals: injects root when the scale omits pitch class 0", () => {
    expect(normalizeScaleIntervals([2, 4, 5, 7, 9, 11])).toEqual([0, 2, 4, 5, 7, 9, 11]);
  });

  it("normalizeScaleIntervals: rounds, wraps, deduplicates, and sorts pitch classes", () => {
    expect(normalizeScaleIntervals([14, 2.4, -1, 2, 26])).toEqual([0, 2, 11]);
  });

  it("transposeByScaleDegree: moves through C major from C3", () => {
    expect(
      [0, 1, 2, 3, 4, 5, 6, 7].map((degree) => transposeByScaleDegree(48, degree, 0, MAJOR)),
    ).toEqual([48, 50, 52, 53, 55, 57, 59, 60]);
  });

  it("transposeByScaleDegree: moves downward across octaves", () => {
    expect([-1, -2, -7, -8].map((degree) => transposeByScaleDegree(48, degree, 0, MAJOR))).toEqual([
      47, 45, 36, 35,
    ]);
  });

  it("transposeByScaleDegree: starts from the played scale degree in D major", () => {
    expect([0, 1, 2, 3].map((degree) => transposeByScaleDegree(54, degree, 2, MAJOR))).toEqual([
      54, 55, 57, 59,
    ]);
  });

  it("transposeByScaleDegree: anchors the scale shape to an out-of-scale trigger", () => {
    expect([0, 1, 2, 3].map((degree) => transposeByScaleDegree(60, degree, 2, MAJOR))).toEqual([
      60, 62, 64, 65,
    ]);
  });

  it("transposeHybrid: adds an accidental after scale-degree resolution", () => {
    expect(transposeHybrid(48, 1, -1, 0, MAJOR)).toBe(49);
    expect(transposeHybrid(48, 1, 2, 0, MAJOR)).toBe(52);
  });

  it("transposeHybrid: resolves off-scale triggers before applying the accidental", () => {
    expect(transposeHybrid(60, 1, 1, 2, MAJOR)).toBe(63);
  });

  it("transposeHybrid: clamps results below MIDI note 0", () => {
    expect(transposeHybrid(0, 0, -5, 0, MAJOR)).toBe(0);
  });

  it("transposeHybrid: clamps results above MIDI note 127", () => {
    expect(transposeHybrid(120, 0, 20, 0, MAJOR)).toBe(127);
  });
});
