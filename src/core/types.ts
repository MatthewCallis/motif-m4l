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
 * - `scale` - scale-degree offsets through Song scale intervals; retained accidentals are ignored
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

/** Grid used to round hold-repeat cycle boundaries. */
export type RepeatRounding = "exact" | "1/4-bar" | "1/2-bar" | "1-bar";

/** Device trigger-mode choice, including delegation to the triggered motif. */
export type TriggerModeOverride = "motif" | TriggerMode;

/** Device repeat-rounding choice, including delegation to the triggered motif. */
export type RepeatRoundingOverride = "motif" | RepeatRounding;

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
 * Continuous values come from native `live.observer` ➜ `song_context` messages.
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

/** Original pitch reference used to encode and later re-analyze a motif. */
export interface SourcePitchContext {
  /** Absolute MIDI note used as relative pitch offset zero. */
  anchorPitch: number;
  /** Original scale root pitch class (0-11). */
  scaleRootNote: number;
  /** Original Live scale label, retained for display and provenance. */
  scaleName: string;
  /**
   * Authoritative semitone intervals of the original scale. `null` means the
   * import was preserved chromatically but its source scale could not be resolved.
   */
  scaleIntervals: readonly number[] | null;
}

/** One note (or rest gap) inside a motif phrase. */
export interface MotifNote {
  /** Start position in source PPQ ticks. Gaps between notes represent rests. */
  at: number;
  /** Nominal duration in source PPQ ticks. */
  duration: number;
  /** Scale-degree or semitone offset, depending on pitchMode. */
  pitch: number;
  /** Retained source alteration; ignored by Scale and applied by Hybrid. */
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
  /** Unique identifier for the motif. */
  id: string;
  /** Display name of the motif. */
  name: string;
  /** Description of the motif. */
  description: string;
  /** How `MotifNote.pitch` is interpreted relative to the trigger note and Live scale. */
  pitchMode: PitchMode;
  /** Pitch and scale context under which the motif was authored or imported. */
  sourcePitchContext: SourcePitchContext;
  /** Source meter as numerator/denominator (e.g. 4/4, 6/8). */
  sourceMeter: TimeSignature;
  /** Phrase length in PPQ ticks (usually last note end). */
  length: number;
  /** Optional hold-repeat lifecycle; legacy motifs default to one-shot. */
  triggerMode?: TriggerMode;
  /** Optional hold-repeat cycle rounding; legacy motifs default to exact length. */
  repeatRounding?: RepeatRounding;
  /** Notes in the motif. */
  notes: readonly MotifNote[];
  /** Default gate when a note omits `gate`. */
  defaultGate?: number;
  /** Optional velocity curve for mapping trigger velocity to note velocity. */
  velocityCurve?: VelocityCurve;
  /** Optional freeform labels used for Library filtering and browse. */
  tags?: readonly string[];
}

/** Options for compiling a motif into scheduled MIDI note-on/off events. */
export interface CompileOptions {
  /** Source-aware override of the motif's stored pitchMode for this compile. */
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
