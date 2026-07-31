import type { MotifPreview } from "../core/preview.js";
import {
  barLengthTicks,
  quantizationTicks,
  ticksToMilliseconds,
  ticksUntilNextBoundary,
} from "../core/timing.js";
import {
  PPQ,
  type HostContext,
  type LaunchQuantization,
  type MeterMode,
  type Motif,
  type RetriggerMode,
  type TimeSignature,
} from "../core/types.js";
import { MIN_REPEAT_DELAY_MS, RETRIGGER_MODES, TEMPO_MULTIPLIERS } from "./device-types.js";
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
 * Format the selected motif summary rendered by the Library.
 * @param {Pick<MotifPreview, 'notes' | 'bars' | 'effectivePitchMode'>} preview Preview aggregates.
 * @param {TimeSignature} sourceMeter Stored source meter.
 * @returns {string} Note, bar, meter, and pitch-mode summary.
 */
export function formatLibraryMotifStats(
  preview: Pick<MotifPreview, "notes" | "bars" | "effectivePitchMode">,
  sourceMeter: TimeSignature,
): string {
  const meter = `${sourceMeter.numerator}/${sourceMeter.denominator}`;
  // Preserve meaningful half-bar values without displaying redundant decimal zeros.
  const barCount = Number.isInteger(preview.bars)
    ? String(preview.bars)
    : preview.bars.toFixed(1).replace(/\.0$/, "");
  const notes = `${preview.notes.length} ${preview.notes.length === 1 ? "note" : "notes"}`;
  const bars = `${barCount} ${preview.bars === 1 ? "bar" : "bars"}`;
  return `${notes}  •  ${bars}  •  ${meter} source  •  ${preview.effectivePitchMode}`;
}

/**
 * Calculate a quantized launch offset from the observed Song position.
 * @param {HostContext} host Observed Song context.
 * @param {LaunchQuantization} launchQuantization Selected launch grid.
 * @returns {number} Non-negative launch offset in PPQ ticks.
 */
export function launchOffsetTicksFor(
  host: HostContext,
  launchQuantization: LaunchQuantization,
): number {
  if (!host.isPlaying || launchQuantization === "immediate") return 0;
  const grid = quantizationTicks(launchQuantization, host.timeSignature);
  return ticksUntilNextBoundary(Math.max(0, host.currentSongTime * PPQ), grid);
}

/**
 * Convert one effective motif cycle to a safe repeat-task delay.
 * @param {Motif} motif Motif that will repeat.
 * @param {MeterMode} meterMode Current meter scaling behavior.
 * @param {HostContext} host Observed Song context.
 * @param {number} tempoMultiplier Device-local tempo ratio.
 * @returns {number} Repeat interval in milliseconds.
 */
export function motifRepeatDelayFor(
  motif: Motif,
  meterMode: MeterMode,
  host: HostContext,
  tempoMultiplier: number,
): number {
  const effectiveLength =
    meterMode === "preserve"
      ? motif.length
      : motif.length * (barLengthTicks(host.timeSignature) / barLengthTicks(motif.sourceMeter));
  return Math.max(
    MIN_REPEAT_DELAY_MS,
    ticksToMilliseconds(effectiveLength, host.tempo * tempoMultiplier),
  );
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
  if (value === 1) return RETRIGGER_MODES[0];
  if (value === 0) return RETRIGGER_MODES[1];
  return typeof value === "string" && isStringEnumValue(value, RETRIGGER_MODES) ? value : undefined;
}
