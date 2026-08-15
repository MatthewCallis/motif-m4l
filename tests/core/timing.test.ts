import { describe, it, expect } from "vitest";
import {
  barLengthTicks,
  quantizationTicks,
  roundRepeatLengthTicks,
  ticksToMilliseconds,
  ticksUntilNextBoundary,
} from "../../src/core/timing.js";
import { PPQ } from "../../src/core/types.js";

describe("timing utilities", () => {
  it("computes bar length for common and compound meters", () => {
    expect(barLengthTicks({ numerator: 4, denominator: 4 })).toBe(PPQ * 4);
    expect(barLengthTicks({ numerator: 6, denominator: 8 })).toBe(PPQ * 3);
  });

  it("computes launch grids and next boundaries", () => {
    const signature = { numerator: 4, denominator: 4 };
    expect(quantizationTicks("1/16", signature)).toBe(240);
    expect(quantizationTicks("bar", signature)).toBe(3840);
    expect(ticksUntilNextBoundary(1000, 960)).toBe(920);
    expect(ticksUntilNextBoundary(1920, 960)).toBe(0);
  });

  it("rounds repeat lengths upward to source-bar subdivisions without overlap", () => {
    const fourFour = { numerator: 4, denominator: 4 };
    expect(roundRepeatLengthTicks(3360, fourFour, "exact")).toBe(3360);
    expect(roundRepeatLengthTicks(3360, fourFour, "1/4-bar")).toBe(3840);
    expect(roundRepeatLengthTicks(3360, fourFour, "1/2-bar")).toBe(3840);
    expect(roundRepeatLengthTicks(3360, fourFour, "1-bar")).toBe(3840);
    expect(roundRepeatLengthTicks(100, fourFour, "1/4-bar")).toBe(960);
    // Regression: Exact.mid repeats every 948 ticks at 96 PPQ, or 9480 motif
    // ticks. One-bar rounding must advance to 3 bars instead of falling to 2.
    expect(roundRepeatLengthTicks(9480, fourFour, "1-bar")).toBe(11520);
    expect(roundRepeatLengthTicks(2000, { numerator: 6, denominator: 8 }, "1/2-bar")).toBe(2880);
  });

  it("covers every quantization and safely handles invalid timing inputs", () => {
    const signature = { numerator: 3, denominator: 4 };
    expect(quantizationTicks("1/8", signature)).toBe(PPQ / 2);
    expect(quantizationTicks("1/4", signature)).toBe(PPQ);
    expect(quantizationTicks("immediate", signature)).toBe(0);
    expect(ticksToMilliseconds(PPQ, 60)).toBe(1000);
    expect(ticksToMilliseconds(PPQ, 0)).toBe(500);
    expect(ticksToMilliseconds(PPQ, Number.NaN)).toBe(500);
    expect(ticksUntilNextBoundary(-100, PPQ)).toBe(100);
    expect(ticksUntilNextBoundary(Number.NaN, PPQ)).toBe(0);
    expect(ticksUntilNextBoundary(100, 0)).toBe(0);
  });
});
