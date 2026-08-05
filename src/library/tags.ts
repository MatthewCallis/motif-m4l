/**
 * Shared Motif tag normalization for validation and Library authoring.
 */

/** Successful or failed tag-list normalization. */
export type NormalizeTagsResult = { ok: true; value: string[] } | { ok: false; error: string };

/** Library browser multi-tag filter combination mode. */
export type TagFilterMode = "and" | "or";

/**
 * Trim, reject blanks/non-strings, and case-insensitively dedupe tags.
 * Preserves first-seen casing. Empty input yields an empty array (omit on Motif).
 * @param {unknown} value Submitted tags value.
 * @returns {NormalizeTagsResult} Normalized tags or a validation error.
 */
export function normalizeTags(value: unknown): NormalizeTagsResult {
  if (value === null || value === undefined) {
    return { ok: true, value: [] };
  }
  if (!Array.isArray(value)) {
    return { ok: false, error: "tags must be an array of strings" };
  }

  const seen = new Set<string>();
  const tags: string[] = [];
  for (let index = 0; index < value.length; index++) {
    const item: unknown = value[index];
    if (typeof item !== "string") {
      return { ok: false, error: `tags[${index}] must be a string` };
    }
    const trimmed = item.trim();
    if (!trimmed) {
      return { ok: false, error: `tags[${index}] cannot be empty` };
    }
    const key = trimmed.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    tags.push(trimmed);
  }
  return { ok: true, value: tags };
}

/**
 * Narrow an unknown value to a tag filter mode.
 * @param {unknown} value Submitted mode.
 * @param {TagFilterMode} fallback Mode used when value is absent or invalid.
 * @returns {TagFilterMode} Normalized mode.
 */
export function normalizeTagFilterMode(
  value: unknown,
  fallback: TagFilterMode = "or",
): TagFilterMode {
  return value === "and" || value === "or" ? value : fallback;
}

/**
 * Case-insensitive membership test for one tag against a motif tag list.
 * @param {readonly string[] | undefined} motifTags Motif tags.
 * @param {string} tag Candidate tag.
 * @returns {boolean} Whether the motif has the tag.
 */
export function motifHasTag(motifTags: readonly string[] | undefined, tag: string): boolean {
  const needle = tag.trim().toLowerCase();
  if (!needle || !motifTags || motifTags.length === 0) {
    return false;
  }
  return motifTags.some((entry) => entry.toLowerCase() === needle);
}

/**
 * Apply AND/OR multi-tag filtering against one motif's tags.
 * An empty selection matches everything.
 * @param {readonly string[] | undefined} motifTags Motif tags.
 * @param {readonly string[]} selectedTags Active filter tags.
 * @param {TagFilterMode} mode Combination mode.
 * @returns {boolean} Whether the motif passes the tag filter.
 */
export function motifMatchesTagFilter(
  motifTags: readonly string[] | undefined,
  selectedTags: readonly string[],
  mode: TagFilterMode,
): boolean {
  if (selectedTags.length === 0) {
    return true;
  }
  // If the mode is "and", return true if all of the selected tags are present in the motif tags.
  if (mode === "and") {
    return selectedTags.every((tag) => motifHasTag(motifTags, tag));
  }
  // If the mode is "or", return true if any of the selected tags are present in the motif tags.
  return selectedTags.some((tag) => motifHasTag(motifTags, tag));
}
