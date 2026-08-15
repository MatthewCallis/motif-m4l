import { describe, it, expect } from "vitest";
import {
  buildMotifPreview,
  midiNoteName,
  parseMidiNoteName,
  toMotifPreviewPaintData,
} from "../../src/core/preview.js";
import type { HostContext, Motif } from "../../src/core/types.js";
import { BUILTIN_MOTIFS } from "../../src/generated/builtins.js";

const chromaticTurn = BUILTIN_MOTIFS.find(({ id }) => id === "chromatic-turn");
const scaleTurn = BUILTIN_MOTIFS.find(({ id }) => id === "scale-turn");
if (!chromaticTurn || !scaleTurn) {
  throw new Error("Missing built-in motifs");
}

const host: HostContext = {
  tempo: 120,
  rootNote: 0,
  scaleName: "Major",
  scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
  scaleMode: true,
  timeSignature: { numerator: 4, denominator: 4 },
  isPlaying: false,
  currentSongTime: 0,
};

describe("motif preview", () => {
  it("formats MIDI note names using Ableton octave numbering", () => {
    expect(midiNoteName(60)).toBe("C3");
    expect(midiNoteName(58)).toBe("A♯2");
    expect(midiNoteName(0)).toBe("C-2");
  });

  it("parses Ableton-style MIDI note names with sharps and flats", () => {
    expect(parseMidiNoteName("C3")).toBe(60);
    expect(parseMidiNoteName(" c-2 ")).toBe(0);
    expect(parseMidiNoteName("F♯2")).toBe(54);
    expect(parseMidiNoteName("F#2")).toBe(54);
    expect(parseMidiNoteName("Bb4")).toBe(82);
    expect(parseMidiNoteName("B♭4")).toBe(82);
    expect(parseMidiNoteName("G8")).toBe(127);
    expect(parseMidiNoteName("Cb-2")).toBe(undefined);
    expect(parseMidiNoteName("G#8")).toBe(undefined);
    expect(parseMidiNoteName("60")).toBe(undefined);
    expect(parseMidiNoteName("H3")).toBe(undefined);
  });

  it("previews the Chromatic Turn contour from C3", () => {
    const preview = buildMotifPreview(chromaticTurn, host, 60, undefined, "preserve");
    expect(preview.notes.map(({ pitch }) => pitch)).toEqual([60, 62, 63, 67, 65, 62, 60]);
    expect(preview.noteNames).toEqual(["C3", "D3", "D♯3", "G3", "F3", "D3", "C3"]);
    expect(preview.notes.map(({ velocity }) => velocity)).toEqual([
      100, 100, 100, 106, 100, 100, 100,
    ]);
    expect(preview.bars).toBe(0.875);
    expect(preview.effectivePitchMode).toBe("chromatic");
  });

  it("scale-mode preview follows Live root and intervals", () => {
    const dorian: HostContext = {
      ...host,
      rootNote: 2,
      scaleName: "D Dorian",
      scaleIntervals: [0, 2, 3, 5, 7, 9, 10],
    };
    const preview = buildMotifPreview(scaleTurn, dorian, 62, "scale", "preserve");
    expect(preview.notes.map(({ pitch }) => pitch)).toEqual([62, 64, 65, 69, 67, 64, 62]);
    expect(preview.noteNames[0]).toBe("D3");
    expect(preview.effectivePitchMode).toBe("scale");
    expect(preview.notes.map(({ velocity }) => velocity)).toEqual([
      104, 100, 103, 107, 100, 97, 102,
    ]);
  });

  it("previews the target-aware Hybrid contour used by playback", () => {
    const hybrid: Motif = {
      ...chromaticTurn,
      id: "hybrid-contour-preview",
      pitchMode: "hybrid",
      sourcePitchContext: {
        anchorPitch: 48,
        scaleRootNote: 1,
        scaleName: "Major",
        scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
      },
      notes: [
        { at: 0, duration: 120, pitch: 2 },
        { at: 120, duration: 120, pitch: 1, accidental: 1 },
        { at: 240, duration: 120, pitch: 1 },
        { at: 360, duration: 120, pitch: 0 },
      ],
      length: 480,
    };
    const preview = buildMotifPreview(
      hybrid,
      { ...host, rootNote: 10, scaleName: "Major" },
      48,
      undefined,
      "preserve",
    );

    expect(preview.notes.map(({ pitch }) => pitch)).toEqual([51, 50, 49, 48]);
  });

  it("keeps the stored pitch mode when a preview override cannot convert", () => {
    const unresolved: Motif = {
      ...chromaticTurn,
      id: "unresolved-preview",
      sourcePitchContext: {
        ...chromaticTurn.sourcePitchContext,
        scaleIntervals: null,
        scaleName: "Custom Unknown Scale",
      },
    };
    const preview = buildMotifPreview(unresolved, host, 60, "scale", "preserve");
    expect(preview.effectivePitchMode).toBe("chromatic");
    expect(preview.notes.length).toBe(chromaticTurn.notes.length);
  });

  it("clamps note names and expands flat or empty preview ranges", () => {
    expect(midiNoteName(-20)).toBe("C-2");
    expect(midiNoteName(200)).toBe("G8");

    const flat = buildMotifPreview(chromaticTurn, host, 60, undefined, "fit-bar", 1);
    expect(flat.notes.length).toBe(1);
    expect(flat.lowPitch).toBe(59);
    expect(flat.highPitch).toBe(61);
    expect(flat.bars).toBe(chromaticTurn.length / 3840);

    const empty = buildMotifPreview(
      { ...chromaticTurn, length: 0, notes: [] },
      host,
      64,
      undefined,
      "preserve",
    );
    expect(empty.notes).toEqual([]);
    expect(empty.lowPitch).toBe(63);
    expect(empty.highPitch).toBe(65);
    expect(empty.bars > 0).toBeTruthy();
  });

  it("projects paint payloads with totalTicks from the last note end", () => {
    const preview = buildMotifPreview(chromaticTurn, host, 60, undefined, "preserve");
    const paint = toMotifPreviewPaintData(preview);
    expect(paint.notes.length).toBe(preview.notes.length);
    expect(paint.lowPitch).toBe(preview.lowPitch);
    expect(paint.highPitch).toBe(preview.highPitch);
    expect(paint.noteNames).toBe(preview.noteNames.join(" ·  "));
    const expectedTicks = preview.notes.reduce(
      (max, note) => Math.max(max, note.atTicks + note.durationTicks),
      1,
    );
    expect(paint.totalTicks).toBe(expectedTicks);
    expect(paint.notes[0]).toEqual({
      pitch: preview.notes[0]?.pitch,
      atTicks: preview.notes[0]?.atTicks,
      durationTicks: preview.notes[0]?.durationTicks,
      velocity: preview.notes[0]?.velocity,
    });
  });
});
