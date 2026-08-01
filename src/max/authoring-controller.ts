import { absoluteNotesToMotif, type AbsoluteNote } from "../core/import-notes.js";
import type { HostContext, Motif } from "../core/types.js";
import type { MotifEditorState } from "../library/editor-state.js";
import {
  appendMotifNote,
  applyMotifProperties as buildMotifProperties,
  removeMotifNote,
  updateMotifNote,
  type NoteEditField,
} from "../library/motif-authoring.js";
import type { MotifStore } from "../library/store.js";
import { DEFAULT_MOTIF_ID, MAX_MOTIF_NOTES } from "./device-types.js";
import { readClipNotes, resolveDetailClip } from "./live-api.js";
import { discardAllowed } from "./max-helpers.js";
import type { MaxUserLibrary } from "./user-library.js";

/** View, persistence, and diagnostic effects requested by authoring workflows. */
export interface AuthoringControllerCallbacks {
  /** Current pitch used when re-encoding motif properties. */
  getPreviewTriggerPitch: () => number;
  /** Report a user-facing diagnostic. */
  emitError: (message: string) => void;
  /** Report an actionable Library modal warning. */
  emitLibraryAlert: (title: string, message: string) => void;
  /** Emit a Max status message. */
  emitStatus: (...values: unknown[]) => void;
  /** Rebuild only the Library page state. */
  emitLibraryState: () => void;
  /** Rebuild Library and graphical preview state. */
  emitSelectedMotifUi: () => void;
  /** Rebuild the Max menu plus selected-motif views. */
  listMotifs: () => void;
  /** Serialize selection and hot keys into the engine-owned state Blob. */
  emitPersistedState: () => void;
  /** Remove hot keys targeting drafts discarded by cancellation. */
  pruneTriggerMap: () => void;
  /** Synchronize the Max motif menu selection label. */
  emitMotifSelected: (id: string, name: string) => void;
}

/**
 * Coordinates transactional motif authoring, guarded selection, and clip import.
 *
 * The store remains the catalog source of truth, the editor owns rollback
 * snapshots, and the user library owns filesystem persistence. This controller
 * owns the workflows that must update those collaborators atomically.
 */
export class MotifAuthoringController {
  constructor(
    readonly store: MotifStore,
    readonly editor: MotifEditorState,
    readonly library: MaxUserLibrary,
    readonly hostContext: HostContext,
    readonly callbacks: AuthoringControllerCallbacks,
  ) {}

  /**
   * Select a motif by id, generated label, or display name.
   * Dirty edits must be resolved before selection can move.
   * @param {string} value Motif identity submitted by the Max menu.
   */
  selectMotif(value: string): void {
    let selected = this.store.resolve(value);
    if (!selected) {
      this.callbacks.emitError(`Unknown motif: ${value}`);
      return;
    }
    if (selected.id === this.store.currentId) return;

    if (this.editor.isEditing()) {
      if (this.editor.isDirty()) {
        this.callbacks.emitError("Save or cancel the current edits before selecting another motif");
        this.callbacks.emitMotifSelected(
          this.store.currentId,
          this.store.current?.name ?? this.store.currentId,
        );
        this.callbacks.emitLibraryState();
        return;
      }
      this.editor.cancel(this.store);
      selected = this.store.resolve(value);
      if (!selected) {
        this.callbacks.emitError(`Unknown motif after cancelling edit: ${value}`);
        this.callbacks.listMotifs();
        return;
      }
    }

    this.store.select(selected.id);
    this.callbacks.emitMotifSelected(selected.id, selected.name);
    this.callbacks.emitSelectedMotifUi();
    this.callbacks.emitPersistedState();
    this.callbacks.emitStatus("Motif", selected.name);
  }

