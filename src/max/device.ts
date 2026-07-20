/**
 * Motif Max for Live engine — TypeScript side of `v8 motif-device.js`.
 *
 * ## Message path
 * The hand-written bridge in `scripts/build.ts` exposes a single Max top-level
 * `anything()` that calls {@link dispatch}. Do **not** add per-message global
 * handlers; register new selectors on {@link MotifHandlers} / `handlers`.
 *
 * ## Outlet protocol (outlet 0)
 * All patch feedback is a Max list starting with a selector:
 * - `event <pitch> <velocity> <channel> <delayMs>` — schedule via Max `pipe`
 * - `clear` / `panic` — flush scheduled notes
 * - `status Ready` — opens the fail-open MIDI gate in the patch (`route Ready`)
 * - `status …` / `error <message>` — console / debug
 * - `midi-pass <0|1>` — pass-through gate
 * - `ui <subselector> …` — Presentation / Library window (preview, browser, notes)
 * - `motifs-reset` / `motif-item` / `motif-selected` — motif menu
 * - `context …` — dump_context reply
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
import { buildMotifPreview } from '../core/preview.js';
import { quantizationTicks, ticksUntilNextBoundary } from '../core/timing.js';
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
  /** First load: emit `status Ready`, list motifs, sync UI. */
  initialize: () => void;
  /** Preview jweb loaded and registered its receiveData callback. */
  preview_ready: () => void;
  /** Library jweb loaded and registered its receiveData callback. */
  library_ready: () => void;
  /** Diagnostics emitted by an embedded jweb page. */
  web_debug: (page: string, level: string, encodedMessage: string) => void;
  /** Note-on/off from midiparse; triggers and/or dry pass-through. */
  note: (pitch: number, velocity: number, channel?: number) => void;
  /** Sustain pedal (CC64) and other CCs; only 64 is handled. */
  cc: (controller: number, value: number, channel?: number) => void;
  /** Convenience sustain message → same as `cc 64`. */
  sustain: (value: number, channel?: number) => void;
  /** Select motif by id or display name. */
  motif: (id: string) => void;
  /** Pitch mode override: `motif`|`auto`|`scale`|`chromatic`|`hybrid`. */
  pitch_mode: (mode: string) => void;
  /** `preserve` or `fit-bar`. */
  meter_mode: (mode: string) => void;
  /** `replace`/`1` or `overlap`/`0`. */
  retrigger: (mode: string | number) => void;
  /** `one-shot` | `hold` | `toggle` | `latch` | `release-tail`. */
  trigger_mode: (mode: string) => void;
  /** `immediate` | `1/16` | `1/8` | `1/4` | `bar`. */
  launch_quantization: (value: string) => void;
  /** `none` | `non-triggers` | `all`. */
  pass_through: (value: string) => void;
  /** Inclusive low bound of the keyboard trigger zone. */
  trigger_low: (value: number) => void;
  /** Inclusive high bound of the keyboard trigger zone. */
  trigger_high: (value: number) => void;
  /** Map a MIDI pitch to a specific motif id. */
  map_trigger: (pitch: number, motifId: string) => void;
  unmap_trigger: (pitch: number) => void;
  clear_trigger_map: () => void;
  /** Set user library folder and reload JSON via Max Folder/File. */
  library_path: (...pathParts: unknown[]) => void;
  refresh_library: (discardChanges?: number | boolean) => void;
  /** Device-local BPM multiplier (0.5, 1, 1.5, 2). */
  tempo_multiplier: (value: string | number) => void;
  /** Library browser search string. */
  filter_motifs: (...queryParts: unknown[]) => void;
  /** Import selected Detail View MIDI clip via LiveAPI (`scale`|`chromatic`|`hybrid`). */
  import_clip: (pitchMode?: string) => void;
  /** Write current (cloned if built-in) motif JSON into the user library folder. */
  save_motif: (properties?: unknown) => void;
  /** Clone built-in if needed so the complete motif document can be edited and saved. */
  begin_edit: () => void;
  /** Backward-compatible edit of motif name or description. */
  edit_meta: (field: string, ...textParts: unknown[]) => void;
  /** Atomically edit all non-identity motif properties from the library form. */
  edit_motif: (properties: unknown) => void;
  /** Select a motif by stable id (numeric filtered-list index remains backward compatible). */
  select_browser: (idOrIndex: string | number, discardChanges?: number | boolean) => void;
  /** Exit edit mode, restoring the pre-edit snapshot. */
  cancel_edit: () => void;
  /** Select a note index in the authoring editor (kept for backward compat; UI uses per-row editing). */
  select_note: (index: number) => void;
  /** Edit one field of the selected note. */
  edit_note: (field: string, value: unknown) => void;
  /** Dispatch a URL-encoded JSON action from library.html (select, edit, add, remove note, etc.). */
  lib_action: (...encodedParts: unknown[]) => void;
  /** Flush pipes and clear active trigger state. */
  panic: () => void;
  list_motifs: () => void;
  dump_context: () => void;
  /**
   * Forwarded Song observer property + value(s).
   * Properties: tempo, root_note, scale_mode, scale_name, scale_intervals,
   * signature_numerator, signature_denominator, is_playing, current_song_time.
   */
  song_context: (property: string, ...values: unknown[]) => void;
}

