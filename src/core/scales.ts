/**
 * Defensive fallback definitions for the scale labels exposed by Live.
 *
 * `Song.scale_intervals` remains authoritative. This registry is consulted only
 * when Live has supplied a scale name but no usable interval list yet.
 */

import { normalizeScaleIntervals } from "./pitch.js";

const SCALE_INTERVALS_BY_NAME: Readonly<Record<string, readonly number[]>> = {
  Major: [0, 2, 4, 5, 7, 9, 11],
  Minor: [0, 2, 3, 5, 7, 8, 10],
  Dorian: [0, 2, 3, 5, 7, 9, 10],
  Mixolydian: [0, 2, 4, 5, 7, 9, 10],
  Lydian: [0, 2, 4, 6, 7, 9, 11],
  Phrygian: [0, 1, 3, 5, 7, 8, 10],
  Locrian: [0, 1, 3, 5, 6, 8, 10],
  "Whole Tone": [0, 2, 4, 6, 8, 10],
  "Half-whole Dim.": [0, 1, 3, 4, 6, 7, 9, 10],
  "Whole-half Dim.": [0, 2, 3, 5, 6, 8, 9, 11],
  "Minor Blues": [0, 3, 5, 6, 7, 10],
  "Minor Pentatonic": [0, 3, 5, 7, 10],
  "Major Pentatonic": [0, 2, 4, 7, 9],
  "Harmonic Minor": [0, 2, 3, 5, 7, 8, 11],
  "Harmonic Major": [0, 2, 4, 5, 7, 8, 11],
  "Dorian #4": [0, 2, 3, 6, 7, 9, 10],
  "Phrygian Dominant": [0, 1, 4, 5, 7, 8, 10],
  "Melodic Minor": [0, 2, 3, 5, 7, 9, 11],
  "Lydian Augmented": [0, 2, 4, 6, 8, 9, 11],
  "Lydian Dominant": [0, 2, 4, 6, 7, 9, 10],
  "Super Locrian": [0, 1, 3, 4, 6, 8, 10],
  Spanish: [0, 1, 3, 4, 5, 6, 8, 10],
  Bhairav: [0, 1, 4, 5, 7, 8, 11],
  "Hungarian Minor": [0, 2, 3, 6, 7, 8, 11],
  Chinese: [0, 4, 6, 7, 11],
  Hirajoshi: [0, 2, 3, 7, 8],
  "In-Sen": [0, 1, 5, 7, 10],
  Iwato: [0, 1, 5, 6, 10],
  Kumoi: [0, 2, 3, 7, 9],
  Pelog: [0, 1, 3, 7, 8],
  "Messiaen 3": [0, 2, 3, 4, 6, 7, 8, 10, 11],
  "Messiaen 4": [0, 1, 2, 5, 6, 7, 8, 11],
  "Messiaen 5": [0, 1, 5, 6, 7, 11],
  "Messiaen 6": [0, 2, 4, 5, 6, 8, 10, 11],
  "Messiaen 7": [0, 1, 2, 3, 5, 6, 7, 8, 9, 11],
};

/**
 * Look up a normalized fallback interval list by Live scale label.
 * Accepts labels such as `D Major` defensively even though root is separate.
 * @param {string} scaleName Live scale display label.
 * @returns {number[] | undefined} A fresh normalized interval list when known.
 */
export function knownScaleIntervals(scaleName: string): number[] | undefined {
  const trimmed = scaleName.trim();
  const withoutRoot = trimmed.replace(/^[A-G](?:#|b|♯|♭)?\s+/, "");
  const intervals = SCALE_INTERVALS_BY_NAME[trimmed] ?? SCALE_INTERVALS_BY_NAME[withoutRoot];
  return intervals ? normalizeScaleIntervals(intervals) : undefined;
}
