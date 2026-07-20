/**
 * Compile a relative motif phrase into timed MIDI note-on/off events using
 * the current Live host context (tempo, scale, meter) and trigger options.
 */

import { clamp } from './math.js';
import { transposeByScaleDegree, transposeChromatically, transposeHybrid } from './pitch.js';
import { barLengthTicks, ticksToMilliseconds } from './timing.js';
import type {
  CompileOptions,
  HostContext,
  Motif,
  MotifNote,
  ScheduledMidiEvent,
  VelocityCurve,
} from './types.js';

/**
 * Apply a velocity curve to a value, clamped to the output range.
 *
 * @param {number} value The value to apply the curve to.
 * @param {VelocityCurve | undefined} curve The velocity curve.
 * @returns {number} The value after the curve is applied. If no curve is provided, the value is returned unchanged.
 */
export function applyVelocityCurve(value: number, curve?: VelocityCurve): number {
  if (!curve) {
    return value;
  }
  const inputMin = curve.inputMin ?? 1;
  const inputMax = curve.inputMax ?? 127;
  const outputMin = curve.outputMin ?? 1;
  const outputMax = curve.outputMax ?? 127;
  const exponent = Math.max(0.01, curve.exponent ?? 1);
  const normalized = clamp((value - inputMin) / Math.max(1, inputMax - inputMin), 0, 1);
  return outputMin + (outputMax - outputMin) * normalized ** exponent;
}

/**
 * Resolve one motif note to a MIDI velocity for the active velocity mode.
 * Uses `options.velocityMode` when set, otherwise `motif.velocityMode`.
 * @param {MotifNote} note The motif note.
 * @param {Motif} motif The motif.
 * @param {number} triggerVelocity The trigger velocity.
 * @returns {number} The resolved velocity.
 */
export function resolveVelocity(note: MotifNote, motif: Motif, triggerVelocity: number): number {
  const curvedTrigger = applyVelocityCurve(triggerVelocity, motif.velocityCurve);
  const base = note.velocity ?? curvedTrigger;
  const scaled = base * (note.velocityScale ?? 1);
  return Math.round(clamp(scaled + (note.velocityOffset ?? 0), 1, 127));
}

/**
 * Resolve one motif note to an absolute MIDI pitch for the active pitch mode.
 * Uses `options.pitchMode` when set, otherwise `motif.pitchMode`.
 * @param {MotifNote} note The motif note.
 * @param {Motif} motif The motif.
 * @param {HostContext} host The host context.
 * @param {CompileOptions} options The compile options.
 * @returns {number} The resolved pitch.
 */
export function resolveMotifPitch(
  note: MotifNote,
  motif: Motif,
  host: HostContext,
  options: CompileOptions,
): number {
  const pitchMode = options.pitchMode ?? motif.pitchMode;

  switch (pitchMode) {
    case 'chromatic': {
      return transposeChromatically(options.triggerPitch, note.pitch + (note.accidental ?? 0));
    }
    case 'hybrid': {
      return transposeHybrid(
        options.triggerPitch,
        note.pitch,
        note.accidental ?? 0,
        host.rootNote,
        host.scaleIntervals,
      );
    }
    default: {
      return transposeByScaleDegree(
        options.triggerPitch,
        note.pitch,
        host.rootNote,
        host.scaleIntervals,
      );
    }
  }
}

/**
 * Calculate the effective duration of a motif note, taking into account gate,
 * legato, and tie duration rules.
 * @param {MotifNote} note The motif note.
 * @param {MotifNote | undefined} next The next motif note.
 * @param {Motif} motif The motif.
 * @returns {number} The effective duration in ticks.
 */
export function effectiveDuration(note: MotifNote, next: MotifNote | undefined, motif: Motif): number {
  const gate = Math.max(0.01, note.gate ?? motif.defaultGate ?? 1);
  let duration = note.duration * gate;

  if (note.legato && next && next.at > note.at) {
    duration = Math.max(duration, next.at - note.at);
  }

  if (
    note.tie &&
    next &&
    next.at <= note.at + note.duration &&
    next.pitch === note.pitch &&
    (next.accidental ?? 0) === (note.accidental ?? 0)
  ) {
    duration = Math.max(duration, next.at + next.duration - note.at);
  }

  return duration;
}

/**
 * Expand a motif into sorted note-on/off {@link ScheduledMidiEvent}s.
 * Applies meter fit (`preserve` vs `fit-bar`), gate/legato/tie duration rules,
 * velocity curves, and launch offset. Offsets are provided in both ticks and ms
 * so Max `pipe` can schedule from milliseconds.
 * @param {Motif} motif The motif to compile.
 * @param {HostContext} host The host context.
 * @param {CompileOptions} options The compile options.
 * @returns {ScheduledMidiEvent[]} The sorted note-on/off {@link ScheduledMidiEvent}s.
 * @see https://docs.cycling74.com/reference/pipe
 */
export function compileMotif(
  motif: Motif,
  host: HostContext,
  options: CompileOptions,
): ScheduledMidiEvent[] {
  const targetBar = barLengthTicks(host.timeSignature);
  const sourceBar = barLengthTicks(motif.sourceMeter);
  const timeScale = options.meterMode === 'fit-bar' ? targetBar / sourceBar : 1;
  const channel = Math.round(clamp(options.channel, 1, 16));
  const launchOffsetTicks = Math.max(0, options.launchOffsetTicks ?? 0);
  const instanceId = options.instanceId ?? 0;
  const events: ScheduledMidiEvent[] = [];

  for (let index = 0; index < motif.notes.length; index += 1) {
    const note = motif.notes[index];
    if (!note) {
      continue;
    }

    const next = motif.notes[index + 1];
    const pitch = resolveMotifPitch(note, motif, host, options);
    const velocity = resolveVelocity(note, motif, options.triggerVelocity);
    const noteOnTicks = launchOffsetTicks + Math.max(0, note.at * timeScale);
    const duration = effectiveDuration(note, next, motif) * timeScale;
    const noteOffTicks = Math.max(noteOnTicks, noteOnTicks + duration);

    events.push({
      pitch,
      velocity,
      channel,
      offsetTicks: noteOnTicks,
      offsetMs: ticksToMilliseconds(noteOnTicks, host.tempo),
      instanceId,
    });
    events.push({
      pitch,
      velocity: 0,
      channel,
      offsetTicks: noteOffTicks,
      offsetMs: ticksToMilliseconds(noteOffTicks, host.tempo),
      instanceId,
    });
  }

  return events.sort((left, right) => {
    if (left.offsetTicks !== right.offsetTicks) {
      return left.offsetTicks - right.offsetTicks;
    }
    return left.velocity - right.velocity;
  });
}
