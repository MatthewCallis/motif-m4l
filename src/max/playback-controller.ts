import { compileMotif } from "../core/compile-motif.js";
import { clamp } from "../core/math.js";
import {
  barLengthTicks,
  quantizationTicks,
  roundRepeatLengthTicks,
  ticksToMilliseconds,
  ticksUntilNextBoundary,
} from "../core/timing.js";
import {
  MeterMode,
  Motif,
  PPQ,
  type CompileOptions,
  type HostContext,
  type LaunchQuantization,
  type RepeatRounding,
  type TriggerMode,
} from "../core/types.js";
import type { MotifStore } from "../library/store.js";
import { MIN_REPEAT_DELAY_MS, REPEAT_SCHEDULING_LOOKAHEAD_MS } from "./device-types.js";
import type { DeviceSettingsState } from "./device-settings.js";
import type { MotifHotkeyMap } from "./hotkey-map.js";

/** One trigger held in global `hold-repeat` mode. */
interface HeldRepeat {
  /** Stable motif id captured on note-on. */
  motifId: string;
  /** Original trigger velocity. */
  velocity: number;
  /** Original one-based MIDI channel. */
  channel: number;
  /** Max low-priority repeat task. */
  task: Task;
  /** Absolute wall-clock boundary for the next cycle. */
  nextBoundaryMilliseconds: number;
}

/** Optional overrides for launching an already-resolved motif. */
interface TriggerMotifOptions {
  /** Pre-resolved motif id override. */
  motifId?: string;
  /** Effective lifecycle captured for this trigger. */
  triggerMode?: TriggerMode;
  /** Explicit launch delay in PPQ ticks. */
  launchOffsetTicks?: number;
  /** Keep already queued pipe events when preparing a repeat cycle. */
  preserveScheduledNotes?: boolean;
  /** Absolute wall-clock time at which the compiled cycle should launch. */
  launchAtMilliseconds?: number;
  /** Observe when the compiled events begin entering Max `pipe`. */
  onScheduleStart?: (milliseconds: number) => void;
  /** Whether this cycle should refresh the selected motif preview. */
  synchronizePreview?: boolean;
}

/** Side effects crossing from playback into the Max device composition root. */
export interface PlaybackControllerCallbacks {
  /** Emit one scheduled MIDI event through Max `pipe`. */
  emitScheduledEvent: (
    pitch: number,
    velocity: number,
    channel: number,
    delayMilliseconds: number,
  ) => void;
  /** Flush the Max `pipe` queues and release notes tracked by `midiflush`. */
  emitClearScheduledNotes: () => void;
  /** Perform a hard Max-side panic, including downstream MIDI controller resets. */
  emitPanic: () => void;
  /** Report a user-facing diagnostic. */
  emitError: (message: string) => void;
  /** Emit a Max status message. */
  emitStatus: (...values: unknown[]) => void;
  /** Synchronize preview state after a successful trigger. */
  onPreviewTrigger: (pitch: number) => void;
  /** Select a motif through the device's guarded selection workflow. */
  onSelectMotif: (id: string) => void;
}

/**
 * Convert one effective motif cycle to a safe repeat-task delay.
 * @param {Motif} motif Motif that will repeat.
 * @param {MeterMode} meterMode Current meter scaling behavior.
 * @param {HostContext} host Observed Song context.
 * @param {number} tempoMultiplier Device-local tempo ratio.
 * @param {RepeatRounding} repeatRounding Effective cycle-rounding grid.
 * @returns {number} Repeat interval in milliseconds.
 */
export function motifRepeatDelayFor(
  motif: Motif,
  meterMode: MeterMode,
  host: HostContext,
  tempoMultiplier: number,
  repeatRounding: RepeatRounding = "exact",
): number {
  const roundedLength = roundRepeatLengthTicks(motif.length, motif.sourceMeter, repeatRounding);
  const effectiveLength =
    meterMode === "preserve"
      ? roundedLength
      : roundedLength * (barLengthTicks(host.timeSignature) / barLengthTicks(motif.sourceMeter));
  return Math.max(
    MIN_REPEAT_DELAY_MS,
    ticksToMilliseconds(effectiveLength, host.tempo * tempoMultiplier),
  );
}

/**
 * Calculate a quantized launch offset from the observed Song position.
 * @param {HostContext} host Observed Song context.
 * @param {LaunchQuantization} launchQuantization Selected launch grid.
 * @returns {number} Non-negative launch offset in PPQ ticks.
 */
