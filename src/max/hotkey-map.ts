import { clamp } from "../core/math.js";
import { parseMidiNoteName } from "../core/preview.js";
import type { MotifStore } from "../library/store.js";

/** Behavior assigned to one MIDI hot key. */
export type HotkeyAction = "trigger" | "select";

/** A MIDI hot key's stable motif target and note-on behavior. */
export interface HotkeyMapping {
  /** Stable motif id. */
  motifId: string;
  /** Note-on behavior. */
  action: HotkeyAction;
}

/** Successful hotkey assignment. */
export interface HotkeyAssignment {
  /** Parsed MIDI pitch. */
  pitch: number;
  /** Resolved stable motif id. */
  motifId: string;
  /** Validated note-on behavior. */
  action: HotkeyAction;
}

/** Result returned while validating a hotkey assignment. */
export type HotkeyAssignmentResult =
  | { ok: true; assignment: HotkeyAssignment }
  | { ok: false; error: string };

/**
 * Parse a numeric pitch or Ableton-style note name.
 * @param {number | string} value MIDI pitch or note name.
 * @returns {number | undefined} Rounded, clamped pitch or undefined for invalid input.
 */
function hotkeyPitch(value: number | string): number | undefined {
  if (typeof value === "string") {
    const named = parseMidiNoteName(value);
    if (named !== undefined) {
      return named;
    }
    const numeric = Number(value);
    return Number.isFinite(numeric) ? Math.round(clamp(numeric, 0, 127)) : undefined;
  }
  return Number.isFinite(value) ? Math.round(clamp(value, 0, 127)) : undefined;
}

/** Owns MIDI-pitch-to-motif assignments and their catalog validation. */
export class MotifHotkeyMap {
  /** MIDI-pitch-to-motif assignments. */
  mappings = new Map<number, HotkeyMapping>();
  /** Motif identity source used to resolve and prune assignments. */
  store: MotifStore;

  /**
   * Create an assignment map resolved against one motif catalog.
   * @param {MotifStore} store Motif identity source.
   */
  constructor(store: MotifStore) {
    this.store = store;
  }

  /**
   * Read the mapping for a MIDI pitch.
   * @param {number} pitch MIDI pitch.
   * @returns {HotkeyMapping | undefined} Current assignment.
   */
  get(pitch: number): HotkeyMapping | undefined {
    return this.mappings.get(pitch);
  }

  /**
   * Determine whether a pitch has an explicit assignment.
   * @param {number} pitch MIDI pitch.
   * @returns {boolean} Whether a mapping exists.
   */
  has(pitch: number): boolean {
    return this.mappings.has(pitch);
  }

  /**
   * Snapshot every assignment in deterministic pitch order.
   * @returns {HotkeyAssignment[]} Stable serializable assignments.
   */
  list(): HotkeyAssignment[] {
    return [...this.mappings]
      .map(([pitch, mapping]) => ({ pitch, motifId: mapping.motifId, action: mapping.action }))
      .sort((left, right) => left.pitch - right.pitch);
  }

  /**
   * Validate and store one assignment.
   * @param {number | string} pitchValue MIDI pitch or Ableton-style note name.
   * @param {string} motifValue Motif id, generated label, or display name.
   * @param {string} actionValue Requested `trigger` or `select` behavior.
   * @returns {HotkeyAssignmentResult} Assignment details or a user-facing error.
   */
  assign(
    pitchValue: number | string,
    motifValue: string,
    actionValue = "trigger",
  ): HotkeyAssignmentResult {
    const pitch = hotkeyPitch(pitchValue);
    if (pitch === undefined) {
      return { ok: false, error: `Cannot map invalid MIDI note: ${String(pitchValue)}` };
    }
    const motif = this.store.resolve(motifValue);
    if (!motif) {
      return { ok: false, error: `Cannot map ${pitch}: unknown motif ${motifValue}` };
    }
    if (actionValue !== "trigger" && actionValue !== "select") {
      return { ok: false, error: `Cannot map ${pitch}: unknown hot-key action ${actionValue}` };
    }

    const action: HotkeyAction = actionValue;
    const assignment = { pitch, motifId: motif.id, action };
    this.mappings.set(pitch, { motifId: motif.id, action });
    return { ok: true, assignment };
  }

  /**
   * Remove one assignment.
   * @param {number | string} pitchValue MIDI pitch or Ableton-style note name.
   * @returns {number | undefined} Parsed pitch, or undefined for invalid input.
   */
  remove(pitchValue: number | string): number | undefined {
    const pitch = hotkeyPitch(pitchValue);
    if (pitch === undefined) {
      return undefined;
    }
    this.mappings.delete(pitch);
    return pitch;
  }

  /**
   * Remove every assignment.
   * @returns {number[]} Pitches that were assigned before clearing.
   */
  clear(): number[] {
    const pitches = [...this.mappings.keys()];
    this.mappings.clear();
    return pitches;
  }

  /**
   * Remove assignments whose motif ids no longer exist.
   * @returns {number[]} Pitches removed from the map.
   */
  prune(): number[] {
    const removed: number[] = [];
    for (const [pitch, mapping] of this.mappings) {
      if (!this.store.has(mapping.motifId)) {
        this.mappings.delete(pitch);
        removed.push(pitch);
      }
    }
    return removed;
  }

  /**
   * List sorted assignments targeting one motif.
   * @param {string} motifId Stable motif id.
   * @returns {Array<{ pitch: number; action: HotkeyAction }>} Sorted assignments.
   */
  forMotif(motifId: string): Array<{ pitch: number; action: HotkeyAction }> {
    return [...this.mappings]
      .filter(([, mapping]) => mapping.motifId === motifId)
      .map(([pitch, mapping]) => ({ pitch, action: mapping.action }))
      .sort((left, right) => left.pitch - right.pitch);
  }

  /**
   * Build a motifId ➜ sorted assignments index in one pass over all mappings.
   * Use instead of repeated {@link forMotif} calls when projecting all items.
   * @returns {Map<string, Array<{ pitch: number; action: HotkeyAction }>>} Index.
   */
  byMotif(): Map<string, Array<{ pitch: number; action: HotkeyAction }>> {
    const index = new Map<string, Array<{ pitch: number; action: HotkeyAction }>>();
    for (const [pitch, mapping] of this.mappings) {
      let entries = index.get(mapping.motifId);
      if (!entries) {
        entries = [];
        index.set(mapping.motifId, entries);
      }
      entries.push({ pitch, action: mapping.action });
    }
    for (const entries of index.values()) {
      entries.sort((left, right) => left.pitch - right.pitch);
    }
    return index;
  }
}
