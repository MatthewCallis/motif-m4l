import type { MotifPreviewPaintData } from "../../src/core/preview.js";
import type {
  LibraryAction,
  LibraryNoteData,
  LibrarySelectedMotifData,
  LibraryServerState,
} from "../../src/max/library/protocol.js";

export type FixtureName =
  | "normal"
  | "editing"
  | "large"
  | "long"
  | "scanning"
  | "empty"
  | "warning";

const NOTE_LIMIT = 512;

function note(index: number): LibraryNoteData {
  const pitches = [0, 2, 3, 7, 5, 2, 0];
  return {
    pitch: pitches[index % pitches.length] ?? 0,
    accidental: null,
    at: index * 480,
    duration: index % 3 === 0 ? 720 : 480,
    gate: index % 4 === 0 ? 0.82 : null,
    velocity: Math.max(1, 106 - (index % 7) * 3),
    velocityOffset: null,
    velocityScale: null,
    legato: index % 5 === 2,
    tie: false,
  };
}

/**
 * Build a chromatic paint preview for workbench fixtures (anchor C3).
 * @param {LibraryNoteData[]} notes The notes to build the preview from.
 * @returns {MotifPreviewPaintData} The preview.
 */
function previewFromNotes(notes: LibraryNoteData[]): MotifPreviewPaintData {
  const paintNotes = notes.map((value) => ({
    pitch: 60 + value.pitch + (value.accidental ?? 0),
    atTicks: value.at,
    durationTicks: Math.max(1, value.duration),
    velocity: value.velocity ?? 100,
  }));
  const pitches = paintNotes.map((entry) => entry.pitch);
  let lowPitch = pitches.length > 0 ? Math.min(...pitches) : 59;
  let highPitch = pitches.length > 0 ? Math.max(...pitches) : 61;
  if (lowPitch === highPitch) {
    lowPitch -= 1;
    highPitch += 1;
  }
  const names = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
  return {
    notes: paintNotes,
    totalTicks: Math.max(
      1,
      paintNotes.reduce((max, entry) => Math.max(max, entry.atTicks + entry.durationTicks), 1),
    ),
    lowPitch,
    highPitch,
    noteNames:
      paintNotes
        .map((entry) => {
          const pitch = Math.max(0, Math.min(127, entry.pitch));
          return `${names[pitch % 12] ?? "C"}${Math.floor(pitch / 12) - 2}`;
        })
        .join(" ·  ") || "—",
  };
}

function selectedMotif(notes: LibraryNoteData[]): LibrarySelectedMotifData {
  return {
    schemaVersion: 1,
    id: "chromatic-turn",
    name: "Chromatic Turn",
    description: "Fixed-interval phrase that ignores the selected scale.",
    pitchMode: "chromatic",
    sourcePitchContext: {
      anchorPitch: 60,
      scaleRootNote: 0,
      scaleName: "Major",
      scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
    },
    sourceMeter: { numerator: 4, denominator: 4 },
    length: Math.max(
      960,
      notes.reduce((end, value) => Math.max(end, value.at + value.duration), 0),
    ),
    defaultGate: 0.82,
    velocityCurve: {
      inputMin: null,
      inputMax: null,
      outputMin: null,
      outputMax: null,
      exponent: null,
    },
    previewBars: 0.88,
    effectivePitchMode: "chromatic",
    isBuiltin: true,
    isPersisted: false,
    folder: "Library",
    hotkeys: [{ pitch: 60, label: "C3", action: "trigger" }],
    tags: [],
    noteCount: notes.length,
    noteLimit: NOTE_LIMIT,
    canAddNote: notes.length < NOTE_LIMIT,
    canRemoveNote: notes.length > 1,
    notes,
    preview: previewFromNotes(notes),
  };
}

function normalState(): LibraryServerState {
  const selected = selectedMotif(Array.from({ length: 7 }, (_, index) => note(index)));
  return {
    query: "",
    tags: [],
    tagMode: "or",
    availableTags: ["game", "melodic", "bass", "fill"],
    items: [
      {
        id: "chromatic-turn",
        name: "Chromatic Turn",
        showId: false,
        isBuiltin: true,
        folder: "Library",
        hotkeys: selected.hotkeys,
      },
      {
        id: "scale-turn",
        name: "Scale Turn",
        showId: false,
        isBuiltin: true,
        folder: "Library",
        hotkeys: [],
      },
      {
        id: "chrono-trigger-wind-scene",
        name: "Chrono Trigger - Wind Scene",
        showId: false,
        isBuiltin: false,
        folder: "Chrono Trigger",
        hotkeys: [],
      },
      {
        id: "chrono-trigger-secret-of-the-forest",
        name: "Chrono Trigger - Secret of the Forest",
        showId: false,
        isBuiltin: false,
        folder: "Chrono Trigger",
        hotkeys: [],
      },
      {
        id: "chrono-trigger-corridors-of-time",
        name: "Chrono Trigger - Corridors of Time",
        showId: false,
        isBuiltin: false,
        folder: "Chrono Trigger",
        hotkeys: [],
      },
      {
        id: "chrono-trigger-frogs-theme",
        name: "Chrono Trigger - Frog's Theme",
        showId: false,
        isBuiltin: false,
        folder: "Chrono Trigger",
        hotkeys: [],
      },
      {
        id: "bass-pickup",
        name: "Bass Pickup",
        showId: false,
        isBuiltin: false,
        folder: "User Library/Bass",
        hotkeys: [{ pitch: 48, label: "C2", action: "select" }],
      },
      {
        id: "bright-fill",
        name: "Bright Fill",
        showId: false,
        isBuiltin: false,
        folder: "User Library/Fills",
        hotkeys: [],
      },
    ],
    selectedIndex: 0,
    selected,
    editing: {
      active: false,
      dirty: false,
      created: false,
      sourceId: null,
      targetId: null,
    },
    libraryPath: "/Users/example/Motifs",
    libraryLoaded: true,
    libraryScanning: false,
    actions: {
      editing: false,
      canEdit: true,
      canSave: false,
      canImportClip: true,
      canRefreshLibrary: true,
    },
    alert: null,
    scanProgress: null,
  };
}

