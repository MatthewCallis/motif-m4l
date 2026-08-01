import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { HostContext } from "../src/core/types.js";
import { MotifEditorState } from "../src/library/editor-state.js";
import { MotifStore } from "../src/library/store.js";
import { DeviceSettingsState } from "../src/max/device-settings.js";
import { MotifHotkeyMap } from "../src/max/hotkey-map.js";
import {
  buildLibraryServerState,
  formatLibraryMotifStats,
  type LibraryProjectionRepository,
} from "../src/max/library-state.js";

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
    browserFolder(id: string) {
      return store.isBuiltin(id) ? "Built-ins" : "Library";
    },
  };
  return { store, editor, hotkeys, settings, library };
}

describe("formatLibraryMotifStats", () => {
  it("formats Library stats for singular, integer, and fractional bars", () => {
    assert.equal(
      formatLibraryMotifStats(
        {
          notes: [{ pitch: 60, atTicks: 0, durationTicks: 480, velocity: 100 }],
          bars: 1,
          effectivePitchMode: "chromatic",
        },
        { numerator: 4, denominator: 4 },
      ),
      "1 note • 1 bar • 4/4 source • chromatic",
    );
    assert.equal(
      formatLibraryMotifStats(
        {
          notes: [
            { pitch: 60, atTicks: 0, durationTicks: 480, velocity: 80 },
            { pitch: 62, atTicks: 480, durationTicks: 480, velocity: 120 },
          ],
          bars: 1.5,
          effectivePitchMode: "scale",
        },
        { numerator: 6, denominator: 8 },
      ),
      "2 notes • 1.5 bars • 6/8 source • scale",
    );
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
    assert.deepEqual(state.selected?.hotkeys, [{ pitch: 36, action: "trigger", label: "C1" }]);
    assert.equal(state.actions.canEdit, true);
    assert.equal(state.actions.canSave, false);
    assert.match(state.selected?.stats ?? "", /notes/);
    assert.deepEqual(
      model.store.current?.notes.map(({ pitch }) => pitch),
      storedPitches,
      "projection must not mutate catalog notes",
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

    const state = buildLibraryServerState({
      ...model,
      hostContext,
      previewTriggerPitch: 60,
      noteLimit: 512,
      browserQuery: "library",
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
  });
});
