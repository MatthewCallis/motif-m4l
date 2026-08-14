import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateMotif } from "../src/library/validate.js";

describe("motif validation", () => {
  it("reports useful errors for malformed motif files", () => {
    const result = validateMotif({ schemaVersion: 1, id: "", notes: [] });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((error) => error.includes("id")));
    assert.ok(result.errors.some((error) => error.includes("sourceMeter")));
    assert.ok(result.errors.some((error) => error.includes("notes")));
  });

  it("rejects non-object values and invalid required fields", () => {
    assert.deepEqual(validateMotif(null), { valid: false, errors: ["motif must be an object"] });

    const result = validateMotif({
      schemaVersion: 2,
      id: "invalid",
      name: 42,
      description: "",
      pitchMode: "absolute",
      sourceMeter: { numerator: 0, denominator: 3 },
      length: 0,
      defaultGate: 0,
      velocityCurve: "linear",
      notes: [null],
    });

    assert.equal(result.valid, false);
    for (const fragment of [
      "schemaVersion",
      "name",
      "description",
      "pitchMode",
      "sourceMeter.numerator",
      "sourceMeter.denominator",
      "length",
      "defaultGate",
      "velocityCurve",
      "notes[0]",
    ]) {
      assert.ok(
        result.errors.some((error) => error.includes(fragment)),
        `missing ${fragment}`,
      );
    }
  });

  it("validates optional curve and note fields", () => {
    const result = validateMotif({
      schemaVersion: 1,
      id: "invalid-optionals",
      name: "Invalid Optionals",
      description: "Exercises every optional validator.",
      pitchMode: "hybrid",
      sourceMeter: { numerator: 4, denominator: 4 },
      length: 100,
      velocityCurve: {
        inputMin: "quiet",
        inputMax: Number.NaN,
        outputMin: null,
        outputMax: {},
        exponent: 0,
      },
      notes: [
        {
          at: -1,
          duration: 0,
          pitch: "C3",
          accidental: Number.NaN,
          velocity: 128,
          velocityOffset: "loud",
          velocityScale: -1,
          gate: 0,
          legato: "yes",
          tie: 1,
        },
      ],
    });

    assert.equal(result.valid, false);
    for (const fragment of [
      "velocityCurve.inputMin",
      "velocityCurve.inputMax",
      "velocityCurve.outputMin",
      "velocityCurve.outputMax",
      "velocityCurve.exponent",
      "notes[0].at",
      "notes[0].duration",
      "notes[0].pitch",
      "notes[0].accidental",
      "notes[0].velocity",
      "notes[0].velocityOffset",
      "notes[0].velocityScale",
      "notes[0].gate",
      "notes[0].legato",
      "notes[0].tie",
    ]) {
      assert.ok(
        result.errors.some((error) => error.includes(fragment)),
        `missing ${fragment}`,
      );
    }
  });

  it("validates source pitch context without changing schema version", () => {
    const result = validateMotif({
      schemaVersion: 1,
      id: "invalid-source",
      name: "Invalid Source",
      description: "Invalid source pitch context.",
      pitchMode: "chromatic",
      sourcePitchContext: {
        anchorPitch: 128,
        scaleRootNote: -1,
        scaleName: "",
        scaleIntervals: [2, 0, 2],
      },
      sourceMeter: { numerator: 4, denominator: 4 },
      length: 1,
      notes: [{ at: 0, duration: 1, pitch: 0 }],
    });

    assert.equal(result.valid, false);
    for (const field of ["anchorPitch", "scaleRootNote", "scaleName", "scaleIntervals"]) {
      assert.ok(
        result.errors.some((error) => error.includes(field)),
        `missing ${field}`,
      );
    }

    const badIntervals = validateMotif({
      schemaVersion: 1,
      id: "bad-intervals",
      name: "Bad Intervals",
      description: "Non-array intervals.",
      pitchMode: "chromatic",
      sourcePitchContext: {
        anchorPitch: 60,
        scaleRootNote: 0,
        scaleName: "Major",
        scaleIntervals: "Major",
      },
      sourceMeter: { numerator: 4, denominator: 4 },
      length: 1,
      notes: [{ at: 0, duration: 1, pitch: 0 }],
    });
    assert.equal(badIntervals.valid, false);
    assert.ok(
      badIntervals.errors.some((error) =>
        error.includes("scaleIntervals must be null or contain 1 to 12 integers"),
      ),
    );
  });

  it("returns a typed motif for complete valid input and catches notes beyond its length", () => {
    const motif = {
      schemaVersion: 1,
      id: "complete",
      name: "Complete",
      description: "A complete valid motif.",
      pitchMode: "scale",
      sourcePitchContext: {
        anchorPitch: 60,
        scaleRootNote: 0,
        scaleName: "Major",
        scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
      },
      sourceMeter: { numerator: 7, denominator: 8 },
      length: 960,
      triggerMode: "hold-repeat",
      repeatRounding: "1-bar",
      defaultGate: 0.9,
      velocityCurve: { inputMin: 1, inputMax: 127, outputMin: 10, outputMax: 120, exponent: 1.2 },
      notes: [{ at: 0, duration: 960, pitch: 0, velocity: 100, legato: false, tie: false }],
    };

    const valid = validateMotif(motif);
    assert.equal(valid.valid, true);
    assert.equal(valid.motif?.id, motif.id);
    assert.equal(valid.motif?.triggerMode, "hold-repeat");
    assert.equal(valid.motif?.repeatRounding, "1-bar");
    assert.deepEqual(valid.errors, []);

    const tooShort = validateMotif({ ...motif, length: 959 });
    assert.equal(tooShort.valid, false);
    assert.ok(tooShort.errors.includes("notes[0] extends beyond motif length"));

    const badPerformance = validateMotif({
      ...motif,
      triggerMode: "repeat-forever",
      repeatRounding: "nearest",
    });
    assert.equal(badPerformance.valid, false);
    assert.ok(badPerformance.errors.some((error) => error.includes("triggerMode")));
    assert.ok(badPerformance.errors.some((error) => error.includes("repeatRounding")));
  });

  it("normalizes optional tags and rejects invalid tag values", () => {
    const base = {
      schemaVersion: 1,
      id: "tagged",
      name: "Tagged",
      description: "Has tags.",
      pitchMode: "chromatic",
      sourcePitchContext: {
        anchorPitch: 60,
        scaleRootNote: 0,
        scaleName: "Major",
        scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
      },
      sourceMeter: { numerator: 4, denominator: 4 },
      length: 480,
      notes: [{ at: 0, duration: 480, pitch: 0 }],
    };

    const valid = validateMotif({ ...base, tags: [" Demo ", "demo", "Scale"] });
    assert.equal(valid.valid, true);
    assert.deepEqual(valid.motif?.tags, ["Demo", "Scale"]);

    const omitted = validateMotif({ ...base, tags: ["  ", ""] });
    assert.equal(omitted.valid, false);
    assert.ok(omitted.errors.some((error) => error.includes("tags[0]")));

    const empty = validateMotif({ ...base, tags: [] });
    assert.equal(empty.valid, true);
    assert.equal(empty.motif?.tags, undefined);

    const badType = validateMotif({ ...base, tags: "demo" });
    assert.equal(badType.valid, false);
    assert.ok(badType.errors.some((error) => error.includes("tags must be an array")));
  });
});
