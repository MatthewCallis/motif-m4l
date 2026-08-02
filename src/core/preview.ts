/**
 * Pitch-contour data for the native Presentation `jsui` / MGraphics renderer.
 *
 * @see https://docs.cycling74.com/reference/jsui/
 * @see https://docs.cycling74.com/apiref/js/mgraphics/
 */

import { barLengthTicks } from "./timing.js";
import { resolveMotifPitch, resolveVelocity } from "./compile-motif.js";
import { convertMotifPitchMode } from "./import-notes.js";
import type { HostContext, MeterMode, Motif, PitchMode } from "./types.js";

/** One preview step after pitch mapping and meter scaling. */
export interface PreviewNote {
  /** MIDI pitch. */
  pitch: number;
  /** Start time in ticks. */
  atTicks: number;
  /** Duration in ticks. */
  durationTicks: number;
  /** Effective MIDI velocity used to shade the native preview note. */
  velocity: number;
}

/** Aggregated note geometry, names, and range for the native preview UI. */
export interface MotifPreview {
  /** Preview notes in pitch-time order. */
  notes: PreviewNote[];
  /** Note names in pitch-time order. */
  noteNames: string[];
  /** Lowest pitch in the motif. */
  lowPitch: number;
  /** Highest pitch in the motif. */
  highPitch: number;
  /** Number of bars in the motif. */
  bars: number;
  /** Effective pitch-mode override. */
  effectivePitchMode: PitchMode;
  /** MIDI note that anchors relative motif pitches. */
  triggerPitch: number;
}

/**
 * Format a MIDI note number using Ableton Live's octave labeling (MIDI 60 = C3).
 * @param {number} pitchValue The MIDI note number to format.
 * @returns {string} The clamped, rounded note name and octave.
 */
export function midiNoteName(pitchValue: number): string {
  const pitch = Math.max(0, Math.min(127, Math.round(pitchValue)));
  const names = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
  // Ableton Live labels MIDI 60 as C3.
  const octave = Math.floor(pitch / 12) - 2;
  return `${names[pitch % 12] ?? "C"}${octave}`;
}

/**
 * Parse a MIDI note name using Ableton Live's octave labeling (C3 = MIDI 60).
 * ASCII/Unicode sharps and flats are accepted case-insensitively.
 * @param {string} value The note name to parse.
 * @returns {number | undefined} The MIDI pitch, or undefined when invalid/out of range.
 */
export function parseMidiNoteName(value: string): number | undefined {
  const match = value.trim().match(/^([A-Ga-g])([#♯b♭]?)(-2|-1|[0-8])$/);
  if (!match) {
    return undefined;
  }
  const pitchClasses: Record<string, number> = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11,
  };
  const letter = match[1]?.toUpperCase() ?? "";
  const accidental = match[2];
  const octave = Number(match[3]);
  let offset = 0;
  if (accidental === "#" || accidental === "♯") {
    offset = 1;
  } else if (accidental === "b" || accidental === "♭") {
    offset = -1;
  }
  // MIDI 60 = C3.
  const pitch = (octave + 2) * 12 + (pitchClasses[letter] ?? 0) + offset;
  return pitch >= 0 && pitch <= 127 ? pitch : undefined;
}

/**
 * Build a compact pitch contour for the selected motif under current host settings.
 * Caps note count for rendering; ranges expand by ±1 when all pitches match.
 * @param {Motif} motif The motif to preview.
 * @param {HostContext} host The current Live host context.
 * @param {number} triggerPitch The MIDI note that anchors relative motif pitches.
 * @param {PitchMode | undefined} pitchModeOverride An optional pitch-mode override.
 * @param {MeterMode} meterMode The meter scaling mode.
 * @param {number} maxNotes The maximum number of notes to include.
 * @returns {MotifPreview} The mapped notes and aggregate preview metadata.
 */
export function buildMotifPreview(
  motif: Motif,
  host: HostContext,
  triggerPitch: number,
  pitchModeOverride: PitchMode | undefined,
  meterMode: MeterMode,
  maxNotes = 64,
): MotifPreview {
  let effectivePitchMode = pitchModeOverride ?? motif.pitchMode;
  let previewMotif = motif;
  if (effectivePitchMode !== motif.pitchMode) {
    try {
      previewMotif = convertMotifPitchMode(motif, effectivePitchMode);
    } catch {
      // Keep preview/state projection available for unresolved legacy/custom
      // source scales. Authoring and playback report the actionable error.
      effectivePitchMode = motif.pitchMode;
    }
  }
  const sourceBarTicks = barLengthTicks(previewMotif.sourceMeter);
  const targetBarTicks = barLengthTicks(host.timeSignature);
  const timeScale = meterMode === "fit-bar" ? targetBarTicks / sourceBarTicks : 1;

  const notes = previewMotif.notes.slice(0, maxNotes).map((note) => ({
    pitch: resolveMotifPitch(note, previewMotif, host, {
      channel: 1,
      meterMode,
      pitchMode: effectivePitchMode,
      triggerPitch,
      triggerVelocity: 100,
    }),
    atTicks: Math.max(0, note.at * timeScale),
    durationTicks: Math.max(1, note.duration * timeScale),
    // Preview relative velocity programming against a stable reference strike.
    velocity: resolveVelocity(note, previewMotif, 100),
  }));

  const pitches = notes.map((note) => note.pitch);
  const minimum = pitches.length > 0 ? Math.min(...pitches) : triggerPitch;
  const maximum = pitches.length > 0 ? Math.max(...pitches) : triggerPitch;
  const lowPitch = minimum === maximum ? minimum - 1 : minimum;
  const highPitch = minimum === maximum ? maximum + 1 : maximum;
  const totalTicks = Math.max(1, previewMotif.length * timeScale);
  const bars = totalTicks / Math.max(1, meterMode === "fit-bar" ? targetBarTicks : sourceBarTicks);

  return {
    notes,
    noteNames: notes.map((note) => midiNoteName(note.pitch)),
    lowPitch,
    highPitch,
    bars,
    effectivePitchMode,
    triggerPitch,
  };
}