  /**
   * Import the selected Detail View MIDI clip as a dirty new draft.
   * @param {string} pitchModeValue Relative pitch-analysis mode.
   */
  importClip(pitchModeValue = "chromatic"): void {
    if (this.library.scanning) {
      this.callbacks.emitError("Wait for the library scan to finish before importing a clip");
      this.callbacks.emitLibraryState();
      return;
    }
    if (this.editor.isDirty()) {
      this.callbacks.emitError("Save or cancel the current edits before importing a clip");
      this.callbacks.emitLibraryState();
      return;
    }

    const mode = String(pitchModeValue || "chromatic");
    if (mode !== "scale" && mode !== "chromatic" && mode !== "hybrid") {
      this.callbacks.emitError(`Unknown import pitch mode: ${mode}`);
      return;
    }

    const clip = resolveDetailClip();
    if (!clip) {
      this.callbacks.emitError(
        "No clip selected - open a MIDI clip in Detail View, then Import Clip",
      );
      return;
    }

    let absoluteNotes: AbsoluteNote[] = [];
    try {
      absoluteNotes = readClipNotes(clip);
    } catch (reason) {
      this.callbacks.emitError(
        `Clip import failed: ${reason instanceof Error ? reason.message : String(reason)}`,
      );
      return;
    }

    if (absoluteNotes.length === 0) {
      this.callbacks.emitError("Selected clip has no notes");
      return;
    }
    if (absoluteNotes.length > MAX_MOTIF_NOTES) {
      this.callbacks.emitLibraryAlert(
        "MIDI file is too long",
        `The selected MIDI clip contains ${absoluteNotes.length} notes. ` +
          `Motif can import up to ${MAX_MOTIF_NOTES} editable notes. ` +
          "Shorten the clip or split it into smaller phrases, then import it again.",
      );
      return;
    }

    const clipNameRaw = clip.getstring("name");
    const clipName =
      String(Array.isArray(clipNameRaw) ? clipNameRaw[0] : clipNameRaw || "Imported Clip").trim() ||
      "Imported Clip";
    let imported: Motif;
    try {
      imported = absoluteNotesToMotif(absoluteNotes, {
        id: "pending-import",
        name: clipName,
        pitchMode: mode,
        scaleRootNote: this.hostContext.rootNote,
        scaleIntervals: this.hostContext.scaleIntervals,
        sourceMeter: { ...this.hostContext.timeSignature },
        description: `Imported from Live clip “${clipName}” using ${mode} relative analysis.`,
      });
    } catch (reason) {
      this.callbacks.emitError(
        `Clip import failed: ${reason instanceof Error ? reason.message : String(reason)}`,
      );
      return;
    }

    let restoreId = this.store.currentId;
    if (this.editor.isEditing()) {
      restoreId = this.editor.cancel(this.store) ?? restoreId;
      this.store.select(restoreId);
    }

    const id = this.library.uniqueId(clipName, `clip-${Date.now()}`);
    try {
      const errors = this.store.add({ ...imported, id });
      if (errors.length > 0) {
        if (!this.store.select(restoreId)) {
          this.store.ensureCurrent(DEFAULT_MOTIF_ID);
        }
        this.callbacks.listMotifs();
        this.callbacks.emitError(errors.join("; "));
        return;
      }
      const edit = this.editor.begin(this.store, id, {
        dirty: true,
        created: true,
        sourceId: restoreId,
      });
      if (!edit) {
        this.store.remove(id);
        if (!this.store.select(restoreId)) {
          this.store.ensureCurrent(DEFAULT_MOTIF_ID);
        }
        this.callbacks.emitError("Could not start editing the imported motif");
        this.callbacks.listMotifs();
        return;
      }
      this.store.select(id);
      this.callbacks.listMotifs();
      this.callbacks.emitStatus("imported-clip", id, absoluteNotes.length);
    } catch (reason) {
      this.store.remove(id);
      if (!this.store.select(restoreId)) {
        this.store.ensureCurrent(DEFAULT_MOTIF_ID);
      }
      this.editor.abandon();
      this.callbacks.listMotifs();
      this.callbacks.emitError(
        `Clip import failed: ${reason instanceof Error ? reason.message : String(reason)}`,
      );
    }
  }

