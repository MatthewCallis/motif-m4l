import { midiNoteName } from "../core/preview.js";
import type { MotifNote } from "../core/types.js";
import type { HotkeyAction } from "./hotkey-map.js";
import {
  LIBRARY_STATE_CHUNK_CHARACTERS,
  LIBRARY_STATE_CHUNK_KIND,
  MAX_INLINE_LIBRARY_STATE_CHARACTERS,
  type LibraryHotkeyData,
  type LibraryNoteData,
  type LibraryStateChunk,
} from "./library-protocol.js";

/**
 * Convert a sparse stored note into the complete shape expected by form controls.
 * @param {MotifNote} note Stored motif note.
 * @returns {LibraryNoteData} Form-safe note with explicit nulls and booleans.
 */
export function toLibraryNoteData(note: MotifNote): LibraryNoteData {
  return {
    pitch: note.pitch,
    accidental: note.accidental ?? null,
    at: note.at,
    duration: note.duration,
    gate: note.gate ?? null,
    velocity: note.velocity ?? null,
    velocityOffset: note.velocityOffset ?? null,
    velocityScale: note.velocityScale ?? null,
    legato: note.legato ?? false,
    tie: note.tie ?? false,
  };
}

/**
 * Add the display label needed by the Library without duplicating MIDI note-name rules in HTML.
 * @param {{ pitch: number; action: HotkeyAction }} mapping Stored hot-key mapping.
 * @returns {LibraryHotkeyData} Mapping with its Ableton-style note label.
 */
export function toLibraryHotkeyData(mapping: {
  pitch: number;
  action: HotkeyAction;
}): LibraryHotkeyData {
  return {
    ...mapping,
    label: midiNoteName(mapping.pitch),
  };
}

/**
 * Encode one authoritative Library state into Max-safe jweb messages.
 *
 * URL encoding expands punctuation enough that an otherwise small motif can
 * exceed Max's per-atom string capacity. Large states are therefore split as
 * encoded text, then wrapped in independently decodable transport envelopes.
 *
 * @param {unknown} state Complete Library state owned by the device.
 * @param {number} transferId Monotonic identity for a chunked transfer.
 * @returns {string[]} URL-encoded direct state or bounded chunk envelopes.
 */
export function encodeLibraryStateMessages(state: unknown, transferId: number): string[] {
  const encodedState = encodeURIComponent(JSON.stringify(state));
  if (encodedState.length <= MAX_INLINE_LIBRARY_STATE_CHARACTERS) return [encodedState];

  const total = Math.ceil(encodedState.length / LIBRARY_STATE_CHUNK_CHARACTERS);
  return Array.from({ length: total }, (_, index) => {
    const payload: LibraryStateChunk = {
      kind: LIBRARY_STATE_CHUNK_KIND,
      transferId,
      index,
      total,
      data: encodedState.slice(
        index * LIBRARY_STATE_CHUNK_CHARACTERS,
        (index + 1) * LIBRARY_STATE_CHUNK_CHARACTERS,
      ),
    };
    return encodeURIComponent(JSON.stringify(payload));
  });
}