const store = new MotifStore();
const editor = new MotifEditorState();
const userLibraryFiles = new Map<string, string>();
const occupiedLibraryPaths = new Set<string>();
const triggerMap = new Map<number, string>();
const activeTriggers = new Set<number>();
const sustainedReleases = new Set<number>();

let currentMotifId = 'mitsuda-lick';
let pitchModeOverride: PitchMode | undefined;
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
let selectedNoteIndex = 0;

const TEMPO_MULTIPLIERS = [0.5, 1, 1.5, 2] as const;
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
const MAX_NOTE_ROWS = 16;
type NoteEditField = (typeof NOTE_EDIT_FIELDS)[number];

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

/** Song tempo scaled by the device-local BPM multiplier for scheduling/preview. */
function effectiveHost(): HostContext {
  return {
    ...hostContext,
    tempo: hostContext.tempo * tempoMultiplier,
  };
}

/** Send a list on outlet 0 (see file-level outlet protocol). */
function emit(...values: unknown[]): void {
  outlet(0, ...values);
}

function emitStatus(...values: unknown[]): void {
  emit('status', ...values);
}

function emitError(message: string): void {
  emit('error', message);
  error(`Motif: ${message}\n`);
}

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

function resolveMotif(value: string): Motif | undefined {
  const normalized = String(value).trim();
  const direct = store.get(normalized);
  if (direct) return direct;

  const labelMatch = [...motifLabels()].find(([, label]) => label === normalized);
  if (labelMatch) return store.get(labelMatch[0]);

  return store.list().find((item) => item.name === normalized);
}

function currentMotif(): Motif | undefined {
  return store.get(currentMotifId);
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '');
}

function emitLibraryState(): void {
  const items = store.filter(browserQuery);
  const selected = currentMotif();
  const selectedIndex = selected ? items.findIndex((item) => item.id === selected.id) : -1;
  const nameCounts = new Map<string, number>();
  for (const item of items) nameCounts.set(item.name, (nameCounts.get(item.name) ?? 0) + 1);

  let selectedData: object | null = null;
  if (selected) {
    const preview = buildMotifPreview(selected, effectiveHost(), previewTriggerPitch, pitchModeOverride, meterMode);
    const sourceMeter = `${selected.sourceMeter.numerator}/${selected.sourceMeter.denominator}`;
    const tags = selected.metadata?.tags?.join(' · ') ?? 'custom motif';
    const suggested = selected.metadata?.suggestedModes?.join(', ');
    const tagLine = suggested ? `${tags}  •  suggested: ${suggested}` : tags;
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
      metadata: {
        author: selected.metadata?.author ?? '',
        source: selected.metadata?.source ?? '',
        license: selected.metadata?.license ?? '',
        tags: [...(selected.metadata?.tags ?? [])],
        suggestedModes: [...(selected.metadata?.suggestedModes ?? [])],
        pickupTicks: selected.metadata?.pickupTicks ?? null,
      },
      stats,
      tags: tagLine,
      isBuiltin: store.isBuiltin(selected.id),
      isPersisted: userLibraryFiles.has(selected.id),
      notes: selected.notes.map((n) => ({
        pitch: n.pitch,
        accidental: n.accidental ?? null,
        at: n.at,
        duration: n.duration,
        gate: n.gate ?? null,
        velocity: n.velocity ?? null,
        velocityOffset: n.velocityOffset ?? null,
        velocityScale: n.velocityScale ?? null,
        legato: n.legato ?? false,
        tie: n.tie ?? false,
      })),
    };
  }

  const state = {
    query: browserQuery,
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      showId: (nameCounts.get(item.name) ?? 0) > 1,
    })),
    selectedIndex,
    selected: selectedData,
    editing: editor.snapshot(),
    libraryPath: userLibraryPath,
    libraryLoaded: userLibraryLoaded,
  };
  emit('ui', 'lib', encodeURIComponent(JSON.stringify(state)));
}