export function launchOffsetTicksFor(
  host: HostContext,
  launchQuantization: LaunchQuantization,
): number {
  if (!host.isPlaying || launchQuantization === "immediate") {
    return 0;
  }
  const grid = quantizationTicks(launchQuantization, host.timeSignature);
  return ticksUntilNextBoundary(Math.max(0, host.currentSongTime * PPQ), grid);
}

/**
 * Wake the low-priority repeat Task before its boundary so native Max `pipe`
 * owns the final timing interval.
 * @param {number} boundaryMilliseconds Absolute wall-clock repeat boundary.
 * @param {number} nowMilliseconds Current wall-clock time.
 * @returns {number} Safe Task delay in milliseconds.
 */
export function repeatTaskDelayFor(boundaryMilliseconds: number, nowMilliseconds: number): number {
  return Math.max(
    MIN_REPEAT_DELAY_MS,
    boundaryMilliseconds - nowMilliseconds - REPEAT_SCHEDULING_LOOKAHEAD_MS,
  );
}

/**
 * Owns live MIDI trigger processing and all ephemeral playback bookkeeping.
 *
 * Catalog, hot-key, settings, and Song context objects are shared read-through
 * dependencies. Active notes, sustain deferrals, repeat Tasks, and instance ids
 * belong exclusively to this runtime and are never persisted.
 */
export class PlaybackController {
  /** Trigger pitches retained by hold/toggle/latch/release-tail modes. */
  activeTriggers = new Set<number>();
  /** Lifecycle captured when each retained non-repeat trigger started. */
  activeTriggerModes = new Map<number, TriggerMode>();
  /** Hold-mode releases deferred until the sustain pedal rises. */
  sustainedReleases = new Set<number>();
  /** Active repeat task for each pitch held in `hold-repeat` mode. */
  heldRepeats = new Map<number, HeldRepeat>();
  /** Hold-repeat releases deferred while the sustain pedal remains down. */
  sustainedRepeatReleases = new Set<number>();
  /** Whether MIDI sustain CC 64 is currently down. */
  sustainDown = false;
  /** Monotonic identity assigned to compiled motif instances. */
  instanceCounter = 1;
  /** Motif catalog used to resolve trigger targets. */
  store: MotifStore;
  /** MIDI-pitch-to-motif assignments. */
  hotkeys: MotifHotkeyMap;
  /** Device-local playback settings. */
  settings: DeviceSettingsState;
  /** Observed Song context used for timing and scale. */
  hostContext: HostContext;
  /** Side effects crossing into the Max device composition root. */
  callbacks: PlaybackControllerCallbacks;
  /** Wall-clock source for repeat scheduling. */
  nowMilliseconds: () => number;

  constructor(
    store: MotifStore,
    hotkeys: MotifHotkeyMap,
    settings: DeviceSettingsState,
    hostContext: HostContext,
    callbacks: PlaybackControllerCallbacks,
    nowMilliseconds: () => number = () => Date.now(),
  ) {
    this.store = store;
    this.hotkeys = hotkeys;
    this.settings = settings;
    this.hostContext = hostContext;
    this.callbacks = callbacks;
    this.nowMilliseconds = nowMilliseconds;
  }

  /**
   * Flush Max `pipe` queues and reset retained non-repeat trigger state.
   *
   * Repeat Tasks are intentionally managed separately so replacing one cycle
   * does not silently stop a held repeat.
   */
  clearScheduledNotes(): void {
    this.callbacks.emitClearScheduledNotes();
    this.activeTriggers.clear();
    this.activeTriggerModes.clear();
    this.sustainedReleases.clear();
  }

  /**
   * Cancel every repeat Task and discard all ephemeral playback state.
   * Max-side note/controller cleanup is emitted separately by the caller.
   */
  resetPlaybackState(): void {
    for (const repeat of this.heldRepeats.values()) {
      repeat.task.cancel();
      repeat.task.freepeer();
    }
    this.heldRepeats.clear();
    this.activeTriggers.clear();
    this.activeTriggerModes.clear();
    this.sustainedReleases.clear();
    this.sustainedRepeatReleases.clear();
    this.sustainDown = false;
  }

