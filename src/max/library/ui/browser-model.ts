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
 * @param {string} tag The tag to toggle.
 * @param {string[]} selected The selected tags.
 * @returns {string[]} The updated selected tags.
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

/**
 * Add one tag if missing (case-insensitive), without mutating the source.
 * @param {string[]} tags The tags to add to.
 * @param {string} tag The tag to add.
 * @returns {string[]} The updated tags.
 */
export function addTagSelection(tags: string[], tag: string): string[] {
  const trimmed = tag.trim();
  if (!trimmed) {
    return [...tags];
  }
  const key = trimmed.toLowerCase();
  return tags.some((entry) => entry.toLowerCase() === key) ? [...tags] : [...tags, trimmed];
}

/**
 * Remove one tag if present (case-insensitive), without mutating the source.
 * @param {string[]} tags The tags to remove from.
 * @param {string} tag The tag to remove.
 * @returns {string[]} The updated tags.
 */
export function removeTagSelection(tags: string[], tag: string): string[] {
  const key = tag.trim().toLowerCase();
  return key ? tags.filter((entry) => entry.toLowerCase() !== key) : [...tags];
}

/**
 * Suggest unused vocabulary tags matching a partial query.
 * @param {string[]} available The available tags.
 * @param {string[]} applied The applied tags.
 * @param {string} query The query to match.
 * @param {number} limit The maximum number of suggestions.
 * @returns {string[]} The suggested tags.
 */
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

/**
 * Toggle one folder without mutating the existing state.
 * @param {string} folder The folder to toggle.
 * @param {Set<string>} collapsedFolders The collapsed folders.
 * @returns {Set<string>} The updated collapsed folders.
 */
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
 * @param {string} name The motif name.
 * @param {string} folder The folder name.
 * @returns {string} The formatted motif name.
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
