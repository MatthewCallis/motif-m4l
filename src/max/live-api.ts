import type { AbsoluteNote } from '../core/import-notes.js';
import { clamp } from '../core/math.js';
import { isRecord } from '../core/type-guards.js';
import { PPQ } from '../core/types.js';

// Clip import is the device's only LiveAPI use. Continuous Song context stays
// on native live.path/live.observer objects in the Max patch.
// @see https://docs.cycling74.com/apiref/js/liveapi/
// @see https://docs.cycling74.com/apiref/lom/clip/

/**
 * Check LiveAPI's zero-id invalid-object convention.
 * @param {LiveAPI | undefined} api Candidate Live object.
 * @returns {boolean} Whether the object resolves to a Live id.
 */
function isLiveApiValid(api: LiveAPI | undefined): api is LiveAPI {
  return api !== undefined && api.id !== 0;
}

/**
 * Interpret scalar and one-atom LiveAPI property values as booleans.
 * @param {unknown} value LiveAPI result.
 * @returns {boolean} Normalized truthiness.
 */
function liveTruthy(value: unknown): boolean {
  if (Array.isArray(value)) return liveTruthy(value[0]);
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized !== '' && normalized !== '0' && normalized !== 'false' && normalized !== 'id 0';
  }
  return Boolean(value);
}

/**
 * Reject known audio clips while tolerating older missing MIDI properties.
 * @param {LiveAPI} api Clip object.
 * @returns {boolean} Whether note import should be attempted.
 */
function isMidiClip(api: LiveAPI): boolean {
  try {
    if (liveTruthy(api.get('is_midi_clip'))) return true;
    if (liveTruthy(api.get('is_audio_clip'))) return false;
  } catch {
    // Property missing: let the subsequent note read fail soft.
  }
  return true;
}

/**
 * Resolve the Detail View MIDI clip, falling back to the highlighted slot.
 * @returns {LiveAPI | undefined} Selected MIDI clip, when available.
 */
export function resolveDetailClip(): LiveAPI | undefined {
  if (typeof LiveAPI === 'undefined') return undefined;

  try {
    const detail = new LiveAPI(undefined, 'live_set view detail_clip');
    if (isLiveApiValid(detail) && isMidiClip(detail)) return detail;
  } catch {
    // detail_clip path unavailable
  }

  try {
    const slot = new LiveAPI(undefined, 'live_set view highlighted_clip_slot');
    if (!isLiveApiValid(slot) || !liveTruthy(slot.get('has_clip'))) return undefined;
    const clip = new LiveAPI(undefined, 'live_set view highlighted_clip_slot clip');
    if (isLiveApiValid(clip) && isMidiClip(clip)) return clip;
  } catch {
    // No highlighted clip slot / empty slot.
  }

  return undefined;
}

/**
 * Parse LiveAPI JSON strings and Max Dict-like payloads.
 * @param {unknown} raw Raw `get_notes_extended` result.
 * @returns {unknown} Parsed payload or undefined after a parse failure.
 */
function coerceNotesPayload(raw: unknown): unknown {
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return undefined;
    try {
      return JSON.parse(trimmed);
    } catch {
      return undefined;
    }
  }

  const dictLike = raw as { stringify?: () => string } | null;
  if (dictLike && typeof dictLike.stringify === 'function') {
    try {
      return JSON.parse(dictLike.stringify());
    } catch {
      return undefined;
    }
  }

  return raw;
}

/**
 * Parse Live 11+ `get_notes_extended` output into motif PPQ notes.
 * @param {unknown} raw Raw LiveAPI payload.
 * @returns {AbsoluteNote[]} Valid, unmuted notes in motif tick units.
 */
export function parseClipNotesExtended(raw: unknown): AbsoluteNote[] {
  const payload = coerceNotesPayload(raw);
  const record = isRecord(payload) ? payload : undefined;
  const notesValue = record?.notes;
  if (!Array.isArray(notesValue)) return [];

  const notes: AbsoluteNote[] = [];
  for (const entry of notesValue) {
    const note = isRecord(entry) ? entry : undefined;
    if (!note) continue;
    const pitch = Number(note.pitch);
    const startTime = Number(note.start_time ?? note.startTime);
    const duration = Number(note.duration);
    const velocity = Number(note.velocity ?? 100);
    if (!Number.isFinite(pitch) || !Number.isFinite(startTime) || !Number.isFinite(duration)) continue;
    if (note.mute === 1 || note.muted === 1 || note.mute === true) continue;
    notes.push({
      at: Math.round(startTime * PPQ),
      duration: Math.max(1, Math.round(duration * PPQ)),
      pitch: Math.round(pitch),
      velocity: Math.round(clamp(velocity, 1, 127)),
    });
  }
  return notes;
}

/**
 * Read every MIDI pitch from a clip with Live 11+'s documented API.
 * @param {LiveAPI} clip Selected MIDI clip.
 * @returns {AbsoluteNote[]} Imported notes in motif tick units.
 * @see https://docs.cycling74.com/apiref/js/liveapi/#call
 * @see https://docs.cycling74.com/apiref/lom/clip/#get_notes_extended
 */
export function readClipNotes(clip: LiveAPI): AbsoluteNote[] {
  const payload = clip.call('get_notes_extended', 0, 128, 0, 4096);
  return parseClipNotesExtended(payload);
}
