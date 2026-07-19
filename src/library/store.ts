/**
 * In-memory motif library: built-ins from generated JSON plus user phrases.
 *
 * Disk I/O (scanning a user library folder, reading/writing `.json`) happens in
 * `device.ts` via Max `Folder` / `File` — this store only holds validated Motif objects.
 *
 * @see https://docs.cycling74.com/apiref/js/folder/
 * @see https://docs.cycling74.com/apiref/js/file/
 */

import type { Motif, MotifNote } from '../core/types.js';
import { BUILTIN_MOTIFS } from '../generated/builtins.js';
import { validateMotif } from './validate.js';

function matchesQuery(motif: Motif, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const haystack = [
    motif.id,
    motif.name,
    motif.description,
    ...(motif.metadata?.tags ?? []),
    ...(motif.metadata?.suggestedModes ?? []),
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(normalized);
}

/** Mutable catalog keyed by motif `id`. Built-in ids are protected from overwrite on clone. */
export class MotifStore {
  readonly #motifs = new Map<string, Motif>();
  readonly #builtinIds = new Set<string>(BUILTIN_MOTIFS.map((motif) => motif.id));

  constructor() {
    this.resetToBuiltins();
  }

  /** Replace contents with the compiled built-in library only. */
  resetToBuiltins(): void {
    this.#motifs.clear();
    for (const motif of BUILTIN_MOTIFS) {
      this.#motifs.set(motif.id, motif);
    }
  }

  /** True when `id` is from `motifs/builtin/` (generated into BUILTIN_MOTIFS). */
  isBuiltin(id: string): boolean {
    return this.#builtinIds.has(id);
  }

  /**
   * Validate and insert/replace a motif by id.
   * @returns Empty array on success, or validation error strings.
   */
  add(value: unknown): string[] {
    const result = validateMotif(value);
    if (!result.valid || !result.motif) {
      return result.errors;
    }

    this.#motifs.set(result.motif.id, result.motif);
    return [];
  }

  /** Alias for {@link MotifStore.add} (replace-by-id). */
  update(value: unknown): string[] {
    return this.add(value);
  }

  get(id: string): Motif | undefined {
    return this.#motifs.get(id);
  }

  /** All motifs sorted by display name. */
  list(): Motif[] {
    return [...this.#motifs.values()].sort((left, right) => left.name.localeCompare(right.name));
  }

  /** Case-insensitive substring match across id, name, description, tags, suggestedModes. */
  filter(query: string): Motif[] {
    return this.list().filter((motif) => matchesQuery(motif, query));
  }

  /**
   * Clone a built-in (or any motif) to a new user id so edits can be saved without overwriting builtins.
   */
  cloneAsUser(id: string, newId?: string): Motif | undefined {
    const source = this.#motifs.get(id);
    if (!source) return undefined;

    let candidate = newId ?? `${source.id}-edit`;
    let suffix = 2;
    while (this.#motifs.has(candidate) || this.#builtinIds.has(candidate)) {
      candidate = `${newId ?? `${source.id}-edit`}-${suffix}`;
      suffix += 1;
    }

    const tags = new Set([...(source.metadata?.tags ?? []), 'edited']);
    const clone: Motif = {
      ...source,
      id: candidate,
      name: source.name.endsWith(' (edit)') ? source.name : `${source.name} (edit)`,
      notes: source.notes.map((note) => ({ ...note })),
      metadata: {
        ...source.metadata,
        tags: [...tags],
      },
    };

    this.#motifs.set(clone.id, clone);
    return clone;
  }

  /**
   * Replace notes on an existing motif and recompute `length` to cover the new span.
   * @returns Validation errors, or a single error if the id is unknown.
   */
  setNotes(id: string, notes: readonly MotifNote[]): string[] {
    const existing = this.#motifs.get(id);
    if (!existing) return [`Unknown motif: ${id}`];

    if (notes.length === 0) return ['notes must be a non-empty array'];

    const length = Math.max(...notes.map((note) => note.at + note.duration));

    return this.update({
      ...existing,
      notes,
      length,
    });
  }
}
