/**
 * Convert absolute MIDI notes (clip import, MIDI files) into relative Motif JSON.
 */

import { floorDiv, mod } from './math.js';
import type { Motif, MotifNote, PitchMode, TimeSignature } from './types.js';

/** Absolute MIDI note in motif PPQ ticks. */
export interface AbsoluteNote {
  at: number;
  duration: number;
  pitch: number;
  velocity: number;
}

/** Options for {@link absoluteNotesToMotif}. */
export interface AbsoluteNotesImportOptions {
  id: string;
  name: string;
  pitchMode: PitchMode;
  /** MIDI pitch used as the relative anchor. Defaults to the first note. */
  rootNote?: number;
  /** Scale intervals for `scale` / `hybrid` analysis. Defaults to major. */
  scaleIntervals?: readonly number[];
  /** Stored source meter; defaults to 4/4. */
  sourceMeter?: TimeSignature;
  description?: string;
  tags?: readonly string[];
}

/**
 * Nearest scale-degree + accidental for a chromatic offset from the phrase root.
 * Used by hybrid (and scale) import analysis.
 */
export function analyzeScaleOffset(
  semitoneOffset: number,
  intervals: readonly number[],
): { degree: number; accidental: number } {
  const octave = floorDiv(semitoneOffset, 12);
  const pitchClass = mod(semitoneOffset, 12);
  let bestDegree = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < intervals.length; index += 1) {
    const interval = intervals[index] ?? 0;
    const distance = Math.abs(pitchClass - interval);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestDegree = index;
    }
  }

  const scalePitch = intervals[bestDegree] ?? 0;
  return {
    degree: octave * intervals.length + bestDegree,
    accidental: pitchClass - scalePitch,
  };
}

/**
 * Convert absolute MIDI notes into a relative Motif using chromatic, scale, or hybrid analysis.
 * Notes are sorted by time; `length` is the end of the last note.
 */
export function absoluteNotesToMotif(
  absoluteNotes: readonly AbsoluteNote[],
  options: AbsoluteNotesImportOptions,
): Motif {
  const completed = [...absoluteNotes]
    .map((note) => ({
      at: note.at,
      duration: Math.max(1, note.duration),
      pitch: note.pitch,
      velocity: note.velocity,
    }))
    .sort((left, right) => left.at - right.at || left.pitch - right.pitch);

  if (completed.length === 0) {
    throw new Error('No completed notes to import');
  }

  const anchor = options.rootNote ?? completed[0]?.pitch ?? 60;
  const scaleIntervals = options.scaleIntervals ?? [0, 2, 4, 5, 7, 9, 11];
  const notes: MotifNote[] = completed.map((note) => {
    const semitoneOffset = note.pitch - anchor;
    if (options.pitchMode === 'chromatic') {
      return { at: note.at, duration: note.duration, pitch: semitoneOffset, velocity: note.velocity };
    }

    const analyzed = analyzeScaleOffset(semitoneOffset, scaleIntervals);
    return {
      at: note.at,
      duration: note.duration,
      pitch: analyzed.degree,
      ...(options.pitchMode === 'hybrid' && analyzed.accidental !== 0
        ? { accidental: analyzed.accidental }
        : {}),
      velocity: note.velocity,
    };
  });

  const length = Math.max(...notes.map((note) => note.at + note.duration));
  return {
    schemaVersion: 1,
    id: options.id,
    name: options.name,
    description:
      options.description ?? `Imported using ${options.pitchMode} relative analysis.`,
    pitchMode: options.pitchMode,
    sourceMeter: options.sourceMeter ?? { numerator: 4, denominator: 4 },
    length,
    notes,
    metadata: { tags: options.tags ? [...options.tags] : ['imported'] },
  };
}
