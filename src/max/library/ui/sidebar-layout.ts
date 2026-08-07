/** Sidebar sizing rules shared by the Preact component and workbench. */

import libraryWindowConfig from "../../../../config/library-window.json";

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
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
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

/** Keep the draggable sidebar useful without crowding the detail pane. */
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
