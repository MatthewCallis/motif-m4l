/**
 * Defensive fallback definitions for the scale labels exposed by Live.
 *
 * `Song.scale_intervals` remains authoritative. This registry is consulted only
 * when Live has supplied a scale name but no usable interval list yet.
 */

import { normalizeScaleIntervals } from "./pitch.js";

/** Scale choices available to Motif, including Live's current built-ins and Motif's unique choices. */
export const SCALE_DEFINITIONS = [
  { name: "Major", intervals: [0, 2, 4, 5, 7, 9, 11] },
  { name: "Minor", intervals: [0, 2, 3, 5, 7, 8, 10] },
  { name: "Dorian", intervals: [0, 2, 3, 5, 7, 9, 10] },
  { name: "Mixolydian", intervals: [0, 2, 4, 5, 7, 9, 10] },
  { name: "Lydian", intervals: [0, 2, 4, 6, 7, 9, 11] },
  { name: "Phrygian", intervals: [0, 1, 3, 5, 7, 8, 10] },
  { name: "Locrian", intervals: [0, 1, 3, 5, 6, 8, 10] },
  { name: "Whole Tone", intervals: [0, 2, 4, 6, 8, 10] },
  { name: "Half-whole Dim.", intervals: [0, 1, 3, 4, 6, 7, 9, 10] },
  { name: "Whole-half Dim.", intervals: [0, 2, 3, 5, 6, 8, 9, 11] },
  { name: "Minor Blues", intervals: [0, 3, 5, 6, 7, 10] },
  { name: "Minor Pentatonic", intervals: [0, 3, 5, 7, 10] },
  { name: "Major Pentatonic", intervals: [0, 2, 4, 7, 9] },
  { name: "Harmonic Minor", intervals: [0, 2, 3, 5, 7, 8, 11] },
  { name: "Harmonic Major", intervals: [0, 2, 4, 5, 7, 8, 11] },
  { name: "Dorian #4", intervals: [0, 2, 3, 6, 7, 9, 10] },
  { name: "Phrygian Dominant", intervals: [0, 1, 4, 5, 7, 8, 10] },
  { name: "Melodic Minor", intervals: [0, 2, 3, 5, 7, 9, 11] },
  { name: "Lydian Augmented", intervals: [0, 2, 4, 6, 8, 9, 11] },
  { name: "Lydian Dominant", intervals: [0, 2, 4, 6, 7, 9, 10] },
  { name: "Super Locrian", intervals: [0, 1, 3, 4, 6, 8, 10] },
  { name: "8-Tone Spanish", intervals: [0, 1, 3, 4, 5, 6, 8, 10] },
  { name: "Spanish", intervals: [0, 1, 3, 4, 5, 6, 8, 10] },
  { name: "Bhairav", intervals: [0, 1, 4, 5, 7, 8, 11] },
  { name: "Hungarian Minor", intervals: [0, 2, 3, 6, 7, 8, 11] },
  { name: "Chinese", intervals: [0, 4, 6, 7, 11] },
  { name: "Hirajoshi", intervals: [0, 2, 3, 7, 8] },
  { name: "In-Sen", intervals: [0, 1, 5, 7, 10] },
  { name: "Iwato", intervals: [0, 1, 5, 6, 10] },
  { name: "Kumoi", intervals: [0, 2, 3, 7, 9] },
  { name: "Pelog Selisir", intervals: [0, 1, 3, 7, 8] },
  { name: "Pelog Tembung", intervals: [0, 1, 5, 7, 8] },
  { name: "Pelog", intervals: [0, 1, 3, 7, 8] },
  { name: "Messiaen 3", intervals: [0, 2, 3, 4, 6, 7, 8, 10, 11] },
  { name: "Messiaen 4", intervals: [0, 1, 2, 5, 6, 7, 8, 11] },
  { name: "Messiaen 5", intervals: [0, 1, 5, 6, 7, 11] },
  { name: "Messiaen 6", intervals: [0, 2, 4, 5, 6, 8, 10, 11] },
  { name: "Messiaen 7", intervals: [0, 1, 2, 3, 5, 6, 7, 8, 9, 11] },
] as const;

/** Ordered labels used by the Scale dropdown. */
export const SCALE_NAMES = SCALE_DEFINITIONS.map(({ name }) => name);

/** Map of scale names to their intervals, used for fallback scale lookup below. */
const SCALE_INTERVALS_BY_NAME = new Map<string, readonly number[]>(
  SCALE_DEFINITIONS.map(({ name, intervals }) => [name, intervals]),
);

/**
 * Look up a normalized fallback interval list by Live scale label.
 * Accepts labels such as `D Major` defensively even though root is separate.
 * @param {string} scaleName Live scale display label.
 * @returns {number[] | undefined} A fresh normalized interval list when known.
 */
export function knownScaleIntervals(scaleName: string): number[] | undefined {
  const trimmed = scaleName.trim();
  const withoutRoot = trimmed.replace(/^[A-G](?:#|b|♯|♭)?\s+/, "");
  const intervals =
    SCALE_INTERVALS_BY_NAME.get(trimmed) ?? SCALE_INTERVALS_BY_NAME.get(withoutRoot);
  return intervals ? normalizeScaleIntervals([...intervals]) : undefined;
}
