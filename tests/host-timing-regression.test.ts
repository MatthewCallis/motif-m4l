import assert from 'node:assert/strict';
import test from 'node:test';
import { compileMotif } from '../src/core/compile-motif.js';
import { RuntimeScheduler } from '../src/core/runtime-scheduler.js';
import type { HostContext } from '../src/core/types.js';
import { BUILTIN_MOTIFS } from '../src/generated/builtins.js';

function host(tempo: number): HostContext {
  return {
    tempo,
    rootNote: 0,
    scaleName: 'Major',
    scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
    scaleMode: true,
    timeSignature: { numerator: 4, denominator: 4 },
    isPlaying: true,
    currentSongTime: 0,
  };
}

test('Mitsuda note-on delays remain sequential instead of collapsing', () => {
  const motif = BUILTIN_MOTIFS.find(({ id }) => id === 'mitsuda-lick');
  assert.ok(motif);
  const compiled = compileMotif(motif, host(120), {
    channel: 1,
    meterMode: 'preserve',
    triggerPitch: 60,
    triggerVelocity: 100,
    instanceId: 1,
  });
  const noteOns = compiled.filter(({ velocity }) => velocity > 0);
  assert.deepEqual(noteOns.map(({ offsetMs }) => offsetMs), [0, 1500, 2000, 2500, 2750, 3000]);

  const scheduler = new RuntimeScheduler();
  const runtime = scheduler.add(compiled, 10_000, 'ms').filter(({ velocity }) => velocity > 0);
  assert.deepEqual(runtime.map(({ delay }) => delay), [0, 1500, 2000, 2500, 2750, 3000]);
});

test('new triggers use the latest observed Song tempo', () => {
  const motif = BUILTIN_MOTIFS.find(({ id }) => id === 'mitsuda-lick');
  assert.ok(motif);
  const at120 = compileMotif(motif, host(120), {
    channel: 1,
    meterMode: 'preserve',
    triggerPitch: 60,
    triggerVelocity: 100,
  });
  const at60 = compileMotif(motif, host(60), {
    channel: 1,
    meterMode: 'preserve',
    triggerPitch: 60,
    triggerVelocity: 100,
  });
  const firstLateAt120 = at120.find(({ velocity, offsetMs }) => velocity > 0 && offsetMs > 0);
  const firstLateAt60 = at60.find(({ velocity, offsetMs }) => velocity > 0 && offsetMs > 0);
  assert.ok(firstLateAt120 && firstLateAt60);
  assert.equal(firstLateAt60.offsetMs, firstLateAt120.offsetMs * 2);
});
