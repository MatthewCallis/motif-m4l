/**
 * Compile a relative motif phrase into timed MIDI note-on/off events using
 * the current Live host context (tempo, scale, meter) and trigger options.
 */

import { clamp } from "./math.js";
import { convertMotifPitchMode, decodeSemitoneOffset } from "./import-notes.js";
import { knownScaleIntervals } from "./scales.js";
import {
  quantizePitchToScale,
  scaleDegreeSemitoneOffset,
  transposeByScaleDegree,
  transposeChromatically,
  transposeHybrid,
} from "./pitch.js";
import { barLengthTicks, ticksToMilliseconds } from "./timing.js";
import type {
  CompileOptions,
  HostContext,
  Motif,
  MotifNote,
  ScheduledMidiEvent,
  VelocityCurve,
} from "./types.js";

/**
 * Apply a velocity curve to a value, clamped to the output range.
 *
 * @param {number} value The value to apply the curve to.
 * @param {VelocityCurve | undefined} curve The velocity curve.
 * @returns {number} The value after the curve is applied. If no curve is provided, the value is returned unchanged.
 */
function applyVelocityCurve(value: number, curve?: VelocityCurve): number {
  if (!curve) {
    return value;
  }
  const inputMin = curve.inputMin ?? 1;
  const inputMax = curve.inputMax ?? 127;
  const outputMin = curve.outputMin ?? 1;
  const outputMax = curve.outputMax ?? 127;
  const exponent = Math.max(0.01, curve.exponent ?? 1);
  const normalized = clamp((value - inputMin) / Math.max(1, inputMax - inputMin), 0, 1);
  return outputMin + (outputMax - outputMin) * normalized ** exponent;
}

/**
 * Resolve one motif note to a MIDI velocity for the active velocity mode.
 * Applies the motif curve before note-specific velocity scaling and offsets.
 * @param {MotifNote} note The motif note.
 * @param {Motif} motif The motif.
 * @param {number} triggerVelocity The trigger velocity.
 * @returns {number} The resolved velocity.
 */
export function resolveVelocity(note: MotifNote, motif: Motif, triggerVelocity: number): number {
  const curvedTrigger = applyVelocityCurve(triggerVelocity, motif.velocityCurve);
  const base = note.velocity ?? curvedTrigger;
  const scaled = base * (note.velocityScale ?? 1);
  return Math.round(clamp(scaled + (note.velocityOffset ?? 0), 1, 127));
}

interface HybridSpelling {
  degree: number;
  accidental: number;
  targetOffset: number;
  deviation: number;
  canonical: boolean;
}

/**
 * Choose a target-time spelling for one Hybrid note.
 *
 * MIDI records a sounding pitch, not a written note name. When a Chromatic
 * motif is converted to Hybrid, the same source pitch can therefore have more
 * than one valid degree/accidental spelling. For example, a pitch between two
 * source-scale degrees could be encoded as the lower degree plus a sharp or the
 * upper degree plus a flat. Both spellings decode to the same source semitone
 * offset, but they can produce different pitches when their degrees are mapped
 * through a target scale whose adjacent steps have different widths.
 *
 * Conversion deliberately stores one stable canonical spelling. Playback does
 * not rewrite it. Instead, this function reconstructs the exact source offset,
 * considers the canonical degree and its immediate neighbors, and keeps only
 * alternative spellings that:
 *
 * 1. Reconstruct that exact source offset.
 * 2. Require no more than one sharp or flat.
 *
 * Each valid candidate is mapped through the current target scale. The candidate
 * whose target-relative semitone offset is closest to the original source offset
 * wins. This makes Hybrid favor the imported chromatic contour when an ordinary
 * enharmonic respelling can preserve it, without allowing large accidentals to
 * make Hybrid collapse into Chromatic mode. Equal results retain the canonical
 * spelling so existing output remains stable whenever respelling has no benefit.
 *
 * This is intentionally a local per-note heuristic. Natural future extensions
 * belong here: scoring melodic direction or interval continuity across adjacent
 * notes, preferring consistent spellings across repeated pitches, widening the
 * candidate radius for sparse scales, weighting diatonic motion against contour
 * fidelity, or exposing that balance as a user setting. Any phrase-level version
 * should continue to preserve the two invariants above: stored notes are never
 * mutated, and every candidate must decode to the exact source pitch.
 *
 * @param {MotifNote} note The canonically encoded Hybrid note.
 * @param {Motif} motif The source-aware motif.
 * @param {HostContext} host The current target scale context.
 * @param {number} targetAnchor The quantized target trigger pitch.
 * @returns {{ degree: number, accidental: number }} The target-time spelling.
 */
