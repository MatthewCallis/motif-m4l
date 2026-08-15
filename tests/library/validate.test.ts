import { describe, it, expect } from "vitest";
import { validateMotif } from "../../src/library/validate.js";

describe("motif validation", () => {
  it("reports useful errors for malformed motif files", () => {
    const result = validateMotif({ schemaVersion: 1, id: "", notes: [] });
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes("id"))).toBeTruthy();
    expect(result.errors.some((error) => error.includes("sourceMeter"))).toBeTruthy();
    expect(result.errors.some((error) => error.includes("notes"))).toBeTruthy();
  });

  it("rejects non-object values and invalid required fields", () => {
    expect(validateMotif(null)).toEqual({ valid: false, errors: ["motif must be an object"] });

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

    expect(result.valid).toBe(false);
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
      expect(
        result.errors.some((error) => error.includes(fragment)),
        `missing ${fragment}`,
      ).toBeTruthy();
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

    expect(result.valid).toBe(false);
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
      expect(
        result.errors.some((error) => error.includes(fragment)),
        `missing ${fragment}`,
      ).toBeTruthy();
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

    expect(result.valid).toBe(false);
    for (const field of ["anchorPitch", "scaleRootNote", "scaleName", "scaleIntervals"]) {
      expect(
        result.errors.some((error) => error.includes(field)),
        `missing ${field}`,
      ).toBeTruthy();
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
    expect(badIntervals.valid).toBe(false);
    expect(
      badIntervals.errors.some((error) =>
        error.includes("scaleIntervals must be null or contain 1 to 12 integers"),
      ),
    ).toBeTruthy();
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
    expect(valid.valid).toBe(true);
    expect(valid.motif?.id).toBe(motif.id);
    expect(valid.motif?.triggerMode).toBe("hold-repeat");
    expect(valid.motif?.repeatRounding).toBe("1-bar");
    expect(valid.errors).toEqual([]);

    const tooShort = validateMotif({ ...motif, length: 959 });
    expect(tooShort.valid).toBe(false);
    expect(tooShort.errors.includes("notes[0] extends beyond motif length")).toBeTruthy();

    const badPerformance = validateMotif({
      ...motif,
      triggerMode: "repeat-forever",
      repeatRounding: "nearest",
    });
    expect(badPerformance.valid).toBe(false);
    expect(badPerformance.errors.some((error) => error.includes("triggerMode"))).toBeTruthy();
    expect(badPerformance.errors.some((error) => error.includes("repeatRounding"))).toBeTruthy();
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
    expect(valid.valid).toBe(true);
    expect(valid.motif?.tags).toEqual(["Demo", "Scale"]);

    const omitted = validateMotif({ ...base, tags: ["  ", ""] });
    expect(omitted.valid).toBe(false);
    expect(omitted.errors.some((error) => error.includes("tags[0]"))).toBeTruthy();

    const empty = validateMotif({ ...base, tags: [] });
    expect(empty.valid).toBe(true);
    expect(empty.motif?.tags).toBe(undefined);

    const badType = validateMotif({ ...base, tags: "demo" });
    expect(badType.valid).toBe(false);
    expect(badType.errors.some((error) => error.includes("tags must be an array"))).toBeTruthy();
  });
});
