/**
 * MIDI file ↔ Motif JSON conversion shared by the standalone conversion CLIs.
 *
 * Import normalizes source PPQ to motif {@link PPQ} (960), then runs relative
 * analysis via `absoluteNotesToMotif`. Export compiles against a default major
 * host context so chromatic/scale offsets render as absolute MIDI.
 */

import { parseMidi, writeMidi, type MidiData, type MidiEvent } from "midi-file";
import { absoluteNotesToMotif, type AbsoluteNotesImportOptions } from "../src/core/import-notes.js";
import { compileMotif } from "../src/core/compile-motif.js";
import { PPQ, type HostContext, type Motif, type PitchMode } from "../src/core/types.js";
import { validateMotif } from "../src/library/validate.js";

/** Active note with its start time & velocity. */
interface ActiveNote {
  /** The time in ticks when the note started. */
  at: number;
  velocity: number;
}

/** Import options. Chromatic is the default so MIDI is preserved exactly. */
export type MidiImportOptions = Omit<AbsoluteNotesImportOptions, "pitchMode"> & {
  pitchMode?: PitchMode;
};

function noteKey(channel: number, note: number): string {
  return `${channel}:${note}`;
}

/**
 * Parse Standard MIDI File bytes into a relative Motif.
 * Note-off (or note-on velocity 0) closes the matching channel/pitch stack.
 * @param {Uint8Array} bytes The Standard MIDI File bytes to parse.
 * @param {MidiImportOptions} options The pitch-analysis options.
 * @returns {Motif} The imported relative motif.
 * @throws {Error} If the MIDI file contains no completed notes.
 */
export function midiBytesToMotif(bytes: Uint8Array, options: MidiImportOptions): Motif {
  const pitchMode = options.pitchMode ?? "chromatic";
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
      if (event.type !== "noteOn" && event.type !== "noteOff") {
        continue;
      }

      const channel = event.channel ?? 0;
      const noteNumber = event.noteNumber ?? 0;
      const velocity = event.velocity ?? 0;
      const key = noteKey(channel, noteNumber);
      const isOn = event.type === "noteOn" && velocity > 0;

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

  if (completed.length === 0) {
    throw new Error("MIDI file contains no completed notes");
  }

  return absoluteNotesToMotif(completed, {
    ...options,
    pitchMode,
    description: options.description ?? `Imported from MIDI using ${pitchMode} relative analysis.`,
  });
}

/**
 * Compile a Motif (or unknown JSON) to SMF bytes at motif PPQ.
 * Validates first; throws joined validation errors on failure.
 *
 * @param {unknown} value The motif value to validate and export.
 * @param {number} triggerPitch The anchor pitch for relative-to-absolute mapping.
 * @returns {Uint8Array} The encoded Standard MIDI File bytes.
 * @throws {Error} If the motif fails validation.
 */
export function motifToMidiBytes(value: unknown, triggerPitch = 60): Uint8Array {
  const validation = validateMotif(value);
  if (!validation.valid || !validation.motif) {
    throw new Error(validation.errors.join("; "));
  }

  const host: HostContext = {
    tempo: 120,
    rootNote: 0,
    scaleName: "Major",
    scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
    scaleMode: true,
    timeSignature: validation.motif.sourceMeter,
    isPlaying: false,
    currentSongTime: 0,
  };
  const events = compileMotif(validation.motif, host, {
    channel: 1,
    meterMode: "preserve",
    triggerPitch,
    triggerVelocity: 100,
  });
  const midiEvents: MidiEvent[] = [
    { deltaTime: 0, meta: true, type: "setTempo", microsecondsPerBeat: 500_000 },
  ];
  let previous = 0;
  for (const event of events) {
    midiEvents.push({
      deltaTime: Math.round(event.offsetTicks - previous),
      type: event.velocity > 0 ? "noteOn" : "noteOff",
      channel: event.channel - 1,
      noteNumber: event.pitch,
      velocity: event.velocity,
    });
    previous = event.offsetTicks;
  }
  midiEvents.push({ deltaTime: 0, meta: true, type: "endOfTrack" });

  const midi: MidiData = {
    header: { format: 0, numTracks: 1, ticksPerBeat: PPQ },
    tracks: [midiEvents],
  };
  return writeMidi(midi);
}
