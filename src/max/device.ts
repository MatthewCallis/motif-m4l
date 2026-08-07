/**
 * Motif Max for Live engine - TypeScript source for the content-addressed
 * `v8 motif-device-<hash>.js` runtime.
 *
 * ## Message path
 * The hand-written bridge in `scripts/build.ts` exposes a single Max top-level
 * `anything()` that calls {@link dispatch}. Do **not** add per-message global
 * handlers; register new selectors on {@link MotifHandlers} / `handlers`.
 *
 * ## Outlet protocol (outlet 0)
 * All patch feedback is a Max list starting with a selector:
 * - `event <pitch> <velocity> <channel> <delayMs>` - schedule via Max `pipe`
 * - `clear` / `panic` - flush scheduled notes
 * - `status Ready` - opens the fail-open MIDI gate in the patch (`route Ready`)
 * - `status ...` / `error <message>` - console / debug
 * - `midi-pass <0|1>` - pass-through gate
 * - `ui <subselector> ...` - Presentation / Library window (preview, browser, notes)
 * - `persist <encodedJson>` - engine-owned state stored by a Blob `pattr` in Live
 * - `motifs-reset` / `motif-item` / `motif-selected` - motif menu
 * - `context ...` - dump_context reply
 *
 * Song tempo/key/scale/meter/transport arrive as `song_context` from native
 * `live.path` + `live.observer` (not LiveAPI). Clip import is the LiveAPI exception.
 *
 * @see https://docs.cycling74.com/apiref/js/jsthis/
 * @see https://docs.cycling74.com/apiref/js/liveapi/
 * @see https://docs.cycling74.com/userguide/m4l/live_api_overview/
 * @see https://docs.cycling74.com/reference/live.path
 * @see https://docs.cycling74.com/reference/live.observer
 * @see https://docs.cycling74.com/reference/pipe
 * @see https://github.com/Ableton/maxdevtools/tree/main/m4l-production-guidelines
 */

import { buildMotifPreview, toMotifPreviewPaintData } from "../core/preview.js";
import { type HostContext } from "../core/types.js";
import { MotifEditorState } from "../library/editor-state.js";
import { MotifStore } from "../library/store.js";
import { MotifAuthoringController } from "./library/device/authoring-controller.js";
import {
  DEFAULT_MOTIF_ID,
  LAUNCH_QUANTIZATIONS,
  MAX_MOTIF_NOTES,
  METER_MODES,
  PASS_THROUGH_POLICIES,
  PITCH_MODE_OVERRIDES,
  TRIGGER_MODES,
  type MotifHandlers,
} from "./device-types.js";
import {
  isStringEnumValue,
  libraryQueryFromAtoms,
  parseRetriggerMode,
  parseTempoMultiplier,
} from "./device-logic.js";
import {
  decodePersistedDeviceState,
  DEVICE_STATE_SCHEMA_VERSION,
  encodePersistedDeviceState,
  type PersistedDeviceState,
} from "./device-state.js";
import { DeviceSettingsState } from "./device-settings.js";
import { MotifHotkeyMap } from "./hotkey-map.js";
import { decodeLibraryAction } from "./library/device/action.js";
import { buildLibraryServerState } from "./library/device/projection.js";
import { encodeLibraryStateMessages } from "./library/device/serialization.js";
import type { LibraryAlert } from "./library/protocol.js";
import { normalizeTagFilterMode, normalizeTags, type TagFilterMode } from "../library/tags.js";
import {
  discardAllowed,
  emit,
  emitError,
  emitStatus,
  flattenValues,
  mirrorWebDebug,
  numbers,
  pathFromAtoms,
  prepareLibraryPage,
  stringAtom,
  toggleEnabled,
} from "./max-helpers.js";
import { MaxUserLibrary } from "./library/device/repository.js";
import { PlaybackController } from "./playback-controller.js";

