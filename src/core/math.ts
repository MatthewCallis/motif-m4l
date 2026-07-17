export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function mod(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

export function floorDiv(value: number, divisor: number): number {
  return Math.floor(value / divisor);
}
