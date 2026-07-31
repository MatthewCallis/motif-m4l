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

import {
  absoluteNotesToMotif,
  type AbsoluteNote,
} from '../core/import-notes.js';
import { compileMotif } from '../core/compile-motif.js';
import { clamp } from '../core/math.js';
import { buildMotifPreview } from '../core/preview.js';
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
  type PassThroughPolicy,
  type PitchMode,
  type RetriggerMode,
  type TriggerMode,
} from '../core/types.js';
import { MotifEditorState } from '../library/editor-state.js';
import {
  appendMotifNote,
  applyMotifProperties as buildMotifProperties,
  removeMotifNote,
  updateMotifNote,
  type NoteEditField,
} from '../library/motif-authoring.js';
import { MotifStore } from '../library/store.js';
import {
  DEFAULT_MOTIF_ID,
  MAX_MOTIF_NOTES,
  MIN_REPEAT_DELAY_MS,
  TEMPO_MULTIPLIERS,
  type HeldRepeat,
  type LibraryAlert,
  type MotifHandlers,
  type TriggerMotifOptions,
} from './device-types.js';
import { MotifHotkeyMap } from './hotkey-map.js';
import {
  encodeLibraryStateMessages,
  toLibraryHotkeyData,
  toLibraryNoteData,
} from './library-view.js';
import { readClipNotes, resolveDetailClip } from './live-api.js';
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
} from './max-helpers.js';
import { MaxUserLibrary } from './user-library.js';

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
    pruneTriggerMap();
    store.ensureCurrent(DEFAULT_MOTIF_ID);
    listMotifs();
  },
});

/** MIDI pitch to Library-configured motif/action assignments. */
const hotkeys = new MotifHotkeyMap(store);
/** Trigger pitches retained by the global hold/toggle/latch/release-tail modes. */
const activeTriggers = new Set<number>();
/** Global hold-mode releases deferred until the sustain pedal rises. */
const sustainedReleases = new Set<number>();

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
let previewTriggerPitch = 60;
let previewWasTriggered = false;
let tempoMultiplier = 1;
let browserQuery = '';
let libraryAlert: LibraryAlert | undefined;
let libraryAlertCounter = 0;
/** Monotonic identity used to discard stale state chunks in the Library page. */
let libraryStateTransferCounter = 0;

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
 * Emit the library state through the device's single Max outlet.
 */