  /**
   * Resolve the motif used by a trigger pitch.
   * Trigger hot keys override the current selection; trigger-zone notes use it.
   * @param {number} triggerPitch Incoming MIDI trigger pitch.
   * @returns {string} Stable motif id to play.
   */
  motifIdForTrigger(triggerPitch: number): string {
    const mapping = this.hotkeys.get(triggerPitch);
    return mapping?.action === "trigger" ? mapping.motifId : this.store.currentId;
  }

  /**
   * Compile and emit one motif instance.
   * @param {number} triggerPitch Trigger MIDI pitch.
   * @param {number} triggerVelocity Trigger MIDI velocity.
   * @param {number} channel One-based MIDI channel.
   * @param {TriggerMotifOptions} triggerOptions Optional motif and launch overrides.
   * @returns {number | undefined} New instance id, or undefined for an unknown motif.
   */
  triggerMotif(
    triggerPitch: number,
    triggerVelocity: number,
    channel: number,
    triggerOptions: TriggerMotifOptions = {},
  ): number | undefined {
    const motifId = triggerOptions.motifId ?? this.motifIdForTrigger(triggerPitch);
    const stored = this.store.resolve(motifId);
    const selected = stored ? this.settings.transform(stored) : undefined;
    if (!selected) {
      this.callbacks.emitError(`Unknown motif: ${motifId}`);
      return undefined;
    }
    const triggerMode = triggerOptions.triggerMode ?? this.settings.triggerModeFor(selected);

    if (
      !triggerOptions.preserveScheduledNotes &&
      (this.settings.retriggerMode === "replace" || triggerMode === "latch")
    ) {
      this.clearScheduledNotes();
    }

    if (triggerOptions.synchronizePreview !== false) {
      this.callbacks.onPreviewTrigger(triggerPitch);
    }

    const instanceId = this.instanceCounter++;
    const options: CompileOptions = {
      channel: Math.round(clamp(channel, 1, 16)),
      meterMode: this.settings.meterMode,
      triggerPitch: Math.round(triggerPitch),
      triggerVelocity: Math.round(triggerVelocity),
      launchOffsetTicks:
        triggerOptions.launchOffsetTicks ??
        launchOffsetTicksFor(this.hostContext, this.settings.launchQuantization),
      instanceId,
    };
    if (this.settings.pitchModeOverride !== undefined) {
      options.pitchMode = this.settings.pitchModeOverride;
    }

    let events;
    try {
      const effectiveHostContext = this.settings.effectiveHostContext(this.hostContext);
      events = compileMotif(
        selected,
        {
          ...effectiveHostContext,
          tempo: effectiveHostContext.tempo * this.settings.tempoMultiplier,
        },
        options,
      );
    } catch (reason) {
      this.callbacks.emitError(reason instanceof Error ? reason.message : String(reason));
      return undefined;
    }

    const scheduleStartMilliseconds = this.nowMilliseconds();
    triggerOptions.onScheduleStart?.(scheduleStartMilliseconds);
    const wallClockLaunchDelay =
      triggerOptions.launchAtMilliseconds === undefined
        ? 0
        : Math.max(0, triggerOptions.launchAtMilliseconds - scheduleStartMilliseconds);
    for (const event of events) {
      this.callbacks.emitScheduledEvent(
        event.pitch,
        event.velocity,
        event.channel,
        event.offsetMs + wallClockLaunchDelay,
      );
    }

    this.callbacks.emitStatus("trigger", motifId, triggerPitch, instanceId);
    return instanceId;
  }

  /**
   * Cancel one held repeat without cutting off the cycle already sent to Max.
   * @param {number} triggerPitch Held MIDI trigger pitch.
   * @param {boolean} emitFeedback Whether to report the stopped assignment.
   */
  stopHeldRepeat(triggerPitch: number, emitFeedback = true): void {
    const repeat = this.heldRepeats.get(triggerPitch);
    if (!repeat) {
      return;
    }

    repeat.task.cancel();
    repeat.task.freepeer();
    this.heldRepeats.delete(triggerPitch);
    this.sustainedRepeatReleases.delete(triggerPitch);
    this.clearScheduledNotes();
    if (emitFeedback) {
      this.callbacks.emitStatus("repeat-stopped", repeat.motifId, triggerPitch);
    }
  }

  /**
   * Cancel every active held repeat.
   * @param {boolean} emitFeedback Whether each stopped assignment reports status.
   */
  stopAllHeldRepeats(emitFeedback = false): void {
    for (const pitch of [...this.heldRepeats.keys()]) {
      this.stopHeldRepeat(pitch, emitFeedback);
    }
    this.sustainedRepeatReleases.clear();
  }

