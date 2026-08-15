import { describe, it, expect } from "vitest";
import {
  absoluteNotesToMotif,
  convertMotifPitchMode,
  decodeSemitoneOffset,
} from "../../src/core/import-notes.js";

const MAJOR = [0, 2, 4, 5, 7, 9, 11];

describe("motif note import", () => {
  it("always imports exact chromatic offsets and captures source context", () => {
    const motif = absoluteNotesToMotif(
      [
        { at: 480, duration: 480, pitch: 63, velocity: 90 },
        { at: 0, duration: 480, pitch: 64, velocity: 100 },
        { at: 0, duration: 480, pitch: 60, velocity: 80 },
      ],
      {
        id: "chrom",
        name: "Chrom",
        scaleRootNote: 0,
        scaleName: "Major",
        scaleIntervals: MAJOR,
      },
    );

    expect(motif.pitchMode).toBe("chromatic");
    expect(motif.notes.map(({ pitch }) => pitch)).toEqual([0, 4, 3]);
    expect(motif.sourcePitchContext).toEqual({
      anchorPitch: 60,
      scaleRootNote: 0,
      scaleName: "Major",
      scaleIntervals: [...MAJOR],
    });
  });

  it("uses known scale names as a fallback and leaves unknown scales unresolved", () => {
    const known = absoluteNotesToMotif([{ at: 0, duration: 1, pitch: 60, velocity: 100 }], {
      id: "known",
      name: "Known",
      scaleName: "D Minor",
      scaleRootNote: 2,
    });
    expect(known.sourcePitchContext.scaleIntervals).toEqual([0, 2, 3, 5, 7, 8, 10]);

    const unknown = absoluteNotesToMotif([{ at: 0, duration: 1, pitch: 60, velocity: 100 }], {
      id: "unknown",
      name: "Unknown",
      scaleName: "Custom Future Scale",
      scaleIntervals: null,
    });
    expect(unknown.sourcePitchContext.scaleIntervals).toBe(null);
    expect(() => convertMotifPitchMode(unknown, "scale")).toThrow(/source scale intervals/);
  });

  it("converts Chromatic to lossless Scale degrees with retained accidentals", () => {
    const chromatic = absoluteNotesToMotif(
      [
        { at: 0, duration: 240, pitch: 60, velocity: 100 },
        { at: 240, duration: 240, pitch: 63, velocity: 100 },
        { at: 480, duration: 240, pitch: 67, velocity: 100 },
      ],
      { id: "source", name: "Source", scaleIntervals: MAJOR },
    );
    const scale = convertMotifPitchMode(chromatic, "scale");

    expect(scale.notes.map(({ pitch, accidental }) => [pitch, accidental ?? 0])).toEqual([
      [0, 0],
      [1, 1],
      [4, 0],
    ]);

    const hybrid = convertMotifPitchMode(scale, "hybrid");
    expect(hybrid.notes).toBe(scale.notes);
    const roundTrip = convertMotifPitchMode(hybrid, "chromatic");
    expect(roundTrip.notes.map(({ pitch, accidental }) => [pitch, accidental])).toEqual([
      [0, undefined],
      [3, undefined],
      [7, undefined],
    ]);
  });

  it("analyzes scale motion relative to an off-tonic source anchor", () => {
    const chromatic = absoluteNotesToMotif(
      [
        { at: 0, duration: 480, pitch: 64, velocity: 100 },
        { at: 480, duration: 480, pitch: 62, velocity: 100 },
      ],
      {
        id: "off-tonic-anchor",
        name: "Off-tonic anchor",
        anchorPitch: 64,
        scaleRootNote: 0,
        scaleName: "Major",
        scaleIntervals: MAJOR,
      },
    );
    const hybrid = convertMotifPitchMode(chromatic, "hybrid");
    expect(hybrid.notes[1]?.pitch).toBe(-1);
    expect(hybrid.notes[1]?.accidental).toBe(undefined);
  });

  it("encodes and decodes retained chromatic alterations", () => {
    const context = { triggerPitch: 60, rootNote: 0, scaleIntervals: MAJOR };
    // Chromatic: semitone offset encodes as-is
    const chromMotif = absoluteNotesToMotif([{ at: 0, duration: 480, pitch: 63, velocity: 100 }], {
      id: "t",
      name: "T",
      anchorPitch: 60,
      scaleIntervals: MAJOR,
    });
    expect(chromMotif.notes[0]?.pitch).toBe(3); // offset from anchor 60
    // Scale: blue note (semitone +3) encodes as degree 1 with +1 accidental
    const scaleMotif = convertMotifPitchMode(chromMotif, "scale");
    expect(scaleMotif.notes[0]?.pitch).toBe(1);
    expect(scaleMotif.notes[0]?.accidental).toBe(1);
    // decodeSemitoneOffset: round-trip check
    expect(
      decodeSemitoneOffset({ at: 0, duration: 1, pitch: 1, accidental: 1 }, "scale", context),
    ).toBe(3);
  });

  it("returns the same motif when no pitch-mode conversion is needed", () => {
    const motif = absoluteNotesToMotif([{ at: 0, duration: 0, pitch: 64, velocity: 100 }], {
      id: "same",
      name: "Same",
      sourceMeter: { numerator: 3, denominator: 4 },
    });
    expect(convertMotifPitchMode(motif, "chromatic")).toBe(motif);
    expect(motif.notes[0]?.duration).toBe(1);
    expect(motif.sourceMeter).toEqual({ numerator: 3, denominator: 4 });
  });

  it("rejects imports without completed notes", () => {
    expect(() => absoluteNotesToMotif([], { id: "empty", name: "Empty" })).toThrow(
      /No completed notes/,
    );
  });

  it("rejects invalid explicit source anchors and roots", () => {
    const notes = [{ at: 0, duration: 1, pitch: 60, velocity: 100 }];
    expect(() =>
      absoluteNotesToMotif(notes, { id: "anchor", name: "Anchor", anchorPitch: 128 }),
    ).toThrow(/anchor pitch/);
    expect(() =>
      absoluteNotesToMotif(notes, { id: "root", name: "Root", scaleRootNote: 12 }),
    ).toThrow(/scale root/);
  });
});
