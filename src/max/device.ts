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
 * - `status …` / `error <message>` - console / debug
 * - `midi-pass <0|1>` - pass-through gate
 * - `ui <subselector> …` - Presentation / Library window (preview, browser, notes)
 * - `motifs-reset` / `motif-item` / `motif-selected` - motif menu
 * - `context …` - dump_context reply
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

import {
  absoluteNotesToMotif,
  convertMotifPitchMode,
  type AbsoluteNote,
} from '../core/import-notes.js';
import { compileMotif } from '../core/compile-motif.js';
import { clamp } from '../core/math.js';
import { buildMotifPreview, parseMidiNoteName } from '../core/preview.js';
import {
  barLengthTicks,
  quantizationTicks,
  ticksToMilliseconds,
  ticksUntilNextBoundary,
} from '../core/timing.js';
import { transformMotif } from '../core/transform-motif.js';
import {
  PPQ,
  type CompileOptions,
  type HostContext,
  type LaunchQuantization,
  type MeterMode,
  type Motif,
  type MotifNote,
  type PassThroughPolicy,
  type PitchMode,
  type RetriggerMode,
  type TriggerMode,
} from '../core/types.js';
import { MotifEditorState } from '../library/editor-state.js';
import { MotifStore, uniqueMotifId } from '../library/store.js';
import { validateMotif } from '../library/validate.js';

/**
 * Symbolic messages the Max patch may send to `v8` (via `prepend <name>`).
 * Keep in sync with `tests/max-handler-contract.test.ts` and the patch generator.
 */
interface MotifHandlers {
  /**
   * Emit `status Ready`, list motifs, and sync UI on first load.
   * @returns {void}
   */
  initialize: () => void;
  /**
   * Handle the preview renderer becoming ready.
   * @returns {void}
   */
  preview_ready: () => void;
  /**
   * Handle the library page registering its receive callback.
   * @returns {void}
   */
  library_ready: () => void;
  /**
   * Materialize the bundled library page into Max's temporary folder.
   * @returns {void}
   */
  library_prepare: () => void;
  /**
   * Mirror diagnostics emitted by an embedded page.
   * @param {string} page The page reporting the diagnostic.
   * @param {string} level The diagnostic severity.
   * @param {string} encodedMessage The URL-encoded diagnostic text.
   * @returns {void}
   */
  web_debug: (page: string, level: string, encodedMessage: string) => void;
  /**
   * Handle a note-on or note-off from `midiparse`.
   * @param {number} pitch The MIDI note number.
   * @param {number} velocity The note velocity, or zero for note-off.
   * @param {number | undefined} channel The one-based MIDI channel.
   * @returns {void}
   */
  note: (pitch: number, velocity: number, channel?: number) => void;
  /**
   * Handle a MIDI continuous-controller message.
   * @param {number} controller The controller number.
   * @param {number} value The controller value.
   * @param {number | undefined} channel The one-based MIDI channel.
   * @returns {void}
   */
  cc: (controller: number, value: number, channel?: number) => void;
  /**
   * Handle a convenience sustain message equivalent to controller 64.
   * @param {number} value The sustain value.
   * @param {number | undefined} channel The one-based MIDI channel.
   * @returns {void}
   */
  sustain: (value: number, channel?: number) => void;
  /**
   * Select a motif by id or display name.
   * @param {string} id The motif id or display name.
   * @returns {void}
   */
  motif: (id: string) => void;
  /**
   * Set the motif pitch-mode override.
   * @param {string} mode The `motif`, `scale`, `chromatic`, or `hybrid` mode.
   * @returns {void}
   */
  pitch_mode: (mode: string) => void;
  /**
   * Enable or disable non-destructive pitch-offset inversion.
   * @param {string | number | boolean} value The toggle state.
   * @returns {void}
   */
  invert: (value: string | number | boolean) => void;
  /**
   * Flip non-destructive pitch-offset inversion after a UI click.
   * @returns {void}
   */
  invert_toggle: () => void;
  /**
   * Enable or disable non-destructive note-order reversal.
   * @param {string | number | boolean} value The toggle state.
   * @returns {void}
   */
  reverse: (value: string | number | boolean) => void;
  /**
   * Flip non-destructive note-order reversal after a UI click.
   * @returns {void}
   */
  reverse_toggle: () => void;
  /**
   * Set the meter scaling mode.
   * @param {string} mode The `preserve` or `fit-bar` mode.
   * @returns {void}
   */
  meter_mode: (mode: string) => void;
  /**
   * Set the retrigger mode.
   * @param {string | number} mode The `replace`/`1` or `overlap`/`0` value.
   * @returns {void}
   */
  retrigger: (mode: string | number) => void;
  /**
   * Set the keyboard trigger mode.
   * @param {string} mode The `one-shot`, `hold`, `hold-repeat`, `toggle`, `latch`, or `release-tail` mode.
   * @returns {void}
   */
  trigger_mode: (mode: string) => void;
  /**
   * Set launch quantization.
   * @param {string} value The `immediate`, `1/16`, `1/8`, `1/4`, or `bar` value.
   * @returns {void}
   */
  launch_quantization: (value: string) => void;
  /**
   * Set MIDI pass-through behavior.
   * @param {string} value The `none`, `non-triggers`, or `all` policy.
   * @returns {void}
   */
  pass_through: (value: string) => void;
  /**
   * Set the inclusive lower keyboard-trigger bound.
   * @param {number} value The low MIDI note number.
   * @returns {void}
   */
  trigger_low: (value: number) => void;
  /**
   * Set the inclusive upper keyboard-trigger bound.
   * @param {number} value The high MIDI note number.
   * @returns {void}
   */
  trigger_high: (value: number) => void;
  /**
   * Map a MIDI pitch to a motif id.
   * @param {number | string} pitch The MIDI note number or Ableton-style note name to map.
   * @param {string} motifId The target motif id.
   * @param {string | undefined} action The `trigger`, `select`, or `repeat` behavior.
   * @returns {void}
   */
  map_trigger: (pitch: number | string, motifId: string, action?: string) => void;
  /**
   * Remove the assignment for one MIDI pitch.
   * @param {number | string} pitch The MIDI note number or Ableton-style note name.
   * @returns {void}
   */
  unmap_trigger: (pitch: number | string) => void;
  /** Remove every MIDI hot-key assignment. */
  clear_trigger_map: () => void;
  /**
   * Set the user library folder and reload its JSON files.
   * @param {unknown[]} pathParts The Max atoms composing the folder path.
   * @returns {void}
   */
  library_path: (...pathParts: unknown[]) => void;
  refresh_library: (discardChanges?: number | boolean) => void;
  /**
   * Set the device-local BPM multiplier.
   * @param {string | number} value The 0.5, 1, 1.5, or 2 multiplier.
   * @returns {void}
   */
  tempo_multiplier: (value: string | number) => void;
  /**
   * Set the library browser search string.
   * @param {unknown[]} queryParts The Max atoms composing the query.
   * @returns {void}
   */
  filter_motifs: (...queryParts: unknown[]) => void;
  /**
   * Import the selected Detail View MIDI clip.
   * @param {string | undefined} pitchMode The `scale`, `chromatic`, or `hybrid` analysis mode.
   * @returns {void}
   */
  import_clip: (pitchMode?: string) => void;
  /**
   * Write the current motif JSON into the user library folder.
   * @param {unknown} properties Optional properties applied before saving.
   * @returns {void}
   */
  save_motif: (properties?: unknown) => void;
  /**
   * Begin editing, cloning a built-in motif when needed.
   * @returns {void}
   */
  begin_edit: () => void;
  /**
   * Atomically edit all non-identity motif properties.
   * @param {unknown} properties The property payload from the library form.
   * @returns {void}
   */
  edit_motif: (properties: unknown) => void;
  /**
   * Select a motif by stable id.
   * @param {string} id The stable motif id.
   * @param {number | boolean | undefined} discardChanges Whether dirty changes may be discarded.
   * @returns {void}
   */
  select_browser: (id: string, discardChanges?: number | boolean) => void;
  /**
   * Exit edit mode and restore the pre-edit snapshot.
   * @returns {void}
   */
  cancel_edit: () => void;
  /**
   * Dispatch a URL-encoded JSON action from the library page.
   * @param {unknown[]} encodedParts The Max atoms containing the encoded action.
   * @returns {void}
   */
  lib_action: (...encodedParts: unknown[]) => void;
  /**
   * Flush pipes and clear active trigger state.
   * @returns {void}
   */
  panic: () => void;
  list_motifs: () => void;
  dump_context: () => void;
  /**
   * Forwarded Song observer property + value(s).
   * Properties: tempo, root_note, scale_mode, scale_name, scale_intervals,
   * signature_numerator, signature_denominator, is_playing, current_song_time.
   * @param {string} property The observed Song property.
   * @param {unknown[]} values The property values from Max.
   * @returns {void}
   */
  song_context: (property: string, ...values: unknown[]) => void;
}

/** Validated built-in and user motifs currently available to performance and authoring flows. */
const store = new MotifStore();
/** Transactional edit-session state, including snapshots used to cancel dirty edits safely. */
const editor = new MotifEditorState();
/** Absolute JSON filename for each loaded user motif id; built-ins are intentionally absent. */
const userLibraryFiles = new Map<string, string>();
/** Case-normalized library paths reserved by valid files and invalid/conflicting JSON entries. */
const occupiedLibraryPaths = new Set<string>();

/**
 * Behavior assigned to one MIDI hot key.
 * - `trigger` plays one motif instance on note-on.
 * - `select` changes the motif used by subsequent trigger-zone notes.
 */
type HotkeyAction = 'trigger' | 'select';

/** A MIDI hot key's stable motif target and note-on behavior. */
interface HotkeyMapping {
  /** Stable id resolved against {@link store}. */
  motifId: string;
  /** Performance behavior applied when the mapped MIDI note is received. */
  action: HotkeyAction;
}

/** MIDI pitch to Library-configured motif/action assignment. */
const triggerMap = new Map<number, HotkeyMapping>();
/** Trigger pitches retained by the global hold/toggle/latch/release-tail modes. */
const activeTriggers = new Set<number>();
/** Global hold-mode releases deferred until the sustain pedal rises. */
const sustainedReleases = new Set<number>();

/** Directory waiting to be opened by the incremental library scanner. */
interface PendingLibraryFolder {
  /** Absolute Max filesystem path. */
  pathname: string;
  /** Slash-separated path displayed relative to the chosen library root. */
  relativePath: string;
  /** Root-relative recursion depth used to enforce {@link MAX_LIBRARY_DEPTH}. */
  depth: number;
}

/** Directory currently open for one bounded scanner batch. */
interface ActiveLibraryFolder extends PendingLibraryFolder {
  /** Max Folder iterator, kept open only until this directory is exhausted. */
  folder: Folder;
}

/** Mutable candidate library assembled off-screen and committed atomically after scanning. */
interface LibraryScanState {
  /** Monotonic token that invalidates callbacks from superseded scans. */
  generation: number;
  /** Status selector emitted after the candidate library commits. */
  completionStatus: 'library' | 'library-refreshed';
  /** Breadth-first queue of discovered directories. */
  pending: PendingLibraryFolder[];
  /** Directory whose entries are being consumed by the current batch. */
  current: ActiveLibraryFolder | undefined;
  /** Normalized absolute paths already queued, preventing cycles and duplicate traversal. */
  visited: Set<string>;
  /** Isolated motif store that replaces {@link store} only after a successful scan. */
  candidateStore: MotifStore;
  /** Candidate equivalent of {@link userLibraryFiles}. */
  candidateFiles: Map<string, string>;
  /** Candidate equivalent of {@link occupiedLibraryPaths}. */
  candidateOccupiedPaths: Set<string>;
  /** Directory entries examined so far, used by Library scan progress UI. */
  processedEntries: number;
  /** Valid user motifs accepted so far, used by Library scan progress UI. */
  loadedMotifs: number;
}

/** Structured warning delivered to the Library modal instead of exposing internal parser errors. */
interface LibraryAlert {
  /** Monotonic identity that lets the page display each warning once. */
  id: number;
  /** Short dialog heading. */
  title: string;
  /** Actionable user-facing details. */
  message: string;
}

