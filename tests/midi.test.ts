import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import { writeMidi } from "midi-file";
import { BUILTIN_MOTIFS } from "../src/generated/builtins.js";
import { midiBytesToMotif, motifToMidiBytes } from "../scripts/midi-conversion.js";

describe("MIDI conversion", () => {
  it("exports and reimports a chromatic motif as relative MIDI", () => {
    const source = BUILTIN_MOTIFS.find(({ id }) => id === "chromatic-turn");
    assert.ok(source);
    const bytes = motifToMidiBytes(source, 60);
    const imported = midiBytesToMotif(bytes, {
      id: "roundtrip",
      name: "Roundtrip",
      pitchMode: "chromatic",
      rootNote: 60,
    });

    assert.deepEqual(
      imported.notes.map(({ pitch }) => pitch),
      [0, 2, 3, 7, 5, 2, 0],
    );
    assert.deepEqual(
      imported.notes.map(({ at }) => at),
      source.notes.map(({ at }) => at),
    );
    assert.ok(imported.length <= source.length);
  });

  it("MIDI import defaults to exact chromatic offsets", async () => {
    const bytes = new Uint8Array(await readFile("tests/fixtures/mitsuda-secret-part-1.mid"));
    const imported = midiBytesToMotif(bytes, {
      id: "secret-of-the-forest",
      name: "Secret of the Forest",
    });

    assert.equal(imported.pitchMode, "chromatic");
    assert.match(imported.description, /chromatic relative analysis/);
    assert.deepEqual(
      imported.notes.map(({ pitch, accidental }) => ({ pitch, accidental })),
      [
        { pitch: 0, accidental: undefined },
        { pitch: -2, accidental: undefined },
        { pitch: 3, accidental: undefined },
        { pitch: 2, accidental: undefined },
        { pitch: 1, accidental: undefined },
        { pitch: 0, accidental: undefined },
        { pitch: -2, accidental: undefined },
        { pitch: -4, accidental: undefined },
      ],
    );
  });

  it("supports velocity-zero note-offs and skips unmatched note-offs", () => {
    const bytes = writeMidi({
      header: { format: 0, numTracks: 1, ticksPerBeat: 480 },
      tracks: [
        [
          { deltaTime: 0, type: "noteOff", channel: 0, noteNumber: 50, velocity: 0 },
          { deltaTime: 0, type: "noteOn", channel: 0, noteNumber: 60, velocity: 90 },
          { deltaTime: 240, type: "noteOn", channel: 0, noteNumber: 60, velocity: 0 },
          { deltaTime: 0, meta: true, type: "endOfTrack" },
        ],
      ],
    });
    const motif = midiBytesToMotif(bytes, { id: "velocity-zero", name: "Velocity Zero" });
    assert.equal(motif.notes.length, 1);
    assert.equal(motif.notes[0]?.duration, 480);
    assert.equal(motif.notes[0]?.velocity, 90);
  });

  it("rejects invalid motifs and MIDI files without completed notes", () => {
    assert.throws(() => motifToMidiBytes({}), /schemaVersion/);

    const bytes = writeMidi({
      header: { format: 0, numTracks: 1, ticksPerBeat: 960 },
      tracks: [
        [
          { deltaTime: 0, type: "noteOn", channel: 0, noteNumber: 60, velocity: 100 },
          { deltaTime: 120, meta: true, type: "endOfTrack" },
        ],
      ],
    });
    assert.throws(
      () => midiBytesToMotif(bytes, { id: "incomplete", name: "Incomplete" }),
      /no completed notes/i,
    );
  });
});
