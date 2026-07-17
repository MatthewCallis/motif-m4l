import { clamp } from './math.js';
import { transposeByScaleDegree, transposeChromatically } from './pitch.js';
import { barLengthTicks, ticksToMilliseconds } from './timing.js';
import type {
  CompileOptions,
  HostContext,
  Motif,
  MotifNote,
  ScheduledMidiEvent,
} from './types.js';

function resolveVelocity(note: MotifNote, triggerVelocity: number): number {
  const base = note.velocity ?? triggerVelocity;
  const scaled = base * (note.velocityScale ?? 1);
  return Math.round(clamp(scaled + (note.velocityOffset ?? 0), 1, 127));
}

export function compileMotif(
  motif: Motif,
  host: HostContext,
  options: CompileOptions,
): ScheduledMidiEvent[] {
  const pitchMode = options.pitchMode ?? motif.pitchMode;
  const targetBar = barLengthTicks(host.timeSignature);
  const sourceBar = barLengthTicks(motif.sourceMeter);
  const timeScale = options.meterMode === 'fit-bar' ? targetBar / sourceBar : 1;
  const channel = Math.round(clamp(options.channel, 1, 16));
  const events: ScheduledMidiEvent[] = [];

  for (const note of motif.notes) {
    const pitch =
      pitchMode === 'chromatic'
        ? transposeChromatically(options.triggerPitch, note.pitch)
        : transposeByScaleDegree(
            options.triggerPitch,
            note.pitch,
            host.rootNote,
            host.scaleIntervals,
          );
    const velocity = resolveVelocity(note, options.triggerVelocity);
    const noteOnTicks = Math.max(0, note.at * timeScale);
    const noteOffTicks = Math.max(noteOnTicks, (note.at + note.duration) * timeScale);

    events.push({
      pitch,
      velocity,
      channel,
      offsetTicks: noteOnTicks,
      offsetMs: ticksToMilliseconds(noteOnTicks, host.tempo),
    });
    events.push({
      pitch,
      velocity: 0,
      channel,
      offsetTicks: noteOffTicks,
      offsetMs: ticksToMilliseconds(noteOffTicks, host.tempo),
    });
  }

  return events.sort((left, right) => {
    if (left.offsetTicks !== right.offsetTicks) {
      return left.offsetTicks - right.offsetTicks;
    }

    // End an existing note before starting another note at the same instant.
    return left.velocity - right.velocity;
  });
}
