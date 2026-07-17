import assert from 'node:assert/strict';
import test from 'node:test';
import { buildMotifPreview, midiNoteName } from '../src/core/preview.js';
import type { HostContext } from '../src/core/types.js';
import { BUILTIN_MOTIFS } from '../src/generated/builtins.js';

const mitsuda = BUILTIN_MOTIFS.find(({ id }) => id === 'mitsuda-lick');
const scaleTurn = BUILTIN_MOTIFS.find(({ id }) => id === 'scale-turn');
if (!mitsuda || !scaleTurn) throw new Error('Missing built-in motifs');

const host: HostContext = {
  tempo: 120,
  rootNote: 0,
  scaleName: 'Major',
  scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
  scaleMode: true,
  timeSignature: { numerator: 4, denominator: 4 },
  isPlaying: false,
  currentSongTime: 0,
};

test('formats MIDI note names using Ableton octave numbering', () => {
  assert.equal(midiNoteName(60), 'C3');
  assert.equal(midiNoteName(58), 'A♯2');
  assert.equal(midiNoteName(0), 'C-2');
});

test('previews the Mitsuda contour chromatically from C3', () => {
  const preview = buildMotifPreview(mitsuda, host, 60, undefined, 'preserve');
  assert.deepEqual(preview.notes.map(({ pitch }) => pitch), [60, 58, 63, 62, 61, 60]);
  assert.deepEqual(preview.noteNames, ['C3', 'A♯2', 'D♯3', 'D3', 'C♯3', 'C3']);
  assert.equal(preview.bars, 2);
  assert.equal(preview.effectivePitchMode, 'chromatic');
});

test('scale-mode preview follows Live root and intervals', () => {
  const dorian: HostContext = {
    ...host,
    rootNote: 2,
    scaleName: 'D Dorian',
    scaleIntervals: [0, 2, 3, 5, 7, 9, 10],
  };
  const preview = buildMotifPreview(scaleTurn, dorian, 62, 'scale', 'preserve');
  assert.deepEqual(preview.notes.map(({ pitch }) => pitch), [62, 64, 65, 69, 67, 64, 62]);
  assert.equal(preview.noteNames[0], 'D3');
  assert.equal(preview.effectivePitchMode, 'scale');
});
