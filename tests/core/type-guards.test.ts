import { describe, it, expect } from "vitest";
import { hasOwn, isRecord, jsonValuesEqual, primitiveText } from "../../src/core/type-guards.js";

describe("type guards", () => {
  it("narrows records and converts only primitive text", () => {
    expect(isRecord({ value: 1 })).toBe(true);
    expect(isRecord([])).toBe(false);
    expect(isRecord(null)).toBe(false);
    expect(hasOwn({ value: undefined }, "value")).toBe(true);
    expect(hasOwn({}, "value")).toBe(false);
    expect(primitiveText(12)).toBe("12");
    expect(primitiveText(false)).toBe("false");
    expect(primitiveText({}, "fallback")).toBe("fallback");
    expect(jsonValuesEqual({ one: 1, two: [2] }, { two: [2], one: 1 })).toBe(true);
    expect(jsonValuesEqual({ one: 1 }, { one: 2 })).toBe(false);
  });
});
