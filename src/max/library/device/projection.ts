import { buildMotifPreview, toMotifPreviewPaintData } from "../../../core/preview.js";
import type { HostContext } from "../../../core/types.js";
import type { MotifEditorState } from "../../../library/editor-state.js";
import type { MotifStore } from "../../../library/store.js";
import {
  motifMatchesTagFilter,
  normalizeTagFilterMode,
  normalizeTags,
  type TagFilterMode,
} from "../../../library/tags.js";
import type { DeviceSettingsState } from "../../device-settings.js";
import type { MotifHotkeyMap } from "../../hotkey-map.js";
import type { LibraryAlert, LibrarySelectedMotifData, LibraryServerState } from "../protocol.js";
import { toLibraryHotkeyData, toLibraryNoteData } from "./serialization.js";

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
  /** Selected tag filter chips. */
  browserTags?: readonly string[];
  /** Whether selected tags combine with AND or OR. */
  browserTagMode?: TagFilterMode;
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
    browserTags = [],
    browserTagMode = "or",
    alert,
  } = input;
  const normalizedQuery = browserQuery.trim().toLowerCase();
  const matchedIds = new Set(store.filter(browserQuery).map((item) => item.id));
  const parsedBrowserTags = normalizeTags(browserTags);
  const selectedTags = parsedBrowserTags.ok ? parsedBrowserTags.value : [];
  const tagMode = normalizeTagFilterMode(browserTagMode);
  // Build lookup indexes once per projection to avoid O(N*M) repeated scans.
  const folderById = new Map<string, string>();
  for (const item of store.list()) {
    folderById.set(item.id, library.browserFolder(item.id));
  }
  const hotkeysById = hotkeys.byMotif();
  // Hoist the locale comparator so it isn't recreated per sort comparison.
  const localeCompare = (first: string, second: string) =>
    first.localeCompare(second, undefined, { numeric: true, sensitivity: "base" });
  const items = store
    .list()
    .filter((item) => {
      const textMatch =
        !normalizedQuery ||
        matchedIds.has(item.id) ||
        (folderById.get(item.id) ?? "Library").toLowerCase().includes(normalizedQuery);
      return textMatch && motifMatchesTagFilter(item.tags, selectedTags, tagMode);
    })
    .sort((left, right) => {
      const leftFolder = folderById.get(left.id) ?? "Library";
      const rightFolder = folderById.get(right.id) ?? "Library";
      const libraryFolderOrder =
        Number(rightFolder === "Library") - Number(leftFolder === "Library");
      if (libraryFolderOrder !== 0) {
        return libraryFolderOrder;
      }
      const folderOrder = localeCompare(leftFolder, rightFolder);
      if (folderOrder !== 0) {
        return folderOrder;
      }
      const builtinOrder = Number(store.isBuiltin(right.id)) - Number(store.isBuiltin(left.id));
      if (builtinOrder !== 0) {
        return builtinOrder;
      }
      return localeCompare(left.name, right.name) || localeCompare(left.id, right.id);
    });
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
      sourcePitchContext: {
        anchorPitch: selected.sourcePitchContext.anchorPitch,
        scaleRootNote: selected.sourcePitchContext.scaleRootNote,
        scaleName: selected.sourcePitchContext.scaleName,
        scaleIntervals: selected.sourcePitchContext.scaleIntervals
          ? [...selected.sourcePitchContext.scaleIntervals]
          : null,
      },
      sourceMeter: { ...selected.sourceMeter },
      length: selected.length,
      triggerMode: selected.triggerMode ?? "one-shot",
      repeatRounding: selected.repeatRounding ?? "exact",
      defaultGate: selected.defaultGate ?? null,
      velocityCurve: {
        inputMin: selected.velocityCurve?.inputMin ?? null,
        inputMax: selected.velocityCurve?.inputMax ?? null,
        outputMin: selected.velocityCurve?.outputMin ?? null,
        outputMax: selected.velocityCurve?.outputMax ?? null,
        exponent: selected.velocityCurve?.exponent ?? null,
      },
      previewBars: preview.bars,
      effectivePitchMode: preview.effectivePitchMode,
      isBuiltin: store.isBuiltin(selected.id),
      isPersisted: library.files.has(selected.id),
      folder: folderById.get(selected.id) ?? "Library",
      hotkeys: (hotkeysById.get(selected.id) ?? []).map(toLibraryHotkeyData),
      tags: selected.tags ? [...selected.tags] : [],
      noteCount: selected.notes.length,
      noteLimit,
      canAddNote: selectedIsEditing && selected.notes.length < noteLimit,
      canRemoveNote: selectedIsEditing && selected.notes.length > 1,
      notes: selected.notes.map(toLibraryNoteData),
      preview: toMotifPreviewPaintData(preview),
    };
  }

  return {
    query: browserQuery,
    tags: selectedTags,
    tagMode,
    availableTags: store.allTags(),
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      showId: (nameCounts.get(item.name) ?? 0) > 1,
      isBuiltin: store.isBuiltin(item.id),
      folder: folderById.get(item.id) ?? "Library",
      hotkeys: (hotkeysById.get(item.id) ?? []).map(toLibraryHotkeyData),
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
      canImportClip: !library.scanning && !selectedIsEditing,
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