  /**
   * Validate and apply motif-level properties to the active draft.
   * @param {unknown} value Submitted properties.
   * @returns {boolean} Whether the update was valid.
   */
  applyMotifProperties(value: unknown): boolean {
    const editable = this.editableMotif();
    if (!editable) return false;

    const result = buildMotifProperties(editable, value, {
      triggerPitch: this.callbacks.getPreviewTriggerPitch(),
      host: this.hostContext,
    });
    if (!result.ok) {
      this.callbacks.emitError(result.error);
      this.callbacks.emitLibraryState();
      return false;
    }
    if (!result.changed) return true;

    const errors = this.store.update(result.value);
    if (errors.length > 0) {
      this.callbacks.emitError(errors.join("; "));
      this.callbacks.emitLibraryState();
      return false;
    }
    this.editor.markDirty();
    return true;
  }

  /**
   * Save the active edit session.
   * @param {unknown | undefined} properties Optional properties to apply first.
   */
  saveMotif(properties?: unknown): void {
    if (properties !== undefined && !this.applyMotifProperties(properties)) return;
    if (!this.library.path || !this.library.loaded) {
      this.callbacks.emitError("Choose a valid library folder before saving");
      return;
    }

    const selected = this.store.current;
    if (!selected) {
      this.callbacks.emitError("No motif selected");
      return;
    }
    if (!this.editor.isEditing(selected.id)) {
      this.callbacks.emitError("Start editing before saving");
      this.callbacks.emitLibraryState();
      return;
    }

    try {
      const filename = this.library.save(selected.id);
      this.editor.finishSave();
      this.callbacks.listMotifs();
      this.callbacks.emitPersistedState();
      this.callbacks.emitStatus("saved", selected.id, filename);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : String(reason);
      this.callbacks.emitError(
        message.includes("already exists")
          ? `Save refused because ${message}`
          : `Save failed: ${message}`,
      );
      this.callbacks.emitLibraryState();
    }
  }

  /**
   * Return the motif targeted by the active edit session.
   * @returns {Motif | undefined} Editable motif when the selection is valid.
   */
  editableMotif(): Motif | undefined {
    if (!this.store.current) {
      this.callbacks.emitError("No motif selected");
      return undefined;
    }
    const editable = this.editor.current(this.store);
    if (!editable || editable.id !== this.store.currentId) {
      this.callbacks.emitError("Start editing before changing this motif");
      this.callbacks.emitLibraryState();
      return undefined;
    }
    return editable;
  }

  /** Begin editing the current motif. */
  beginEdit(): void {
    if (this.library.scanning) {
      this.callbacks.emitError("Wait for the library scan to finish before editing a motif");
      this.callbacks.emitLibraryState();
      return;
    }
    if (this.editor.isEditing(this.store.currentId)) {
      this.callbacks.emitLibraryState();
      return;
    }

    const selected = this.store.current;
    const targetId =
      selected && this.store.isBuiltin(selected.id)
        ? this.library.uniqueId(selected.name, `${selected.id}-copy`)
        : undefined;
    const editable = this.editor.begin(
      this.store,
      this.store.currentId,
      targetId ? { targetId } : {},
    );
    if (!editable) {
      this.callbacks.emitError("Could not start editing the selected motif");
      return;
    }
    this.store.select(editable.id);
    this.callbacks.listMotifs();
    this.callbacks.emitStatus("editing", editable.id, editable.name);
  }

  /** Cancel editing and restore the previous selection or saved motif. */
  cancelEdit(): void {
    const restoredId = this.editor.cancel(this.store);
    if (!restoredId) {
      this.callbacks.emitLibraryState();
      return;
    }

    if (!this.store.select(restoredId)) {
      this.store.ensureCurrent(DEFAULT_MOTIF_ID);
    }
    this.callbacks.pruneTriggerMap();
    this.callbacks.listMotifs();
    this.callbacks.emitPersistedState();
    this.callbacks.emitStatus("editing-cancelled", this.store.currentId);
  }

