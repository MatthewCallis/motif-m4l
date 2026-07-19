/**
 * Tick/tempo helpers for motif timing, launch quantization, and ms conversion.
 * Motif PPQ matches {@link PPQ} (960). Live song position arrives in beats.
 */

import { PPQ, type LaunchQuantization, type TimeSignature } from './types.js';

/** Length of one bar in PPQ ticks for the given meter. */
export function barLengthTicks(signature: TimeSignature): number {
  return signature.numerator * PPQ * (4 / signature.denominator);
}

/** Convert PPQ ticks to milliseconds at `tempo` BPM (defaults to 120 if invalid). */
export function ticksToMilliseconds(ticks: number, tempo: number): number {
  const safeTempo = Number.isFinite(tempo) && tempo > 0 ? tempo : 120;
  return (ticks / PPQ) * (60_000 / safeTempo);
}

/** Grid size in PPQ ticks for a launch-quantization setting. */
export function quantizationTicks(
  quantization: LaunchQuantization,
  signature: TimeSignature,
): number {
  switch (quantization) {
    case '1/16':
      return PPQ / 4;
    case '1/8':
      return PPQ / 2;
    case '1/4':
      return PPQ;
    case 'bar':
      return barLengthTicks(signature);
    default:
      return 0;
  }
}

/**
 * Ticks from `positionTicks` until the next multiple of `gridTicks`.
 * Returns 0 when already on a boundary or inputs are invalid.
 */
export function ticksUntilNextBoundary(positionTicks: number, gridTicks: number): number {
  if (!Number.isFinite(positionTicks) || gridTicks <= 0) {
    return 0;
  }

  const remainder = ((positionTicks % gridTicks) + gridTicks) % gridTicks;
  return remainder === 0 ? 0 : gridTicks - remainder;
}
