import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyVelocityCurve,
  compileMotif,
  effectiveDuration,
  resolveVelocity,
} from "../src/core/compile-motif.js";
import { PPQ, type HostContext, type Motif, type MotifNote } from "../src/core/types.js";

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
  sourceMeter: { numerator: 4, denominator: 4 },
  length: PPQ,
  notes: [{ at: 0, duration: PPQ, pitch: 2 }],
};

describe("compileMotif", () => {
  it("compiles note-on and note-off events", () => {
    assert.deepEqual(
      compileMotif(MOTIF, HOST, {
        channel: 2,
        meterMode: "preserve",
        triggerPitch: 48,
        triggerVelocity: 90,
        instanceId: 7,
      }),
      [
        { pitch: 52, velocity: 90, channel: 2, offsetTicks: 0, offsetMs: 0, instanceId: 7 },
        { pitch: 52, velocity: 0, channel: 2, offsetTicks: 960, offsetMs: 500, instanceId: 7 },
      ],
    );
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

    assert.equal(events[1]?.offsetTicks, 720);
    assert.equal(events[1]?.offsetMs, 375);
  });

  it("can override a scale motif with chromatic intervals", () => {
    const events = compileMotif(MOTIF, HOST, {
      channel: 1,
      meterMode: "preserve",
      pitchMode: "chromatic",
      triggerPitch: 48,
      triggerVelocity: 100,
    });

    assert.equal(events[0]?.pitch, 50);
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
    assert.equal(events[0]?.pitch, 63);
  });

  it("adds a quantized launch offset without altering phrase timing", () => {
    const events = compileMotif(MOTIF, HOST, {
      channel: 1,
      meterMode: "preserve",
      triggerPitch: 48,
      triggerVelocity: 100,
      launchOffsetTicks: PPQ / 2,
    });

    assert.equal(events[0]?.offsetTicks, 480);
    assert.equal(events[1]?.offsetTicks, 1440);
  });

  it("applies velocity curves, note overrides, scaling, offsets, and clamping", () => {
    assert.equal(applyVelocityCurve(64), 64);
    assert.equal(
      applyVelocityCurve(1, { inputMin: 1, inputMax: 127, outputMin: 10, outputMax: 110 }),
      10,
    );
    assert.equal(
      applyVelocityCurve(127, { inputMin: 1, inputMax: 127, outputMin: 10, outputMax: 110 }),
      110,
    );

    const motif: Motif = {
      ...MOTIF,
      velocityCurve: { inputMin: 0, inputMax: 0, outputMin: 1, outputMax: 127, exponent: 0 },
    };
    assert.equal(resolveVelocity({ at: 0, duration: 1, pitch: 0 }, motif, 100), 127);
    assert.equal(
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
      15,
    );
    assert.equal(
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
      127,
    );
  });

  it("extends durations for legato and matching ties", () => {
    const next = { at: 480, duration: 480, pitch: 0 };
    assert.equal(
      effectiveDuration({ at: 0, duration: 120, pitch: 0, legato: true }, next, MOTIF),
      480,
    );
    assert.equal(
      effectiveDuration({ at: 0, duration: 600, pitch: 0, tie: true }, next, MOTIF),
      960,
    );
    assert.equal(
      effectiveDuration({ at: 0, duration: 600, pitch: 1, tie: true }, next, MOTIF),
      600,
    );
    assert.equal(
      effectiveDuration({ at: 0, duration: 100, pitch: 0, gate: 0 }, undefined, MOTIF),
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

    assert.equal(events.length, 4);
    assert.ok(events.every(({ channel }) => channel === 16));
    assert.deepEqual(
      events.map(({ offsetTicks, velocity }) => [offsetTicks, velocity]),
      [
        [0, 100],
        [10, 0],
        [10, 100],
        [20, 0],
      ],
    );
  });
});