  /**
   * Play one cycle and schedule further cycles until note-off.
   * @param {number} triggerPitch Trigger MIDI pitch.
   * @param {number} triggerVelocity Original note-on velocity.
   * @param {number} channel Original one-based MIDI channel.
   */
  startHeldRepeat(triggerPitch: number, triggerVelocity: number, channel: number): void {
    if (this.heldRepeats.has(triggerPitch)) {
      return;
    }

    const motifId = this.motifIdForTrigger(triggerPitch);
    const motif = this.store.resolve(motifId);
    if (!motif) {
      this.callbacks.emitError(`Unknown motif: ${motifId}`);
      return;
    }

    const firstLaunchOffset = launchOffsetTicksFor(
      this.hostContext,
      this.settings.launchQuantization,
    );
    let firstScheduleStartMilliseconds: number | undefined;
    const instanceId = this.triggerMotif(triggerPitch, triggerVelocity, channel, {
      motifId: motif.id,
      triggerMode: "hold-repeat",
      launchOffsetTicks: firstLaunchOffset,
      onScheduleStart: (milliseconds) => {
        firstScheduleStartMilliseconds = milliseconds;
      },
    });
    if (instanceId === undefined) {
      return;
    }

    let repeat: HeldRepeat;
    const task = new Task(() => {
      if (this.heldRepeats.get(triggerPitch) !== repeat) {
        return;
      }

      const repeatedMotif = this.store.resolve(repeat.motifId);
      if (!repeatedMotif) {
        this.stopHeldRepeat(triggerPitch);
        return;
      }
      const nowMilliseconds = this.nowMilliseconds();
      let repeatedScheduleStartMilliseconds: number | undefined;
      const repeatedInstance = this.triggerMotif(triggerPitch, repeat.velocity, repeat.channel, {
        motifId: repeat.motifId,
        triggerMode: "hold-repeat",
        launchOffsetTicks: 0,
        launchAtMilliseconds: repeat.nextBoundaryMilliseconds,
        onScheduleStart: (milliseconds) => {
          repeatedScheduleStartMilliseconds = milliseconds;
        },
        preserveScheduledNotes: true,
        synchronizePreview: false,
      });
      if (repeatedInstance === undefined || this.heldRepeats.get(triggerPitch) !== repeat) {
        return;
      }

      const repeatDelay = motifRepeatDelayFor(
        repeatedMotif,
        this.settings.meterMode,
        this.hostContext,
        this.settings.tempoMultiplier,
        this.settings.repeatRoundingFor(repeatedMotif),
      );
      repeat.nextBoundaryMilliseconds =
        Math.max(
          repeat.nextBoundaryMilliseconds,
          repeatedScheduleStartMilliseconds ?? nowMilliseconds,
        ) + repeatDelay;
      repeat.task.schedule(
        repeatTaskDelayFor(repeat.nextBoundaryMilliseconds, this.nowMilliseconds()),
      );
    });
    const firstDelay =
      ticksToMilliseconds(
        firstLaunchOffset,
        this.hostContext.tempo * this.settings.tempoMultiplier,
      ) +
      motifRepeatDelayFor(
        motif,
        this.settings.meterMode,
        this.hostContext,
        this.settings.tempoMultiplier,
        this.settings.repeatRoundingFor(motif),
      );
    repeat = {
      motifId: motif.id,
      velocity: triggerVelocity,
      channel,
      task,
      nextBoundaryMilliseconds:
        (firstScheduleStartMilliseconds ?? this.nowMilliseconds()) + firstDelay,
    };
    this.heldRepeats.set(triggerPitch, repeat);
    task.schedule(repeatTaskDelayFor(repeat.nextBoundaryMilliseconds, this.nowMilliseconds()));
    this.callbacks.emitStatus("repeat-started", motif.id, triggerPitch);
  }

  /**
   * Cancel a retained trigger and report its release.
   * @param {number} triggerPitch Trigger MIDI pitch.
   */
  cancelTrigger(triggerPitch: number): void {
    if (!this.activeTriggers.has(triggerPitch)) {
      return;
    }
    this.clearScheduledNotes();
    this.callbacks.emitStatus("release", triggerPitch);
  }

