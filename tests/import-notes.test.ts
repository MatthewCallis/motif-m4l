import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  absoluteNotesToMotif,
  analyzeScaleOffset,
  convertMotifPitchMode,
  decodeSemitoneOffset,
  encodeSemitoneOffset,
} from '../src/core/import-notes.js';

describe('motif note import', () => {
  it('analyzeScaleOffset maps blue notes with accidentals', () => {
    const major = [0, 2, 4, 5, 7, 9, 11];
    assert.deepEqual(analyzeScaleOffset(0, major), { degree: 0, accidental: 0 });
    assert.deepEqual(analyzeScaleOffset(3, major), { degree: 1, accidental: 1 }); // Eb near D
    assert.deepEqual(analyzeScaleOffset(12, major), { degree: 7, accidental: 0 });
  });

  it('absoluteNotesToMotif chromatic uses first-note anchor', () => {
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
  });

  it('absoluteNotesToMotif hybrid keeps accidentals against Live-like scale', () => {
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
      },
    );

    assert.equal(motif.notes[0]?.pitch, 0);
    assert.equal(motif.notes[0]?.accidental, undefined);
    assert.equal(motif.notes[1]?.pitch, 1);
    assert.equal(motif.notes[1]?.accidental, 1);
    assert.equal(motif.notes[2]?.pitch, 4);
  });

  it('absoluteNotesToMotif scale snaps without storing accidentals', () => {
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

  it('hybrid to chromatic conversion preserves descending semitone offsets', () => {
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

  it('scale analysis is relative to the phrase anchor degree, not only the scale tonic', () => {
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

  it('encodes and decodes chromatic and scale offsets directly', () => {
    const context = {
      triggerPitch: 60,
      rootNote: 0,
      scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
    };
    assert.deepEqual(encodeSemitoneOffset(-3, 'chromatic', context), { pitch: -3 });
    assert.equal(
      decodeSemitoneOffset({ at: 0, duration: 1, pitch: -3, accidental: 1 }, 'chromatic', context),
      -2,
    );
    assert.equal(
      decodeSemitoneOffset({ at: 0, duration: 1, pitch: 2, accidental: 5 }, 'scale', context),
      4,
    );
  });

  it('returns the same motif when no pitch-mode conversion is needed', () => {
    const motif = absoluteNotesToMotif(
      [{ at: 0, duration: 0, pitch: 64, velocity: 100 }],
      {
        id: 'same',
        name: 'Same',
        pitchMode: 'chromatic',
        sourceMeter: { numerator: 3, denominator: 4 },
      },
    );
    const converted = convertMotifPitchMode(motif, 'chromatic', {
      triggerPitch: 64,
      rootNote: 0,
      scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
    });
    assert.equal(converted, motif);
    assert.equal(motif.notes[0]?.duration, 1);
    assert.deepEqual(motif.sourceMeter, { numerator: 3, denominator: 4 });
  });

  it('rejects imports without completed notes', () => {
    assert.throws(
      () => absoluteNotesToMotif([], { id: 'empty', name: 'Empty', pitchMode: 'chromatic' }),
      /No completed notes/,
    );
  });
});