function selectHybridSpelling(
  note: MotifNote,
  motif: Motif,
  host: HostContext,
  targetAnchor: number,
): { degree: number; accidental: number } {
  const canonicalAccidental = note.accidental ?? 0;
  const source = motif.sourcePitchContext;
  const sourceIntervals = source.scaleIntervals ?? knownScaleIntervals(source.scaleName);
  if (!sourceIntervals) {
    return { degree: note.pitch, accidental: canonicalAccidental };
  }

  const sourceContext = {
    triggerPitch: source.anchorPitch,
    rootNote: source.scaleRootNote,
    scaleIntervals: sourceIntervals,
  };
  // Recover the lossless Chromatic offset represented by the stored degree and
  // accidental. This is the fixed reference all candidate spellings must match.
  const originalOffset = decodeSemitoneOffset(note, "hybrid", sourceContext);

  // Score in relative semitones rather than absolute MIDI pitches. The target
  // anchor may move when an off-scale trigger is quantized, but that anchor shift
  // should affect every candidate equally and is not part of the motif contour.
  const spelling = (degree: number, accidental: number): HybridSpelling => {
    const targetOffset =
      scaleDegreeSemitoneOffset(targetAnchor, degree, host.rootNote, host.scaleIntervals) +
      accidental;
    return {
      degree,
      accidental,
      targetOffset,
      deviation: Math.abs(targetOffset - originalOffset),
      canonical: degree === note.pitch && accidental === canonicalAccidental,
    };
  };

  // Seed with the stored spelling so unresolved ties are backward-compatible.
  let best = spelling(note.pitch, canonicalAccidental);

  // Immediate degrees cover the common sharp/flat ambiguity without opening an
  // unbounded search in which sufficiently large accidentals could reproduce any
  // Chromatic pitch. Sparse-scale support could justify a wider, scored radius.
  for (let degree = note.pitch - 1; degree <= note.pitch + 1; degree += 1) {
    const sourceDegreeOffset = scaleDegreeSemitoneOffset(
      source.anchorPitch,
      degree,
      source.scaleRootNote,
      sourceIntervals,
    );
    const accidental = originalOffset - sourceDegreeOffset;
    const isCanonical = degree === note.pitch && accidental === canonicalAccidental;

    // Always admit the stored spelling, including intentionally authored double
    // accidentals. Newly inferred alternatives stay within a conventional single
    // accidental so target fidelity does not overwhelm the scale-relative intent.
    if (!isCanonical && Math.abs(accidental) > 1) {
      continue;
    }

    const candidate = spelling(degree, accidental);

    // Primary objective: preserve the original semitone offset in the new scale.
    // On equal deviation, prefer the canonical spelling. Remaining noncanonical
    // ties use the smaller accidental, then the lower degree for determinism.
    // Phrase-aware continuity or configurable fidelity weights would extend this
    // ordering rather than changing source-equivalence candidate generation.
    const improvesTie =
      candidate.deviation === best.deviation &&
      !best.canonical &&
      (candidate.canonical ||
        Math.abs(candidate.accidental) < Math.abs(best.accidental) ||
        (Math.abs(candidate.accidental) === Math.abs(best.accidental) &&
          candidate.degree < best.degree));
    if (candidate.deviation < best.deviation || improvesTie) {
      best = candidate;
    }
  }

  return { degree: best.degree, accidental: best.accidental };
}

/**
 * Resolve one motif note to an absolute MIDI pitch for the active pitch mode.
 * Uses `options.pitchMode` when set, otherwise `motif.pitchMode`.
 * @param {MotifNote} note The motif note.
 * @param {Motif} motif The motif.
 * @param {HostContext} host The host context.
 * @param {CompileOptions} options The compile options.
 * @param {number | undefined} precomputedAnchor Optional quantized anchor pre-computed once per compile.
 * @returns {number} The resolved pitch.
 */
export function resolveMotifPitch(
  note: MotifNote,
  motif: Motif,
  host: HostContext,
  options: CompileOptions,
  precomputedAnchor?: number,
): number {
  const pitchMode = options.pitchMode ?? motif.pitchMode;

  switch (pitchMode) {
    case "chromatic": {
      return transposeChromatically(options.triggerPitch, note.pitch + (note.accidental ?? 0));
    }
    case "hybrid": {
      const targetAnchor =
        precomputedAnchor ??
        quantizePitchToScale(options.triggerPitch, host.rootNote, host.scaleIntervals);
      const spelling = selectHybridSpelling(note, motif, host, targetAnchor);
      return transposeHybrid(
        targetAnchor,
        spelling.degree,
        spelling.accidental,
        host.rootNote,
        host.scaleIntervals,
      );
    }
    default: {
      const targetAnchor =
        precomputedAnchor ??
        quantizePitchToScale(options.triggerPitch, host.rootNote, host.scaleIntervals);
      const targetPitch = transposeByScaleDegree(
        targetAnchor,
        note.pitch,
        host.rootNote,
        host.scaleIntervals,
      );
      return quantizePitchToScale(targetPitch, host.rootNote, host.scaleIntervals);
    }
  }
}

