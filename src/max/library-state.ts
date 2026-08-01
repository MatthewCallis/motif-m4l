import { buildMotifPreview } from "../core/preview.js";
import type { HostContext } from "../core/types.js";
import type { MotifEditorState } from "../library/editor-state.js";
import type { MotifStore } from "../library/store.js";
import { formatLibraryMotifStats } from "./device-logic.js";
import type { DeviceSettingsState } from "./device-settings.js";
import type { MotifHotkeyMap } from "./hotkey-map.js";
import type {
  LibraryAlert,
  LibrarySelectedMotifData,
  LibraryServerState,
} from "./library-protocol.js";
import { toLibraryHotkeyData, toLibraryNoteData } from "./library-view.js";

/** Repository fields needed by the pure Library projection. */
export interface LibraryProjectionRepository {
  /** Configured library root. */
  path: string;
  /** Whether the root completed a successful scan. */
  loaded: boolean;
  /** Whether an incremental scan is active. */
  scanning: boolean;
  /** Loaded user-motif file identities. */
  files: ReadonlyMap<string, string>;
  /** Current bounded scan progress. */
  scanState:
    | {
        processedEntries: number;
        loadedMotifs: number;
      }
    | undefined;
  /** Resolve one motif's browser folder label. */
  browserFolder: (id: string) => string;
}

/** Inputs required to project the authoritative Library page state. */
export interface LibraryStateProjectionInput {
  /** Motif catalog and current selection. */
  store: MotifStore;
  /** Active edit transaction. */
  editor: MotifEditorState;
  /** User-library repository metadata and scan state. */
  library: LibraryProjectionRepository;
  /** MIDI hot-key assignments. */
  hotkeys: MotifHotkeyMap;
  /** Live-restored performance settings. */
  settings: DeviceSettingsState;
  /** Latest observed Live Song context. */
  hostContext: HostContext;
  /** Pitch used to render the selected motif preview and statistics. */
  previewTriggerPitch: number;
  /** Maximum number of editable notes supported by the device. */
  noteLimit: number;
  /** Current browser query. */
  browserQuery: string;
  /** Latest warning displayed by the Library page. */
  alert?: LibraryAlert;
}

/**
 * Build the complete authoritative state consumed by the Library page.
 *
 * This projection is side-effect free: it does not mutate selection, advance
 * transport counters, encode payloads, or emit through Max.
 * @param {LibraryStateProjectionInput} input Current device model snapshots.
 * @returns {LibraryServerState} Display-ready Library state.
 */
export function buildLibraryServerState(input: LibraryStateProjectionInput): LibraryServerState {
  const {
    store,
    editor,
    library,
    hotkeys,
    settings,
    hostContext,
    previewTriggerPitch,
    noteLimit,
    browserQuery,
    alert,
  } = input;
  const normalizedQuery = browserQuery.trim().toLowerCase();
  const matchedIds = new Set(store.filter(browserQuery).map((item) => item.id));
  const items = store
    .list()
    .filter(
      (item) =>
        !normalizedQuery ||
        matchedIds.has(item.id) ||
        library.browserFolder(item.id).toLowerCase().includes(normalizedQuery),
    )
    .sort(
      (left, right) =>
        library.browserFolder(left.id).localeCompare(library.browserFolder(right.id)) ||
        left.name.localeCompare(right.name) ||
        left.id.localeCompare(right.id),
    );
  const selected = store.current;
  const selectedIndex = selected ? items.findIndex((item) => item.id === selected.id) : -1;
  const selectedIsEditing = selected ? editor.isEditing(selected.id) : false;
  const nameCounts = new Map<string, number>();
  for (const item of items) {
    nameCounts.set(item.name, (nameCounts.get(item.name) ?? 0) + 1);
  }

  let selectedData: LibrarySelectedMotifData | null = null;
  if (selected) {
    const preview = buildMotifPreview(
      settings.transform(selected),
      {
        ...hostContext,
        tempo: hostContext.tempo * settings.tempoMultiplier,
      },
      previewTriggerPitch,
      settings.pitchModeOverride,
      settings.meterMode,
    );
    selectedData = {
      schemaVersion: selected.schemaVersion,
      id: selected.id,
      name: selected.name,
      description: selected.description ?? "",
      pitchMode: selected.pitchMode,
      sourceMeter: { ...selected.sourceMeter },
      length: selected.length,
      defaultGate: selected.defaultGate ?? null,
      velocityCurve: {
        inputMin: selected.velocityCurve?.inputMin ?? null,
        inputMax: selected.velocityCurve?.inputMax ?? null,
        outputMin: selected.velocityCurve?.outputMin ?? null,
        outputMax: selected.velocityCurve?.outputMax ?? null,
        exponent: selected.velocityCurve?.exponent ?? null,
      },
      stats: formatLibraryMotifStats(preview, selected.sourceMeter),
      isBuiltin: store.isBuiltin(selected.id),
      isPersisted: library.files.has(selected.id),
      folder: library.browserFolder(selected.id),
      hotkeys: hotkeys.forMotif(selected.id).map(toLibraryHotkeyData),
      noteCount: selected.notes.length,
      noteLimit,
      canAddNote: selectedIsEditing && selected.notes.length < noteLimit,
      canRemoveNote: selectedIsEditing && selected.notes.length > 1,
      notes: selected.notes.map(toLibraryNoteData),
    };
  }

  return {
    query: browserQuery,
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      showId: (nameCounts.get(item.name) ?? 0) > 1,
      folder: library.browserFolder(item.id),
      hotkeys: hotkeys.forMotif(item.id).map(toLibraryHotkeyData),
    })),
    selectedIndex,
    selected: selectedData,
    editing: editor.snapshot(),
    libraryPath: library.path,
    libraryLoaded: library.loaded,
    libraryScanning: library.scanning,
    actions: {
      editing: selectedIsEditing,
      canEdit: Boolean(selected) && !library.scanning,
      canSave: selectedIsEditing && library.loaded,
      canImportClip: !library.scanning,
      canRefreshLibrary: Boolean(library.path) && !library.scanning,
    },
    alert: alert ?? null,
    scanProgress: library.scanState
      ? {
          processedEntries: library.scanState.processedEntries,
          loadedMotifs: library.scanState.loadedMotifs,
        }
      : null,
  };
}
