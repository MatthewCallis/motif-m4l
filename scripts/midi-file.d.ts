/**
 * Minimal ambient typings for the `midi-file` package used by the conversion scripts.
 * Not a full upstream type definition - only fields Motif import/export touch.
 */
declare module 'midi-file' {
  export interface MidiEvent {
    deltaTime: number;
    type: string;
    channel?: number;
    noteNumber?: number;
    velocity?: number;
    microsecondsPerBeat?: number;
    meta?: boolean;
    [key: string]: unknown;
  }
  export interface MidiData {
    header: { format: number; numTracks: number; ticksPerBeat?: number };
    tracks: MidiEvent[][];
  }
  export function parseMidi(data: Uint8Array): MidiData;
  export function writeMidi(data: MidiData): Uint8Array;
}
