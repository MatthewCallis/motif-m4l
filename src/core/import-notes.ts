/**
 * Convert absolute MIDI notes (clip import, MIDI files) into relative Motif JSON.
 */

import { scaleDegreeSemitoneOffset } from './pitch.js';
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
  /** The motif ID. */
  id: string;
  /** The motif name. */
  name: string;
  /** The pitch mode to use for the motif. */
  pitchMode: PitchMode;
  /** MIDI pitch used as the relative phrase anchor. Defaults to the first note. */
  rootNote?: number;
  /** Live scale root pitch class used by `scale` / `hybrid` analysis. Defaults to C. */
  scaleRootNote?: number;
  /** Scale intervals for `scale` / `hybrid` analysis. Defaults to major. */
  scaleIntervals?: readonly number[];
  /** Stored source meter; defaults to 4/4. */
  sourceMeter?: TimeSignature;
  /** The motif description. */
  description?: string;
}

export interface PitchModeConversionContext {
  /** Reference MIDI trigger used to resolve relative scale degrees. */
  triggerPitch: number;
  /** Scale root pitch class. */
  rootNote: number;
  /** Scale intervals. */
  scaleIntervals: readonly number[];
}

/**
 * Nearest scale-degree + accidental for a chromatic offset from a trigger.
 *
 * The old implementation analyzed only the offset pitch class. That was wrong
 * whenever the phrase anchor was not the scale tonic, and it produced surprising
 * negative-degree choices around octave boundaries. Searching actual relative
 * scale degrees guarantees that encoding mirrors playback resolution.
 * @param {number} semitoneOffset The chromatic offset from the trigger pitch.
 * @param {readonly number[]} intervals The scale intervals.
 * @param {number} triggerPitch The trigger pitch.
 * @param {number} scaleRootNote The scale root pitch.
 * @returns {{ degree: number, accidental: number }} The nearest scale degree and accidental.
 */
export function analyzeScaleOffset(
  semitoneOffset: number,
  intervals: readonly number[],
  triggerPitch = 60,
  scaleRootNote = 0,
): { degree: number; accidental: number } {
  const scaleLength = Math.max(1, new Set(intervals.map((value) => ((Math.round(value) % 12) + 12) % 12)).size);
  const estimate = Math.round((semitoneOffset / 12) * scaleLength);
  const radius = scaleLength * 2 + 2;
  let bestDegree = estimate;
  let bestAccidental = semitoneOffset
    - scaleDegreeSemitoneOffset(triggerPitch, estimate, scaleRootNote, intervals);

  for (let degree = estimate - radius; degree <= estimate + radius; degree += 1) {
    const accidental = semitoneOffset
      - scaleDegreeSemitoneOffset(triggerPitch, degree, scaleRootNote, intervals);
    const absolute = Math.abs(accidental);
    const bestAbsolute = Math.abs(bestAccidental);

    if (
      absolute < bestAbsolute
      || (absolute === bestAbsolute && Math.abs(degree) < Math.abs(bestDegree))
      || (
        absolute === bestAbsolute
        && Math.abs(degree) === Math.abs(bestDegree)
        && degree < bestDegree
      )
    ) {
      bestDegree = degree;
      bestAccidental = accidental;
    }
  }

  return { degree: bestDegree, accidental: bestAccidental };
}

/**
 * Encode a semitone offset into a motif note.
 * @param {number} semitoneOffset The chromatic offset from the trigger pitch.
 * @param {PitchMode} pitchMode The pitch mode to use.
 * @param {PitchModeConversionContext} context The pitch mode conversion context.
 * @returns {Pick<MotifNote, 'pitch' | 'accidental'>} The encoded motif note.
 */
export function encodeSemitoneOffset(
  semitoneOffset: number,
  pitchMode: PitchMode,
  context: PitchModeConversionContext,
): Pick<MotifNote, 'pitch' | 'accidental'> {
  if (pitchMode === 'chromatic') {
    return { pitch: semitoneOffset };
  }

  const analyzed = analyzeScaleOffset(
    semitoneOffset,
    context.scaleIntervals,
    context.triggerPitch,
    context.rootNote,
  );
  if (pitchMode === 'hybrid' && analyzed.accidental !== 0) {
    return { pitch: analyzed.degree, accidental: analyzed.accidental };
  }
  return { pitch: analyzed.degree };
}

/**
 * Decode a motif note into a semitone offset.
 * @param {MotifNote} note The motif note to decode.
 * @param {PitchMode} pitchMode The pitch mode to use.
 * @param {PitchModeConversionContext} context The pitch mode conversion context.
 * @returns {number} The decoded semitone offset.
 */
export function decodeSemitoneOffset(
  note: MotifNote,
  pitchMode: PitchMode,
  context: PitchModeConversionContext,
): number {
  if (pitchMode === 'chromatic') {
    return note.pitch + (note.accidental ?? 0);
  }

  const scaleOffset = scaleDegreeSemitoneOffset(
    context.triggerPitch,
    note.pitch,
    context.rootNote,
    context.scaleIntervals,
  );
  return scaleOffset + (pitchMode === 'hybrid' ? (note.accidental ?? 0) : 0);
}

/**
 * Re-encode a motif when its stored pitch mode changes.
 *
 * Merely changing `pitchMode` reinterprets every existing `pitch` value and can
 * silently corrupt the phrase (for example hybrid degree -1 becoming chromatic
 * -1 instead of the original -2 semitones). This conversion preserves sounding
 * offsets whenever the target mode can represent them exactly. `scale` mode may
 * intentionally snap chromatic notes to the nearest scale degree.
 * @param {Motif} motif The motif to convert.
 * @param {PitchMode} targetMode The target pitch mode.
 * @param {PitchModeConversionContext} context The pitch mode conversion context.
 * @returns {Motif} The converted motif.
 */
export function convertMotifPitchMode(
  motif: Motif,
  targetMode: PitchMode,
  context: PitchModeConversionContext,
): Motif {
  if (motif.pitchMode === targetMode) {
    return motif;
  }

  const notes = motif.notes.map((note) => {
    const semitoneOffset = decodeSemitoneOffset(note, motif.pitchMode, context);
    const encoded = encodeSemitoneOffset(semitoneOffset, targetMode, context);
    const { pitch: _pitch, accidental: _accidental, ...rest } = note;
    return { ...rest, ...encoded };
  });

  return { ...motif, pitchMode: targetMode, notes };
}

/**
 * Convert absolute MIDI notes into a relative Motif using chromatic, scale, or hybrid analysis.
 * Notes are sorted by time, `length` is the end of the last note.
 * @param {readonly AbsoluteNote[]} absoluteNotes The absolute MIDI notes to convert.
 * @param {AbsoluteNotesImportOptions} options The import options.
 * @returns {Motif} The converted motif.
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
  const context: PitchModeConversionContext = {
    triggerPitch: anchor,
    rootNote: options.scaleRootNote ?? 0,
    scaleIntervals: options.scaleIntervals ?? [0, 2, 4, 5, 7, 9, 11],
  };
  const notes: MotifNote[] = completed.map((note) => {
    const semitoneOffset = note.pitch - anchor;
    return {
      at: note.at,
      duration: note.duration,
      ...encodeSemitoneOffset(semitoneOffset, options.pitchMode, context),
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
  };
}
