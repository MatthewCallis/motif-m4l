import type { Motif } from "../../src/core/types.js";
import { MotifStore, uniqueMotifId } from "../../src/library/store.js";

/**
 * Insert a deep copy of an existing motif under a new user id.
 * Test-only helper — production code clones through editor begin/save flows.
 *
 * @param {MotifStore} store The store to mutate.
 * @param {string} sourceId The id of the motif to copy.
 * @param {string | undefined} preferredId Optional preferred id for the copy.
 * @returns {Motif | undefined} The stored copy, or undefined when the source is unknown.
 */
export function addUserCopy(
  store: MotifStore,
  sourceId: string,
  preferredId?: string,
): Motif | undefined {
  const source = store.get(sourceId);
  if (!source) {
    return undefined;
  }
  const id = store.uniqueId(preferredId ?? uniqueMotifId(source.name, `${source.id}-copy`));
  const copy: Motif = {
    ...source,
    id,
    notes: source.notes.map((note) => ({ ...note })),
    ...(source.velocityCurve ? { velocityCurve: { ...source.velocityCurve } } : {}),
    ...(source.tags ? { tags: [...source.tags] } : {}),
  };

  const errors = store.add(copy);
  if (errors.length > 0) {
    throw new Error(errors.join("; "));
  }
  return copy;
}
