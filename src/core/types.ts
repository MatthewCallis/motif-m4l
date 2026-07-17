export const PPQ = 960;
export const MOTIF_SCHEMA_VERSION = 1;

export type PitchMode = 'scale' | 'chromatic' | 'hybrid';
export type MeterMode = 'preserve' | 'fit-bar';
export type RetriggerMode = 'replace' | 'overlap';
export type TriggerMode = 'one-shot' | 'hold' | 'toggle' | 'latch' | 'release-tail';
export type LaunchQuantization = 'immediate' | '1/16' | '1/8' | '1/4' | 'bar';
export type PassThroughPolicy = 'none' | 'non-triggers' | 'all';
export type ScheduleUnit = 'ticks' | 'ms';

export interface TimeSignature {
  numerator: number;
  denominator: number;
}

export interface HostContext {
  tempo: number;
  rootNote: number;
  scaleName: string;
  scaleIntervals: readonly number[];
  scaleMode: boolean;
  timeSignature: TimeSignature;
  isPlaying: boolean;
}

export interface VelocityCurve {
  inputMin?: number;
  inputMax?: number;
  outputMin?: number;
  outputMax?: number;
  exponent?: number;
}

export interface MotifMetadata {
  author?: string;
  source?: string;
  license?: string;
  tags?: readonly string[];
  suggestedModes?: readonly string[];
  pickupTicks?: number;
}

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
  velocityOffset?: number;
  velocityScale?: number;
  /** Per-note gate multiplier. */
  gate?: number;
  /** Extend to the next event when practical. */
  legato?: boolean;
  /** Merge a contiguous note with the following note of the same encoded pitch. */
  tie?: boolean;
}

export interface Motif {
  schemaVersion: 1;
  id: string;
  name: string;
  description: string;
  pitchMode: PitchMode;
  sourceMeter: TimeSignature;
  length: number;
  notes: readonly MotifNote[];
  metadata?: MotifMetadata;
  defaultGate?: number;
  velocityCurve?: VelocityCurve;
}

export interface CompileOptions {
  pitchMode?: PitchMode;
  meterMode: MeterMode;
  channel: number;
  triggerPitch: number;
  triggerVelocity: number;
  launchOffsetTicks?: number;
  instanceId?: number;
}

export interface ScheduledMidiEvent {
  pitch: number;
  velocity: number;
  channel: number;
  offsetTicks: number;
  offsetMs: number;
  instanceId: number;
}

export interface TriggerZone {
  low: number;
  high: number;
}
