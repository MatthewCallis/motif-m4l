import assert from 'node:assert/strict';
import test from 'node:test';
import { compileMotif } from '../src/core/compile-motif.js';
import { PPQ, type HostContext, type Motif } from '../src/core/types.js';

const HOST: HostContext = {
  tempo: 120,
  rootNote: 0,
  scaleName: 'Major',
  scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
  scaleMode: true,
  timeSignature: { numerator: 4, denominator: 4 },
};

const MOTIF: Motif = {
  id: 'test',
  name: 'Test',
  description: 'Test motif',
  pitchMode: 'scale',
  sourceMeter: { numerator: 4, denominator: 4 },
  length: PPQ,
  notes: [{ at: 0, duration: PPQ, pitch: 2 }],
};

test('compiles note-on and note-off events', () => {
  assert.deepEqual(
    compileMotif(MOTIF, HOST, {
      channel: 2,
      meterMode: 'preserve',
      triggerPitch: 48,
      triggerVelocity: 90,
    }),
    [
      { pitch: 52, velocity: 90, channel: 2, offsetTicks: 0, offsetMs: 0 },
      { pitch: 52, velocity: 0, channel: 2, offsetTicks: 960, offsetMs: 500 },
    ],
  );
});

test('fits a 4/4 source bar into a 3/4 target bar', () => {
  const host: HostContext = {
    ...HOST,
    timeSignature: { numerator: 3, denominator: 4 },
  };
  const events = compileMotif(MOTIF, host, {
    channel: 1,
    meterMode: 'fit-bar',
    triggerPitch: 48,
    triggerVelocity: 100,
  });

  assert.equal(events[1]?.offsetTicks, 720);
  assert.equal(events[1]?.offsetMs, 375);
});

test('can override a scale motif with chromatic intervals', () => {
  const events = compileMotif(MOTIF, HOST, {
    channel: 1,
    meterMode: 'preserve',
    pitchMode: 'chromatic',
    triggerPitch: 48,
    triggerVelocity: 100,
  });

  assert.equal(events[0]?.pitch, 50);
});
