import assert from "node:assert/strict";
import { describe, it } from "node:test";
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
    assert.equal(barLengthTicks({ numerator: 4, denominator: 4 }), PPQ * 4);
    assert.equal(barLengthTicks({ numerator: 6, denominator: 8 }), PPQ * 3);
  });

  it("computes launch grids and next boundaries", () => {
    const signature = { numerator: 4, denominator: 4 };
    assert.equal(quantizationTicks("1/16", signature), 240);
    assert.equal(quantizationTicks("bar", signature), 3840);
    assert.equal(ticksUntilNextBoundary(1000, 960), 920);
    assert.equal(ticksUntilNextBoundary(1920, 960), 0);
  });

  it("rounds repeat lengths upward to source-bar subdivisions without overlap", () => {
    const fourFour = { numerator: 4, denominator: 4 };
    assert.equal(roundRepeatLengthTicks(3360, fourFour, "exact"), 3360);
    assert.equal(roundRepeatLengthTicks(3360, fourFour, "1/4-bar"), 3840);
    assert.equal(roundRepeatLengthTicks(3360, fourFour, "1/2-bar"), 3840);
    assert.equal(roundRepeatLengthTicks(3360, fourFour, "1-bar"), 3840);
    assert.equal(roundRepeatLengthTicks(100, fourFour, "1/4-bar"), 960);
    // Regression: Exact.mid repeats every 948 ticks at 96 PPQ, or 9480 motif
    // ticks. One-bar rounding must advance to 3 bars instead of falling to 2.
    assert.equal(roundRepeatLengthTicks(9480, fourFour, "1-bar"), 11520);
    assert.equal(roundRepeatLengthTicks(2000, { numerator: 6, denominator: 8 }, "1/2-bar"), 2880);
  });

  it("covers every quantization and safely handles invalid timing inputs", () => {
    const signature = { numerator: 3, denominator: 4 };
    assert.equal(quantizationTicks("1/8", signature), PPQ / 2);
    assert.equal(quantizationTicks("1/4", signature), PPQ);
    assert.equal(quantizationTicks("immediate", signature), 0);
    assert.equal(ticksToMilliseconds(PPQ, 60), 1000);
    assert.equal(ticksToMilliseconds(PPQ, 0), 500);
    assert.equal(ticksToMilliseconds(PPQ, Number.NaN), 500);
    assert.equal(ticksUntilNextBoundary(-100, PPQ), 100);
    assert.equal(ticksUntilNextBoundary(Number.NaN, PPQ), 0);
    assert.equal(ticksUntilNextBoundary(100, 0), 0);
  });
});