function emitLibraryState(): void {
  const normalizedQuery = browserQuery.trim().toLowerCase();
  const matchedIds = new Set(store.filter(browserQuery).map((item) => item.id));
  const items = store.list()
    .filter((item) =>
      !normalizedQuery
      || matchedIds.has(item.id)
      || library.browserFolder(item.id).toLowerCase().includes(normalizedQuery),
    )
    .sort((left, right) =>
      library.browserFolder(left.id).localeCompare(library.browserFolder(right.id))
      || left.name.localeCompare(right.name)
      || left.id.localeCompare(right.id),
    );
  const selected = store.current;
  const selectedIndex = selected ? items.findIndex((item) => item.id === selected.id) : -1;
  const selectedIsEditing = selected ? editor.isEditing(selected.id) : false;
  const nameCounts = new Map<string, number>();
  for (const item of items) nameCounts.set(item.name, (nameCounts.get(item.name) ?? 0) + 1);

  let selectedData: object | null = null;
  if (selected) {
    const notes = selected.notes.map(toLibraryNoteData);
    const preview = buildMotifPreview(
      performanceMotif(selected),
      effectiveHost(),
      previewTriggerPitch,
      pitchModeOverride,
      meterMode,
    );
    const sourceMeter = `${selected.sourceMeter.numerator}/${selected.sourceMeter.denominator}`;
    // Preserve meaningful half-bar values without displaying redundant decimal zeros.
    const barCount = Number.isInteger(preview.bars)
      ? String(preview.bars)
      : preview.bars.toFixed(1).replace(/\.0$/, '');
    const bars = `${barCount} ${preview.bars === 1 ? 'bar' : 'bars'}`;
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
      isPersisted: library.files.has(selected.id),
      folder: library.browserFolder(selected.id),
      hotkeys: hotkeys.forMotif(selected.id).map(toLibraryHotkeyData),
      noteCount: selected.notes.length,
      noteLimit: MAX_MOTIF_NOTES,
      canAddNote: selectedIsEditing && selected.notes.length < MAX_MOTIF_NOTES,
      canRemoveNote: selectedIsEditing && selected.notes.length > 1,
      notes,
    };
  }

  const state = {
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
    alert: libraryAlert ?? null,
    scanProgress: library.scanState
      ? {
          processedEntries: library.scanState.processedEntries,
          loadedMotifs: library.scanState.loadedMotifs,
        }
      : null,
  };
  libraryStateTransferCounter += 1;
  for (const message of encodeLibraryStateMessages(state, libraryStateTransferCounter)) {
    emit('ui', 'lib', message);
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
  const selected = store.current;
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
 */
function emitSelectedMotifUi(): void {
  emitLibraryState();
  emitPreviewState();
}

/**
 * Flush Max `pipe` queues and reset local trigger bookkeeping.
 */
function clearScheduledNotes(): void {
  emit('clear');
  emit('panic');
  activeTriggers.clear();
  sustainedReleases.clear();
}

/**
 * Update the host context based on a Song property and its values.
 * @param {string} property The Song property name.
 * @param {readonly unknown[]} values The atoms emitted for the property.
 */
function song_context(property: string, ...values: unknown[]): void {
  property = String(property);
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
 * List all motifs and emit the corresponding UI state.
 */
function listMotifs(): void {
  store.ensureCurrent(DEFAULT_MOTIF_ID);
  const labels = store.labels();
  emit('motifs-reset');
  for (const item of store.list()) emit('motif-item', labels.get(item.id) ?? item.name);
  emit('motif-selected', labels.get(store.currentId) ?? store.current?.name ?? store.currentId);
  emitSelectedMotifUi();
}

/**
 * Emit the MIDI pass state through the device's single Max outlet.
 */
function emitMidiPassState(): void {
  emit('midi-pass', passThroughPolicy === 'none' ? 0 : 1);
}

/**
 * Emit `status Ready` once so the patch opens the MIDI gate (fail-open until then).
 * Non-note MIDI bypasses JS entirely in the patcher.
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
 */
function preview_ready(): void {
  emitPreviewState();
}

/**
 * Re-send the latest library state after the asynchronous page finishes loading.
 */
function library_ready(): void {
  emitLibraryState();
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
    const absolutePath = prepareLibraryPage(
      __MOTIF_LIBRARY_PAGE_NAME__,
      __MOTIF_LIBRARY_HTML__,
    );
    emit('library-page', absolutePath);
  } catch (reason) {
    emitError(`Library page preparation failed: ${reason instanceof Error ? reason.message : String(reason)}`);
  }
}

/**
 * Decode and mirror embedded-page diagnostics into the Max Console.
 * @param {string} page The embedded page reporting the diagnostic.
 * @param {string} level The diagnostic severity.
 * @param {string} encodedMessage The URL-encoded diagnostic text.
 */
function web_debug(page: string, level: string, encodedMessage: string): void {
  mirrorWebDebug(page, level, encodedMessage);
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
 * Convert one effective motif cycle to a safe Max Task delay.
 * The current tempo multiplier is re-read for every cycle so held repeats
 * follow live tempo changes without rebuilding the active assignment.
 * @param {Motif} motif The motif that will repeat.
 * @returns {number} Repeat interval in milliseconds.
 */
function motifRepeatDelayMilliseconds(motif: Motif): number {
  // Fit-bar mode scales the stored source-meter duration into the current Live bar.
  const effectiveLength = meterMode === 'preserve'
    ? motif.length
    : motif.length * (
        barLengthTicks(hostContext.timeSignature) / barLengthTicks(motif.sourceMeter)
      );
  return Math.max(
    MIN_REPEAT_DELAY_MS,
    ticksToMilliseconds(effectiveLength, effectiveHost().tempo),
  );
}

/**
 * Schedule one MIDI note event through Max `pipe` (delay in milliseconds).
 * @param {number} pitch The MIDI note number.
 * @param {number} velocity The MIDI velocity, or zero for note-off.
 * @param {number} channel The one-based MIDI channel.
 * @param {number} delayMilliseconds The delay before emitting the event.
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
 * Resolve the motif used by a trigger pitch.
 * Trigger hot keys override the current selection; trigger-zone notes use it.
 * @param {number} triggerPitch The incoming MIDI trigger pitch.
 * @returns {string} Stable motif id to play.
 */
function motifIdForTrigger(triggerPitch: number): string {
  const mapping = hotkeys.get(triggerPitch);
  return mapping?.action === 'trigger' ? mapping.motifId : store.currentId;
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
  const selected = store.resolve(motifId);
  if (!selected) {
    emitError(`Unknown motif: ${motifId}`);
    return undefined;
  }

  if (retriggerMode === 'replace' || triggerMode === 'latch') {
    clearScheduledNotes();
  }

  // Update the preview trigger pitch and emit the selected motif UI.
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
  if (pitchModeOverride !== undefined) {
    options.pitchMode = pitchModeOverride;
  }
  // Compile the motif and emit the corresponding MIDI events.
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
 */
function stopHeldRepeat(triggerPitch: number, emitFeedback = true): void {
  const repeat = heldRepeats.get(triggerPitch);
  // If there is no repeat, do nothing.
  if (!repeat) {
    return;
  }
  // Cancel the repeat task.
  repeat.task.cancel();
  repeat.task.freepeer();
  // Delete the repeat from the map.
  heldRepeats.delete(triggerPitch);
  // Delete the pitch from the sustained repeat releases.
  sustainedRepeatReleases.delete(triggerPitch);
  if (emitFeedback) {
    emitStatus('repeat-stopped', repeat.motifId, triggerPitch);
  }
}

/**
 * Cancel every active global hold-repeat task.
 * @param {boolean} emitFeedback Whether each stopped assignment should emit a status.
 */
function stopAllHeldRepeats(emitFeedback = false): void {
  for (const pitch of [...heldRepeats.keys()]) {
    stopHeldRepeat(pitch, emitFeedback);
  }
  sustainedRepeatReleases.clear();
}

/**
 * Play the trigger's resolved motif once and schedule further cycles until note-off.
 * Duplicate note-ons for a physically held key are ignored so controller
 * key-repeat cannot create parallel Max Tasks.
 * @param {number} triggerPitch The MIDI trigger pitch.
 * @param {number} triggerVelocity The original note-on velocity.
 * @param {number} channel The original one-based MIDI channel.
 */
function startHeldRepeat(
  triggerPitch: number,
  triggerVelocity: number,
  channel: number,
): void {
  if (heldRepeats.has(triggerPitch)) return;
  const motifId = motifIdForTrigger(triggerPitch);
  const motif = store.resolve(motifId);
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
    if (heldRepeats.get(triggerPitch) !== repeat) {
      return;
    }
    const repeatedMotif = store.resolve(repeat.motifId);
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
    if (repeatedInstance === undefined || heldRepeats.get(triggerPitch) !== repeat) {
      return;
    }
    repeat.task.schedule(motifRepeatDelayMilliseconds(repeatedMotif));
  });
  repeat = {
    motifId: motif.id,
    velocity: triggerVelocity,
    channel,
    task,
  };
  heldRepeats.set(triggerPitch, repeat);

  const firstDelay = ticksToMilliseconds(firstLaunchOffset, effectiveHost().tempo) + motifRepeatDelayMilliseconds(motif);
  task.schedule(Math.max(MIN_REPEAT_DELAY_MS, firstDelay));
  emitStatus('repeat-started', motif.id, triggerPitch);
}

/**
 * Cancel a trigger and emit the corresponding status message.
 * @param {number} triggerPitch The pitch of the trigger.
 */
function cancelTrigger(triggerPitch: number): void {
  if (!activeTriggers.has(triggerPitch)) {
    return;
  }
  // Cancel the scheduled notes and emit the corresponding status message.
  clearScheduledNotes();
  emitStatus('release', triggerPitch);
}

/**
 * Handle a MIDI note event.
 * @param {number} pitchValue The MIDI note number.
 * @param {number} velocityValue The MIDI velocity, or zero for note-off.
 * @param {number} channelValue The one-based MIDI channel.
 */
function note(pitchValue: number, velocityValue: number, channelValue = 1): void {
  const pitch = Math.round(clamp(pitchValue, 0, 127));
  const velocity = Math.round(clamp(velocityValue, 0, 127));
  const channel = Math.round(clamp(channelValue, 1, 16));
  const mapping = hotkeys.get(pitch);
  const isTrigger = Boolean(mapping)
    || heldRepeats.has(pitch)
    || (pitch >= triggerLow && pitch <= triggerHigh);

  // Dry MIDI passes either unconditionally or only when this note is not a trigger.
  if (passThroughPolicy === 'all' || (passThroughPolicy === 'non-triggers' && !isTrigger)) {
    emitScheduledEvent(pitch, velocity, channel, 0);
  }
  if (!isTrigger) return;

  if (mapping?.action === 'select') {
    if (velocity > 0) {
      select_browser(mapping.motifId);
      if (store.currentId === mapping.motifId) {
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
 */
function sustain(value: number, channel = 1): void {
  cc(64, value, channel);
}

/**
 * Handle a motif selection event.
 * @param {string} value The motif id or display name.
 */
function motif(value: string): void {
  let selected = store.resolve(value);
  if (!selected) {
    emitError(`Unknown motif: ${value}`);
    return;
  }

  if (selected.id === store.currentId) return;

  if (editor.isEditing()) {
    if (editor.isDirty()) {
      emitError('Save or cancel the current edits before selecting another motif');
      emit('motif-selected', store.labels().get(store.currentId) ?? store.current?.name ?? store.currentId);
      emitLibraryState();
      return;
    }
    editor.cancel(store);
    selected = store.resolve(value);
    if (!selected) {
      emitError(`Unknown motif after cancelling edit: ${value}`);
      listMotifs();
      return;
    }
  }

  store.select(selected.id);
  emit('motif-selected', store.labels().get(selected.id) ?? selected.name);
  emitSelectedMotifUi();
  emitStatus('Motif', selected.name);
}

/**
 * Handle a pitch mode event.
 * @param {string} mode The pitch mode.
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
 * Synchronize the visual transform latches with the engine-owned state.
 */
function emitTransformUi(): void {
  emit('ui', 'transforms', invertOffsets ? 1 : 0, reverseNotes ? 1 : 0);
}

/**
 * Handle the performance pitch-inversion toggle.
 * @param {string | number | boolean} value The toggle state.
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
 */
function invert_toggle(): void {
  invert(!invertOffsets);
}

/**
 * Handle the performance note-reversal toggle.
 * @param {string | number | boolean} value The toggle state.
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
 */
function reverse_toggle(): void {
  reverse(!reverseNotes);
}

/**
 * Handle a meter mode event.
 * @param {string} mode The meter mode.
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
 */
function trigger_low(value: number): void {
  triggerLow = Math.min(triggerHigh, Math.round(clamp(value, 0, 127)));
  emitStatus('trigger-zone', triggerLow, triggerHigh);
}

/**
 * Handle a trigger high event.
 * @param {number} value The trigger high value.
 */
function trigger_high(value: number): void {
  triggerHigh = Math.max(triggerLow, Math.round(clamp(value, 0, 127)));
  emitStatus('trigger-zone', triggerLow, triggerHigh);
}

/**
 * Handle a trigger map event.
 * @param {number | string} pitchValue The MIDI pitch or Ableton-style note name.
 * @param {string} motifId The motif id.
 * @param {string} actionValue Whether the note triggers or selects the motif.
 */
function map_trigger(
  pitchValue: number | string,
  motifId: string,
  actionValue = 'trigger',
): void {
  const result = hotkeys.assign(pitchValue, motifId, actionValue);
  if (!result.ok) {
    emitLibraryAlert('Invalid MIDI hot key', result.error);
    return;
  }
  const { pitch, motifId: selectedId, action } = result.assignment;
  stopHeldRepeat(pitch, false);
  emitLibraryState();
  emitStatus('mapped', pitch, selectedId, action);
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
  stopHeldRepeat(pitch, false);
  emitLibraryState();
  emitStatus('unmapped', pitch);
}

/**
 * Clear the trigger map.
 */
function clear_trigger_map(): void {
  for (const pitch of hotkeys.clear()) stopHeldRepeat(pitch, false);
  emitLibraryState();
  emitStatus('map-cleared');
}

/**
 * Remove hot-key assignments whose motifs are no longer in the library.
 */
function pruneTriggerMap(): void {
  for (const pitch of hotkeys.prune()) stopHeldRepeat(pitch, false);
}

/**
 * Handle a library path event.
 * @param {unknown[]} pathParts The path parts.
 */
function library_path(...pathParts: unknown[]): void {
  const nextPath = pathFromAtoms(pathParts);
  if (!nextPath) return;
  if (editor.isDirty()) {
    emitError('Finish or cancel editing before changing the library folder');
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
    emitError('Unsaved edits must be saved or discarded before refreshing');
    emitLibraryState();
    return;
  }

  editor.abandon();
  library.load('library-refreshed');
}

/**
 * Handle a tempo multiplier event.
 * @param {string | number} value The tempo multiplier value.
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

/**
 * Import the selected Detail View MIDI clip into the in-memory store as a new motif.
 * Does not write disk until the user saves; requires a valid LiveAPI clip path.
 * @param {string} pitchModeValue The relative pitch-analysis mode.
 */
function import_clip(pitchModeValue = 'chromatic'): void {
  if (library.scanning) {
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
    });
  } catch (reason) {
    emitError(`Clip import failed: ${reason instanceof Error ? reason.message : String(reason)}`);
    return;
  }

  let restoreId = store.currentId;
  if (editor.isEditing()) {
    restoreId = editor.cancel(store) ?? restoreId;
    store.select(restoreId);
  }

  const id = library.uniqueId(clipName, `clip-${Date.now()}`);
  try {
    const motifData = { ...imported, id };
    const errors = store.add(motifData);
    if (errors.length > 0) {
      if (!store.select(restoreId)) store.ensureCurrent(DEFAULT_MOTIF_ID);
      listMotifs();
      emitError(errors.join('; '));
      return;
    }
    const edit = editor.begin(store, id, { dirty: true, created: true, sourceId: restoreId });
    if (!edit) {
      store.remove(id);
      if (!store.select(restoreId)) store.ensureCurrent(DEFAULT_MOTIF_ID);
      emitError('Could not start editing the imported motif');
      listMotifs();
      return;
    }
    store.select(id);
    listMotifs();
    emitStatus('imported-clip', id, absoluteNotes.length);
  } catch (reason) {
    store.remove(id);
    if (!store.select(restoreId)) store.ensureCurrent(DEFAULT_MOTIF_ID);
    editor.abandon();
    listMotifs();
    emitError(`Clip import failed: ${reason instanceof Error ? reason.message : String(reason)}`);
  }
}

/**
 * Validate and persist authoring properties for the active edit session.
 */
function applyMotifProperties(value: unknown): boolean {
  const editable = editableMotif();
  if (!editable) return false;

  const result = buildMotifProperties(editable, value, {
    triggerPitch: previewTriggerPitch,
    host: hostContext,
  });
  if (!result.ok) {
    emitError(result.error);
    emitLibraryState();
    return false;
  }
  if (!result.changed) return true;

  const errors = store.update(result.value);
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
 */
function save_motif(properties?: unknown): void {
  if (properties !== undefined && !applyMotifProperties(properties)) {
    return;
  }
  if (!library.path || !library.loaded) {
    emitError('Choose a valid library folder before saving');
    return;
  }

  const selected = store.current;
  if (!selected) {
    emitError('No motif selected');
    return;
  }
  if (!editor.isEditing(selected.id)) {
    emitError('Start editing before saving');
    emitLibraryState();
    return;
  }

  try {
    const filename = library.save(selected.id);
    editor.finishSave();
    listMotifs();
    emitStatus('saved', selected.id, filename);
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : String(reason);
    emitError(
      message.includes('already exists')
        ? `Save refused because ${message}`
        : `Save failed: ${message}`,
    );
    emitLibraryState();
  }
}

/**
 * Get the editable motif.
 * @returns {Motif | undefined} The editable motif.
 */
function editableMotif(): Motif | undefined {
  if (!store.current) {
    emitError('No motif selected');
    return undefined;
  }
  const editable = editor.current(store);
  if (!editable || editable.id !== store.currentId) {
    emitError('Start editing before changing this motif');
    emitLibraryState();
    return undefined;
  }
  return editable;
}

/**
 * Begin editing the current motif.
 */
function begin_edit(): void {
  if (library.scanning) {
    emitError('Wait for the library scan to finish before editing a motif');
    emitLibraryState();
    return;
  }
  if (editor.isEditing(store.currentId)) {
    emitLibraryState();
    return;
  }

  const selected = store.current;
  const targetId = selected && store.isBuiltin(selected.id)
    ? library.uniqueId(selected.name, `${selected.id}-copy`)
    : undefined;
  const editable = editor.begin(store, store.currentId, targetId ? { targetId } : {});
  if (!editable) {
    emitError('Could not start editing the selected motif');
    return;
  }
  store.select(editable.id);
  listMotifs();
  emitStatus('editing', editable.id, editable.name);
}

/**
 * Cancel editing the current motif.
 */
function cancel_edit(): void {
  const restoredId = editor.cancel(store);
  if (!restoredId) {
    emitLibraryState();
    return;
  }

  if (!store.select(restoredId)) store.ensureCurrent(DEFAULT_MOTIF_ID);
  pruneTriggerMap();
  listMotifs();
  emitStatus('editing-cancelled', store.currentId);
}

/**
 * Edit the current motif.
 * @param {unknown} properties The properties to apply.
 */
function edit_motif(properties: unknown): void {
  if (!applyMotifProperties(properties)) return;
  emitSelectedMotifUi();
  emitStatus('motif-edited', store.currentId);
}

/**
 * Select a motif from the browser.
 * @param {string} id The stable motif id.
 * @param {number | boolean | undefined} discardChanges The discard changes value.
 */
function select_browser(id: string, discardChanges?: number | boolean): void {
  const item = store.get(String(id));
  if (!item) return;
  if (item.id === store.currentId) return;

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
  store.select(selected.id);
  emit('motif-selected', store.labels().get(selected.id) ?? selected.name);
  emitSelectedMotifUi();
  emitStatus('Motif', selected.name);
}

/**
 * Update a note at a specific row index of the current motif.
 * @param {number} index The index of the note.
 * @param {NoteEditField} field The field to update.
 * @param {unknown} value The value to set.
 * @returns {boolean} Whether the note was updated successfully.
 */
function updateNoteAt(index: number, field: NoteEditField, value: unknown): boolean {
  const editable = editableMotif();
  if (!editable) return false;

  const result = updateMotifNote(editable, index, field, value);
  if (!result.ok) {
    emitError(result.error);
    return false;
  }

  const errors = store.setNotes(editable.id, result.notes);
  if (errors.length > 0) {
    emitError(errors.join('; '));
    return false;
  }

  editor.markDirty();
  emitSelectedMotifUi();
  emitStatus('note-edited', index, field, result.statusValue ?? 'unset');
  return true;
}

/**
 * Edit a note at a specific row index of the current motif.
 * @param {number} rowIndexValue The row index of the note.
 * @param {string} fieldValue The field value.
 * @param {unknown} valueValue The value value.
 */
function edit_note_at(rowIndexValue: number, fieldValue: string, valueValue: unknown): void {
  updateNoteAt(Math.round(rowIndexValue), String(fieldValue) as NoteEditField, valueValue);
}

/**
 * Add a note to the current motif.
 */
function add_note(): void {
  const editable = editableMotif();
  if (!editable) return;
  const result = appendMotifNote(editable, MAX_MOTIF_NOTES);
  if (!result.ok) {
    emitError(result.error);
    return;
  }
  const errors = store.setNotes(editable.id, result.notes);
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
 */
function remove_note(indexValue: number): void {
  // Get the editable motif.
  const editable = editableMotif();
  // If there is no editable motif, do nothing.
  if (!editable) {
    return;
  }
  const index = Math.round(indexValue);
  // Ignore out-of-range indices to prevent crashes.
  if (index < 0 || index >= editable.notes.length) {
    return;
  }
  // Remove the note and update the motif notes.
  const result = removeMotifNote(editable, index);
  if (!result.ok) {
    emitError(result.error);
    return;
  }
  // Update the motif notes in the store.
  const errors = store.setNotes(editable.id, result.notes);
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
 */
function lib_action(...encodedParts: unknown[]): void {
  const payloads = flattenValues(encodedParts)
    .map((value) => stringAtom(value))
    .filter(Boolean);

  // Get the last payload, which is the JSON string.
  const encodedJson = payloads[payloads.length - 1];
  // If there is no JSON string, emit an error.
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
      unmap_trigger(typeof action['pitch'] === 'number' ? action['pitch'] : stringAtom(action['pitch']));
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
 */
function panic(): void {
  stopAllHeldRepeats();
  clearScheduledNotes();
  emitStatus('panic');
}

/**
 * Dump the context.
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
 */
export function dispatch(message: string, args: readonly unknown[]): void {
  const handler = (handlers as unknown as Record<string, (...values: unknown[]) => void>)[message];
  if (!handler) {
    emitError(`Unknown message: ${message}`);
    return;
  }

  handler(...args);
}