export function createFixture(name: FixtureName): LibraryServerState {
  const state = normalState();
  if (name === "editing") {
    return beginEditing(state);
  }
  if (name === "large") {
    const notes = Array.from({ length: 128 }, (_, index) => note(index));
    return beginEditing({ ...state, selected: selectedMotif(notes) });
  }
  if (name === "long") {
    return {
      ...state,
      libraryPath:
        "/Users/example/Music/Production/Ableton/User Library/Presets/MIDI Effects/Max MIDI Effect/Motif Libraries/Extremely Long Folder Name",
      items: state.items.map((item, index) => ({
        ...item,
        name:
          index === 0
            ? "A Chromatic Turn With A Deliberately Long Descriptive Browser Name"
            : item.name,
        folder: `User Library/Deeply Nested Collection/Session ${index + 1}`,
        showId: index === 0,
      })),
      selected: state.selected
        ? {
            ...state.selected,
            name: "A Chromatic Turn With A Deliberately Long Descriptive Browser Name",
            description:
              "A deliberately long description for checking truncation, wrapping, field height, narrow layouts, and the behavior of metadata that is substantially longer than typical production content.",
          }
        : null,
    };
  }
  if (name === "scanning") {
    return {
      ...state,
      libraryScanning: true,
      actions: { ...state.actions, canRefreshLibrary: false },
      scanProgress: { processedEntries: 2_438, loadedMotifs: 387 },
    };
  }
  if (name === "empty") {
    return {
      ...state,
      items: [],
      selectedIndex: -1,
      selected: null,
      libraryPath: "",
      libraryLoaded: false,
      actions: {
        editing: false,
        canEdit: false,
        canSave: false,
        canImportClip: true,
        canRefreshLibrary: false,
      },
    };
  }
  if (name === "warning") {
    return {
      ...state,
      alert: {
        id: 1,
        title: "Motif could not be imported",
        message:
          "The selected clip contains more than 512 notes. Shorten the clip or split the phrase, then try the import again.",
      },
    };
  }
  return state;
}

function beginEditing(state: LibraryServerState): LibraryServerState {
  return {
    ...state,
    editing: {
      active: true,
      dirty: false,
      created: false,
      sourceId: state.selected?.id ?? null,
      targetId: state.selected?.id ?? null,
    },
    actions: {
      ...state.actions,
      editing: true,
      canEdit: false,
      canSave: state.selected !== null,
    },
  };
}

function dirty(state: LibraryServerState): LibraryServerState {
  return {
    ...state,
    editing: { ...state.editing, dirty: true },
  };
}

/** Apply the common authoring actions locally so the browser fixture remains interactive. */
export function applyFixtureAction(
  state: LibraryServerState,
  action: LibraryAction,
): LibraryServerState {
  if (action.type === "filter_motifs") {
    return { ...state, query: typeof action.query === "string" ? action.query : "" };
  }
  if (action.type === "begin_edit") {
    return beginEditing(state);
  }
  if (action.type === "cancel_edit") {
    return createFixture("normal");
  }
  if (action.type === "refresh_library") {
    return {
      ...state,
      libraryScanning: true,
      scanProgress: { processedEntries: 0, loadedMotifs: 0 },
    };
  }
  if (action.type === "import_clip") {
    return {
      ...state,
      alert: {
        id: Date.now(),
        title: "Workbench import",
        message: "Clip import requires Live. This confirms the Library action reached the bridge.",
      },
    };
  }
  if (action.type === "save_motif") {
    return {
      ...state,
      editing: { ...state.editing, active: false, dirty: false },
      actions: { ...state.actions, editing: false, canEdit: true, canSave: false },
      selected: state.selected ? { ...state.selected, isPersisted: true } : null,
    };
  }
  if (action.type === "select_browser") {
    const selectedIndex = state.items.findIndex((item) => item.id === action.id);
    return selectedIndex < 0 ? state : { ...state, selectedIndex };
  }
  if (!state.selected) {
    return state;
  }
  if (action.type === "add_note") {
    const notes = [...state.selected.notes, note(state.selected.notes.length)];
    return dirty({
      ...state,
      selected: {
        ...state.selected,
        notes,
        noteCount: notes.length,
        canAddNote: notes.length < state.selected.noteLimit,
        canRemoveNote: notes.length > 1,
        preview: previewFromNotes(notes),
      },
    });
  }
  if (action.type === "remove_note") {
    const notes = state.selected.notes.filter((_, index) => index !== action.index);
    return dirty({
      ...state,
      selected: {
        ...state.selected,
        notes,
        noteCount: notes.length,
        canAddNote: notes.length < state.selected.noteLimit,
        canRemoveNote: notes.length > 1,
        preview: previewFromNotes(notes),
      },
    });
  }
  if (action.type === "edit_note_at") {
    const notes = state.selected.notes.map((value, index) =>
      index === action.index ? { ...value, [action.field]: action.value } : value,
    );
    return dirty({
      ...state,
      selected: { ...state.selected, notes, preview: previewFromNotes(notes) },
    });
  }
  if (action.type === "edit_motif" && action.properties && typeof action.properties === "object") {
    const properties = action.properties as Partial<LibrarySelectedMotifData>;
    return dirty({ ...state, selected: { ...state.selected, ...properties } });
  }
  return state;
}