function emitPreviewState(): void {
  const selected = currentMotif();
  if (!selected) return;
  const preview = buildMotifPreview(selected, effectiveHost(), previewTriggerPitch, pitchModeOverride, meterMode);
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

function emitSelectedMotifUi(): void {
  emitLibraryState();
  emitPreviewState();
}

function flattenValues(values: readonly unknown[]): unknown[] {
  const out: unknown[] = [];
  for (const value of values) {
    if (Array.isArray(value)) out.push(...(value as unknown[]));
    else out.push(value);
  }
  return out;
}

/** Convert a JSON/Max atom to text without accepting object default stringification. */
function stringAtom(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}

function numbers(values: readonly unknown[]): number[] {
  return flattenValues(values)
    .map(Number)
    .filter(Number.isFinite);
}

/** Ask the patch to flush Max `pipe` queues and reset local trigger bookkeeping. */
function clearScheduledNotes(): void {
  emit('clear');
  emit('panic');
  activeTriggers.clear();
  sustainedReleases.clear();
}

/** Apply one Song property from native observers (`song_context`). */
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
      if (wasPlaying && !hostContext.isPlaying) clearScheduledNotes();
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

function song_context(property: string, ...values: unknown[]): void {
  updateHost(String(property), values);
}

function listMotifs(): void {
  const labels = motifLabels();
  emit('motifs-reset');
  for (const item of store.list()) emit('motif-item', labels.get(item.id) ?? item.name);
  emit('motif-selected', labels.get(currentMotifId) ?? currentMotif()?.name ?? currentMotifId);
  emitSelectedMotifUi();
}

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
}

/** Re-send the latest preview after the native jsui renderer initializes or reloads. */
function preview_ready(): void {
  emitPreviewState();
}

/** Re-send the latest library state after the asynchronous jweb page finishes loading. */
function library_ready(): void {
  emitLibraryState();
}

/** Decode and mirror embedded-page diagnostics into the Max Console. */
function web_debug(page: string, level: string, encodedMessage: string): void {
  let message = String(encodedMessage);
  try {
    message = decodeURIComponent(message);
  } catch {
    // Keep the original atom when a malformed diagnostic cannot be decoded.
  }

  const line = `Motif jweb ${String(page)} [${String(level)}] ${message}\n`;
  if (String(level).toLowerCase() === 'error') error(line);
  else post(line);
}

function launchOffsetTicks(): number {
  if (!hostContext.isPlaying || launchQuantization === 'immediate') return 0;
  const grid = quantizationTicks(launchQuantization, hostContext.timeSignature);
  return ticksUntilNextBoundary(Math.max(0, hostContext.currentSongTime * PPQ), grid);
}

