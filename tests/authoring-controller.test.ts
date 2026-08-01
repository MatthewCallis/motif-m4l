import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { HostContext } from "../src/core/types.js";
import { MotifEditorState } from "../src/library/editor-state.js";
import { MotifStore } from "../src/library/store.js";
import {
  MotifAuthoringController,
  type AuthoringControllerCallbacks,
} from "../src/max/authoring-controller.js";
import { MaxUserLibrary } from "../src/max/user-library.js";

function createAuthoring() {
  const store = new MotifStore("scale-turn");
  const editor = new MotifEditorState();
  const effects: string[] = [];
  const library = new MaxUserLibrary(store, {
    onError: (message) => effects.push(`error:${message}`),
    onStateChange: () => effects.push("library-state"),
    onStatus: (...values) => effects.push(`status:${values.join(":")}`),
    onContentsChanged: () => effects.push("contents"),
  });
  const host: HostContext = {
    tempo: 120,
    rootNote: 0,
    scaleName: "Major",
    scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
    scaleMode: true,
    timeSignature: { numerator: 4, denominator: 4 },
    isPlaying: false,
    currentSongTime: 0,
  };
  const callbacks: AuthoringControllerCallbacks = {
    getPreviewTriggerPitch: () => 60,
    emitError: (message) => effects.push(`error:${message}`),
    emitLibraryAlert: (title, message) => effects.push(`alert:${title}:${message}`),
    emitStatus: (...values) => effects.push(`status:${values.join(":")}`),
    emitLibraryState: () => effects.push("library-state"),
    emitSelectedMotifUi: () => effects.push("selected-ui"),
    listMotifs: () => effects.push("motif-list"),
    emitPersistedState: () => effects.push("persist"),
    pruneTriggerMap: () => effects.push("prune"),
    emitMotifSelected: (id) => effects.push(`selected:${id}`),
  };
  const controller = new MotifAuthoringController(store, editor, library, host, callbacks);
  return { controller, store, editor, library, effects };
}

describe("MotifAuthoringController", () => {
  it("coordinates built-in draft editing and cancellation", () => {
    const harness = createAuthoring();
    harness.controller.beginEdit();
    const draftId = harness.store.currentId;
    assert.notEqual(draftId, "scale-turn");
    assert.equal(harness.editor.isEditing(draftId), true);

    harness.controller.editMotif({ name: "Controller Draft" });
    assert.equal(harness.store.current?.name, "Controller Draft");
    assert.equal(harness.editor.isDirty(), true);

    harness.controller.cancelEdit();
    assert.equal(harness.store.currentId, "scale-turn");
    assert.equal(harness.store.has(draftId), false);
    assert.ok(harness.effects.includes("prune"));
    assert.ok(harness.effects.includes("persist"));
  });

  it("guards dirty selection and accepts explicit browser discard", () => {
    const harness = createAuthoring();
    harness.controller.beginEdit();
    harness.controller.editMotif({ description: "Dirty" });
    const draftId = harness.store.currentId;

    harness.controller.selectBrowser("chromatic-turn");
    assert.equal(harness.store.currentId, draftId);
    assert.ok(
      harness.effects.some((effect) => effect.includes("Unsaved edits must be saved or discarded")),
    );

    harness.controller.selectBrowser("chromatic-turn", true);
    assert.equal(harness.store.currentId, "chromatic-turn");
    assert.equal(harness.editor.isEditing(), false);
    assert.ok(harness.effects.includes("selected:chromatic-turn"));
  });

  it("rejects edits and saves when their preconditions are absent", () => {
    const harness = createAuthoring();
    harness.controller.editNoteAt(0, "pitch", 4);
    harness.controller.saveMotif();

    assert.ok(
      harness.effects.some((effect) => effect.includes("Start editing before changing this motif")),
    );
    assert.ok(
      harness.effects.some((effect) =>
        effect.includes("Choose a valid library folder before saving"),
      ),
    );
  });
});
