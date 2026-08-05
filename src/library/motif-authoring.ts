import { convertMotifPitchMode } from "../core/import-notes.js";
import { hasOwn, isRecord, jsonValuesEqual, primitiveText } from "../core/type-guards.js";
import type { Motif, MotifNote, PitchMode, SourcePitchContext } from "../core/types.js";
import { NOTE_EDIT_FIELDS, type NoteEditField } from "./note-edit-schema.js";
import { normalizeTags } from "./tags.js";

/** Immutable motif-property mutation outcome. */
export type MutationResult<T> =
  | { ok: true; value: T; changed: boolean }
  | { ok: false; error: string };

/** Immutable note-array mutation outcome. */
export type NoteMutationResult =
  | { ok: true; notes: MotifNote[]; statusValue: unknown }
  | { ok: false; error: string };

/**
 * Validate a required primitive text field.
 * @param {unknown} value Submitted value.
 * @param {string} field User-facing field name.
 * @returns {MutationResult<string>} Parsed text or validation error.
 */
function requiredText(value: unknown, field: string): MutationResult<string> {
  if (!["string", "number", "boolean"].includes(typeof value)) {
    return { ok: false, error: `${field} must be text` };
  }
  const text = primitiveText(value).trim();
  return text
    ? { ok: true, value: text, changed: false }
    : { ok: false, error: `${field} cannot be empty` };
}

/**
 * Validate an optional finite numeric field.
 * @param {unknown} value Submitted value.
 * @param {string} field User-facing field name.
 * @param {(number: number) => boolean} predicate Additional numeric constraint.
 * @param {string} requirement Human-readable numeric constraint.
 * @returns {MutationResult<number | undefined>} Parsed optional number or error.
 */
function optionalFiniteNumber(
  value: unknown,
  field: string,
  predicate: (number: number) => boolean = () => true,
  requirement = "a finite number",
): MutationResult<number | undefined> {
  if (value === null || value === undefined || value === "") {
    return { ok: true, value: undefined, changed: false };
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) && predicate(numeric)
    ? { ok: true, value: numeric, changed: false }
    : { ok: false, error: `${field} must be ${requirement}` };
}

function sourcePitchContext(
  current: SourcePitchContext,
  value: unknown,
): MutationResult<SourcePitchContext> {
  const record = isRecord(value) ? value : undefined;
  if (!record) return { ok: false, error: "sourcePitchContext must be an object" };

  const anchorPitch = Number(record.anchorPitch);
  if (!Number.isInteger(anchorPitch) || anchorPitch < 0 || anchorPitch > 127) {
    return { ok: false, error: "sourcePitchContext.anchorPitch must be an integer from 0 to 127" };
  }
  const scaleRootNote = Number(record.scaleRootNote);
  if (!Number.isInteger(scaleRootNote) || scaleRootNote < 0 || scaleRootNote > 11) {
    return { ok: false, error: "sourcePitchContext.scaleRootNote must be an integer from 0 to 11" };
  }
  const parsedName = requiredText(record.scaleName, "sourcePitchContext.scaleName");
  if (!parsedName.ok) return parsedName;

  let scaleIntervals: number[] | null;
  if (record.scaleIntervals === null) {
    scaleIntervals = null;
  } else if (Array.isArray(record.scaleIntervals)) {
    const parsedIntervals = record.scaleIntervals.map(Number);
    if (
      parsedIntervals.length < 1 ||
      parsedIntervals.length > 12 ||
      parsedIntervals.some(
        (interval, index) =>
          !Number.isInteger(interval) ||
          interval < 0 ||
          interval > 11 ||
          (index === 0 ? interval !== 0 : interval <= (parsedIntervals[index - 1] ?? -1)),
      )
    ) {
      return {
        ok: false,
        error:
          "sourcePitchContext.scaleIntervals must be null or sorted, unique integers from 0 to 11 starting at 0",
      };
    }
    scaleIntervals = parsedIntervals;
  } else {
    return { ok: false, error: "sourcePitchContext.scaleIntervals must be an array or null" };
  }

  const parsed: SourcePitchContext = {
    anchorPitch,
    scaleRootNote,
    scaleName: parsedName.value,
    scaleIntervals,
  };
  return { ok: true, value: parsed, changed: !jsonValuesEqual(parsed, current) };
}

/**
 * Validate and apply the editable motif fields submitted by the Library UI.
 * @param {Motif} editable Current editable motif.
 * @param {unknown} value Submitted property record.
 * @returns {MutationResult<Motif>} Immutable candidate motif or validation error.
 */