/** Compact note record transported to the HTML editor. */
interface LibraryNoteData {
  pitch: number;
  accidental: number | null;
  at: number;
  duration: number;
  gate: number | null;
  velocity: number | null;
  velocityOffset: number | null;
  velocityScale: number | null;
  legato: boolean;
  tie: boolean;
}

/** One trigger held in global `hold-repeat` mode and the Task that launches its next cycle. */
interface HeldRepeat {
  /** Stable motif id captured when the key was pressed. */
  motifId: string;
  /** Original note-on velocity reused for every repeated cycle. */
  velocity: number;
  /** Original one-based MIDI channel reused for every repeated cycle. */
  channel: number;
  /** Low-priority Max task scheduled at the next motif boundary. */
  task: Task;
}

/** Optional overrides used when a repeat cycle launches an already-resolved motif. */
interface TriggerMotifOptions {
  /** Stable motif id to play instead of resolving the current hot-key/default selection. */
  motifId?: string;
  /** Explicit launch delay; repeat cycles use zero after the quantized first launch. */
  launchOffsetTicks?: number;
}

/** Built-in selected on first load and whenever the active user motif disappears. */
const DEFAULT_MOTIF_ID = 'scale-turn';
/** Maximum filesystem entries processed before yielding back to Max's UI thread. */
const LIBRARY_SCAN_BATCH_SIZE = 32;
/** Maximum nested folder levels traversed below the chosen user-library root. */
const MAX_LIBRARY_DEPTH = 32;
/** Smallest legal repeat-task delay, preventing malformed zero-length motifs from busy-looping. */
const MIN_REPEAT_DELAY_MS = 1;

let currentMotifId = DEFAULT_MOTIF_ID;
let pitchModeOverride: PitchMode | undefined;
let invertOffsets = false;
let reverseNotes = false;
let meterMode: MeterMode = 'preserve';
let retriggerMode: RetriggerMode = 'replace';
let triggerMode: TriggerMode = 'one-shot';
let launchQuantization: LaunchQuantization = 'immediate';
let passThroughPolicy: PassThroughPolicy = 'non-triggers';
let triggerLow = 36;
let triggerHigh = 84;
let sustainDown = false;
let initialized = false;
let instanceCounter = 1;
let userLibraryPath = '';
let userLibraryLoaded = false;
let previewTriggerPitch = 60;
let previewWasTriggered = false;
let tempoMultiplier = 1;
let browserQuery = '';
let libraryScanning = false;
let libraryScanGeneration = 0;
let libraryScanState: LibraryScanState | undefined;
let libraryScanTask: Task | undefined;
let libraryAlert: LibraryAlert | undefined;
let libraryAlertCounter = 0;
/** Monotonic identity used to discard stale note chunks in the Library page. */
let libraryNoteTransferCounter = 0;

/** Device-local tempo ratios exposed by the Settings menu. */
const TEMPO_MULTIPLIERS = [0.5, 1, 1.5, 2] as const;
/** Motif-note properties accepted by the indexed `edit_note_at` message. */
const NOTE_EDIT_FIELDS = [
  'pitch',
  'accidental',
  'at',
  'duration',
  'gate',
  'velocity',
  'velocityOffset',
  'velocityScale',
  'legato',
  'tie',
] as const;
/** Maximum number of notes stored, imported, or manually authored in one motif. */
const MAX_MOTIF_NOTES = 512;
/** Notes included in one Max → jweb transport message before client-side assembly. */
const LIBRARY_NOTE_CHUNK_SIZE = 32;
type NoteEditField = (typeof NOTE_EDIT_FIELDS)[number];

/** Latest Live Song context mirrored by native observers in the Max patch. */
const hostContext: HostContext = {
  tempo: 120,
  rootNote: 0,
  scaleName: 'Major',
  scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
  scaleMode: true,
  timeSignature: { numerator: 4, denominator: 4 },
  isPlaying: false,
  currentSongTime: 0,
};

/** Active repeat task for each pitch currently held in global `hold-repeat` mode. */
const heldRepeats = new Map<number, HeldRepeat>();
/** Global `hold-repeat` releases deferred while the sustain pedal remains down. */
const sustainedRepeatReleases = new Set<number>();

/**
 * Build the host context with the device-local tempo multiplier applied.
 * @returns {HostContext} The effective context used for scheduling and preview.
 */
function effectiveHost(): HostContext {
  return {
    ...hostContext,
    tempo: hostContext.tempo * tempoMultiplier,
  };
}

/**
 * Send a list through the device's single Max outlet.
 * @param {unknown[]} values The list atoms to emit.
 * @returns {void}
 */
function emit(...values: unknown[]): void {
  outlet(0, ...values);
}

/**
 * Emit a status message through the device's single Max outlet.
 * @param {unknown[]} values The status atoms to emit.
 * @returns {void}
 */
function emitStatus(...values: unknown[]): void {
  emit('status', ...values);
}

/**
 * Emit an error message through the device's single Max outlet.
 * @param {string} message The error message to emit.
 * @returns {void}
 */
function emitError(message: string): void {
  emit('error', message);
  error(`Motif: ${message}\n`);
}

/**
 * Build a map of motif ids to display labels.
 * @returns {Map<string, string>} The motif id to label map.
 */
function motifLabels(): Map<string, string> {
  const motifs = store.list();
  const counts = new Map<string, number>();
  for (const item of motifs) counts.set(item.name, (counts.get(item.name) ?? 0) + 1);
  return new Map(
    motifs.map((item) => [
      item.id,
      (counts.get(item.name) ?? 0) > 1 ? `${item.name} · ${item.id}` : item.name,
    ]),
  );
}

/**
 * Resolve a motif by id or display name.
 * @param {string} value The motif id or display name.
 * @returns {Motif | undefined} The resolved motif, or undefined when the value is not a valid motif id or name.
 */
function resolveMotif(value: string): Motif | undefined {
  const normalized = String(value).trim();
  const direct = store.get(normalized);
  if (direct) return direct;

  const labelMatch = [...motifLabels()].find(([, label]) => label === normalized);
  if (labelMatch) return store.get(labelMatch[0]);

  return store.list().find((item) => item.name === normalized);
}

/**
 * Get the current motif by id.
 * @returns {Motif | undefined} The current motif, or undefined when the id is unknown.
 */
function currentMotif(): Motif | undefined {
  return store.get(currentMotifId);
}

/**
 * Apply the current non-destructive performance transforms to a motif.
 * @param {Motif} motif The stored motif.
 * @returns {Motif} A transient motif used only for playback and preview.
 */
function performanceMotif(motif: Motif): Motif {
  return transformMotif(motif, {
    invert: invertOffsets,
    reverse: reverseNotes,
  });
}

/**
 * Format a number as a string without trailing zeros.
 * @param {number} value The number to format.
 * @returns {string} The formatted number.
 */
function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '');
}

/**
 * Get the relative browser folder for a motif.
 * @param {string} id The motif id.
 * @returns {string} `Built-ins`, `Library`, or a slash-separated relative folder.
 */
function motifBrowserFolder(id: string): string {
  if (store.isBuiltin(id)) return 'Built-ins';
  const filename = userLibraryFiles.get(id);
  if (!filename || !userLibraryPath) return 'Library';

  const root = userLibraryPath.replace(/\\/g, '/').replace(/\/+$/, '');
  const normalized = filename.replace(/\\/g, '/');
  const prefix = `${root}/`;
  if (!normalized.toLowerCase().startsWith(prefix.toLowerCase())) return 'Library';

  const relative = normalized.slice(prefix.length);
  const separator = relative.lastIndexOf('/');
  return separator < 0 ? 'Library' : relative.slice(0, separator);
}

/**
 * List the MIDI hot keys assigned to a motif.
 * @param {string} id The motif id.
 * @returns {Array<{ pitch: number; action: HotkeyAction }>} Sorted MIDI mappings.
 */
function motifHotkeys(id: string): Array<{ pitch: number; action: HotkeyAction }> {
  return [...triggerMap]
    .filter(([, mapping]) => mapping.motifId === id)
    .map(([pitch, mapping]) => ({ pitch, action: mapping.action }))
    .sort((left, right) => left.pitch - right.pitch);
}

/**
 * Serialize one motif note for the Library editor.
 * @param {MotifNote} note The stored motif note.
 * @returns {LibraryNoteData} A complete form-friendly note record.
 */
function libraryNoteData(note: MotifNote): LibraryNoteData {
  return {
    pitch: note.pitch,
    accidental: note.accidental ?? null,
    at: note.at,
    duration: note.duration,
    gate: note.gate ?? null,
    velocity: note.velocity ?? null,
    velocityOffset: note.velocityOffset ?? null,
    velocityScale: note.velocityScale ?? null,
    legato: note.legato ?? false,
    tie: note.tie ?? false,
  };
}

/**
 * Emit the library state through the device's single Max outlet.
 * @returns {void}
 */
function emitLibraryState(): void {
  const normalizedQuery = browserQuery.trim().toLowerCase();
  const matchedIds = new Set(store.filter(browserQuery).map((item) => item.id));
  const items = store.list()
    .filter((item) =>
      !normalizedQuery
      || matchedIds.has(item.id)
      || motifBrowserFolder(item.id).toLowerCase().includes(normalizedQuery),
    )
    .sort((left, right) =>
      motifBrowserFolder(left.id).localeCompare(motifBrowserFolder(right.id))
      || left.name.localeCompare(right.name)
      || left.id.localeCompare(right.id),
    );
  const selected = currentMotif();
  const selectedIndex = selected ? items.findIndex((item) => item.id === selected.id) : -1;
  const nameCounts = new Map<string, number>();
  for (const item of items) nameCounts.set(item.name, (nameCounts.get(item.name) ?? 0) + 1);

  let selectedData: object | null = null;
  let noteTransfer: {
    id: number;
    motifId: string;
    notes: LibraryNoteData[];
  } | undefined;
  if (selected) {
    const notes = selected.notes.map(libraryNoteData);
    if (notes.length > LIBRARY_NOTE_CHUNK_SIZE) {
      libraryNoteTransferCounter += 1;
      noteTransfer = {
        id: libraryNoteTransferCounter,
        motifId: selected.id,
        notes,
      };
    }
    const preview = buildMotifPreview(
      performanceMotif(selected),
      effectiveHost(),
      previewTriggerPitch,
      pitchModeOverride,
      meterMode,
    );
    const sourceMeter = `${selected.sourceMeter.numerator}/${selected.sourceMeter.denominator}`;
    const bars = `${formatNumber(preview.bars)} ${preview.bars === 1 ? 'bar' : 'bars'}`;
    const stats = `${preview.notes.length} notes  •  ${bars}  •  ${sourceMeter} source  •  ${preview.effectivePitchMode}`;
    selectedData = {
      schemaVersion: selected.schemaVersion,
      id: selected.id,
      name: selected.name,
      description: selected.description ?? '',
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
      stats,
      isBuiltin: store.isBuiltin(selected.id),
      isPersisted: userLibraryFiles.has(selected.id),
      folder: motifBrowserFolder(selected.id),
      hotkeys: motifHotkeys(selected.id),
      noteCount: selected.notes.length,
      noteLimit: MAX_MOTIF_NOTES,
      noteTransferId: noteTransfer?.id ?? null,
      notesLoading: Boolean(noteTransfer),
      notes: noteTransfer ? [] : notes,
    };
  }

  const state = {
    query: browserQuery,
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      showId: (nameCounts.get(item.name) ?? 0) > 1,
      folder: motifBrowserFolder(item.id),
      hotkeys: motifHotkeys(item.id),
    })),
    selectedIndex,
    selected: selectedData,
    editing: editor.snapshot(),
    libraryPath: userLibraryPath,
    libraryLoaded: userLibraryLoaded,
    libraryScanning,
    alert: libraryAlert ?? null,
    scanProgress: libraryScanState
      ? {
          processedEntries: libraryScanState.processedEntries,
          loadedMotifs: libraryScanState.loadedMotifs,
        }
      : null,
  };
  emit('ui', 'lib', encodeURIComponent(JSON.stringify(state)));
  if (noteTransfer) {
    for (let offset = 0; offset < noteTransfer.notes.length; offset += LIBRARY_NOTE_CHUNK_SIZE) {
      emit('ui', 'lib', encodeURIComponent(JSON.stringify({
        kind: 'note-chunk',
        transferId: noteTransfer.id,
        motifId: noteTransfer.motifId,
        offset,
        total: noteTransfer.notes.length,
        notes: noteTransfer.notes.slice(offset, offset + LIBRARY_NOTE_CHUNK_SIZE),
      })));
    }
  }
}

