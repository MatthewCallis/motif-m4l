import { describe, it, expect } from "vitest";
import {
  appendMotifNote,
  applyMotifProperties,
  removeMotifNote,
  updateMotifNote,
} from "../../src/library/motif-authoring.js";
import { MotifStore } from "../../src/library/store.js";

describe("motif authoring", () => {
  it("applies motif properties without mutating the source", () => {
    const motif = new MotifStore().get("chromatic-turn");
    expect(motif).toBeTruthy();
    const result = applyMotifProperties(motif!, {
      name: "Edited",
      description: "Description",
      pitchMode: "hybrid",
      sourceMeter: { numerator: 3, denominator: 4 },
      defaultGate: 0.75,
      velocityCurve: { inputMin: 1, exponent: 2 },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.changed).toBe(true);
    expect(result.value.name).toBe("Edited");
    expect(result.value.pitchMode).toBe("hybrid");
    expect(motif!.name).toBe("Chromatic Turn");

    const unchanged = applyMotifProperties(motif!, {});
    expect(unchanged.ok && unchanged.changed).toBe(false);

    const tagged = applyMotifProperties(motif!, { tags: [" Demo ", "demo", "lick"] });
    expect(tagged.ok).toBe(true);
    if (!tagged.ok) {
      return;
    }
    expect(tagged.value.tags).toEqual(["Demo", "lick"]);
    const cleared = applyMotifProperties(tagged.value, { tags: [] });
    expect(cleared.ok).toBe(true);
    if (!cleared.ok) {
      return;
    }
    expect(cleared.value.tags).toBe(undefined);
    const clearedNull = applyMotifProperties(tagged.value, { tags: null });
    expect(clearedNull.ok).toBe(true);
    if (!clearedNull.ok) {
      return;
    }
    expect(clearedNull.value.tags).toBe(undefined);
    const preserved = applyMotifProperties(tagged.value, { name: tagged.value.name });
    expect(preserved.ok).toBe(true);
    if (!preserved.ok) {
      return;
    }
    expect(preserved.value.tags).toEqual(["Demo", "lick"]);
  });

  it("rejects invalid motif properties atomically", () => {
    const motif = new MotifStore().get("chromatic-turn");
    expect(motif).toBeTruthy();
    for (const [value, message] of [
      [null, "object"],
      [{ id: "changed" }, "generated"],
      [{ schemaVersion: 99 }, "read-only"],
      [{ length: 99 }, "derived"],
      [{ name: "" }, "cannot be empty"],
      [{ name: { nested: true } }, "must be text"],
      [{ pitchMode: "invalid" }, "pitchMode"],
      [{ sourceMeter: null }, "sourceMeter"],
      [{ sourceMeter: { numerator: 0, denominator: 4 } }, "numerator"],
      [{ sourceMeter: { numerator: 4, denominator: 3 } }, "denominator"],
      [{ defaultGate: 0 }, "greater than zero"],
      [{ velocityCurve: "invalid" }, "velocityCurve"],
      [{ velocityCurve: { exponent: 0 } }, "greater than zero"],
      [{ tags: "demo" }, "tags must be an array"],
      [{ tags: [""] }, "cannot be empty"],
      [{ tags: [1] }, "must be a string"],
      [{ sourcePitchContext: null }, "sourcePitchContext must be an object"],
      [
        {
          sourcePitchContext: {
            ...motif!.sourcePitchContext,
            anchorPitch: 128,
          },
        },
        "anchorPitch",
      ],
      [
        {
          sourcePitchContext: {
            ...motif!.sourcePitchContext,
            scaleRootNote: 12,
          },
        },
        "scaleRootNote",
      ],
      [
        {
          sourcePitchContext: {
            ...motif!.sourcePitchContext,
            scaleName: "   ",
          },
        },
        "scaleName",
      ],
      [
        {
          sourcePitchContext: {
            ...motif!.sourcePitchContext,
            scaleIntervals: "Major",
          },
        },
        "array or null",
      ],
      [
        {
          sourcePitchContext: {
            ...motif!.sourcePitchContext,
            scaleIntervals: [0, 2, 2],
          },
        },
        "sorted, unique",
      ],
      [
        {
          sourcePitchContext: {
            ...motif!.sourcePitchContext,
            scaleIntervals: [1, 2, 4],
          },
        },
        "starting at 0",
      ],
    ] as const) {
      const result = applyMotifProperties(motif!, value);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toMatch(new RegExp(message));
      }
    }
  });

  it("validates sourcePitchContext updates and pitch-mode conversion failures", () => {
    const motif = new MotifStore().get("chromatic-turn");
    expect(motif).toBeTruthy();

    const unchanged = applyMotifProperties(motif!, {
      sourcePitchContext: { ...motif!.sourcePitchContext },
    });
    expect(unchanged.ok && unchanged.changed).toBe(false);

    const withNullIntervals = applyMotifProperties(motif!, {
      sourcePitchContext: {
        ...motif!.sourcePitchContext,
        scaleIntervals: null,
      },
    });
    expect(withNullIntervals.ok).toBe(true);
    if (!withNullIntervals.ok) {
      return;
    }
    expect(withNullIntervals.changed).toBe(true);
    expect(withNullIntervals.value.sourcePitchContext.scaleIntervals).toBe(null);

    const clearedCurve = applyMotifProperties(
      { ...motif!, velocityCurve: { exponent: 1.5 } },
      { velocityCurve: null },
    );
    expect(clearedCurve.ok).toBe(true);
    if (!clearedCurve.ok) {
      return;
    }
    expect(clearedCurve.value.velocityCurve).toBe(undefined);

    const unresolved = applyMotifProperties(motif!, {
      pitchMode: "scale",
      sourcePitchContext: {
        ...motif!.sourcePitchContext,
        scaleIntervals: null,
        scaleName: "Custom Unknown Scale",
      },
    });
    expect(unresolved.ok).toBe(false);
    if (!unresolved.ok) {
      expect(unresolved.error).toMatch(/source scale intervals are unresolved/);
    }

    expect(updateMotifNote(motif!, 0, "bogus" as "pitch", 1).ok).toBe(false);
  });

  it("edits, appends, and removes motif notes", () => {
    const motif = new MotifStore().get("chromatic-turn");
    expect(motif).toBeTruthy();
    const pitch = updateMotifNote(motif!, 0, "pitch", -3);
    expect(pitch.ok).toBe(true);
    if (!pitch.ok) {
      return;
    }
    expect(pitch.notes[0]?.pitch).toBe(-3);
    expect(pitch.notes).not.toBe(motif!.notes);

    const legato = updateMotifNote(motif!, 0, "legato", true);
    expect(legato.ok && legato.notes[0]?.legato).toBe(true);
    expect(updateMotifNote(motif!, -1, "pitch", 1).ok).toBe(false);
    expect(updateMotifNote(motif!, 0, "velocity", 128).ok).toBe(false);

    const appended = appendMotifNote(motif!, 512);
    expect(appended.ok).toBe(true);
    if (!appended.ok) {
      return;
    }
    expect(appended.notes.length).toBe(motif!.notes.length + 1);
    expect(appendMotifNote(motif!, motif!.notes.length).ok).toBe(false);
    expect(removeMotifNote(motif!, -1).ok).toBe(false);
    expect(removeMotifNote(motif!, 0).ok).toBe(true);
  });

  it("normalizes every editable note field and rejects invalid numeric values", () => {
    const motif = new MotifStore().get("chromatic-turn");
    expect(motif).toBeTruthy();
    const accepted: Array<readonly [Parameters<typeof updateMotifNote>[2], unknown]> = [
      ["accidental", 1],
      ["accidental", null],
      ["at", 120],
      ["duration", 120],
      ["gate", 0.5],
      ["gate", null],
      ["velocity", 64],
      ["velocity", null],
      ["velocityOffset", -5],
      ["velocityOffset", 0],
      ["velocityScale", 0.5],
      ["velocityScale", null],
      ["tie", true],
      ["tie", false],
    ];
    for (const [field, value] of accepted) {
      expect(updateMotifNote(motif!, 0, field, value).ok).toBe(true);
    }

    for (const [field, value] of [
      ["pitch", null],
      ["pitch", "invalid"],
      ["at", -1],
      ["duration", 0],
      ["gate", 0],
      ["velocity", 1.5],
      ["velocityScale", -1],
    ] as const) {
      expect(updateMotifNote(motif!, 0, field, value).ok).toBe(false);
    }
  });
});