/** Validated built-in and user motifs currently available to performance and authoring flows. */
const store = new MotifStore(DEFAULT_MOTIF_ID);
/** Transactional edit-session state, including snapshots used to cancel dirty edits safely. */
const editor = new MotifEditorState();
/** Max-backed user library repository and incremental scanner. */
const library = new MaxUserLibrary(store, {
  onError: emitError,
  onStateChange: () => emitLibraryState(),
  onStatus: emitStatus,
  onContentsChanged: () => {
    if (!applyPendingPersistedState()) {
      pruneTriggerMap();
      store.ensureCurrent(DEFAULT_MOTIF_ID);
    }
    listMotifs();
    emitPersistedState();
  },
});

/** MIDI pitch to Library-configured motif/action assignments. */
const hotkeys = new MotifHotkeyMap(store);

/** Performance controls restored from ordinary Live parameters. */
const settings = new DeviceSettingsState();

let initialized = false;
let previewTriggerPitch = 60;
let previewWasTriggered = false;
let browserQuery = "";
let browserTags: string[] = [];
let browserTagMode: TagFilterMode = "or";
let libraryAlert: LibraryAlert | undefined;
let libraryAlertCounter = 0;

/** Monotonic identity used to discard stale state chunks in the Library page. */
let libraryStateTransferCounter = 0;
/** Saved selection and hotkeys waiting for the asynchronous library scan. */
let pendingPersistedState: PersistedDeviceState | undefined;

/** Latest Live Song context mirrored by native observers in the Max patch. */
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

/** Transactional motif authoring and guarded-selection workflow owner. */
const authoring = new MotifAuthoringController(store, editor, library, hostContext, {
  emitError,
  emitLibraryAlert,
  emitStatus,
  emitLibraryState,
  emitSelectedMotifUi,
  listMotifs,
  emitPersistedState,
  pruneTriggerMap,
  emitMotifSelected: (id, name) => {
    emit("motif-selected", store.labels().get(id) ?? name);
  },
});

/** Live MIDI performance runtime and owner of all ephemeral trigger state. */
const playback = new PlaybackController(store, hotkeys, settings, hostContext, {
  emitScheduledEvent: (pitch, velocity, channel, delayMilliseconds) => {
    emit("event", pitch, velocity, channel, Math.max(0, delayMilliseconds));
  },
  emitClearScheduledNotes: () => {
    emit("clear");
    emit("panic");
  },
  emitError,
  emitStatus,
  onPreviewTrigger: (pitch) => {
    previewTriggerPitch = pitch;
    previewWasTriggered = true;
    emitPreviewState();
  },
  onSelectMotif: (id) => authoring.selectBrowser(id),
});

/**
 * Emit the library state through the device's single Max outlet.
 */
function emitLibraryState(): void {
  const state = buildLibraryServerState({
    store,
    editor,
    library,
    hotkeys,
    settings,
    hostContext,
    previewTriggerPitch,
    noteLimit: MAX_MOTIF_NOTES,
    browserQuery,
    browserTags,
    browserTagMode,
    ...(libraryAlert ? { alert: libraryAlert } : {}),
  });
  libraryStateTransferCounter += 1;
  for (const message of encodeLibraryStateMessages(state, libraryStateTransferCounter)) {
    emit("ui", "lib", message);
  }
}

/**
 * Present a user-facing Library warning and mirror it to the Max Console.
 * @param {string} title Short warning title.
 * @param {string} message Actionable warning details.
 */
function emitLibraryAlert(title: string, message: string): void {
  libraryAlertCounter += 1;
  libraryAlert = { id: libraryAlertCounter, title, message };
  emitError(message);
  emitLibraryState();
}

/**
 * Emit the preview state through the device's single Max outlet.
 */
function emitPreviewState(): void {
  const stored = store.current;
  const selected = stored ? settings.transform(stored) : undefined;
  if (!selected) {
    return;
  }
  const preview = buildMotifPreview(
    selected,
    {
      ...hostContext,
      tempo: hostContext.tempo * settings.tempoMultiplier,
    },
    previewTriggerPitch,
    settings.pitchModeOverride,
    settings.meterMode,
  );
  emit("ui", "preview", encodeURIComponent(JSON.stringify(toMotifPreviewPaintData(preview))));
}