/**
 * Present a user-facing Library warning and mirror it to the Max Console.
 * @param {string} title Short warning title.
 * @param {string} message Actionable warning details.
 * @returns {void}
 */
function emitLibraryAlert(title: string, message: string): void {
  libraryAlertCounter += 1;
  libraryAlert = { id: libraryAlertCounter, title, message };
  emitError(message);
  emitLibraryState();
}

/**
 * Emit the preview state through the device's single Max outlet.
 * @returns {void}
 */
function emitPreviewState(): void {
  const selected = currentMotif();
  if (!selected) return;
  const preview = buildMotifPreview(
    performanceMotif(selected),
    effectiveHost(),
    previewTriggerPitch,
    pitchModeOverride,
    meterMode,
  );
  const totalTicks = preview.notes.reduce(
    (max, n) => Math.max(max, n.atTicks + n.durationTicks),
    1,
  );
  const state = {
    notes: preview.notes.map((n) => ({ pitch: n.pitch, atTicks: n.atTicks, durationTicks: n.durationTicks })),
    totalTicks,
    lowPitch: preview.lowPitch,
    highPitch: preview.highPitch,
    noteNames: preview.noteNames.join('  ·  '),
  };
  emit('ui', 'preview', encodeURIComponent(JSON.stringify(state)));
}

/**
 * Emit the selected motif UI through the device's single Max outlet.
 * @returns {void}
 */
function emitSelectedMotifUi(): void {
  emitLibraryState();
  emitPreviewState();
}

/**
 * Flatten an array of values into a single array.
 * @param {readonly unknown[]} values The values to flatten.
 * @returns {unknown[]} The flattened values.
 */
function flattenValues(values: readonly unknown[]): unknown[] {
  const out: unknown[] = [];
  for (const value of values) {
    if (Array.isArray(value)) out.push(...(value as unknown[]));
    else out.push(value);
  }
  return out;
}

/**
 * Convert a JSON or Max atom to text without object default stringification.
 * @param {unknown} value The atom to convert.
 * @param {string} fallback The string to return for unsupported values.
 * @returns {string} The converted atom or fallback.
 */
function stringAtom(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}

/**
 * Extract numbers from an array of values.
 * @param {readonly unknown[]} values The values to extract numbers from.
 * @returns {number[]} The extracted numbers.
 */
function numbers(values: readonly unknown[]): number[] {
  return flattenValues(values)
    .map(Number)
    .filter(Number.isFinite);
}

/**
 * Flush Max `pipe` queues and reset local trigger bookkeeping.
 * @returns {void}
 */
function clearScheduledNotes(): void {
  emit('clear');
  emit('panic');
  activeTriggers.clear();
  sustainedReleases.clear();
}

/**
 * Apply one Song property received from native observers.
 * @param {string} property The observed Song property name.
 * @param {readonly unknown[]} values The atoms emitted for the property.
 * @returns {void}
 */
function updateHost(property: string, values: readonly unknown[]): void {
  const numeric = numbers(values);

  switch (property) {
    case 'tempo': {
      const value = numeric[0];
      if (value !== undefined && value > 0) hostContext.tempo = value;
      break;
    }
    case 'root_note': {
      const value = numeric[0];
      if (value !== undefined) {
        hostContext.rootNote = Math.round(value);
        if (!previewWasTriggered) previewTriggerPitch = 60 + hostContext.rootNote;
        emitSelectedMotifUi();
      }
      break;
    }
    case 'scale_mode': {
      hostContext.scaleMode = (numeric[0] ?? 0) !== 0;
      emitSelectedMotifUi();
      break;
    }
    case 'scale_intervals': {
      if (numeric.length > 0) {
        hostContext.scaleIntervals = numeric.map(Math.round);
        emitSelectedMotifUi();
      }
      break;
    }
    case 'scale_name': {
      const value = flattenValues(values).map(String).join(' ').trim();
      if (value) {
        hostContext.scaleName = value;
        emitSelectedMotifUi();
      }
      break;
    }
    case 'signature_numerator': {
      const value = numeric[0];
      if (value !== undefined && value > 0) {
        hostContext.timeSignature.numerator = Math.round(value);
        emitSelectedMotifUi();
      }
      break;
    }
    case 'signature_denominator': {
      const value = numeric[0];
      if (value !== undefined && value > 0) {
        hostContext.timeSignature.denominator = Math.round(value);
        emitSelectedMotifUi();
      }
      break;
    }
    case 'is_playing': {
      const wasPlaying = hostContext.isPlaying;
      hostContext.isPlaying = (numeric[0] ?? 0) !== 0;
      if (wasPlaying && !hostContext.isPlaying) {
        stopAllHeldRepeats();
        clearScheduledNotes();
      }
      break;
    }
    case 'current_song_time': {
      const value = numeric[0];
      if (value !== undefined && value >= 0) hostContext.currentSongTime = value;
      break;
    }
    default:
      emitError(`Unknown Song property: ${property}`);
      return;
  }
}

/**
 * Update the host context based on a Song property and its values.
 * @param {string} property The Song property name.
 * @param {readonly unknown[]} values The atoms emitted for the property.
 * @returns {void}
 */
function song_context(property: string, ...values: unknown[]): void {
  updateHost(String(property), values);
}

/**
 * Ensure the current motif id is set to a valid motif.
 * @returns {void}
 */
function ensureCurrentMotifId(): void {
  if (!store.get(currentMotifId)) {
    currentMotifId = store.list()[0]?.id ?? DEFAULT_MOTIF_ID;
  }
}

/**
 * List all motifs and emit the corresponding UI state.
 * @returns {void}
 */
function listMotifs(): void {
  ensureCurrentMotifId();
  const labels = motifLabels();
  emit('motifs-reset');
  for (const item of store.list()) emit('motif-item', labels.get(item.id) ?? item.name);
  emit('motif-selected', labels.get(currentMotifId) ?? currentMotif()?.name ?? currentMotifId);
  emitSelectedMotifUi();
}

/**
 * Emit the MIDI pass state through the device's single Max outlet.
 * @returns {void}
 */
function emitMidiPassState(): void {
  emit('midi-pass', passThroughPolicy === 'none' ? 0 : 1);
}

/**
 * Emit `status Ready` once so the patch opens the MIDI gate (fail-open until then).
 * Non-note MIDI bypasses JS entirely in the patcher.
 * @returns {void}
 */
function initialize(): void {
  if (!initialized) {
    initialized = true;
    emitStatus('Ready');
    emitMidiPassState();
  }
  listMotifs();
  emitTransformUi();
}

/**
 * Re-send the latest preview after the native renderer initializes or reloads.
 * @returns {void}
 */
function preview_ready(): void {
  emitPreviewState();
}

/**
 * Re-send the latest library state after the asynchronous page finishes loading.
 * @returns {void}
 */
function library_ready(): void {
  emitLibraryState();
}

/**
 * Join an absolute Max folder path and a filename.
 * @param {string} folder The absolute parent folder reported by Max's File API.
 * @param {string} filename The filename to append.
 * @returns {string} The complete Max pathname.
 */
function joinMaxPath(folder: string, filename: string): string {
  const separator = folder.endsWith('/') || folder.endsWith(':') ? '' : '/';
  return `${folder}${separator}${filename}`;
}

/**
 * Write text through Max's File API without crossing its per-call string limit.
 * @param {File} file The open output file.
 * @param {string} text The complete text to write.
 * @returns {void}
 */
function writeTextChunks(file: File, text: string): void {
  const chunkSize = 8_192;
  for (let offset = 0; offset < text.length; offset += chunkSize) {
    file.writestring(text.slice(offset, offset + chunkSize));
  }
}

/**
 * Write the build-injected Library page to Max's temporary folder and report
 * its resolved absolute path. jweb requires a real file loaded via `readfile`;
 * URL attributes and data URIs do not provide the Max bridge reliably.
 * @returns {void}
 * @see https://docs.cycling74.com/apiref/js/file/
 * @see https://docs.cycling74.com/userguide/search_path/#path-prefixes
 * @see https://docs.cycling74.com/reference/jweb/#readfile
 */
function library_prepare(): void {
  const temporaryPath = `Tempfolder:/${__MOTIF_LIBRARY_PAGE_NAME__}`;
  let output: File | undefined;

  try {
    output = new File(temporaryPath, 'write');
    if (!output.isopen) throw new Error(`could not create ${temporaryPath}`);

    output.eof = 0;
    output.position = 0;
    writeTextChunks(output, __MOTIF_LIBRARY_HTML__);
    const absolutePath = joinMaxPath(output.foldername, __MOTIF_LIBRARY_PAGE_NAME__);
    output.close();
    output = undefined;

    const verification = new File(absolutePath, 'read');
    if (!verification.isopen) throw new Error(`could not reopen ${absolutePath}`);
    const byteLength = verification.eof;
    verification.close();
    if (byteLength < __MOTIF_LIBRARY_HTML__.length) {
      throw new Error(`wrote a truncated page to ${absolutePath} (${byteLength} bytes)`);
    }

    emit('library-page', absolutePath);
  } catch (reason) {
    if (output?.isopen) output.close();
    emitError(`Library page preparation failed: ${reason instanceof Error ? reason.message : String(reason)}`);
  }
}

/**
 * Decode and mirror embedded-page diagnostics into the Max Console.
 * @param {string} page The embedded page reporting the diagnostic.
 * @param {string} level The diagnostic severity.
 * @param {string} encodedMessage The URL-encoded diagnostic text.
 * @returns {void}
 */
function web_debug(page: string, level: string, encodedMessage: string): void {
  let message = String(encodedMessage);
  try {
    message = decodeURIComponent(message);
  } catch {
    // Keep the original atom when a malformed diagnostic cannot be decoded.
  }

  const line = `Motif jweb ${String(page)} [${String(level)}] ${message}\n`;
  if (String(level).toLowerCase() === 'error') {
    error(line);
  } else {
    post(line);
  }
}

/**
 * Calculate the launch offset in ticks.
 * @returns {number} The launch offset in ticks.
 */
function launchOffsetTicks(): number {
  if (!hostContext.isPlaying || launchQuantization === 'immediate') return 0;
  const grid = quantizationTicks(launchQuantization, hostContext.timeSignature);
  return ticksUntilNextBoundary(Math.max(0, hostContext.currentSongTime * PPQ), grid);
}

/**
 * Resolve the motif's cycle length after applying the active meter mode.
 * @param {Motif} motif The motif that will repeat.
 * @returns {number} Effective cycle duration in PPQ ticks.
 */
function effectiveMotifLengthTicks(motif: Motif): number {
  if (meterMode === 'preserve') return motif.length;
  const targetBar = barLengthTicks(hostContext.timeSignature);
  const sourceBar = barLengthTicks(motif.sourceMeter);
  return motif.length * (targetBar / sourceBar);
}

/**
 * Convert one effective motif cycle to a safe Max Task delay.
 * The current tempo multiplier is re-read for every cycle so held repeats
 * follow live tempo changes without rebuilding the active assignment.
 * @param {Motif} motif The motif that will repeat.
 * @returns {number} Repeat interval in milliseconds.
 */
function motifRepeatDelayMilliseconds(motif: Motif): number {
  return Math.max(
    MIN_REPEAT_DELAY_MS,
    ticksToMilliseconds(effectiveMotifLengthTicks(motif), effectiveHost().tempo),
  );
}

/**
 * Schedule one MIDI note event through Max `pipe` (delay in milliseconds).
 * @param {number} pitch The MIDI note number.
 * @param {number} velocity The MIDI velocity, or zero for note-off.
 * @param {number} channel The one-based MIDI channel.
 * @param {number} delayMilliseconds The delay before emitting the event.
 * @returns {void}
 * @see https://docs.cycling74.com/reference/pipe
 */
