import { compileMotif } from '../core/compile-motif.js';
import type {
  CompileOptions,
  HostContext,
  MeterMode,
  PitchMode,
  RetriggerMode,
} from '../core/types.js';
import { findMotif, MOTIFS } from '../library/motifs.js';

type MaxGlobal = typeof globalThis & {
  initialize?: () => void;
  note?: (pitch: number, velocity: number, channel?: number) => void;
  motif?: (id: string) => void;
  pitch_mode?: (mode: string) => void;
  meter_mode?: (mode: string) => void;
  retrigger?: (mode: string | number) => void;
  panic?: () => void;
  list_motifs?: () => void;
  dump_context?: () => void;
}

inlets = 1;
outlets = 2;

let currentMotifId = MOTIFS[0]?.id ?? 'scale-turn';
let pitchModeOverride: PitchMode | undefined;
let meterMode: MeterMode = 'preserve';
let retriggerMode: RetriggerMode = 'replace';
let initialized = false;
const observers: LiveAPI[] = [];

const hostContext: HostContext = {
  tempo: 120,
  rootNote: 0,
  scaleName: 'Major',
  scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
  scaleMode: true,
  timeSignature: { numerator: 4, denominator: 4 },
};

function emitStatus(...values: unknown[]): void {
  outlet(1, 'status', ...values);
}

function emitContext(): void {
  outlet(
    1,
    'context',
    hostContext.tempo,
    hostContext.rootNote,
    hostContext.scaleName,
    hostContext.timeSignature.numerator,
    hostContext.timeSignature.denominator,
    ...hostContext.scaleIntervals,
  );
}

function unwrapNumbers(value: unknown): number[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is number => typeof item === 'number');
  }

  return typeof value === 'number' ? [value] : [];
}

function callbackValues(args: unknown[]): unknown[] {
  return typeof args[0] === 'string' ? args.slice(1) : args;
}

function observeNumber(property: string, apply: (value: number) => void): void {
  const api = new LiveAPI((args) => {
    const value = unwrapNumbers(callbackValues(args))[0];
    if (value !== undefined) {
      apply(value);
      emitContext();
    }
  }, 'live_set');

  if (!api.valid) {
    outlet(1, 'error', `Unable to observe Live property: ${property}`);
    return;
  }

  const initial = unwrapNumbers(api.get(property))[0];
  if (initial !== undefined) {
    apply(initial);
  }
  api.property = property;
  observers.push(api);
}

function observeNumberList(property: string, apply: (value: number[]) => void): void {
  const api = new LiveAPI((args) => {
    const values = unwrapNumbers(callbackValues(args));
    if (values.length > 0) {
      apply(values);
      emitContext();
    }
  }, 'live_set');

  if (!api.valid) {
    outlet(1, 'error', `Unable to observe Live property: ${property}`);
    return;
  }

  const initial = unwrapNumbers(api.get(property));
  if (initial.length > 0) {
    apply(initial);
  }
  api.property = property;
  observers.push(api);
}

function observeString(property: string, apply: (value: string) => void): void {
  const api = new LiveAPI((args) => {
    const values = callbackValues(args);
    const value = values.map(String).join(' ');
    if (value) {
      apply(value);
      emitContext();
    }
  }, 'live_set');

  if (!api.valid) {
    outlet(1, 'error', `Unable to observe Live property: ${property}`);
    return;
  }

  const initial = api.getstring(property);
  const initialString = Array.isArray(initial) ? initial.join(' ') : initial;
  if (initialString) {
    apply(initialString);
  }
  api.property = property;
  observers.push(api);
}

function initialize(): void {
  if (initialized) {
    emitContext();
    return;
  }

  initialized = true;
  observeNumber('tempo', (value) => {
    hostContext.tempo = value;
  });
  observeNumber('root_note', (value) => {
    hostContext.rootNote = value;
  });
  observeNumber('scale_mode', (value) => {
    hostContext.scaleMode = value !== 0;
  });
  observeNumberList('scale_intervals', (value) => {
    hostContext.scaleIntervals = value;
  });
  observeString('scale_name', (value) => {
    hostContext.scaleName = value;
  });
  observeNumber('signature_numerator', (value) => {
    hostContext.timeSignature.numerator = value;
  });
  observeNumber('signature_denominator', (value) => {
    hostContext.timeSignature.denominator = value;
  });

  emitStatus('ready', currentMotifId);
  emitContext();
}

function note(pitch: number, velocity: number, channel = 1): void {
  if (!Number.isFinite(pitch) || !Number.isFinite(velocity) || velocity <= 0) {
    return;
  }

  const selected = findMotif(currentMotifId);
  if (!selected) {
    outlet(1, 'error', `Unknown motif: ${currentMotifId}`);
    return;
  }

  if (retriggerMode === 'replace') {
    outlet(1, 'panic');
  }

  const options: CompileOptions = {
    channel,
    meterMode,
    triggerPitch: Math.round(pitch),
    triggerVelocity: Math.round(velocity),
  };

  if (pitchModeOverride !== undefined) {
    options.pitchMode = pitchModeOverride;
  }

  const events = compileMotif(selected, hostContext, options);

  for (const event of events) {
    outlet(0, event.pitch, event.velocity, event.channel, event.offsetMs);
  }
}

function motif(id: string): void {
  if (!findMotif(id)) {
    outlet(1, 'error', `Unknown motif: ${id}`);
    return;
  }

  currentMotifId = id;
  emitStatus('motif', id);
}

function pitch_mode(mode: string): void {
  if (mode === 'auto') {
    pitchModeOverride = undefined;
  } else if (mode === 'scale' || mode === 'chromatic') {
    pitchModeOverride = mode;
  } else {
    outlet(1, 'error', `Unknown pitch mode: ${mode}`);
    return;
  }

  emitStatus('pitch-mode', mode);
}

function meter_mode(mode: string): void {
  if (mode !== 'preserve' && mode !== 'fit-bar') {
    outlet(1, 'error', `Unknown meter mode: ${mode}`);
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
    outlet(1, 'error', `Unknown retrigger mode: ${String(mode)}`);
    return;
  }

  emitStatus('retrigger', retriggerMode);
}

function panic(): void {
  outlet(1, 'panic');
}

function list_motifs(): void {
  for (const item of MOTIFS) {
    outlet(1, 'status', 'motif-item', item.id, item.name);
  }
}

function dump_context(): void {
  emitContext();
}

const maxGlobal = globalThis as MaxGlobal;
maxGlobal.initialize = initialize;
maxGlobal.note = note;
maxGlobal.motif = motif;
maxGlobal.pitch_mode = pitch_mode;
maxGlobal.meter_mode = meter_mode;
maxGlobal.retrigger = retrigger;
maxGlobal.panic = panic;
maxGlobal.list_motifs = list_motifs;
maxGlobal.dump_context = dump_context;