/**
 * Emit the selected motif UI through the device's single Max outlet.
 */
function emitSelectedMotifUi(): void {
  emitLibraryState();
  emitPreviewState();
}

/**
 * Update the host context based on a Song property and its values.
 * @param {string} property The Song property name.
 * @param {unknown[]} values The atoms emitted for the property.
 */
function song_context(property: string, ...values: unknown[]): void {
  property = String(property);
  const numeric = numbers(values);

  switch (property) {
    case "tempo": {
      const value = numeric[0];
      if (value !== undefined && value > 0) {
        hostContext.tempo = value;
      }
      break;
    }
    case "root_note": {
      const value = numeric[0];
      if (value !== undefined) {
        hostContext.rootNote = Math.round(value);
        if (!previewWasTriggered) {
          previewTriggerPitch = 60 + hostContext.rootNote;
        }
        emitSelectedMotifUi();
      }
      break;
    }
    case "scale_mode": {
      hostContext.scaleMode = (numeric[0] ?? 0) !== 0;
      emitSelectedMotifUi();
      break;
    }
    case "scale_intervals": {
      if (numeric.length > 0) {
        hostContext.scaleIntervals = numeric.map(Math.round);
        emitSelectedMotifUi();
      }
      break;
    }
    case "scale_name": {
      const value = flattenValues(values).map(String).join(" ").trim();
      if (value) {
        hostContext.scaleName = value;
        emitSelectedMotifUi();
      }
      break;
    }
    case "signature_numerator": {
      const value = numeric[0];
      if (value !== undefined && value > 0) {
        hostContext.timeSignature.numerator = Math.round(value);
        emitSelectedMotifUi();
      }
      break;
    }
    case "signature_denominator": {
      const value = numeric[0];
      if (value !== undefined && value > 0) {
        hostContext.timeSignature.denominator = Math.round(value);
        emitSelectedMotifUi();
      }
      break;
    }
    case "is_playing": {
      const wasPlaying = hostContext.isPlaying;
      hostContext.isPlaying = (numeric[0] ?? 0) !== 0;
      if (wasPlaying && !hostContext.isPlaying) {
        playback.onTransportStopped();
      }
      break;
    }
    case "current_song_time": {
      const value = numeric[0];
      if (value !== undefined && value >= 0) {
        hostContext.currentSongTime = value;
      }
      break;
    }
    default:
      emitError(`Unknown Song property: ${property}`);
      return;
  }
}

/**
 * List all motifs and emit the corresponding UI state.
 */
function listMotifs(): void {
  store.ensureCurrent(DEFAULT_MOTIF_ID);
  const labels = store.labels();
  emit("motifs-reset");
  for (const item of store.list()) {
    emit("motif-item", labels.get(item.id) ?? item.name);
  }
  emit("motif-selected", labels.get(store.currentId) ?? store.current?.name ?? store.currentId);
  emitSelectedMotifUi();
}

/**
 * Serialize engine-owned durable state into the patch's Stored Only Blob parameter.
 */
function emitPersistedState(): void {
  const edit = editor.snapshot();
  const selectedMotifId =
    edit.active && edit.created && edit.sourceId ? edit.sourceId : store.currentId;
  emit(
    "persist",
    encodePersistedDeviceState({
      schemaVersion: DEVICE_STATE_SCHEMA_VERSION,
      selectedMotifId,
      hotkeys: hotkeys
        .list()
        .filter(
          (assignment) =>
            store.isBuiltin(assignment.motifId) || library.files.has(assignment.motifId),
        ),
    }),
  );
}

/**
 * Apply a saved snapshot once the selected user-library catalog is final.
 * @returns {boolean} Whether pending state was consumed.
 */
