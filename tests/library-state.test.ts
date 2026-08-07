import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { HostContext } from "../src/core/types.js";
import { MotifEditorState } from "../src/library/editor-state.js";
import { MotifStore } from "../src/library/store.js";
import { DeviceSettingsState } from "../src/max/device-settings.js";
import { MotifHotkeyMap } from "../src/max/hotkey-map.js";
import {
  buildLibraryServerState,
  type LibraryProjectionRepository,
} from "../src/max/library/device/projection.js";
import { formatPreviewBarCount } from "../src/max/library/ui/format.js";

const hostContext: HostContext = {
  tempo: 120,
  rootNote: 0,
  scaleName: "Major",
  scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
  scaleMode: true,
  timeSignature: { numerator: 4, denominator: 4 },
  isPlaying: false,
  currentSongTime: 0,
};

function setup() {
  const store = new MotifStore("scale-turn");
  const editor = new MotifEditorState();
  const hotkeys = new MotifHotkeyMap(store);
  const settings = new DeviceSettingsState();
  const library: LibraryProjectionRepository = {
    path: "/Motifs",
    loaded: true,
    scanning: false,
    files: new Map<string, string>(),
    scanState: undefined,
    browserFolder() {
      return "Library";
    },
  };
  return { store, editor, hotkeys, settings, library };
}

describe("formatPreviewBarCount", () => {
  it("formats integer and fractional preview bars without redundant zeros", () => {
    assert.equal(formatPreviewBarCount(1), "1");
    assert.equal(formatPreviewBarCount(1.5), "1.5");
    assert.equal(formatPreviewBarCount(2.0), "2");
  });
});

