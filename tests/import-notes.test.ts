import assert from 'node:assert/strict';
import test from 'node:test';
import {
  absoluteNotesToMotif,
  analyzeScaleOffset,
  convertMotifPitchMode,
} from '../src/core/import-notes.js';

test('analyzeScaleOffset maps blue notes with accidentals', () => {
  const major = [0, 2, 4, 5, 7, 9, 11];
  assert.deepEqual(analyzeScaleOffset(0, major), { degree: 0, accidental: 0 });
  assert.deepEqual(analyzeScaleOffset(3, major), { degree: 1, accidental: 1 }); // Eb near D
  assert.deepEqual(analyzeScaleOffset(12, major), { degree: 7, accidental: 0 });
});

test('absoluteNotesToMotif chromatic uses first-note anchor', () => {
  const motif = absoluteNotesToMotif(
    [
      { at: 0, duration: 480, pitch: 60, velocity: 100 },
      { at: 480, duration: 480, pitch: 63, velocity: 90 },
      { at: 960, duration: 480, pitch: 58, velocity: 80 },
    ],
    { id: 'chrom', name: 'Chrom', pitchMode: 'chromatic' },
  );

  assert.equal(motif.pitchMode, 'chromatic');
  assert.deepEqual(motif.notes.map(({ pitch }) => pitch), [0, 3, -2]);
  assert.equal(motif.length, 1440);
  assert.deepEqual(motif.metadata?.tags, ['imported']);
});

test('absoluteNotesToMotif hybrid keeps accidentals against Live-like scale', () => {
  const motif = absoluteNotesToMotif(
    [
      { at: 0, duration: 240, pitch: 60, velocity: 100 },
      { at: 240, duration: 240, pitch: 63, velocity: 100 }, // Eb in C major
      { at: 480, duration: 240, pitch: 67, velocity: 100 },
    ],
    {
      id: 'hybrid',
      name: 'Hybrid',
      pitchMode: 'hybrid',
      scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
      tags: ['imported', 'live-clip'],
    },
  );

  assert.equal(motif.notes[0]?.pitch, 0);
  assert.equal(motif.notes[0]?.accidental, undefined);
  assert.equal(motif.notes[1]?.pitch, 1);
  assert.equal(motif.notes[1]?.accidental, 1);
  assert.equal(motif.notes[2]?.pitch, 4);
  assert.deepEqual(motif.metadata?.tags, ['imported', 'live-clip']);
});

test('absoluteNotesToMotif scale snaps without storing accidentals', () => {
  const motif = absoluteNotesToMotif(
    [
      { at: 0, duration: 240, pitch: 60, velocity: 100 },
      { at: 240, duration: 240, pitch: 63, velocity: 100 },
    ],
    {
      id: 'scale',
      name: 'Scale',
      pitchMode: 'scale',
      scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
    },
  );

  assert.equal(motif.notes[1]?.pitch, 1);
  assert.equal(motif.notes[1]?.accidental, undefined);
});


test('hybrid to chromatic conversion preserves descending semitone offsets', () => {
  const hybrid = absoluteNotesToMotif(
    [
      { at: 0, duration: 1920, pitch: 60, velocity: 127 },
      { at: 1920, duration: 960, pitch: 58, velocity: 127 },
      { at: 2880, duration: 720, pitch: 63, velocity: 127 },
    ],
    {
      id: 'hybrid-source',
      name: 'Hybrid Source',
      pitchMode: 'hybrid',
      rootNote: 60,
      scaleRootNote: 0,
      scaleIntervals: [0, 2, 3, 5, 7, 8, 10],
    },
  );

  assert.deepEqual(hybrid.notes.map(({ pitch }) => pitch), [0, -1, 2]);
  const chromatic = convertMotifPitchMode(hybrid, 'chromatic', {
    triggerPitch: 60,
    rootNote: 0,
    scaleIntervals: [0, 2, 3, 5, 7, 8, 10],
  });

  assert.equal(chromatic.pitchMode, 'chromatic');
  assert.deepEqual(chromatic.notes.map(({ pitch }) => pitch), [0, -2, 3]);
  assert.ok(chromatic.notes.every(({ accidental }) => accidental === undefined));
});

test('scale analysis is relative to the phrase anchor degree, not only the scale tonic', () => {
  const motif = absoluteNotesToMotif(
    [
      { at: 0, duration: 480, pitch: 64, velocity: 100 }, // E in C major
      { at: 480, duration: 480, pitch: 62, velocity: 100 }, // D is one degree down
    ],
    {
      id: 'off-tonic-anchor',
      name: 'Off-tonic anchor',
      pitchMode: 'hybrid',
      rootNote: 64,
      scaleRootNote: 0,
      scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
    },
  );

  assert.equal(motif.notes[1]?.pitch, -1);
  assert.equal(motif.notes[1]?.accidental, undefined);
});