function applyPendingPersistedState(): boolean {
  if (!pendingPersistedState) {
    return false;
  }
  if (library.scanning || (library.path !== "" && !library.loaded)) {
    return false;
  }

  const state = pendingPersistedState;
  pendingPersistedState = undefined;
  for (const pitch of hotkeys.clear()) {
    playback.stopHeldRepeat(pitch, false);
  }
  for (const assignment of state.hotkeys) {
    if (store.has(assignment.motifId)) {
      hotkeys.assign(assignment.pitch, assignment.motifId, assignment.action);
    }
  }
  if (!store.select(state.selectedMotifId)) {
    store.ensureCurrent(DEFAULT_MOTIF_ID);
  }
  return true;
}

/**
 * Receive the parameter-enabled `pattr` snapshot after Live restores the device.
 * @param {unknown[]} encodedParts Encoded state atoms.
 */
function restore_state(...encodedParts: unknown[]): void {
  const atoms = flattenValues(encodedParts)
    .map((part) => stringAtom(part))
    .filter((part) => part !== "");
  const encoded = atoms[atoms.length - 1];
  if (!encoded) {
    return;
  }

  const state = decodePersistedDeviceState(encoded);
  if (!state) {
    if (encoded !== "0") {
      emitError("Saved device state is invalid or from an unsupported version");
    }
    return;
  }
  pendingPersistedState = state;
  if (applyPendingPersistedState()) {
    listMotifs();
  }
}

/**
 * Emit the MIDI pass state through the device's single Max outlet.
 */
function emitMidiPassState(): void {
  emit("midi-pass", settings.passThroughPolicy === "none" ? 0 : 1);
}

/**
 * Emit `status Ready` once so the patch opens the MIDI gate (fail-open until then).
 * Non-note MIDI bypasses JS entirely in the patcher.
 */
function initialize(): void {
  if (!initialized) {
    initialized = true;
    emitStatus("Ready");
    emitMidiPassState();
  }
  listMotifs();
  emitTransformUi();
}

/**
 * Write the build-injected Library page to Max's temporary folder and report
 * its resolved absolute path. jweb requires a real file loaded via `readfile`;
 * URL attributes and data URIs do not provide the Max bridge reliably.
 * @see https://docs.cycling74.com/apiref/js/file/
 * @see https://docs.cycling74.com/userguide/search_path/#path-prefixes
 * @see https://docs.cycling74.com/reference/jweb/#readfile
 */
function library_prepare(): void {
  try {
    const absolutePath = prepareLibraryPage(__MOTIF_LIBRARY_PAGE_NAME__, __MOTIF_LIBRARY_HTML__);
    emit("library-page", absolutePath);
  } catch (reason) {
    emitError(
      `Library page preparation failed: ${reason instanceof Error ? reason.message : String(reason)}`,
    );
  }
}

/**
 * Handle a pitch mode event.
 * @param {string} mode The pitch mode.
 */
function pitch_mode(mode: string): void {
  // `motif` = use the phrase's stored pitch mode.
  if (mode === "motif") {
    settings.pitchModeOverride = undefined;
  } else if (isStringEnumValue(mode, PITCH_MODE_OVERRIDES)) {
    settings.pitchModeOverride = mode;
  } else {
    emitError(`Unknown pitch mode: ${mode}`);
    return;
  }
  emitSelectedMotifUi();
  emitStatus("Pitch", mode);
}

/**
 * Synchronize the visual transform latches with the engine-owned state.
 */
function emitTransformUi(): void {
  emit("ui", "transforms", Number(settings.invert), Number(settings.reverse));
}

/**
 * Handle the performance pitch-inversion toggle.
 * @param {string | number | boolean} value The toggle state.
 */
function invert(value: string | number | boolean): void {
  settings.invert = toggleEnabled(value);
  emitTransformUi();
  emitSelectedMotifUi();
  emitStatus("invert", settings.invert ? "on" : "off");
}

/**
 * Handle the performance note-reversal toggle.
 * @param {string | number | boolean} value The toggle state.
 */
function reverse(value: string | number | boolean): void {
  settings.reverse = toggleEnabled(value);
  emitTransformUi();
  emitSelectedMotifUi();
  emitStatus("reverse", settings.reverse ? "on" : "off");
}

