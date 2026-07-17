export const PPQ = 960;

export type PitchMode = 'scale' | 'chromatic';
export type MeterMode = 'preserve' | 'fit-bar';
export type RetriggerMode = 'replace' | 'overlap';

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
}

export interface MotifNote {
  /** Start position in source PPQ ticks. */
  at: number;
  /** Duration in source PPQ ticks. */
  duration: number;
  /** Scale-degree offset or semitone offset, depending on the active pitch mode. */
  pitch: number;
  /** Absolute velocity. When omitted, the trigger velocity is used. */
  velocity?: number;
  /** Added after resolving the absolute or trigger velocity. */
  velocityOffset?: number;
  /** Multiplied before velocityOffset. */
  velocityScale?: number;
}

export interface Motif {
  id: string;
  name: string;
  description: string;
  pitchMode: PitchMode;
  sourceMeter: TimeSignature;
  length: number;
  notes: readonly MotifNote[];
  tags?: readonly string[];
}

export interface CompileOptions {
  pitchMode?: PitchMode;
  meterMode: MeterMode;
  channel: number;
  triggerPitch: number;
  triggerVelocity: number;
}

export interface ScheduledMidiEvent {
  pitch: number;
  velocity: number;
  channel: number;
  offsetTicks: number;
  offsetMs: number;
}