function emitScheduledEvent(
  pitch: number,
  velocity: number,
  channel: number,
  delayMilliseconds: number,
): void {
  emit('event', pitch, velocity, channel, Math.max(0, delayMilliseconds));
}

/**
 * Emit a direct note event through Max `pipe` (no delay).
 * @param {number} pitch The MIDI note number.
 * @param {number} velocity The MIDI velocity, or zero for note-off.
 * @param {number} channel The one-based MIDI channel.
 * @returns {void}
 */
function emitDirectNote(pitch: number, velocity: number, channel: number): void {
  emitScheduledEvent(pitch, velocity, channel, 0);
}

/**
 * Determine whether to pass a dry note event through Max `pipe`.
 * @param {boolean} isTrigger Whether the note is a trigger.
 * @returns {boolean} Whether to pass the dry note event.
 */
function shouldPassDry(isTrigger: boolean): boolean {
  return passThroughPolicy === 'all' || (passThroughPolicy === 'non-triggers' && !isTrigger);
}

/**
 * Resolve the motif used by a trigger pitch.
 * Trigger hot keys override the current selection; trigger-zone notes use it.
 * @param {number} triggerPitch The incoming MIDI trigger pitch.
 * @returns {string} Stable motif id to play.
 */
function motifIdForTrigger(triggerPitch: number): string {
  const mapping = triggerMap.get(triggerPitch);
  return mapping?.action === 'trigger' ? mapping.motifId : currentMotifId;
}

/**
 * Trigger a motif and emit the corresponding MIDI events.
 * @param {number} triggerPitch The pitch of the trigger.
 * @param {number} triggerVelocity The velocity of the trigger.
 * @param {number} channel The one-based MIDI channel.
 * @param {TriggerMotifOptions} triggerOptions Optional motif and launch-delay overrides.
 * @returns {number | undefined} The instance id of the triggered motif, or undefined when the motif is unknown.
 */
function triggerMotif(
  triggerPitch: number,
  triggerVelocity: number,
  channel: number,
  triggerOptions: TriggerMotifOptions = {},
): number | undefined {
  const motifId = triggerOptions.motifId ?? motifIdForTrigger(triggerPitch);
  const selected = resolveMotif(motifId);
  if (!selected) {
    emitError(`Unknown motif: ${motifId}`);
    return undefined;
  }

  if (retriggerMode === 'replace' || triggerMode === 'latch') clearScheduledNotes();

  previewTriggerPitch = triggerPitch;
  previewWasTriggered = true;
  emitSelectedMotifUi();

  const instanceId = instanceCounter++;
  const options: CompileOptions = {
    channel: Math.round(clamp(channel, 1, 16)),
    meterMode,
    triggerPitch: Math.round(triggerPitch),
    triggerVelocity: Math.round(triggerVelocity),
    launchOffsetTicks: triggerOptions.launchOffsetTicks ?? launchOffsetTicks(),
    instanceId,
  };
  if (pitchModeOverride !== undefined) options.pitchMode = pitchModeOverride;

  for (const event of compileMotif(performanceMotif(selected), effectiveHost(), options)) {
    emitScheduledEvent(event.pitch, event.velocity, event.channel, event.offsetMs);
  }

  emitStatus('trigger', motifId, triggerPitch, instanceId);
  return instanceId;
}

/**
 * Cancel one global hold-repeat task without cutting off the cycle already sent to Max `pipe`.
 * @param {number} triggerPitch The held MIDI trigger pitch.
 * @param {boolean} emitFeedback Whether to emit the user-facing stopped status.
 * @returns {void}
 */
function stopHeldRepeat(triggerPitch: number, emitFeedback = true): void {
  const repeat = heldRepeats.get(triggerPitch);
  if (!repeat) return;
  repeat.task.cancel();
  repeat.task.freepeer();
  heldRepeats.delete(triggerPitch);
  sustainedRepeatReleases.delete(triggerPitch);
  if (emitFeedback) emitStatus('repeat-stopped', repeat.motifId, triggerPitch);
}

/**
 * Cancel every active global hold-repeat task.
 * @param {boolean} emitFeedback Whether each stopped assignment should emit a status.
 * @returns {void}
 */
function stopAllHeldRepeats(emitFeedback = false): void {
  for (const pitch of [...heldRepeats.keys()]) stopHeldRepeat(pitch, emitFeedback);
  sustainedRepeatReleases.clear();
}

/**
 * Play the trigger's resolved motif once and schedule further cycles until note-off.
 * Duplicate note-ons for a physically held key are ignored so controller
 * key-repeat cannot create parallel Max Tasks.
 * @param {number} triggerPitch The MIDI trigger pitch.
 * @param {number} triggerVelocity The original note-on velocity.
 * @param {number} channel The original one-based MIDI channel.
 * @returns {void}
 */
function startHeldRepeat(
  triggerPitch: number,
  triggerVelocity: number,
  channel: number,
): void {
  if (heldRepeats.has(triggerPitch)) return;
  const motifId = motifIdForTrigger(triggerPitch);
  const motif = resolveMotif(motifId);
  if (!motif) {
    emitError(`Unknown motif: ${motifId}`);
    return;
  }

  const firstLaunchOffset = launchOffsetTicks();
  const instanceId = triggerMotif(triggerPitch, triggerVelocity, channel, {
    motifId: motif.id,
    launchOffsetTicks: firstLaunchOffset,
  });
  if (instanceId === undefined) return;

  let repeat: HeldRepeat;
  const task = new Task(() => {
    if (heldRepeats.get(triggerPitch) !== repeat) return;
    const repeatedMotif = resolveMotif(repeat.motifId);
    if (!repeatedMotif) {
      stopHeldRepeat(triggerPitch);
      return;
    }
    const repeatedInstance = triggerMotif(
      triggerPitch,
      repeat.velocity,
      repeat.channel,
      { motifId: repeat.motifId, launchOffsetTicks: 0 },
    );
    if (repeatedInstance === undefined || heldRepeats.get(triggerPitch) !== repeat) return;
    repeat.task.schedule(motifRepeatDelayMilliseconds(repeatedMotif));
  });
  repeat = {
    motifId: motif.id,
    velocity: triggerVelocity,
    channel,
    task,
  };
  heldRepeats.set(triggerPitch, repeat);

  const firstDelay = ticksToMilliseconds(firstLaunchOffset, effectiveHost().tempo)
    + motifRepeatDelayMilliseconds(motif);
  task.schedule(Math.max(MIN_REPEAT_DELAY_MS, firstDelay));
  emitStatus('repeat-started', motif.id, triggerPitch);
}

/**
 * Cancel a trigger and emit the corresponding status message.
 * @param {number} triggerPitch The pitch of the trigger.
 * @returns {void}
 */
function cancelTrigger(triggerPitch: number): void {
  if (!activeTriggers.has(triggerPitch)) return;
  clearScheduledNotes();
  emitStatus('release', triggerPitch);
}

/**
 * Handle a MIDI note event.
 * @param {number} pitchValue The MIDI note number.
 * @param {number} velocityValue The MIDI velocity, or zero for note-off.
 * @param {number} channelValue The one-based MIDI channel.
 * @returns {void}
 */
function note(pitchValue: number, velocityValue: number, channelValue = 1): void {
  const pitch = Math.round(clamp(pitchValue, 0, 127));
  const velocity = Math.round(clamp(velocityValue, 0, 127));
  const channel = Math.round(clamp(channelValue, 1, 16));
  const mapping = triggerMap.get(pitch);
  const isTrigger = Boolean(mapping)
    || heldRepeats.has(pitch)
    || (pitch >= triggerLow && pitch <= triggerHigh);

  if (shouldPassDry(isTrigger)) emitDirectNote(pitch, velocity, channel);
  if (!isTrigger) return;

  if (mapping?.action === 'select') {
    if (velocity > 0) {
      select_browser(mapping.motifId);
      if (currentMotifId === mapping.motifId) {
        emitStatus('selected', mapping.motifId, pitch);
      }
    }
    return;
  }

  if (triggerMode === 'hold-repeat' || heldRepeats.has(pitch)) {
    if (velocity > 0) {
      if (triggerMode === 'hold-repeat') startHeldRepeat(pitch, velocity, channel);
    } else if (sustainDown) {
      sustainedRepeatReleases.add(pitch);
    } else {
      stopHeldRepeat(pitch);
    }
    return;
  }

  if (velocity > 0) {
    if (triggerMode === 'toggle' && activeTriggers.has(pitch)) {
      cancelTrigger(pitch);
      return;
    }

    const instanceId = triggerMotif(pitch, velocity, channel);
    if (instanceId !== undefined && triggerMode !== 'one-shot') activeTriggers.add(pitch);
    return;
  }

  if (triggerMode === 'hold') {
    if (sustainDown) sustainedReleases.add(pitch);
    else cancelTrigger(pitch);
  } else if (triggerMode === 'release-tail') {
    activeTriggers.delete(pitch);
  }
}

/**
 * Handle a MIDI CC event.
 * @param {number} controllerValue The MIDI CC number.
 * @param {number} valueValue The MIDI CC value.
 * @param {number} channelValue The one-based MIDI channel.
 * @returns {void}
 */
function cc(controllerValue: number, valueValue: number, _channel = 1): void {
  const controller = Math.round(clamp(controllerValue, 0, 127));
  const value = Math.round(clamp(valueValue, 0, 127));
  if (controller !== 64) return;

  const wasDown = sustainDown;
  sustainDown = value >= 64;
  if (wasDown && !sustainDown) {
    for (const pitch of [...sustainedRepeatReleases]) stopHeldRepeat(pitch);
    sustainedRepeatReleases.clear();
    if (sustainedReleases.size > 0) clearScheduledNotes();
    sustainedReleases.clear();
  }
  emitStatus('sustain', sustainDown ? 'on' : 'off');
}

/**
 * Handle a MIDI sustain event.
 * @param {number} value The sustain value.
 * @param {number} channel The one-based MIDI channel.
 * @returns {void}
 */
function sustain(value: number, channel = 1): void {
  cc(64, value, channel);
}

/**
 * Handle a motif selection event.
 * @param {string} value The motif id or display name.
 * @returns {void}
 */
function motif(value: string): void {
  let selected = resolveMotif(value);
  if (!selected) {
    emitError(`Unknown motif: ${value}`);
    return;
  }

  if (selected.id === currentMotifId) return;

  if (editor.isEditing()) {
    if (editor.isDirty()) {
      emitError('Save or cancel the current edits before selecting another motif');
      emit('motif-selected', motifLabels().get(currentMotifId) ?? currentMotif()?.name ?? currentMotifId);
      emitLibraryState();
      return;
    }
    editor.cancel(store);
    selected = resolveMotif(value);
    if (!selected) {
      emitError(`Unknown motif after cancelling edit: ${value}`);
      listMotifs();
      return;
    }
  }

  currentMotifId = selected.id;
  emit('motif-selected', motifLabels().get(selected.id) ?? selected.name);
  emitSelectedMotifUi();
  emitStatus('Motif', selected.name);
}

/**
 * Handle a pitch mode event.
 * @param {string} mode The pitch mode.
 * @returns {void}
 */
function pitch_mode(mode: string): void {
  // `motif` = use the phrase's stored pitch mode.
  if (mode === 'motif') pitchModeOverride = undefined;
  else if (mode === 'scale' || mode === 'chromatic' || mode === 'hybrid') pitchModeOverride = mode;
  else {
    emitError(`Unknown pitch mode: ${mode}`);
    return;
  }
  emitSelectedMotifUi();
  emitStatus('Pitch', mode);
}

/**
 * Parse a Max toggle atom.
 * @param {string | number | boolean} value The toggle atom.
 * @returns {boolean} Whether the toggle is enabled.
 */
function toggleEnabled(value: string | number | boolean): boolean {
  return value === true || value === 1 || value === '1' || value === 'true' || value === 'on';
}

/**
 * Synchronize the visual transform latches with the engine-owned state.
 * @returns {void}
 */
function emitTransformUi(): void {
  emit('ui', 'transforms', invertOffsets ? 1 : 0, reverseNotes ? 1 : 0);
}

