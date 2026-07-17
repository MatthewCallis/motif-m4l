import assert from 'node:assert/strict';
import test from 'node:test';
import { barLengthTicks, quantizationTicks, ticksUntilNextBoundary } from '../src/core/timing.js';
import { PPQ } from '../src/core/types.js';

test('computes bar length for common and compound meters', () => {
  assert.equal(barLengthTicks({ numerator: 4, denominator: 4 }), PPQ * 4);
  assert.equal(barLengthTicks({ numerator: 6, denominator: 8 }), PPQ * 3);
});

test('computes launch grids and next boundaries', () => {
  const signature = { numerator: 4, denominator: 4 };
  assert.equal(quantizationTicks('1/16', signature), 240);
  assert.equal(quantizationTicks('bar', signature), 3840);
  assert.equal(ticksUntilNextBoundary(1000, 960), 920);
  assert.equal(ticksUntilNextBoundary(1920, 960), 0);
});
