import { compileMotif } from '../core/compile-motif.js';
import { clamp } from '../core/math.js';
import { RuntimeScheduler, type RuntimeMidiEvent } from '../core/runtime-scheduler.js';
import { quantizationTicks, ticksUntilNextBoundary } from '../core/timing.js';
import {
  PPQ,
  type CompileOptions,
  type HostContext,
  type LaunchQuantization,
  type MeterMode,
  type PassThroughPolicy,
  type PitchMode,
  type RetriggerMode,
  type ScheduleUnit,
  type TriggerMode,
} from '../core/types.js';
import { MotifStore } from '../library/store.js';

type MaxGlobal = typeof globalThis & {
  initialize?: () => void;
  note?: (pitch: number, velocity: number, channel?: number) => void;
  cc?: (controller: number, value: number, channel?: number) => void;
  motif?: (id: string) => void;
  pitch_mode?: (mode: string) => void;
  meter_mode?: (mode: string) => void;
  retrigger?: (mode: string | number) => void;
  trigger_mode?: (mode: string) => void;
  launch_quantization?: (value: string) => void;
  pass_through?: (value: string) => void;
  trigger_low?: (value: number) => void;
  trigger_high?: (value: number) => void;
  map_trigger?: (pitch: number, motifId: string) => void;
  unmap_trigger?: (pitch: number) => void;
  clear_trigger_map?: () => void;
  library_path?: (path: string) => void;
  refresh_library?: () => void;
  panic?: () => void;
  list_motifs?: () => void;
  dump_context?: () => void;
  host_tempo?: (value: number) => void;
  host_root_note?: (value: number) => void;
  host_scale_mode?: (value: number) => void;
  host_scale_intervals?: (...values: unknown[]) => void;
  host_scale_name?: (...values: unknown[]) => void;
  host_signature_numerator?: (value: number) => void;
  host_signature_denominator?: (value: number) => void;
  host_is_playing?: (value: number) => void;
};

inlets = 1;
outlets = 2;

const store = new MotifStore();
const scheduler = new RuntimeScheduler();
const triggerMap = new Map<number, string>();
const activeInstances = new Map<number, number[]>();
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
let songApi: LiveAPI | undefined;

const hostContext: HostContext = {
  tempo: 120,
  rootNote: 0,
  scaleName: 'Major',
  scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
  scaleMode: true,
  timeSignature: { numerator: 4, denominator: 4 },
  isPlaying: false,
};

function emitStatus(...values: unknown[]): void {
  outlet(1, 'status', ...values);
}

function emitError(message: string): void {
  outlet(1, 'error', message);
  error(`Motif: ${message}\n`);
}

function noteName(value: number): string {
  return ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][
    ((Math.round(value) % 12) + 12) % 12
  ] ?? 'C';
}

function emitContext(): void {
  const key = `${noteName(hostContext.rootNote)} ${hostContext.scaleName}${
    hostContext.scaleMode ? '' : ' · Scale Off'
  }`;
  const meter = `${hostContext.timeSignature.numerator}/${hostContext.timeSignature.denominator}`;
  const tempo = `${Math.round(hostContext.tempo * 10) / 10} BPM`;
  const transport = hostContext.isPlaying ? 'Playing' : 'Stopped';

  outlet(1, 'host-key', key);
  outlet(1, 'host-meter', meter);
  outlet(1, 'host-tempo', tempo);
  outlet(1, 'host-transport', transport);
  outlet(1, 'context', key, meter, tempo, transport);
}

function flattenValues(values: readonly unknown[]): unknown[] {
  return values.flatMap((value) => (Array.isArray(value) ? value : [value]));
}

function unwrapNumbers(value: unknown): number[] {
  return flattenValues([value]).filter((item): item is number => typeof item === 'number');
}

function host_tempo(value: number): void {
  if (Number.isFinite(value) && value > 0) {
    hostContext.tempo = value;
    emitContext();
  }
}

function host_root_note(value: number): void {
  if (Number.isFinite(value)) {
    hostContext.rootNote = Math.round(value);
    emitContext();
  }
}

function host_scale_mode(value: number): void {
  hostContext.scaleMode = value !== 0;
  emitContext();
}

function host_scale_intervals(...values: unknown[]): void {
  const intervals = flattenValues(values).filter((value): value is number => typeof value === 'number');
  if (intervals.length > 0) {
    hostContext.scaleIntervals = intervals;
    emitContext();
  }
}

function host_scale_name(...values: unknown[]): void {
  const name = flattenValues(values).map(String).join(' ').trim();
  if (name) {
    hostContext.scaleName = name;
    emitContext();
  }
}

function host_signature_numerator(value: number): void {
  if (Number.isFinite(value) && value > 0) {
    hostContext.timeSignature.numerator = Math.round(value);
    emitContext();
  }
}

function host_signature_denominator(value: number): void {
  if (Number.isFinite(value) && value > 0) {
    hostContext.timeSignature.denominator = Math.round(value);
    emitContext();
  }
}