  /**
   * Apply motif-level properties and refresh the selected motif views.
   * @param {unknown} properties Submitted properties.
   */
  editMotif(properties: unknown): void {
    if (!this.applyMotifProperties(properties)) return;
    this.callbacks.emitSelectedMotifUi();
    this.callbacks.emitStatus("motif-edited", this.store.currentId);
  }

  /**
   * Select one stable id from the Library browser.
   * @param {string} id Stable motif id.
   * @param {number | boolean | undefined} discardChanges Explicit discard permission.
   */
  selectBrowser(id: string, discardChanges?: number | boolean): void {
    const item = this.store.get(String(id));
    if (!item || item.id === this.store.currentId) return;

    if (this.editor.isEditing()) {
      if (this.editor.isDirty() && !discardAllowed(discardChanges)) {
        this.callbacks.emitError(
          "Unsaved edits must be saved or discarded before selecting another motif",
        );
        this.callbacks.emitLibraryState();
        return;
      }
      this.editor.cancel(this.store);
    }

    const selected = this.store.get(item.id);
    if (!selected) return;
    this.store.select(selected.id);
    this.callbacks.emitMotifSelected(selected.id, selected.name);
    this.callbacks.emitSelectedMotifUi();
    this.callbacks.emitPersistedState();
    this.callbacks.emitStatus("Motif", selected.name);
  }

  /**
   * Update a note at a specific row index.
   * @param {number} index Row index.
   * @param {NoteEditField} field Field to update.
   * @param {unknown} value Submitted value.
   * @returns {boolean} Whether the note was updated.
   */
  updateNoteAt(index: number, field: NoteEditField, value: unknown): boolean {
    const editable = this.editableMotif();
    if (!editable) return false;

    const result = updateMotifNote(editable, index, field, value);
    if (!result.ok) {
      this.callbacks.emitError(result.error);
      return false;
    }

    const errors = this.store.setNotes(editable.id, result.notes);
    if (errors.length > 0) {
      this.callbacks.emitError(errors.join("; "));
      return false;
    }

    this.editor.markDirty();
    this.callbacks.emitSelectedMotifUi();
    this.callbacks.emitStatus("note-edited", index, field, result.statusValue ?? "unset");
    return true;
  }

  /**
   * Edit a note using raw message-boundary values.
   * @param {number} rowIndexValue Row index.
   * @param {string} fieldValue Field name.
   * @param {unknown} valueValue Submitted value.
   */
  editNoteAt(rowIndexValue: number, fieldValue: string, valueValue: unknown): void {
    this.updateNoteAt(Math.round(rowIndexValue), String(fieldValue) as NoteEditField, valueValue);
  }

  /** Append a default note to the active draft. */
  addNote(): void {
    const editable = this.editableMotif();
    if (!editable) return;
    const result = appendMotifNote(editable, MAX_MOTIF_NOTES);
    if (!result.ok) {
      this.callbacks.emitError(result.error);
      return;
    }
    const errors = this.store.setNotes(editable.id, result.notes);
    if (errors.length > 0) {
      this.callbacks.emitError(errors.join("; "));
      return;
    }
    this.editor.markDirty();
    this.callbacks.emitSelectedMotifUi();
  }

  /**
   * Remove one note from the active draft.
   * @param {number} indexValue Row index.
   */
  removeNote(indexValue: number): void {
    const editable = this.editableMotif();
    if (!editable) return;
    const index = Math.round(indexValue);
    if (index < 0 || index >= editable.notes.length) return;

    const result = removeMotifNote(editable, index);
    if (!result.ok) {
      this.callbacks.emitError(result.error);
      return;
    }
    const errors = this.store.setNotes(editable.id, result.notes);
    if (errors.length > 0) {
      this.callbacks.emitError(errors.join("; "));
      return;
    }
    this.editor.markDirty();
    this.callbacks.emitSelectedMotifUi();
  }
}
