import type {
  LibrarySelectedMotifData,
  LibraryServerState,
} from "../../../../../src/max/library/protocol.js";

export function createSelected(
  overrides: Partial<LibrarySelectedMotifData> = {},
): LibrarySelectedMotifData {
  return {
    schemaVersion: 1,
    id: "test-motif",
    name: "Test Motif",
    description: "A motif used by component tests",
    pitchMode: "chromatic",
    sourcePitchContext: {
      anchorPitch: 60,
      scaleRootNote: 0,
      scaleName: "Major",
      scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
    },
    sourceMeter: { numerator: 4, denominator: 4 },
    length: 960,
    triggerMode: "one-shot",
    repeatRounding: "exact",
    defaultGate: null,
    velocityCurve: {
      inputMin: null,
      inputMax: null,
      outputMin: null,
      outputMax: null,
      exponent: null,
    },
    previewBars: 1,
    effectivePitchMode: "chromatic",
    isBuiltin: false,
    isPersisted: true,
    folder: "Tests",
    hotkeys: [{ pitch: 60, label: "C3", action: "trigger" }],
    tags: ["demo"],
    noteCount: 1,
    noteLimit: 512,
    canAddNote: true,
    canRemoveNote: true,
    notes: [
      {
        pitch: 0,
        accidental: null,
        at: 0,
        duration: 480,
        gate: null,
        velocity: 100,
        velocityOffset: null,
        velocityScale: null,
        legato: false,
        tie: false,
      },
    ],
    preview: {
      notes: [{ pitch: 60, atTicks: 0, durationTicks: 480, velocity: 100 }],
      totalTicks: 960,
      lowPitch: 59,
      highPitch: 61,
      noteNames: "C3",
    },
    ...overrides,
  };
}

export function createServer(overrides: Partial<LibraryServerState> = {}): LibraryServerState {
  const selected = createSelected();
  return {
    query: "",
    tags: [],
    tagMode: "or",
    availableTags: ["demo", "scale"],
    libraryPath: "/Motifs",
    libraryLoaded: true,
    libraryScanning: false,
    editing: {
      active: true,
      dirty: false,
      created: false,
      sourceId: selected.id,
      targetId: selected.id,
    },
    actions: {
      editing: true,
      canEdit: true,
      canSave: true,
      canImportClip: false,
      canRefreshLibrary: true,
    },
    items: [
      {
        id: "builtin",
        name: "Builtin Turn",
        showId: false,
        isBuiltin: true,
        folder: "Library",
        hotkeys: [],
      },
      {
        id: selected.id,
        name: "Tests - Test Motif",
        showId: true,
        isBuiltin: false,
        folder: "Tests",
        hotkeys: selected.hotkeys,
      },
    ],
    selectedIndex: 1,
    selected,
    alert: null,
    scanProgress: null,
    ...overrides,
  };
}