/**
 * Schedule one MIDI note event through Max `pipe` (delay in milliseconds).
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

function emitDirectNote(pitch: number, velocity: number, channel: number): void {
  emitScheduledEvent(pitch, velocity, channel, 0);
}

function shouldPassDry(isTrigger: boolean): boolean {
  return passThroughPolicy === 'all' || (passThroughPolicy === 'non-triggers' && !isTrigger);
}

function triggerMotif(triggerPitch: number, triggerVelocity: number, channel: number): number | undefined {
  const motifId = triggerMap.get(triggerPitch) ?? currentMotifId;
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
    launchOffsetTicks: launchOffsetTicks(),
    instanceId,
  };
  if (pitchModeOverride !== undefined) options.pitchMode = pitchModeOverride;

  for (const event of compileMotif(selected, effectiveHost(), options)) {
    emitScheduledEvent(event.pitch, event.velocity, event.channel, event.offsetMs);
  }

  emitStatus('trigger', motifId, triggerPitch, instanceId);
  return instanceId;
}

function cancelTrigger(triggerPitch: number): void {
  if (!activeTriggers.has(triggerPitch)) return;
  clearScheduledNotes();
  emitStatus('release', triggerPitch);
}

function note(pitchValue: number, velocityValue: number, channelValue = 1): void {
  const pitch = Math.round(clamp(pitchValue, 0, 127));
  const velocity = Math.round(clamp(velocityValue, 0, 127));
  const channel = Math.round(clamp(channelValue, 1, 16));
  const isTrigger = triggerMap.has(pitch) || (pitch >= triggerLow && pitch <= triggerHigh);

  if (shouldPassDry(isTrigger)) emitDirectNote(pitch, velocity, channel);
  if (!isTrigger) return;

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

function cc(controllerValue: number, valueValue: number, _channel = 1): void {
  const controller = Math.round(clamp(controllerValue, 0, 127));
  const value = Math.round(clamp(valueValue, 0, 127));
  if (controller !== 64) return;

  const wasDown = sustainDown;
  sustainDown = value >= 64;
  if (wasDown && !sustainDown) {
    if (sustainedReleases.size > 0) clearScheduledNotes();
    sustainedReleases.clear();
  }
  emitStatus('sustain', sustainDown ? 'on' : 'off');
}

function sustain(value: number, channel = 1): void {
  cc(64, value, channel);
}

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
  selectedNoteIndex = 0;
  emit('motif-selected', motifLabels().get(selected.id) ?? selected.name);
  emitSelectedMotifUi();
  emitStatus('Motif', selected.name);
}

function pitch_mode(mode: string): void {
  // `motif` = use the phrase’s stored pitch mode; accept legacy `auto` from older patches.
  if (mode === 'motif' || mode === 'auto') pitchModeOverride = undefined;
  else if (mode === 'scale' || mode === 'chromatic' || mode === 'hybrid') pitchModeOverride = mode;
  else {
    emitError(`Unknown pitch mode: ${mode}`);
    return;
  }
  emitSelectedMotifUi();
  emitStatus('Pitch', mode === 'auto' ? 'motif' : mode);
}

function meter_mode(mode: string): void {
  if (mode !== 'preserve' && mode !== 'fit-bar') {
    emitError(`Unknown meter mode: ${mode}`);
    return;
  }
  meterMode = mode;
  emitSelectedMotifUi();
  emitStatus('Meter', mode);
}

function retrigger(mode: string | number): void {
  if (mode === 1 || mode === 'replace') retriggerMode = 'replace';
  else if (mode === 0 || mode === 'overlap') retriggerMode = 'overlap';
  else {
    emitError(`Unknown retrigger mode: ${String(mode)}`);
    return;
  }
  emitStatus('retrigger', retriggerMode);
}

function trigger_mode(mode: string): void {
  const valid: TriggerMode[] = ['one-shot', 'hold', 'toggle', 'latch', 'release-tail'];
  if (!valid.includes(mode as TriggerMode)) {
    emitError(`Unknown trigger mode: ${mode}`);
    return;
  }
  triggerMode = mode as TriggerMode;
  emitStatus('trigger-mode', triggerMode);
}

function launch_quantization(value: string): void {
  const valid: LaunchQuantization[] = ['immediate', '1/16', '1/8', '1/4', 'bar'];
  if (!valid.includes(value as LaunchQuantization)) {
    emitError(`Unknown launch quantization: ${value}`);
    return;
  }
  launchQuantization = value as LaunchQuantization;
  emitStatus('quantization', launchQuantization);
}

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

function trigger_low(value: number): void {
  triggerLow = Math.min(triggerHigh, Math.round(clamp(value, 0, 127)));
  emitStatus('trigger-zone', triggerLow, triggerHigh);
}

function trigger_high(value: number): void {
  triggerHigh = Math.max(triggerLow, Math.round(clamp(value, 0, 127)));
  emitStatus('trigger-zone', triggerLow, triggerHigh);
}

function map_trigger(pitchValue: number, motifId: string): void {
  const pitch = Math.round(clamp(pitchValue, 0, 127));
  const selected = resolveMotif(motifId);
  if (!selected) {
    emitError(`Cannot map ${pitch}: unknown motif ${motifId}`);
    return;
  }
  triggerMap.set(pitch, selected.id);
  emitStatus('mapped', pitch, motifId);
}

function unmap_trigger(pitchValue: number): void {
  const pitch = Math.round(clamp(pitchValue, 0, 127));
  triggerMap.delete(pitch);
  emitStatus('unmapped', pitch);
}

function clear_trigger_map(): void {
  triggerMap.clear();
  emitStatus('map-cleared');
}

function readJsonFile(filename: string): unknown {
  const file = new File(filename, 'read');
  if (!file.isopen) throw new Error('could not open file');
  try {
    return JSON.parse(file.readstring(file.eof));
  } finally {
    file.close();
  }
}

function writeJsonFile(filename: string, value: unknown): void {
  const file = new File(filename, 'write');
  if (!file.isopen) throw new Error('could not open file for write');
  try {
    file.writestring(`${JSON.stringify(value, null, 2)}\n`);
  } finally {
    file.close();
  }
}

function libraryFilePath(id: string): string {
  const separator = userLibraryPath.endsWith('/') || userLibraryPath.endsWith(':') ? '' : '/';
  return `${userLibraryPath}${separator}${id}.json`;
}

/** Normalize a local path for collision checks on Live's commonly case-insensitive hosts. */
function canonicalLibraryPath(filename: string): string {
  return filename.replace(/\\/g, '/').replace(/\/{2,}/g, '/').toLowerCase();
}

