import assert from 'node:assert/strict';
import test from 'node:test';
import { transposeByScaleDegree } from '../src/core/pitch.js';

const MAJOR = [0, 2, 4, 5, 7, 9, 11];

test('moves through C major from C3', () => {
  assert.deepEqual(
    [0, 1, 2, 3, 4, 5, 6, 7].map((degree) =>
      transposeByScaleDegree(48, degree, 0, MAJOR),
    ),
    [48, 50, 52, 53, 55, 57, 59, 60],
  );
});

test('moves downward across octaves', () => {
  assert.deepEqual(
    [-1, -2, -7, -8].map((degree) => transposeByScaleDegree(48, degree, 0, MAJOR)),
    [47, 45, 36, 35],
  );
});

test('starts from the played scale degree in D major', () => {
  assert.deepEqual(
    [0, 1, 2, 3].map((degree) => transposeByScaleDegree(54, degree, 2, MAJOR)),
    [54, 55, 57, 59],
  );
});

test('anchors the scale shape to an out-of-scale trigger', () => {
  assert.deepEqual(
    [0, 1, 2, 3].map((degree) => transposeByScaleDegree(60, degree, 2, MAJOR)),
    [60, 62, 64, 65],
  );
});