/**
 * Handle the performance pitch-inversion toggle.
 * @param {string | number | boolean} value The toggle state.
 * @returns {void}
 */
function invert(value: string | number | boolean): void {
  invertOffsets = toggleEnabled(value);
  emitTransformUi();
  emitSelectedMotifUi();
  emitStatus('invert', invertOffsets ? 'on' : 'off');
}

/**
 * Flip pitch inversion from a UI click event.
 * The engine owns the state so Max `live.text` outlet quirks cannot leave it stuck.
 * @returns {void}
 */
function invert_toggle(): void {
  invert(!invertOffsets);
}

/**
 * Handle the performance note-reversal toggle.
 * @param {string | number | boolean} value The toggle state.
 * @returns {void}
 */
function reverse(value: string | number | boolean): void {
  reverseNotes = toggleEnabled(value);
  emitTransformUi();
  emitSelectedMotifUi();
  emitStatus('reverse', reverseNotes ? 'on' : 'off');
}

/**
 * Flip note reversal from a UI click event.
 * The engine owns the state so every click deterministically restores/applies it.
 * @returns {void}
 */
function reverse_toggle(): void {
  reverse(!reverseNotes);
}

/**
 * Handle a meter mode event.
 * @param {string} mode The meter mode.
 * @returns {void}
 */
function meter_mode(mode: string): void {
  if (mode !== 'preserve' && mode !== 'fit-bar') {
    emitError(`Unknown meter mode: ${mode}`);
    return;
  }
  meterMode = mode;
  emitSelectedMotifUi();
  emitStatus('Meter', mode);
}

/**
 * Handle a retrigger mode event.
 * @param {string | number} mode The retrigger mode.
 * @returns {void}
 */
function retrigger(mode: string | number): void {
  if (mode === 1 || mode === 'replace') retriggerMode = 'replace';
  else if (mode === 0 || mode === 'overlap') retriggerMode = 'overlap';
  else {
    emitError(`Unknown retrigger mode: ${String(mode)}`);
    return;
  }
  emitStatus('retrigger', retriggerMode);
}

/**
 * Handle a trigger mode event.
 * @param {string} mode The trigger mode.
 * @returns {void}
 */
function trigger_mode(mode: string): void {
  const valid: TriggerMode[] = ['one-shot', 'hold', 'hold-repeat', 'toggle', 'latch', 'release-tail'];
  if (!valid.includes(mode as TriggerMode)) {
    emitError(`Unknown trigger mode: ${mode}`);
    return;
  }
  const nextMode = mode as TriggerMode;
  if (triggerMode === 'hold-repeat' && nextMode !== 'hold-repeat') stopAllHeldRepeats();
  triggerMode = nextMode;
  emitStatus('trigger-mode', triggerMode);
}

/**
 * Handle a launch quantization event.
 * @param {string} value The launch quantization.
 * @returns {void}
 */
function launch_quantization(value: string): void {
  const valid: LaunchQuantization[] = ['immediate', '1/16', '1/8', '1/4', 'bar'];
  if (!valid.includes(value as LaunchQuantization)) {
    emitError(`Unknown launch quantization: ${value}`);
    return;
  }
  launchQuantization = value as LaunchQuantization;
  emitStatus('quantization', launchQuantization);
}

/**
 * Handle a pass-through policy event.
 * @param {string} value The pass-through policy.
 * @returns {void}
 */
function pass_through(value: string): void {
  const valid: PassThroughPolicy[] = ['none', 'non-triggers', 'all'];
  if (!valid.includes(value as PassThroughPolicy)) {
    emitError(`Unknown pass-through policy: ${value}`);
    return;
  }
  passThroughPolicy = value as PassThroughPolicy;
  emitMidiPassState();
  emitStatus('pass-through', passThroughPolicy);
}

/**
 * Handle a trigger low event.
 * @param {number} value The trigger low value.
 * @returns {void}
 */
function trigger_low(value: number): void {
  triggerLow = Math.min(triggerHigh, Math.round(clamp(value, 0, 127)));
  emitStatus('trigger-zone', triggerLow, triggerHigh);
}

/**
 * Handle a trigger high event.
 * @param {number} value The trigger high value.
 * @returns {void}
 */
function trigger_high(value: number): void {
  triggerHigh = Math.max(triggerLow, Math.round(clamp(value, 0, 127)));
  emitStatus('trigger-zone', triggerLow, triggerHigh);
}

/**
 * Parse a numeric MIDI pitch or Ableton-style note name.
 * @param {number | string} value The pitch or note name.
 * @returns {number | undefined} A rounded/clamped MIDI pitch, or undefined.
 */
function triggerPitchValue(value: number | string): number | undefined {
  if (typeof value === 'string') {
    const named = parseMidiNoteName(value);
    if (named !== undefined) return named;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? Math.round(clamp(numeric, 0, 127)) : undefined;
  }
  return Number.isFinite(value) ? Math.round(clamp(value, 0, 127)) : undefined;
}

/**
 * Handle a trigger map event.
 * @param {number | string} pitchValue The MIDI pitch or Ableton-style note name.
 * @param {string} motifId The motif id.
 * @param {string} actionValue Whether the note triggers or selects the motif.
 * @returns {void}
 */
function map_trigger(
  pitchValue: number | string,
  motifId: string,
  actionValue = 'trigger',
): void {
  const pitch = triggerPitchValue(pitchValue);
  if (pitch === undefined) {
    emitError(`Cannot map invalid MIDI note: ${String(pitchValue)}`);
    return;
  }
  const selected = resolveMotif(motifId);
  if (!selected) {
    emitError(`Cannot map ${pitch}: unknown motif ${motifId}`);
    return;
  }
  if (actionValue !== 'trigger' && actionValue !== 'select') {
    emitError(`Cannot map ${pitch}: unknown hot-key action ${actionValue}`);
    return;
  }
  const action = actionValue;
  stopHeldRepeat(pitch, false);
  triggerMap.set(pitch, { motifId: selected.id, action });
  emitLibraryState();
  emitStatus('mapped', pitch, selected.id, action);
}

/**
 * Handle a trigger unmap event.
 * @param {number | string} pitchValue The MIDI pitch or Ableton-style note name.
 * @returns {void}
 */
function unmap_trigger(pitchValue: number | string): void {
  const pitch = triggerPitchValue(pitchValue);
  if (pitch === undefined) {
    emitError(`Cannot unmap invalid MIDI note: ${String(pitchValue)}`);
    return;
  }
  stopHeldRepeat(pitch, false);
  triggerMap.delete(pitch);
  emitLibraryState();
  emitStatus('unmapped', pitch);
}

/**
 * Clear the trigger map.
 * @returns {void}
 */
function clear_trigger_map(): void {
  for (const pitch of triggerMap.keys()) stopHeldRepeat(pitch, false);
  triggerMap.clear();
  emitLibraryState();
  emitStatus('map-cleared');
}

/**
 * Remove hot-key assignments whose motifs are no longer in the library.
 * @returns {void}
 */
function pruneTriggerMap(): void {
  for (const [pitch, mapping] of triggerMap) {
    if (!store.has(mapping.motifId)) {
      stopHeldRepeat(pitch, false);
      triggerMap.delete(pitch);
    }
  }
}

/**
 * Read a JSON file.
 * @param {string} filename The filename to read.
 * @returns {unknown} The JSON content.
 */
function readJsonFile(filename: string): unknown {
  const file = new File(filename, 'read');
  if (!file.isopen) throw new Error('could not open file');
  try {
    return JSON.parse(file.readstring(file.eof));
  } finally {
    file.close();
  }
}

/**
 * Write a JSON file.
 * @param {string} filename The filename to write.
 * @param {unknown} value The JSON content.
 * @returns {void}
 */
function writeJsonFile(filename: string, value: unknown): void {
  const file = new File(filename, 'write');
  if (!file.isopen) throw new Error('could not open file for write');
  try {
    file.writestring(`${JSON.stringify(value, null, 2)}\n`);
  } finally {
    file.close();
  }
}

/**
 * Get the library file path for a motif id.
 * @param {string} id The motif id.
 * @returns {string} The library file path.
 */
function libraryFilePath(id: string): string {
  const separator = userLibraryPath.endsWith('/') || userLibraryPath.endsWith(':') ? '' : '/';
  return `${userLibraryPath}${separator}${id}.json`;
}

/**
 * Normalize a local path for case-insensitive collision checks.
 * @param {string} filename The local file path to normalize.
 * @returns {string} The slash-normalized lowercase path.
 */
function canonicalLibraryPath(filename: string): string {
  return filename.replace(/\\/g, '/').replace(/\/{2,}/g, '/').toLowerCase();
}

/**
 * Reserve a library path.
 * @param {string} filename The library file path.
 * @returns {void}
 */
function reserveLibraryPath(filename: string): void {
  occupiedLibraryPaths.add(canonicalLibraryPath(filename));
}

/**
 * Check if a library path is occupied.
 * @param {string} filename The library file path.
 * @returns {boolean} Whether the path is occupied.
 */
function isLibraryPathOccupied(filename: string): boolean {
  return occupiedLibraryPaths.has(canonicalLibraryPath(filename));
}

/**
 * Check if a file exists.
 * @param {string} filename The file path.
 * @returns {boolean} Whether the file exists.
 */
function fileExists(filename: string): boolean {
  const file = new File(filename, 'read');
  const exists = file.isopen;
  if (exists) file.close();
  return exists;
}

/**
 * Allocate an id that cannot overwrite a loaded motif or scanned JSON file.
 * @param {string} baseValue The preferred id or display name.
 * @returns {string} An available motif id.
 */