export function applyMotifProperties(editable: Motif, value: unknown): MutationResult<Motif> {
  const record = isRecord(value) ? value : undefined;
  if (!record) return { ok: false, error: "Motif properties must be an object" };

  if (hasOwn(record, "id") && primitiveText(record.id) !== editable.id) {
    return { ok: false, error: "Motif ID is generated and cannot be changed" };
  }
  if (hasOwn(record, "schemaVersion") && Number(record.schemaVersion) !== editable.schemaVersion) {
    return { ok: false, error: "schemaVersion is read-only" };
  }
  if (hasOwn(record, "length") && Number(record.length) !== editable.length) {
    return {
      ok: false,
      error: "Motif length is derived from note timing and cannot be changed directly",
    };
  }

  let name = editable.name;
  if (hasOwn(record, "name")) {
    const parsed = requiredText(record.name, "Motif name");
    if (!parsed.ok) return parsed;
    name = parsed.value;
  }

  let description = editable.description;
  if (hasOwn(record, "description")) {
    const parsed = requiredText(record.description, "Motif description");
    if (!parsed.ok) return parsed;
    description = parsed.value;
  }

  let pitchMode: PitchMode = editable.pitchMode;
  if (hasOwn(record, "pitchMode")) {
    const parsed = primitiveText(record.pitchMode);
    if (parsed !== "scale" && parsed !== "chromatic" && parsed !== "hybrid") {
      return { ok: false, error: "pitchMode must be scale, chromatic, or hybrid" };
    }
    pitchMode = parsed;
  }

  let sourceContext = editable.sourcePitchContext;
  if (hasOwn(record, "sourcePitchContext")) {
    const parsed = sourcePitchContext(sourceContext, record.sourcePitchContext);
    if (!parsed.ok) return parsed;
    sourceContext = parsed.value;
  }

  let sourceMeter = editable.sourceMeter;
  if (hasOwn(record, "sourceMeter")) {
    const meter = isRecord(record.sourceMeter) ? record.sourceMeter : undefined;
    if (!meter) return { ok: false, error: "sourceMeter must be an object" };
    const numerator = Number(meter.numerator);
    const denominator = Number(meter.denominator);
    if (!Number.isInteger(numerator) || numerator < 1) {
      return { ok: false, error: "sourceMeter.numerator must be a positive integer" };
    }
    if (![1, 2, 4, 8, 16, 32].includes(denominator)) {
      return {
        ok: false,
        error: "sourceMeter.denominator must be 1, 2, 4, 8, 16, or 32",
      };
    }
    sourceMeter = { numerator, denominator };
  }

  let defaultGate = editable.defaultGate;
  if (hasOwn(record, "defaultGate")) {
    const parsed = optionalFiniteNumber(
      record.defaultGate,
      "defaultGate",
      (number) => number > 0,
      "greater than zero",
    );
    if (!parsed.ok) return parsed;
    defaultGate = parsed.value;
  }

  let velocityCurve = editable.velocityCurve;
  if (hasOwn(record, "velocityCurve")) {
    const rawCurve = record.velocityCurve;
    if (rawCurve === null || rawCurve === undefined) {
      velocityCurve = undefined;
    } else {
      const curve = isRecord(rawCurve) ? rawCurve : undefined;
      if (!curve) return { ok: false, error: "velocityCurve must be an object" };
      const parsed: Record<string, number> = {};
      for (const field of ["inputMin", "inputMax", "outputMin", "outputMax"] as const) {
        const number = optionalFiniteNumber(curve[field], `velocityCurve.${field}`);
        if (!number.ok) return number;
        if (number.value !== undefined) parsed[field] = number.value;
      }
      const exponent = optionalFiniteNumber(
        curve.exponent,
        "velocityCurve.exponent",
        (number) => number > 0,
        "greater than zero",
      );
      if (!exponent.ok) return exponent;
      if (exponent.value !== undefined) parsed.exponent = exponent.value;
      velocityCurve = Object.keys(parsed).length > 0 ? parsed : undefined;
    }
  }

  let tags = editable.tags ? [...editable.tags] : undefined;
  if (hasOwn(record, "tags")) {
    const parsed = normalizeTags(record.tags);
    if (!parsed.ok) return parsed;
    tags = parsed.value.length > 0 ? parsed.value : undefined;
  }

  let pitchConverted: Motif;
  try {
    const sourceUpdated = { ...editable, sourcePitchContext: sourceContext };
    pitchConverted =
      pitchMode === editable.pitchMode
        ? sourceUpdated
        : convertMotifPitchMode(sourceUpdated, pitchMode);
  } catch (reason) {
    return { ok: false, error: reason instanceof Error ? reason.message : String(reason) };
  }
  const {
    defaultGate: _defaultGate,
    velocityCurve: _velocityCurve,
    tags: _tags,
    ...required
  } = pitchConverted;
  const candidate: Motif = {
    ...required,
    name,
    description,
    pitchMode,
    sourceMeter,
    ...(defaultGate !== undefined ? { defaultGate } : {}),
    ...(velocityCurve !== undefined ? { velocityCurve } : {}),
    ...(tags !== undefined ? { tags } : {}),
  };

  return {
    ok: true,
    value: candidate,
    changed: !jsonValuesEqual(candidate, editable),
  };
}

