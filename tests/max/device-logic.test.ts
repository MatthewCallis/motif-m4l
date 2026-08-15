import { describe, it, expect } from "vitest";
import {
  isStringEnumValue,
  libraryQueryFromAtoms,
  parseRetriggerMode,
  parseTempoMultiplier,
} from "../../src/max/device-logic.js";
import {
  LAUNCH_QUANTIZATIONS,
  METER_MODES,
  PASS_THROUGH_POLICIES,
  PITCH_MODE_OVERRIDES,
  TRIGGER_MODES,
} from "../../src/max/device-types.js";

describe("device pure logic", () => {
  it("normalizes Library queries, tempo ratios, retrigger modes, and enums", () => {
    expect(libraryQueryFromAtoms(["  bass ", [" fills ", "", 2]])).toBe("bass fills 2");
    expect(libraryQueryFromAtoms([])).toBe("");
    expect(parseTempoMultiplier("1.5x")).toBe(1.5);
    expect(parseTempoMultiplier(2)).toBe(2);
    expect(parseTempoMultiplier("3x")).toBe(undefined);
    expect(parseRetriggerMode(1)).toBe("replace");
    expect(parseRetriggerMode(0)).toBe("overlap");
    expect(parseRetriggerMode("replace")).toBe("replace");
    expect(parseRetriggerMode("invalid")).toBe(undefined);

    expect(isStringEnumValue("hybrid", PITCH_MODE_OVERRIDES)).toBe(true);
    expect(isStringEnumValue("fit-bar", METER_MODES)).toBe(true);
    expect(isStringEnumValue("hold-repeat", TRIGGER_MODES)).toBe(true);
    expect(isStringEnumValue("bar", LAUNCH_QUANTIZATIONS)).toBe(true);
    expect(isStringEnumValue("non-triggers", PASS_THROUGH_POLICIES)).toBe(true);
    expect(isStringEnumValue("invalid", PASS_THROUGH_POLICIES)).toBe(false);
  });
});
