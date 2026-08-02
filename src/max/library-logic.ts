import { LIBRARY_STATE_CHUNK_KIND, type LibraryStateChunk } from "./library-protocol.js";
import libraryWindowConfig from "../../config/library-window.json";

/** Source-controlled dimensions that govern the Library sidebar. */
export interface LibrarySidebarLayout {
  sidebarMinWidth: number;
  sidebarMaxWidth: number;
  detailMinWidth: number;
  sidebarResizerWidth: number;
}

/** Sidebar dimensions loaded from the workbench-editable Library JSON. */
export const LIBRARY_SIDEBAR_LAYOUT: LibrarySidebarLayout = {
  sidebarMinWidth: libraryWindowConfig.sidebarMinWidth,
  sidebarMaxWidth: libraryWindowConfig.sidebarMaxWidth,
  detailMinWidth: libraryWindowConfig.detailMinWidth,
  sidebarResizerWidth: libraryWindowConfig.sidebarResizerWidth,
};

/** Narrow a workbench message to a complete, positive-integer sidebar layout. */
export function isLibrarySidebarLayout(value: unknown): value is LibrarySidebarLayout {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<keyof LibrarySidebarLayout, unknown>;
  return (
    Number.isInteger(candidate.sidebarMinWidth) &&
    Number(candidate.sidebarMinWidth) > 0 &&
    Number.isInteger(candidate.sidebarMaxWidth) &&
    Number(candidate.sidebarMaxWidth) >= Number(candidate.sidebarMinWidth) &&
    Number.isInteger(candidate.detailMinWidth) &&
    Number(candidate.detailMinWidth) > 0 &&
    Number.isInteger(candidate.sidebarResizerWidth) &&
    Number(candidate.sidebarResizerWidth) > 0
  );
}

/** Minimal synchronous store used by the Library renderer. */
export interface Store<T> {
  /** Read the current state. */
  getState: () => T;
  /** Merge a partial state or replace it from a state updater. */
  setState: (update: Partial<T> | ((current: T) => T)) => void;
  /** Subscribe to every synchronous state transition. */
  subscribe: (subscriber: (state: T) => void) => () => void;
}

/**
 * Create the small synchronous state container used by the page renderer.
 * @param {T} initialState Initial page state.
 * @returns {Store<T>} State access, updates, and subscription.
 */
export function createStore<T>(initialState: T): Store<T> {
  let current = initialState;
  const subscribers = new Set<(state: T) => void>();
  return {
    getState: () => current,
    setState(update): void {
      current = typeof update === "function" ? update(current) : { ...current, ...update };
      for (const subscriber of subscribers) subscriber(current);
    },
    subscribe(subscriber): () => void {
      subscribers.add(subscriber);
      return () => subscribers.delete(subscriber);
    },
  };
}

/**
 * Format any thrown value for diagnostics.
 * @param {unknown} reason Thrown value.
 * @returns {string} Readable error details.
 */
export function errorText(reason: unknown): string {
  return reason instanceof Error ? `${reason.name}: ${reason.message}` : String(reason);
}

/**
 * Resolve local folder collapse state while always exposing search results.
 * @param {string} folder Browser folder.
 * @param {string} query Active browser query.
 * @param {Set<string>} collapsedFolders Locally collapsed folders.
 * @returns {boolean} Whether the folder contents should be hidden.
 */
export function isFolderCollapsed(
  folder: string,
  query: string,
  collapsedFolders: Set<string>,
): boolean {
  return query.trim() === "" && collapsedFolders.has(folder);
}

/**
 * Toggle one folder without mutating the existing state.
 * @param {string} folder Browser folder.
 * @param {Set<string>} collapsedFolders Existing collapsed folders.
 * @returns {Set<string>} Updated collapsed folder set.
 */
export function toggleCollapsedFolder(folder: string, collapsedFolders: Set<string>): Set<string> {
  const next = new Set(collapsedFolders);
  if (next.has(folder)) next.delete(folder);
  else next.add(folder);
  return next;
}

/**
 * Remove a redundant `Folder Name - ` prefix from one browser-row label.
 * Stored motif names, search data, details, and tooltips remain unchanged.
 * @param {string} name Complete stored motif name.
 * @param {string} folder Root-relative Library folder.
 * @returns {string} Compact browser label.
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

/**
 * Keep the draggable Library sidebar useful without crowding the detail pane.
 * @param {number} requestedWidth Requested sidebar width in pixels.
 * @param {number} viewportWidth Current Library content width in pixels.
 * @param {LibrarySidebarLayout} layout Active sidebar constraints.
 * @returns {number} Bounded whole-pixel sidebar width.
 */
export function clampLibrarySidebarWidth(
  requestedWidth: number,
  viewportWidth: number,
  layout: LibrarySidebarLayout = LIBRARY_SIDEBAR_LAYOUT,
): number {
  const availableWidth = Number.isFinite(viewportWidth) ? viewportWidth : 800;
  const maximum = Math.max(
    layout.sidebarMinWidth,
    Math.min(
      layout.sidebarMaxWidth,
      Math.floor(availableWidth - layout.detailMinWidth - layout.sidebarResizerWidth),
    ),
  );
  const width = Number.isFinite(requestedWidth) ? Math.round(requestedWidth) : 240;
  return Math.max(layout.sidebarMinWidth, Math.min(maximum, width));
}

/**
 * Parse an optional numeric form value without DOM dependencies.
 * @param {string} value Raw form value.
 * @returns {number | null} Numeric value or null for blank text.
 */
export function optionalNumberValue(value: string): number | null {
  const normalized = value.trim();
  return normalized === "" ? null : Number(normalized);
}

/**
 * Narrow a decoded transport payload to a state chunk.
 * @param {unknown} value Decoded payload.
 * @returns {value is LibraryStateChunk} Whether the value is a chunk envelope.
 */
export function isLibraryStateChunk(value: unknown): value is LibraryStateChunk {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { kind?: unknown }).kind === LIBRARY_STATE_CHUNK_KIND
  );
}
