import { barLengthTicks } from './timing.js';
import { resolveMotifPitch } from './compile-motif.js';
import type { HostContext, MeterMode, Motif, PitchMode } from './types.js';

export interface PreviewNote {
  pitch: number;
  atTicks: number;
  durationTicks: number;
}

export interface MotifPreview {
  notes: PreviewNote[];
  noteNames: string[];
  lowPitch: number;
  highPitch: number;
  bars: number;
  effectivePitchMode: PitchMode;
  triggerPitch: number;
}

export function midiNoteName(pitchValue: number): string {
  const pitch = Math.max(0, Math.min(127, Math.round(pitchValue)));
  const names = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  const octave = Math.floor(pitch / 12) - 2; // Ableton Live labels MIDI 60 as C3.
  return `${names[pitch % 12] ?? 'C'}${octave}`;
}

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
