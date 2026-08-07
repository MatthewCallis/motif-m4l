import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { HostContext } from "../src/core/types.js";
import { MotifEditorState } from "../src/library/editor-state.js";
import { MotifStore } from "../src/library/store.js";
import {
  MotifAuthoringController,
  type AuthoringControllerCallbacks,
} from "../src/max/library/device/authoring-controller.js";
import { MAX_MOTIF_NOTES } from "../src/max/device-types.js";
import { MaxUserLibrary } from "../src/max/library/device/repository.js";
import { addUserCopy } from "./helpers/motif-store.js";

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
    emitError: (message) => effects.push(`error:${message}`),
    emitLibraryAlert: (title, message) => effects.push(`alert:${title}:${message}`),
    emitStatus: (...values) => effects.push(`status:${values.join(":")}`),
    emitLibraryState: () => effects.push("library-state"),
    emitSelectedMotifUi: () => effects.push("selected-ui"),
    listMotifs: () => effects.push("motif-list"),
    emitPersistedState: () => effects.push("persist"),
    pruneTriggerMap: () => effects.push("prune"),
    emitMotifSelected: (id, name) => effects.push(`selected:${id}:${name}`),
  };
  const controller = new MotifAuthoringController(store, editor, library, host, callbacks);
  return { controller, store, editor, library, effects, host };
}