function reserveLibraryPath(filename: string): void {
  occupiedLibraryPaths.add(canonicalLibraryPath(filename));
}

function isLibraryPathOccupied(filename: string): boolean {
  return occupiedLibraryPaths.has(canonicalLibraryPath(filename));
}

function fileExists(filename: string): boolean {
  const file = new File(filename, 'read');
  const exists = file.isopen;
  if (exists) file.close();
  return exists;
}

/** Allocate an id that cannot overwrite either a loaded motif or any scanned JSON filename. */
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

function loadUserLibrary(): boolean {
  store.resetToBuiltins();
  userLibraryFiles.clear();
  occupiedLibraryPaths.clear();
  userLibraryLoaded = false;
  if (!userLibraryPath) return false;

  const folder = new Folder(userLibraryPath);
  if (!folder.pathname) {
    folder.close();
    emitError(`Library folder not found: ${userLibraryPath}`);
    return false;
  }

  while (!folder.end) {
    const filename = folder.filename;
    if (filename.toLowerCase().endsWith('.json')) {
      const separator = folder.pathname.endsWith('/') || folder.pathname.endsWith(':') ? '' : '/';
      const fullPath = `${folder.pathname}${separator}${filename}`;
      reserveLibraryPath(fullPath);
      try {
        const result = validateMotif(readJsonFile(fullPath));
        if (!result.valid || !result.motif) {
          emitError(`${filename}: ${result.errors.join('; ')}`);
        } else if (store.isBuiltin(result.motif.id)) {
          emitError(`${filename}: id “${result.motif.id}” conflicts with a built-in and was skipped`);
        } else if (userLibraryFiles.has(result.motif.id)) {
          emitError(`${filename}: duplicate motif id “${result.motif.id}” was skipped`);
        } else {
          const errors = store.add(result.motif);
          if (errors.length > 0) emitError(`${filename}: ${errors.join('; ')}`);
          else userLibraryFiles.set(result.motif.id, fullPath);
        }
      } catch (reason) {
        emitError(`${filename}: ${reason instanceof Error ? reason.message : String(reason)}`);
      }
    }
    folder.next();
  }
  folder.close();
  userLibraryLoaded = true;
  return true;
}

function pathFromAtoms(values: readonly unknown[]): string {
  return flattenValues(values)
    .map((value) => stringAtom(value))
    .filter(Boolean)
    .join(' ')
    .trim()
    .replace(/^"|"$/g, '');
}

function discardAllowed(value: number | boolean | undefined): boolean {
  return value === true || value === 1;
}

function library_path(...pathParts: unknown[]): void {
  const nextPath = pathFromAtoms(pathParts);
  if (!nextPath) return;
  if (editor.isDirty()) {
    emitError('Finish or cancel editing before changing the library folder');
    emitLibraryState();
    return;
  }

  if (nextPath === userLibraryPath && userLibraryLoaded) {
    emitLibraryState();
    return;
  }

  editor.abandon();
  userLibraryPath = nextPath;
  const loaded = loadUserLibrary();
  if (!store.get(currentMotifId)) currentMotifId = store.list()[0]?.id ?? 'mitsuda-lick';
  selectedNoteIndex = 0;
  listMotifs();
  emitStatus(loaded ? 'library' : 'library-unavailable', userLibraryPath);
}

function refresh_library(discardChanges?: number | boolean): void {
  if (editor.isDirty() && !discardAllowed(discardChanges)) {
    emitError('Unsaved edits must be saved or discarded before refreshing');
    emitLibraryState();
    return;
  }

  editor.abandon();
  const loaded = loadUserLibrary();
  if (!store.get(currentMotifId)) currentMotifId = store.list()[0]?.id ?? 'mitsuda-lick';
  selectedNoteIndex = 0;
  listMotifs();
  emitStatus(loaded ? 'library-refreshed' : 'library-unavailable', store.list().length);
}

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

