import { describe, it, expect } from "vitest";
import type { HostContext } from "../../../../src/core/types.js";
import { MotifEditorState } from "../../../../src/library/editor-state.js";
import { MotifStore } from "../../../../src/library/store.js";
import { DeviceSettingsState } from "../../../../src/max/device-settings.js";
import { MotifHotkeyMap } from "../../../../src/max/hotkey-map.js";
import {
  buildLibraryServerState,
  type LibraryProjectionRepository,
} from "../../../../src/max/library/device/projection.js";
import { formatPreviewBarCount } from "../../../../src/max/library/ui/components/PropertyForm.tsx";

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
    expect(formatPreviewBarCount(1)).toBe("1");
    expect(formatPreviewBarCount(1.5)).toBe("1.5");
    expect(formatPreviewBarCount(2.0)).toBe("2");
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

    expect(state.selected?.id).toBe("scale-turn");
    expect(state.selected?.noteLimit).toBe(512);
    expect(Array.isArray(state.selected?.sourcePitchContext.scaleIntervals)).toBeTruthy();

    const unresolved = {
      ...model.store.current!,
      id: "unresolved-source",
      sourcePitchContext: {
        ...model.store.current!.sourcePitchContext,
        scaleIntervals: null,
      },
    };
    expect(model.store.add(unresolved)).toEqual([]);
    model.store.select(unresolved.id);
    const unresolvedState = buildLibraryServerState({
      ...model,
      hostContext,
      previewTriggerPitch: 60,
      noteLimit: 512,
      browserQuery: "",
    });
    expect(unresolvedState.selected?.sourcePitchContext.scaleIntervals).toBe(null);
    model.store.select("scale-turn");
    expect(state.selected?.hotkeys).toEqual([{ pitch: 36, action: "trigger", label: "C1" }]);
    expect(state.actions.canEdit).toBe(true);
    expect(state.actions.canSave).toBe(false);
    expect(state.actions.canImportClip).toBe(true);
    expect(state.selected?.noteCount).toBe(model.store.current?.notes.length);
    expect(typeof state.selected?.previewBars === "number").toBeTruthy();
    expect(state.selected?.effectivePitchMode).toBe("scale");
    const preview = state.selected?.preview;
    expect(preview).toBeTruthy();
    expect(Array.isArray(preview!.notes)).toBeTruthy();
    expect(preview!.notes.length > 0).toBeTruthy();
    expect(preview!.totalTicks >= 1).toBeTruthy();
    expect(typeof preview!.noteNames === "string").toBeTruthy();
    expect(preview!.highPitch >= preview!.lowPitch).toBeTruthy();
    for (const note of preview!.notes) {
      expect(Number.isFinite(note.pitch)).toBeTruthy();
      expect(Number.isFinite(note.atTicks)).toBeTruthy();
      expect(note.durationTicks >= 1).toBeTruthy();
      expect(note.velocity >= 1 && note.velocity <= 127).toBeTruthy();
    }
    expect(state.selected?.tags).toEqual([]);
    expect(state.availableTags).toEqual([]);
    expect(state.tagMode).toBe("or");
    expect(state.tags).toEqual([]);
    expect(model.store.current?.notes.map(({ pitch }) => pitch)).toEqual(storedPitches);
  });

  it("filters motifs by selected tags with AND and OR modes", () => {
    const model = setup();
    const chromatic = model.store.get("chromatic-turn");
    const scale = model.store.get("scale-turn");
    expect(chromatic && scale).toBeTruthy();
    expect(
      model.store.add({
        ...chromatic,
        id: "chromatic-tagged",
        name: "Chromatic Tagged",
        tags: ["chromatic", "demo"],
      }),
    ).toEqual([]);
    expect(
      model.store.add({
        ...scale,
        id: "scale-tagged",
        name: "Scale Tagged",
        tags: ["demo", "scale"],
      }),
    ).toEqual([]);

    const orState = buildLibraryServerState({
      ...model,
      hostContext,
      previewTriggerPitch: 60,
      noteLimit: 512,
      browserQuery: "",
      browserTags: ["chromatic"],
      browserTagMode: "or",
    });
    expect(orState.items.map((item) => item.id)).toEqual(["chromatic-tagged"]);
    expect(orState.tags).toEqual(["chromatic"]);
    expect(orState.tagMode).toBe("or");
    expect(orState.availableTags).toEqual(["demo", "chromatic", "scale"]);

    const andState = buildLibraryServerState({
      ...model,
      hostContext,
      previewTriggerPitch: 60,
      noteLimit: 512,
      browserQuery: "",
      browserTags: ["demo", "scale"],
      browserTagMode: "and",
    });
    expect(andState.items.map((item) => item.id)).toEqual(["scale-tagged"]);

    const combined = buildLibraryServerState({
      ...model,
      hostContext,
      previewTriggerPitch: 60,
      noteLimit: 512,
      browserQuery: "chromatic",
      browserTags: ["demo"],
      browserTagMode: "or",
    });
    expect(combined.items.map((item) => item.id)).toEqual(["chromatic-tagged"]);
  });

  it("filters by folder and exposes edit and scan progress state", () => {
    const model = setup();
    const draft = model.editor.begin(model.store, "scale-turn", {
      targetId: "scale-turn-copy",
    });
    expect(draft).toBeTruthy();
    model.store.select(draft!.id);
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

    expect(state.items.length).toBe(1);
    expect(state.selected?.id).toBe(draft!.id);
    expect(state.editing.dirty).toBe(true);
    expect(state.actions.canEdit).toBe(false);
    expect(state.actions.canImportClip).toBe(false);
    expect(state.scanProgress).toEqual({
      processedEntries: 12,
      loadedMotifs: 3,
    });
    expect(state.alert?.title).toBe("Warning");

    model.library.scanning = false;
    const editingOnly = buildLibraryServerState({
      ...model,
      hostContext,
      previewTriggerPitch: 60,
      noteLimit: 512,
      browserQuery: "",
    });
    expect(editingOnly.actions.editing).toBe(true);
    expect(editingOnly.actions.canImportClip).toBe(false);
  });

  it("pins built-ins above naturally sorted user folders", () => {
    const model = setup();
    const source = model.store.current;
    expect(source).toBeTruthy();
    expect(model.store.add({ ...source, id: "zebra-item", name: "First" })).toEqual([]);
    expect(model.store.add({ ...source, id: "alpha-item", name: "Second" })).toEqual([]);
    expect(model.store.add({ ...source, id: "library-item", name: "Third" })).toEqual([]);
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

    expect(libraryIndex > 0).toBeTruthy();
    expect(state.items.slice(0, libraryIndex).every(({ isBuiltin }) => isBuiltin)).toBeTruthy();
    expect(
      libraryIndex < alphaIndex,
      "the Library group must stay above nested folders",
    ).toBeTruthy();
    expect(alphaIndex < zebraIndex, "Folder 2 must naturally sort before Folder 10").toBeTruthy();
    expect(state.items[alphaIndex]?.isBuiltin).toBe(false);
  });
});