function installClipLiveApi(options: {
  notes?: Array<Record<string, unknown>>;
  name?: string | string[];
  throwOnRead?: Error;
  id?: number;
}): void {
  const notes = options.notes ?? [
    { pitch: 60, start_time: 0, duration: 0.5, velocity: 100, mute: 0 },
  ];
  class MockLiveAPI {
    id = options.id ?? 1;
    get(property: string): number {
      return property === "is_midi_clip" ? 1 : 0;
    }
    getstring(property: string): string | string[] {
      if (property === "name") {
        return options.name ?? "Imported Clip";
      }
      return "";
    }
    call(method: string): unknown {
      if (method === "get_notes_extended") {
        if (options.throwOnRead) {
          throw options.throwOnRead;
        }
        return JSON.stringify({ notes });
      }
      return [];
    }
  }
  Object.assign(globalThis, { LiveAPI: MockLiveAPI });
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
    assert.ok(harness.effects.some((effect) => effect.startsWith("selected:chromatic-turn:")));
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

  it("guards motif menu selection against unknown, current, dirty, and clean edits", () => {
    const harness = createAuthoring();
    harness.controller.selectMotif("missing-motif");
    assert.ok(harness.effects.some((effect) => effect.includes("Unknown motif: missing-motif")));

    harness.effects.length = 0;
    harness.controller.selectMotif("scale-turn");
    assert.deepEqual(harness.effects, []);

    harness.controller.beginEdit();
    harness.controller.editMotif({ name: "Dirty Draft" });
    harness.effects.length = 0;
    harness.controller.selectMotif("chromatic-turn");
    assert.ok(harness.effects.some((effect: string) => effect.includes("Save or cancel")));
    assert.ok(
      harness.effects.some((effect: string) =>
        effect.startsWith(`selected:${harness.store.currentId}:`),
      ),
    );
    assert.notEqual(harness.store.currentId, "chromatic-turn");

    harness.controller.cancelEdit();
    harness.controller.beginEdit();
    assert.equal(harness.editor.isDirty(), false);
    harness.effects.length = 0;
    harness.controller.selectMotif("chromatic-turn");
    assert.equal(harness.store.currentId, "chromatic-turn");
    assert.equal(harness.editor.isEditing(), false);
    assert.ok(harness.effects.some((effect: string) => effect === "selected-ui"));
    assert.ok(harness.effects.some((effect: string) => effect === "persist"));
  });

  it("blocks import and edit while scanning or dirty, and requires a library folder", () => {
    const harness = createAuthoring();
    installClipLiveApi({});

    harness.library.scanning = true;
    harness.controller.importClip();
    harness.controller.beginEdit();
    assert.ok(harness.effects.some((effect) => effect.includes("Wait for the library scan")));
    harness.library.scanning = false;

    harness.controller.beginEdit();
    harness.controller.editMotif({ description: "Dirty before import" });
    harness.effects.length = 0;
    harness.controller.importClip();
    assert.ok(
      harness.effects.some((effect) =>
        effect.includes("Save or cancel the current edits before importing"),
      ),
    );

    harness.controller.cancelEdit();
    harness.effects.length = 0;
    harness.controller.importClip();
    assert.ok(
      harness.effects.some((effect) => effect.startsWith("alert:Library folder required:")),
    );
  });

  it("imports a Detail View clip into a dirty draft and rolls back on begin failure", () => {
    const harness = createAuthoring();
    harness.library.path = "/library";
    harness.library.loaded = true;
    installClipLiveApi({ name: ["  Phrase A  "] });

    harness.effects.length = 0;
    harness.controller.importClip();
    assert.ok(harness.effects.some((effect) => effect.startsWith("status:imported-clip:")));
    assert.equal(harness.editor.isDirty(), true);
    assert.equal(harness.editor.snapshot().created, true);
    assert.equal(harness.store.current?.name, "Phrase A");

    harness.controller.cancelEdit();
    installClipLiveApi({ notes: [] });
    harness.effects.length = 0;
    harness.controller.importClip();
    assert.ok(harness.effects.some((effect) => effect.includes("Selected clip has no notes")));

    const tooMany = Array.from({ length: MAX_MOTIF_NOTES + 1 }, (_, index) => ({
      pitch: 60 + (index % 12),
      start_time: index * 0.1,
      duration: 0.1,
      velocity: 100,
      mute: 0,
    }));
    installClipLiveApi({ notes: tooMany });
    harness.effects.length = 0;
    harness.controller.importClip();
    assert.ok(harness.effects.some((effect) => effect.startsWith("alert:MIDI file is too long:")));

    installClipLiveApi({ throwOnRead: new Error("Live notes unavailable") });
    harness.effects.length = 0;
    harness.controller.importClip();
    assert.ok(
      harness.effects.some((effect) =>
        effect.includes("Clip import failed: Live notes unavailable"),
      ),
    );

    installClipLiveApi({});
    const begin = harness.editor.begin.bind(harness.editor);
    harness.editor.begin = () => undefined;
    harness.effects.length = 0;
    const before = harness.store.list().map((motif) => motif.id);
    harness.controller.importClip();
    harness.editor.begin = begin;
    assert.ok(
      harness.effects.some((effect) =>
        effect.includes("Could not start editing the imported motif"),
      ),
    );
    assert.deepEqual(
      harness.store.list().map((motif) => motif.id),
      before,
    );
  });

  it("alerts when pitch-mode conversion needs unresolved source intervals", () => {
    const harness = createAuthoring();
    const user = addUserCopy(harness.store, "chromatic-turn", "user-phrase");
    assert.ok(user);
    harness.store.select(user.id);
    harness.controller.beginEdit();
    harness.effects.length = 0;

    harness.controller.editMotif({
      pitchMode: "scale",
      sourcePitchContext: {
        ...user.sourcePitchContext,
        scaleIntervals: null,
        scaleName: "Custom Unknown Scale",
      },
    });
    assert.ok(harness.effects.some((effect) => effect.startsWith("alert:Source scale required:")));
    assert.equal(harness.store.current?.pitchMode, "chromatic");
  });

  it("saves drafts, reports collisions, and no-ops cancel without a session", () => {
    const harness = createAuthoring();
    harness.library.path = "/library";
    harness.library.loaded = true;
    const user = addUserCopy(harness.store, "chromatic-turn", "save-me");
    assert.ok(user);
    harness.store.select(user.id);

    harness.effects.length = 0;
    harness.controller.saveMotif();
    assert.ok(harness.effects.some((effect) => effect.includes("Start editing before saving")));

    harness.controller.beginEdit();
    const savedPath = "/library/save-me.json";
    harness.library.save = () => savedPath;
    harness.effects.length = 0;
    harness.controller.saveMotif({ name: "Saved Name" });
    assert.equal(harness.store.current?.name, "Saved Name");
    assert.equal(harness.editor.isEditing(), false);
    assert.ok(
      harness.effects.some((effect) => effect.includes(`status:saved:save-me:${savedPath}`)),
    );

    harness.controller.beginEdit();
    harness.library.save = () => {
      throw new Error("save-me.json already exists");
    };
    harness.effects.length = 0;
    harness.controller.saveMotif();
    assert.ok(harness.effects.some((effect) => effect.includes("Save refused because")));

    harness.library.save = () => {
      throw new Error("disk full");
    };
    harness.effects.length = 0;
    harness.controller.saveMotif();
    assert.ok(harness.effects.some((effect) => effect.includes("Save failed: disk full")));

    harness.controller.cancelEdit();
    harness.effects.length = 0;
    harness.controller.cancelEdit();
    assert.deepEqual(harness.effects, ["library-state"]);
  });

  it("edits notes through authoring guards and reports field errors", () => {
    const harness = createAuthoring();
    const user = addUserCopy(harness.store, "chromatic-turn", "note-edit");
    assert.ok(user);
    harness.store.select(user.id);
    harness.controller.beginEdit();

    assert.equal(harness.controller.updateNoteAt(0, "pitch", 3), true);
    assert.equal(harness.store.current?.notes[0]?.pitch, 3);

    harness.effects.length = 0;
    assert.equal(harness.controller.updateNoteAt(0, "velocity", 200), false);
    assert.ok(harness.effects.some((effect) => effect.includes("velocity must be an integer")));

    harness.controller.addNote();
    assert.equal(harness.store.current?.notes.length, user.notes.length + 1);
    const lastIndex = (harness.store.current?.notes.length ?? 1) - 1;
    harness.controller.removeNote(lastIndex);
    assert.equal(harness.store.current?.notes.length, user.notes.length);

    harness.effects.length = 0;
    harness.controller.beginEdit();
    assert.ok(harness.effects.includes("library-state"));
  });

  it("falls back to the default motif when cancel restore targets a missing id", () => {
    const harness = createAuthoring();
    const user = addUserCopy(harness.store, "chromatic-turn", "ephemeral");
    assert.ok(user);
    harness.store.select(user.id);
    harness.controller.beginEdit();
    harness.controller.editMotif({ name: "Will Cancel" });

    const cancel = harness.editor.cancel.bind(harness.editor);
    harness.editor.cancel = (store) => {
      cancel(store);
      // Restore target vanished; remove must not pre-empt DEFAULT via list()[0].
      store.remove(user.id);
      return user.id;
    };
    harness.controller.cancelEdit();
    harness.editor.cancel = cancel;
    assert.equal(harness.store.currentId, "scale-turn");
    assert.ok(harness.effects.includes("prune"));
  });

  it("reports note mutation failures when the store rejects the update", () => {
    const harness = createAuthoring();
    const user = addUserCopy(harness.store, "chromatic-turn", "store-reject");
    assert.ok(user);
    harness.store.select(user.id);
    harness.controller.beginEdit();

    const setNotes = harness.store.setNotes.bind(harness.store);
    harness.store.setNotes = () => ["forced note failure"];
    harness.effects.length = 0;
    assert.equal(harness.controller.updateNoteAt(0, "pitch", 1), false);
    harness.controller.addNote();
    harness.controller.removeNote(0);
    harness.store.setNotes = setNotes;
    assert.equal(
      harness.effects.filter((effect) => effect.includes("forced note failure")).length,
      3,
    );

    const update = harness.store.update.bind(harness.store);
    harness.store.update = () => ["forced property failure"];
    harness.effects.length = 0;
    assert.equal(harness.controller.applyMotifProperties({ name: "Nope" }), false);
    harness.store.update = update;
    assert.ok(harness.effects.some((effect) => effect.includes("forced property failure")));

    while ((harness.store.current?.notes.length ?? 0) < MAX_MOTIF_NOTES) {
      harness.controller.addNote();
    }
    harness.effects.length = 0;
    harness.controller.addNote();
    assert.ok(harness.effects.some((effect) => effect.includes(`Maximum ${MAX_MOTIF_NOTES}`)));
  });

  it("covers selection/import failure branches that leave catalog state intact", () => {
    const harness = createAuthoring();
    const vanishing = addUserCopy(harness.store, "chromatic-turn", "vanishing-target");
    assert.ok(vanishing);
    harness.controller.beginEdit();
    assert.equal(harness.editor.isDirty(), false);
    const cancel = harness.editor.cancel.bind(harness.editor);
    harness.editor.cancel = (store) => {
      const restored = cancel(store);
      store.remove("vanishing-target");
      return restored;
    };
    harness.effects.length = 0;
    harness.controller.selectMotif("vanishing-target");
    harness.editor.cancel = cancel;
    assert.ok(
      harness.effects.some((effect) =>
        effect.includes("Unknown motif after cancelling edit: vanishing-target"),
      ),
    );
    assert.ok(harness.effects.includes("motif-list"));

    harness.library.path = "/library";
    harness.library.loaded = true;
    harness.library.scanning = false;
    installClipLiveApi({});
    const add = harness.store.add.bind(harness.store);
    harness.store.add = () => ["forced add failure"];
    harness.effects.length = 0;
    harness.controller.importClip();
    harness.store.add = add;
    assert.ok(harness.effects.some((effect) => effect.includes("forced add failure")));

    harness.store.currentId = "ghost";
    harness.effects.length = 0;
    assert.equal(harness.controller.applyMotifProperties({ name: "x" }), false);
    assert.ok(harness.effects.some((effect) => effect.includes("No motif selected")));

    const begin = harness.editor.begin.bind(harness.editor);
    harness.store.select("scale-turn");
    harness.editor.begin = () => undefined;
    harness.effects.length = 0;
    harness.controller.beginEdit();
    harness.editor.begin = begin;
    assert.ok(
      harness.effects.some((effect) =>
        effect.includes("Could not start editing the selected motif"),
      ),
    );
  });
});
