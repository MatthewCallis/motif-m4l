/**
 * Shared domain list of motif-note properties editable through the Library UI.
 * This is the authoritative source of truth; both the domain validation layer
 * and the browser UI must agree on this set.
 */

/** Motif-note properties accepted by indexed Library edits. */
export const NOTE_EDIT_FIELDS = [
  "pitch",
  "accidental",
  "at",
  "duration",
  "gate",
  "velocity",
  "velocityOffset",
  "velocityScale",
  "legato",
  "tie",
] as const;

/** Editable motif-note property name. */
export type NoteEditField = (typeof NOTE_EDIT_FIELDS)[number];
