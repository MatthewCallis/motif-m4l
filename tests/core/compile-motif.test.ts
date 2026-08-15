import { describe, it, expect } from "vitest";
import { compileMotif, effectiveDuration, resolveVelocity } from "../../src/core/compile-motif.js";
import { convertMotifPitchMode } from "../../src/core/import-notes.js";
import { PPQ, type HostContext, type Motif, type MotifNote } from "../../src/core/types.js";

const HOST: HostContext = {
  tempo: 120,
  rootNote: 0,
  scaleName: "Major",
  scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
  scaleMode: true,
  timeSignature: { numerator: 4, denominator: 4 },
  isPlaying: false,
  currentSongTime: 0,
};

const MOTIF: Motif = {
  schemaVersion: 1,
  id: "test",
  name: "Test",
  description: "Test motif",
  pitchMode: "scale",
  sourcePitchContext: {
    anchorPitch: 60,
    scaleRootNote: 0,
    scaleName: "Major",
    scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
  },
  sourceMeter: { numerator: 4, denominator: 4 },
  length: PPQ,
  notes: [{ at: 0, duration: PPQ, pitch: 2 }],
};

describe("compileMotif", () => {
  it("compiles note-on and note-off events", () => {
    expect(
      compileMotif(MOTIF, HOST, {
        channel: 2,
        meterMode: "preserve",
        triggerPitch: 48,
        triggerVelocity: 90,
        instanceId: 7,
      }),
    ).toEqual([
      { pitch: 52, velocity: 90, channel: 2, offsetTicks: 0, offsetMs: 0, instanceId: 7 },
      { pitch: 52, velocity: 0, channel: 2, offsetTicks: 960, offsetMs: 500, instanceId: 7 },
    ]);
  });

  it("fits a 4/4 source bar into a 3/4 target bar", () => {
    const host: HostContext = {
      ...HOST,
      timeSignature: { numerator: 3, denominator: 4 },
    };
    const events = compileMotif(MOTIF, host, {
      channel: 1,
      meterMode: "fit-bar",
      triggerPitch: 48,
      triggerVelocity: 100,
    });

    expect(events[1]?.offsetTicks).toBe(720);
    expect(events[1]?.offsetMs).toBe(375);
  });

  it("source-aware override converts scale degrees back to chromatic offsets", () => {
    const events = compileMotif(MOTIF, HOST, {
      channel: 1,
      meterMode: "preserve",
      pitchMode: "chromatic",
      triggerPitch: 48,
      triggerVelocity: 100,
    });

    expect(events[0]?.pitch).toBe(52);
  });

  it("resolves hybrid scale degrees with chromatic accidentals", () => {
    const events = compileMotif(
      {
        ...MOTIF,
        pitchMode: "hybrid",
        notes: [{ at: 0, duration: 120, pitch: 1, accidental: 1 }],
      },
      HOST,
      {
        channel: 1,
        meterMode: "preserve",
        triggerPitch: 60,
        triggerVelocity: 100,
      },
    );
    expect(events[0]?.pitch).toBe(63);
  });

  it("keeps stored hybrid spelling when source intervals are unresolved", () => {
    const events = compileMotif(
      {
        ...MOTIF,
        pitchMode: "hybrid",
        sourcePitchContext: {
          anchorPitch: 60,
          scaleRootNote: 0,
          scaleName: "Custom Unknown Scale",
          scaleIntervals: null,
        },
        notes: [{ at: 0, duration: 120, pitch: 2, accidental: 1 }],
      },
      HOST,
      {
        channel: 1,
        meterMode: "preserve",
        triggerPitch: 60,
        triggerVelocity: 100,
      },
    );
    // degree 2 + accidental 1 in C major from C3 ➜ E + 1 = F
    expect(events[0]?.pitch).toBe(65);
  });

  it("respells Hybrid notes at playback to preserve the imported chromatic contour", () => {
    const offsets = [0, -2, 3, 2, 1, 0, -2, -4];
    const chromatic: Motif = {
      ...MOTIF,
      id: "hybrid-contour",
      pitchMode: "chromatic",
      sourcePitchContext: {
        anchorPitch: 48,
        scaleRootNote: 1,
        scaleName: "Major",
        scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
      },
      length: offsets.length * 120,
      notes: offsets.map((pitch, index) => ({
        at: index * 120,
        duration: 120,
        pitch,
      })),
    };
    const scale = convertMotifPitchMode(chromatic, "scale");
    const hybrid = convertMotifPitchMode(chromatic, "hybrid");
    const target = { ...HOST, rootNote: 10, scaleName: "Major" };
    const options = {
      channel: 1,
      meterMode: "preserve" as const,
      triggerPitch: 48,
      triggerVelocity: 100,
    };
    const noteOnPitches = (motif: Motif, host: HostContext): number[] =>
      compileMotif(motif, host, options)
        .filter(({ velocity }) => velocity > 0)
        .map(({ pitch }) => pitch);

    expect(hybrid.notes.map(({ pitch, accidental }) => [pitch, accidental ?? 0])).toEqual([
      [0, 0],
      [-1, 0],
      [2, 0],
      [1, 1],
      [1, 0],
      [0, 0],
      [-1, 0],
      [-2, 0],
    ]);
    expect(noteOnPitches(scale, target)).toEqual([48, 46, 51, 50, 50, 48, 46, 45]);
    expect(noteOnPitches(hybrid, target)).toEqual([48, 46, 51, 50, 49, 48, 46, 45]);
    expect(noteOnPitches(hybrid, { ...HOST, rootNote: 1, scaleName: "Major" })).toEqual([
      48, 46, 51, 50, 49, 48, 46, 44,
    ]);
    expect(convertMotifPitchMode(hybrid, "chromatic").notes.map(({ pitch }) => pitch)).toEqual(
      offsets,
    );
  });

  it("retargets C-major degrees into C minor while Scale ignores retained accidentals", () => {
    const events = compileMotif(
      {
        ...MOTIF,
        notes: [
          { at: 0, duration: 120, pitch: 0 },
          { at: 120, duration: 120, pitch: 2, accidental: 1 },
          { at: 240, duration: 120, pitch: 4 },
        ],
      },
      { ...HOST, scaleName: "Minor", scaleIntervals: [0, 2, 3, 5, 7, 8, 10] },
      {
        channel: 1,
        meterMode: "preserve",
        triggerPitch: 60,
        triggerVelocity: 100,
      },
    );
    expect(events.filter(({ velocity }) => velocity > 0).map(({ pitch }) => pitch)).toEqual([
      60, 63, 67,
    ]);
  });

  it("quantizes off-scale triggers before applying Scale degrees", () => {
    const events = compileMotif(
      MOTIF,
      { ...HOST, rootNote: 2, scaleName: "Major" },
      {
        channel: 1,
        meterMode: "preserve",
        triggerPitch: 60,
        triggerVelocity: 100,
      },
    );
    expect(events[0]?.pitch).toBe(62);
  });

  it("adds a quantized launch offset without altering phrase timing", () => {
    const events = compileMotif(MOTIF, HOST, {
      channel: 1,
      meterMode: "preserve",
      triggerPitch: 48,
      triggerVelocity: 100,
      launchOffsetTicks: PPQ / 2,
    });

    expect(events[0]?.offsetTicks).toBe(480);
    expect(events[1]?.offsetTicks).toBe(1440);
  });

  it("applies velocity curves, note overrides, scaling, offsets, and clamping", () => {
    const linearCurve = { inputMin: 1, inputMax: 127, outputMin: 10, outputMax: 110, exponent: 1 };
    const note = { at: 0, duration: 1, pitch: 0 };
    // Velocity curve maps input boundaries to output boundaries when no note override is set
    expect(resolveVelocity(note, { ...MOTIF, velocityCurve: linearCurve }, 1)).toBe(10);
    expect(resolveVelocity(note, { ...MOTIF, velocityCurve: linearCurve }, 127)).toBe(110);
    // No curve: trigger velocity passes through unchanged
    expect(resolveVelocity(note, MOTIF, 64)).toBe(64);

    const motif: Motif = {
      ...MOTIF,
      velocityCurve: { inputMin: 0, inputMax: 0, outputMin: 1, outputMax: 127, exponent: 0 },
    };
    expect(resolveVelocity({ at: 0, duration: 1, pitch: 0 }, motif, 100)).toBe(127);
    expect(
      resolveVelocity(
        {
          at: 0,
          duration: 1,
          pitch: 0,
          velocity: 10,
          velocityScale: 2,
          velocityOffset: -5,
        },
        motif,
        100,
      ),
    ).toBe(15);
    expect(
      resolveVelocity(
        {
          at: 0,
          duration: 1,
          pitch: 0,
          velocity: 127,
          velocityScale: 2,
        },
        motif,
        100,
      ),
    ).toBe(127);
  });

  it("extends durations for legato and matching ties", () => {
    const next = { at: 480, duration: 480, pitch: 0 };
    expect(effectiveDuration({ at: 0, duration: 120, pitch: 0, legato: true }, next, MOTIF)).toBe(
      480,
    );
    expect(effectiveDuration({ at: 0, duration: 600, pitch: 0, tie: true }, next, MOTIF)).toBe(960);
    expect(effectiveDuration({ at: 0, duration: 600, pitch: 1, tie: true }, next, MOTIF)).toBe(600);
    expect(effectiveDuration({ at: 0, duration: 100, pitch: 0, gate: 0 }, undefined, MOTIF)).toBe(
      1,
    );
  });

  it("skips sparse notes and sorts note-offs before simultaneous note-ons", () => {
    const notes: MotifNote[] = new Array(3);
    notes[0] = { at: -10, duration: 10, pitch: 0 };
    notes[2] = { at: 10, duration: 10, pitch: 2 };
    const events = compileMotif({ ...MOTIF, notes }, HOST, {
      channel: 30,
      meterMode: "preserve",
      triggerPitch: 60,
      triggerVelocity: 100,
      launchOffsetTicks: -20,
    });

    expect(events.length).toBe(4);
    expect(events.every(({ channel }) => channel === 16)).toBeTruthy();
    expect(events.map(({ offsetTicks, velocity }) => [offsetTicks, velocity])).toEqual([
      [0, 100],
      [10, 0],
      [10, 100],
      [20, 0],
    ]);
  });
});
