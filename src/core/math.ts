/** Clamp `value` into the inclusive `[minimum, maximum]` range. */
export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

/** Mathematical modulo that always returns a non-negative remainder. */
export function mod(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

/** Floor division toward −∞ (used for octave/degree arithmetic). */
export function floorDiv(value: number, divisor: number): number {
  return Math.floor(value / divisor);
}
