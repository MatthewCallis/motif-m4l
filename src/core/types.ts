/**
 * Motif JSON schema and performance-device types shared by the compiler,
 * library, Max device, and authoring tools.
 *
 * Phrases are stored as relative notes in PPQ ticks (`PPQ = 960`). At trigger
 * time they are mapped through Live's current scale/root (or chromatically)
 * and scheduled as MIDI note-on/off events.
 */

/** Pulses per quarter note for all motif timing fields (`at`, `duration`, `length`). */
export const PPQ = 960;

/** Current motif JSON `schemaVersion`. Bump only with a migration path. */
export const MOTIF_SCHEMA_VERSION = 1;

/**
 * How `MotifNote.pitch` is interpreted relative to the trigger note and Live scale.
 * - `scale` - scale-degree offsets through Song scale intervals
 * - `chromatic` - semitone offsets from the trigger
 * - `hybrid` - scale degrees plus optional `accidental` semitones
 */
export type PitchMode = "scale" | "chromatic" | "hybrid";

/** Whether phrase timing keeps source meter or stretches to the Live bar length. */
export type MeterMode = "preserve" | "fit-bar";

/** Behavior when a new trigger starts while another instance is still sounding. */
export type RetriggerMode = "replace" | "overlap";

/** How keyboard triggers start, stop, or repeat motif instances. */
export type TriggerMode = "one-shot" | "hold" | "hold-repeat" | "toggle" | "latch" | "release-tail";

/** Delay trigger start to the next Live song-time grid boundary. */
export type LaunchQuantization = "immediate" | "1/16" | "1/8" | "1/4" | "bar";

/** Which incoming MIDI notes bypass motif triggering and pass through. */
export type PassThroughPolicy = "none" | "non-triggers" | "all";

/** Meter as numerator/denominator (e.g. 4/4, 6/8). */
export interface TimeSignature {
  numerator: number;
  denominator: number;
}

/**
 * Live Song state forwarded into the engine for compile/preview.
 * Continuous values come from native `live.observer` → `song_context` messages.
 *
 * @see https://docs.cycling74.com/reference/live.observer
 * @see https://docs.cycling74.com/userguide/m4l/live_api_overview/
 */
export interface HostContext {
  /** BPM (may already include the device-local tempo multiplier). */
  tempo: number;
  /** Song root note pitch class (0-11), from Song.root_note. */
  rootNote: number;
  /** Song.scale_name display string. */
  scaleName: string;
  /** Semitone intervals of the current scale, from Song.scale_intervals. */
  scaleIntervals: readonly number[];
  /** Whether Live scale mode is active (Song.scale_mode). */
  scaleMode: boolean;
  timeSignature: TimeSignature;
  /** Song.is_playing. */
  isPlaying: boolean;
  /** Current Live Set position in beats, supplied by Song.current_song_time. */
  currentSongTime: number;
}

/** Optional remapping of trigger velocity onto motif note velocities. */
export interface VelocityCurve {
  inputMin?: number;
  inputMax?: number;
  outputMin?: number;
  outputMax?: number;
  /** Shape exponent; 1 is linear. */
  exponent?: number;
}

/** One note (or rest gap) inside a motif phrase. */
export interface MotifNote {
  /** Start position in source PPQ ticks. Gaps between notes represent rests. */
  at: number;
  /** Nominal duration in source PPQ ticks. */
  duration: number;
  /** Scale-degree or semitone offset, depending on pitchMode. */
  pitch: number;
  /** Hybrid-mode chromatic alteration applied after scale-degree mapping. */
  accidental?: number;
  /** Absolute velocity. When omitted, the curved trigger velocity is used. */
  velocity?: number;
  /** Added after scale/absolute velocity resolution (before clamp to 1-127). */
  velocityOffset?: number;
  /** Multiplier applied to the base velocity (default 1). */
  velocityScale?: number;
  /** Per-note gate multiplier. */
  gate?: number;
  /** Extend to the next event when practical. */
  legato?: boolean;
  /** Merge a contiguous note with the following note of the same encoded pitch. */
  tie?: boolean;
}

/**
 * Versioned phrase document stored as JSON under `motifs/` or the user library.
 * Validate with `validateMotif` before adding to the store or writing to disk.
 */
export interface Motif {
  schemaVersion: 1;
  id: string;
  name: string;
  description: string;
  pitchMode: PitchMode;
  sourceMeter: TimeSignature;
  /** Phrase length in PPQ ticks (usually last note end). */
  length: number;
  notes: readonly MotifNote[];
  /** Default gate when a note omits `gate`. */
  defaultGate?: number;
  velocityCurve?: VelocityCurve;
}

/** Options for compiling a motif into scheduled MIDI note-on/off events. */
export interface CompileOptions {
  /** Overrides the motif's stored pitchMode for this compile. */
  pitchMode?: PitchMode;
  meterMode: MeterMode;
  channel: number;
  triggerPitch: number;
  triggerVelocity: number;
  /** Extra delay before the phrase starts (launch quantization). */
  launchOffsetTicks?: number;
  /** Groups events for replace/overlap cancel bookkeeping. */
  instanceId?: number;
}

/** One MIDI note-on (velocity > 0) or note-off (velocity 0) at a relative offset. */
export interface ScheduledMidiEvent {
  pitch: number;
  velocity: number;
  channel: number;
  offsetTicks: number;
  offsetMs: number;
  instanceId: number;
}

/** Inclusive MIDI note range that can trigger motifs. */
export interface TriggerZone {
  low: number;
  high: number;
}