  /**
   * Handle one incoming MIDI note.
   * @param {number} pitchValue MIDI note number.
   * @param {number} velocityValue MIDI velocity, or zero for note-off.
   * @param {number} channelValue One-based MIDI channel.
   */
  note(pitchValue: number, velocityValue: number, channelValue = 1): void {
    const pitch = Math.round(clamp(pitchValue, 0, 127));
    const velocity = Math.round(clamp(velocityValue, 0, 127));
    const channel = Math.round(clamp(channelValue, 1, 16));
    const mapping = this.hotkeys.get(pitch);
    const isTrigger =
      Boolean(mapping) ||
      this.heldRepeats.has(pitch) ||
      (pitch >= this.settings.triggerZone.low && pitch <= this.settings.triggerZone.high);

    if (
      this.settings.passThroughPolicy === "all" ||
      (this.settings.passThroughPolicy === "non-triggers" && !isTrigger)
    ) {
      this.callbacks.emitScheduledEvent(pitch, velocity, channel, 0);
    }
    if (!isTrigger) {
      return;
    }

    if (mapping?.action === "select") {
      if (velocity > 0) {
        this.callbacks.onSelectMotif(mapping.motifId);
        if (this.store.currentId === mapping.motifId) {
          this.callbacks.emitStatus("selected", mapping.motifId, pitch);
        }
      }
      return;
    }

    const motif = this.store.resolve(this.motifIdForTrigger(pitch));
    if (!motif) {
      if (velocity > 0) {
        this.callbacks.emitError(`Unknown motif: ${this.motifIdForTrigger(pitch)}`);
      }
      return;
    }
    const triggerMode = this.settings.triggerModeFor(motif);

    if (triggerMode === "hold-repeat" || this.heldRepeats.has(pitch)) {
      if (velocity > 0) {
        if (triggerMode === "hold-repeat") {
          this.startHeldRepeat(pitch, velocity, channel);
        }
      } else if (this.sustainDown) {
        this.sustainedRepeatReleases.add(pitch);
      } else {
        this.stopHeldRepeat(pitch);
      }
      return;
    }

    if (velocity > 0) {
      if (triggerMode === "toggle" && this.activeTriggers.has(pitch)) {
        this.cancelTrigger(pitch);
        return;
      }

      const instanceId = this.triggerMotif(pitch, velocity, channel, { triggerMode });
      if (instanceId !== undefined && triggerMode !== "one-shot") {
        this.activeTriggers.add(pitch);
        this.activeTriggerModes.set(pitch, triggerMode);
      }
      return;
    }

    const activeMode = this.activeTriggerModes.get(pitch) ?? triggerMode;
    if (activeMode === "hold") {
      if (this.sustainDown) {
        this.sustainedReleases.add(pitch);
      } else {
        this.cancelTrigger(pitch);
      }
    } else if (activeMode === "release-tail") {
      this.activeTriggers.delete(pitch);
      this.activeTriggerModes.delete(pitch);
    }
  }

  /**
   * Handle one incoming MIDI controller value.
   * @param {number} controllerValue MIDI CC number.
   * @param {number} valueValue MIDI CC value.
   */
  cc(controllerValue: number, valueValue: number): void {
    const controller = Math.round(clamp(controllerValue, 0, 127));
    const value = Math.round(clamp(valueValue, 0, 127));
    if (controller !== 64) {
      return;
    }

    const wasDown = this.sustainDown;
    this.sustainDown = value >= 64;
    if (wasDown && !this.sustainDown) {
      for (const pitch of [...this.sustainedRepeatReleases]) {
        this.stopHeldRepeat(pitch);
      }
      this.sustainedRepeatReleases.clear();
      if (this.sustainedReleases.size > 0) {
        this.clearScheduledNotes();
      }
      this.sustainedReleases.clear();
    }
    this.callbacks.emitStatus("sustain", this.sustainDown ? "on" : "off");
  }

  /**
   * Handle the sustain convenience selector.
   * @param {number} value Sustain value.
   */
  sustain(value: number): void {
    this.cc(64, value);
  }

  /** Stop all playback, discard deferred state, and hard-reset downstream MIDI. */
  panic(): void {
    this.resetPlaybackState();
    this.callbacks.emitPanic();
    this.callbacks.emitStatus("panic");
  }

  /** Apply the cleanup required when Live transport stops. */
  onTransportStopped(): void {
    this.resetPlaybackState();
    this.callbacks.emitPanic();
  }
}
