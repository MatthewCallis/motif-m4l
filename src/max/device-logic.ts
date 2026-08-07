import { type RetriggerMode } from "../core/types.js";
import { RETRIGGER_MODES, TEMPO_MULTIPLIERS } from "./device-types.js";
import { flattenValues } from "./max-helpers.js";

/**
 * Determine whether a string belongs to one readonly string enum.
 * @param {string} value Candidate value.
 * @param {readonly T[]} values Allowed values.
 * @returns {value is T} Whether the candidate is allowed.
 */
export function isStringEnumValue<T extends string>(
  value: string,
  values: readonly T[],
): value is T {
  return values.some((candidate) => candidate === value);
}

/**
 * Normalize a Max Library search message into one query string.
 * @param {readonly unknown[]} values Possibly nested Max atoms.
 * @returns {string} Trimmed query.
 */
export function libraryQueryFromAtoms(values: readonly unknown[]): string {
  return flattenValues(values)
    .map(String)
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ")
    .trim();
}

/**
 * Parse a configured tempo multiplier, accepting optional `x` suffixes.
 * @param {string | number} value Submitted multiplier.
 * @returns {number | undefined} Supported ratio or undefined.
 */
export function parseTempoMultiplier(value: string | number): number | undefined {
  const parsed = typeof value === "number" ? value : Number(String(value).replace(/x$/i, ""));
  return TEMPO_MULTIPLIERS.some((candidate) => candidate === parsed) ? parsed : undefined;
}

/**
 * Parse Max's numeric or symbolic retrigger representation.
 * @param {string | number} value Submitted retrigger mode.
 * @returns {RetriggerMode | undefined} Normalized mode or undefined.
 */
export function parseRetriggerMode(value: string | number): RetriggerMode | undefined {
  if (value === 1) {
    return RETRIGGER_MODES[0];
  }
  if (value === 0) {
    return RETRIGGER_MODES[1];
  }
  return typeof value === "string" && isStringEnumValue(value, RETRIGGER_MODES) ? value : undefined;
}