/** Max textedit / empty-clear noise that must mean “show all”, not a literal query. */
const FILTER_NOISE = new Set(['', 'set', 'text', 'clear', 'bang', 'symbol', 'undefined', 'null']);

function filter_motifs(...queryParts: unknown[]): void {
  const raw = flattenValues(queryParts)
    .map(String)
    .map((part) => part.trim())
    .filter((part) => !FILTER_NOISE.has(part.toLowerCase()))
    .join(' ')
    .trim();
  browserQuery = raw;
  emitLibraryState();
  emitStatus('filter', browserQuery || '(all)');
}

// --- Clip import (LiveAPI only; Song state stays on native observers) ---
// @see https://docs.cycling74.com/apiref/js/liveapi/
// @see https://docs.cycling74.com/userguide/m4l/live_api_overview/

function liveApiId(api: LiveAPI): string {
  return String(api.id ?? '');
}

function isLiveApiValid(api: LiveAPI | undefined): api is LiveAPI {
  if (!api) return false;
  const id = liveApiId(api);
  return id !== '' && id !== '0' && id !== 'id 0';
}

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

function isMidiClip(api: LiveAPI): boolean {
  try {
    if (liveTruthy(api.get('is_midi_clip'))) return true;
    // Some Live builds expose only the inverse audio flag on clips.
    if (liveTruthy(api.get('is_audio_clip'))) return false;
  } catch {
    // Property missing — assume MIDI and let note read fail soft.
  }
  return true;
}

/**
 * Prefer Detail View clip (`live_set view detail_clip`), else highlighted slot clip.
 * Returns undefined when nothing is selected or LiveAPI is unavailable.
 */