/**
 * Handle a meter mode event.
 * @param {string} mode The meter mode.
 */
function meter_mode(mode: string): void {
  if (!isStringEnumValue(mode, METER_MODES)) {
    emitError(`Unknown meter mode: ${mode}`);
    return;
  }
  settings.meterMode = mode;
  emitSelectedMotifUi();
  emitStatus("Meter", mode);
}

/**
 * Handle a retrigger mode event.
 * @param {string | number} mode The retrigger mode.
 */
function retrigger(mode: string | number): void {
  const parsed = parseRetriggerMode(mode);
  if (!parsed) {
    emitError(`Unknown retrigger mode: ${String(mode)}`);
    return;
  }
  settings.retriggerMode = parsed;
  emitStatus("retrigger", settings.retriggerMode);
}

/**
 * Handle a trigger mode event.
 * @param {string} mode The trigger mode.
 */
function trigger_mode(mode: string): void {
  if (!isStringEnumValue(mode, TRIGGER_MODES)) {
    emitError(`Unknown trigger mode: ${mode}`);
    return;
  }
  const nextMode = mode;
  if (settings.triggerMode === "hold-repeat" && nextMode !== "hold-repeat") {
    playback.stopAllHeldRepeats();
  }
  settings.triggerMode = nextMode;
  emitStatus("trigger-mode", settings.triggerMode);
}

/**
 * Handle a launch quantization event.
 * @param {string} value The launch quantization.
 */
function launch_quantization(value: string): void {
  if (!isStringEnumValue(value, LAUNCH_QUANTIZATIONS)) {
    emitError(`Unknown launch quantization: ${value}`);
    return;
  }
  settings.launchQuantization = value;
  emitStatus("quantization", settings.launchQuantization);
}

/**
 * Handle a pass-through policy event.
 * @param {string} value The pass-through policy.
 */
function pass_through(value: string): void {
  if (!isStringEnumValue(value, PASS_THROUGH_POLICIES)) {
    emitError(`Unknown pass-through policy: ${value}`);
    return;
  }
  settings.passThroughPolicy = value;
  emitMidiPassState();
  emitStatus("pass-through", settings.passThroughPolicy);
}

/**
 * Handle a trigger low event.
 * @param {number} value The trigger low value.
 */
function trigger_low(value: number): void {
  const zone = settings.setTriggerLow(value);
  emitStatus("trigger-zone", zone.low, zone.high);
}

/**
 * Handle a trigger high event.
 * @param {number} value The trigger high value.
 */
function trigger_high(value: number): void {
  const zone = settings.setTriggerHigh(value);
  emitStatus("trigger-zone", zone.low, zone.high);
}

/**
 * Handle a trigger map event.
 * @param {number | string} pitchValue The MIDI pitch or Ableton-style note name.
 * @param {string} motifId The motif id.
 * @param {string} actionValue Whether the note triggers or selects the motif.
 */
function map_trigger(pitchValue: number | string, motifId: string, actionValue = "trigger"): void {
  const result = hotkeys.assign(pitchValue, motifId, actionValue);
  if (!result.ok) {
    emitLibraryAlert("Invalid MIDI hot key", result.error);
    return;
  }
  const { pitch, motifId: selectedId, action } = result.assignment;
  playback.stopHeldRepeat(pitch, false);
  emitLibraryState();
  emitPersistedState();
  emitStatus("mapped", pitch, selectedId, action);
}

/**
 * Handle a trigger unmap event.
 * @param {number | string} pitchValue The MIDI pitch or Ableton-style note name.
 */
function unmap_trigger(pitchValue: number | string): void {
  const pitch = hotkeys.remove(pitchValue);
  if (pitch === undefined) {
    emitError(`Cannot unmap invalid MIDI note: ${String(pitchValue)}`);
    return;
  }
  playback.stopHeldRepeat(pitch, false);
  emitLibraryState();
  emitPersistedState();
  emitStatus("unmapped", pitch);
}

