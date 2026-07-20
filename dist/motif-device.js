// Hand-written Max v8 bridge. Keep this at the top level and before the bundle.
var inlets = 1;
var outlets = 1;

function anything() {
  var message = messagename;
  var args = arrayfromargs(arguments);

  if (typeof MotifEngine === "undefined" || typeof MotifEngine.dispatch !== "function") {
    error("Motif: engine dispatcher is unavailable for " + message + "\n");
    return;
  }

  return MotifEngine.dispatch(message, args);
}

"use strict";
var MotifEngine = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod2) => __copyProps(__defProp({}, "__esModule", { value: true }), mod2);
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);

  // src/max/device.ts
  var device_exports = {};
  __export(device_exports, {
    dispatch: () => dispatch
  });

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
  function scaleDegreeSemitoneOffset(triggerPitch, degreeOffset, rootNote, scaleIntervals) {
    const intervals = normalizeScaleIntervals(scaleIntervals);
    const rootPitchClass = mod(rootNote, 12);
    const triggerPitchClass = mod(triggerPitch, 12);
    const triggerInterval = mod(triggerPitchClass - rootPitchClass, 12);
    const triggerDegree = intervals.indexOf(triggerInterval);
    if (triggerDegree === -1) {
      const octave2 = floorDiv(degreeOffset, intervals.length);
      const degree2 = mod(degreeOffset, intervals.length);
      return octave2 * 12 + (intervals[degree2] ?? 0);
    }
    const targetDegree = triggerDegree + degreeOffset;
    const octave = floorDiv(targetDegree, intervals.length);
    const degree = mod(targetDegree, intervals.length);
    const targetInterval = octave * 12 + (intervals[degree] ?? 0);
    return targetInterval - triggerInterval;
  }
  function transposeByScaleDegree(triggerPitch, degreeOffset, rootNote, scaleIntervals) {
    return clamp(
      triggerPitch + scaleDegreeSemitoneOffset(triggerPitch, degreeOffset, rootNote, scaleIntervals),
      0,
      127
    );
  }
  function transposeChromatically(triggerPitch, semitones) {
    return clamp(triggerPitch + semitones, 0, 127);
  }
  function transposeHybrid(triggerPitch, degreeOffset, accidental, rootNote, scaleIntervals) {
    return clamp(
      triggerPitch + scaleDegreeSemitoneOffset(triggerPitch, degreeOffset, rootNote, scaleIntervals) + accidental,
      0,
      127
    );
  }

  // src/core/import-notes.ts
  function analyzeScaleOffset(semitoneOffset, intervals, triggerPitch = 60, scaleRootNote = 0) {
    const scaleLength = Math.max(1, new Set(intervals.map((value) => (Math.round(value) % 12 + 12) % 12)).size);
    const estimate = Math.round(semitoneOffset / 12 * scaleLength);
    const radius = scaleLength * 2 + 2;
    let bestDegree = estimate;
    let bestAccidental = semitoneOffset - scaleDegreeSemitoneOffset(triggerPitch, estimate, scaleRootNote, intervals);
    for (let degree = estimate - radius; degree <= estimate + radius; degree += 1) {
      const accidental = semitoneOffset - scaleDegreeSemitoneOffset(triggerPitch, degree, scaleRootNote, intervals);
      const absolute = Math.abs(accidental);
      const bestAbsolute = Math.abs(bestAccidental);
      if (absolute < bestAbsolute || absolute === bestAbsolute && Math.abs(degree) < Math.abs(bestDegree) || absolute === bestAbsolute && Math.abs(degree) === Math.abs(bestDegree) && degree < bestDegree) {
        bestDegree = degree;
        bestAccidental = accidental;
      }
    }
    return { degree: bestDegree, accidental: bestAccidental };
  }
  function encodeSemitoneOffset(semitoneOffset, pitchMode, context) {
    if (pitchMode === "chromatic") {
      return { pitch: semitoneOffset };
    }
    const analyzed = analyzeScaleOffset(
      semitoneOffset,
      context.scaleIntervals,
      context.triggerPitch,
      context.rootNote
    );
    if (pitchMode === "hybrid" && analyzed.accidental !== 0) {
      return { pitch: analyzed.degree, accidental: analyzed.accidental };
    }
    return { pitch: analyzed.degree };
  }
  function decodeSemitoneOffset(note2, pitchMode, context) {
    if (pitchMode === "chromatic") {
      return note2.pitch + (note2.accidental ?? 0);
    }
    const scaleOffset = scaleDegreeSemitoneOffset(
      context.triggerPitch,
      note2.pitch,
      context.rootNote,
      context.scaleIntervals
    );
    return scaleOffset + (pitchMode === "hybrid" ? note2.accidental ?? 0 : 0);
  }
  function convertMotifPitchMode(motif2, targetMode, context) {
    if (motif2.pitchMode === targetMode) return motif2;
    const notes = motif2.notes.map((note2) => {
      const semitoneOffset = decodeSemitoneOffset(note2, motif2.pitchMode, context);
      const encoded = encodeSemitoneOffset(semitoneOffset, targetMode, context);
      const { pitch: _pitch, accidental: _accidental, ...rest } = note2;
      return { ...rest, ...encoded };
    });
    return { ...motif2, pitchMode: targetMode, notes };
  }
  function absoluteNotesToMotif(absoluteNotes, options) {
    const completed = [...absoluteNotes].map((note2) => ({
      at: note2.at,
      duration: Math.max(1, note2.duration),
      pitch: note2.pitch,
      velocity: note2.velocity
    })).sort((left, right) => left.at - right.at || left.pitch - right.pitch);
    if (completed.length === 0) {
      throw new Error("No completed notes to import");
    }
    const anchor = options.rootNote ?? completed[0]?.pitch ?? 60;
    const context = {
      triggerPitch: anchor,
      rootNote: options.scaleRootNote ?? 0,
      scaleIntervals: options.scaleIntervals ?? [0, 2, 4, 5, 7, 9, 11]
    };
    const notes = completed.map((note2) => {
      const semitoneOffset = note2.pitch - anchor;
      return {
        at: note2.at,
        duration: note2.duration,
        ...encodeSemitoneOffset(semitoneOffset, options.pitchMode, context),
        velocity: note2.velocity
      };
    });
    const length = Math.max(...notes.map((note2) => note2.at + note2.duration));
    return {
      schemaVersion: 1,
      id: options.id,
      name: options.name,
      description: options.description ?? `Imported using ${options.pitchMode} relative analysis.`,
      pitchMode: options.pitchMode,
      sourceMeter: options.sourceMeter ?? { numerator: 4, denominator: 4 },
      length,
      notes,
      metadata: { tags: options.tags ? [...options.tags] : ["imported"] }
    };
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
    validateOptionalNumber(
      value,
      "pickupTicks",
      "metadata",
      errors,
      (number) => number >= 0,
      "zero or greater"
    );
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
  function matchesQuery(motif2, query) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return true;
    const haystack = [
      motif2.id,
      motif2.name,
      motif2.description,
      ...motif2.metadata?.tags ?? [],
      ...motif2.metadata?.suggestedModes ?? []
    ].join(" ").toLowerCase();
    return haystack.includes(normalized);
  }
  function uniqueMotifId(name, fallback = "motif") {
    const normalized = name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 72);
    return normalized || fallback;
  }
  var _motifs, _builtinIds;
  var MotifStore = class {
    constructor() {
      __privateAdd(this, _motifs, /* @__PURE__ */ new Map());
      __privateAdd(this, _builtinIds, new Set(BUILTIN_MOTIFS.map((motif2) => motif2.id)));
      this.resetToBuiltins();
    }
    /** Replace contents with the compiled built-in library only. */
    resetToBuiltins() {
      __privateGet(this, _motifs).clear();
      for (const motif2 of BUILTIN_MOTIFS) {
        __privateGet(this, _motifs).set(motif2.id, motif2);
      }
    }
    /** True when `id` is from `motifs/builtin/` (generated into BUILTIN_MOTIFS). */
    isBuiltin(id) {
      return __privateGet(this, _builtinIds).has(id);
    }
    has(id) {
      return __privateGet(this, _motifs).has(id);
    }
    /** Return an unused id, appending `-2`, `-3`, … when needed. */
    uniqueId(baseValue, excludedId) {
      const base = uniqueMotifId(baseValue);
      let candidate = base;
      let suffix = 2;
      while (__privateGet(this, _motifs).has(candidate) && candidate !== excludedId || __privateGet(this, _builtinIds).has(candidate) && candidate !== excludedId) {
        candidate = `${base}-${suffix}`;
        suffix += 1;
      }
      return candidate;
    }
    /**
     * Validate and insert/replace a motif by id.
     * @returns Empty array on success, or validation error strings.
     */
    add(value) {
      const result = validateMotif(value);
      if (!result.valid || !result.motif) {
        return result.errors;
      }
      if (this.isBuiltin(result.motif.id)) {
        return [`Cannot overwrite built-in motif: ${result.motif.id}`];
      }
      __privateGet(this, _motifs).set(result.motif.id, result.motif);
      return [];
    }
    /** Alias for {@link MotifStore.add} (replace-by-id). */
    update(value) {
      return this.add(value);
    }
    get(id) {
      return __privateGet(this, _motifs).get(id);
    }
    remove(id) {
      if (this.isBuiltin(id)) return false;
      return __privateGet(this, _motifs).delete(id);
    }
    /** All motifs sorted by display name and then id so duplicate names remain stable/selectable. */
    list() {
      return [...__privateGet(this, _motifs).values()].sort(
        (left, right) => left.name.localeCompare(right.name) || left.id.localeCompare(right.id)
      );
    }
    /** Case-insensitive substring match across id, name, description, tags, suggestedModes. */
    filter(query) {
      return this.list().filter((motif2) => matchesQuery(motif2, query));
    }
    /**
     * Clone a built-in (or any motif) to a new user id so edits can be saved without overwriting builtins.
     * Display names are intentionally preserved; ids, not names, are the selection identity.
     */
    cloneAsUser(id, newId) {
      const source = __privateGet(this, _motifs).get(id);
      if (!source) return void 0;
      const candidate = this.uniqueId(newId ?? uniqueMotifId(source.name, `${source.id}-copy`));
      const tags = /* @__PURE__ */ new Set([...source.metadata?.tags ?? [], "edited"]);
      const clone = {
        ...source,
        id: candidate,
        notes: source.notes.map((note2) => ({ ...note2 })),
        metadata: {
          ...source.metadata,
          tags: [...tags]
        }
      };
      __privateGet(this, _motifs).set(clone.id, clone);
      return clone;
    }
    /**
     * Replace notes on an existing motif and recompute `length` to cover the new span.
     * @returns Validation errors, or a single error if the id is unknown.
     */
    setNotes(id, notes) {
      const existing = __privateGet(this, _motifs).get(id);
      if (!existing) return [`Unknown motif: ${id}`];
      if (notes.length === 0) return ["notes must be a non-empty array"];
      const length = Math.max(...notes.map((note2) => note2.at + note2.duration));
      return this.update({
        ...existing,
        notes,
        length
      });
    }
  };
  _motifs = new WeakMap();
  _builtinIds = new WeakMap();

  // src/library/editor-state.ts
  function cloneMotif(motif2) {
    return {
      ...motif2,
      sourceMeter: { ...motif2.sourceMeter },
      notes: motif2.notes.map((note2) => ({ ...note2 })),
      ...motif2.velocityCurve ? { velocityCurve: { ...motif2.velocityCurve } } : {},
      ...motif2.metadata ? {
        metadata: {
          ...motif2.metadata,
          ...motif2.metadata.tags ? { tags: [...motif2.metadata.tags] } : {},
          ...motif2.metadata.suggestedModes ? { suggestedModes: [...motif2.metadata.suggestedModes] } : {}
        }
      } : {}
    };
  }
  var _edit;
  var MotifEditorState = class {
    constructor() {
      __privateAdd(this, _edit);
    }
    snapshot() {
      const edit = __privateGet(this, _edit);
      return edit ? {
        active: true,
        dirty: edit.dirty,
        created: edit.created,
        sourceId: edit.sourceId,
        targetId: edit.targetId
      } : {
        active: false,
        dirty: false,
        created: false,
        sourceId: null,
        targetId: null
      };
    }
    isEditing(id) {
      return __privateGet(this, _edit) !== void 0 && (id === void 0 || __privateGet(this, _edit).targetId === id);
    }
    isDirty() {
      return __privateGet(this, _edit)?.dirty ?? false;
    }
    begin(store2, id, options = {}) {
      if (__privateGet(this, _edit)) {
        return __privateGet(this, _edit).targetId === id ? store2.get(__privateGet(this, _edit).targetId) : void 0;
      }
      const source = store2.get(id);
      if (!source) return void 0;
      if (store2.isBuiltin(id)) {
        const targetId = store2.uniqueId(
          options.targetId ?? uniqueMotifId(source.name, `${source.id}-copy`)
        );
        const draft = {
          ...cloneMotif(source),
          id: targetId,
          metadata: {
            ...source.metadata,
            tags: [.../* @__PURE__ */ new Set([...source.metadata?.tags ?? [], "edited"])]
          }
        };
        const errors = store2.add(draft);
        if (errors.length > 0) return void 0;
        __privateSet(this, _edit, {
          sourceId: id,
          targetId,
          original: cloneMotif(source),
          created: true,
          dirty: options.dirty ?? false
        });
        return draft;
      }
      __privateSet(this, _edit, {
        sourceId: options.sourceId ?? id,
        targetId: id,
        original: cloneMotif(source),
        created: options.created ?? false,
        dirty: options.dirty ?? false
      });
      return source;
    }
    markDirty() {
      if (__privateGet(this, _edit)) __privateGet(this, _edit).dirty = true;
    }
    /** Cancel edits and return the motif id that should become selected. */
    cancel(store2) {
      const edit = __privateGet(this, _edit);
      if (!edit) return void 0;
      if (edit.created) store2.remove(edit.targetId);
      else store2.update(cloneMotif(edit.original));
      __privateSet(this, _edit, void 0);
      return edit.sourceId;
    }
    /** Finish a successful save and return the now-persisted motif id. */
    finishSave() {
      const id = __privateGet(this, _edit)?.targetId;
      __privateSet(this, _edit, void 0);
      return id;
    }
    /** Drop session bookkeeping without restoring data (used after deletion/reload). */
    abandon() {
      __privateSet(this, _edit, void 0);
    }
  };
  _edit = new WeakMap();

  // src/max/device.ts
  var store = new MotifStore();
  var editor = new MotifEditorState();
  var userLibraryFiles = /* @__PURE__ */ new Map();
  var occupiedLibraryPaths = /* @__PURE__ */ new Set();
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
  var userLibraryLoaded = false;
  var previewTriggerPitch = 60;
  var previewWasTriggered = false;
  var tempoMultiplier = 1;
  var browserQuery = "";
  var selectedNoteIndex = 0;
  var TEMPO_MULTIPLIERS = [0.5, 1, 1.5, 2];
  var NOTE_EDIT_FIELDS = [
    "pitch",
    "accidental",
    "at",
    "duration",
    "gate",
    "velocity",
    "velocityOffset",
    "velocityScale",
    "legato",
    "tie"
  ];
  var MAX_NOTE_ROWS = 16;
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
  function effectiveHost() {
    return {
      ...hostContext,
      tempo: hostContext.tempo * tempoMultiplier
    };
  }
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
  function motifLabels() {
    const motifs = store.list();
    const counts = /* @__PURE__ */ new Map();
    for (const item of motifs) counts.set(item.name, (counts.get(item.name) ?? 0) + 1);
    return new Map(
      motifs.map((item) => [
        item.id,
        (counts.get(item.name) ?? 0) > 1 ? `${item.name} \xB7 ${item.id}` : item.name
      ])
    );
  }
  function resolveMotif(value) {
    const normalized = String(value).trim();
    const direct = store.get(normalized);
    if (direct) return direct;
    const labelMatch = [...motifLabels()].find(([, label]) => label === normalized);
    if (labelMatch) return store.get(labelMatch[0]);
    return store.list().find((item) => item.name === normalized);
  }
  function currentMotif() {
    return store.get(currentMotifId);
  }
  function formatNumber(value) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
  }
  function emitLibraryState() {
    const items = store.filter(browserQuery);
    const selected = currentMotif();
    const selectedIndex = selected ? items.findIndex((item) => item.id === selected.id) : -1;
    const nameCounts = /* @__PURE__ */ new Map();
    for (const item of items) nameCounts.set(item.name, (nameCounts.get(item.name) ?? 0) + 1);
    let selectedData = null;
    if (selected) {
      const preview = buildMotifPreview(selected, effectiveHost(), previewTriggerPitch, pitchModeOverride, meterMode);
      const sourceMeter = `${selected.sourceMeter.numerator}/${selected.sourceMeter.denominator}`;
      const tags = selected.metadata?.tags?.join(" \xB7 ") ?? "custom motif";
      const suggested = selected.metadata?.suggestedModes?.join(", ");
      const tagLine = suggested ? `${tags}  \u2022  suggested: ${suggested}` : tags;
      const bars = `${formatNumber(preview.bars)} ${preview.bars === 1 ? "bar" : "bars"}`;
      const stats = `${preview.notes.length} notes  \u2022  ${bars}  \u2022  ${sourceMeter} source  \u2022  ${preview.effectivePitchMode}`;
      selectedData = {
        schemaVersion: selected.schemaVersion,
        id: selected.id,
        name: selected.name,
        description: selected.description ?? "",
        pitchMode: selected.pitchMode,
        sourceMeter: { ...selected.sourceMeter },
        length: selected.length,
        defaultGate: selected.defaultGate ?? null,
        velocityCurve: {
          inputMin: selected.velocityCurve?.inputMin ?? null,
          inputMax: selected.velocityCurve?.inputMax ?? null,
          outputMin: selected.velocityCurve?.outputMin ?? null,
          outputMax: selected.velocityCurve?.outputMax ?? null,
          exponent: selected.velocityCurve?.exponent ?? null
        },
        metadata: {
          author: selected.metadata?.author ?? "",
          source: selected.metadata?.source ?? "",
          license: selected.metadata?.license ?? "",
          tags: [...selected.metadata?.tags ?? []],
          suggestedModes: [...selected.metadata?.suggestedModes ?? []],
          pickupTicks: selected.metadata?.pickupTicks ?? null
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
          tie: n.tie ?? false
        }))
      };
    }
    const state = {
      query: browserQuery,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        showId: (nameCounts.get(item.name) ?? 0) > 1
      })),
      selectedIndex,
      selected: selectedData,
      editing: editor.snapshot(),
      libraryPath: userLibraryPath,
      libraryLoaded: userLibraryLoaded
    };
    emit("ui", "lib", encodeURIComponent(JSON.stringify(state)));
  }
  function emitPreviewState() {
    const selected = currentMotif();
    if (!selected) return;
    const preview = buildMotifPreview(selected, effectiveHost(), previewTriggerPitch, pitchModeOverride, meterMode);
    const totalTicks = preview.notes.reduce(
      (max, n) => Math.max(max, n.atTicks + n.durationTicks),
      1
    );
    const state = {
      notes: preview.notes.map((n) => ({ pitch: n.pitch, atTicks: n.atTicks, durationTicks: n.durationTicks })),
      totalTicks,
      lowPitch: preview.lowPitch,
      highPitch: preview.highPitch,
      noteNames: preview.noteNames.join("  \xB7  ")
    };
    emit("ui", "preview", encodeURIComponent(JSON.stringify(state)));
  }
  function emitSelectedMotifUi() {
    emitLibraryState();
    emitPreviewState();
  }
  function flattenValues(values) {
    const out = [];
    for (const value of values) {
      if (Array.isArray(value)) out.push(...value);
      else out.push(value);
    }
    return out;
  }
  function stringAtom(value, fallback = "") {
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    return fallback;
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
    const labels = motifLabels();
    emit("motifs-reset");
    for (const item of store.list()) emit("motif-item", labels.get(item.id) ?? item.name);
    emit("motif-selected", labels.get(currentMotifId) ?? currentMotif()?.name ?? currentMotifId);
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
  function preview_ready() {
    emitPreviewState();
  }
  function library_ready() {
    emitLibraryState();
  }
  function web_debug(page, level, encodedMessage) {
    let message = String(encodedMessage);
    try {
      message = decodeURIComponent(message);
    } catch {
    }
    const line = `Motif jweb ${String(page)} [${String(level)}] ${message}
`;
    if (String(level).toLowerCase() === "error") error(line);
    else post(line);
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
    for (const event of compileMotif(selected, effectiveHost(), options)) {
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
    let selected = resolveMotif(value);
    if (!selected) {
      emitError(`Unknown motif: ${value}`);
      return;
    }
    if (selected.id === currentMotifId) return;
    if (editor.isEditing()) {
      if (editor.isDirty()) {
        emitError("Save or cancel the current edits before selecting another motif");
        emit("motif-selected", motifLabels().get(currentMotifId) ?? currentMotif()?.name ?? currentMotifId);
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
    emit("motif-selected", motifLabels().get(selected.id) ?? selected.name);
    emitSelectedMotifUi();
    emitStatus("Motif", selected.name);
  }
  function pitch_mode(mode) {
    if (mode === "motif" || mode === "auto") pitchModeOverride = void 0;
    else if (mode === "scale" || mode === "chromatic" || mode === "hybrid") pitchModeOverride = mode;
    else {
      emitError(`Unknown pitch mode: ${mode}`);
      return;
    }
    emitSelectedMotifUi();
    emitStatus("Pitch", mode === "auto" ? "motif" : mode);
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
  function writeJsonFile(filename, value) {
    const file = new File(filename, "write");
    if (!file.isopen) throw new Error("could not open file for write");
    try {
      file.writestring(`${JSON.stringify(value, null, 2)}
`);
    } finally {
      file.close();
    }
  }
  function libraryFilePath(id) {
    const separator = userLibraryPath.endsWith("/") || userLibraryPath.endsWith(":") ? "" : "/";
    return `${userLibraryPath}${separator}${id}.json`;
  }
  function canonicalLibraryPath(filename) {
    return filename.replace(/\\/g, "/").replace(/\/{2,}/g, "/").toLowerCase();
  }
  function reserveLibraryPath(filename) {
    occupiedLibraryPaths.add(canonicalLibraryPath(filename));
  }
  function isLibraryPathOccupied(filename) {
    return occupiedLibraryPaths.has(canonicalLibraryPath(filename));
  }
  function fileExists(filename) {
    const file = new File(filename, "read");
    const exists = file.isopen;
    if (exists) file.close();
    return exists;
  }
  function uniqueAvailableId(baseValue) {
    const base = uniqueMotifId(baseValue);
    let candidate = base;
    let suffix = 2;
    while (store.has(candidate) || userLibraryPath && isLibraryPathOccupied(libraryFilePath(candidate))) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }
    return candidate;
  }
  function loadUserLibrary() {
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
      if (filename.toLowerCase().endsWith(".json")) {
        const separator = folder.pathname.endsWith("/") || folder.pathname.endsWith(":") ? "" : "/";
        const fullPath = `${folder.pathname}${separator}${filename}`;
        reserveLibraryPath(fullPath);
        try {
          const result = validateMotif(readJsonFile(fullPath));
          if (!result.valid || !result.motif) {
            emitError(`${filename}: ${result.errors.join("; ")}`);
          } else if (store.isBuiltin(result.motif.id)) {
            emitError(`${filename}: id \u201C${result.motif.id}\u201D conflicts with a built-in and was skipped`);
          } else if (userLibraryFiles.has(result.motif.id)) {
            emitError(`${filename}: duplicate motif id \u201C${result.motif.id}\u201D was skipped`);
          } else {
            const errors = store.add(result.motif);
            if (errors.length > 0) emitError(`${filename}: ${errors.join("; ")}`);
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
  function pathFromAtoms(values) {
    return flattenValues(values).map((value) => stringAtom(value)).filter(Boolean).join(" ").trim().replace(/^"|"$/g, "");
  }
  function discardAllowed(value) {
    return value === true || value === 1;
  }
  function library_path(...pathParts) {
    const nextPath = pathFromAtoms(pathParts);
    if (!nextPath) return;
    if (editor.isDirty()) {
      emitError("Finish or cancel editing before changing the library folder");
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
    if (!store.get(currentMotifId)) currentMotifId = store.list()[0]?.id ?? "mitsuda-lick";
    selectedNoteIndex = 0;
    listMotifs();
    emitStatus(loaded ? "library" : "library-unavailable", userLibraryPath);
  }
  function refresh_library(discardChanges) {
    if (editor.isDirty() && !discardAllowed(discardChanges)) {
      emitError("Unsaved edits must be saved or discarded before refreshing");
      emitLibraryState();
      return;
    }
    editor.abandon();
    const loaded = loadUserLibrary();
    if (!store.get(currentMotifId)) currentMotifId = store.list()[0]?.id ?? "mitsuda-lick";
    selectedNoteIndex = 0;
    listMotifs();
    emitStatus(loaded ? "library-refreshed" : "library-unavailable", store.list().length);
  }
  function tempo_multiplier(value) {
    const parsed = typeof value === "number" ? value : Number(String(value).replace(/x$/i, ""));
    if (!TEMPO_MULTIPLIERS.includes(parsed)) {
      emitError(`Unknown tempo multiplier: ${String(value)}`);
      return;
    }
    tempoMultiplier = parsed;
    emitSelectedMotifUi();
    emitStatus("tempo-multiplier", tempoMultiplier);
  }
  var FILTER_NOISE = /* @__PURE__ */ new Set(["", "set", "text", "clear", "bang", "symbol", "undefined", "null"]);
  function filter_motifs(...queryParts) {
    const raw = flattenValues(queryParts).map(String).map((part) => part.trim()).filter((part) => !FILTER_NOISE.has(part.toLowerCase())).join(" ").trim();
    browserQuery = raw;
    emitLibraryState();
    emitStatus("filter", browserQuery || "(all)");
  }
  function liveApiId(api) {
    return String(api.id ?? "");
  }
  function isLiveApiValid(api) {
    if (!api) return false;
    const id = liveApiId(api);
    return id !== "" && id !== "0" && id !== "id 0";
  }
  function liveTruthy(value) {
    if (Array.isArray(value)) return liveTruthy(value[0]);
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      return normalized !== "" && normalized !== "0" && normalized !== "false" && normalized !== "id 0";
    }
    return Boolean(value);
  }
  function isMidiClip(api) {
    try {
      if (liveTruthy(api.get("is_midi_clip"))) return true;
      if (liveTruthy(api.get("is_audio_clip"))) return false;
    } catch {
    }
    return true;
  }
  function resolveDetailClip() {
    if (typeof LiveAPI === "undefined") return void 0;
    try {
      const detail = new LiveAPI("live_set view detail_clip");
      if (isLiveApiValid(detail) && isMidiClip(detail)) return detail;
    } catch {
    }
    try {
      const slot = new LiveAPI("live_set view highlighted_clip_slot");
      if (!isLiveApiValid(slot) || !liveTruthy(slot.get("has_clip"))) return void 0;
      const clip = new LiveAPI("live_set view highlighted_clip_slot clip");
      if (isLiveApiValid(clip) && isMidiClip(clip)) return clip;
    } catch {
    }
    return void 0;
  }
  function asRecord(value) {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      return value;
    }
    return void 0;
  }
  function coerceNotesPayload(raw) {
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (!trimmed) return void 0;
      try {
        return JSON.parse(trimmed);
      } catch {
        return void 0;
      }
    }
    const dictLike = raw;
    if (dictLike && typeof dictLike.stringify === "function") {
      try {
        return JSON.parse(dictLike.stringify());
      } catch {
        return void 0;
      }
    }
    return raw;
  }
  function parseClipNotesExtended(raw) {
    const record = asRecord(coerceNotesPayload(raw));
    const notesValue = record?.notes;
    if (!Array.isArray(notesValue)) return [];
    const notes = [];
    for (const entry of notesValue) {
      const note2 = asRecord(entry);
      if (!note2) continue;
      const pitch = Number(note2.pitch);
      const startTime = Number(note2.start_time ?? note2.startTime);
      const duration = Number(note2.duration);
      const velocity = Number(note2.velocity ?? 100);
      if (!Number.isFinite(pitch) || !Number.isFinite(startTime) || !Number.isFinite(duration)) continue;
      if (note2.mute === 1 || note2.muted === 1 || note2.mute === true) continue;
      notes.push({
        at: Math.round(startTime * PPQ),
        duration: Math.max(1, Math.round(duration * PPQ)),
        pitch: Math.round(pitch),
        velocity: Math.round(clamp(velocity, 1, 127))
      });
    }
    return notes;
  }
  function parseClipNotesLegacy(raw) {
    const values = flattenValues(Array.isArray(raw) ? raw : [raw]).map((value) => {
      const asNumber = Number(value);
      return Number.isFinite(asNumber) ? asNumber : value;
    });
    let index = 0;
    if (String(values[0]) === "notes") index = 1;
    const count = Number(values[index]);
    if (!Number.isFinite(count) || count <= 0) return [];
    index += 1;
    const notes = [];
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
        velocity: Math.round(clamp(Number.isFinite(velocity) ? velocity : 100, 1, 127))
      });
    }
    return notes;
  }
  function readClipNotes(clip) {
    try {
      const extended = clip.call("get_notes_extended", 0, 127, 0, 4096);
      const fromExtended = parseClipNotesExtended(extended);
      if (fromExtended.length > 0) return fromExtended;
    } catch {
    }
    try {
      const legacy = clip.call("get_notes", 0, 4096, 0, 127);
      return parseClipNotesLegacy(legacy);
    } catch (reason) {
      throw new Error(
        `Could not read clip notes: ${reason instanceof Error ? reason.message : String(reason)}`
      );
    }
  }
  function import_clip(pitchModeValue = "chromatic") {
    if (editor.isDirty()) {
      emitError("Save or cancel the current edits before importing a clip");
      emitLibraryState();
      return;
    }
    const mode = String(pitchModeValue || "chromatic");
    if (mode !== "scale" && mode !== "chromatic" && mode !== "hybrid") {
      emitError(`Unknown import pitch mode: ${mode}`);
      return;
    }
    const clip = resolveDetailClip();
    if (!clip) {
      emitError("No clip selected \u2014 open a MIDI clip in Detail View, then Import Clip");
      return;
    }
    let absoluteNotes = [];
    try {
      absoluteNotes = readClipNotes(clip);
    } catch (reason) {
      emitError(`Clip import failed: ${reason instanceof Error ? reason.message : String(reason)}`);
      return;
    }
    if (absoluteNotes.length === 0) {
      emitError("Selected clip has no notes");
      return;
    }
    const clipNameRaw = clip.get("name");
    const clipName = String(Array.isArray(clipNameRaw) ? clipNameRaw[0] : clipNameRaw || "Imported Clip").trim() || "Imported Clip";
    let imported;
    try {
      imported = absoluteNotesToMotif(absoluteNotes, {
        id: "pending-import",
        name: clipName,
        pitchMode: mode,
        scaleRootNote: hostContext.rootNote,
        scaleIntervals: hostContext.scaleIntervals,
        sourceMeter: { ...hostContext.timeSignature },
        description: `Imported from Live clip \u201C${clipName}\u201D using ${mode} relative analysis.`,
        tags: ["imported", "live-clip"]
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
        currentMotifId = store.has(restoreId) ? restoreId : store.list()[0]?.id ?? "mitsuda-lick";
        listMotifs();
        emitError(errors.join("; "));
        return;
      }
      const edit = editor.begin(store, id, { dirty: true, created: true, sourceId: restoreId });
      if (!edit) {
        store.remove(id);
        currentMotifId = store.has(restoreId) ? restoreId : store.list()[0]?.id ?? "mitsuda-lick";
        emitError("Could not start editing the imported motif");
        listMotifs();
        return;
      }
      currentMotifId = id;
      selectedNoteIndex = 0;
      listMotifs();
      emitStatus("imported-clip", id, absoluteNotes.length);
    } catch (reason) {
      store.remove(id);
      currentMotifId = store.has(restoreId) ? restoreId : store.list()[0]?.id ?? "mitsuda-lick";
      editor.abandon();
      listMotifs();
      emitError(`Clip import failed: ${reason instanceof Error ? reason.message : String(reason)}`);
    }
  }
  function isRecord2(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
  function hasOwn(record, key) {
    return Object.prototype.hasOwnProperty.call(record, key);
  }
  function requiredText(value, field) {
    if (!["string", "number", "boolean"].includes(typeof value)) {
      emitError(`${field} must be text`);
      return void 0;
    }
    const text = stringAtom(value).trim();
    if (!text) {
      emitError(`${field} cannot be empty`);
      return void 0;
    }
    return text;
  }
  function optionalText(value, field) {
    if (value === null || value === void 0 || value === "") return void 0;
    if (!["string", "number", "boolean"].includes(typeof value)) {
      emitError(`${field} must be text`);
      return false;
    }
    const text = stringAtom(value).trim();
    return text || void 0;
  }
  function optionalFiniteNumber(value, field, predicate = () => true, requirement = "a finite number") {
    if (value === null || value === void 0 || value === "") return void 0;
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || !predicate(numeric)) {
      emitError(`${field} must be ${requirement}`);
      return false;
    }
    return numeric;
  }
  function stringList(value, field) {
    const values = Array.isArray(value) ? value : typeof value === "string" ? value.split(/[\n,]/) : void 0;
    if (!values || values.some((item) => typeof item !== "string")) {
      emitError(`${field} must be a list of text values`);
      return void 0;
    }
    return [...new Set(values.map((item) => String(item).trim()).filter(Boolean))];
  }
  function applyMotifProperties(value) {
    const editable = editableMotif();
    if (!editable) return false;
    if (!isRecord2(value)) {
      emitError("Motif properties must be an object");
      emitLibraryState();
      return false;
    }
    if (hasOwn(value, "id") && stringAtom(value["id"]) !== editable.id) {
      emitError("Motif ID is generated and cannot be changed");
      emitLibraryState();
      return false;
    }
    if (hasOwn(value, "schemaVersion") && Number(value["schemaVersion"]) !== editable.schemaVersion) {
      emitError("schemaVersion is read-only");
      emitLibraryState();
      return false;
    }
    if (hasOwn(value, "length") && Number(value["length"]) !== editable.length) {
      emitError("Motif length is derived from note timing and cannot be changed directly");
      emitLibraryState();
      return false;
    }
    let name = editable.name;
    if (hasOwn(value, "name")) {
      const parsed = requiredText(value["name"], "Motif name");
      if (parsed === void 0) {
        emitLibraryState();
        return false;
      }
      name = parsed;
    }
    let description = editable.description;
    if (hasOwn(value, "description")) {
      const parsed = requiredText(value["description"], "Motif description");
      if (parsed === void 0) {
        emitLibraryState();
        return false;
      }
      description = parsed;
    }
    let pitchMode = editable.pitchMode;
    if (hasOwn(value, "pitchMode")) {
      const parsed = stringAtom(value["pitchMode"]);
      if (parsed !== "scale" && parsed !== "chromatic" && parsed !== "hybrid") {
        emitError("pitchMode must be scale, chromatic, or hybrid");
        emitLibraryState();
        return false;
      }
      pitchMode = parsed;
    }
    let sourceMeter = editable.sourceMeter;
    if (hasOwn(value, "sourceMeter")) {
      const meter = value["sourceMeter"];
      if (!isRecord2(meter)) {
        emitError("sourceMeter must be an object");
        emitLibraryState();
        return false;
      }
      const numerator = Number(meter["numerator"]);
      const denominator = Number(meter["denominator"]);
      if (!Number.isInteger(numerator) || numerator < 1) {
        emitError("sourceMeter.numerator must be a positive integer");
        emitLibraryState();
        return false;
      }
      if (![1, 2, 4, 8, 16, 32].includes(denominator)) {
        emitError("sourceMeter.denominator must be 1, 2, 4, 8, 16, or 32");
        emitLibraryState();
        return false;
      }
      sourceMeter = { numerator, denominator };
    }
    let defaultGate = editable.defaultGate;
    if (hasOwn(value, "defaultGate")) {
      const parsed = optionalFiniteNumber(value["defaultGate"], "defaultGate", (number) => number > 0, "greater than zero");
      if (parsed === false) {
        emitLibraryState();
        return false;
      }
      defaultGate = parsed;
    }
    let velocityCurve = editable.velocityCurve;
    if (hasOwn(value, "velocityCurve")) {
      const curve = value["velocityCurve"];
      if (curve === null || curve === void 0) {
        velocityCurve = void 0;
      } else if (!isRecord2(curve)) {
        emitError("velocityCurve must be an object");
        emitLibraryState();
        return false;
      } else {
        const parsed = {};
        for (const field of ["inputMin", "inputMax", "outputMin", "outputMax"]) {
          const number = optionalFiniteNumber(curve[field], `velocityCurve.${field}`);
          if (number === false) {
            emitLibraryState();
            return false;
          }
          if (number !== void 0) parsed[field] = number;
        }
        const exponent = optionalFiniteNumber(
          curve["exponent"],
          "velocityCurve.exponent",
          (number) => number > 0,
          "greater than zero"
        );
        if (exponent === false) {
          emitLibraryState();
          return false;
        }
        if (exponent !== void 0) parsed["exponent"] = exponent;
        velocityCurve = Object.keys(parsed).length > 0 ? parsed : void 0;
      }
    }
    let metadata = editable.metadata;
    if (hasOwn(value, "metadata")) {
      const input = value["metadata"];
      if (input === null || input === void 0) {
        metadata = void 0;
      } else if (!isRecord2(input)) {
        emitError("metadata must be an object");
        emitLibraryState();
        return false;
      } else {
        const author = optionalText(input["author"], "metadata.author");
        const source = optionalText(input["source"], "metadata.source");
        const license = optionalText(input["license"], "metadata.license");
        if (author === false || source === false || license === false) {
          emitLibraryState();
          return false;
        }
        const tags = stringList(input["tags"] ?? [], "metadata.tags");
        const suggestedModes = stringList(input["suggestedModes"] ?? [], "metadata.suggestedModes");
        if (!tags || !suggestedModes) {
          emitLibraryState();
          return false;
        }
        const pickupTicks = optionalFiniteNumber(
          input["pickupTicks"],
          "metadata.pickupTicks",
          (number) => number >= 0,
          "zero or greater"
        );
        if (pickupTicks === false) {
          emitLibraryState();
          return false;
        }
        const nextMetadata = {
          ...author !== void 0 ? { author } : {},
          ...source !== void 0 ? { source } : {},
          ...license !== void 0 ? { license } : {},
          ...tags.length > 0 ? { tags } : {},
          ...suggestedModes.length > 0 ? { suggestedModes } : {},
          ...pickupTicks !== void 0 ? { pickupTicks } : {}
        };
        metadata = Object.keys(nextMetadata).length > 0 ? nextMetadata : void 0;
      }
    }
    const pitchConverted = pitchMode === editable.pitchMode ? editable : convertMotifPitchMode(editable, pitchMode, {
      triggerPitch: previewTriggerPitch,
      rootNote: hostContext.rootNote,
      scaleIntervals: hostContext.scaleIntervals
    });
    const {
      defaultGate: _defaultGate,
      velocityCurve: _velocityCurve,
      metadata: _metadata,
      ...required
    } = pitchConverted;
    const candidate = {
      ...required,
      name,
      description,
      pitchMode,
      sourceMeter,
      ...defaultGate !== void 0 ? { defaultGate } : {},
      ...velocityCurve !== void 0 ? { velocityCurve } : {},
      ...metadata !== void 0 ? { metadata } : {}
    };
    if (JSON.stringify(candidate) === JSON.stringify(editable)) return true;
    const errors = store.update(candidate);
    if (errors.length > 0) {
      emitError(errors.join("; "));
      emitLibraryState();
      return false;
    }
    editor.markDirty();
    return true;
  }
  function save_motif(properties) {
    if (properties !== void 0 && !applyMotifProperties(properties)) return;
    if (!userLibraryPath || !userLibraryLoaded) {
      emitError("Choose a valid library folder before saving");
      return;
    }
    const selected = currentMotif();
    if (!selected) {
      emitError("No motif selected");
      return;
    }
    if (!editor.isEditing(selected.id)) {
      emitError("Start editing before saving");
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
      emitStatus("saved", selected.id, filename);
    } catch (reason) {
      emitError(`Save failed: ${reason instanceof Error ? reason.message : String(reason)}`);
      emitLibraryState();
    }
  }
  function editableMotif() {
    const selected = currentMotif();
    if (!selected) {
      emitError("No motif selected");
      return void 0;
    }
    if (!editor.isEditing(selected.id)) {
      emitError("Start editing before changing this motif");
      emitLibraryState();
      return void 0;
    }
    return selected;
  }
  function begin_edit() {
    if (editor.isEditing(currentMotifId)) {
      emitLibraryState();
      return;
    }
    const selected = currentMotif();
    const targetId = selected && store.isBuiltin(selected.id) ? uniqueAvailableId(uniqueMotifId(selected.name, `${selected.id}-copy`)) : void 0;
    const editable = editor.begin(store, currentMotifId, targetId ? { targetId } : {});
    if (!editable) {
      emitError("Could not start editing the selected motif");
      return;
    }
    currentMotifId = editable.id;
    selectedNoteIndex = 0;
    listMotifs();
    emitStatus("editing", editable.id, editable.name);
  }
  function cancel_edit() {
    const restoredId = editor.cancel(store);
    if (!restoredId) {
      emitLibraryState();
      return;
    }
    currentMotifId = store.has(restoredId) ? restoredId : store.list()[0]?.id ?? "mitsuda-lick";
    selectedNoteIndex = 0;
    listMotifs();
    emitStatus("editing-cancelled", currentMotifId);
  }
  function edit_motif(properties) {
    if (!applyMotifProperties(properties)) return;
    emitSelectedMotifUi();
    emitStatus("motif-edited", currentMotifId);
  }
  function edit_meta(fieldValue, ...textParts) {
    const field = String(fieldValue);
    if (field !== "name" && field !== "description") {
      emitError(`Unknown meta field: ${field}`);
      return;
    }
    const value = flattenValues(textParts).map(String).join(" ").trim().replace(/^"|"$/g, "");
    if (!applyMotifProperties({ [field]: value })) return;
    emitSelectedMotifUi();
    emitStatus("meta-edited", field, currentMotif()?.name ?? "");
  }
  function select_browser(idOrIndex, discardChanges) {
    const items = store.filter(browserQuery);
    const item = typeof idOrIndex === "number" ? items[Math.round(clamp(idOrIndex, 0, Math.max(0, items.length - 1)))] : store.get(String(idOrIndex));
    if (!item) return;
    if (item.id === currentMotifId) return;
    if (editor.isEditing()) {
      if (editor.isDirty() && !discardAllowed(discardChanges)) {
        emitError("Unsaved edits must be saved or discarded before selecting another motif");
        emitLibraryState();
        return;
      }
      editor.cancel(store);
    }
    const selected = store.get(item.id);
    if (!selected) return;
    currentMotifId = selected.id;
    selectedNoteIndex = 0;
    emit("motif-selected", motifLabels().get(selected.id) ?? selected.name);
    emitSelectedMotifUi();
    emitStatus("Motif", selected.name);
  }
  function select_note(indexValue) {
    const selected = currentMotif();
    if (!selected || selected.notes.length === 0) return;
    selectedNoteIndex = Math.round(clamp(indexValue, 0, selected.notes.length - 1));
    const note2 = selected.notes[selectedNoteIndex];
    if (!note2) return;
    emitLibraryState();
    emitStatus("note-selected", selectedNoteIndex);
  }
  function updateNoteAt(index, field, valueValue) {
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
    const next = { ...current };
    let statusValue = valueValue;
    if (field === "legato" || field === "tie") {
      const enabled = valueValue === true || valueValue === 1 || valueValue === "1" || valueValue === "true";
      if (enabled) next[field] = true;
      else delete next[field];
      statusValue = enabled;
    } else {
      const optional = valueValue === null || valueValue === void 0 || valueValue === "";
      const numeric = optional ? void 0 : Number(valueValue);
      if (numeric !== void 0 && !Number.isFinite(numeric)) {
        emitError(`Invalid ${field} value`);
        return false;
      }
      switch (field) {
        case "pitch":
          if (numeric === void 0) {
            emitError("pitch cannot be empty");
            return false;
          }
          next.pitch = Math.round(numeric);
          statusValue = next.pitch;
          break;
        case "accidental":
          if (numeric === void 0 || numeric === 0) delete next.accidental;
          else next.accidental = Math.round(numeric);
          statusValue = next.accidental ?? null;
          break;
        case "at":
          if (numeric === void 0 || numeric < 0) {
            emitError("at must be zero or greater");
            return false;
          }
          next.at = Math.round(numeric);
          statusValue = next.at;
          break;
        case "duration":
          if (numeric === void 0 || numeric <= 0) {
            emitError("duration must be greater than zero");
            return false;
          }
          next.duration = Math.round(numeric);
          statusValue = next.duration;
          break;
        case "gate":
          if (numeric === void 0) delete next.gate;
          else if (numeric <= 0) {
            emitError("gate must be greater than zero");
            return false;
          } else next.gate = numeric;
          statusValue = next.gate ?? null;
          break;
        case "velocity":
          if (numeric === void 0) delete next.velocity;
          else if (!Number.isInteger(numeric) || numeric < 1 || numeric > 127) {
            emitError("velocity must be an integer between 1 and 127");
            return false;
          } else next.velocity = numeric;
          statusValue = next.velocity ?? null;
          break;
        case "velocityOffset":
          if (numeric === void 0 || numeric === 0) delete next.velocityOffset;
          else next.velocityOffset = numeric;
          statusValue = next.velocityOffset ?? null;
          break;
        case "velocityScale":
          if (numeric === void 0) delete next.velocityScale;
          else if (numeric < 0) {
            emitError("velocityScale must be zero or greater");
            return false;
          } else next.velocityScale = numeric;
          statusValue = next.velocityScale ?? null;
          break;
        default:
          break;
      }
    }
    const notes = editable.notes.map((note2, noteIndex) => noteIndex === index ? next : note2);
    const errors = store.setNotes(editable.id, notes);
    if (errors.length > 0) {
      emitError(errors.join("; "));
      return false;
    }
    editor.markDirty();
    emitSelectedMotifUi();
    emitStatus("note-edited", index, field, statusValue ?? "unset");
    return true;
  }
  function edit_note(fieldValue, valueValue) {
    const selected = currentMotif();
    if (!selected || selected.notes.length === 0) return;
    const index = Math.round(clamp(selectedNoteIndex, 0, selected.notes.length - 1));
    if (updateNoteAt(index, String(fieldValue), valueValue)) {
      selectedNoteIndex = index;
    }
  }
  function edit_note_at(rowIndexValue, fieldValue, valueValue) {
    updateNoteAt(Math.round(rowIndexValue), String(fieldValue), valueValue);
  }
  function add_note() {
    const editable = editableMotif();
    if (!editable) return;
    if (editable.notes.length >= MAX_NOTE_ROWS) {
      emitError(`Maximum ${MAX_NOTE_ROWS} notes per motif`);
      return;
    }
    const lastAt = editable.notes.at(-1)?.at ?? 0;
    const lastDur = editable.notes.at(-1)?.duration ?? 240;
    const newNote = { pitch: 0, at: lastAt + lastDur, duration: 240 };
    const errors = store.setNotes(editable.id, [...editable.notes, newNote]);
    if (errors.length > 0) {
      emitError(errors.join("; "));
      return;
    }
    editor.markDirty();
    emitSelectedMotifUi();
  }
  function remove_note(indexValue) {
    const editable = editableMotif();
    if (!editable) return;
    const index = Math.round(indexValue);
    if (index < 0 || index >= editable.notes.length) return;
    const notes = editable.notes.filter((_, i) => i !== index);
    const errors = store.setNotes(editable.id, notes);
    if (errors.length > 0) {
      emitError(errors.join("; "));
      return;
    }
    editor.markDirty();
    emitSelectedMotifUi();
  }
  function lib_action(...encodedParts) {
    const payloads = flattenValues(encodedParts).map((value) => stringAtom(value)).filter(Boolean);
    const encodedJson = payloads[payloads.length - 1];
    if (!encodedJson) {
      emitError("lib_action: missing JSON payload");
      return;
    }
    let action;
    try {
      action = JSON.parse(decodeURIComponent(encodedJson));
    } catch {
      emitError(`lib_action: invalid JSON (${encodedJson.slice(0, 48)})`);
      return;
    }
    const type = stringAtom(action["type"]);
    switch (type) {
      case "select_browser":
        select_browser(
          action["id"] !== void 0 ? stringAtom(action["id"]) : Number(action["index"]),
          action["discardChanges"]
        );
        break;
      case "filter_motifs":
        filter_motifs(action["query"]);
        break;
      case "import_clip":
        import_clip(action["pitchMode"] !== void 0 ? stringAtom(action["pitchMode"]) : void 0);
        break;
      case "save_motif":
        save_motif(
          action["properties"] ?? (action["name"] !== void 0 || action["description"] !== void 0 ? {
            ...action["name"] !== void 0 ? { name: action["name"] } : {},
            ...action["description"] !== void 0 ? { description: action["description"] } : {}
          } : void 0)
        );
        break;
      case "refresh_library":
        refresh_library(action["discardChanges"]);
        break;
      case "begin_edit":
        begin_edit();
        break;
      case "cancel_edit":
        cancel_edit();
        break;
      case "edit_motif":
        edit_motif(action["properties"]);
        break;
      case "edit_meta":
        edit_meta(stringAtom(action["field"]), action["value"]);
        break;
      case "add_note":
        add_note();
        break;
      case "remove_note":
        remove_note(Number(action["index"]));
        break;
      case "edit_note_at":
        edit_note_at(Number(action["index"]), stringAtom(action["field"]), action["value"]);
        break;
      default:
        emitError(`lib_action: unknown type ${type}`);
    }
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
    song_context
  };
  function dispatch(message, args) {
    const handler = handlers[message];
    if (!handler) {
      emitError(`Unknown message: ${message}`);
      return;
    }
    handler(...args);
  }
  return __toCommonJS(device_exports);
})();
