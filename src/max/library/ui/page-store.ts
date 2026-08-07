/**
 * Synchronous browser-local state container shared by the bridge and Preact.
 * Keeping the singleton here prevents transport code from owning UI state.
 */

import { initialLibraryPageState, type LibraryPageState } from "./page-state.js";

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
      for (const subscriber of subscribers) {
        subscriber(current);
      }
    },
    subscribe(subscriber): () => void {
      subscribers.add(subscriber);
      return () => subscribers.delete(subscriber);
    },
  };
}

/** Browser-local state shared by the bridge and component context. */
export const pageStore: Store<LibraryPageState> = createStore(initialLibraryPageState());
