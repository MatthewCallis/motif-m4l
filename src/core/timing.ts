/**
 * Tick/tempo helpers for motif timing, launch quantization, and ms conversion.
 * Motif PPQ matches {@link PPQ} (960).
 * Live song position arrives in beats.
 */

import { PPQ, type LaunchQuantization, type RepeatRounding, type TimeSignature } from "./types.js";

/**
 * Length of one bar in PPQ ticks for the given meter.
 * @param {TimeSignature} signature The time signature.
 * @returns {number} The length of one bar in PPQ ticks.
 */
export function barLengthTicks(signature: TimeSignature): number {
  return signature.numerator * PPQ * (4 / signature.denominator);
}

/**
 * Round a phrase length upward to the next selected source-bar subdivision.
 * Exact mode preserves the original length. Rounded modes never shorten the
 * phrase, preventing a new cycle from starting before its source length ends.
 * @param {number} lengthTicks Stored motif length in source PPQ ticks.
 * @param {TimeSignature} sourceMeter Meter in which the motif was authored.
 * @param {RepeatRounding} rounding Selected hold-repeat rounding grid.
 * @returns {number} Exact or rounded source length in PPQ ticks.
 */
export function roundRepeatLengthTicks(
  lengthTicks: number,
  sourceMeter: TimeSignature,
  rounding: RepeatRounding,
): number {
  if (rounding === "exact") {
    return lengthTicks;
  }
  const barTicks = barLengthTicks(sourceMeter);
  let subdivision = 1;
  if (rounding === "1/4-bar") {
    subdivision = 0.25;
  } else if (rounding === "1/2-bar") {
    subdivision = 0.5;
  }
  const gridTicks = barTicks * subdivision;
  return Math.max(gridTicks, Math.ceil(lengthTicks / gridTicks) * gridTicks);
}

/**
 * Convert PPQ ticks to milliseconds at `tempo` BPM (defaults to 120 if invalid).
 * @param {number} ticks The number of PPQ ticks.
 * @param {number} tempo The tempo in BPM.
 * @returns {number} The number of milliseconds.
 */
export function ticksToMilliseconds(ticks: number, tempo: number): number {
  const safeTempo = Number.isFinite(tempo) && tempo > 0 ? tempo : 120;
  return (ticks / PPQ) * (60_000 / safeTempo);
}

/**
 * Grid size in PPQ ticks for a launch-quantization setting.
 * @param {LaunchQuantization} quantization The launch quantization setting.
 * @param {TimeSignature} signature The time signature.
 * @returns {number} The grid size in PPQ ticks.
 */
export function quantizationTicks(
  quantization: LaunchQuantization,
  signature: TimeSignature,
): number {
  switch (quantization) {
    case "1/16":
      return PPQ / 4;
    case "1/8":
      return PPQ / 2;
    case "1/4":
      return PPQ;
    case "bar":
      return barLengthTicks(signature);
    default:
      return 0;
  }
}

/**
 * Ticks from `positionTicks` until the next multiple of `gridTicks`.
 * Returns 0 when already on a boundary or inputs are invalid.
 * @param {number} positionTicks The current position in PPQ ticks.
 * @param {number} gridTicks The grid size in PPQ ticks.
 * @returns {number} The number of ticks until the next boundary or 0 if inputs are invalid.
 */
export function ticksUntilNextBoundary(positionTicks: number, gridTicks: number): number {
  if (!Number.isFinite(positionTicks) || !Number.isFinite(gridTicks) || gridTicks <= 0) {
    return 0;
  }
  const remainder = ((positionTicks % gridTicks) + gridTicks) % gridTicks;
  return remainder === 0 ? 0 : gridTicks - remainder;
}