function uniqueAvailableId(baseValue: string): string {
  const base = uniqueMotifId(baseValue);
  let candidate = base;
  let suffix = 2;
  while (store.has(candidate) || (userLibraryPath && isLibraryPathOccupied(libraryFilePath(candidate)))) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

/**
 * Load one validated JSON motif, reserving its path even when invalid.
 * @param {string} fullPath The complete JSON file path.
 * @param {string} displayPath The relative path used in diagnostics.
 * @param {LibraryScanState} scan The scan receiving the validated motif.
 * @returns {void}
 */
function loadUserMotifFile(
  fullPath: string,
  displayPath: string,
  scan: LibraryScanState,
): void {
  scan.candidateOccupiedPaths.add(canonicalLibraryPath(fullPath));
  try {
    const result = validateMotif(readJsonFile(fullPath));
    if (!result.valid || !result.motif) {
      emitError(`${displayPath}: ${result.errors.join('; ')}`);
    } else if (scan.candidateStore.isBuiltin(result.motif.id)) {
      emitError(`${displayPath}: id “${result.motif.id}” conflicts with a built-in and was skipped`);
    } else if (scan.candidateFiles.has(result.motif.id)) {
      emitError(`${displayPath}: duplicate motif id “${result.motif.id}” was skipped`);
    } else {
      const errors = scan.candidateStore.add(result.motif);
      if (errors.length > 0) emitError(`${displayPath}: ${errors.join('; ')}`);
      else {
        scan.candidateFiles.set(result.motif.id, fullPath);
        scan.loadedMotifs += 1;
      }
    }
  } catch (reason) {
    emitError(`${displayPath}: ${reason instanceof Error ? reason.message : String(reason)}`);
  }
}

/**
 * Close and discard any active asynchronous library scan.
 * @returns {void}
 */
function cancelLibraryScan(): void {
  libraryScanGeneration += 1;
  if (libraryScanTask) {
    libraryScanTask.cancel();
    libraryScanTask.freepeer();
    libraryScanTask = undefined;
  }
  if (libraryScanState?.current) {
    libraryScanState.current.folder.close();
  }
  libraryScanState = undefined;
  libraryScanning = false;
}

/**
 * Commit a completed scan atomically so the previous library remains usable
 * until every replacement motif has been read and validated.
 * @param {LibraryScanState} scan The completed scan.
 * @returns {void}
 */
function finishLibraryScan(scan: LibraryScanState): void {
  if (scan.generation !== libraryScanGeneration || libraryScanState !== scan) return;

  store.resetToBuiltins();
  for (const motif of scan.candidateStore.list()) {
    if (!scan.candidateStore.isBuiltin(motif.id)) store.add(motif);
  }
  userLibraryFiles.clear();
  for (const [id, filename] of scan.candidateFiles) userLibraryFiles.set(id, filename);
  occupiedLibraryPaths.clear();
  for (const filename of scan.candidateOccupiedPaths) occupiedLibraryPaths.add(filename);

  libraryScanState = undefined;
  libraryScanning = false;
  userLibraryLoaded = true;
  if (libraryScanTask) {
    libraryScanTask.cancel();
    libraryScanTask.freepeer();
    libraryScanTask = undefined;
  }

  pruneTriggerMap();
  ensureCurrentMotifId();
  listMotifs();
  if (scan.completionStatus === 'library') {
    emitStatus('library', userLibraryPath);
  } else {
    emitStatus('library-refreshed', store.list().length);
  }
}

/**
 * Process a bounded amount of filesystem work, then yield back to Max.
 * Directory entries are identified from the parent Folder iterator's
 * `filetype`; files are never opened as Folder objects.
 * @returns {void}
 */
function processLibraryScanBatch(): void {
  const scan = libraryScanState;
  if (!scan || scan.generation !== libraryScanGeneration) return;

  let operations = 0;
  while (operations < LIBRARY_SCAN_BATCH_SIZE) {
    if (!scan.current) {
      const next = scan.pending.shift();
      if (!next) {
        finishLibraryScan(scan);
        return;
      }

      const canonical = canonicalLibraryPath(next.pathname).replace(/\/+$/, '');
      if (scan.visited.has(canonical)) continue;
      scan.visited.add(canonical);

      const folder = new Folder(next.pathname);
      operations += 1;
      if (!folder.pathname) {
        folder.close();
        continue;
      }
      scan.current = { ...next, folder };
    }

    const active = scan.current;
    if (active.folder.end) {
      active.folder.close();
      scan.current = undefined;
      continue;
    }

    const filename = active.folder.filename;
    const filetype = active.folder.filetype;
    if (filename && filename !== '.' && filename !== '..') {
      const fullPath = joinMaxPath(active.folder.pathname, filename);
      const displayPath = active.relativePath ? `${active.relativePath}/${filename}` : filename;
      if (filetype === 'fold') {
        if (active.depth < MAX_LIBRARY_DEPTH) {
          scan.pending.push({
            pathname: fullPath,
            relativePath: displayPath,
            depth: active.depth + 1,
          });
        } else {
          emitError(`${displayPath}: maximum library folder depth exceeded`);
        }
      } else if (filename.toLowerCase().endsWith('.json')) {
        loadUserMotifFile(fullPath, displayPath, scan);
      }
      scan.processedEntries += 1;
    }
    active.folder.next();
    operations += 1;
  }

  if (libraryScanTask && scan.generation === libraryScanGeneration) {
    libraryScanTask.schedule(0);
  }
}

/**
 * Begin loading the user library in bounded low-priority batches.
 * @param {'library' | 'library-refreshed'} completionStatus Status to emit on completion.
 * @returns {boolean} Whether the root folder was opened and scanning began.
 */
function loadUserLibrary(completionStatus: 'library' | 'library-refreshed'): boolean {
  cancelLibraryScan();
  userLibraryLoaded = false;
  if (!userLibraryPath) return false;

  const root = new Folder(userLibraryPath);
  if (!root.pathname) {
    root.close();
    store.resetToBuiltins();
    userLibraryFiles.clear();
    occupiedLibraryPaths.clear();
    emitError(`Library folder not found: ${userLibraryPath}`);
    pruneTriggerMap();
    ensureCurrentMotifId();
    listMotifs();
    emitStatus('library-unavailable', userLibraryPath);
    return false;
  }
  libraryScanGeneration += 1;
  libraryScanning = true;
  libraryScanState = {
    generation: libraryScanGeneration,
    completionStatus,
    pending: [],
    current: { pathname: userLibraryPath, relativePath: '', depth: 0, folder: root },
    visited: new Set<string>([
      canonicalLibraryPath(userLibraryPath).replace(/\/+$/, ''),
    ]),
    candidateStore: new MotifStore(),
    candidateFiles: new Map<string, string>(),
    candidateOccupiedPaths: new Set<string>(),
    processedEntries: 0,
    loadedMotifs: 0,
  };
  emitLibraryState();
  emitStatus('library-scanning', userLibraryPath);
  libraryScanTask = new Task(processLibraryScanBatch);
  libraryScanTask.schedule(0);
  return true;
}

/**
 * Get a path from atoms.
 * @param {readonly unknown[]} values The atoms.
 * @returns {string} The path.
 */
function pathFromAtoms(values: readonly unknown[]): string {
  return flattenValues(values)
    .map((value) => stringAtom(value))
    .filter(Boolean)
    .join(' ')
    .trim()
    .replace(/^"|"$/g, '');
}

/**
 * Check if a value is allowed to be discarded.
 * @param {number | boolean | undefined} value The value to check.
 * @returns {boolean} Whether the value is allowed to be discarded.
 */
function discardAllowed(value: number | boolean | undefined): boolean {
  return value === true || value === 1;
}

/**
 * Handle a library path event.
 * @param {unknown[]} pathParts The path parts.
 * @returns {void}
 */
function library_path(...pathParts: unknown[]): void {
  const nextPath = pathFromAtoms(pathParts);
  if (!nextPath) return;
  if (editor.isDirty()) {
    emitError('Finish or cancel editing before changing the library folder');
    emitLibraryState();
    return;
  }

  if (nextPath === userLibraryPath && (userLibraryLoaded || libraryScanning)) {
    emitLibraryState();
    return;
  }

  editor.abandon();
  userLibraryPath = nextPath;
  loadUserLibrary('library');
}

/**
 * Refresh the user library.
 * @param {number | boolean | undefined} discardChanges The discard changes value.
 * @returns {void}
 */
function refresh_library(discardChanges?: number | boolean): void {
  if (editor.isDirty() && !discardAllowed(discardChanges)) {
    emitError('Unsaved edits must be saved or discarded before refreshing');
    emitLibraryState();
    return;
  }

  editor.abandon();
  loadUserLibrary('library-refreshed');
}

/**
 * Handle a tempo multiplier event.
 * @param {string | number} value The tempo multiplier value.
 * @returns {void}
 */
function tempo_multiplier(value: string | number): void {
  const parsed = typeof value === 'number' ? value : Number(String(value).replace(/x$/i, ''));
  if (!TEMPO_MULTIPLIERS.includes(parsed as (typeof TEMPO_MULTIPLIERS)[number])) {
    emitError(`Unknown tempo multiplier: ${String(value)}`);
    return;
  }
  tempoMultiplier = parsed;
  emitSelectedMotifUi();
  emitStatus('tempo-multiplier', tempoMultiplier);
}

/**
 * Handle a filter motifs event.
 * @param {unknown[]} queryParts The query parts.
 * @returns {void}
 */
function filter_motifs(...queryParts: unknown[]): void {
  const raw = flattenValues(queryParts)
    .map(String)
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' ')
    .trim();
  browserQuery = raw;
  emitLibraryState();
  emitStatus('filter', browserQuery || '(all)');
}

// --- Clip import (LiveAPI only; Song state stays on native observers) ---
// @see https://docs.cycling74.com/apiref/js/liveapi/
// @see https://docs.cycling74.com/apiref/lom/song_view/
// @see https://docs.cycling74.com/apiref/lom/clipslot/
// @see https://docs.cycling74.com/apiref/lom/clip/

/**
 * Check if a LiveAPI instance is valid.
 * @param {LiveAPI | undefined} api The LiveAPI instance.
 * @returns {boolean} Whether the LiveAPI instance is valid.
 */
function isLiveApiValid(api: LiveAPI | undefined): api is LiveAPI {
  return api !== undefined && api.id !== 0;
}

/**
 * Check if a value is truthy.
 * @param {unknown} value The value to check.
 * @returns {boolean} Whether the value is truthy.
 */
function liveTruthy(value: unknown): boolean {
  if (Array.isArray(value)) return liveTruthy(value[0]);
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized !== '' && normalized !== '0' && normalized !== 'false' && normalized !== 'id 0';
  }
  return Boolean(value);
}

/**
 * Check if a LiveAPI instance is a MIDI clip.
 * @param {LiveAPI} api The LiveAPI instance.
 * @returns {boolean} Whether the LiveAPI instance is a MIDI clip.
 */
function isMidiClip(api: LiveAPI): boolean {
  try {
    if (liveTruthy(api.get('is_midi_clip'))) return true;
    // Some Live builds expose only the inverse audio flag on clips.
    if (liveTruthy(api.get('is_audio_clip'))) return false;
  } catch {
    // Property missing - assume MIDI and let note read fail soft.
  }
  return true;
}

/**
 * Prefer Detail View clip (`live_set view detail_clip`), else highlighted slot clip.
 * Returns undefined when nothing is selected or LiveAPI is unavailable.
 * @returns {LiveAPI | undefined} The selected MIDI clip, when available.
 */
function resolveDetailClip(): LiveAPI | undefined {
  if (typeof LiveAPI === 'undefined') return undefined;

  try {
    const detail = new LiveAPI(undefined, 'live_set view detail_clip');
    if (isLiveApiValid(detail) && isMidiClip(detail)) return detail;
  } catch {
    // detail_clip path unavailable
  }

  try {
    const slot = new LiveAPI(undefined, 'live_set view highlighted_clip_slot');
    if (!isLiveApiValid(slot) || !liveTruthy(slot.get('has_clip'))) return undefined;
    const clip = new LiveAPI(undefined, 'live_set view highlighted_clip_slot clip');
    if (isLiveApiValid(clip) && isMidiClip(clip)) return clip;
  } catch {
    // No highlighted clip slot / empty slot.
  }

  return undefined;
}

/**
 * Coerce a value to a record.
 * @param {unknown} value The value to coerce.
 * @returns {Record<string, unknown> | undefined} The coerced record, or undefined when the value is not a record.
 */
function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

/**
 * Live 11+ `get_notes_extended` returns a JSON string from Max JS LiveAPI.
 * Also accept already-parsed objects and Max Dict-like values with stringify().
 * @param {unknown} raw The LiveAPI payload to normalize.
 * @returns {unknown} The parsed payload, or undefined when parsing fails.
 */
function coerceNotesPayload(raw: unknown): unknown {
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return undefined;
    try {
      return JSON.parse(trimmed);
    } catch {
      return undefined;
    }
  }

  const dictLike = raw as { stringify?: () => string } | null;
  if (dictLike && typeof dictLike.stringify === 'function') {
    try {
      return JSON.parse(dictLike.stringify());
    } catch {
      return undefined;
    }
  }

  return raw;
}

/**
 * Parse notes from a LiveAPI payload.
 * @param {unknown} raw The LiveAPI payload to parse.
 * @returns {AbsoluteNote[]} The parsed notes.
 */
function parseClipNotesExtended(raw: unknown): AbsoluteNote[] {
  const record = asRecord(coerceNotesPayload(raw));
  const notesValue = record?.notes;
  if (!Array.isArray(notesValue)) return [];

  const notes: AbsoluteNote[] = [];
  for (const entry of notesValue) {
    const note = asRecord(entry);
    if (!note) continue;
    const pitch = Number(note.pitch);
    const startTime = Number(note.start_time ?? note.startTime);
    const duration = Number(note.duration);
    const velocity = Number(note.velocity ?? 100);
    if (!Number.isFinite(pitch) || !Number.isFinite(startTime) || !Number.isFinite(duration)) continue;
    if (note.mute === 1 || note.muted === 1 || note.mute === true) continue;
    notes.push({
      at: Math.round(startTime * PPQ),
      duration: Math.max(1, Math.round(duration * PPQ)),
      pitch: Math.round(pitch),
      velocity: Math.round(clamp(velocity, 1, 127)),
    });
  }
  return notes;
}

