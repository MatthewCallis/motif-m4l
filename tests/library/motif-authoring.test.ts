import assert from "node:assert/strict";
import { describe, it } from "node:test";
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
    assert.ok(motif);
    const result = applyMotifProperties(motif, {
      name: "Edited",
      description: "Description",
      pitchMode: "hybrid",
      sourceMeter: { numerator: 3, denominator: 4 },
      defaultGate: 0.75,
      velocityCurve: { inputMin: 1, exponent: 2 },
    });

    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }
    assert.equal(result.changed, true);
    assert.equal(result.value.name, "Edited");
    assert.equal(result.value.pitchMode, "hybrid");
    assert.equal(motif.name, "Chromatic Turn");

    const unchanged = applyMotifProperties(motif, {});
    assert.equal(unchanged.ok && unchanged.changed, false);

    const tagged = applyMotifProperties(motif, { tags: [" Demo ", "demo", "lick"] });
    assert.equal(tagged.ok, true);
    if (!tagged.ok) {
      return;
    }
    assert.deepEqual(tagged.value.tags, ["Demo", "lick"]);
    const cleared = applyMotifProperties(tagged.value, { tags: [] });
    assert.equal(cleared.ok, true);
    if (!cleared.ok) {
      return;
    }
    assert.equal(cleared.value.tags, undefined);
    const clearedNull = applyMotifProperties(tagged.value, { tags: null });
    assert.equal(clearedNull.ok, true);
    if (!clearedNull.ok) {
      return;
    }
    assert.equal(clearedNull.value.tags, undefined);
    const preserved = applyMotifProperties(tagged.value, { name: tagged.value.name });
    assert.equal(preserved.ok, true);
    if (!preserved.ok) {
      return;
    }
    assert.deepEqual(preserved.value.tags, ["Demo", "lick"]);
  });

  it("rejects invalid motif properties atomically", () => {
    const motif = new MotifStore().get("chromatic-turn");
    assert.ok(motif);
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
            ...motif.sourcePitchContext,
            anchorPitch: 128,
          },
        },
        "anchorPitch",
      ],
      [
        {
          sourcePitchContext: {
            ...motif.sourcePitchContext,
            scaleRootNote: 12,
          },
        },
        "scaleRootNote",
      ],
      [
        {
          sourcePitchContext: {
            ...motif.sourcePitchContext,
            scaleName: "   ",
          },
        },
        "scaleName",
      ],
      [
        {
          sourcePitchContext: {
            ...motif.sourcePitchContext,
            scaleIntervals: "Major",
          },
        },
        "array or null",
      ],
      [
        {
          sourcePitchContext: {
            ...motif.sourcePitchContext,
            scaleIntervals: [0, 2, 2],
          },
        },
        "sorted, unique",
      ],
      [
        {
          sourcePitchContext: {
            ...motif.sourcePitchContext,
            scaleIntervals: [1, 2, 4],
          },
        },
        "starting at 0",
      ],
    ] as const) {
      const result = applyMotifProperties(motif, value);
      assert.equal(result.ok, false);
      if (!result.ok) {
        assert.match(result.error, new RegExp(message));
      }
    }
  });

  it("validates sourcePitchContext updates and pitch-mode conversion failures", () => {
    const motif = new MotifStore().get("chromatic-turn");
    assert.ok(motif);

    const unchanged = applyMotifProperties(motif, {
      sourcePitchContext: { ...motif.sourcePitchContext },
    });
    assert.equal(unchanged.ok && unchanged.changed, false);

    const withNullIntervals = applyMotifProperties(motif, {
      sourcePitchContext: {
        ...motif.sourcePitchContext,
        scaleIntervals: null,
      },
    });
    assert.equal(withNullIntervals.ok, true);
    if (!withNullIntervals.ok) {
      return;
    }
    assert.equal(withNullIntervals.changed, true);
    assert.equal(withNullIntervals.value.sourcePitchContext.scaleIntervals, null);

    const clearedCurve = applyMotifProperties(
      { ...motif, velocityCurve: { exponent: 1.5 } },
      { velocityCurve: null },
    );
    assert.equal(clearedCurve.ok, true);
    if (!clearedCurve.ok) {
      return;
    }
    assert.equal(clearedCurve.value.velocityCurve, undefined);

    const unresolved = applyMotifProperties(motif, {
      pitchMode: "scale",
      sourcePitchContext: {
        ...motif.sourcePitchContext,
        scaleIntervals: null,
        scaleName: "Custom Unknown Scale",
      },
    });
    assert.equal(unresolved.ok, false);
    if (!unresolved.ok) {
      assert.match(unresolved.error, /source scale intervals are unresolved/);
    }

    assert.equal(updateMotifNote(motif, 0, "bogus" as "pitch", 1).ok, false);
  });

  it("edits, appends, and removes motif notes", () => {
    const motif = new MotifStore().get("chromatic-turn");
    assert.ok(motif);
    const pitch = updateMotifNote(motif, 0, "pitch", -3);
    assert.equal(pitch.ok, true);
    if (!pitch.ok) {
      return;
    }
    assert.equal(pitch.notes[0]?.pitch, -3);
    assert.notEqual(pitch.notes, motif.notes);

    const legato = updateMotifNote(motif, 0, "legato", true);
    assert.equal(legato.ok && legato.notes[0]?.legato, true);
    assert.equal(updateMotifNote(motif, -1, "pitch", 1).ok, false);
    assert.equal(updateMotifNote(motif, 0, "velocity", 128).ok, false);

    const appended = appendMotifNote(motif, 512);
    assert.equal(appended.ok, true);
    if (!appended.ok) {
      return;
    }
    assert.equal(appended.notes.length, motif.notes.length + 1);
    assert.equal(appendMotifNote(motif, motif.notes.length).ok, false);
    assert.equal(removeMotifNote(motif, -1).ok, false);
    assert.equal(removeMotifNote(motif, 0).ok, true);
  });

  it("normalizes every editable note field and rejects invalid numeric values", () => {
    const motif = new MotifStore().get("chromatic-turn");
    assert.ok(motif);
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
      assert.equal(updateMotifNote(motif, 0, field, value).ok, true, field);
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
      assert.equal(updateMotifNote(motif, 0, field, value).ok, false, field);
    }
  });
});
