import { clamp } from "../core/math.js";
import { transformMotif } from "../core/transform-motif.js";
import type {
  LaunchQuantization,
  MeterMode,
  Motif,
  PassThroughPolicy,
  PitchMode,
  RepeatRounding,
  RepeatRoundingOverride,
  RetriggerMode,
  TriggerMode,
  TriggerModeOverride,
  TriggerZone,
} from "../core/types.js";

/**
 * In-memory mirror of performance controls restored by Live parameters.
 *
 * These values affect playback and preview, but they are not motif-catalog data
 * and must not be added to the engine-owned persisted-state Blob.
 */
export class DeviceSettingsState {
  /** Optional override for the selected motif's stored pitch interpretation. */
  pitchModeOverride: PitchMode | undefined;
  /** Whether source timing is preserved or fitted to the current Live bar. */
  meterMode: MeterMode = "preserve";
  /** Whether a new trigger replaces or overlaps already scheduled notes. */
  retriggerMode: RetriggerMode = "replace";
  /** Keyboard trigger lifecycle override, or delegation to each motif. */
  triggerMode: TriggerModeOverride = "motif";
  /** Hold-repeat length-rounding override, or delegation to each motif. */
  repeatRounding: RepeatRoundingOverride = "motif";
  /** Grid used to delay launches while Live is playing. */
  launchQuantization: LaunchQuantization = "immediate";
  /** Dry-note pass-through policy. */
  passThroughPolicy: PassThroughPolicy = "non-triggers";
  /** Inclusive keyboard trigger range. */
  triggerZone: TriggerZone = { low: 36, high: 84 };
  /** Device-local tempo ratio. */
  tempoMultiplier = 1;
  /** Mirror encoded pitch offsets around the trigger note. */
  invert = false;
  /** Mirror note spans across the motif length. */
  reverse = false;

  /**
   * Resolve the trigger lifecycle for one motif, defaulting to `one-shot` behavior.
   * @param {Motif} motif Stored motif document.
   * @returns {TriggerMode} Resolved trigger mode.
   */
  triggerModeFor(motif: Motif): TriggerMode {
    return this.triggerMode === "motif" ? (motif.triggerMode ?? "one-shot") : this.triggerMode;
  }

  /**
   * Resolve the hold-repeat rounding grid for one motif, defaulting to `exact` behavior.
   * @param {Motif} motif Stored motif document.
   * @returns {RepeatRounding} Resolved repeat rounding.
   */
  repeatRoundingFor(motif: Motif): RepeatRounding {
    return this.repeatRounding === "motif"
      ? (motif.repeatRounding ?? "exact")
      : this.repeatRounding;
  }

  /**
   * Clamp the lower trigger bound without crossing the current upper bound.
   * @param {number} value Requested MIDI pitch.
   * @returns {TriggerZone} Updated inclusive trigger zone.
   */
  setTriggerLow(value: number): TriggerZone {
    this.triggerZone.low = Math.min(this.triggerZone.high, Math.round(clamp(value, 0, 127)));
    return this.triggerZone;
  }

  /**
   * Clamp the upper trigger bound without crossing the current lower bound.
   * @param {number} value Requested MIDI pitch.
   * @returns {TriggerZone} Updated inclusive trigger zone.
   */
  setTriggerHigh(value: number): TriggerZone {
    this.triggerZone.high = Math.max(this.triggerZone.low, Math.round(clamp(value, 0, 127)));
    return this.triggerZone;
  }

  /**
   * Apply the current non-destructive performance transforms.
   * @param {Motif} motif Stored motif document.
   * @returns {Motif} Transient transformed motif, or the original when unchanged.
   */
  transform(motif: Motif): Motif {
    return transformMotif(motif, {
      invert: this.invert,
      reverse: this.reverse,
    });
  }
}
