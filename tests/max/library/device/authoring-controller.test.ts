import { afterEach, describe, expect, it, vi } from "vitest";
import type { HostContext } from "../../../../src/core/types.js";
import { MotifEditorState } from "../../../../src/library/editor-state.js";
import { MotifStore } from "../../../../src/library/store.js";
import {
  MotifAuthoringController,
  type AuthoringControllerCallbacks,
} from "../../../../src/max/library/device/authoring-controller.js";
import { MAX_MOTIF_NOTES } from "../../../../src/max/device-types.js";
import { MaxUserLibrary } from "../../../../src/max/library/device/repository.js";
import { addUserCopy } from "../../../helpers/motif-store.js";

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
  vi.stubGlobal("LiveAPI", MockLiveAPI);
}

describe("MotifAuthoringController", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("coordinates built-in draft editing and cancellation", () => {
    const harness = createAuthoring();
    harness.controller.beginEdit();
    const draftId = harness.store.currentId;
    expect(draftId).not.toBe("scale-turn");
    expect(harness.editor.isEditing(draftId)).toBe(true);

    harness.controller.editMotif({ name: "Controller Draft" });
    expect(harness.store.current?.name).toBe("Controller Draft");
    expect(harness.editor.isDirty()).toBe(true);

    harness.controller.cancelEdit();
    expect(harness.store.currentId).toBe("scale-turn");
    expect(harness.store.has(draftId)).toBe(false);
    expect(harness.effects.includes("prune")).toBeTruthy();
    expect(harness.effects.includes("persist")).toBeTruthy();
  });

  it("guards dirty selection and accepts explicit browser discard", () => {
    const harness = createAuthoring();
    harness.controller.beginEdit();
    harness.controller.editMotif({ description: "Dirty" });
    const draftId = harness.store.currentId;

    harness.controller.selectBrowser("chromatic-turn");
    expect(harness.store.currentId).toBe(draftId);
    expect(
      harness.effects.some((effect) => effect.includes("Unsaved edits must be saved or discarded")),
    ).toBeTruthy();

    harness.controller.selectBrowser("chromatic-turn", true);
    expect(harness.store.currentId).toBe("chromatic-turn");
    expect(harness.editor.isEditing()).toBe(false);
    expect(
      harness.effects.some((effect) => effect.startsWith("selected:chromatic-turn:")),
    ).toBeTruthy();
  });

  it("rejects edits and saves when their preconditions are absent", () => {
    const harness = createAuthoring();
    harness.controller.editNoteAt(0, "pitch", 4);
    harness.controller.saveMotif();

    expect(
      harness.effects.some((effect) => effect.includes("Start editing before changing this motif")),
    ).toBeTruthy();
    expect(
      harness.effects.some((effect) =>
        effect.includes("Choose a valid library folder before saving"),
      ),
    ).toBeTruthy();
  });

  it("guards motif menu selection against unknown, current, dirty, and clean edits", () => {
    const harness = createAuthoring();
    harness.controller.selectMotif("missing-motif");
    expect(
      harness.effects.some((effect) => effect.includes("Unknown motif: missing-motif")),
    ).toBeTruthy();

    harness.effects.length = 0;
    harness.controller.selectMotif("scale-turn");
    expect(harness.effects).toEqual([]);

    harness.controller.beginEdit();
    harness.controller.editMotif({ name: "Dirty Draft" });
    harness.effects.length = 0;
    harness.controller.selectMotif("chromatic-turn");
    expect(
      harness.effects.some((effect: string) => effect.includes("Save or cancel")),
    ).toBeTruthy();
    expect(
      harness.effects.some((effect: string) =>
        effect.startsWith(`selected:${harness.store.currentId}:`),
      ),
    ).toBeTruthy();
    expect(harness.store.currentId).not.toBe("chromatic-turn");

    harness.controller.cancelEdit();
    harness.controller.beginEdit();
    expect(harness.editor.isDirty()).toBe(false);
    harness.effects.length = 0;
    harness.controller.selectMotif("chromatic-turn");
    expect(harness.store.currentId).toBe("chromatic-turn");
    expect(harness.editor.isEditing()).toBe(false);
    expect(harness.effects.some((effect: string) => effect === "selected-ui")).toBeTruthy();
    expect(harness.effects.some((effect: string) => effect === "persist")).toBeTruthy();
  });

  it("blocks import and edit while scanning or dirty, and requires a library folder", () => {
    const harness = createAuthoring();
    installClipLiveApi({});

    harness.library.scanning = true;
    harness.controller.importClip();
    harness.controller.beginEdit();
    expect(
      harness.effects.some((effect) => effect.includes("Wait for the library scan")),
    ).toBeTruthy();
    harness.library.scanning = false;

    harness.controller.beginEdit();
    harness.controller.editMotif({ description: "Dirty before import" });
    harness.effects.length = 0;
    harness.controller.importClip();
    expect(
      harness.effects.some((effect) =>
        effect.includes("Save or cancel the current edits before importing"),
      ),
    ).toBeTruthy();

    harness.controller.cancelEdit();
    harness.effects.length = 0;
    harness.controller.importClip();
    expect(
      harness.effects.some((effect) => effect.startsWith("alert:Library folder required:")),
    ).toBeTruthy();
  });

  it("imports a Detail View clip into a dirty draft and rolls back on begin failure", () => {
    const harness = createAuthoring();
    harness.library.path = "/library";
    harness.library.loaded = true;
    installClipLiveApi({ name: ["  Phrase A  "] });

    harness.effects.length = 0;
    harness.controller.importClip();
    expect(
      harness.effects.some((effect) => effect.startsWith("status:imported-clip:")),
    ).toBeTruthy();
    expect(harness.editor.isDirty()).toBe(true);
    expect(harness.editor.snapshot().created).toBe(true);
    expect(harness.store.current?.name).toBe("Phrase A");

    harness.controller.cancelEdit();
    installClipLiveApi({ notes: [] });
    harness.effects.length = 0;
    harness.controller.importClip();
    expect(
      harness.effects.some((effect) => effect.includes("Selected clip has no notes")),
    ).toBeTruthy();

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
    expect(
      harness.effects.some((effect) => effect.startsWith("alert:MIDI file is too long:")),
    ).toBeTruthy();

    installClipLiveApi({ throwOnRead: new Error("Live notes unavailable") });
    harness.effects.length = 0;
    harness.controller.importClip();
    expect(
      harness.effects.some((effect) =>
        effect.includes("Clip import failed: Live notes unavailable"),
      ),
    ).toBeTruthy();

    installClipLiveApi({});
    const begin = harness.editor.begin.bind(harness.editor);
    harness.editor.begin = () => undefined;
    harness.effects.length = 0;
    const before = harness.store.list().map((motif) => motif.id);
    harness.controller.importClip();
    harness.editor.begin = begin;
    expect(
      harness.effects.some((effect) =>
        effect.includes("Could not start editing the imported motif"),
      ),
    ).toBeTruthy();
    expect(harness.store.list().map((motif) => motif.id)).toEqual(before);
  });

  it("alerts when pitch-mode conversion needs unresolved source intervals", () => {
    const harness = createAuthoring();
    const user = addUserCopy(harness.store, "chromatic-turn", "user-phrase");
    expect(user).toBeTruthy();
    harness.store.select(user!.id);
    harness.controller.beginEdit();
    harness.effects.length = 0;

    harness.controller.editMotif({
      pitchMode: "scale",
      sourcePitchContext: {
        ...user!.sourcePitchContext,
        scaleIntervals: null,
        scaleName: "Custom Unknown Scale",
      },
    });
    expect(
      harness.effects.some((effect) => effect.startsWith("alert:Source scale required:")),
    ).toBeTruthy();
    expect(harness.store.current?.pitchMode).toBe("chromatic");
  });

  it("edits motif-owned trigger mode and repeat rounding", () => {
    const harness = createAuthoring();
    const user = addUserCopy(harness.store, "chromatic-turn", "performance-fields");
    expect(user).toBeTruthy();
    harness.store.select(user!.id);
    harness.controller.beginEdit();

    harness.controller.editMotif({ triggerMode: "hold-repeat", repeatRounding: "1-bar" });
    expect(harness.store.current?.triggerMode).toBe("hold-repeat");
    expect(harness.store.current?.repeatRounding).toBe("1-bar");

    harness.controller.editMotif({ triggerMode: "forever", repeatRounding: "nearest" });
    expect(harness.effects.some((effect) => effect.includes("triggerMode must be"))).toBeTruthy();
    expect(harness.store.current?.triggerMode).toBe("hold-repeat");
    expect(harness.store.current?.repeatRounding).toBe("1-bar");
  });

  it("saves drafts, reports collisions, and no-ops cancel without a session", () => {
    const harness = createAuthoring();
    harness.library.path = "/library";
    harness.library.loaded = true;
    const user = addUserCopy(harness.store, "chromatic-turn", "save-me");
    expect(user).toBeTruthy();
    harness.store.select(user!.id);

    harness.effects.length = 0;
    harness.controller.saveMotif();
    expect(
      harness.effects.some((effect) => effect.includes("Start editing before saving")),
    ).toBeTruthy();

    harness.controller.beginEdit();
    const savedPath = "/library/save-me.json";
    harness.library.save = () => savedPath;
    harness.effects.length = 0;
    harness.controller.saveMotif({ name: "Saved Name" });
    expect(harness.store.current?.name).toBe("Saved Name");
    expect(harness.editor.isEditing()).toBe(false);
    expect(
      harness.effects.some((effect) => effect.includes(`status:saved:save-me:${savedPath}`)),
    ).toBeTruthy();

    harness.controller.beginEdit();
    harness.library.save = () => {
      throw new Error("save-me.json already exists");
    };
    harness.effects.length = 0;
    harness.controller.saveMotif();
    expect(harness.effects.some((effect) => effect.includes("Save refused because"))).toBeTruthy();

    harness.library.save = () => {
      throw new Error("disk full");
    };
    harness.effects.length = 0;
    harness.controller.saveMotif();
    expect(
      harness.effects.some((effect) => effect.includes("Save failed: disk full")),
    ).toBeTruthy();

    harness.controller.cancelEdit();
    harness.effects.length = 0;
    harness.controller.cancelEdit();
    expect(harness.effects).toEqual(["library-state"]);
  });

  it("edits notes through authoring guards and reports field errors", () => {
    const harness = createAuthoring();
    const user = addUserCopy(harness.store, "chromatic-turn", "note-edit");
    expect(user).toBeTruthy();
    harness.store.select(user!.id);
    harness.controller.beginEdit();

    expect(harness.controller.updateNoteAt(0, "pitch", 3)).toBe(true);
    expect(harness.store.current?.notes[0]?.pitch).toBe(3);

    harness.effects.length = 0;
    expect(harness.controller.updateNoteAt(0, "velocity", 200)).toBe(false);
    expect(
      harness.effects.some((effect) => effect.includes("velocity must be an integer")),
    ).toBeTruthy();

    harness.controller.addNote();
    expect(harness.store.current?.notes.length).toBe(user!.notes.length + 1);
    const lastIndex = (harness.store.current?.notes.length ?? 1) - 1;
    harness.controller.removeNote(lastIndex);
    expect(harness.store.current?.notes.length).toBe(user!.notes.length);

    harness.effects.length = 0;
    harness.controller.beginEdit();
    expect(harness.effects.includes("library-state")).toBeTruthy();
  });

  it("falls back to the default motif when cancel restore targets a missing id", () => {
    const harness = createAuthoring();
    const user = addUserCopy(harness.store, "chromatic-turn", "ephemeral");
    expect(user).toBeTruthy();
    harness.store.select(user!.id);
    harness.controller.beginEdit();
    harness.controller.editMotif({ name: "Will Cancel" });

    const cancel = harness.editor.cancel.bind(harness.editor);
    harness.editor.cancel = (store) => {
      cancel(store);
      // Restore target vanished; remove must not pre-empt DEFAULT via list()[0].
      store.remove(user!.id);
      return user!.id;
    };
    harness.controller.cancelEdit();
    harness.editor.cancel = cancel;
    expect(harness.store.currentId).toBe("scale-turn");
    expect(harness.effects.includes("prune")).toBeTruthy();
  });

  it("reports note mutation failures when the store rejects the update", () => {
    const harness = createAuthoring();
    const user = addUserCopy(harness.store, "chromatic-turn", "store-reject");
    expect(user).toBeTruthy();
    harness.store.select(user!.id);
    harness.controller.beginEdit();

    const setNotes = harness.store.setNotes.bind(harness.store);
    harness.store.setNotes = () => ["forced note failure"];
    harness.effects.length = 0;
    expect(harness.controller.updateNoteAt(0, "pitch", 1)).toBe(false);
    harness.controller.addNote();
    harness.controller.removeNote(0);
    harness.store.setNotes = setNotes;
    expect(harness.effects.filter((effect) => effect.includes("forced note failure")).length).toBe(
      3,
    );

    const update = harness.store.update.bind(harness.store);
    harness.store.update = () => ["forced property failure"];
    harness.effects.length = 0;
    expect(harness.controller.applyMotifProperties({ name: "Nope" })).toBe(false);
    harness.store.update = update;
    expect(
      harness.effects.some((effect) => effect.includes("forced property failure")),
    ).toBeTruthy();

    while ((harness.store.current?.notes.length ?? 0) < MAX_MOTIF_NOTES) {
      harness.controller.addNote();
    }
    harness.effects.length = 0;
    harness.controller.addNote();
    expect(
      harness.effects.some((effect) => effect.includes(`Maximum ${MAX_MOTIF_NOTES}`)),
    ).toBeTruthy();
  });

  it("covers selection/import failure branches that leave catalog state intact", () => {
    const harness = createAuthoring();
    const vanishing = addUserCopy(harness.store, "chromatic-turn", "vanishing-target");
    expect(vanishing).toBeTruthy();
    harness.controller.beginEdit();
    expect(harness.editor.isDirty()).toBe(false);
    const cancel = harness.editor.cancel.bind(harness.editor);
    harness.editor.cancel = (store) => {
      const restored = cancel(store);
      store.remove("vanishing-target");
      return restored;
    };
    harness.effects.length = 0;
    harness.controller.selectMotif("vanishing-target");
    harness.editor.cancel = cancel;
    expect(
      harness.effects.some((effect) =>
        effect.includes("Unknown motif after cancelling edit: vanishing-target"),
      ),
    ).toBeTruthy();
    expect(harness.effects.includes("motif-list")).toBeTruthy();

    harness.library.path = "/library";
    harness.library.loaded = true;
    harness.library.scanning = false;
    installClipLiveApi({});
    const add = harness.store.add.bind(harness.store);
    harness.store.add = () => ["forced add failure"];
    harness.effects.length = 0;
    harness.controller.importClip();
    harness.store.add = add;
    expect(harness.effects.some((effect) => effect.includes("forced add failure"))).toBeTruthy();

    harness.store.currentId = "ghost";
    harness.effects.length = 0;
    expect(harness.controller.applyMotifProperties({ name: "x" })).toBe(false);
    expect(harness.effects.some((effect) => effect.includes("No motif selected"))).toBeTruthy();

    const begin = harness.editor.begin.bind(harness.editor);
    harness.store.select("scale-turn");
    harness.editor.begin = () => undefined;
    harness.effects.length = 0;
    harness.controller.beginEdit();
    harness.editor.begin = begin;
    expect(
      harness.effects.some((effect) =>
        effect.includes("Could not start editing the selected motif"),
      ),
    ).toBeTruthy();
  });

  it("recovers from clip conversion and import transaction failures", () => {
    const invalidClip = createAuthoring();
    invalidClip.library.path = "/library";
    invalidClip.library.loaded = true;
    installClipLiveApi({
      notes: [{ pitch: 999, start_time: 0, duration: 1, velocity: 100 }],
    });
    invalidClip.controller.importClip();
    expect(
      invalidClip.effects.some((effect) => effect.includes("Source anchor pitch must be")),
    ).toBe(true);

    const cleanEdit = createAuthoring();
    cleanEdit.library.path = "/library";
    cleanEdit.library.loaded = true;
    installClipLiveApi({ name: "Replacement" });
    cleanEdit.controller.beginEdit();
    expect(cleanEdit.editor.isDirty()).toBe(false);
    cleanEdit.controller.importClip();
    expect(cleanEdit.store.current?.name).toBe("Replacement");
    expect(cleanEdit.editor.isDirty()).toBe(true);

    const throwing = createAuthoring();
    throwing.library.path = "/library";
    throwing.library.loaded = true;
    installClipLiveApi({});
    const begin = throwing.editor.begin.bind(throwing.editor);
    throwing.editor.begin = () => {
      throw new Error("transaction exploded");
    };
    const idsBefore = throwing.store.list().map(({ id }) => id);
    throwing.controller.importClip();
    throwing.editor.begin = begin;
    expect(throwing.store.list().map(({ id }) => id)).toEqual(idsBefore);
    expect(throwing.effects.some((effect) => effect.includes("transaction exploded"))).toBe(true);

    const catchFallback = createAuthoring();
    catchFallback.library.path = "/library";
    catchFallback.library.loaded = true;
    installClipLiveApi({});
    const removedRestore = addUserCopy(catchFallback.store, "chromatic-turn", "removed-restore");
    expect(removedRestore).toBeTruthy();
    catchFallback.store.select(removedRestore!.id);
    const catchBegin = catchFallback.editor.begin.bind(catchFallback.editor);
    catchFallback.editor.begin = (store) => {
      store.remove(removedRestore!.id);
      throw new Error("rollback required");
    };
    catchFallback.controller.importClip();
    catchFallback.editor.begin = catchBegin;
    expect(catchFallback.store.currentId).toBe("scale-turn");

    const missingRestore = createAuthoring();
    missingRestore.library.path = "/library";
    missingRestore.library.loaded = true;
    installClipLiveApi({});
    const disposable = addUserCopy(missingRestore.store, "chromatic-turn", "disposable");
    expect(disposable).toBeTruthy();
    missingRestore.store.select(disposable!.id);
    const originalBegin = missingRestore.editor.begin.bind(missingRestore.editor);
    missingRestore.editor.begin = (store) => {
      store.remove(disposable!.id);
      return undefined;
    };
    missingRestore.controller.importClip();
    missingRestore.editor.begin = originalBegin;
    expect(missingRestore.store.currentId).toBe("scale-turn");
  });

  it("covers no-change, missing-selection, and browser selection guards", () => {
    const harness = createAuthoring();
    harness.controller.beginEdit();
    const currentName = harness.store.current?.name;
    expect(harness.controller.applyMotifProperties({ name: currentName })).toBe(true);

    harness.effects.length = 0;
    harness.controller.saveMotif({ triggerMode: "not-a-mode" });
    expect(harness.effects.some((effect) => effect.includes("triggerMode must be"))).toBe(true);

    harness.controller.cancelEdit();
    harness.effects.length = 0;
    harness.controller.addNote();
    harness.controller.removeNote(0);
    harness.controller.selectBrowser("missing");
    harness.controller.selectBrowser(harness.store.currentId);
    expect(
      harness.effects.filter((effect) => effect.includes("Start editing before changing")),
    ).toHaveLength(2);

    harness.library.path = "/library";
    harness.library.loaded = true;
    harness.store.currentId = "ghost";
    harness.effects.length = 0;
    harness.controller.saveMotif();
    expect(harness.effects).toContain("error:No motif selected");
  });

  it("handles a browser target disappearing during edit cancellation", () => {
    const disappearing = createAuthoring();
    const target = addUserCopy(disappearing.store, "chromatic-turn", "browser-target");
    expect(target).toBeTruthy();
    disappearing.controller.beginEdit();
    const cancel = disappearing.editor.cancel.bind(disappearing.editor);
    disappearing.editor.cancel = (store) => {
      const restored = cancel(store);
      store.remove(target!.id);
      return restored;
    };
    disappearing.controller.selectBrowser(target!.id, true);
    disappearing.editor.cancel = cancel;
    expect(disappearing.store.currentId).not.toBe(target!.id);
  });
});
