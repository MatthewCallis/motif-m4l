/**
 * Pitch mapping helpers for motif `pitchMode` values.
 *
 * Scale-degree mapping walks Live's scale intervals relative to the trigger
 * note's degree in that scale. Chromatic mapping adds semitones. Hybrid adds
 * an accidental after scale-degree resolution.
 */

import { clamp, floorDiv, mod } from './math.js';

export function normalizeScaleIntervals(intervals: readonly number[]): number[] {
  const normalized = [...new Set(intervals.map((value) => mod(Math.round(value), 12)))].sort(
    (left, right) => left - right,
  );

  if (!normalized.includes(0)) {
    normalized.unshift(0);
  }

  return normalized;
}

/**
 * Resolve a scale-degree offset into an unclamped semitone offset from the trigger.
 * Keeping this separate from MIDI-range clamping makes import and mode conversion
 * exact even when the source phrase contains large positive or negative intervals.
 */
export function scaleDegreeSemitoneOffset(
  triggerPitch: number,
  degreeOffset: number,
  rootNote: number,
  scaleIntervals: readonly number[],
): number {
  const intervals = normalizeScaleIntervals(scaleIntervals);
  const rootPitchClass = mod(rootNote, 12);
  const triggerPitchClass = mod(triggerPitch, 12);
  const triggerInterval = mod(triggerPitchClass - rootPitchClass, 12);
  const triggerDegree = intervals.indexOf(triggerInterval);

  if (triggerDegree === -1) {
    const octave = floorDiv(degreeOffset, intervals.length);
    const degree = mod(degreeOffset, intervals.length);
    return octave * 12 + (intervals[degree] ?? 0);
  }

  const targetDegree = triggerDegree + degreeOffset;
  const octave = floorDiv(targetDegree, intervals.length);
  const degree = mod(targetDegree, intervals.length);
  const targetInterval = octave * 12 + (intervals[degree] ?? 0);
  return targetInterval - triggerInterval;
}

/**
 * Map a scale-degree offset from `triggerPitch` through `scaleIntervals`.
 * If the trigger is off-scale, falls back to interval[0] + octave steps.
 */
export function transposeByScaleDegree(
  triggerPitch: number,
  degreeOffset: number,
  rootNote: number,
  scaleIntervals: readonly number[],
): number {
  return clamp(
    triggerPitch + scaleDegreeSemitoneOffset(triggerPitch, degreeOffset, rootNote, scaleIntervals),
    0,
    127,
  );
}

/** Add chromatic semitones to the trigger pitch (clamped 0–127). */
export function transposeChromatically(triggerPitch: number, semitones: number): number {
  return clamp(triggerPitch + semitones, 0, 127);
}

/**
 * Scale-degree mapping plus a chromatic accidental (hybrid pitch mode).
 */
export function transposeHybrid(
  triggerPitch: number,
  degreeOffset: number,
  accidental: number,
  rootNote: number,
  scaleIntervals: readonly number[],
): number {
  return clamp(
    triggerPitch
      + scaleDegreeSemitoneOffset(triggerPitch, degreeOffset, rootNote, scaleIntervals)
      + accidental,
    0,
    127,
  );
}
