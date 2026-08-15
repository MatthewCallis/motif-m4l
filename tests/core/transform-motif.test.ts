import { describe, it, expect } from "vitest";
import { transformMotif } from "../../src/core/transform-motif.js";
import type { Motif } from "../../src/core/types.js";

const MOTIF: Motif = {
  schemaVersion: 1,
  id: "transform-test",
  name: "Transform Test",
  description: "Transform test motif",
  pitchMode: "hybrid",
  sourcePitchContext: {
    anchorPitch: 60,
    scaleRootNote: 0,
    scaleName: "Major",
    scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
  },
  sourceMeter: { numerator: 4, denominator: 4 },
  length: 960,
  notes: [
    { at: 0, duration: 120, pitch: 0, accidental: 0 },
    { at: 240, duration: 120, pitch: 1, accidental: -1 },
    { at: 600, duration: 240, pitch: -2, accidental: 1 },
  ],
};

describe("performance motif transforms", () => {
  it("returns the stored motif unchanged when both toggles are off", () => {
    expect(transformMotif(MOTIF, {})).toBe(MOTIF);
  });

  it("inverts encoded pitch offsets and accidentals without mutating the motif", () => {
    const transformed = transformMotif(MOTIF, { invert: true });

    expect(transformed.notes.map(({ pitch, accidental }) => [pitch, accidental])).toEqual([
      [0, 0],
      [-1, 1],
      [2, -1],
    ]);
    expect(MOTIF.notes.map(({ pitch, accidental }) => [pitch, accidental])).toEqual([
      [0, 0],
      [1, -1],
      [-2, 1],
    ]);
  });

  it("reverses complete note spans while preserving durations and rests", () => {
    const transformed = transformMotif(MOTIF, { reverse: true });

    expect(transformed.notes.map(({ at, duration, pitch }) => [at, duration, pitch])).toEqual([
      [120, 240, -2],
      [600, 120, 1],
      [840, 120, 0],
    ]);
    expect(MOTIF.notes.map(({ at }) => at)).toEqual([0, 240, 600]);
  });

  it("combines inversion and reversal in one transient copy", () => {
    const transformed = transformMotif(MOTIF, { invert: true, reverse: true });
    expect(transformed.notes.map(({ pitch }) => pitch)).toEqual([2, -1, 0]);
  });
});
