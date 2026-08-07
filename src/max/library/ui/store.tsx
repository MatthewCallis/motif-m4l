/** @jsxImportSource preact */
/**
 * Preact context wrapping the Library page store.
 */

import { createContext, type ComponentChildren } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { pageStore, type Store } from "./page-store.js";
import type { LibraryPageState } from "./page-state.js";

const LibraryStoreContext = createContext<Store<LibraryPageState> | null>(null);

/**
 * Provide the page store to Preact descendants.
 * @param {{ children: ComponentChildren }} props Provider children.
 */
export function LibraryStoreProvider({ children }: { children: ComponentChildren }) {
  return <LibraryStoreContext.Provider value={pageStore}>{children}</LibraryStoreContext.Provider>;
}

/**
 * Subscribe to the Library page store.
 * @returns {[LibraryPageState, Store<LibraryPageState>]} Current state and store API.
 */
export function useLibraryStore(): [LibraryPageState, Store<LibraryPageState>] {
  const pageStore = useContext(LibraryStoreContext);
  if (!pageStore) {
    throw new Error("useLibraryStore requires LibraryStoreProvider");
  }

  const [state, setState] = useState(pageStore.getState());
  useEffect(() => {
    // Sync immediately so state applied before the effect ran is not missed.
    setState(pageStore.getState());
    return pageStore.subscribe(setState);
  }, [pageStore]);

  return [state, pageStore];
}
