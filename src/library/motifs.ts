import { PPQ, type Motif } from '../core/types.js';

const EIGHTH = PPQ / 2;
const SIXTEENTH = PPQ / 4;

export const MOTIFS: readonly Motif[] = [
  {
    id: 'scale-turn',
    name: 'Scale Turn',
    description: 'A compact scale-aware turn used to validate one-key phrase triggering.',
    pitchMode: 'scale',
    sourceMeter: { numerator: 4, denominator: 4 },
    length: EIGHTH * 7,
    tags: ['demo', 'scale', 'turn'],
    notes: [
      { at: EIGHTH * 0, duration: EIGHTH * 0.82, pitch: 0, velocityOffset: 4 },
      { at: EIGHTH * 1, duration: EIGHTH * 0.82, pitch: 1 },
      { at: EIGHTH * 2, duration: EIGHTH * 0.82, pitch: 2, velocityOffset: 3 },
      { at: EIGHTH * 3, duration: EIGHTH * 0.82, pitch: 4, velocityOffset: 7 },
      { at: EIGHTH * 4, duration: EIGHTH * 0.82, pitch: 3 },
      { at: EIGHTH * 5, duration: EIGHTH * 0.82, pitch: 1, velocityOffset: -3 },
      { at: EIGHTH * 6, duration: EIGHTH * 0.95, pitch: 0, velocityOffset: 2 },
    ],
  },
  {
    id: 'quick-answer',
    name: 'Quick Answer',
    description: 'A short sixteenth-note response with a wider final interval.',
    pitchMode: 'scale',
    sourceMeter: { numerator: 4, denominator: 4 },
    length: SIXTEENTH * 8,
    tags: ['demo', 'response'],
    notes: [
      { at: SIXTEENTH * 0, duration: SIXTEENTH * 0.72, pitch: 0 },
      { at: SIXTEENTH * 1, duration: SIXTEENTH * 0.72, pitch: 2 },
      { at: SIXTEENTH * 2, duration: SIXTEENTH * 0.72, pitch: 1 },
      { at: SIXTEENTH * 3, duration: SIXTEENTH * 0.72, pitch: 3 },
      { at: SIXTEENTH * 4, duration: SIXTEENTH * 0.72, pitch: 2 },
      { at: SIXTEENTH * 5, duration: SIXTEENTH * 0.72, pitch: 5, velocityOffset: 5 },
      { at: SIXTEENTH * 6, duration: SIXTEENTH * 1.8, pitch: 4 },
    ],
  },
  {
    id: 'chromatic-turn',
    name: 'Chromatic Turn',
    description: 'A fixed-interval phrase that ignores the selected scale.',
    pitchMode: 'chromatic',
    sourceMeter: { numerator: 4, denominator: 4 },
    length: EIGHTH * 7,
    tags: ['demo', 'chromatic'],
    notes: [
      { at: EIGHTH * 0, duration: EIGHTH * 0.82, pitch: 0 },
      { at: EIGHTH * 1, duration: EIGHTH * 0.82, pitch: 2 },
      { at: EIGHTH * 2, duration: EIGHTH * 0.82, pitch: 3 },
      { at: EIGHTH * 3, duration: EIGHTH * 0.82, pitch: 7, velocityOffset: 6 },
      { at: EIGHTH * 4, duration: EIGHTH * 0.82, pitch: 5 },
      { at: EIGHTH * 5, duration: EIGHTH * 0.82, pitch: 2 },
      { at: EIGHTH * 6, duration: EIGHTH * 0.95, pitch: 0 },
    ],
  },
];

export function findMotif(id: string): Motif | undefined {
  return MOTIFS.find((motif) => motif.id === id);
}
