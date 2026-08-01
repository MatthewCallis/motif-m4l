import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isStringEnumValue,
  libraryQueryFromAtoms,
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

describe("device pure logic", () => {
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
