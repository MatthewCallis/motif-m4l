import { compileMotif } from "../core/compile-motif.js";
import { clamp } from "../core/math.js";
import {
  barLengthTicks,
  quantizationTicks,
  ticksToMilliseconds,
  ticksUntilNextBoundary,
} from "../core/timing.js";
import { MeterMode, Motif, PPQ, type CompileOptions, type HostContext, type LaunchQuantization } from "../core/types.js";
import type { MotifStore } from "../library/store.js";
import { MIN_REPEAT_DELAY_MS } from "./device-types.js";
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
}

/** Optional overrides for launching an already-resolved motif. */
interface TriggerMotifOptions {
  /** Pre-resolved motif id override. */
  motifId?: string;
  /** Explicit launch delay in PPQ ticks. */
  launchOffsetTicks?: number;
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
  /** Flush the Max `pipe` queues. */
  emitClearScheduledNotes: () => void;
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
 * @returns {number} Repeat interval in milliseconds.
 */
export function motifRepeatDelayFor(
  motif: Motif,
  meterMode: MeterMode,
  host: HostContext,
  tempoMultiplier: number,
): number {
  const effectiveLength =
    meterMode === "preserve"
      ? motif.length
      : motif.length * (barLengthTicks(host.timeSignature) / barLengthTicks(motif.sourceMeter));
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
  if (!host.isPlaying || launchQuantization === "immediate") return 0;
  const grid = quantizationTicks(launchQuantization, host.timeSignature);
  return ticksUntilNextBoundary(Math.max(0, host.currentSongTime * PPQ), grid);
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
  readonly activeTriggers = new Set<number>();
  /** Hold-mode releases deferred until the sustain pedal rises. */
  readonly sustainedReleases = new Set<number>();
  /** Active repeat task for each pitch held in `hold-repeat` mode. */
  readonly heldRepeats = new Map<number, HeldRepeat>();
  /** Hold-repeat releases deferred while the sustain pedal remains down. */
  readonly sustainedRepeatReleases = new Set<number>();
  /** Whether MIDI sustain CC 64 is currently down. */
  sustainDown = false;
  /** Monotonic identity assigned to compiled motif instances. */
  instanceCounter = 1;

  constructor(
    readonly store: MotifStore,
    readonly hotkeys: MotifHotkeyMap,
    readonly settings: DeviceSettingsState,
    readonly hostContext: HostContext,
    readonly callbacks: PlaybackControllerCallbacks,
  ) {}

  /**
   * Flush Max `pipe` queues and reset retained non-repeat trigger state.
   *
   * Repeat Tasks are intentionally managed separately so replacing one cycle
   * does not silently stop a held repeat.
   */
  clearScheduledNotes(): void {
    this.callbacks.emitClearScheduledNotes();
    this.activeTriggers.clear();
    this.sustainedReleases.clear();
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

    if (this.settings.retriggerMode === "replace" || this.settings.triggerMode === "latch") {
      this.clearScheduledNotes();
    }

    this.callbacks.onPreviewTrigger(triggerPitch);

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

    for (const event of compileMotif(
      selected,
      {
        ...this.hostContext,
        tempo: this.hostContext.tempo * this.settings.tempoMultiplier,
      },
      options,
    )) {
      this.callbacks.emitScheduledEvent(event.pitch, event.velocity, event.channel, event.offsetMs);
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
    if (!repeat) return;

    repeat.task.cancel();
    repeat.task.freepeer();
    this.heldRepeats.delete(triggerPitch);
    this.sustainedRepeatReleases.delete(triggerPitch);
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
    if (this.heldRepeats.has(triggerPitch)) return;

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
    const instanceId = this.triggerMotif(triggerPitch, triggerVelocity, channel, {
      motifId: motif.id,
      launchOffsetTicks: firstLaunchOffset,
    });
    if (instanceId === undefined) return;

    let repeat: HeldRepeat;
    const task = new Task(() => {
      if (this.heldRepeats.get(triggerPitch) !== repeat) return;

      const repeatedMotif = this.store.resolve(repeat.motifId);
      if (!repeatedMotif) {
        this.stopHeldRepeat(triggerPitch);
        return;
      }
      const repeatedInstance = this.triggerMotif(triggerPitch, repeat.velocity, repeat.channel, {
        motifId: repeat.motifId,
        launchOffsetTicks: 0,
      });
      if (repeatedInstance === undefined || this.heldRepeats.get(triggerPitch) !== repeat) {
        return;
      }

      repeat.task.schedule(
        motifRepeatDelayFor(
          repeatedMotif,
          this.settings.meterMode,
          this.hostContext,
          this.settings.tempoMultiplier,
        ),
      );
    });
    repeat = {
      motifId: motif.id,
      velocity: triggerVelocity,
      channel,
      task,
    };
    this.heldRepeats.set(triggerPitch, repeat);

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
      );
    task.schedule(Math.max(MIN_REPEAT_DELAY_MS, firstDelay));
    this.callbacks.emitStatus("repeat-started", motif.id, triggerPitch);
  }

  /**
   * Cancel a retained trigger and report its release.
   * @param {number} triggerPitch Trigger MIDI pitch.
   */
  cancelTrigger(triggerPitch: number): void {
    if (!this.activeTriggers.has(triggerPitch)) return;
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
    if (!isTrigger) return;

    if (mapping?.action === "select") {
      if (velocity > 0) {
        this.callbacks.onSelectMotif(mapping.motifId);
        if (this.store.currentId === mapping.motifId) {
          this.callbacks.emitStatus("selected", mapping.motifId, pitch);
        }
      }
      return;
    }

    if (this.settings.triggerMode === "hold-repeat" || this.heldRepeats.has(pitch)) {
      if (velocity > 0) {
        if (this.settings.triggerMode === "hold-repeat") {
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
      if (this.settings.triggerMode === "toggle" && this.activeTriggers.has(pitch)) {
        this.cancelTrigger(pitch);
        return;
      }

      const instanceId = this.triggerMotif(pitch, velocity, channel);
      if (instanceId !== undefined && this.settings.triggerMode !== "one-shot") {
        this.activeTriggers.add(pitch);
      }
      return;
    }

    if (this.settings.triggerMode === "hold") {
      if (this.sustainDown) {
        this.sustainedReleases.add(pitch);
      } else {
        this.cancelTrigger(pitch);
      }
    } else if (this.settings.triggerMode === "release-tail") {
      this.activeTriggers.delete(pitch);
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
    if (controller !== 64) return;

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

  /** Stop repeats and flush all scheduled notes. */
  panic(): void {
    this.stopAllHeldRepeats();
    this.clearScheduledNotes();
    this.callbacks.emitStatus("panic");
  }

  /** Apply the cleanup required when Live transport stops. */
  onTransportStopped(): void {
    this.stopAllHeldRepeats();
    this.clearScheduledNotes();
  }
}