/**
 * Read notes from a Live MIDI clip with Live 11+'s documented
 * `get_notes_extended(from_pitch, pitch_span, from_time, time_span)`.
 * Beat times are converted to motif PPQ ticks.
 * @param {LiveAPI} clip The Live MIDI clip to read.
 * @returns {AbsoluteNote[]} The imported notes in motif PPQ ticks.
 * @see https://docs.cycling74.com/apiref/js/liveapi/#call
 * @see https://docs.cycling74.com/apiref/lom/clip/#get_notes_extended
 */
function readClipNotes(clip: LiveAPI): AbsoluteNote[] {
  // A span of 128 includes every documented MIDI pitch from 0 through 127.
  const payload = clip.call('get_notes_extended', 0, 128, 0, 4096);
  return parseClipNotesExtended(payload);
}

/**
 * Import the selected Detail View MIDI clip into the in-memory store as a new motif.
 * Does not write disk until the user saves; requires a valid LiveAPI clip path.
 * @param {string} pitchModeValue The relative pitch-analysis mode.
 * @returns {void}
 */
function import_clip(pitchModeValue = 'chromatic'): void {
  if (libraryScanning) {
    emitError('Wait for the library scan to finish before importing a clip');
    emitLibraryState();
    return;
  }
  if (editor.isDirty()) {
    emitError('Save or cancel the current edits before importing a clip');
    emitLibraryState();
    return;
  }

  const mode = String(pitchModeValue || 'chromatic');
  if (mode !== 'scale' && mode !== 'chromatic' && mode !== 'hybrid') {
    emitError(`Unknown import pitch mode: ${mode}`);
    return;
  }

  const clip = resolveDetailClip();
  if (!clip) {
    emitError('No clip selected - open a MIDI clip in Detail View, then Import Clip');
    return;
  }

  let absoluteNotes: AbsoluteNote[] = [];
  try {
    absoluteNotes = readClipNotes(clip);
  } catch (reason) {
    emitError(`Clip import failed: ${reason instanceof Error ? reason.message : String(reason)}`);
    return;
  }

  if (absoluteNotes.length === 0) {
    emitError('Selected clip has no notes');
    return;
  }
  if (absoluteNotes.length > MAX_MOTIF_NOTES) {
    emitLibraryAlert(
      'MIDI file is too long',
      `The selected MIDI clip contains ${absoluteNotes.length} notes. `
      + `Motif can import up to ${MAX_MOTIF_NOTES} editable notes. `
      + 'Shorten the clip or split it into smaller phrases, then import it again.',
    );
    return;
  }

  const clipNameRaw = clip.getstring('name');
  const clipName = String(Array.isArray(clipNameRaw) ? clipNameRaw[0] : clipNameRaw || 'Imported Clip').trim()
    || 'Imported Clip';
  let imported: Motif;
  try {
    imported = absoluteNotesToMotif(absoluteNotes, {
      id: 'pending-import',
      name: clipName,
      pitchMode: mode,
      scaleRootNote: hostContext.rootNote,
      scaleIntervals: hostContext.scaleIntervals,
      sourceMeter: { ...hostContext.timeSignature },
      description: `Imported from Live clip “${clipName}” using ${mode} relative analysis.`,
      tags: ['imported', 'live-clip'],
    });
  } catch (reason) {
    emitError(`Clip import failed: ${reason instanceof Error ? reason.message : String(reason)}`);
    return;
  }

  let restoreId = currentMotifId;
  if (editor.isEditing()) {
    restoreId = editor.cancel(store) ?? restoreId;
    if (store.has(restoreId)) currentMotifId = restoreId;
  }

  const id = uniqueAvailableId(uniqueMotifId(clipName, `clip-${Date.now()}`));
  try {
    const motifData = { ...imported, id };
    const errors = store.add(motifData);
    if (errors.length > 0) {
      currentMotifId = store.has(restoreId) ? restoreId : (store.list()[0]?.id ?? DEFAULT_MOTIF_ID);
      listMotifs();
      emitError(errors.join('; '));
      return;
    }
    const edit = editor.begin(store, id, { dirty: true, created: true, sourceId: restoreId });
    if (!edit) {
      store.remove(id);
      currentMotifId = store.has(restoreId) ? restoreId : (store.list()[0]?.id ?? DEFAULT_MOTIF_ID);
      emitError('Could not start editing the imported motif');
      listMotifs();
      return;
    }
    currentMotifId = id;
    listMotifs();
    emitStatus('imported-clip', id, absoluteNotes.length);
  } catch (reason) {
    store.remove(id);
    currentMotifId = store.has(restoreId) ? restoreId : (store.list()[0]?.id ?? DEFAULT_MOTIF_ID);
    editor.abandon();
    listMotifs();
    emitError(`Clip import failed: ${reason instanceof Error ? reason.message : String(reason)}`);
  }
}

/**
 * Check if a value is a record.
 * @param {unknown} value The value to check.
 * @returns {boolean} Whether the value is a record.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Check if a record has a property.
 * @param {Record<string, unknown>} record The record to check.
 * @param {string} key The property name.
 * @returns {boolean} Whether the record has the property.
 */
function hasOwn(record: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key);
}

/**
 * Get a required text value.
 * @param {unknown} value The value to check.
 * @param {string} field The field name.
 * @returns {string | undefined} The text value, or undefined when the value is not a string.
 */
function requiredText(value: unknown, field: string): string | undefined {
  if (!['string', 'number', 'boolean'].includes(typeof value)) {
    emitError(`${field} must be text`);
    return undefined;
  }
  const text = stringAtom(value).trim();
  if (!text) {
    emitError(`${field} cannot be empty`);
    return undefined;
  }
  return text;
}

/**
 * Get an optional finite number value.
 * @param {unknown} value The value to check.
 * @param {string} field The field name.
 * @param {function(number): boolean} predicate The predicate to check.
 * @param {string} requirement The requirement.
 * @returns {number | undefined | false} The number value, or undefined when the value is not a number.
 */
function optionalFiniteNumber(
  value: unknown,
  field: string,
  predicate: (number: number) => boolean = () => true,
  requirement = 'a finite number',
): number | undefined | false {
  if (value === null || value === undefined || value === '') return undefined;
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || !predicate(numeric)) {
    emitError(`${field} must be ${requirement}`);
    return false;
  }
  return numeric;
}

/**
 * Apply motif properties to a value.
 * @param {unknown} value The value to apply the properties to.
 * @returns {boolean} Whether the properties were applied successfully.
 */
function applyMotifProperties(value: unknown): boolean {
  const editable = editableMotif();
  if (!editable) return false;
  if (!isRecord(value)) {
    emitError('Motif properties must be an object');
    emitLibraryState();
    return false;
  }

  if (hasOwn(value, 'id') && stringAtom(value['id']) !== editable.id) {
    emitError('Motif ID is generated and cannot be changed');
    emitLibraryState();
    return false;
  }
  if (hasOwn(value, 'schemaVersion') && Number(value['schemaVersion']) !== editable.schemaVersion) {
    emitError('schemaVersion is read-only');
    emitLibraryState();
    return false;
  }
  if (hasOwn(value, 'length') && Number(value['length']) !== editable.length) {
    emitError('Motif length is derived from note timing and cannot be changed directly');
    emitLibraryState();
    return false;
  }

  let name = editable.name;
  if (hasOwn(value, 'name')) {
    const parsed = requiredText(value['name'], 'Motif name');
    if (parsed === undefined) {
      emitLibraryState();
      return false;
    }
    name = parsed;
  }

  let description = editable.description;
  if (hasOwn(value, 'description')) {
    const parsed = requiredText(value['description'], 'Motif description');
    if (parsed === undefined) {
      emitLibraryState();
      return false;
    }
    description = parsed;
  }

  let pitchMode = editable.pitchMode;
  if (hasOwn(value, 'pitchMode')) {
    const parsed = stringAtom(value['pitchMode']);
    if (parsed !== 'scale' && parsed !== 'chromatic' && parsed !== 'hybrid') {
      emitError('pitchMode must be scale, chromatic, or hybrid');
      emitLibraryState();
      return false;
    }
    pitchMode = parsed;
  }

  let sourceMeter = editable.sourceMeter;
  if (hasOwn(value, 'sourceMeter')) {
    const meter = value['sourceMeter'];
    if (!isRecord(meter)) {
      emitError('sourceMeter must be an object');
      emitLibraryState();
      return false;
    }
    const numerator = Number(meter['numerator']);
    const denominator = Number(meter['denominator']);
    if (!Number.isInteger(numerator) || numerator < 1) {
      emitError('sourceMeter.numerator must be a positive integer');
      emitLibraryState();
      return false;
    }
    if (![1, 2, 4, 8, 16, 32].includes(denominator)) {
      emitError('sourceMeter.denominator must be 1, 2, 4, 8, 16, or 32');
      emitLibraryState();
      return false;
    }
    sourceMeter = { numerator, denominator };
  }

  let defaultGate = editable.defaultGate;
  if (hasOwn(value, 'defaultGate')) {
    const parsed = optionalFiniteNumber(value['defaultGate'], 'defaultGate', (number) => number > 0, 'greater than zero');
    if (parsed === false) {
      emitLibraryState();
      return false;
    }
    defaultGate = parsed;
  }

  let velocityCurve = editable.velocityCurve;
  if (hasOwn(value, 'velocityCurve')) {
    const curve = value['velocityCurve'];
    if (curve === null || curve === undefined) {
      velocityCurve = undefined;
    } else if (!isRecord(curve)) {
      emitError('velocityCurve must be an object');
      emitLibraryState();
      return false;
    } else {
      const parsed: Record<string, number> = {};
      for (const field of ['inputMin', 'inputMax', 'outputMin', 'outputMax'] as const) {
        const number = optionalFiniteNumber(curve[field], `velocityCurve.${field}`);
        if (number === false) {
          emitLibraryState();
          return false;
        }
        if (number !== undefined) parsed[field] = number;
      }
      const exponent = optionalFiniteNumber(
        curve['exponent'],
        'velocityCurve.exponent',
        (number) => number > 0,
        'greater than zero',
      );
      if (exponent === false) {
        emitLibraryState();
        return false;
      }
      if (exponent !== undefined) parsed['exponent'] = exponent;
      velocityCurve = Object.keys(parsed).length > 0 ? parsed : undefined;
    }
  }

  const pitchConverted = pitchMode === editable.pitchMode
    ? editable
    : convertMotifPitchMode(editable, pitchMode, {
        triggerPitch: previewTriggerPitch,
        rootNote: hostContext.rootNote,
        scaleIntervals: hostContext.scaleIntervals,
      });
  const {
    defaultGate: _defaultGate,
    velocityCurve: _velocityCurve,
    ...required
  } = pitchConverted;
  const candidate: Motif = {
    ...required,
    name,
    description,
    pitchMode,
    sourceMeter,
    ...(defaultGate !== undefined ? { defaultGate } : {}),
    ...(velocityCurve !== undefined ? { velocityCurve } : {}),
  };

  if (JSON.stringify(candidate) === JSON.stringify(editable)) return true;
  const errors = store.update(candidate);
  if (errors.length > 0) {
    emitError(errors.join('; '));
    emitLibraryState();
    return false;
  }
  editor.markDirty();
  return true;
}

/**
 * Save the current motif.
 * @param {unknown | undefined} properties The properties to apply.
 * @returns {void}
 */
function save_motif(properties?: unknown): void {
  if (properties !== undefined && !applyMotifProperties(properties)) return;
  if (!userLibraryPath || !userLibraryLoaded) {
    emitError('Choose a valid library folder before saving');
    return;
  }

  const selected = currentMotif();
  if (!selected) {
    emitError('No motif selected');
    return;
  }
  if (!editor.isEditing(selected.id)) {
    emitError('Start editing before saving');
    emitLibraryState();
    return;
  }

  const existingFilename = userLibraryFiles.get(selected.id);
  const filename = existingFilename ?? libraryFilePath(selected.id);
  if (!existingFilename && (isLibraryPathOccupied(filename) || fileExists(filename))) {
    reserveLibraryPath(filename);
    emitError(`Save refused because ${selected.id}.json already exists; refresh the library and try again`);
    emitLibraryState();
    return;
  }

  try {
    writeJsonFile(filename, selected);
    userLibraryFiles.set(selected.id, filename);
    reserveLibraryPath(filename);
    editor.finishSave();
    listMotifs();
    emitStatus('saved', selected.id, filename);
  } catch (reason) {
    emitError(`Save failed: ${reason instanceof Error ? reason.message : String(reason)}`);
    emitLibraryState();
  }
}

