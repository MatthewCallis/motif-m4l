"use strict";
(() => {
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);

  // src/core/math.ts
  function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
  }
  function mod(value, divisor) {
    return (value % divisor + divisor) % divisor;
  }
  function floorDiv(value, divisor) {
    return Math.floor(value / divisor);
  }

  // src/core/pitch.ts
  function normalizeScaleIntervals(intervals) {
    const normalized = [...new Set(intervals.map((value) => mod(Math.round(value), 12)))].sort(
      (left, right) => left - right
    );
    if (!normalized.includes(0)) {
      normalized.unshift(0);
    }
    return normalized;
  }
  function transposeByScaleDegree(triggerPitch, degreeOffset, rootNote, scaleIntervals) {
    const intervals = normalizeScaleIntervals(scaleIntervals);
    const rootPitchClass = mod(rootNote, 12);
    const triggerPitchClass = mod(triggerPitch, 12);
    const triggerInterval = mod(triggerPitchClass - rootPitchClass, 12);
    const triggerDegree = intervals.indexOf(triggerInterval);
    if (triggerDegree === -1) {
      const octave2 = floorDiv(degreeOffset, intervals.length);
      const degree2 = mod(degreeOffset, intervals.length);
      return clamp(triggerPitch + octave2 * 12 + (intervals[degree2] ?? 0), 0, 127);
    }
    const rootBelowTrigger = triggerPitch - triggerInterval;
    const targetDegree = triggerDegree + degreeOffset;
    const octave = floorDiv(targetDegree, intervals.length);
    const degree = mod(targetDegree, intervals.length);
    return clamp(rootBelowTrigger + octave * 12 + (intervals[degree] ?? 0), 0, 127);
  }
  function transposeChromatically(triggerPitch, semitones) {
    return clamp(triggerPitch + semitones, 0, 127);
  }
  function transposeHybrid(triggerPitch, degreeOffset, accidental, rootNote, scaleIntervals) {
    return clamp(
      transposeByScaleDegree(triggerPitch, degreeOffset, rootNote, scaleIntervals) + accidental,
      0,
      127
    );
  }

  // src/core/types.ts
  var PPQ = 960;
  var MOTIF_SCHEMA_VERSION = 1;

  // src/core/timing.ts
  function barLengthTicks(signature) {
    return signature.numerator * PPQ * (4 / signature.denominator);
  }
  function ticksToMilliseconds(ticks, tempo) {
    const safeTempo = Number.isFinite(tempo) && tempo > 0 ? tempo : 120;
    return ticks / PPQ * (6e4 / safeTempo);
  }
  function quantizationTicks(quantization, signature) {
    switch (quantization) {
      case "1/16":
        return PPQ / 4;
      case "1/8":
        return PPQ / 2;
      case "1/4":
        return PPQ;
      case "bar":
        return barLengthTicks(signature);
      default:
        return 0;
    }
  }
  function ticksUntilNextBoundary(positionTicks, gridTicks) {
    if (!Number.isFinite(positionTicks) || gridTicks <= 0) {
      return 0;
    }
    const remainder = (positionTicks % gridTicks + gridTicks) % gridTicks;
    return remainder === 0 ? 0 : gridTicks - remainder;
  }

  // src/core/compile-motif.ts
  function applyVelocityCurve(value, curve) {
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
  function resolveVelocity(note2, motif2, triggerVelocity) {
    const curvedTrigger = applyVelocityCurve(triggerVelocity, motif2.velocityCurve);
    const base = note2.velocity ?? curvedTrigger;
    const scaled = base * (note2.velocityScale ?? 1);
    return Math.round(clamp(scaled + (note2.velocityOffset ?? 0), 1, 127));
  }
  function resolveMotifPitch(note2, motif2, host, options) {
    const pitchMode = options.pitchMode ?? motif2.pitchMode;
    switch (pitchMode) {
      case "chromatic":
        return transposeChromatically(options.triggerPitch, note2.pitch + (note2.accidental ?? 0));
      case "hybrid":
        return transposeHybrid(
          options.triggerPitch,
          note2.pitch,
          note2.accidental ?? 0,
          host.rootNote,
          host.scaleIntervals
        );
      default:
        return transposeByScaleDegree(
          options.triggerPitch,
          note2.pitch,
          host.rootNote,
          host.scaleIntervals
        );
    }
  }
  function effectiveDuration(note2, next, motif2) {
    const gate = Math.max(0.01, note2.gate ?? motif2.defaultGate ?? 1);
    let duration = note2.duration * gate;
    if (note2.legato && next && next.at > note2.at) {
      duration = Math.max(duration, next.at - note2.at);
    }
    if (note2.tie && next && next.at <= note2.at + note2.duration && next.pitch === note2.pitch && (next.accidental ?? 0) === (note2.accidental ?? 0)) {
      duration = Math.max(duration, next.at + next.duration - note2.at);
    }
    return duration;
  }
  function compileMotif(motif2, host, options) {
    const targetBar = barLengthTicks(host.timeSignature);
    const sourceBar = barLengthTicks(motif2.sourceMeter);
    const timeScale = options.meterMode === "fit-bar" ? targetBar / sourceBar : 1;
    const channel = Math.round(clamp(options.channel, 1, 16));
    const launchOffsetTicks2 = Math.max(0, options.launchOffsetTicks ?? 0);
    const instanceId = options.instanceId ?? 0;
    const events = [];
    for (let index = 0; index < motif2.notes.length; index += 1) {
      const note2 = motif2.notes[index];
      if (!note2) {
        continue;
      }
      const next = motif2.notes[index + 1];
      const pitch = resolveMotifPitch(note2, motif2, host, options);
      const velocity = resolveVelocity(note2, motif2, options.triggerVelocity);
      const noteOnTicks = launchOffsetTicks2 + Math.max(0, note2.at * timeScale);
      const duration = effectiveDuration(note2, next, motif2) * timeScale;
      const noteOffTicks = Math.max(noteOnTicks, noteOnTicks + duration);
      events.push({
        pitch,
        velocity,
        channel,
        offsetTicks: noteOnTicks,
        offsetMs: ticksToMilliseconds(noteOnTicks, host.tempo),
        instanceId
      });
      events.push({
        pitch,
        velocity: 0,
        channel,
        offsetTicks: noteOffTicks,
        offsetMs: ticksToMilliseconds(noteOffTicks, host.tempo),
        instanceId
      });
    }
    return events.sort((left, right) => {
      if (left.offsetTicks !== right.offsetTicks) {
        return left.offsetTicks - right.offsetTicks;
      }
      return left.velocity - right.velocity;
    });
  }

  // src/core/preview.ts
  function midiNoteName(pitchValue) {
    const pitch = Math.max(0, Math.min(127, Math.round(pitchValue)));
    const names = ["C", "C\u266F", "D", "D\u266F", "E", "F", "F\u266F", "G", "G\u266F", "A", "A\u266F", "B"];
    const octave = Math.floor(pitch / 12) - 2;
    return `${names[pitch % 12] ?? "C"}${octave}`;
  }
  function buildMotifPreview(motif2, host, triggerPitch, pitchModeOverride2, meterMode2, maxNotes = 64) {
    const effectivePitchMode = pitchModeOverride2 ?? motif2.pitchMode;
    const sourceBarTicks = barLengthTicks(motif2.sourceMeter);
    const targetBarTicks = barLengthTicks(host.timeSignature);
    const timeScale = meterMode2 === "fit-bar" ? targetBarTicks / sourceBarTicks : 1;
    const notes = motif2.notes.slice(0, maxNotes).map((note2) => ({
      pitch: resolveMotifPitch(note2, motif2, host, {
        channel: 1,
        meterMode: meterMode2,
        pitchMode: effectivePitchMode,
        triggerPitch,
        triggerVelocity: 100
      }),
      atTicks: Math.max(0, note2.at * timeScale),
      durationTicks: Math.max(1, note2.duration * timeScale)
    }));
    const pitches = notes.map((note2) => note2.pitch);
    const minimum = pitches.length > 0 ? Math.min(...pitches) : triggerPitch;
    const maximum = pitches.length > 0 ? Math.max(...pitches) : triggerPitch;
    const lowPitch = minimum === maximum ? minimum - 1 : minimum;
    const highPitch = minimum === maximum ? maximum + 1 : maximum;
    const totalTicks = Math.max(1, motif2.length * timeScale);
    const bars = totalTicks / Math.max(1, meterMode2 === "fit-bar" ? targetBarTicks : sourceBarTicks);
    return {
      notes,
      noteNames: notes.map((note2) => midiNoteName(note2.pitch)),
      lowPitch,
      highPitch,
      bars,
      effectivePitchMode,
      triggerPitch
    };
  }

  // src/generated/builtins.ts
  var BUILTIN_MOTIFS = [
    {
      "schemaVersion": 1,
      "id": "chromatic-turn",
      "name": "Chromatic Turn",
      "description": "Fixed-interval phrase that ignores the selected scale.",
      "pitchMode": "chromatic",
      "sourceMeter": {
        "numerator": 4,
        "denominator": 4
      },
      "length": 3360,
      "defaultGate": 0.82,
      "metadata": {
        "tags": [
          "demo",
          "chromatic"
        ]
      },
      "notes": [
        {
          "at": 0,
          "duration": 480,
          "pitch": 0
        },
        {
          "at": 480,
          "duration": 480,
          "pitch": 2
        },
        {
          "at": 960,
          "duration": 480,
          "pitch": 3
        },
        {
          "at": 1440,
          "duration": 480,
          "pitch": 7,
          "velocityOffset": 6
        },
        {
          "at": 1920,
          "duration": 480,
          "pitch": 5
        },
        {
          "at": 2400,
          "duration": 480,
          "pitch": 2
        },
        {
          "at": 2880,
          "duration": 480,
          "pitch": 0,
          "gate": 0.95
        }
      ]
    },
    {
      "schemaVersion": 1,
      "id": "mitsuda-lick",
      "name": "Mitsuda Lick",
      "description": "Canonical two-bar contour: long tonic, step down, leap up a fourth, then a fast chromatic descent to tonic.",
      "pitchMode": "chromatic",
      "sourceMeter": {
        "numerator": 4,
        "denominator": 4
      },
      "length": 7680,
      "defaultGate": 0.92,
      "velocityCurve": {
        "outputMin": 48,
        "outputMax": 118,
        "exponent": 0.85
      },
      "metadata": {
        "author": "Traditional/canonical VGM vocabulary",
        "source": "https://www.reddit.com/r/explainlikeimfive/comments/1cpt2p8/eli5_what_is_the_mitsuda_lick_and_why_is_it/",
        "license": "Descriptive melodic vocabulary; verify provenance before commercial library distribution",
        "tags": [
          "mitsuda",
          "chrono-trigger",
          "chromatic",
          "cadence",
          "two-bar"
        ],
        "suggestedModes": [
          "minor",
          "dorian",
          "aeolian"
        ]
      },
      "notes": [
        {
          "at": 0,
          "duration": 2880,
          "pitch": 0,
          "velocityOffset": 5,
          "gate": 0.96
        },
        {
          "at": 2880,
          "duration": 960,
          "pitch": -2,
          "velocityOffset": -4
        },
        {
          "at": 3840,
          "duration": 960,
          "pitch": 3,
          "velocityOffset": 7
        },
        {
          "at": 4800,
          "duration": 480,
          "pitch": 2,
          "velocityOffset": 1
        },
        {
          "at": 5280,
          "duration": 480,
          "pitch": 1,
          "velocityOffset": -2
        },
        {
          "at": 5760,
          "duration": 1920,
          "pitch": 0,
          "velocityOffset": 6,
          "gate": 0.98
        }
      ]
    },
    {
      "schemaVersion": 1,
      "id": "quick-answer",
      "name": "Quick Answer",
      "description": "Short sixteenth-note response with a wider final interval.",
      "pitchMode": "scale",
      "sourceMeter": {
        "numerator": 4,
        "denominator": 4
      },
      "length": 1920,
      "defaultGate": 0.72,
      "metadata": {
        "tags": [
          "demo",
          "response"
        ]
      },
      "notes": [
        {
          "at": 0,
          "duration": 240,
          "pitch": 0
        },
        {
          "at": 240,
          "duration": 240,
          "pitch": 2
        },
        {
          "at": 480,
          "duration": 240,
          "pitch": 1
        },
        {
          "at": 720,
          "duration": 240,
          "pitch": 3
        },
        {
          "at": 960,
          "duration": 240,
          "pitch": 2
        },
        {
          "at": 1200,
          "duration": 240,
          "pitch": 5,
          "velocityOffset": 5
        },
        {
          "at": 1440,
          "duration": 480,
          "pitch": 4,
          "gate": 0.9
        }
      ]
    },
    {
      "schemaVersion": 1,
      "id": "scale-turn",
      "name": "Scale Turn",
      "description": "Compact scale-aware turn used to validate one-key phrase triggering.",
      "pitchMode": "scale",
      "sourceMeter": {
        "numerator": 4,
        "denominator": 4
      },
      "length": 3360,
      "defaultGate": 0.82,
      "metadata": {
        "tags": [
          "demo",
          "scale",
          "turn"
        ]
      },
      "notes": [
        {
          "at": 0,
          "duration": 480,
          "pitch": 0,
          "velocityOffset": 4
        },
        {
          "at": 480,
          "duration": 480,
          "pitch": 1
        },
        {
          "at": 960,
          "duration": 480,
          "pitch": 2,
          "velocityOffset": 3
        },
        {
          "at": 1440,
          "duration": 480,
          "pitch": 4,
          "velocityOffset": 7
        },
        {
          "at": 1920,
          "duration": 480,
          "pitch": 3
        },
        {
          "at": 2400,
          "duration": 480,
          "pitch": 1,
          "velocityOffset": -3
        },
        {
          "at": 2880,
          "duration": 480,
          "pitch": 0,
          "velocityOffset": 2,
          "gate": 0.95
        }
      ]
    }
  ];

  // src/library/validate.ts
  function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
  function isFiniteNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
  }
  function isPitchMode(value) {
    return value === "scale" || value === "chromatic" || value === "hybrid";
  }
  function validateMeter(value, path, errors) {
    if (!isRecord(value)) {
      errors.push(`${path} must be an object`);
      return false;
    }
    let valid = true;
    if (!Number.isInteger(value.numerator) || Number(value.numerator) < 1) {
      errors.push(`${path}.numerator must be a positive integer`);
      valid = false;
    }
    if (![1, 2, 4, 8, 16, 32].includes(Number(value.denominator))) {
      errors.push(`${path}.denominator must be 1, 2, 4, 8, 16, or 32`);
      valid = false;
    }
    return valid;
  }
  function validateOptionalNumber(record, field, path, errors, predicate = () => true, requirement = "a finite number") {
    const value = record[field];
    if (value === void 0) {
      return;
    }
    if (!isFiniteNumber(value) || !predicate(value)) {
      errors.push(`${path}.${field} must be ${requirement}`);
    }
  }
  function validateStringArray(value, path, errors) {
    if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
      errors.push(`${path} must be an array of strings`);
    }
  }
  function validateNote(value, index, errors) {
    const path = `notes[${index}]`;
    if (!isRecord(value)) {
      errors.push(`${path} must be an object`);
      return false;
    }
    if (!isFiniteNumber(value.at) || value.at < 0) {
      errors.push(`${path}.at must be a non-negative number`);
    }
    if (!isFiniteNumber(value.duration) || value.duration <= 0) {
      errors.push(`${path}.duration must be greater than zero`);
    }
    if (!isFiniteNumber(value.pitch)) {
      errors.push(`${path}.pitch must be a number`);
    }
    validateOptionalNumber(value, "accidental", path, errors);
    validateOptionalNumber(
      value,
      "velocity",
      path,
      errors,
      (number) => number >= 1 && number <= 127,
      "between 1 and 127"
    );
    validateOptionalNumber(value, "velocityOffset", path, errors);
    validateOptionalNumber(
      value,
      "velocityScale",
      path,
      errors,
      (number) => number >= 0,
      "zero or greater"
    );
    validateOptionalNumber(
      value,
      "gate",
      path,
      errors,
      (number) => number > 0,
      "greater than zero"
    );
    for (const field of ["legato", "tie"]) {
      const fieldValue = value[field];
      if (fieldValue !== void 0 && typeof fieldValue !== "boolean") {
        errors.push(`${path}.${field} must be a boolean`);
      }
    }
    return true;
  }
  function validateVelocityCurve(value, errors) {
    if (value === void 0) {
      return;
    }
    if (!isRecord(value)) {
      errors.push("velocityCurve must be an object");
      return;
    }
    for (const field of ["inputMin", "inputMax", "outputMin", "outputMax"]) {
      validateOptionalNumber(value, field, "velocityCurve", errors);
    }
    validateOptionalNumber(
      value,
      "exponent",
      "velocityCurve",
      errors,
      (number) => number > 0,
      "greater than zero"
    );
  }
  function validateMetadata(value, errors) {
    if (value === void 0) {
      return;
    }
    if (!isRecord(value)) {
      errors.push("metadata must be an object");
      return;
    }
    for (const field of ["author", "source", "license"]) {
      if (value[field] !== void 0 && typeof value[field] !== "string") {
        errors.push(`metadata.${field} must be a string`);
      }
    }
    if (value.tags !== void 0) {
      validateStringArray(value.tags, "metadata.tags", errors);
    }
    if (value.suggestedModes !== void 0) {
      validateStringArray(value.suggestedModes, "metadata.suggestedModes", errors);
    }
    validateOptionalNumber(value, "pickupTicks", "metadata", errors);
  }
  function validateMotif(value) {
    const errors = [];
    if (!isRecord(value)) {
      return { valid: false, errors: ["motif must be an object"] };
    }
    if (value.schemaVersion !== MOTIF_SCHEMA_VERSION) {
      errors.push(`schemaVersion must be ${MOTIF_SCHEMA_VERSION}`);
    }
    for (const field of ["id", "name", "description"]) {
      if (typeof value[field] !== "string" || value[field].trim().length === 0) {
        errors.push(`${field} must be a non-empty string`);
      }
    }
    if (!isPitchMode(value.pitchMode)) {
      errors.push("pitchMode must be scale, chromatic, or hybrid");
    }
    validateMeter(value.sourceMeter, "sourceMeter", errors);
    if (!isFiniteNumber(value.length) || value.length <= 0) {
      errors.push("length must be greater than zero");
    }
    validateOptionalNumber(
      value,
      "defaultGate",
      "motif",
      errors,
      (number) => number > 0,
      "greater than zero"
    );
    validateVelocityCurve(value.velocityCurve, errors);
    validateMetadata(value.metadata, errors);
    if (!Array.isArray(value.notes) || value.notes.length === 0) {
      errors.push("notes must be a non-empty array");
    } else {
      value.notes.forEach((note2, index) => validateNote(note2, index, errors));
      const motifLength = value.length;
      if (isFiniteNumber(motifLength)) {
        value.notes.forEach((note2, index) => {
          if (isRecord(note2) && isFiniteNumber(note2.at) && isFiniteNumber(note2.duration) && note2.at + note2.duration > motifLength) {
            errors.push(`notes[${index}] extends beyond motif length`);
          }
        });
      }
    }
    if (errors.length > 0) {
      return { valid: false, errors };
    }
    return { valid: true, errors, motif: value };
  }

  // src/library/store.ts
  var _motifs;
  var MotifStore = class {
    constructor() {
      __privateAdd(this, _motifs, /* @__PURE__ */ new Map());
      this.resetToBuiltins();
    }
    resetToBuiltins() {
      __privateGet(this, _motifs).clear();
      for (const motif2 of BUILTIN_MOTIFS) {
        __privateGet(this, _motifs).set(motif2.id, motif2);
      }
    }
    add(value) {
      const result = validateMotif(value);
      if (!result.valid || !result.motif) {
        return result.errors;
      }
      __privateGet(this, _motifs).set(result.motif.id, result.motif);
      return [];
    }
    get(id) {
      return __privateGet(this, _motifs).get(id);
    }
    list() {
      return [...__privateGet(this, _motifs).values()].sort((left, right) => left.name.localeCompare(right.name));
    }
  };
  _motifs = new WeakMap();

  // src/max/device.ts
  var store = new MotifStore();
  var triggerMap = /* @__PURE__ */ new Map();
  var activeTriggers = /* @__PURE__ */ new Set();
  var sustainedReleases = /* @__PURE__ */ new Set();
  var currentMotifId = "mitsuda-lick";
  var pitchModeOverride;
  var meterMode = "preserve";
  var retriggerMode = "replace";
  var triggerMode = "one-shot";
  var launchQuantization = "immediate";
  var passThroughPolicy = "non-triggers";
  var triggerLow = 36;
  var triggerHigh = 84;
  var sustainDown = false;
  var initialized = false;
  var instanceCounter = 1;
  var userLibraryPath = "";
  var previewTriggerPitch = 60;
  var previewWasTriggered = false;
  var hostContext = {
    tempo: 120,
    rootNote: 0,
    scaleName: "Major",
    scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
    scaleMode: true,
    timeSignature: { numerator: 4, denominator: 4 },
    isPlaying: false,
    currentSongTime: 0
  };
  function emit(...values) {
    outlet(0, ...values);
  }
  function emitStatus(...values) {
    emit("status", ...values);
  }
  function emitError(message) {
    emit("error", message);
    error(`Motif: ${message}
`);
  }
  function resolveMotif(value) {
    const normalized = String(value).trim();
    return store.get(normalized) ?? store.list().find((item) => item.name === normalized);
  }
  function currentMotif() {
    return store.get(currentMotifId);
  }
  function formatNumber(value) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
  }
  function emitSelectedMotifUi() {
    const selected = currentMotif();
    if (!selected) return;
    const preview = buildMotifPreview(
      selected,
      hostContext,
      previewTriggerPitch,
      pitchModeOverride,
      meterMode
    );
    const normalizedPitches = preview.notes.map((note2) => note2.pitch - preview.lowPitch);
    const previewRange = Math.max(1, preview.highPitch - preview.lowPitch);
    const sourceMeter = `${selected.sourceMeter.numerator}/${selected.sourceMeter.denominator}`;
    const tags = selected.metadata?.tags?.join(" \xB7 ") ?? "custom motif";
    const suggested = selected.metadata?.suggestedModes?.join(", ");
    const tagLine = suggested ? `${tags}  \u2022  suggested: ${suggested}` : tags;
    const bars = `${formatNumber(preview.bars)} ${preview.bars === 1 ? "bar" : "bars"}`;
    const stats = `${preview.notes.length} notes  \u2022  ${bars}  \u2022  ${sourceMeter} source  \u2022  ${preview.effectivePitchMode}`;
    const root = `${midiNoteName(preview.triggerPitch)} anchor  \u2022  ${hostContext.scaleName}  \u2022  ${preview.effectivePitchMode}`;
    emit("ui", "preview-pitches", ...normalizedPitches);
    emit("ui", "preview-range", previewRange);
    emit("ui", "preview-notes", preview.noteNames.join("  \xB7  "));
    emit("ui", "preview-root", root);
    emit("ui", "motif-title", selected.name);
    emit("ui", "motif-description", selected.description);
    emit("ui", "motif-stats", stats);
    emit("ui", "motif-tags", tagLine);
  }
  function flattenValues(values) {
    return values.flatMap((value) => Array.isArray(value) ? value : [value]);
  }
  function numbers(values) {
    return flattenValues(values).map(Number).filter(Number.isFinite);
  }
  function clearScheduledNotes() {
    emit("clear");
    emit("panic");
    activeTriggers.clear();
    sustainedReleases.clear();
  }
  function updateHost(property, values) {
    const numeric = numbers(values);
    switch (property) {
      case "tempo": {
        const value = numeric[0];
        if (value !== void 0 && value > 0) hostContext.tempo = value;
        break;
      }
      case "root_note": {
        const value = numeric[0];
        if (value !== void 0) {
          hostContext.rootNote = Math.round(value);
          if (!previewWasTriggered) previewTriggerPitch = 60 + hostContext.rootNote;
          emitSelectedMotifUi();
        }
        break;
      }
      case "scale_mode": {
        hostContext.scaleMode = (numeric[0] ?? 0) !== 0;
        emitSelectedMotifUi();
        break;
      }
      case "scale_intervals": {
        if (numeric.length > 0) {
          hostContext.scaleIntervals = numeric.map(Math.round);
          emitSelectedMotifUi();
        }
        break;
      }
      case "scale_name": {
        const value = flattenValues(values).map(String).join(" ").trim();
        if (value) {
          hostContext.scaleName = value;
          emitSelectedMotifUi();
        }
        break;
      }
      case "signature_numerator": {
        const value = numeric[0];
        if (value !== void 0 && value > 0) {
          hostContext.timeSignature.numerator = Math.round(value);
          emitSelectedMotifUi();
        }
        break;
      }
      case "signature_denominator": {
        const value = numeric[0];
        if (value !== void 0 && value > 0) {
          hostContext.timeSignature.denominator = Math.round(value);
          emitSelectedMotifUi();
        }
        break;
      }
      case "is_playing": {
        const wasPlaying = hostContext.isPlaying;
        hostContext.isPlaying = (numeric[0] ?? 0) !== 0;
        if (wasPlaying && !hostContext.isPlaying) clearScheduledNotes();
        break;
      }
      case "current_song_time": {
        const value = numeric[0];
        if (value !== void 0 && value >= 0) hostContext.currentSongTime = value;
        break;
      }
      default:
        emitError(`Unknown Song property: ${property}`);
        return;
    }
  }
  function song_context(property, ...values) {
    updateHost(String(property), values);
  }
  function listMotifs() {
    emit("motifs-reset");
    for (const item of store.list()) emit("motif-item", item.name);
    emit("motif-selected", currentMotif()?.name ?? currentMotifId);
    emitSelectedMotifUi();
  }
  function emitMidiPassState() {
    emit("midi-pass", passThroughPolicy === "none" ? 0 : 1);
  }
  function initialize() {
    if (!initialized) {
      initialized = true;
      emitStatus("Ready");
      emitMidiPassState();
    }
    listMotifs();
  }
  function launchOffsetTicks() {
    if (!hostContext.isPlaying || launchQuantization === "immediate") return 0;
    const grid = quantizationTicks(launchQuantization, hostContext.timeSignature);
    return ticksUntilNextBoundary(Math.max(0, hostContext.currentSongTime * PPQ), grid);
  }
  function emitScheduledEvent(pitch, velocity, channel, delayMilliseconds) {
    emit("event", pitch, velocity, channel, Math.max(0, delayMilliseconds));
  }
  function emitDirectNote(pitch, velocity, channel) {
    emitScheduledEvent(pitch, velocity, channel, 0);
  }
  function shouldPassDry(isTrigger) {
    return passThroughPolicy === "all" || passThroughPolicy === "non-triggers" && !isTrigger;
  }
  function triggerMotif(triggerPitch, triggerVelocity, channel) {
    const motifId = triggerMap.get(triggerPitch) ?? currentMotifId;
    const selected = resolveMotif(motifId);
    if (!selected) {
      emitError(`Unknown motif: ${motifId}`);
      return void 0;
    }
    if (retriggerMode === "replace" || triggerMode === "latch") clearScheduledNotes();
    previewTriggerPitch = triggerPitch;
    previewWasTriggered = true;
    emitSelectedMotifUi();
    const instanceId = instanceCounter++;
    const options = {
      channel: Math.round(clamp(channel, 1, 16)),
      meterMode,
      triggerPitch: Math.round(triggerPitch),
      triggerVelocity: Math.round(triggerVelocity),
      launchOffsetTicks: launchOffsetTicks(),
      instanceId
    };
    if (pitchModeOverride !== void 0) options.pitchMode = pitchModeOverride;
    for (const event of compileMotif(selected, hostContext, options)) {
      emitScheduledEvent(event.pitch, event.velocity, event.channel, event.offsetMs);
    }
    emitStatus("trigger", motifId, triggerPitch, instanceId);
    return instanceId;
  }
  function cancelTrigger(triggerPitch) {
    if (!activeTriggers.has(triggerPitch)) return;
    clearScheduledNotes();
    emitStatus("release", triggerPitch);
  }
  function note(pitchValue, velocityValue, channelValue = 1) {
    const pitch = Math.round(clamp(pitchValue, 0, 127));
    const velocity = Math.round(clamp(velocityValue, 0, 127));
    const channel = Math.round(clamp(channelValue, 1, 16));
    const isTrigger = triggerMap.has(pitch) || pitch >= triggerLow && pitch <= triggerHigh;
    if (shouldPassDry(isTrigger)) emitDirectNote(pitch, velocity, channel);
    if (!isTrigger) return;
    if (velocity > 0) {
      if (triggerMode === "toggle" && activeTriggers.has(pitch)) {
        cancelTrigger(pitch);
        return;
      }
      const instanceId = triggerMotif(pitch, velocity, channel);
      if (instanceId !== void 0 && triggerMode !== "one-shot") activeTriggers.add(pitch);
      return;
    }
    if (triggerMode === "hold") {
      if (sustainDown) sustainedReleases.add(pitch);
      else cancelTrigger(pitch);
    } else if (triggerMode === "release-tail") {
      activeTriggers.delete(pitch);
    }
  }
  function cc(controllerValue, valueValue, _channel = 1) {
    const controller = Math.round(clamp(controllerValue, 0, 127));
    const value = Math.round(clamp(valueValue, 0, 127));
    if (controller !== 64) return;
    const wasDown = sustainDown;
    sustainDown = value >= 64;
    if (wasDown && !sustainDown) {
      if (sustainedReleases.size > 0) clearScheduledNotes();
      sustainedReleases.clear();
    }
    emitStatus("sustain", sustainDown ? "on" : "off");
  }
  function sustain(value, channel = 1) {
    cc(64, value, channel);
  }
  function motif(value) {
    const selected = resolveMotif(value);
    if (!selected) {
      emitError(`Unknown motif: ${value}`);
      return;
    }
    currentMotifId = selected.id;
    emit("motif-selected", selected.name);
    emitSelectedMotifUi();
    emitStatus("Motif", selected.name);
  }
  function pitch_mode(mode) {
    if (mode === "auto") pitchModeOverride = void 0;
    else if (mode === "scale" || mode === "chromatic" || mode === "hybrid") pitchModeOverride = mode;
    else {
      emitError(`Unknown pitch mode: ${mode}`);
      return;
    }
    emitSelectedMotifUi();
    emitStatus("Pitch", mode);
  }
  function meter_mode(mode) {
    if (mode !== "preserve" && mode !== "fit-bar") {
      emitError(`Unknown meter mode: ${mode}`);
      return;
    }
    meterMode = mode;
    emitSelectedMotifUi();
    emitStatus("Meter", mode);
  }
  function retrigger(mode) {
    if (mode === 1 || mode === "replace") retriggerMode = "replace";
    else if (mode === 0 || mode === "overlap") retriggerMode = "overlap";
    else {
      emitError(`Unknown retrigger mode: ${String(mode)}`);
      return;
    }
    emitStatus("retrigger", retriggerMode);
  }
  function trigger_mode(mode) {
    const valid = ["one-shot", "hold", "toggle", "latch", "release-tail"];
    if (!valid.includes(mode)) {
      emitError(`Unknown trigger mode: ${mode}`);
      return;
    }
    triggerMode = mode;
    emitStatus("trigger-mode", triggerMode);
  }
  function launch_quantization(value) {
    const valid = ["immediate", "1/16", "1/8", "1/4", "bar"];
    if (!valid.includes(value)) {
      emitError(`Unknown launch quantization: ${value}`);
      return;
    }
    launchQuantization = value;
    emitStatus("quantization", launchQuantization);
  }
  function pass_through(value) {
    const valid = ["none", "non-triggers", "all"];
    if (!valid.includes(value)) {
      emitError(`Unknown pass-through policy: ${value}`);
      return;
    }
    passThroughPolicy = value;
    emitMidiPassState();
    emitStatus("pass-through", passThroughPolicy);
  }
  function trigger_low(value) {
    triggerLow = Math.min(triggerHigh, Math.round(clamp(value, 0, 127)));
    emitStatus("trigger-zone", triggerLow, triggerHigh);
  }
  function trigger_high(value) {
    triggerHigh = Math.max(triggerLow, Math.round(clamp(value, 0, 127)));
    emitStatus("trigger-zone", triggerLow, triggerHigh);
  }
  function map_trigger(pitchValue, motifId) {
    const pitch = Math.round(clamp(pitchValue, 0, 127));
    const selected = resolveMotif(motifId);
    if (!selected) {
      emitError(`Cannot map ${pitch}: unknown motif ${motifId}`);
      return;
    }
    triggerMap.set(pitch, selected.id);
    emitStatus("mapped", pitch, motifId);
  }
  function unmap_trigger(pitchValue) {
    const pitch = Math.round(clamp(pitchValue, 0, 127));
    triggerMap.delete(pitch);
    emitStatus("unmapped", pitch);
  }
  function clear_trigger_map() {
    triggerMap.clear();
    emitStatus("map-cleared");
  }
  function readJsonFile(filename) {
    const file = new File(filename, "read");
    if (!file.isopen) throw new Error("could not open file");
    try {
      return JSON.parse(file.readstring(file.eof));
    } finally {
      file.close();
    }
  }
  function loadUserLibrary() {
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
      if (filename.toLowerCase().endsWith(".json")) {
        const separator = folder.pathname.endsWith("/") || folder.pathname.endsWith(":") ? "" : "/";
        const fullPath = `${folder.pathname}${separator}${filename}`;
        try {
          const errors = store.add(readJsonFile(fullPath));
          if (errors.length > 0) emitError(`${filename}: ${errors.join("; ")}`);
        } catch (reason) {
          emitError(`${filename}: ${reason instanceof Error ? reason.message : String(reason)}`);
        }
      }
      folder.next();
    }
    folder.close();
  }
  function library_path(path) {
    userLibraryPath = String(path);
    loadUserLibrary();
    if (!store.get(currentMotifId)) currentMotifId = store.list()[0]?.id ?? "mitsuda-lick";
    listMotifs();
    emitStatus("library", userLibraryPath || "built-ins");
  }
  function refresh_library() {
    loadUserLibrary();
    listMotifs();
    emitStatus("library-refreshed", store.list().length);
  }
  function panic() {
    clearScheduledNotes();
    emitStatus("panic");
  }
  function dump_context() {
    emit(
      "context",
      hostContext.tempo,
      hostContext.rootNote,
      hostContext.scaleName,
      ...hostContext.scaleIntervals
    );
  }
  var handlers = {
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
    song_context
  };
  globalThis.__motifHandlers = handlers;
})();
function initialize() { return globalThis.__motifHandlers.initialize.apply(null, arguments); }
function note() { return globalThis.__motifHandlers.note.apply(null, arguments); }
function cc() { return globalThis.__motifHandlers.cc.apply(null, arguments); }
function sustain() { return globalThis.__motifHandlers.sustain.apply(null, arguments); }
function motif() { return globalThis.__motifHandlers.motif.apply(null, arguments); }
function pitch_mode() { return globalThis.__motifHandlers.pitch_mode.apply(null, arguments); }
function meter_mode() { return globalThis.__motifHandlers.meter_mode.apply(null, arguments); }
function retrigger() { return globalThis.__motifHandlers.retrigger.apply(null, arguments); }
function trigger_mode() { return globalThis.__motifHandlers.trigger_mode.apply(null, arguments); }
function launch_quantization() { return globalThis.__motifHandlers.launch_quantization.apply(null, arguments); }
function pass_through() { return globalThis.__motifHandlers.pass_through.apply(null, arguments); }
function trigger_low() { return globalThis.__motifHandlers.trigger_low.apply(null, arguments); }
function trigger_high() { return globalThis.__motifHandlers.trigger_high.apply(null, arguments); }
function map_trigger() { return globalThis.__motifHandlers.map_trigger.apply(null, arguments); }
function unmap_trigger() { return globalThis.__motifHandlers.unmap_trigger.apply(null, arguments); }
function clear_trigger_map() { return globalThis.__motifHandlers.clear_trigger_map.apply(null, arguments); }
function library_path() { return globalThis.__motifHandlers.library_path.apply(null, arguments); }
function refresh_library() { return globalThis.__motifHandlers.refresh_library.apply(null, arguments); }
function panic() { return globalThis.__motifHandlers.panic.apply(null, arguments); }
function list_motifs() { return globalThis.__motifHandlers.list_motifs.apply(null, arguments); }
function dump_context() { return globalThis.__motifHandlers.dump_context.apply(null, arguments); }
function song_context() { return globalThis.__motifHandlers.song_context.apply(null, arguments); }
function anything() {
  const handler = globalThis.__motifHandlers[this.messagename];
  if (typeof handler !== 'function') {
    error('Motif: unknown message ' + this.messagename + '\n');
    return;
  }
  return handler.apply(null, arguments);
}
//# sourceMappingURL=motif-device.js.map
