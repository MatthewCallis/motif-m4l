/**
 * Pitch-contour data for the native Presentation `jsui` / MGraphics renderer.
 *
 * @see https://docs.cycling74.com/reference/jsui/
 * @see https://docs.cycling74.com/apiref/js/mgraphics/
 */

import { barLengthTicks } from './timing.js';
import { resolveMotifPitch } from './compile-motif.js';
import type { HostContext, MeterMode, Motif, PitchMode } from './types.js';

/** One preview step after pitch mapping and meter scaling. */
export interface PreviewNote {
  pitch: number;
  atTicks: number;
  durationTicks: number;
}

/** Aggregated note geometry, names, and range for the native preview UI. */
export interface MotifPreview {
  notes: PreviewNote[];
  noteNames: string[];
  lowPitch: number;
  highPitch: number;
  bars: number;
  effectivePitchMode: PitchMode;
  triggerPitch: number;
}

/**
 * Format a MIDI note number using Ableton Live's octave labeling (MIDI 60 = C3).
 * @param {number} pitchValue The MIDI note number to format.
 * @returns {string} The clamped, rounded note name and octave.
 */
export function midiNoteName(pitchValue: number): string {
  const pitch = Math.max(0, Math.min(127, Math.round(pitchValue)));
  const names = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  // Ableton Live labels MIDI 60 as C3.
  const octave = Math.floor(pitch / 12) - 2;
  return `${names[pitch % 12] ?? 'C'}${octave}`;
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
  const effectivePitchMode = pitchModeOverride ?? motif.pitchMode;
  const sourceBarTicks = barLengthTicks(motif.sourceMeter);
  const targetBarTicks = barLengthTicks(host.timeSignature);
  const timeScale = meterMode === 'fit-bar' ? targetBarTicks / sourceBarTicks : 1;

  const notes = motif.notes.slice(0, maxNotes).map((note) => ({
    pitch: resolveMotifPitch(note, motif, host, {
      channel: 1,
      meterMode,
      pitchMode: effectivePitchMode,
      triggerPitch,
      triggerVelocity: 100,
    }),
    atTicks: Math.max(0, note.at * timeScale),
    durationTicks: Math.max(1, note.duration * timeScale),
  }));

  const pitches = notes.map((note) => note.pitch);
  const minimum = pitches.length > 0 ? Math.min(...pitches) : triggerPitch;
  const maximum = pitches.length > 0 ? Math.max(...pitches) : triggerPitch;
  const lowPitch = minimum === maximum ? minimum - 1 : minimum;
  const highPitch = minimum === maximum ? maximum + 1 : maximum;
  const totalTicks = Math.max(1, motif.length * timeScale);
  const bars = totalTicks / Math.max(1, meterMode === 'fit-bar' ? targetBarTicks : sourceBarTicks);

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
