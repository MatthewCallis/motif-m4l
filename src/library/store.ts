/**
 * In-memory motif library: built-ins from generated JSON plus user phrases.
 *
 * Disk I/O (scanning a user library folder, reading/writing `.json`) happens in
 * `device.ts` via Max `Folder` / `File` - this store only holds validated Motif objects.
 *
 * @see https://docs.cycling74.com/apiref/js/folder/
 * @see https://docs.cycling74.com/apiref/js/file/
 */

import type { Motif, MotifNote } from '../core/types.js';
import { BUILTIN_MOTIFS } from '../generated/builtins.js';
import { validateMotif } from './validate.js';

/**
 * Turn a display name into a filesystem-safe, stable motif id candidate.
 * @param {string} name The display name to normalize.
 * @param {string} fallback The id to use when the normalized name is empty.
 * @returns {string} The normalized motif id candidate.
 */
export function uniqueMotifId(name: string, fallback = 'motif'): string {
  const normalized = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
  return normalized || fallback;
}

/** Mutable catalog keyed by motif `id`. Built-in ids are protected from overwrite on clone. */
export class MotifStore {
  motifs = new Map<string, Motif>();
  builtinIds = new Set<string>(BUILTIN_MOTIFS.map((motif) => motif.id));
  sortedList: Motif[] | null = null;

  constructor() {
    this.resetToBuiltins();
  }

  /**
   * Drop the cached display-order snapshot after the catalog changes.
   * @returns {void}
   */
  invalidateSortedList(): void {
    this.sortedList = null;
  }

  /**
   * Return motifs sorted for display, reusing a cached snapshot when valid.
   * @returns {Motif[]} Motifs in stable display order.
   */
  list(): Motif[] {
    if (this.sortedList) {
      return this.sortedList;
    }
    this.sortedList = [...this.motifs.values()].sort((left: Motif, right: Motif): number => {
      return left.name.localeCompare(right.name) || left.id.localeCompare(right.id);
    });
    return this.sortedList;
  }

  /**
   * Replace the store contents with the compiled built-in library.
   * @returns {void}
   */
  resetToBuiltins(): void {
    this.motifs.clear();
    for (const motif of BUILTIN_MOTIFS) {
      this.motifs.set(motif.id, motif);
    }
    this.invalidateSortedList();
  }

  /**
   * Determine whether an id belongs to the compiled built-in library.
   * @param {string} id The motif id to inspect.
   * @returns {boolean} Whether the id is built in.
   */
  isBuiltin(id: string): boolean {
    return this.builtinIds.has(id);
  }

  /**
   * Determine whether the store contains a motif id.
   * @param {string} id The motif id to find.
   * @returns {boolean} Whether the id exists.
   */
  has(id: string): boolean {
    return this.motifs.has(id);
  }

  /**
   * Return an unused id, appending `-2`, `-3`, etc. when needed.
   * @param {string} baseValue The preferred id or display name.
   * @param {string | undefined} excludedId An existing id allowed during rename checks.
   * @returns {string} An id unused by every non-excluded motif.
   */
  uniqueId(baseValue: string, excludedId?: string): string {
    const base = uniqueMotifId(baseValue);
    let candidate = base;
    let suffix = 2;
    while (
      (this.motifs.has(candidate) && candidate !== excludedId)
      || (this.builtinIds.has(candidate) && candidate !== excludedId)
    ) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }
    return candidate;
  }

  /**
   * Validate and insert/replace a motif by id.
   * @param {unknown} value The motif value to validate and store.
   * @returns {string[]} An empty array on success, or validation error strings.
   */
  add(value: unknown): string[] {
    const result = validateMotif(value);
    if (!result.valid || !result.motif) {
      return result.errors;
    }

    if (this.isBuiltin(result.motif.id)) {
      return [`Cannot overwrite built-in motif: ${result.motif.id}`];
    }

    this.motifs.set(result.motif.id, result.motif);
    this.invalidateSortedList();
    return [];
  }

  /**
   * Replace a motif by id through {@link MotifStore.add}.
   * @param {unknown} value The motif value to validate and store.
   * @returns {string[]} An empty array on success, or validation error strings.
   */
  update(value: unknown): string[] {
    return this.add(value);
  }

  /**
   * Retrieve a motif by id.
   * @param {string} id The motif id to retrieve.
   * @returns {Motif | undefined} The motif, or undefined when the id is unknown.
   */
  get(id: string): Motif | undefined {
    return this.motifs.get(id);
  }

  /**
   * Remove a user motif while protecting built-in ids.
   * @param {string} id The motif id to remove.
   * @returns {boolean} Whether a motif was removed.
   */
  remove(id: string): boolean {
    if (this.isBuiltin(id)) return false;
    const removed = this.motifs.delete(id);
    if (removed) this.invalidateSortedList();
    return removed;
  }

  /**
   * Search `id`, `name`, and `description` case-insensitively.
   * @param {string} query The substring to search for.
   * @returns {Motif[]} The matching motifs.
   */
  filter(query: string): Motif[] {
    const normalizedQuery = query.trim().toLowerCase();
    const sorted = this.list();
    if (!normalizedQuery) return sorted;

    return sorted.filter((motif) => {
      return motif.id.toLowerCase().includes(normalizedQuery)
      || motif.name.toLowerCase().includes(normalizedQuery)
      || motif.description.toLowerCase().includes(normalizedQuery)
    });
  }

  /**
   * Replace the notes for an existing motif, validating and recomputing the `length`.
   * @param {string} id The id of the motif to update.
   * @param {MotifNote[]} notes The new notes to set.
   * @returns {string[]} Validation errors, or a single error if the id is unknown.
   */
  setNotes(id: string, notes: MotifNote[]): string[] {
    const existing = this.motifs.get(id);
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
