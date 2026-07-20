import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  normalizeScaleIntervals,
  transposeByScaleDegree,
  transposeHybrid,
} from '../src/core/pitch.js';

const MAJOR = [0, 2, 4, 5, 7, 9, 11];

describe('pitch mapping', () => {
  it('normalizeScaleIntervals: keeps an explicit root without duplicating it', () => {
    assert.deepEqual(normalizeScaleIntervals([0, 2, 4, 5, 7, 9, 11]), [0, 2, 4, 5, 7, 9, 11]);
  });

  it('normalizeScaleIntervals: injects root when the scale omits pitch class 0', () => {
    assert.deepEqual(normalizeScaleIntervals([2, 4, 5, 7, 9, 11]), [0, 2, 4, 5, 7, 9, 11]);
  });

  it('normalizeScaleIntervals: rounds, wraps, deduplicates, and sorts pitch classes', () => {
    assert.deepEqual(normalizeScaleIntervals([14, 2.4, -1, 2, 26]), [0, 2, 11]);
  });

  it('transposeByScaleDegree: moves through C major from C3', () => {
    assert.deepEqual(
      [0, 1, 2, 3, 4, 5, 6, 7].map((degree) =>
        transposeByScaleDegree(48, degree, 0, MAJOR),
      ),
      [48, 50, 52, 53, 55, 57, 59, 60],
    );
  });

  it('transposeByScaleDegree: moves downward across octaves', () => {
    assert.deepEqual(
      [-1, -2, -7, -8].map((degree) => transposeByScaleDegree(48, degree, 0, MAJOR)),
      [47, 45, 36, 35],
    );
  });

  it('transposeByScaleDegree: starts from the played scale degree in D major', () => {
    assert.deepEqual(
      [0, 1, 2, 3].map((degree) => transposeByScaleDegree(54, degree, 2, MAJOR)),
      [54, 55, 57, 59],
    );
  });

  it('transposeByScaleDegree: anchors the scale shape to an out-of-scale trigger', () => {
    assert.deepEqual(
      [0, 1, 2, 3].map((degree) => transposeByScaleDegree(60, degree, 2, MAJOR)),
      [60, 62, 64, 65],
    );
  });

  it('transposeHybrid: adds an accidental after scale-degree resolution', () => {
    assert.equal(transposeHybrid(48, 1, -1, 0, MAJOR), 49);
    assert.equal(transposeHybrid(48, 1, 2, 0, MAJOR), 52);
  });

  it('transposeHybrid: resolves off-scale triggers before applying the accidental', () => {
    assert.equal(transposeHybrid(60, 1, 1, 2, MAJOR), 63);
  });

  it('transposeHybrid: clamps results below MIDI note 0', () => {
    assert.equal(transposeHybrid(0, 0, -5, 0, MAJOR), 0);
  });

  it('transposeHybrid: clamps results above MIDI note 127', () => {
    assert.equal(transposeHybrid(120, 0, 20, 0, MAJOR), 127);
  });
});
