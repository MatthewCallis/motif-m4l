import type { Motif } from '../core/types.js';
import { MotifStore, uniqueMotifId } from './store.js';

export interface EditSnapshot {
  readonly active: boolean;
  readonly dirty: boolean;
  readonly created: boolean;
  readonly sourceId: string | null;
  readonly targetId: string | null;
}

interface ActiveEdit {
  sourceId: string;
  targetId: string;
  original: Motif;
  created: boolean;
  dirty: boolean;
}

export interface BeginEditOptions {
  /** Mark the session dirty immediately (for freshly imported motifs). */
  readonly dirty?: boolean;
  /** Remove the target on cancel instead of restoring it. */
  readonly created?: boolean;
  /** Selection restored when a newly created target is cancelled. */
  readonly sourceId?: string;
  /** Precomputed filesystem-safe id for a built-in draft. */
  readonly targetId?: string;
}

function cloneMotif(motif: Motif): Motif {
  return {
    ...motif,
    sourceMeter: { ...motif.sourceMeter },
    notes: motif.notes.map((note) => ({ ...note })),
    ...(motif.velocityCurve ? { velocityCurve: { ...motif.velocityCurve } } : {}),
    ...(motif.metadata
      ? {
          metadata: {
            ...motif.metadata,
            ...(motif.metadata.tags ? { tags: [...motif.metadata.tags] } : {}),
            ...(motif.metadata.suggestedModes
              ? { suggestedModes: [...motif.metadata.suggestedModes] }
              : {}),
          },
        }
      : {}),
  };
}

/**
 * Explicit edit-session state for the library window.
 *
 * The engine store remains the source of truth for rendering and auditioning,
 * while this class owns the snapshot needed to cancel safely. It intentionally
 * mirrors Zustand's tiny vanilla-store model: state transitions are explicit,
 * synchronous, and independently testable without adding a browser dependency
 * to a frozen Max for Live device.
 */
export class MotifEditorState {
  #edit: ActiveEdit | undefined;

  /**
   * Read an immutable summary of the current edit session.
   * @returns {EditSnapshot} The active or inactive edit snapshot.
   */
  snapshot(): EditSnapshot {
    const edit = this.#edit;
    return edit
      ? {
          active: true,
          dirty: edit.dirty,
          created: edit.created,
          sourceId: edit.sourceId,
          targetId: edit.targetId,
        }
      : {
          active: false,
          dirty: false,
          created: false,
          sourceId: null,
          targetId: null,
        };
  }

  /**
   * Determine whether a session is active, optionally for one target id.
   * @param {string | undefined} id The target id to match.
   * @returns {boolean} Whether the requested edit session is active.
   */
  isEditing(id?: string): boolean {
    return this.#edit !== undefined && (id === undefined || this.#edit.targetId === id);
  }

  /**
   * Determine whether the active session contains unsaved changes.
   * @returns {boolean} Whether the current edit is dirty.
   */
  isDirty(): boolean {
    return this.#edit?.dirty ?? false;
  }

  /**
   * Begin editing a motif, cloning built-ins to an editable user id.
   * @param {MotifStore} store The motif store containing the source.
   * @param {string} id The source motif id.
   * @param {BeginEditOptions} options Initial session and target-id options.
   * @returns {Motif | undefined} The editable motif, or undefined when editing cannot start.
   */
  begin(store: MotifStore, id: string, options: BeginEditOptions = {}): Motif | undefined {
    if (this.#edit) {
      return this.#edit.targetId === id ? store.get(this.#edit.targetId) : undefined;
    }

    const source = store.get(id);
    if (!source) return undefined;

    if (store.isBuiltin(id)) {
      const targetId = store.uniqueId(
        options.targetId ?? uniqueMotifId(source.name, `${source.id}-copy`),
      );
      const draft: Motif = {
        ...cloneMotif(source),
        id: targetId,
      };
      const errors = store.add(draft);
      if (errors.length > 0) return undefined;

      this.#edit = {
        sourceId: id,
        targetId,
        original: cloneMotif(source),
        created: true,
        dirty: options.dirty ?? false,
      };
      return draft;
    }

    this.#edit = {
      sourceId: options.sourceId ?? id,
      targetId: id,
      original: cloneMotif(source),
      created: options.created ?? false,
      dirty: options.dirty ?? false,
    };
    return source;
  }

  /**
   * Mark the active edit session as dirty.
   * @returns {void}
   */
  markDirty(): void {
    if (this.#edit) this.#edit.dirty = true;
  }

  /**
   * Cancel the active edit and restore or remove its target motif.
   * @param {MotifStore} store The motif store containing the edit target.
   * @returns {string | undefined} The motif id to select, or undefined when no edit is active.
   */
  cancel(store: MotifStore): string | undefined {
    const edit = this.#edit;
    if (!edit) return undefined;

    if (edit.created) store.remove(edit.targetId);
    else store.update(cloneMotif(edit.original));

    this.#edit = undefined;
    return edit.sourceId;
  }

  /**
   * Finish the active edit after a successful save.
   * @returns {string | undefined} The persisted motif id, or undefined when no edit is active.
   */
  finishSave(): string | undefined {
    const id = this.#edit?.targetId;
    this.#edit = undefined;
    return id;
  }

  /**
   * Drop session bookkeeping without restoring data after deletion or reload.
   * @returns {void}
   */
  abandon(): void {
    this.#edit = undefined;
  }
}
