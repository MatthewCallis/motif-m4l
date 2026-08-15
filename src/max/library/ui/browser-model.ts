/** Pure browser-list, folder, and tag-selection helpers. */

/**
 * Resolve local folder collapse state while always exposing search/tag results.
 * @param {string} folder Browser folder.
 * @param {string} query Active browser query.
 * @param {Set<string>} collapsedFolders Locally collapsed folders.
 * @param {string[]} selectedTags Active tag filter chips.
 * @returns {boolean} Whether the folder contents should be hidden.
 */
export function isFolderCollapsed(
  folder: string,
  query: string,
  collapsedFolders: Set<string>,
  selectedTags: string[] = [],
): boolean {
  return query.trim() === "" && selectedTags.length === 0 && collapsedFolders.has(folder);
}

/**
 * Toggle one tag in a filter or edit selection without mutating the source.
 * Matching is case-insensitive; first-seen casing is preserved when adding.
 */
export function toggleTagSelection(tag: string, selected: string[]): string[] {
  const trimmed = tag.trim();
  if (!trimmed) {
    return [...selected];
  }
  const key = trimmed.toLowerCase();
  const exists = selected.some((entry) => entry.toLowerCase() === key);
  return exists ? selected.filter((entry) => entry.toLowerCase() !== key) : [...selected, trimmed];
}

/** Add one tag if missing (case-insensitive), without mutating the source. */
export function addTagSelection(tags: string[], tag: string): string[] {
  const trimmed = tag.trim();
  if (!trimmed) {
    return [...tags];
  }
  const key = trimmed.toLowerCase();
  return tags.some((entry) => entry.toLowerCase() === key) ? [...tags] : [...tags, trimmed];
}

/** Remove one tag if present (case-insensitive), without mutating the source. */
export function removeTagSelection(tags: string[], tag: string): string[] {
  const key = tag.trim().toLowerCase();
  return key ? tags.filter((entry) => entry.toLowerCase() !== key) : [...tags];
}

/** Suggest unused vocabulary tags matching a partial query. */
export function suggestTags(
  available: string[],
  applied: string[],
  query: string,
  limit = 8,
): string[] {
  const needle = query.trim().toLowerCase();
  const appliedKeys = new Set(applied.map((tag) => tag.toLowerCase()));
  const matches: string[] = [];
  for (const tag of available) {
    if (appliedKeys.has(tag.toLowerCase())) {
      continue;
    }
    if (needle && !tag.toLowerCase().includes(needle)) {
      continue;
    }
    matches.push(tag);
    if (matches.length >= limit) {
      break;
    }
  }
  return matches;
}

/** Toggle one folder without mutating the existing state. */
export function toggleCollapsedFolder(folder: string, collapsedFolders: Set<string>): Set<string> {
  const next = new Set(collapsedFolders);
  if (next.has(folder)) {
    next.delete(folder);
  } else {
    next.add(folder);
  }
  return next;
}

/**
 * Remove a redundant `Folder Name - ` prefix from one browser-row label.
 * Stored motif names, search data, details, and tooltips remain unchanged.
 */
export function libraryBrowserDisplayName(name: string, folder: string): string {
  const folderSegments = folder.split(/[\\/]/);
  const folderName = folderSegments[folderSegments.length - 1]?.trim() ?? "";
  const prefix = `${folderName} - `;
  if (
    folderName === "" ||
    name.length <= prefix.length ||
    name.slice(0, prefix.length).toLocaleLowerCase() !== prefix.toLocaleLowerCase()
  ) {
    return name;
  }
  const suffix = name.slice(prefix.length).trim();
  return suffix === "" ? name : suffix;
}
