/**
 * Structural validation for Motif JSON before it enters the store or Max Console.
 * Error strings are human-readable paths suitable for `error()` / status UI.
 */

import {
  MOTIF_SCHEMA_VERSION,
  type Motif,
  type MotifNote,
  type PitchMode,
  type SourcePitchContext,
  type TimeSignature,
} from "../core/types.js";

/** Result of {@link validateMotif}; `motif` is present only when `valid` is true. */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  motif?: Motif;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isPitchMode(value: unknown): value is PitchMode {
  return value === "scale" || value === "chromatic" || value === "hybrid";
}

function validateMeter(value: unknown, path: string, errors: string[]): value is TimeSignature {
  if (!isRecord(value)) {
    errors.push(`${path} must be an object`);
    return false;
  }

  let valid = true;
  if (!Number.isInteger(value.numerator) || Number(value.numerator) < 1) {
    errors.push(`${path}.numerator must be a positive integer`);
    valid = false;
  }

  if (![1, 2, 4, 8, 16, 32].includes(Number(value.denominator))) {
    errors.push(`${path}.denominator must be 1, 2, 4, 8, 16, or 32`);
    valid = false;
  }

  return valid;
}

function validateSourcePitchContext(value: unknown, errors: string[]): value is SourcePitchContext {
  const path = "sourcePitchContext";
  if (!isRecord(value)) {
    errors.push(`${path} must be an object`);
    return false;
  }

  let valid = true;
  if (
    !Number.isInteger(value.anchorPitch) ||
    Number(value.anchorPitch) < 0 ||
    Number(value.anchorPitch) > 127
  ) {
    errors.push(`${path}.anchorPitch must be an integer between 0 and 127`);
    valid = false;
  }
  if (
    !Number.isInteger(value.scaleRootNote) ||
    Number(value.scaleRootNote) < 0 ||
    Number(value.scaleRootNote) > 11
  ) {
    errors.push(`${path}.scaleRootNote must be an integer between 0 and 11`);
    valid = false;
  }
  if (typeof value.scaleName !== "string" || value.scaleName.trim().length === 0) {
    errors.push(`${path}.scaleName must be a non-empty string`);
    valid = false;
  }

  const intervals = value.scaleIntervals;
  if (intervals !== null) {
    if (!Array.isArray(intervals) || intervals.length < 1 || intervals.length > 12) {
      errors.push(`${path}.scaleIntervals must be null or contain 1 to 12 integers`);
      valid = false;
    } else {
      const normalized = intervals.every(
        (interval, index) =>
          Number.isInteger(interval) &&
          interval >= 0 &&
          interval <= 11 &&
          (index === 0 ? interval === 0 : interval > Number(intervals[index - 1])),
      );
      if (!normalized) {
        errors.push(
          `${path}.scaleIntervals must be sorted, unique integers from 0 to 11 starting at 0`,
        );
        valid = false;
      }
    }
  }

  return valid;
}

function validateOptionalNumber(
  record: Record<string, unknown>,
  field: string,
  path: string,
  errors: string[],
  predicate: (value: number) => boolean = () => true,
  requirement = "a finite number",
): void {
  const value = record[field];
  if (value === undefined) {
    return;
  }
  if (!isFiniteNumber(value) || !predicate(value)) {
    errors.push(`${path}.${field} must be ${requirement}`);
  }
}

function validateNote(value: unknown, index: number, errors: string[]): value is MotifNote {
  const path = `notes[${index}]`;
  if (!isRecord(value)) {
    errors.push(`${path} must be an object`);
    return false;
  }

  if (!isFiniteNumber(value.at) || value.at < 0) {
    errors.push(`${path}.at must be a non-negative number`);
  }
  if (!isFiniteNumber(value.duration) || value.duration <= 0) {
    errors.push(`${path}.duration must be greater than zero`);
  }
  if (!isFiniteNumber(value.pitch)) {
    errors.push(`${path}.pitch must be a number`);
  }

  validateOptionalNumber(value, "accidental", path, errors);
  validateOptionalNumber(
    value,
    "velocity",
    path,
    errors,
    (number) => number >= 1 && number <= 127,
    "between 1 and 127",
  );
  validateOptionalNumber(value, "velocityOffset", path, errors);
  validateOptionalNumber(
    value,
    "velocityScale",
    path,
    errors,
    (number) => number >= 0,
    "zero or greater",
  );
  validateOptionalNumber(value, "gate", path, errors, (number) => number > 0, "greater than zero");

  for (const field of ["legato", "tie"] as const) {
    const fieldValue = value[field];
    if (fieldValue !== undefined && typeof fieldValue !== "boolean") {
      errors.push(`${path}.${field} must be a boolean`);
    }
  }

  return true;
}

function validateVelocityCurve(value: unknown, errors: string[]): void {
  if (value === undefined) {
    return;
  }
  if (!isRecord(value)) {
    errors.push("velocityCurve must be an object");
    return;
  }

  for (const field of ["inputMin", "inputMax", "outputMin", "outputMax"] as const) {
    validateOptionalNumber(value, field, "velocityCurve", errors);
  }
  validateOptionalNumber(
    value,
    "exponent",
    "velocityCurve",
    errors,
    (number) => number > 0,
    "greater than zero",
  );
}

/**
 * Validate unknown JSON against schema version {@link MOTIF_SCHEMA_VERSION}.
 * On success returns a typed Motif; on failure returns path-prefixed error messages.
 * @param {unknown} value The value to validate as a motif.
 * @returns {ValidationResult} The validation status, errors, and typed motif when valid.
 */
export function validateMotif(value: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isRecord(value)) {
    return { valid: false, errors: ["motif must be an object"] };
  }

  if (value.schemaVersion !== MOTIF_SCHEMA_VERSION) {
    errors.push(`schemaVersion must be ${MOTIF_SCHEMA_VERSION}`);
  }
  for (const field of ["id", "name", "description"] as const) {
    if (typeof value[field] !== "string" || value[field].trim().length === 0) {
      errors.push(`${field} must be a non-empty string`);
    }
  }
  if (!isPitchMode(value.pitchMode)) {
    errors.push("pitchMode must be scale, chromatic, or hybrid");
  }
  validateSourcePitchContext(value.sourcePitchContext, errors);
  validateMeter(value.sourceMeter, "sourceMeter", errors);
  if (!isFiniteNumber(value.length) || value.length <= 0) {
    errors.push("length must be greater than zero");
  }
  validateOptionalNumber(
    value,
    "defaultGate",
    "motif",
    errors,
    (number) => number > 0,
    "greater than zero",
  );
  validateVelocityCurve(value.velocityCurve, errors);

  if (!Array.isArray(value.notes) || value.notes.length === 0) {
    errors.push("notes must be a non-empty array");
  } else {
    value.notes.forEach((note, index) => validateNote(note, index, errors));
    const motifLength = value.length;
    if (isFiniteNumber(motifLength)) {
      value.notes.forEach((note, index) => {
        if (
          isRecord(note) &&
          isFiniteNumber(note.at) &&
          isFiniteNumber(note.duration) &&
          note.at + note.duration > motifLength
        ) {
          errors.push(`notes[${index}] extends beyond motif length`);
        }
      });
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, errors, motif: value as unknown as Motif };
}
