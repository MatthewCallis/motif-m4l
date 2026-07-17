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
  type PassThroughPolicy,
  type PitchMode,
  type RetriggerMode,
  type TriggerMode,
} from '../core/types.js';
import { MotifStore } from '../library/store.js';

interface MotifHandlers {
  initialize: () => void;
  note: (pitch: number, velocity: number, channel?: number) => void;
  cc: (controller: number, value: number, channel?: number) => void;
  sustain: (value: number, channel?: number) => void;
  motif: (id: string) => void;
  pitch_mode: (mode: string) => void;
  meter_mode: (mode: string) => void;
  retrigger: (mode: string | number) => void;
  trigger_mode: (mode: string) => void;
  launch_quantization: (value: string) => void;
  pass_through: (value: string) => void;
  trigger_low: (value: number) => void;
  trigger_high: (value: number) => void;
  map_trigger: (pitch: number, motifId: string) => void;
  unmap_trigger: (pitch: number) => void;
  clear_trigger_map: () => void;
  library_path: (path: string) => void;
  refresh_library: () => void;
  panic: () => void;
  list_motifs: () => void;
  dump_context: () => void;
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

function emitSelectedMotifUi(): void {
  const selected = currentMotif();
  if (!selected) return;

  const preview = buildMotifPreview(
    selected,
    hostContext,
    previewTriggerPitch,
    pitchModeOverride,
    meterMode,
  );
  const normalizedPitches = preview.notes.map((note) => note.pitch - preview.lowPitch);
  const previewRange = Math.max(1, preview.highPitch - preview.lowPitch);
  const sourceMeter = `${selected.sourceMeter.numerator}/${selected.sourceMeter.denominator}`;
  const tags = selected.metadata?.tags?.join(' · ') ?? 'custom motif';
  const suggested = selected.metadata?.suggestedModes?.join(', ');
  const tagLine = suggested ? `${tags}  •  suggested: ${suggested}` : tags;
  const bars = `${formatNumber(preview.bars)} ${preview.bars === 1 ? 'bar' : 'bars'}`;
  const stats = `${preview.notes.length} notes  •  ${bars}  •  ${sourceMeter} source  •  ${preview.effectivePitchMode}`;
  const root = `${midiNoteName(preview.triggerPitch)} anchor  •  ${hostContext.scaleName}  •  ${preview.effectivePitchMode}`;

  emit('ui', 'preview-pitches', ...normalizedPitches);
  emit('ui', 'preview-range', previewRange);
  emit('ui', 'preview-notes', preview.noteNames.join('  ·  '));
  emit('ui', 'preview-root', root);
  emit('ui', 'motif-title', selected.name);
  emit('ui', 'motif-description', selected.description);
  emit('ui', 'motif-stats', stats);
  emit('ui', 'motif-tags', tagLine);
}

function flattenValues(values: readonly unknown[]): unknown[] {
  return values.flatMap((value) => (Array.isArray(value) ? value : [value]));
}

function numbers(values: readonly unknown[]): number[] {
  return flattenValues(values)
    .map(Number)
    .filter(Number.isFinite);
}

function clearScheduledNotes(): void {
  emit('clear');
  emit('panic');
  activeTriggers.clear();
  sustainedReleases.clear();
}

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

function initialize(): void {
  if (!initialized) {
    initialized = true;
    emitStatus('Ready');
    emitMidiPassState();
  }
  listMotifs();
}

function launchOffsetTicks(): number {
  if (!hostContext.isPlaying || launchQuantization === 'immediate') return 0;
  const grid = quantizationTicks(launchQuantization, hostContext.timeSignature);
  return ticksUntilNextBoundary(Math.max(0, hostContext.currentSongTime * PPQ), grid);
}

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

  for (const event of compileMotif(selected, hostContext, options)) {
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
  emit('motif-selected', selected.name);
  emitSelectedMotifUi();
  emitStatus('Motif', selected.name);
}

function pitch_mode(mode: string): void {
  if (mode === 'auto') pitchModeOverride = undefined;
  else if (mode === 'scale' || mode === 'chromatic' || mode === 'hybrid') pitchModeOverride = mode;
  else {
    emitError(`Unknown pitch mode: ${mode}`);
    return;
  }
  emitSelectedMotifUi();
  emitStatus('Pitch', mode);
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
  panic,
  list_motifs: listMotifs,
  dump_context,
  song_context,
};

(globalThis as typeof globalThis & { __motifHandlers?: MotifHandlers }).__motifHandlers = handlers;
