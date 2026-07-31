/**
 * Non-destructive performance transforms applied immediately before motif
 * compilation or preview rendering.
 */

import type { Motif, MotifNote } from './types.js';

/** Performance transforms controlled by the main device UI. */
export interface MotifTransformOptions {
  /** Mirror encoded pitch offsets around zero. */
  invert?: boolean;
  /** Mirror note spans across the motif length. */
  reverse?: boolean;
}

/**
 * Negate a numeric offset while preserving zero rather than producing `-0`.
 * @param {number} value The encoded pitch or accidental offset.
 * @returns {number} The mirrored offset.
 */
function invertOffset(value: number): number {
  return value === 0 ? 0 : -value;
}

/**
 * Create a transient transformed motif without mutating its stored source.
 *
 * Inversion negates scale-degree/semitone offsets and hybrid accidentals.
 * Reversal mirrors each note's complete span so durations and intervening rests
 * are preserved when the phrase runs backward.
 *
 * @param {Motif} motif The stored motif.
 * @param {MotifTransformOptions} options Enabled performance transforms.
 * @returns {Motif} The original motif when unchanged, otherwise a transformed copy.
 */
export function transformMotif(
  motif: Motif,
  options: MotifTransformOptions,
): Motif {
  if (!options.invert && !options.reverse) {
    return motif;
  }
  const sourceNotes = options.reverse ? [...motif.notes].reverse() : motif.notes;
  const notes = sourceNotes.map((source): MotifNote => {
    const note: MotifNote = { ...source };
    if (options.invert) {
      note.pitch = invertOffset(source.pitch);
      if (source.accidental !== undefined) note.accidental = invertOffset(source.accidental);
    }
    if (options.reverse) {
      note.at = Math.max(0, motif.length - source.at - source.duration);
    }
    return note;
  });

  if (options.reverse) {
    notes.sort((left, right) => left.at - right.at);
  }
  return { ...motif, notes };
}
