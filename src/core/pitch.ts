/**
 * Pitch mapping helpers for motif `pitchMode` values.
 *
 * Scale-degree mapping walks Live's scale intervals relative to the trigger
 * note's degree in that scale. Chromatic mapping adds semitones. Hybrid adds
 * an accidental after scale-degree resolution.
 */

import { clamp, floorDiv, mod } from "./math.js";

/**
 * Normalize a scale's intervals to ensure the root note is included and the intervals are sorted.
 * @param {number[]} intervals The intervals to normalize.
 * @returns {number[]} The normalized intervals.
 */
export function normalizeScaleIntervals(intervals: number[]): number[] {
  const normalized = [...new Set(intervals.map((value) => mod(Math.round(value), 12)))].sort(
    (left, right) => left - right,
  );

  // Always include the root note (0) in the normalized intervals.
  if (!normalized.includes(0)) {
    normalized.unshift(0);
  }

  return normalized;
}

/**
 * Resolve a MIDI pitch to the nearest note in a scale.
 * Exact matches are unchanged; equidistant ties prefer the lower note.
 * @param {number} pitch MIDI pitch to resolve.
 * @param {number} rootNote Scale root pitch class.
 * @param {number[]} scaleIntervals Scale intervals from the root.
 * @returns {number} A MIDI-range pitch belonging to the scale.
 */
export function quantizePitchToScale(
  pitch: number,
  rootNote: number,
  scaleIntervals: number[],
): number {
  const rounded = Math.round(clamp(pitch, 0, 127));
  const rootPitchClass = mod(rootNote, 12);
  const pitchClasses = new Set(
    normalizeScaleIntervals(scaleIntervals).map((interval) => mod(rootPitchClass + interval, 12)),
  );
  const belongs = (candidate: number): boolean => pitchClasses.has(mod(candidate, 12));
  if (belongs(rounded)) {
    return rounded;
  }

  for (let distance = 1; distance <= 127; distance += 1) {
    const lower = rounded - distance;
    if (lower >= 0 && belongs(lower)) {
      return lower;
    }
    const upper = rounded + distance;
    if (upper <= 127 && belongs(upper)) {
      return upper;
    }
  }
  return rounded;
}

/**
 * Resolve a scale-degree offset into an unclamped semitone offset from the trigger.
 * Keeping this separate from MIDI-range clamping makes import and mode conversion
 * exact even when the source phrase contains large positive or negative intervals.
 * @param {number} triggerPitch The pitch to transpose.
 * @param {number} degreeOffset The scale-degree offset to apply.
 * @param {number} rootNote The root note of the scale.
 * @param {number[]} scaleIntervals The intervals of the scale.
 * @returns {number} The semitone offset.
 */
export function scaleDegreeSemitoneOffset(
  triggerPitch: number,
  degreeOffset: number,
  rootNote: number,
  scaleIntervals: number[],
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
 * @param {number} triggerPitch The pitch to transpose.
 * @param {number} degreeOffset The scale-degree offset to apply.
 * @param {number} rootNote The root note of the scale.
 * @param {number[]} scaleIntervals The intervals of the scale.
 * @returns {number} The transposed pitch.
 */
export function transposeByScaleDegree(
  triggerPitch: number,
  degreeOffset: number,
  rootNote: number,
  scaleIntervals: number[],
): number {
  return clamp(
    triggerPitch + scaleDegreeSemitoneOffset(triggerPitch, degreeOffset, rootNote, scaleIntervals),
    0,
    127,
  );
}

/**
 * Add chromatic semitones to the trigger pitch (clamped 0-127).
 * @param {number} triggerPitch The pitch to transpose.
 * @param {number} semitones The number of semitones to add.
 * @returns {number} The transposed pitch.
 */
export function transposeChromatically(triggerPitch: number, semitones: number): number {
  return clamp(triggerPitch + semitones, 0, 127);
}

/**
 * Scale-degree mapping plus a chromatic accidental (hybrid pitch mode).
 * @param {number} triggerPitch The pitch to transpose.
 * @param {number} degreeOffset The scale-degree offset to apply.
 * @param {number} accidental The chromatic accidental to apply.
 * @param {number} rootNote The root note of the scale.
 * @param {number[]} scaleIntervals The intervals of the scale.
 * @returns {number} The transposed pitch.
 */
export function transposeHybrid(
  triggerPitch: number,
  degreeOffset: number,
  accidental: number,
  rootNote: number,
  scaleIntervals: number[],
): number {
  return clamp(
    triggerPitch +
      scaleDegreeSemitoneOffset(triggerPitch, degreeOffset, rootNote, scaleIntervals) +
      accidental,
    0,
    127,
  );
}
