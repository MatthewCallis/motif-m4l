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

test('ships the Salt Peanuts shout figure as a built-in motif', () => {
  const motif = BUILTIN_MOTIFS.find(({ id }) => id === 'salt-peanuts');
  assert.ok(motif);
  assert.equal(motif.length, 3840);
  assert.deepEqual(motif.notes.map(({ pitch }) => pitch), [0, 0, 3, 0, 0, 3]);
  assert.deepEqual(motif.notes.map(({ at }) => at), [0, 240, 480, 1920, 2160, 2400]);
});

test('transposes Salt Peanuts from the trigger note', () => {
  const motif = BUILTIN_MOTIFS.find(({ id }) => id === 'salt-peanuts');
  assert.ok(motif);
  const noteOns = compileMotif(motif, HOST, {
    channel: 1,
    meterMode: 'preserve',
    triggerPitch: 62,
    triggerVelocity: 100,
  }).filter(({ velocity }) => velocity > 0);

  assert.deepEqual(noteOns.map(({ pitch }) => pitch), [62, 62, 65, 62, 62, 65]);
});
