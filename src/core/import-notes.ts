/**
 * Convert absolute MIDI notes (clip import, MIDI files) into relative Motif JSON.
 */

import { normalizeScaleIntervals, scaleDegreeSemitoneOffset } from "./pitch.js";
import { knownScaleIntervals } from "./scales.js";
import type { Motif, MotifNote, PitchMode, SourcePitchContext, TimeSignature } from "./types.js";

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
  /** MIDI pitch used as the relative phrase anchor. Defaults to the first note. */
  anchorPitch?: number;
  /** Original Live scale root pitch class. Defaults to C. */
  scaleRootNote?: number;
  /** Original Live scale label. Defaults to Major. */
  scaleName?: string;
  /** Original scale intervals. A known-name fallback is used when omitted. */
  scaleIntervals?: readonly number[] | null;
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

/** Return the resolved scale intervals stored with a motif, if available. */
function sourceScaleIntervals(context: SourcePitchContext): readonly number[] | null {
  return context.scaleIntervals ?? knownScaleIntervals(context.scaleName) ?? null;
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
function analyzeScaleOffset(
  semitoneOffset: number,
  intervals: readonly number[],
  triggerPitch = 60,
  scaleRootNote = 0,
): { degree: number; accidental: number } {
  const scaleLength = Math.max(
    1,
    new Set(intervals.map((value) => ((Math.round(value) % 12) + 12) % 12)).size,
  );
  const estimate = Math.round((semitoneOffset / 12) * scaleLength);
  const radius = scaleLength * 2 + 2;
  let bestDegree = estimate;
  let bestAccidental =
    semitoneOffset - scaleDegreeSemitoneOffset(triggerPitch, estimate, scaleRootNote, intervals);

  for (let degree = estimate - radius; degree <= estimate + radius; degree += 1) {
    const accidental =
      semitoneOffset - scaleDegreeSemitoneOffset(triggerPitch, degree, scaleRootNote, intervals);
    const absolute = Math.abs(accidental);
    const bestAbsolute = Math.abs(bestAccidental);

    if (
      absolute < bestAbsolute ||
      (absolute === bestAbsolute && Math.abs(degree) < Math.abs(bestDegree)) ||
      (absolute === bestAbsolute &&
        Math.abs(degree) === Math.abs(bestDegree) &&
        degree < bestDegree)
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
function encodeSemitoneOffset(
  semitoneOffset: number,
  pitchMode: PitchMode,
  context: PitchModeConversionContext,
): Pick<MotifNote, "pitch" | "accidental"> {
  if (pitchMode === "chromatic") {
    return { pitch: semitoneOffset };
  }

  const analyzed = analyzeScaleOffset(
    semitoneOffset,
    context.scaleIntervals,
    context.triggerPitch,
    context.rootNote,
  );
  if (analyzed.accidental !== 0) {
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
  if (pitchMode === "chromatic") {
    return note.pitch + (note.accidental ?? 0);
  }

  const scaleOffset = scaleDegreeSemitoneOffset(
    context.triggerPitch,
    note.pitch,
    context.rootNote,
    context.scaleIntervals,
  );
  return scaleOffset + (note.accidental ?? 0);
}

/**
 * Re-encode a motif when its stored pitch mode changes.
 *
 * Merely changing `pitchMode` reinterprets every existing `pitch` value and can
 * silently corrupt the phrase (for example hybrid degree -1 becoming chromatic
 * -1 instead of the original -2 semitones). This conversion preserves sounding
 * offsets exactly by retaining chromatic alterations on the shared Scale/Hybrid
 * degree representation. Scale playback ignores those retained alterations.
 * @param {Motif} motif The motif to convert.
 * @param {PitchMode} targetMode The target pitch mode.
 * @returns {Motif} The converted motif.
 */
export function convertMotifPitchMode(motif: Motif, targetMode: PitchMode): Motif {
  if (motif.pitchMode === targetMode) {
    return motif;
  }

  // Scale and Hybrid intentionally share one lossless degree + accidental
  // representation. The mode only controls whether playback sounds alterations.
  if (motif.pitchMode !== "chromatic" && targetMode !== "chromatic") {
    return { ...motif, pitchMode: targetMode };
  }

  const intervals = sourceScaleIntervals(motif.sourcePitchContext);
  if (!intervals) {
    throw new Error(`Cannot convert ${motif.name}: source scale intervals are unresolved`);
  }
  const context: PitchModeConversionContext = {
    triggerPitch: motif.sourcePitchContext.anchorPitch,
    rootNote: motif.sourcePitchContext.scaleRootNote,
    scaleIntervals: intervals,
  };

  const notes = motif.notes.map((note) => {
    const semitoneOffset =
      motif.pitchMode === "chromatic"
        ? note.pitch + (note.accidental ?? 0)
        : decodeSemitoneOffset(note, motif.pitchMode, context);
    const encoded = encodeSemitoneOffset(semitoneOffset, targetMode, context);
    const { pitch: _pitch, accidental: _accidental, ...rest } = note;
    return { ...rest, ...encoded };
  });

  return { ...motif, pitchMode: targetMode, notes };
}

/**
 * Convert absolute MIDI notes into a lossless relative Chromatic Motif.
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
    throw new Error("No completed notes to import");
  }

  const anchor = options.anchorPitch ?? completed[0]?.pitch ?? 60;
  if (!Number.isInteger(anchor) || anchor < 0 || anchor > 127) {
    throw new Error("Source anchor pitch must be an integer from 0 to 127");
  }
  const scaleRootNote = options.scaleRootNote ?? 0;
  if (!Number.isInteger(scaleRootNote) || scaleRootNote < 0 || scaleRootNote > 11) {
    throw new Error("Source scale root must be an integer from 0 to 11");
  }
  const scaleName = options.scaleName?.trim() || "Major";
  const providedIntervals =
    options.scaleIntervals === null
      ? null
      : (options.scaleIntervals ?? knownScaleIntervals(scaleName) ?? null);
  const resolvedScaleIntervals = providedIntervals
    ? normalizeScaleIntervals(providedIntervals)
    : null;
  const notes: MotifNote[] = completed.map((note) => {
    const semitoneOffset = note.pitch - anchor;
    return {
      at: note.at,
      duration: note.duration,
      pitch: semitoneOffset,
      velocity: note.velocity,
    };
  });

  const length = Math.max(...notes.map((note) => note.at + note.duration));
  return {
    schemaVersion: 1,
    id: options.id,
    name: options.name,
    description: options.description ?? "Imported as exact chromatic offsets.",
    pitchMode: "chromatic",
    sourcePitchContext: {
      anchorPitch: anchor,
      scaleRootNote,
      scaleName,
      scaleIntervals: resolvedScaleIntervals,
    },
    sourceMeter: options.sourceMeter ?? { numerator: 4, denominator: 4 },
    length,
    notes,
  };
}
