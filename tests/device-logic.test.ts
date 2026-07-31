import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { HostContext, Motif } from "../src/core/types.js";
import {
  formatLibraryMotifStats,
  isStringEnumValue,
  launchOffsetTicksFor,
  libraryQueryFromAtoms,
  motifRepeatDelayFor,
  parseRetriggerMode,
  parseTempoMultiplier,
} from "../src/max/device-logic.js";
import {
  LAUNCH_QUANTIZATIONS,
  METER_MODES,
  PASS_THROUGH_POLICIES,
  PITCH_MODE_OVERRIDES,
  TRIGGER_MODES,
} from "../src/max/device-types.js";

const host: HostContext = {
  tempo: 120,
  rootNote: 0,
  scaleName: "Major",
  scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
  scaleMode: true,
  timeSignature: { numerator: 3, denominator: 4 },
  isPlaying: true,
  currentSongTime: 0.5,
};

const motif: Motif = {
  schemaVersion: 1,
  id: "device-logic",
  name: "Device Logic",
  description: "Pure device helper fixture.",
  pitchMode: "chromatic",
  sourceMeter: { numerator: 4, denominator: 4 },
  length: 3840,
  notes: [
    { at: 0, duration: 480, pitch: -2 },
    { at: 960, duration: 480, pitch: 4 },
  ],
};

describe("device pure logic", () => {
  it("formats Library stats for singular, integer, and fractional bars", () => {
    assert.equal(
      formatLibraryMotifStats(
        {
          notes: [{ pitch: 60, atTicks: 0, durationTicks: 480, velocity: 100 }],
          bars: 1,
          effectivePitchMode: "chromatic",
        },
        motif.sourceMeter,
      ),
      "1 note  •  1 bar  •  4/4 source  •  chromatic",
    );
    assert.equal(
      formatLibraryMotifStats(
        {
          notes: [
            { pitch: 60, atTicks: 0, durationTicks: 480, velocity: 80 },
            { pitch: 62, atTicks: 480, durationTicks: 480, velocity: 120 },
          ],
          bars: 1.5,
          effectivePitchMode: "scale",
        },
        { numerator: 6, denominator: 8 },
      ),
      "2 notes  •  1.5 bars  •  6/8 source  •  scale",
    );
  });

  it("calculates launch offsets and preserve/fit repeat delays", () => {
    assert.equal(launchOffsetTicksFor(host, "1/4"), 480);
    assert.equal(launchOffsetTicksFor({ ...host, isPlaying: false }, "1/4"), 0);
    assert.equal(launchOffsetTicksFor(host, "immediate"), 0);

    assert.equal(motifRepeatDelayFor(motif, "preserve", host, 1), 2000);
    assert.equal(motifRepeatDelayFor(motif, "fit-bar", host, 1), 1500);
    assert.equal(motifRepeatDelayFor(motif, "fit-bar", host, 2), 750);
    assert.equal(motifRepeatDelayFor({ ...motif, length: 0 }, "preserve", host, 1), 1);
  });

  it("normalizes Library queries, tempo ratios, retrigger modes, and enums", () => {
    assert.equal(libraryQueryFromAtoms(["  bass ", [" fills ", "", 2]]), "bass fills 2");
    assert.equal(libraryQueryFromAtoms([]), "");
    assert.equal(parseTempoMultiplier("1.5x"), 1.5);
    assert.equal(parseTempoMultiplier(2), 2);
    assert.equal(parseTempoMultiplier("3x"), undefined);
    assert.equal(parseRetriggerMode(1), "replace");
    assert.equal(parseRetriggerMode(0), "overlap");
    assert.equal(parseRetriggerMode("replace"), "replace");
    assert.equal(parseRetriggerMode("invalid"), undefined);

    assert.equal(isStringEnumValue("hybrid", PITCH_MODE_OVERRIDES), true);
    assert.equal(isStringEnumValue("fit-bar", METER_MODES), true);
    assert.equal(isStringEnumValue("hold-repeat", TRIGGER_MODES), true);
    assert.equal(isStringEnumValue("bar", LAUNCH_QUANTIZATIONS), true);
    assert.equal(isStringEnumValue("non-triggers", PASS_THROUGH_POLICIES), true);
    assert.equal(isStringEnumValue("invalid", PASS_THROUGH_POLICIES), false);
  });
});