describe("Library state projection", () => {
  it("projects selection, transforms, hot keys, and actions without mutation", () => {
    const model = setup();
    model.hotkeys.assign(36, "scale-turn", "trigger");
    model.settings.invert = true;
    const storedPitches = model.store.current?.notes.map(({ pitch }) => pitch);

    const state = buildLibraryServerState({
      ...model,
      hostContext,
      previewTriggerPitch: 60,
      noteLimit: 512,
      browserQuery: "",
    });

    assert.equal(state.selected?.id, "scale-turn");
    assert.equal(state.selected?.noteLimit, 512);
    assert.ok(Array.isArray(state.selected?.sourcePitchContext.scaleIntervals));

    const unresolved = {
      ...model.store.current!,
      id: "unresolved-source",
      sourcePitchContext: {
        ...model.store.current!.sourcePitchContext,
        scaleIntervals: null,
      },
    };
    assert.deepEqual(model.store.add(unresolved), []);
    model.store.select(unresolved.id);
    const unresolvedState = buildLibraryServerState({
      ...model,
      hostContext,
      previewTriggerPitch: 60,
      noteLimit: 512,
      browserQuery: "",
    });
    assert.equal(unresolvedState.selected?.sourcePitchContext.scaleIntervals, null);
    model.store.select("scale-turn");
    assert.deepEqual(state.selected?.hotkeys, [{ pitch: 36, action: "trigger", label: "C1" }]);
    assert.equal(state.actions.canEdit, true);
    assert.equal(state.actions.canSave, false);
    assert.equal(state.actions.canImportClip, true);
    assert.equal(state.selected?.noteCount, model.store.current?.notes.length);
    assert.ok(typeof state.selected?.previewBars === "number");
    assert.equal(state.selected?.effectivePitchMode, "scale");
    const preview = state.selected?.preview;
    assert.ok(preview);
    assert.ok(Array.isArray(preview.notes));
    assert.ok(preview.notes.length > 0);
    assert.ok(preview.totalTicks >= 1);
    assert.ok(typeof preview.noteNames === "string");
    assert.ok(preview.highPitch >= preview.lowPitch);
    for (const note of preview.notes) {
      assert.ok(Number.isFinite(note.pitch));
      assert.ok(Number.isFinite(note.atTicks));
      assert.ok(note.durationTicks >= 1);
      assert.ok(note.velocity >= 1 && note.velocity <= 127);
    }
    assert.deepEqual(state.selected?.tags, []);
    assert.deepEqual(state.availableTags, []);
    assert.equal(state.tagMode, "or");
    assert.deepEqual(state.tags, []);
    assert.deepEqual(
      model.store.current?.notes.map(({ pitch }) => pitch),
      storedPitches,
      "projection must not mutate catalog notes",
    );
  });

  it("filters motifs by selected tags with AND and OR modes", () => {
    const model = setup();
    const chromatic = model.store.get("chromatic-turn");
    const scale = model.store.get("scale-turn");
    assert.ok(chromatic && scale);
    assert.deepEqual(
      model.store.add({
        ...chromatic,
        id: "chromatic-tagged",
        name: "Chromatic Tagged",
        tags: ["chromatic", "demo"],
      }),
      [],
    );
    assert.deepEqual(
      model.store.add({
        ...scale,
        id: "scale-tagged",
        name: "Scale Tagged",
        tags: ["demo", "scale"],
      }),
      [],
    );

    const orState = buildLibraryServerState({
      ...model,
      hostContext,
      previewTriggerPitch: 60,
      noteLimit: 512,
      browserQuery: "",
      browserTags: ["chromatic"],
      browserTagMode: "or",
    });
    assert.deepEqual(
      orState.items.map((item) => item.id),
      ["chromatic-tagged"],
    );
    assert.deepEqual(orState.tags, ["chromatic"]);
    assert.equal(orState.tagMode, "or");
    assert.deepEqual(orState.availableTags, ["demo", "chromatic", "scale"]);

    const andState = buildLibraryServerState({
      ...model,
      hostContext,
      previewTriggerPitch: 60,
      noteLimit: 512,
      browserQuery: "",
      browserTags: ["demo", "scale"],
      browserTagMode: "and",
    });
    assert.deepEqual(
      andState.items.map((item) => item.id),
      ["scale-tagged"],
    );

    const combined = buildLibraryServerState({
      ...model,
      hostContext,
      previewTriggerPitch: 60,
      noteLimit: 512,
      browserQuery: "chromatic",
      browserTags: ["demo"],
      browserTagMode: "or",
    });
    assert.deepEqual(
      combined.items.map((item) => item.id),
      ["chromatic-tagged"],
    );
  });

  it("filters by folder and exposes edit and scan progress state", () => {
    const model = setup();
    const draft = model.editor.begin(model.store, "scale-turn", {
      targetId: "scale-turn-copy",
    });
    assert.ok(draft);
    model.store.select(draft.id);
    model.editor.markDirty();
    model.library.scanning = true;
    model.library.scanState = { processedEntries: 12, loadedMotifs: 3 };
    model.library.browserFolder = (id) => (model.store.isBuiltin(id) ? "Library" : "User Folder");

    const state = buildLibraryServerState({
      ...model,
      hostContext,
      previewTriggerPitch: 60,
      noteLimit: 512,
      browserQuery: "user folder",
      alert: { id: 1, title: "Warning", message: "Check this" },
    });

    assert.equal(state.items.length, 1);
    assert.equal(state.selected?.id, draft.id);
    assert.equal(state.editing.dirty, true);
    assert.equal(state.actions.canEdit, false);
    assert.equal(state.actions.canImportClip, false);
    assert.deepEqual(state.scanProgress, {
      processedEntries: 12,
      loadedMotifs: 3,
    });
    assert.equal(state.alert?.title, "Warning");

    model.library.scanning = false;
    const editingOnly = buildLibraryServerState({
      ...model,
      hostContext,
      previewTriggerPitch: 60,
      noteLimit: 512,
      browserQuery: "",
    });
    assert.equal(editingOnly.actions.editing, true);
    assert.equal(editingOnly.actions.canImportClip, false);
  });

  it("pins built-ins above naturally sorted user folders", () => {
    const model = setup();
    const source = model.store.current;
    assert.ok(source);
    assert.deepEqual(model.store.add({ ...source, id: "zebra-item", name: "First" }), []);
    assert.deepEqual(model.store.add({ ...source, id: "alpha-item", name: "Second" }), []);
    assert.deepEqual(model.store.add({ ...source, id: "library-item", name: "Third" }), []);
    model.library.browserFolder = (id) => {
      if (model.store.isBuiltin(id) || id === "library-item") {
        return "Library";
      }
      return id === "alpha-item" ? "Folder 2" : "Folder 10";
    };

    const state = buildLibraryServerState({
      ...model,
      hostContext,
      previewTriggerPitch: 60,
      noteLimit: 512,
      browserQuery: "",
    });
    const libraryIndex = state.items.findIndex(({ id }) => id === "library-item");
    const alphaIndex = state.items.findIndex(({ id }) => id === "alpha-item");
    const zebraIndex = state.items.findIndex(({ id }) => id === "zebra-item");

    assert.ok(libraryIndex > 0);
    assert.ok(state.items.slice(0, libraryIndex).every(({ isBuiltin }) => isBuiltin));
    assert.ok(libraryIndex < alphaIndex, "the Library group must stay above nested folders");
    assert.ok(alphaIndex < zebraIndex, "Folder 2 must naturally sort before Folder 10");
    assert.equal(state.items[alphaIndex]?.isBuiltin, false);
  });
});
