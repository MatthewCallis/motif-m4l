/**
 * Clamp a number into an inclusive range.
 * @param {number} value The number to clamp.
 * @param {number} minimum The inclusive lower bound.
 * @param {number} maximum The inclusive upper bound.
 * @returns {number} The clamped number.
 */
export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

/**
 * Calculate a mathematical modulo with a non-negative remainder.
 * @param {number} value The dividend.
 * @param {number} divisor The divisor.
 * @returns {number} The non-negative remainder.
 */
export function mod(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

/**
 * Divide two numbers and round the quotient toward negative infinity.
 * @param {number} value The dividend.
 * @param {number} divisor The divisor.
 * @returns {number} The floored quotient.
 */
export function floorDiv(value: number, divisor: number): number {
  return Math.floor(value / divisor);
}