/**
 * Calculate the effective duration of a motif note, taking into account gate,
 * legato, and tie duration rules.
 * @param {MotifNote} note The motif note.
 * @param {MotifNote | undefined} next The next motif note.
 * @param {Motif} motif The motif.
 * @returns {number} The effective duration in ticks.
 */
export function effectiveDuration(
  note: MotifNote,
  next: MotifNote | undefined,
  motif: Motif,
): number {
  const gate = Math.max(0.01, note.gate ?? motif.defaultGate ?? 1);
  let duration = note.duration * gate;

  if (note.legato && next && next.at > note.at) {
    duration = Math.max(duration, next.at - note.at);
  }

  if (
    note.tie &&
    next &&
    next.at <= note.at + note.duration &&
    next.pitch === note.pitch &&
    (next.accidental ?? 0) === (note.accidental ?? 0)
  ) {
    duration = Math.max(duration, next.at + next.duration - note.at);
  }

  return duration;
}

/**
 * Expand a motif into sorted note-on/off {@link ScheduledMidiEvent}s.
 * Applies meter fit (`preserve` vs `fit-bar`), gate/legato/tie duration rules,
 * velocity curves, and launch offset. Offsets are provided in both ticks and ms
 * so Max `pipe` can schedule from milliseconds.
 * @param {Motif} motif The motif to compile.
 * @param {HostContext} host The host context.
 * @param {CompileOptions} options The compile options.
 * @returns {ScheduledMidiEvent[]} The sorted note-on/off {@link ScheduledMidiEvent}s.
 * @see https://docs.cycling74.com/reference/pipe
 */
export function compileMotif(
  motif: Motif,
  host: HostContext,
  options: CompileOptions,
): ScheduledMidiEvent[] {
  const compiledMotif =
    options.pitchMode && options.pitchMode !== motif.pitchMode
      ? convertMotifPitchMode(motif, options.pitchMode)
      : motif;
  const targetBar = barLengthTicks(host.timeSignature);
  const sourceBar = barLengthTicks(compiledMotif.sourceMeter);
  const timeScale = options.meterMode === "fit-bar" ? targetBar / sourceBar : 1;
  const channel = Math.round(clamp(options.channel, 1, 16));
  const launchOffsetTicks = Math.max(0, options.launchOffsetTicks ?? 0);
  const instanceId = options.instanceId ?? 0;

  // Lifted per-compile constants for the note loop.
  const noteOptions: CompileOptions = { ...options, pitchMode: compiledMotif.pitchMode };
  const curvedTrigger = applyVelocityCurve(options.triggerVelocity, compiledMotif.velocityCurve);
  const targetAnchor =
    compiledMotif.pitchMode !== "chromatic"
      ? quantizePitchToScale(options.triggerPitch, host.rootNote, host.scaleIntervals)
      : undefined;
  const events: ScheduledMidiEvent[] = [];

  for (let index = 0; index < compiledMotif.notes.length; index += 1) {
    const note = compiledMotif.notes[index];
    if (!note) {
      continue;
    }

    const next = compiledMotif.notes[index + 1];
    const pitch = resolveMotifPitch(note, compiledMotif, host, noteOptions, targetAnchor);
    const noteBase = note.velocity ?? curvedTrigger;
    const velocity = Math.round(
      clamp(noteBase * (note.velocityScale ?? 1) + (note.velocityOffset ?? 0), 1, 127),
    );
    const noteOnTicks = launchOffsetTicks + Math.max(0, note.at * timeScale);
    const duration = effectiveDuration(note, next, compiledMotif) * timeScale;
    const noteOffTicks = Math.max(noteOnTicks, noteOnTicks + duration);

    events.push({
      pitch,
      velocity,
      channel,
      offsetTicks: noteOnTicks,
      offsetMs: ticksToMilliseconds(noteOnTicks, host.tempo),
      instanceId,
    });
    events.push({
      pitch,
      velocity: 0,
      channel,
      offsetTicks: noteOffTicks,
      offsetMs: ticksToMilliseconds(noteOffTicks, host.tempo),
      instanceId,
    });
  }

  return events.sort((left, right) => {
    if (left.offsetTicks !== right.offsetTicks) {
      return left.offsetTicks - right.offsetTicks;
    }
    return left.velocity - right.velocity;
  });
}