function resolveDetailClip(): LiveAPI | undefined {
  if (typeof LiveAPI === 'undefined') return undefined;

  try {
    const detail = new LiveAPI('live_set view detail_clip');
    if (isLiveApiValid(detail) && isMidiClip(detail)) return detail;
  } catch {
    // detail_clip path unavailable
  }

  try {
    const slot = new LiveAPI('live_set view highlighted_clip_slot');
    if (!isLiveApiValid(slot) || !liveTruthy(slot.get('has_clip'))) return undefined;
    const clip = new LiveAPI('live_set view highlighted_clip_slot clip');
    if (isLiveApiValid(clip) && isMidiClip(clip)) return clip;
  } catch {
    // No highlighted clip slot / empty slot.
  }

  return undefined;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

/**
 * Live 11+ `get_notes_extended` returns a JSON string from Max JS LiveAPI.
 * Also accept already-parsed objects and Max Dict-like values with stringify().
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

function parseClipNotesLegacy(raw: unknown): AbsoluteNote[] {
  const values = flattenValues(Array.isArray(raw) ? raw : [raw]).map((value) => {
    const asNumber = Number(value);
    return Number.isFinite(asNumber) ? asNumber : value;
  });

  // Expected: notes <count> <pitch> <time> <duration> <velocity> <muted> ...
  let index = 0;
  if (String(values[0]) === 'notes') index = 1;
  const count = Number(values[index]);
  if (!Number.isFinite(count) || count <= 0) return [];
  index += 1;

  const notes: AbsoluteNote[] = [];
  for (let noteIndex = 0; noteIndex < count; noteIndex += 1) {
    const pitch = Number(values[index]);
    const time = Number(values[index + 1]);
    const duration = Number(values[index + 2]);
    const velocity = Number(values[index + 3]);
    const muted = Number(values[index + 4]);
    index += 5;
    if (!Number.isFinite(pitch) || !Number.isFinite(time) || !Number.isFinite(duration)) continue;
    if (muted === 1) continue;
    notes.push({
      at: Math.round(time * PPQ),
      duration: Math.max(1, Math.round(duration * PPQ)),
      pitch: Math.round(pitch),
      velocity: Math.round(clamp(Number.isFinite(velocity) ? velocity : 100, 1, 127)),
    });
  }
  return notes;
}

/**
 * Read notes from a Live MIDI clip. Prefer `get_notes_extended`; fall back to `get_notes`.
 * Beat times are converted to motif PPQ ticks.
 */
function readClipNotes(clip: LiveAPI): AbsoluteNote[] {
  try {
    // get_notes_extended(from_pitch, pitch_span, from_time, time_span) — returns JSON string in Max JS.
    const extended = clip.call('get_notes_extended', 0, 127, 0, 4096);
    const fromExtended = parseClipNotesExtended(extended);
    if (fromExtended.length > 0) return fromExtended;
  } catch {
    // Older Live builds may not expose get_notes_extended.
  }

  try {
    // get_notes(from_time, time_span, from_pitch, pitch_span)
    const legacy = clip.call('get_notes', 0, 4096, 0, 127);
    return parseClipNotesLegacy(legacy);
  } catch (reason) {
    throw new Error(
      `Could not read clip notes: ${reason instanceof Error ? reason.message : String(reason)}`,
    );
  }
}

/**
 * Import the selected Detail View MIDI clip into the in-memory store as a new motif.
 * Does not write disk until the user saves; requires a valid LiveAPI clip path.
 */
function import_clip(pitchModeValue = 'chromatic'): void {
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
    emitError('No clip selected — open a MIDI clip in Detail View, then Import Clip');
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

  const clipNameRaw = clip.get('name');
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
      currentMotifId = store.has(restoreId) ? restoreId : (store.list()[0]?.id ?? 'mitsuda-lick');
      listMotifs();
      emitError(errors.join('; '));
      return;
    }
    const edit = editor.begin(store, id, { dirty: true, created: true, sourceId: restoreId });
    if (!edit) {
      store.remove(id);
      currentMotifId = store.has(restoreId) ? restoreId : (store.list()[0]?.id ?? 'mitsuda-lick');
      emitError('Could not start editing the imported motif');
      listMotifs();
      return;
    }
    currentMotifId = id;
    selectedNoteIndex = 0;
    listMotifs();
    emitStatus('imported-clip', id, absoluteNotes.length);
  } catch (reason) {
    store.remove(id);
    currentMotifId = store.has(restoreId) ? restoreId : (store.list()[0]?.id ?? 'mitsuda-lick');
    editor.abandon();
    listMotifs();
    emitError(`Clip import failed: ${reason instanceof Error ? reason.message : String(reason)}`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasOwn(record: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key);
}

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

function optionalText(value: unknown, field: string): string | undefined | false {
  if (value === null || value === undefined || value === '') return undefined;
  if (!['string', 'number', 'boolean'].includes(typeof value)) {
    emitError(`${field} must be text`);
    return false;
  }
  const text = stringAtom(value).trim();
  return text || undefined;
}

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

function stringList(value: unknown, field: string): string[] | undefined {
  const values: unknown[] | undefined = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/[\n,]/)
      : undefined;
  if (!values || values.some((item) => typeof item !== 'string')) {
    emitError(`${field} must be a list of text values`);
    return undefined;
  }
  return [...new Set(values.map((item) => String(item).trim()).filter(Boolean))];
}

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

  let metadata = editable.metadata;
  if (hasOwn(value, 'metadata')) {
    const input = value['metadata'];
    if (input === null || input === undefined) {
      metadata = undefined;
    } else if (!isRecord(input)) {
      emitError('metadata must be an object');
      emitLibraryState();
      return false;
    } else {
      const author = optionalText(input['author'], 'metadata.author');
      const source = optionalText(input['source'], 'metadata.source');
      const license = optionalText(input['license'], 'metadata.license');
      if (author === false || source === false || license === false) {
        emitLibraryState();
        return false;
      }
      const tags = stringList(input['tags'] ?? [], 'metadata.tags');
      const suggestedModes = stringList(input['suggestedModes'] ?? [], 'metadata.suggestedModes');
      if (!tags || !suggestedModes) {
        emitLibraryState();
        return false;
      }
      const pickupTicks = optionalFiniteNumber(
        input['pickupTicks'],
        'metadata.pickupTicks',
        (number) => number >= 0,
        'zero or greater',
      );
      if (pickupTicks === false) {
        emitLibraryState();
        return false;
      }
      const nextMetadata = {
        ...(author !== undefined ? { author } : {}),
        ...(source !== undefined ? { source } : {}),
        ...(license !== undefined ? { license } : {}),
        ...(tags.length > 0 ? { tags } : {}),
        ...(suggestedModes.length > 0 ? { suggestedModes } : {}),
        ...(pickupTicks !== undefined ? { pickupTicks } : {}),
      };
      metadata = Object.keys(nextMetadata).length > 0 ? nextMetadata : undefined;
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
    metadata: _metadata,
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
    ...(metadata !== undefined ? { metadata } : {}),
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

function begin_edit(): void {
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
  selectedNoteIndex = 0;
  listMotifs();
  emitStatus('editing', editable.id, editable.name);
}

function cancel_edit(): void {
  const restoredId = editor.cancel(store);
  if (!restoredId) {
    emitLibraryState();
    return;
  }

  currentMotifId = store.has(restoredId) ? restoredId : (store.list()[0]?.id ?? 'mitsuda-lick');
  selectedNoteIndex = 0;
  listMotifs();
  emitStatus('editing-cancelled', currentMotifId);
}

function edit_motif(properties: unknown): void {
  if (!applyMotifProperties(properties)) return;
  emitSelectedMotifUi();
  emitStatus('motif-edited', currentMotifId);
}

function edit_meta(fieldValue: string, ...textParts: unknown[]): void {
  const field = String(fieldValue);
  if (field !== 'name' && field !== 'description') {
    emitError(`Unknown meta field: ${field}`);
    return;
  }

  const value = flattenValues(textParts).map(String).join(' ').trim().replace(/^"|"$/g, '');
  if (!applyMotifProperties({ [field]: value })) return;
  emitSelectedMotifUi();
  emitStatus('meta-edited', field, currentMotif()?.name ?? '');
}

function select_browser(idOrIndex: string | number, discardChanges?: number | boolean): void {
  const items = store.filter(browserQuery);
  const item = typeof idOrIndex === 'number'
    ? items[Math.round(clamp(idOrIndex, 0, Math.max(0, items.length - 1)))]
    : store.get(String(idOrIndex));
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
  selectedNoteIndex = 0;
  emit('motif-selected', motifLabels().get(selected.id) ?? selected.name);
  emitSelectedMotifUi();
  emitStatus('Motif', selected.name);
}

function select_note(indexValue: number): void {
  const selected = currentMotif();
  if (!selected || selected.notes.length === 0) return;
  selectedNoteIndex = Math.round(clamp(indexValue, 0, selected.notes.length - 1));
  const note = selected.notes[selectedNoteIndex];
  if (!note) return;
  emitLibraryState();
  emitStatus('note-selected', selectedNoteIndex);
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

function edit_note(fieldValue: string, valueValue: unknown): void {
  const selected = currentMotif();
  if (!selected || selected.notes.length === 0) return;
  const index = Math.round(clamp(selectedNoteIndex, 0, selected.notes.length - 1));
  if (updateNoteAt(index, String(fieldValue) as NoteEditField, valueValue)) {
    selectedNoteIndex = index;
  }
}

function edit_note_at(rowIndexValue: number, fieldValue: string, valueValue: unknown): void {
  updateNoteAt(Math.round(rowIndexValue), String(fieldValue) as NoteEditField, valueValue);
}

function add_note(): void {
  const editable = editableMotif();
  if (!editable) return;
  if (editable.notes.length >= MAX_NOTE_ROWS) {
    emitError(`Maximum ${MAX_NOTE_ROWS} notes per motif`);
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
        action['id'] !== undefined ? stringAtom(action['id']) : Number(action['index']),
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
      save_motif(
        action['properties']
        ?? (action['name'] !== undefined || action['description'] !== undefined
          ? {
              ...(action['name'] !== undefined ? { name: action['name'] } : {}),
              ...(action['description'] !== undefined ? { description: action['description'] } : {}),
            }
          : undefined),
      );
      break;
    case 'refresh_library':
      refresh_library(action['discardChanges'] as number | boolean | undefined);
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
    case 'edit_meta':
      edit_meta(stringAtom(action['field']), action['value']);
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

function panic(): void {
  clearScheduledNotes();
  emitStatus('panic');
}

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
  web_debug,
  note,
  cc,
  sustain,
  motif,
  pitch_mode,
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
  edit_meta,
  select_browser,
  select_note,
  edit_note,
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
 * Unknown selectors emit an error — they are not silently ignored.
 *
 * @see https://docs.cycling74.com/apiref/js/jsthis/
 * @param message - Max `messagename` (selector after `prepend`)
 * @param args - Remaining list atoms from `arrayfromargs(arguments)`
 */
export function dispatch(message: string, args: readonly unknown[]): void {
  const handler = (handlers as unknown as Record<string, (...values: unknown[]) => void>)[message];
  if (!handler) {
    emitError(`Unknown message: ${message}`);
    return;
  }

  handler(...args);
}
