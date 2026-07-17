import { clamp, floorDiv, mod } from './math.js';

function normalizeScaleIntervals(intervals: readonly number[]): number[] {
  const normalized = [...new Set(intervals.map((value) => mod(Math.round(value), 12)))].sort(
    (left, right) => left - right,
  );

  if (!normalized.includes(0)) {
    normalized.unshift(0);
  }

  return normalized;
}

/**
 * Move by a number of scale degrees from an exact trigger pitch.
 *
 * When the trigger belongs to Live's current scale, the movement follows that
 * scale from the trigger's actual degree. If it is chromatic to the scale, the
 * selected interval pattern is anchored to the trigger so the first note still
 * starts exactly where the performer played.
 */
export function transposeByScaleDegree(
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
    return clamp(triggerPitch + octave * 12 + (intervals[degree] ?? 0), 0, 127);
  }

  const rootBelowTrigger = triggerPitch - triggerInterval;
  const targetDegree = triggerDegree + degreeOffset;
  const octave = floorDiv(targetDegree, intervals.length);
  const degree = mod(targetDegree, intervals.length);

  return clamp(rootBelowTrigger + octave * 12 + (intervals[degree] ?? 0), 0, 127);
}

export function transposeChromatically(triggerPitch: number, semitones: number): number {
  return clamp(triggerPitch + semitones, 0, 127);
}
