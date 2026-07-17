import type { Motif } from '../core/types.js';
import { BUILTIN_MOTIFS } from '../generated/builtins.js';
import { validateMotif } from './validate.js';

export class MotifStore {
  readonly #motifs = new Map<string, Motif>();

  constructor() {
    this.resetToBuiltins();
  }

  resetToBuiltins(): void {
    this.#motifs.clear();
    for (const motif of BUILTIN_MOTIFS) {
      this.#motifs.set(motif.id, motif);
    }
  }

  add(value: unknown): string[] {
    const result = validateMotif(value);
    if (!result.valid || !result.motif) {
      return result.errors;
    }

    this.#motifs.set(result.motif.id, result.motif);
    return [];
  }

  get(id: string): Motif | undefined {
    return this.#motifs.get(id);
  }

  list(): Motif[] {
    return [...this.#motifs.values()].sort((left, right) => left.name.localeCompare(right.name));
  }
}