/**
 * Clear the trigger map.
 */
function clear_trigger_map(): void {
  for (const pitch of hotkeys.clear()) {
    playback.stopHeldRepeat(pitch, false);
  }
  emitLibraryState();
  emitPersistedState();
  emitStatus("map-cleared");
}

/**
 * Remove hot-key assignments whose motifs are no longer in the library.
 */
function pruneTriggerMap(): void {
  for (const pitch of hotkeys.prune()) {
    playback.stopHeldRepeat(pitch, false);
  }
}

/**
 * Handle a library path event.
 * @param {unknown[]} pathParts The path parts.
 */
function library_path(...pathParts: unknown[]): void {
  const nextPath = pathFromAtoms(pathParts);
  if (!nextPath) {
    return;
  }
  if (editor.isDirty()) {
    emitError("Finish or cancel editing before changing the library folder");
    emitLibraryState();
    return;
  }

  if (nextPath === library.path && (library.loaded || library.scanning)) {
    emitLibraryState();
    return;
  }

  editor.abandon();
  library.selectPath(nextPath);
}

/**
 * Refresh the user library.
 * @param {number | boolean | undefined} discardChanges The discard changes value.
 */
function refresh_library(discardChanges?: number | boolean): void {
  if (editor.isDirty() && !discardAllowed(discardChanges)) {
    emitError("Unsaved edits must be saved or discarded before refreshing");
    emitLibraryState();
    return;
  }

  editor.abandon();
  library.load("library-refreshed");
}

/**
 * Handle a tempo multiplier event.
 * @param {string | number} value The tempo multiplier value.
 */
function tempo_multiplier(value: string | number): void {
  const parsed = parseTempoMultiplier(value);
  if (parsed === undefined) {
    emitError(`Unknown tempo multiplier: ${String(value)}`);
    return;
  }
  settings.tempoMultiplier = parsed;
  emitSelectedMotifUi();
  emitStatus("tempo-multiplier", settings.tempoMultiplier);
}

/**
 * Handle a filter motifs event.
 * Max selector path updates the text query only; jweb passes tags via `lib_action`.
 * @param {unknown[]} queryParts The query parts.
 */
function filter_motifs(...queryParts: unknown[]): void {
  browserQuery = libraryQueryFromAtoms(queryParts);
  emitLibraryState();
  emitStatus("filter", browserQuery || "(all)");
}

/**
 * Apply Library browser filter state from a typed jweb action.
 * @param {unknown} query Text query atom(s).
 * @param {unknown} tags Selected filter tags.
 * @param {unknown} tagMode AND/OR combination mode.
 */
function applyLibraryFilter(query: unknown, tags?: unknown, tagMode?: unknown): void {
  browserQuery = libraryQueryFromAtoms([query]);
  if (tags !== undefined) {
    const parsed = normalizeTags(tags);
    browserTags = parsed.ok ? parsed.value : [];
  }
  if (tagMode !== undefined) {
    browserTagMode = normalizeTagFilterMode(tagMode, browserTagMode);
  }
  emitLibraryState();
  const tagSummary =
    browserTags.length > 0 ? ` tags:${browserTagMode}:${browserTags.join(",")}` : "";
  emitStatus("filter", `${browserQuery || "(all)"}${tagSummary}`);
}

/**
 * Dispatch a URL-encoded JSON action from `library.html`.
 * The page emits an explicit `lib_action` selector so unrelated jweb messages
 * such as `url` and `title` can never be parsed as actions.
 * @param {unknown[]} encodedParts The Max atoms containing the encoded action.
 */
