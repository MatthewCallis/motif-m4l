import { PPQ, type TimeSignature } from './types.js';

export function barLengthTicks(signature: TimeSignature): number {
  return signature.numerator * PPQ * (4 / signature.denominator);
}

export function ticksToMilliseconds(ticks: number, tempo: number): number {
  const safeTempo = Number.isFinite(tempo) && tempo > 0 ? tempo : 120;
  return (ticks / PPQ) * (60_000 / safeTempo);
}