/**
 * Get the editable motif.
 * @returns {Motif | undefined} The editable motif.
 */
function editableMotif(): Motif | undefined {
  const selected = currentMotif();
  if (!selected) {
    emitError('No motif selected');
    return undefined;
  }
  if (!editor.isEditing(selected.id)) {
    emitError('Start editing before changing this motif');
    emitLibraryState();
    return undefined;
  }
  return selected;
}

/**
 * Begin editing the current motif.
 * @returns {void}
 */
function begin_edit(): void {
  if (libraryScanning) {
    emitError('Wait for the library scan to finish before editing a motif');
    emitLibraryState();
    return;
  }
  if (editor.isEditing(currentMotifId)) {
    emitLibraryState();
    return;
  }

  const selected = currentMotif();
  const targetId = selected && store.isBuiltin(selected.id)
    ? uniqueAvailableId(uniqueMotifId(selected.name, `${selected.id}-copy`))
    : undefined;
  const editable = editor.begin(store, currentMotifId, targetId ? { targetId } : {});
  if (!editable) {
    emitError('Could not start editing the selected motif');
    return;
  }
  currentMotifId = editable.id;
  listMotifs();
  emitStatus('editing', editable.id, editable.name);
}

/**
 * Cancel editing the current motif.
 * @returns {void}
 */
function cancel_edit(): void {
  const restoredId = editor.cancel(store);
  if (!restoredId) {
    emitLibraryState();
    return;
  }

  currentMotifId = store.has(restoredId) ? restoredId : (store.list()[0]?.id ?? DEFAULT_MOTIF_ID);
  pruneTriggerMap();
  listMotifs();
  emitStatus('editing-cancelled', currentMotifId);
}

/**
 * Edit the current motif.
 * @param {unknown} properties The properties to apply.
 * @returns {void}
 */
function edit_motif(properties: unknown): void {
  if (!applyMotifProperties(properties)) return;
  emitSelectedMotifUi();
  emitStatus('motif-edited', currentMotifId);
}

/**
 * Select a motif from the browser.
 * @param {string} id The stable motif id.
 * @param {number | boolean | undefined} discardChanges The discard changes value.
 * @returns {void}
 */
function select_browser(id: string, discardChanges?: number | boolean): void {
  const item = store.get(String(id));
  if (!item) return;
  if (item.id === currentMotifId) return;

  if (editor.isEditing()) {
    if (editor.isDirty() && !discardAllowed(discardChanges)) {
      emitError('Unsaved edits must be saved or discarded before selecting another motif');
      emitLibraryState();
      return;
    }
    editor.cancel(store);
  }

  const selected = store.get(item.id);
  if (!selected) return;
  currentMotifId = selected.id;
  emit('motif-selected', motifLabels().get(selected.id) ?? selected.name);
  emitSelectedMotifUi();
  emitStatus('Motif', selected.name);
}

function updateNoteAt(index: number, field: NoteEditField, valueValue: unknown): boolean {
  if (!NOTE_EDIT_FIELDS.includes(field)) {
    emitError(`Unknown note field: ${field}`);
    return false;
  }

  const editable = editableMotif();
  if (!editable || editable.notes.length === 0) return false;
  if (!Number.isInteger(index) || index < 0 || index >= editable.notes.length) {
    emitError(`Unknown note row: ${index}`);
    return false;
  }

  const current = editable.notes[index];
  if (!current) return false;
  const next: MotifNote = { ...current };
  let statusValue: unknown = valueValue;

  if (field === 'legato' || field === 'tie') {
    const enabled = valueValue === true || valueValue === 1 || valueValue === '1' || valueValue === 'true';
    if (enabled) next[field] = true;
    else delete next[field];
    statusValue = enabled;
  } else {
    const optional = valueValue === null || valueValue === undefined || valueValue === '';
    const numeric = optional ? undefined : Number(valueValue);
    if (numeric !== undefined && !Number.isFinite(numeric)) {
      emitError(`Invalid ${field} value`);
      return false;
    }

    switch (field) {
      case 'pitch':
        if (numeric === undefined) {
          emitError('pitch cannot be empty');
          return false;
        }
        next.pitch = Math.round(numeric);
        statusValue = next.pitch;
        break;
      case 'accidental':
        if (numeric === undefined || numeric === 0) delete next.accidental;
        else next.accidental = Math.round(numeric);
        statusValue = next.accidental ?? null;
        break;
      case 'at':
        if (numeric === undefined || numeric < 0) {
          emitError('at must be zero or greater');
          return false;
        }
        next.at = Math.round(numeric);
        statusValue = next.at;
        break;
      case 'duration':
        if (numeric === undefined || numeric <= 0) {
          emitError('duration must be greater than zero');
          return false;
        }
        next.duration = Math.round(numeric);
        statusValue = next.duration;
        break;
      case 'gate':
        if (numeric === undefined) delete next.gate;
        else if (numeric <= 0) {
          emitError('gate must be greater than zero');
          return false;
        } else next.gate = numeric;
        statusValue = next.gate ?? null;
        break;
      case 'velocity':
        if (numeric === undefined) delete next.velocity;
        else if (!Number.isInteger(numeric) || numeric < 1 || numeric > 127) {
          emitError('velocity must be an integer between 1 and 127');
          return false;
        } else next.velocity = numeric;
        statusValue = next.velocity ?? null;
        break;
      case 'velocityOffset':
        if (numeric === undefined || numeric === 0) delete next.velocityOffset;
        else next.velocityOffset = numeric;
        statusValue = next.velocityOffset ?? null;
        break;
      case 'velocityScale':
        if (numeric === undefined) delete next.velocityScale;
        else if (numeric < 0) {
          emitError('velocityScale must be zero or greater');
          return false;
        } else next.velocityScale = numeric;
        statusValue = next.velocityScale ?? null;
        break;
      default:
        break;
    }
  }

  const notes = editable.notes.map((note, noteIndex) => (noteIndex === index ? next : note));
  const errors = store.setNotes(editable.id, notes);
  if (errors.length > 0) {
    emitError(errors.join('; '));
    return false;
  }

  editor.markDirty();
  emitSelectedMotifUi();
  emitStatus('note-edited', index, field, statusValue ?? 'unset');
  return true;
}

/**
 * Edit a note at a specific row index of the current motif.
 * @param {number} rowIndexValue The row index of the note.
 * @param {string} fieldValue The field value.
 * @param {unknown} valueValue The value value.
 * @returns {void}
 */
function edit_note_at(rowIndexValue: number, fieldValue: string, valueValue: unknown): void {
  updateNoteAt(Math.round(rowIndexValue), String(fieldValue) as NoteEditField, valueValue);
}

/**
 * Add a note to the current motif.
 * @returns {void}
 */
function add_note(): void {
  const editable = editableMotif();
  if (!editable) return;
  if (editable.notes.length >= MAX_MOTIF_NOTES) {
    emitError(`Maximum ${MAX_MOTIF_NOTES} notes per motif`);
    return;
  }
  const lastAt = editable.notes.at(-1)?.at ?? 0;
  const lastDur = editable.notes.at(-1)?.duration ?? 240;
  const newNote: MotifNote = { pitch: 0, at: lastAt + lastDur, duration: 240 };
  const errors = store.setNotes(editable.id, [...editable.notes, newNote]);
  if (errors.length > 0) {
    emitError(errors.join('; '));
    return;
  }
  editor.markDirty();
  emitSelectedMotifUi();
}

/**
 * Remove a note from the current motif.
 * @param {number} indexValue The index of the note.
 * @returns {void}
 */
function remove_note(indexValue: number): void {
  const editable = editableMotif();
  if (!editable) return;
  const index = Math.round(indexValue);
  if (index < 0 || index >= editable.notes.length) return;
  const notes = editable.notes.filter((_, i) => i !== index);
  const errors = store.setNotes(editable.id, notes);
  if (errors.length > 0) {
    emitError(errors.join('; '));
    return;
  }
  editor.markDirty();
  emitSelectedMotifUi();
}

/**
 * Dispatch a URL-encoded JSON action from `library.html`.
 * The page emits an explicit `lib_action` selector so unrelated jweb messages
 * such as `url` and `title` can never be parsed as actions.
 * @param {unknown[]} encodedParts The Max atoms containing the encoded action.
 * @returns {void}
 */
function lib_action(...encodedParts: unknown[]): void {
  const payloads = flattenValues(encodedParts)
    .map((value) => stringAtom(value))
    .filter(Boolean);
  const encodedJson = payloads[payloads.length - 1];

  if (!encodedJson) {
    emitError('lib_action: missing JSON payload');
    return;
  }

  let action: Record<string, unknown>;
  try {
    action = JSON.parse(decodeURIComponent(encodedJson)) as Record<string, unknown>;
  } catch {
    emitError(`lib_action: invalid JSON (${encodedJson.slice(0, 48)})`);
    return;
  }

  const type = stringAtom(action['type']);
  switch (type) {
    case 'select_browser':
      select_browser(
        stringAtom(action['id']),
        action['discardChanges'] as number | boolean | undefined,
      );
      break;
    case 'filter_motifs':
      filter_motifs(action['query']);
      break;
    case 'import_clip':
      import_clip(action['pitchMode'] !== undefined ? stringAtom(action['pitchMode']) : undefined);
      break;
    case 'save_motif':
      save_motif(action['properties']);
      break;
    case 'refresh_library':
      refresh_library(action['discardChanges'] as number | boolean | undefined);
      break;
    case 'map_trigger':
      map_trigger(
        typeof action['pitch'] === 'number' ? action['pitch'] : stringAtom(action['pitch']),
        stringAtom(action['motifId']),
        stringAtom(action['action'], 'trigger'),
      );
      break;
    case 'unmap_trigger':
      unmap_trigger(
        typeof action['pitch'] === 'number' ? action['pitch'] : stringAtom(action['pitch']),
      );
      break;
    case 'clear_trigger_map':
      clear_trigger_map();
      break;
    case 'begin_edit':
      begin_edit();
      break;
    case 'cancel_edit':
      cancel_edit();
      break;
    case 'edit_motif':
      edit_motif(action['properties']);
      break;
    case 'add_note':
      add_note();
      break;
    case 'remove_note':
      remove_note(Number(action['index']));
      break;
    case 'edit_note_at':
      edit_note_at(Number(action['index']), stringAtom(action['field']), action['value']);
      break;
    default:
      emitError(`lib_action: unknown type ${type}`);
  }
}

/**
 * Panic the device.
 * @returns {void}
 */
function panic(): void {
  stopAllHeldRepeats();
  clearScheduledNotes();
  emitStatus('panic');
}

/**
 * Dump the context.
 * @returns {void}
 */
function dump_context(): void {
  emit(
    'context',
    hostContext.tempo,
    hostContext.rootNote,
    hostContext.scaleName,
    ...hostContext.scaleIntervals,
  );
}

/** Lookup table for {@link dispatch}; keys are Max message selectors. */
const handlers: MotifHandlers = {
  initialize,
  preview_ready,
  library_ready,
  library_prepare,
  web_debug,
  note,
  cc,
  sustain,
  motif,
  pitch_mode,
  invert,
  invert_toggle,
  reverse,
  reverse_toggle,
  meter_mode,
  retrigger,
  trigger_mode,
  launch_quantization,
  pass_through,
  trigger_low,
  trigger_high,
  map_trigger,
  unmap_trigger,
  clear_trigger_map,
  library_path,
  refresh_library,
  tempo_multiplier,
  filter_motifs,
  import_clip,
  save_motif,
  begin_edit,
  cancel_edit,
  edit_motif,
  select_browser,
  lib_action,
  panic,
  list_motifs: listMotifs,
  dump_context,
  song_context,
};

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
 * @returns {void}
 */
export function dispatch(message: string, args: readonly unknown[]): void {
  const handler = (handlers as unknown as Record<string, (...values: unknown[]) => void>)[message];
  if (!handler) {
    emitError(`Unknown message: ${message}`);
    return;
  }

  handler(...args);
}