function host_is_playing(value: number): void {
  const wasPlaying = hostContext.isPlaying;
  hostContext.isPlaying = value !== 0;
  if (wasPlaying && !hostContext.isPlaying) {
    scheduler.reset();
    activeInstances.clear();
    sustainedReleases.clear();
    outlet(1, 'panic');
  }
  emitContext();
}

function listMotifs(): void {
  outlet(1, 'motifs-reset');
  for (const item of store.list()) {
    outlet(1, 'motif-item', item.id);
  }
  outlet(1, 'motif-selected', currentMotifId);
}

function initialize(): void {
  if (!initialized) {
    initialized = true;
    songApi = new LiveAPI(undefined, 'live_set');
    emitStatus('ready', 'v0.3.1');
    emitMidiPassState();
  }

  emitContext();
  listMotifs();
}

function safeSongNumber(property: string): number | undefined {
  if (!songApi || songApi.valid !== 1) {
    return undefined;
  }

  try {
    return unwrapNumbers(songApi.get(property))[0];
  } catch {
    return undefined;
  }
}

function currentClock(): { now: number; unit: ScheduleUnit; launchOffsetTicks: number } {
  if (hostContext.isPlaying) {
    const songBeats = safeSongNumber('current_song_time');
    if (songBeats !== undefined) {
      const now = songBeats * PPQ;
      const grid = quantizationTicks(launchQuantization, hostContext.timeSignature);
      return {
        now,
        unit: 'ticks',
        launchOffsetTicks: ticksUntilNextBoundary(now, grid),
      };
    }
  }

  return { now: Date.now(), unit: 'ms', launchOffsetTicks: 0 };
}

function emitRuntimeEvent(event: RuntimeMidiEvent): void {
  outlet(0, event.unit, event.pitch, event.velocity, event.channel, event.delay);
}

function emitRuntimeEvents(events: readonly RuntimeMidiEvent[]): void {
  for (const event of events) {
    emitRuntimeEvent(event);
  }
}

function emitDirectNote(pitch: number, velocity: number, channel: number): void {
  outlet(0, 'ms', pitch, velocity, channel, 0);
}

function emitMidiPassState(): void {
  outlet(1, 'midi-pass', passThroughPolicy === 'none' ? 0 : 1);
}

function shouldPassDry(isTrigger: boolean): boolean {
  return passThroughPolicy === 'all' || (passThroughPolicy === 'non-triggers' && !isTrigger);
}

function triggerMotif(triggerPitch: number, triggerVelocity: number, channel: number): number | undefined {
  const mappedId = triggerMap.get(triggerPitch);
  const motifId = mappedId ?? currentMotifId;
  const selected = store.get(motifId);
  if (!selected) {
    emitError(`Unknown motif: ${motifId}`);
    return undefined;
  }

  const instanceId = instanceCounter++;
  const clock = currentClock();

  if (retriggerMode === 'replace' || triggerMode === 'latch') {
    scheduler.advance(clock.now, clock.unit);
    scheduler.reset();
    activeInstances.clear();
    outlet(1, 'panic');
  } else {
    outlet(1, 'clear');
  }

  const options: CompileOptions = {
    channel: Math.round(clamp(channel, 1, 16)),
    meterMode,
    triggerPitch: Math.round(triggerPitch),
    triggerVelocity: Math.round(triggerVelocity),
    launchOffsetTicks: clock.launchOffsetTicks,
    instanceId,
  };
  if (pitchModeOverride !== undefined) {
    options.pitchMode = pitchModeOverride;
  }

  const events = compileMotif(selected, hostContext, options);
  emitRuntimeEvents(scheduler.add(events, clock.now, clock.unit));
  emitStatus('trigger', motifId, triggerPitch, instanceId);
  return instanceId;
}

function rememberInstance(triggerPitch: number, instanceId: number): void {
  const current = activeInstances.get(triggerPitch) ?? [];
  current.push(instanceId);
  activeInstances.set(triggerPitch, current);
}

function cancelTrigger(triggerPitch: number): void {
  const instances = activeInstances.get(triggerPitch);
  if (!instances || instances.length === 0) {
    return;
  }

  const clock = currentClock();
  outlet(1, 'clear');
  emitRuntimeEvents(scheduler.cancelInstances(instances, clock.now, clock.unit));
  activeInstances.delete(triggerPitch);
  emitStatus('release', triggerPitch);
}

