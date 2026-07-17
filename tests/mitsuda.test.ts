import assert from 'node:assert/strict';
import test from 'node:test';
import { compileMotif } from '../src/core/compile-motif.js';
import { BUILTIN_MOTIFS } from '../src/generated/builtins.js';
import type { HostContext } from '../src/core/types.js';

const HOST: HostContext = {
  tempo: 120,
  rootNote: 0,
  scaleName: 'Major',
  scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
  scaleMode: true,
  timeSignature: { numerator: 4, denominator: 4 },
  isPlaying: false,
  currentSongTime: 0,
};

test('ships the canonical Mitsuda contour as a built-in motif', () => {
  const motif = BUILTIN_MOTIFS.find(({ id }) => id === 'mitsuda-lick');
  assert.ok(motif);
  assert.equal(motif.length, 7680);
  assert.deepEqual(motif.notes.map(({ pitch }) => pitch), [0, -2, 3, 2, 1, 0]);
  assert.deepEqual(motif.notes.map(({ at }) => at), [0, 2880, 3840, 4800, 5280, 5760]);
});

test('transposes the Mitsuda contour from the trigger note', () => {
  const motif = BUILTIN_MOTIFS.find(({ id }) => id === 'mitsuda-lick');
  assert.ok(motif);
  const noteOns = compileMotif(motif, HOST, {
    channel: 1,
    meterMode: 'preserve',
    triggerPitch: 60,
    triggerVelocity: 100,
  }).filter(({ velocity }) => velocity > 0);

  assert.deepEqual(noteOns.map(({ pitch }) => pitch), [60, 58, 63, 62, 61, 60]);
});