function lib_action(...encodedParts: unknown[]): void {
  const decoded = decodeLibraryAction(encodedParts);
  if (!decoded.ok) {
    emitError(decoded.error);
    return;
  }

  const { action } = decoded;
  switch (action.type) {
    case "select_browser":
      authoring.selectBrowser(action.id, action.discardChanges);
      break;
    case "filter_motifs":
      applyLibraryFilter(action.query, action.tags, action.tagMode);
      break;
    case "import_clip":
      authoring.importClip();
      break;
    case "save_motif":
      authoring.saveMotif(action.properties);
      break;
    case "refresh_library":
      refresh_library(action.discardChanges);
      break;
    case "map_trigger":
      map_trigger(action.pitch, action.motifId, action.action);
      break;
    case "unmap_trigger":
      unmap_trigger(action.pitch);
      break;
    case "clear_trigger_map":
      clear_trigger_map();
      break;
    case "begin_edit":
      authoring.beginEdit();
      break;
    case "cancel_edit":
      authoring.cancelEdit();
      break;
    case "edit_motif":
      authoring.editMotif(action.properties);
      break;
    case "add_note":
      authoring.addNote();
      break;
    case "remove_note":
      authoring.removeNote(action.index);
      break;
    case "edit_note_at":
      authoring.editNoteAt(action.index, action.field, action.value);
      break;
  }
}

/**
 * Dump the context.
 */
function dump_context(): void {
  emit(
    "context",
    hostContext.tempo,
    hostContext.rootNote,
    hostContext.scaleName,
    ...hostContext.scaleIntervals,
  );
}

/** Device lifecycle, host-observer, and view synchronization messages. */
const lifecycleHandlers = {
  initialize,
  preview_ready: emitPreviewState,
  library_ready: emitLibraryState,
  restore_state,
  library_prepare,
  web_debug: mirrorWebDebug,
  list_motifs: listMotifs,
  dump_context,
  song_context,
} satisfies Partial<MotifHandlers>;

/** Live MIDI input and performance-setting messages. */
const performanceHandlers = {
  note: (pitch, velocity, channel) => playback.note(pitch, velocity, channel),
  cc: (controller, value) => playback.cc(controller, value),
  sustain: (value) => playback.sustain(value),
  motif: (value) => authoring.selectMotif(value),
  pitch_mode,
  invert,
  reverse,
  meter_mode,
  retrigger,
  trigger_mode,
  launch_quantization,
  pass_through,
  trigger_low,
  trigger_high,
  tempo_multiplier,
  panic: () => playback.panic(),
} satisfies Partial<MotifHandlers>;

/** User-library repository, browser, hot-key, and page-protocol messages. */
const libraryHandlers = {
  map_trigger,
  unmap_trigger,
  clear_trigger_map,
  library_path,
  refresh_library,
  filter_motifs,
  lib_action,
} satisfies Partial<MotifHandlers>;

/** Transactional motif authoring messages. */
const authoringHandlers = {
  import_clip: () => authoring.importClip(),
  save_motif: (properties) => authoring.saveMotif(properties),
  begin_edit: () => authoring.beginEdit(),
  cancel_edit: () => authoring.cancelEdit(),
  edit_motif: (properties) => authoring.editMotif(properties),
  select_browser: (id, discardChanges) => authoring.selectBrowser(id, discardChanges),
} satisfies Partial<MotifHandlers>;

/** Lookup table for {@link dispatch}; keys are Max message selectors. */
const handlers = {
  ...lifecycleHandlers,
  ...performanceHandlers,
  ...libraryHandlers,
  ...authoringHandlers,
} satisfies MotifHandlers;

/**
 * Single message boundary used by the hand-written Max `anything()` bridge.
 *
 * Max discovers only that top-level function; esbuild wraps this module in an
 * IIFE as `MotifEngine`, so individual handlers must stay behind this export.
 * Unknown selectors emit an error - they are not silently ignored.
 *
 * @see https://docs.cycling74.com/apiref/js/jsthis/
 * @param {string} message The Max `messagename` selector after `prepend`.
 * @param {readonly unknown[]} args The remaining atoms from `arrayfromargs(arguments)`.
 */
export function dispatch(message: string, args: readonly unknown[]): void {
  const handler = (handlers as unknown as Record<string, (...values: unknown[]) => void>)[message];
  if (!handler) {
    emitError(`Unknown message: ${message}`);
    return;
  }

  handler(...args);
}
