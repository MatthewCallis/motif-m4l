import { describe, expect, it } from "vitest";
import { clamp, floorDiv, mod } from "../../src/core/math.js";

describe("math helpers", () => {
  it("clamps inclusive bounds and leaves interior values alone", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });

  it("returns a non-negative modulo remainder", () => {
    expect(mod(5, 3)).toBe(2);
    expect(mod(-1, 12)).toBe(11);
    expect(mod(12, 12)).toBe(0);
  });

  it("divides toward negative infinity", () => {
    expect(floorDiv(7, 3)).toBe(2);
    expect(floorDiv(-7, 3)).toBe(-3);
    expect(floorDiv(-6, 3)).toBe(-2);
  });
});