function note(pitchValue: number, velocityValue: number, channelValue = 1): void {
  const pitch = Math.round(clamp(pitchValue, 0, 127));
  const velocity = Math.round(clamp(velocityValue, 0, 127));
  const channel = Math.round(clamp(channelValue, 1, 16));
  const mapped = triggerMap.has(pitch);
  const inZone = pitch >= triggerLow && pitch <= triggerHigh;
  const isTrigger = mapped || inZone;

  if (shouldPassDry(isTrigger)) {
    emitDirectNote(pitch, velocity, channel);
  }

  if (!isTrigger) {
    return;
  }

  if (velocity > 0) {
    if (triggerMode === 'toggle' && activeInstances.has(pitch)) {
      cancelTrigger(pitch);
      return;
    }

    const instanceId = triggerMotif(pitch, velocity, channel);
    if (instanceId !== undefined && triggerMode !== 'one-shot') {
      rememberInstance(pitch, instanceId);
    }
    return;
  }

  if (triggerMode === 'hold') {
    if (sustainDown) {
      sustainedReleases.add(pitch);
    } else {
      cancelTrigger(pitch);
    }
  } else if (triggerMode === 'release-tail') {
    // The scheduled phrase is allowed to finish naturally after key release.
    activeInstances.delete(pitch);
  }
}

function cc(controllerValue: number, valueValue: number): void {
  const controller = Math.round(clamp(controllerValue, 0, 127));
  const value = Math.round(clamp(valueValue, 0, 127));
  if (controller !== 64) {
    return;
  }

  const wasDown = sustainDown;
  sustainDown = value >= 64;
  if (wasDown && !sustainDown) {
    for (const pitch of sustainedReleases) {
      cancelTrigger(pitch);
    }
    sustainedReleases.clear();
  }
  emitStatus('sustain', sustainDown ? 'on' : 'off');
}

function motif(id: string): void {
  if (!store.get(id)) {
    emitError(`Unknown motif: ${id}`);
    return;
  }
  currentMotifId = id;
  outlet(1, 'motif-selected', id);
  emitStatus('motif', id);
}

function pitch_mode(mode: string): void {
  if (mode === 'auto') {
    pitchModeOverride = undefined;
  } else if (mode === 'scale' || mode === 'chromatic' || mode === 'hybrid') {
    pitchModeOverride = mode;
  } else {
    emitError(`Unknown pitch mode: ${mode}`);
    return;
  }
  emitStatus('pitch-mode', mode);
}

function meter_mode(mode: string): void {
  if (mode !== 'preserve' && mode !== 'fit-bar') {
    emitError(`Unknown meter mode: ${mode}`);
    return;
  }
  meterMode = mode;
  emitStatus('meter-mode', mode);
}

function retrigger(mode: string | number): void {
  if (mode === 1 || mode === 'replace') {
    retriggerMode = 'replace';
  } else if (mode === 0 || mode === 'overlap') {
    retriggerMode = 'overlap';
  } else {
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
  if (!store.get(motifId)) {
    emitError(`Cannot map ${pitch}: unknown motif ${motifId}`);
    return;
  }
  triggerMap.set(pitch, motifId);
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
  if (!file.isopen) {
    throw new Error('could not open file');
  }
  try {
    return JSON.parse(file.readstring(file.eof));
  } finally {
    file.close();
  }
}

function loadUserLibrary(): void {
  store.resetToBuiltins();
  if (!userLibraryPath) {
    return;
  }

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
        if (errors.length > 0) {
          emitError(`${filename}: ${errors.join('; ')}`);
        }
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
  if (!store.get(currentMotifId)) {
    currentMotifId = store.list()[0]?.id ?? 'mitsuda-lick';
  }
  listMotifs();
  emitStatus('library', userLibraryPath || 'built-ins');
}

function refresh_library(): void {
  loadUserLibrary();
  listMotifs();
  emitStatus('library-refreshed', store.list().length);
}

function panic(): void {
  scheduler.reset();
  activeInstances.clear();
  sustainedReleases.clear();
  outlet(1, 'panic');
  emitStatus('panic');
}

function dump_context(): void {
  emitContext();
}

const maxGlobal = globalThis as MaxGlobal;
maxGlobal.initialize = initialize;
maxGlobal.note = note;
maxGlobal.cc = cc;
maxGlobal.motif = motif;
maxGlobal.pitch_mode = pitch_mode;
maxGlobal.meter_mode = meter_mode;
maxGlobal.retrigger = retrigger;
maxGlobal.trigger_mode = trigger_mode;
maxGlobal.launch_quantization = launch_quantization;
maxGlobal.pass_through = pass_through;
maxGlobal.trigger_low = trigger_low;
maxGlobal.trigger_high = trigger_high;
maxGlobal.map_trigger = map_trigger;
maxGlobal.unmap_trigger = unmap_trigger;
maxGlobal.clear_trigger_map = clear_trigger_map;
maxGlobal.library_path = library_path;
maxGlobal.refresh_library = refresh_library;
maxGlobal.panic = panic;
maxGlobal.list_motifs = listMotifs;
maxGlobal.dump_context = dump_context;
maxGlobal.host_tempo = host_tempo;
maxGlobal.host_root_note = host_root_note;
maxGlobal.host_scale_mode = host_scale_mode;
maxGlobal.host_scale_intervals = host_scale_intervals;
maxGlobal.host_scale_name = host_scale_name;
maxGlobal.host_signature_numerator = host_signature_numerator;
maxGlobal.host_signature_denominator = host_signature_denominator;
maxGlobal.host_is_playing = host_is_playing;
