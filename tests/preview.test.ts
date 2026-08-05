import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildMotifPreview, midiNoteName, parseMidiNoteName } from "../src/core/preview.js";
import type { HostContext, Motif } from "../src/core/types.js";
import { BUILTIN_MOTIFS } from "../src/generated/builtins.js";

const chromaticTurn = BUILTIN_MOTIFS.find(({ id }) => id === "chromatic-turn");
const scaleTurn = BUILTIN_MOTIFS.find(({ id }) => id === "scale-turn");
if (!chromaticTurn || !scaleTurn) throw new Error("Missing built-in motifs");

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
    assert.equal(midiNoteName(60), "C3");
    assert.equal(midiNoteName(58), "A♯2");
    assert.equal(midiNoteName(0), "C-2");
  });

  it("parses Ableton-style MIDI note names with sharps and flats", () => {
    assert.equal(parseMidiNoteName("C3"), 60);
    assert.equal(parseMidiNoteName(" c-2 "), 0);
    assert.equal(parseMidiNoteName("F♯2"), 54);
    assert.equal(parseMidiNoteName("F#2"), 54);
    assert.equal(parseMidiNoteName("Bb4"), 82);
    assert.equal(parseMidiNoteName("B♭4"), 82);
    assert.equal(parseMidiNoteName("G8"), 127);
    assert.equal(parseMidiNoteName("Cb-2"), undefined);
    assert.equal(parseMidiNoteName("G#8"), undefined);
    assert.equal(parseMidiNoteName("60"), undefined);
    assert.equal(parseMidiNoteName("H3"), undefined);
  });

  it("previews the Chromatic Turn contour from C3", () => {
    const preview = buildMotifPreview(chromaticTurn, host, 60, undefined, "preserve");
    assert.deepEqual(
      preview.notes.map(({ pitch }) => pitch),
      [60, 62, 63, 67, 65, 62, 60],
    );
    assert.deepEqual(preview.noteNames, ["C3", "D3", "D♯3", "G3", "F3", "D3", "C3"]);
    assert.deepEqual(
      preview.notes.map(({ velocity }) => velocity),
      [100, 100, 100, 106, 100, 100, 100],
    );
    assert.equal(preview.bars, 0.875);
    assert.equal(preview.effectivePitchMode, "chromatic");
  });

  it("scale-mode preview follows Live root and intervals", () => {
    const dorian: HostContext = {
      ...host,
      rootNote: 2,
      scaleName: "D Dorian",
      scaleIntervals: [0, 2, 3, 5, 7, 9, 10],
    };
    const preview = buildMotifPreview(scaleTurn, dorian, 62, "scale", "preserve");
    assert.deepEqual(
      preview.notes.map(({ pitch }) => pitch),
      [62, 64, 65, 69, 67, 64, 62],
    );
    assert.equal(preview.noteNames[0], "D3");
    assert.equal(preview.effectivePitchMode, "scale");
    assert.deepEqual(
      preview.notes.map(({ velocity }) => velocity),
      [104, 100, 103, 107, 100, 97, 102],
    );
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

    assert.deepEqual(
      preview.notes.map(({ pitch }) => pitch),
      [51, 50, 49, 48],
    );
  });

  it("clamps note names and expands flat or empty preview ranges", () => {
    assert.equal(midiNoteName(-20), "C-2");
    assert.equal(midiNoteName(200), "G8");

    const flat = buildMotifPreview(chromaticTurn, host, 60, undefined, "fit-bar", 1);
    assert.equal(flat.notes.length, 1);
    assert.equal(flat.lowPitch, 59);
    assert.equal(flat.highPitch, 61);
    assert.equal(flat.bars, chromaticTurn.length / 3840);

    const empty = buildMotifPreview(
      { ...chromaticTurn, length: 0, notes: [] },
      host,
      64,
      undefined,
      "preserve",
    );
    assert.deepEqual(empty.notes, []);
    assert.equal(empty.lowPitch, 63);
    assert.equal(empty.highPitch, 65);
    assert.ok(empty.bars > 0);
  });
});
