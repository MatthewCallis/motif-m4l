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

import { absoluteNotesToMotif, type AbsoluteNote } from '../core/import-notes.js';
import { compileMotif } from '../core/compile-motif.js';
import { clamp } from '../core/math.js';
import { buildMotifPreview, midiNoteName } from '../core/preview.js';
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
import { MotifStore } from '../library/store.js';

/**
 * Absolute directory path of the patcher (trailing slash included).
 * Captured at the top level of the Max bridge script where `patcher` is in scope.
 * Undefined in test/Node environments where the Max bridge is absent.
 */
declare const _patcherDir: string | undefined;

/**
 * Symbolic messages the Max patch may send to `v8` (via `prepend <name>`).
 * Keep in sync with `tests/max-handler-contract.test.ts` and the patch generator.
 */
interface MotifHandlers {
  /** First load: emit `status Ready`, list motifs, sync UI. */
  initialize: () => void;
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
  library_path: (path: string) => void;
  refresh_library: () => void;
  /** Device-local BPM multiplier (0.5, 1, 1.5, 2). */
  tempo_multiplier: (value: string | number) => void;
  /** Library browser search string. */
  filter_motifs: (...queryParts: unknown[]) => void;
  /** Import selected Detail View MIDI clip via LiveAPI (`scale`|`chromatic`|`hybrid`). */
  import_clip: (pitchMode?: string) => void;
  /** Write current (cloned if built-in) motif JSON into the user library folder. */
  save_motif: () => void;
  /** Clone built-in if needed so name/description/notes can be edited and saved. */
  begin_edit: () => void;
  /** Edit motif name or description (`name` | `description` + text atoms). */
  edit_meta: (field: string, ...textParts: unknown[]) => void;
  /** Select a motif from the browser umenu by filtered-list index. */
  select_browser: (index: number) => void;
  /** Select a note index in the authoring editor (kept for backward compat; UI uses per-row editing). */
  select_note: (index: number) => void;
  /** Edit one field of the selected note: pitch|accidental|at|duration|gate|velocity. */
  edit_note: (field: string, value: number) => void;
  /** Dispatch a URL-encoded JSON action from library.html (select, edit, add, remove note, etc.). */
  lib_action: (encodedJson: string) => void;
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
let previewTriggerPitch = 60;
let previewWasTriggered = false;
let tempoMultiplier = 1;
let browserQuery = '';
let selectedNoteIndex = 0;

const TEMPO_MULTIPLIERS = [0.5, 1, 1.5, 2] as const;
const NOTE_EDIT_FIELDS = ['pitch', 'accidental', 'at', 'duration', 'gate', 'velocity'] as const;
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

function resolveMotif(value: string): Motif | undefined {
  const normalized = String(value).trim();
  return store.get(normalized) ?? store.list().find((item) => item.name === normalized);
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
      name: selected.name,
      description: selected.description ?? '',
      stats,
      tags: tagLine,
      isBuiltin: store.isBuiltin(selected.id),
      notes: selected.notes.map((n) => ({
        pitch: n.pitch,
        accidental: n.accidental ?? 0,
        at: n.at,
        duration: n.duration,
        gate: n.gate ?? selected.defaultGate ?? 1,
        velocity: n.velocity ?? 0,
      })),
    };
  }

  const state = {
    query: browserQuery,
    items: items.map((item) => ({ id: item.id, name: item.name })),
    selectedIndex: selectedIndex >= 0 ? selectedIndex : 0,
    selected: selectedData,
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
  emit('motifs-reset');
  for (const item of store.list()) emit('motif-item', item.name);
  emit('motif-selected', currentMotif()?.name ?? currentMotifId);
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
    // Emit file:// URLs so each jweb can load its HTML.  patcher.filepath (captured in the
    // bridge as _patcherDir) is the absolute directory of Motif.maxpat — same folder as the
    // HTML files.  Falls through silently in test/Node environments where _patcherDir is absent.
    const dir = typeof _patcherDir === 'string' ? _patcherDir : '';
    if (dir) {
      emit('ui', 'preview-url', `file://${dir}preview.html`);
      emit('ui', 'lib-url', `file://${dir}library.html`);
    }
  }
  listMotifs();
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
  const selected = resolveMotif(value);
  if (!selected) {
    emitError(`Unknown motif: ${value}`);
    return;
  }
  currentMotifId = selected.id;
  selectedNoteIndex = 0;
  emit('motif-selected', selected.name);
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