/**
 * Apply one indexed note field edit without mutating the source motif.
 * @param {Motif} motif Editable motif.
 * @param {number} index Zero-based note row.
 * @param {NoteEditField} field Property to change.
 * @param {unknown} value Submitted form value.
 * @returns {NoteMutationResult} Updated notes and normalized status value, or an error.
 */
export function updateMotifNote(
  motif: Motif,
  index: number,
  field: NoteEditField,
  value: unknown,
): NoteMutationResult {
  if (!NOTE_EDIT_FIELDS.includes(field)) {
    return { ok: false, error: `Unknown note field: ${field}` };
  }
  if (!Number.isInteger(index) || index < 0 || index >= motif.notes.length) {
    return { ok: false, error: `Unknown note row: ${index}` };
  }

  const current = motif.notes[index];
  if (!current) return { ok: false, error: `Unknown note row: ${index}` };
  const next: MotifNote = { ...current };
  let statusValue: unknown = value;

  if (field === "legato" || field === "tie") {
    const enabled = value === true || value === 1 || value === "1" || value === "true";
    if (enabled) next[field] = true;
    else delete next[field];
    statusValue = enabled;
  } else {
    const optional = value === null || value === undefined || value === "";
    const numeric = optional ? undefined : Number(value);
    if (numeric !== undefined && !Number.isFinite(numeric)) {
      return { ok: false, error: `Invalid ${field} value` };
    }

    switch (field) {
      case "pitch":
        if (numeric === undefined) return { ok: false, error: "pitch cannot be empty" };
        next.pitch = Math.round(numeric);
        statusValue = next.pitch;
        break;
      case "accidental":
        if (numeric === undefined || numeric === 0) delete next.accidental;
        else next.accidental = Math.round(numeric);
        statusValue = next.accidental ?? null;
        break;
      case "at":
        if (numeric === undefined || numeric < 0) {
          return { ok: false, error: "at must be zero or greater" };
        }
        next.at = Math.round(numeric);
        statusValue = next.at;
        break;
      case "duration":
        if (numeric === undefined || numeric <= 0) {
          return { ok: false, error: "duration must be greater than zero" };
        }
        next.duration = Math.round(numeric);
        statusValue = next.duration;
        break;
      case "gate":
        if (numeric === undefined) delete next.gate;
        else if (numeric <= 0) return { ok: false, error: "gate must be greater than zero" };
        else next.gate = numeric;
        statusValue = next.gate ?? null;
        break;
      case "velocity":
        if (numeric === undefined) delete next.velocity;
        else if (!Number.isInteger(numeric) || numeric < 1 || numeric > 127) {
          return { ok: false, error: "velocity must be an integer between 1 and 127" };
        } else next.velocity = numeric;
        statusValue = next.velocity ?? null;
        break;
      case "velocityOffset":
        if (numeric === undefined || numeric === 0) delete next.velocityOffset;
        else next.velocityOffset = numeric;
        statusValue = next.velocityOffset ?? null;
        break;
      case "velocityScale":
        if (numeric === undefined) delete next.velocityScale;
        else if (numeric < 0) {
          return { ok: false, error: "velocityScale must be zero or greater" };
        } else next.velocityScale = numeric;
        statusValue = next.velocityScale ?? null;
        break;
    }
  }

  return {
    ok: true,
    notes: motif.notes.map((note, noteIndex) => (noteIndex === index ? next : note)),
    statusValue,
  };
}

/**
 * Append the Library editor's default note after the current last note.
 * @param {Motif} motif Editable motif.
 * @param {number} limit Maximum allowed note count.
 * @returns {NoteMutationResult} Extended note list or limit error.
 */
export function appendMotifNote(motif: Motif, limit: number): NoteMutationResult {
  if (motif.notes.length >= limit) {
    return { ok: false, error: `Maximum ${limit} notes per motif` };
  }
  const lastAt = motif.notes.at(-1)?.at ?? 0;
  const lastDuration = motif.notes.at(-1)?.duration ?? 240;
  return {
    ok: true,
    notes: [...motif.notes, { pitch: 0, at: lastAt + lastDuration, duration: 240 }],
    statusValue: null,
  };
}

/**
 * Remove an indexed note while preserving the store's non-empty invariant.
 * @param {Motif} motif Editable motif.
 * @param {number} index Zero-based note row.
 * @returns {NoteMutationResult} Shortened note list or row error.
 */
export function removeMotifNote(motif: Motif, index: number): NoteMutationResult {
  if (index < 0 || index >= motif.notes.length) {
    return { ok: false, error: `Unknown note row: ${index}` };
  }
  return {
    ok: true,
    notes: motif.notes.filter((_, noteIndex) => noteIndex !== index),
    statusValue: null,
  };
}
