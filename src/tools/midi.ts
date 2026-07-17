import { parseMidi, writeMidi, type MidiData, type MidiEvent } from 'midi-file';
import { compileMotif } from '../core/compile-motif.js';
import { floorDiv, mod } from '../core/math.js';
import { PPQ, type HostContext, type Motif, type PitchMode } from '../core/types.js';
import { validateMotif } from '../library/validate.js';

interface ActiveNote {
  at: number;
  velocity: number;
}

export interface MidiImportOptions {
  id: string;
  name: string;
  pitchMode: PitchMode;
  rootNote?: number;
  scaleIntervals?: readonly number[];
  sourceMeter?: { numerator: number; denominator: number };
}

function noteKey(channel: number, note: number): string {
  return `${channel}:${note}`;
}

function analyzeScaleOffset(
  semitoneOffset: number,
  intervals: readonly number[],
): { degree: number; accidental: number } {
  const octave = floorDiv(semitoneOffset, 12);
  const pitchClass = mod(semitoneOffset, 12);
  let bestDegree = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < intervals.length; index += 1) {
    const interval = intervals[index] ?? 0;
    const distance = Math.abs(pitchClass - interval);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestDegree = index;
    }
  }

  const scalePitch = intervals[bestDegree] ?? 0;
  return {
    degree: octave * intervals.length + bestDegree,
    accidental: pitchClass - scalePitch,
  };
}

export function midiBytesToMotif(bytes: Uint8Array, options: MidiImportOptions): Motif {
  const parsed = parseMidi(bytes);
  const sourcePpq = parsed.header.ticksPerBeat ?? PPQ;
  const ratio = PPQ / sourcePpq;
  const active = new Map<string, ActiveNote[]>();
  const completed: Array<{ at: number; duration: number; pitch: number; velocity: number }> = [];
  let absolute = 0;

  for (const track of parsed.tracks) {
    absolute = 0;
    for (const event of track) {
      absolute += event.deltaTime;
      if (event.type !== 'noteOn' && event.type !== 'noteOff') {
        continue;
      }

      const channel = event.channel ?? 0;
      const noteNumber = event.noteNumber ?? 0;
      const velocity = event.velocity ?? 0;
      const key = noteKey(channel, noteNumber);
      const isOn = event.type === 'noteOn' && velocity > 0;

      if (isOn) {
        const stack = active.get(key) ?? [];
        stack.push({ at: absolute, velocity });
        active.set(key, stack);
        continue;
      }

      const stack = active.get(key);
      const start = stack?.shift();
      if (!start) {
        continue;
      }
      completed.push({
        at: start.at * ratio,
        duration: Math.max(1, (absolute - start.at) * ratio),
        pitch: noteNumber,
        velocity: start.velocity,
      });
    }
  }

  completed.sort((left, right) => left.at - right.at || left.pitch - right.pitch);
  if (completed.length === 0) {
    throw new Error('MIDI file contains no completed notes');
  }

  const anchor = options.rootNote ?? completed[0]?.pitch ?? 60;
  const scaleIntervals = options.scaleIntervals ?? [0, 2, 4, 5, 7, 9, 11];
  const notes = completed.map((note) => {
    const semitoneOffset = note.pitch - anchor;
    if (options.pitchMode === 'chromatic') {
      return { at: note.at, duration: note.duration, pitch: semitoneOffset, velocity: note.velocity };
    }

    const analyzed = analyzeScaleOffset(semitoneOffset, scaleIntervals);
    return {
      at: note.at,
      duration: note.duration,
      pitch: analyzed.degree,
      ...(options.pitchMode === 'hybrid' && analyzed.accidental !== 0
        ? { accidental: analyzed.accidental }
        : {}),
      velocity: note.velocity,
    };
  });

  const length = Math.max(...notes.map((note) => note.at + note.duration));
  return {
    schemaVersion: 1,
    id: options.id,
    name: options.name,
    description: `Imported from MIDI using ${options.pitchMode} relative analysis.`,
    pitchMode: options.pitchMode,
    sourceMeter: options.sourceMeter ?? { numerator: 4, denominator: 4 },
    length,
    notes,
    metadata: { tags: ['imported', 'midi'] },
  };
}

export function motifToMidiBytes(value: unknown, triggerPitch = 60): Uint8Array {
  const validation = validateMotif(value);
  if (!validation.valid || !validation.motif) {
    throw new Error(validation.errors.join('; '));
  }

  const host: HostContext = {
    tempo: 120,
    rootNote: 0,
    scaleName: 'Major',
    scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
    scaleMode: true,
    timeSignature: validation.motif.sourceMeter,
    isPlaying: false,
  };
  const events = compileMotif(validation.motif, host, {
    channel: 1,
    meterMode: 'preserve',
    triggerPitch,
    triggerVelocity: 100,
  });
  const midiEvents: MidiEvent[] = [
    { deltaTime: 0, meta: true, type: 'setTempo', microsecondsPerBeat: 500_000 },
  ];
  let previous = 0;
  for (const event of events) {
    midiEvents.push({
      deltaTime: Math.round(event.offsetTicks - previous),
      type: event.velocity > 0 ? 'noteOn' : 'noteOff',
      channel: event.channel - 1,
      noteNumber: event.pitch,
      velocity: event.velocity,
    });
    previous = event.offsetTicks;
  }
  midiEvents.push({ deltaTime: 0, meta: true, type: 'endOfTrack' });

  const midi: MidiData = {
    header: { format: 0, numTracks: 1, ticksPerBeat: PPQ },
    tracks: [midiEvents],
  };
  return writeMidi(midi);
}