function loadUserLibrary(): void {
  store.resetToBuiltins();
  if (!userLibraryPath) return;

  const folder = new Folder(userLibraryPath);
  if (folder.end && folder.count === 0) {
    folder.close();
    emitError(`Library folder not found: ${userLibraryPath}`);
    return;
  }

  while (!folder.end) {
    const filename = folder.filename;
    if (filename.toLowerCase().endsWith('.json')) {
      const separator = folder.pathname.endsWith('/') || folder.pathname.endsWith(':') ? '' : '/';
      const fullPath = `${folder.pathname}${separator}${filename}`;
      try {
        const errors = store.add(readJsonFile(fullPath));
        if (errors.length > 0) emitError(`${filename}: ${errors.join('; ')}`);
      } catch (reason) {
        emitError(`${filename}: ${reason instanceof Error ? reason.message : String(reason)}`);
      }
    }
    folder.next();
  }
  folder.close();
}

function library_path(path: string): void {
  userLibraryPath = String(path);
  loadUserLibrary();
  if (!store.get(currentMotifId)) currentMotifId = store.list()[0]?.id ?? 'mitsuda-lick';
  listMotifs();
  emitStatus('library', userLibraryPath || 'built-ins');
}

function refresh_library(): void {
  loadUserLibrary();
  listMotifs();
  emitStatus('library-refreshed', store.list().length);
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
function import_clip(pitchModeValue = 'hybrid'): void {
  const mode = String(pitchModeValue || 'hybrid');
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
  const id = `clip-${Date.now()}`;

  try {
    const motifData = absoluteNotesToMotif(absoluteNotes, {
      id,
      name: clipName,
      pitchMode: mode,
      scaleIntervals: hostContext.scaleIntervals,
      sourceMeter: { ...hostContext.timeSignature },
      description: `Imported from Live clip “${clipName}” using ${mode} relative analysis.`,
      tags: ['imported', 'live-clip'],
    });
    const errors = store.add(motifData);
    if (errors.length > 0) {
      emitError(errors.join('; '));
      return;
    }
    currentMotifId = id;
    selectedNoteIndex = 0;
    listMotifs();
    emitStatus('imported-clip', id, absoluteNotes.length);
  } catch (reason) {
    emitError(`Clip import failed: ${reason instanceof Error ? reason.message : String(reason)}`);
  }
}

function save_motif(): void {
  if (!userLibraryPath) {
    emitError('Choose a library folder before saving');
    return;
  }

  let selected = currentMotif();
  if (!selected) {
    emitError('No motif selected');
    return;
  }

  if (store.isBuiltin(selected.id)) {
    const clone = store.cloneAsUser(selected.id);
    if (!clone) {
      emitError('Could not clone built-in motif for save');
      return;
    }
    currentMotifId = clone.id;
    selected = clone;
    listMotifs();
  }

  try {
    writeJsonFile(libraryFilePath(selected.id), selected);
    emitStatus('saved', selected.id, libraryFilePath(selected.id));
  } catch (reason) {
    emitError(`Save failed: ${reason instanceof Error ? reason.message : String(reason)}`);
  }
}

function ensureEditableMotif(): Motif | undefined {
  const selected = currentMotif();
  if (!selected) {
    emitError('No motif selected');
    return undefined;
  }
  if (!store.isBuiltin(selected.id)) return selected;

  const clone = store.cloneAsUser(selected.id);
  if (!clone) {
    emitError('Could not clone built-in motif for editing');
    return undefined;
  }
  currentMotifId = clone.id;
  listMotifs();
  return clone;
}

function begin_edit(): void {
  const editable = ensureEditableMotif();
  if (!editable) return;
  emitStatus('editing', editable.id, editable.name);
}

function edit_meta(fieldValue: string, ...textParts: unknown[]): void {
  const field = String(fieldValue);
  if (field !== 'name' && field !== 'description') {
    emitError(`Unknown meta field: ${field}`);
    return;
  }

  const editable = ensureEditableMotif();
  if (!editable) return;

  const text = flattenValues(textParts).map(String).join(' ').trim().replace(/^"|"$/g, '');
  const next =
    field === 'name'
      ? { ...editable, name: text || editable.name }
      : { ...editable, description: text };

  const errors = store.update(next);
  if (errors.length > 0) {
    emitError(errors.join('; '));
    return;
  }

  emit('motif-selected', next.name);
  emitSelectedMotifUi();
  emitStatus('meta-edited', field, next.name);
}

function select_browser(indexValue: number): void {
  const items = store.filter(browserQuery);
  if (items.length === 0) return;
  const index = Math.round(clamp(indexValue, 0, items.length - 1));
  const item = items[index];
  if (!item) return;
  motif(item.name);
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

function edit_note(fieldValue: string, valueValue: number): void {
  const field = String(fieldValue) as NoteEditField;
  if (!NOTE_EDIT_FIELDS.includes(field)) {
    emitError(`Unknown note field: ${fieldValue}`);
    return;
  }

  const editable = ensureEditableMotif();
  if (!editable || editable.notes.length === 0) return;

  const index = Math.round(clamp(selectedNoteIndex, 0, editable.notes.length - 1));
  selectedNoteIndex = index;
  const current = editable.notes[index];
  if (!current) return;

  const next: MotifNote = { ...current };
  const numeric = Number(valueValue);
  if (!Number.isFinite(numeric)) {
    emitError(`Invalid ${field} value`);
    return;
  }

  switch (field) {
    case 'pitch':
      next.pitch = Math.round(numeric);
      break;
    case 'accidental':
      if (numeric === 0) delete next.accidental;
      else next.accidental = Math.round(numeric);
      break;
    case 'at':
      next.at = Math.max(0, Math.round(numeric));
      break;
    case 'duration':
      next.duration = Math.max(1, Math.round(numeric));
      break;
    case 'gate':
      if (numeric <= 0) delete next.gate;
      else next.gate = numeric;
      break;
    case 'velocity':
      if (numeric < 1) delete next.velocity;
      else next.velocity = Math.round(clamp(numeric, 1, 127));
      break;
    default:
      break;
  }

  const notes = editable.notes.map((note, noteIndex) => (noteIndex === index ? next : note));
  const errors = store.setNotes(editable.id, notes);
  if (errors.length > 0) {
    emitError(errors.join('; '));
    return;
  }

  emitSelectedMotifUi();
  emitStatus('note-edited', index, field, numeric);
}

function edit_note_at(rowIndexValue: number, fieldValue: string, valueValue: number): void {
  const field = String(fieldValue) as NoteEditField;
  if (!NOTE_EDIT_FIELDS.includes(field)) {
    emitError(`Unknown note field: ${fieldValue}`);
    return;
  }

  const editable = ensureEditableMotif();
  if (!editable) return;

  const index = Math.round(clamp(rowIndexValue, 0, editable.notes.length - 1));
  if (index < 0 || index >= editable.notes.length) return;
  const current = editable.notes[index];
  if (!current) return;

  const next: MotifNote = { ...current };
  const numeric = Number(valueValue);
  if (!Number.isFinite(numeric)) {
    emitError(`Invalid ${field} value`);
    return;
  }

  switch (field) {
    case 'pitch':
      next.pitch = Math.round(numeric);
      break;
    case 'accidental':
      if (numeric === 0) delete next.accidental;
      else next.accidental = Math.round(numeric);
      break;
    case 'at':
      next.at = Math.max(0, Math.round(numeric));
      break;
    case 'duration':
      next.duration = Math.max(1, Math.round(numeric));
      break;
    case 'gate':
      if (numeric <= 0) delete next.gate;
      else next.gate = numeric;
      break;
    case 'velocity':
      if (numeric < 1) delete next.velocity;
      else next.velocity = Math.round(clamp(numeric, 1, 127));
      break;
    default:
      break;
  }

  const notes = editable.notes.map((note, noteIndex) => (noteIndex === index ? next : note));
  const errors = store.setNotes(editable.id, notes);
  if (errors.length > 0) {
    emitError(errors.join('; '));
    return;
  }

  emitSelectedMotifUi();
}

function add_note(): void {
  const editable = ensureEditableMotif();
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
  emitSelectedMotifUi();
}

function remove_note(indexValue: number): void {
  const editable = ensureEditableMotif();
  if (!editable) return;
  const index = Math.round(indexValue);
  if (index < 0 || index >= editable.notes.length) return;
  const notes = editable.notes.filter((_, i) => i !== index);
  const errors = store.setNotes(editable.id, notes);
  if (errors.length > 0) {
    emitError(errors.join('; '));
    return;
  }
  emitSelectedMotifUi();
}

/**
 * Dispatch a URL-encoded JSON action from `library.html`.
 * `library.html` sends `window.max.outlet(encodeURIComponent(JSON.stringify({type, ...})))`.
 * Max routes that through `prepend lib_action` → `s ---motif_author` → engine inlet.
 */
function lib_action(encodedJson: string): void {
  let action: Record<string, unknown>;
  try {
    action = JSON.parse(decodeURIComponent(String(encodedJson))) as Record<string, unknown>;
  } catch {
    emitError('lib_action: invalid JSON');
    return;
  }

  const type = String(action['type'] ?? '');
  switch (type) {
    case 'select_browser':
      select_browser(Number(action['index']));
      break;
    case 'filter_motifs':
      filter_motifs(action['query']);
      break;
    case 'import_clip':
      import_clip(action['pitchMode'] !== undefined ? String(action['pitchMode']) : undefined);
      break;
    case 'save_motif':
      save_motif();
      break;
    case 'refresh_library':
      refresh_library();
      break;
    case 'begin_edit':
      begin_edit();
      break;
    case 'edit_meta':
      edit_meta(String(action['field']), action['value']);
      break;
    case 'add_note':
      add_note();
      break;
    case 'remove_note':
      remove_note(Number(action['index']));
      break;
    case 'edit_note_at':
      edit_note_at(Number(action['index']), String(action['field']), Number(action['value']));
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
