/** @jsxImportSource preact */
/**
 * Library browser sidebar, including filtering, folder actions, and resizing.
 */

import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import { confirmDiscard, outlet, send, setWorkbenchLayoutHandler } from "../bridge.js";
import {
  clampLibrarySidebarWidth,
  isLibrarySidebarLayout,
  LIBRARY_SIDEBAR_LAYOUT,
  type LibrarySidebarLayout,
} from "../sidebar-layout.js";
import { useLibraryStore } from "../store.js";
import { BrowserList } from "./BrowserList.js";
import { TagFilter } from "./TagFilter.js";

/** Browser-local key for the user's preferred Library browser width. */
export const SIDEBAR_WIDTH_STORAGE_KEY = "motif-library-sidebar-width";
/** Keyboard resize increment in pixels. */
export const SIDEBAR_KEYBOARD_STEP = 12;

/**
 * Render and own the complete Library browser sidebar lifecycle.
 *
 * Pointer listeners stay imperative because pointer capture is a browser API,
 * but their attachment and cleanup are scoped to this component's refs.
 */
export function LibrarySidebar() {
  const [state, pageStore] = useLibraryStore();
  const server = state.server;
  const sidebarRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);
  const [searchText, setSearchText] = useState("");
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const serverQuery = server?.query;
  useEffect(() => {
    if (serverQuery === undefined) {
      return;
    }
    // Device state is authoritative after filtering, including normalization
    // performed outside this page (for example by the Max controller).
    clearTimeout(searchDebounce.current);
    setSearchText(serverQuery);
  }, [serverQuery]);

  useEffect(
    () => () => {
      clearTimeout(searchDebounce.current);
    },
    [],
  );

  useLayoutEffect(() => {
    const sidebarNode = sidebarRef.current;
    const resizerNode = resizerRef.current;
    if (!sidebarNode || !resizerNode) {
      return undefined;
    }
    const appNode = sidebarNode.parentElement;
    if (!appNode) {
      return undefined;
    }
    // Explicit non-null aliases remain narrowed inside the event callbacks.
    const app: HTMLElement = appNode;
    const sidebar: HTMLDivElement = sidebarNode;
    const resizer: HTMLDivElement = resizerNode;

    let layout: LibrarySidebarLayout = { ...LIBRARY_SIDEBAR_LAYOUT };
    let activePointerId: number | null = null;

    /** Measure the shell, with fallbacks for jweb's initial layout pass. */
    function contentWidth(): number {
      return app.getBoundingClientRect().width || window.innerWidth || 800;
    }

    /** Read a valid preference without requiring localStorage support. */
    function storedWidth(): number | undefined {
      try {
        const value = Number(window.localStorage?.getItem(SIDEBAR_WIDTH_STORAGE_KEY));
        return Number.isFinite(value) && value > 0 ? value : undefined;
      } catch {
        return undefined;
      }
    }

    /** Clamp, render, and optionally persist one requested sidebar width. */
    function applyWidth(requestedWidth: number, persist: boolean): void {
      const width = clampLibrarySidebarWidth(requestedWidth, contentWidth(), layout);
      sidebar.style.width = `${width}px`;
      resizer.setAttribute("aria-valuemin", String(layout.sidebarMinWidth));
      resizer.setAttribute(
        "aria-valuemax",
        String(clampLibrarySidebarWidth(Number.MAX_SAFE_INTEGER, contentWidth(), layout)),
      );
      resizer.setAttribute("aria-valuenow", String(width));
      if (!persist) {
        return;
      }
      try {
        window.localStorage?.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(width));
      } catch {
        // Max jweb may disable localStorage; resizing still works for this window.
      }
    }

    /** Apply workbench layout limits before resolving the requested width. */
    function applyLayout(next: LibrarySidebarLayout, requestedWidth?: number): void {
      layout = { ...next };
      sidebar.style.minWidth = `${layout.sidebarMinWidth}px`;
      sidebar.style.maxWidth = `${layout.sidebarMaxWidth}px`;
      resizer.style.width = `${layout.sidebarResizerWidth}px`;
      applyWidth(requestedWidth ?? (sidebar.getBoundingClientRect().width || 240), false);
    }

    function onPointerDown(event: PointerEvent): void {
      if (event.button !== 0) {
        return;
      }
      event.preventDefault();
      activePointerId = event.pointerId;
      resizer.classList.add("dragging");
      resizer.setPointerCapture(event.pointerId);
    }

    function onPointerMove(event: PointerEvent): void {
      if (!resizer.hasPointerCapture(event.pointerId)) {
        return;
      }
      applyWidth(event.clientX - app.getBoundingClientRect().left, false);
    }

    function finishResize(event: PointerEvent): void {
      if (!resizer.hasPointerCapture(event.pointerId)) {
        return;
      }
      resizer.releasePointerCapture(event.pointerId);
      activePointerId = null;
      resizer.classList.remove("dragging");
      applyWidth(sidebar.getBoundingClientRect().width, true);
    }

    function onKeyDown(event: KeyboardEvent): void {
      const currentWidth = sidebar.getBoundingClientRect().width;
      if (event.key === "ArrowLeft") {
        applyWidth(currentWidth - SIDEBAR_KEYBOARD_STEP, true);
      } else if (event.key === "ArrowRight") {
        applyWidth(currentWidth + SIDEBAR_KEYBOARD_STEP, true);
      } else if (event.key === "Home") {
        applyWidth(0, true);
      } else if (event.key === "End") {
        applyWidth(Number.MAX_SAFE_INTEGER, true);
      } else {
        return;
      }
      event.preventDefault();
    }

    function onWindowResize(): void {
      applyWidth(sidebar.getBoundingClientRect().width, false);
    }

    applyLayout(LIBRARY_SIDEBAR_LAYOUT, storedWidth());
    setWorkbenchLayoutHandler((value) => {
      if (isLibrarySidebarLayout(value)) {
        applyLayout(value);
      }
    });
    resizer.addEventListener("pointerdown", onPointerDown);
    resizer.addEventListener("pointermove", onPointerMove);
    resizer.addEventListener("pointerup", finishResize);
    resizer.addEventListener("pointercancel", finishResize);
    resizer.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onWindowResize);

    return () => {
      setWorkbenchLayoutHandler(null);
      if (activePointerId !== null && resizer.hasPointerCapture(activePointerId)) {
        resizer.releasePointerCapture(activePointerId);
      }
      resizer.removeEventListener("pointerdown", onPointerDown);
      resizer.removeEventListener("pointermove", onPointerMove);
      resizer.removeEventListener("pointerup", finishResize);
      resizer.removeEventListener("pointercancel", finishResize);
      resizer.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onWindowResize);
    };
  }, []);

  let libraryPathText = "Built-ins only";
  if (server?.libraryPath) {
    let pathPrefix = "";
    if (server.libraryScanning) {
      pathPrefix = "Scanning · ";
    } else if (!server.libraryLoaded) {
      pathPrefix = "Unavailable · ";
    }
    libraryPathText = `${pathPrefix}${server.libraryPath}`;
  }

  return (
    <>
      <div id="left" ref={sidebarRef}>
        <div id="search-row">
          <input
            id="search"
            type="text"
            placeholder="Search..."
            autocomplete="off"
            spellcheck={false}
            value={searchText}
            onInput={(event) => {
              const value = event.currentTarget.value;
              setSearchText(value);
              clearTimeout(searchDebounce.current);
              searchDebounce.current = setTimeout(() => {
                const current = pageStore.getState().server;
                send({
                  type: "filter_motifs",
                  query: value,
                  tags: [...(current?.tags ?? [])],
                  tagMode: current?.tagMode ?? "or",
                });
              }, 80);
            }}
          />
          <button
            type="button"
            id="clear-search"
            title="Clear search and tag filters"
            onClick={() => {
              // The timer captures typed text; cancel it before sending the clear.
              clearTimeout(searchDebounce.current);
              setSearchText("");
              send({
                type: "filter_motifs",
                query: "",
                tags: [],
                tagMode: pageStore.getState().server?.tagMode ?? "or",
              });
            }}
          >
            ✕
          </button>
        </div>
        <TagFilter server={server} searchQuery={searchText} />
        <BrowserList server={server} />
        <div id="browser-actions">
          <button
            type="button"
            class="btn"
            id="choose-btn"
            title="Choose and remember a library folder"
            onClick={() => {
              confirmDiscard(() => {
                if (pageStore.getState().server?.editing.active) {
                  send({ type: "cancel_edit" });
                }
                outlet("choose_library");
              }, "Discard the current edits and choose another library folder?");
            }}
          >
            Choose
          </button>
          <button
            type="button"
            class="btn"
            id="refresh-btn"
            title="Reload the chosen library folder"
            disabled={!server?.actions.canRefreshLibrary}
            onClick={() => {
              confirmDiscard(
                () => send({ type: "refresh_library", discardChanges: true }),
                "Discard the current edits and reload the library folder?",
              );
            }}
          >
            {server?.libraryScanning ? "Scanning..." : "Refresh"}
          </button>
        </div>
        <div id="library-path" title={server?.libraryPath || "No user library selected"}>
          {libraryPathText}
        </div>
      </div>

      <div
        id="library-resizer"
        role="separator"
        aria-label="Resize Library browser"
        aria-orientation="vertical"
        tabIndex={0}
        ref={resizerRef}
      />
    </>
  );
}
