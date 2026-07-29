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
    if (motif2.pitchMode === targetMode) {
      return motif2;
    }
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
    if (!Number.isFinite(positionTicks) || !Number.isFinite(gridTicks) || gridTicks <= 0) {
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
      case "chromatic": {
        return transposeChromatically(options.triggerPitch, note2.pitch + (note2.accidental ?? 0));
      }
      case "hybrid": {
        return transposeHybrid(
          options.triggerPitch,
          note2.pitch,
          note2.accidental ?? 0,
          host.rootNote,
          host.scaleIntervals
        );
      }
      default: {
        return transposeByScaleDegree(
          options.triggerPitch,
          note2.pitch,
          host.rootNote,
          host.scaleIntervals
        );
      }
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
  function parseMidiNoteName(value) {
    const match = value.trim().match(/^([A-Ga-g])([#♯b♭]?)(-2|-1|[0-8])$/);
    if (!match) return void 0;
    const pitchClasses = {
      C: 0,
      D: 2,
      E: 4,
      F: 5,
      G: 7,
      A: 9,
      B: 11
    };
    const letter = match[1]?.toUpperCase() ?? "";
    const accidental = match[2];
    const octave = Number(match[3]);
    const offset = accidental === "#" || accidental === "\u266F" ? 1 : accidental === "b" || accidental === "\u266D" ? -1 : 0;
    const pitch = (octave + 2) * 12 + (pitchClasses[letter] ?? 0) + offset;
    return pitch >= 0 && pitch <= 127 ? pitch : void 0;
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
    /**
     * Replace the store contents with the compiled built-in library.
     * @returns {void}
     */
    resetToBuiltins() {
      __privateGet(this, _motifs).clear();
      for (const motif2 of BUILTIN_MOTIFS) {
        __privateGet(this, _motifs).set(motif2.id, motif2);
      }
    }
    /**
     * Determine whether an id belongs to the compiled built-in library.
     * @param {string} id The motif id to inspect.
     * @returns {boolean} Whether the id is built in.
     */
    isBuiltin(id) {
      return __privateGet(this, _builtinIds).has(id);
    }
    /**
     * Determine whether the store contains a motif id.
     * @param {string} id The motif id to find.
     * @returns {boolean} Whether the id exists.
     */
    has(id) {
      return __privateGet(this, _motifs).has(id);
    }
    /**
     * Return an unused id, appending `-2`, `-3`, … when needed.
     * @param {string} baseValue The preferred id or display name.
     * @param {string | undefined} excludedId An existing id allowed during rename checks.
     * @returns {string} An id unused by every non-excluded motif.
     */
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
     * @param {unknown} value The motif value to validate and store.
     * @returns {string[]} An empty array on success, or validation error strings.
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
    /**
     * Replace a motif by id through {@link MotifStore.add}.
     * @param {unknown} value The motif value to validate and store.
     * @returns {string[]} An empty array on success, or validation error strings.
     */
    update(value) {
      return this.add(value);
    }
    /**
     * Retrieve a motif by id.
     * @param {string} id The motif id to retrieve.
     * @returns {Motif | undefined} The motif, or undefined when the id is unknown.
     */
    get(id) {
      return __privateGet(this, _motifs).get(id);
    }
    /**
     * Remove a user motif while protecting built-in ids.
     * @param {string} id The motif id to remove.
     * @returns {boolean} Whether a motif was removed.
     */
    remove(id) {
      if (this.isBuiltin(id)) return false;
      return __privateGet(this, _motifs).delete(id);
    }
    /**
     * List motifs by display name and then id so duplicate names remain stable.
     * @returns {Motif[]} A newly sorted motif list.
     */
    list() {
      return [...__privateGet(this, _motifs).values()].sort(
        (left, right) => left.name.localeCompare(right.name) || left.id.localeCompare(right.id)
      );
    }
    /**
     * Search id, name, description, tags, and suggested modes case-insensitively.
     * @param {string} query The substring to search for.
     * @returns {Motif[]} The matching motifs in stable display order.
     */
    filter(query) {
      return this.list().filter((motif2) => matchesQuery(motif2, query));
    }
    /**
     * Clone a built-in (or any motif) to a new user id so edits can be saved without overwriting builtins.
     * Display names are intentionally preserved; ids, not names, are the selection identity.
     * @param {string} id The source motif id.
     * @param {string | undefined} newId The preferred id for the clone.
     * @returns {Motif | undefined} The stored clone, or undefined when the source is unknown.
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
     * @param {string} id The id of the motif to update.
     * @param {readonly MotifNote[]} notes The new notes to set.
     * @returns {string[]} Validation errors, or a single error if the id is unknown.
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
    /**
     * Read an immutable summary of the current edit session.
     * @returns {EditSnapshot} The active or inactive edit snapshot.
     */
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
    /**
     * Determine whether a session is active, optionally for one target id.
     * @param {string | undefined} id The target id to match.
     * @returns {boolean} Whether the requested edit session is active.
     */
    isEditing(id) {
      return __privateGet(this, _edit) !== void 0 && (id === void 0 || __privateGet(this, _edit).targetId === id);
    }
    /**
     * Determine whether the active session contains unsaved changes.
     * @returns {boolean} Whether the current edit is dirty.
     */
    isDirty() {
      return __privateGet(this, _edit)?.dirty ?? false;
    }
    /**
     * Begin editing a motif, cloning built-ins to an editable user id.
     * @param {MotifStore} store The motif store containing the source.
     * @param {string} id The source motif id.
     * @param {BeginEditOptions} options Initial session and target-id options.
     * @returns {Motif | undefined} The editable motif, or undefined when editing cannot start.
     */
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
    /**
     * Mark the active edit session as dirty.
     * @returns {void}
     */
    markDirty() {
      if (__privateGet(this, _edit)) __privateGet(this, _edit).dirty = true;
    }
    /**
     * Cancel the active edit and restore or remove its target motif.
     * @param {MotifStore} store The motif store containing the edit target.
     * @returns {string | undefined} The motif id to select, or undefined when no edit is active.
     */
    cancel(store2) {
      const edit = __privateGet(this, _edit);
      if (!edit) return void 0;
      if (edit.created) store2.remove(edit.targetId);
      else store2.update(cloneMotif(edit.original));
      __privateSet(this, _edit, void 0);
      return edit.sourceId;
    }
    /**
     * Finish the active edit after a successful save.
     * @returns {string | undefined} The persisted motif id, or undefined when no edit is active.
     */
    finishSave() {
      const id = __privateGet(this, _edit)?.targetId;
      __privateSet(this, _edit, void 0);
      return id;
    }
    /**
     * Drop session bookkeeping without restoring data after deletion or reload.
     * @returns {void}
     */
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
  var DEFAULT_MOTIF_ID = "scale-turn";
  var LIBRARY_SCAN_BATCH_SIZE = 32;
  var MAX_LIBRARY_DEPTH = 32;
  var MIN_REPEAT_DELAY_MS = 1;
  var currentMotifId = DEFAULT_MOTIF_ID;
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
  var libraryScanning = false;
  var libraryScanGeneration = 0;
  var libraryScanState;
  var libraryScanTask;
  var libraryAlert;
  var libraryAlertCounter = 0;
  var libraryNoteTransferCounter = 0;
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
  var MAX_MOTIF_NOTES = 512;
  var LIBRARY_NOTE_CHUNK_SIZE = 32;
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
  var heldRepeats = /* @__PURE__ */ new Map();
  var sustainedRepeatReleases = /* @__PURE__ */ new Set();
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
  function motifBrowserFolder(id) {
    if (store.isBuiltin(id)) return "Built-ins";
    const filename = userLibraryFiles.get(id);
    if (!filename || !userLibraryPath) return "Library";
    const root = userLibraryPath.replace(/\\/g, "/").replace(/\/+$/, "");
    const normalized = filename.replace(/\\/g, "/");
    const prefix = `${root}/`;
    if (!normalized.toLowerCase().startsWith(prefix.toLowerCase())) return "Library";
    const relative = normalized.slice(prefix.length);
    const separator = relative.lastIndexOf("/");
    return separator < 0 ? "Library" : relative.slice(0, separator);
  }
  function motifHotkeys(id) {
    return [...triggerMap].filter(([, mapping]) => mapping.motifId === id).map(([pitch, mapping]) => ({ pitch, action: mapping.action })).sort((left, right) => left.pitch - right.pitch);
  }
  function libraryNoteData(note2) {
    return {
      pitch: note2.pitch,
      accidental: note2.accidental ?? null,
      at: note2.at,
      duration: note2.duration,
      gate: note2.gate ?? null,
      velocity: note2.velocity ?? null,
      velocityOffset: note2.velocityOffset ?? null,
      velocityScale: note2.velocityScale ?? null,
      legato: note2.legato ?? false,
      tie: note2.tie ?? false
    };
  }
  function emitLibraryState() {
    const normalizedQuery = browserQuery.trim().toLowerCase();
    const matchedIds = new Set(store.filter(browserQuery).map((item) => item.id));
    const items = store.list().filter(
      (item) => !normalizedQuery || matchedIds.has(item.id) || motifBrowserFolder(item.id).toLowerCase().includes(normalizedQuery)
    ).sort(
      (left, right) => motifBrowserFolder(left.id).localeCompare(motifBrowserFolder(right.id)) || left.name.localeCompare(right.name) || left.id.localeCompare(right.id)
    );
    const selected = currentMotif();
    const selectedIndex = selected ? items.findIndex((item) => item.id === selected.id) : -1;
    const nameCounts = /* @__PURE__ */ new Map();
    for (const item of items) nameCounts.set(item.name, (nameCounts.get(item.name) ?? 0) + 1);
    let selectedData = null;
    let noteTransfer;
    if (selected) {
      const notes = selected.notes.map(libraryNoteData);
      if (notes.length > LIBRARY_NOTE_CHUNK_SIZE) {
        libraryNoteTransferCounter += 1;
        noteTransfer = {
          id: libraryNoteTransferCounter,
          motifId: selected.id,
          notes
        };
      }
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
        folder: motifBrowserFolder(selected.id),
        hotkeys: motifHotkeys(selected.id),
        noteCount: selected.notes.length,
        noteLimit: MAX_MOTIF_NOTES,
        noteTransferId: noteTransfer?.id ?? null,
        notesLoading: Boolean(noteTransfer),
        notes: noteTransfer ? [] : notes
      };
    }
    const state = {
      query: browserQuery,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        showId: (nameCounts.get(item.name) ?? 0) > 1,
        folder: motifBrowserFolder(item.id),
        hotkeys: motifHotkeys(item.id)
      })),
      selectedIndex,
      selected: selectedData,
      editing: editor.snapshot(),
      libraryPath: userLibraryPath,
      libraryLoaded: userLibraryLoaded,
      libraryScanning,
      alert: libraryAlert ?? null,
      scanProgress: libraryScanState ? {
        processedEntries: libraryScanState.processedEntries,
        loadedMotifs: libraryScanState.loadedMotifs
      } : null
    };
    emit("ui", "lib", encodeURIComponent(JSON.stringify(state)));
    if (noteTransfer) {
      for (let offset = 0; offset < noteTransfer.notes.length; offset += LIBRARY_NOTE_CHUNK_SIZE) {
        emit("ui", "lib", encodeURIComponent(JSON.stringify({
          kind: "note-chunk",
          transferId: noteTransfer.id,
          motifId: noteTransfer.motifId,
          offset,
          total: noteTransfer.notes.length,
          notes: noteTransfer.notes.slice(offset, offset + LIBRARY_NOTE_CHUNK_SIZE)
        })));
      }
    }
  }
  function emitLibraryAlert(title, message) {
    libraryAlertCounter += 1;
    libraryAlert = { id: libraryAlertCounter, title, message };
    emitError(message);
    emitLibraryState();
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
        if (wasPlaying && !hostContext.isPlaying) {
          stopAllHeldRepeats();
          clearScheduledNotes();
        }
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
  function ensureCurrentMotifId() {
    if (!store.get(currentMotifId)) {
      currentMotifId = store.list()[0]?.id ?? DEFAULT_MOTIF_ID;
    }
  }
  function listMotifs() {
    ensureCurrentMotifId();
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
  function joinMaxPath(folder, filename) {
    const separator = folder.endsWith("/") || folder.endsWith(":") ? "" : "/";
    return `${folder}${separator}${filename}`;
  }
  function writeTextChunks(file, text) {
    const chunkSize = 8192;
    for (let offset = 0; offset < text.length; offset += chunkSize) {
      file.writestring(text.slice(offset, offset + chunkSize));
    }
  }
  function library_prepare() {
    const temporaryPath = `Tempfolder:/${"uttori-motif-library-ce085acf5373.html"}`;
    let output;
    try {
      output = new File(temporaryPath, "write");
      if (!output.isopen) throw new Error(`could not create ${temporaryPath}`);
      output.eof = 0;
      output.position = 0;
      writeTextChunks(output, `<!DOCTYPE html>
<!--
  Max jweb bridge documentation:
  https://docs.cycling74.com/reference/jweb/
  https://docs.cycling74.com/userguide/web_browser/#javascript-communication
-->
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Motif Library</title>
  <style>
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    :root {
      --bg:#141415; --surface:#1c1c1e; --surface2:#18181a; --border:#2e2e32;
      --accent:#ff8c1f; --text:#e0e0e6; --muted:#7a7a82; --input:#0e0e10;
      --btn:#2a2a2e; --btn-hover:#363638; --danger:#d55549; --note-alt:#1a1a1c;
    }
    html, body { height:100%; background:var(--bg); color:var(--text); font:11px "Ableton Sans",system-ui,-apple-system,sans-serif; overflow:hidden; }
    button, input, textarea, select { font:inherit; }
    button:disabled, input:disabled, textarea:disabled, select:disabled { opacity:.42; cursor:not-allowed !important; }
    .hidden { display:none !important; }
    #app { display:flex; height:calc(100% - 20px); }
    #left { width:clamp(170px,30vw,240px); min-width:150px; flex-shrink:0; display:flex; flex-direction:column; border-right:1px solid var(--border); }
    #right { flex:1; min-width:0; display:flex; flex-direction:column; }
    #search-row { display:flex; align-items:center; gap:4px; padding:6px 6px 4px; }
    #search { flex:1; min-width:0; background:var(--input); border:1px solid var(--border); color:var(--text); padding:3px 6px; outline:none; }
    #clear-search { background:none; border:0; color:var(--muted); cursor:pointer; font-size:13px; padding:0 2px; }
    #browser-list { flex:1; overflow-y:auto; border-top:1px solid var(--border); }
    .browser-folder { position:sticky; top:0; z-index:1; width:100%; padding:4px 8px 3px; background:var(--surface2); border:0; border-bottom:1px solid var(--border); color:var(--muted); cursor:pointer; font-size:9px; font-weight:600; text-align:left; text-transform:uppercase; letter-spacing:.05em; }
    .browser-folder:hover { background:var(--btn); color:var(--text); }
    .browser-item { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:2px 5px; padding:5px 8px; cursor:pointer; border-bottom:1px solid transparent; }
    .browser-item:hover { background:var(--btn); }
    .browser-item.selected { background:var(--accent); color:#000; }
    .browser-name { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .browser-id { grid-column:1 / -1; margin-top:1px; color:var(--muted); font:9px ui-monospace,SFMono-Regular,Menlo,monospace; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .hotkey-badge { align-self:center; color:var(--accent); font:9px ui-monospace,SFMono-Regular,Menlo,monospace; white-space:nowrap; }
    .browser-item.selected .browser-id { color:rgba(0,0,0,.62); }
    .browser-item.selected .hotkey-badge { color:#000; }
    #empty-list { padding:12px 8px; color:var(--muted); text-align:center; }
    #browser-actions { border-top:1px solid var(--border); display:flex; gap:4px; padding:5px; }
    #library-path { padding:0 6px 5px; color:var(--muted); font:9px ui-monospace,SFMono-Regular,Menlo,monospace; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .btn { background:var(--btn); border:1px solid var(--border); color:var(--text); cursor:pointer; padding:3px 7px; text-align:center; white-space:nowrap; }
    .btn:hover:not(:disabled) { background:var(--btn-hover); }
    .btn:active:not(:disabled), .btn.accent { background:var(--accent); color:#000; border-color:transparent; }
    #meta { padding:6px 8px 4px; border-bottom:1px solid var(--border); display:flex; flex-direction:column; gap:3px; }
    #meta-row-1 { display:flex; align-items:center; gap:4px; }
    #name-edit { flex:1; min-width:0; font-size:12px; font-weight:600; }
    .field { background:var(--input); border:1px solid var(--border); color:var(--text); padding:3px 5px; outline:none; min-width:0; }
    .field:focus { border-color:var(--accent); }
    .field[readonly], .field:disabled { background:transparent; border-color:transparent; color:var(--muted); }
    #description-edit { resize:none; height:34px; width:100%; }
    #stats-line { color:var(--muted); font-size:10px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    #edit-state { color:var(--accent); font-size:10px; min-height:12px; }
    #detail-actions { display:flex; gap:4px; padding:4px 8px; border-bottom:1px solid var(--border); }
    #detail-actions .btn { flex:1; }
    #import-mode { width:104px; flex:0 0 auto; }
    #panel-tabs { display:flex; border-bottom:1px solid var(--border); background:var(--surface2); }
    .panel-tab { flex:1; border:0; border-right:1px solid var(--border); background:transparent; color:var(--muted); cursor:pointer; padding:4px 8px; }
    .panel-tab:last-child { border-right:0; }
    .panel-tab.active { background:var(--surface); color:var(--text); box-shadow:inset 0 -2px var(--accent); }
    .panel { flex:1; min-height:0; overflow:auto; }
    #properties-panel { padding:7px 8px 12px; }
    .section { margin-bottom:9px; }
    .section-title { color:var(--muted); font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.05em; margin-bottom:4px; }
    .property-grid { display:grid; grid-template-columns:92px minmax(0,1fr) 92px minmax(0,1fr); gap:4px 6px; align-items:center; }
    .property-grid .wide { grid-column:2 / 5; }
    .property-grid label { color:var(--muted); font-size:10px; text-align:right; }
    .property-grid input, .property-grid select, .property-grid textarea { width:100%; }
    .property-grid textarea { min-height:38px; resize:vertical; }
    .identity { font:9px ui-monospace,SFMono-Regular,Menlo,monospace; }
    .help { grid-column:2 / 5; color:var(--muted); font-size:9px; line-height:1.25; }
    #hotkey-controls { display:flex; gap:4px; }
    #hotkey-input { width:72px; }
    #hotkey-action { width:112px; }
    #hotkey-list { display:flex; flex-wrap:wrap; gap:4px; }
    .hotkey-chip { background:var(--btn); border:1px solid var(--border); color:var(--text); cursor:pointer; padding:2px 5px; }
    .hotkey-chip:hover { background:var(--danger); border-color:var(--danger); color:#fff; }
    #notes-panel { overflow:auto; }
    #note-table { min-width:780px; display:flex; flex-direction:column; min-height:100%; }
    #note-header, .note-row { display:grid; grid-template-columns:28px 48px 38px 48px 54px 44px 48px 50px 50px 42px 42px 26px; }
    #note-header { position:sticky; top:0; z-index:2; background:var(--surface); border-bottom:1px solid var(--border); color:var(--muted); font-size:9px; font-weight:600; }
    #note-header span { padding:3px 2px; text-align:right; border-right:1px solid var(--border); }
    #note-header span:first-child, #note-header span:nth-last-child(-n+3) { text-align:center; }
    #note-rows { flex:1; }
    .note-row { border-bottom:1px solid var(--border); align-items:center; }
    .note-row:nth-child(even) { background:var(--note-alt); }
    .note-row > span { color:var(--muted); font-size:10px; text-align:center; padding:2px; }
    .note-row input[type="number"] { background:transparent; border:0; border-left:1px solid var(--border); color:var(--text); font-size:10px; padding:2px 3px; text-align:right; width:100%; outline:none; -moz-appearance:textfield; }
    .note-row input[type="number"]::-webkit-inner-spin-button, .note-row input[type="number"]::-webkit-outer-spin-button { display:none; }
    .note-row input[type="number"]:focus { background:var(--input); }
    .check-cell { display:flex; justify-content:center; border-left:1px solid var(--border); }
    .check-cell input { accent-color:var(--accent); }
    .remove-btn { background:none; border:0; border-left:1px solid var(--border); color:var(--danger); cursor:pointer; font-size:13px; width:100%; height:100%; }
    .remove-btn:hover:not(:disabled) { background:var(--danger); color:#fff; }
    #add-row { position:sticky; bottom:0; border-top:1px solid var(--border); padding:4px 8px; background:var(--bg); }
    #add-note-btn { width:100%; }
    #modal-backdrop { position:fixed; inset:0; z-index:100; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.68); }
    #modal { width:330px; max-width:calc(100% - 32px); background:var(--surface); border:1px solid #4a4a50; box-shadow:0 12px 40px rgba(0,0,0,.55); padding:12px; }
    #modal-title { font-size:13px; margin-bottom:7px; }
    #modal-message { color:var(--muted); line-height:1.4; white-space:pre-wrap; }
    #modal-actions { display:flex; justify-content:flex-end; gap:6px; margin-top:12px; }
    #debug-bar { position:fixed; left:0; right:0; bottom:0; height:20px; z-index:30; display:flex; align-items:center; gap:5px; padding:0 6px; border-top:1px solid var(--border); background:#101012; color:var(--muted); font-size:9px; }
    #debug-indicator { color:#b0a050; } #debug-indicator.ok { color:#70c070; } #debug-indicator.error { color:#ff7066; }
    #debug-summary { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    #debug-toggle { border:0; background:transparent; color:var(--muted); cursor:pointer; }
    #debug-panel { position:fixed; left:0; right:0; bottom:20px; z-index:29; display:none; max-height:160px; overflow:auto; padding:6px; border-top:1px solid var(--border); background:rgba(8,8,9,.97); color:#c8c8ce; font:9px ui-monospace,SFMono-Regular,Menlo,monospace; white-space:pre-wrap; user-select:text; }
    #debug-panel.open { display:block; } #debug-panel.has-error { color:#ff8b82; }
    @media (max-width:520px) {
      #app { flex-direction:column; }
      #left { width:100%; min-width:0; height:140px; border-right:0; border-bottom:1px solid var(--border); }
      #right { min-height:0; }
      .property-grid { grid-template-columns:80px minmax(0,1fr); }
      .property-grid .wide { grid-column:2; }
      .help { grid-column:1 / -1; }
    }
  /* Firefox */
  * {
    scrollbar-width: thin;
    scrollbar-color: #7a7a82 #141415;
  }
  /* Chrome, Edge, and Safari */
  *::-webkit-scrollbar {
    width: 16px;
  }
  *::-webkit-scrollbar-track {
    background: #141415;
  }
  *::-webkit-scrollbar-thumb {
    background-color: #7a7a82;
    border-radius: 10px;
    border: 3px none #000000;
  }
  </style>
</head>
<body>
<div id="app">
  <div id="left">
    <div id="search-row">
      <input id="search" type="text" placeholder="Search\u2026" autocomplete="off" spellcheck="false">
      <button id="clear-search" title="Clear search">\u2715</button>
    </div>
    <div id="browser-list"></div>
    <div id="browser-actions">
      <button class="btn" id="choose-btn" title="Choose and remember a library folder">Choose</button>
      <button class="btn" id="refresh-btn" title="Reload the chosen library folder">Refresh</button>
    </div>
    <div id="library-path" title="No user library selected">Built-ins only</div>
  </div>

  <div id="right">
    <div id="meta">
      <div id="meta-row-1">
        <input class="field" id="name-edit" type="text" placeholder="(no motif selected)" readonly>
        <button class="btn" id="edit-btn">Edit</button>
        <button class="btn hidden" id="cancel-edit-btn">Cancel Edit</button>
      </div>
      <textarea class="field" id="description-edit" placeholder="Description" readonly></textarea>
      <div id="stats-line">\u2013</div>
      <div id="edit-state"></div>
    </div>

    <div id="detail-actions">
      <select class="field" id="import-mode" title="Chromatic preserves the MIDI exactly; Scale and Hybrid encode relative scale degrees">
        <option value="chromatic">Exact / Chromatic</option>
        <option value="hybrid">Hybrid</option>
        <option value="scale">Scale</option>
      </select>
      <button class="btn accent" id="import-clip-btn">Import Clip</button>
      <button class="btn" id="save-motif-btn">Save &amp; Finish</button>
    </div>

    <div id="panel-tabs">
      <button class="panel-tab active" data-panel="properties">Properties</button>
      <button class="panel-tab" data-panel="notes">Notes</button>
    </div>

    <div class="panel" id="properties-panel">
      <div class="section">
        <div class="section-title">Identity</div>
        <div class="property-grid">
          <label for="id-display">ID</label><input class="field identity" id="id-display" readonly>
          <label for="schema-display">Schema</label><input class="field identity" id="schema-display" readonly>
          <label for="length-display">Length</label><input class="field identity" id="length-display" readonly>
          <div class="help">ID is generated once and remains stable. Length is recalculated from the final note end.</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">MIDI Hot Keys</div>
        <div class="property-grid">
          <label for="hotkey-input">Trigger note</label>
          <div class="wide" id="hotkey-controls">
            <input class="field identity" id="hotkey-input" type="text" value="C1" placeholder="C3" autocomplete="off" spellcheck="false">
            <select class="field" id="hotkey-action">
              <option value="trigger">Trigger Motif</option>
              <option value="select">Select Motif</option>
            </select>
            <button class="btn" id="assign-hotkey-btn">Assign to Motif</button>
          </div>
          <label>Assigned</label><div class="wide" id="hotkey-list"></div>
          <div class="help">Trigger Motif plays this motif using the device\u2019s current Trigger Mode. Select Motif makes it active for later trigger-zone notes. Enter a note name such as C3, F\u266F2, or Bb4; click an assignment to remove it.</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Pitch &amp; Timing</div>
        <div class="property-grid">
          <label for="pitch-mode-edit">Pitch mode</label>
          <select class="field editable-property" id="pitch-mode-edit" disabled>
            <option value="scale">Scale</option><option value="chromatic">Chromatic</option><option value="hybrid">Hybrid</option>
          </select>
          <label for="default-gate-edit">Default gate</label><input class="field editable-property" id="default-gate-edit" type="number" min="0.01" step="0.01" placeholder="1" disabled>
          <label for="meter-numerator-edit">Source meter</label>
          <div style="display:flex;gap:4px">
            <input class="field editable-property" id="meter-numerator-edit" type="number" min="1" step="1" disabled>
            <select class="field editable-property" id="meter-denominator-edit" disabled>
              <option>1</option><option>2</option><option>4</option><option>8</option><option>16</option><option>32</option>
            </select>
          </div>
          <label for="pickup-ticks-edit">Pickup ticks</label><input class="field editable-property" id="pickup-ticks-edit" type="number" min="0" step="1" placeholder="0" disabled>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Velocity Curve</div>
        <div class="property-grid">
          <label for="curve-input-min">Input min</label><input class="field editable-property" id="curve-input-min" type="number" placeholder="default" disabled>
          <label for="curve-input-max">Input max</label><input class="field editable-property" id="curve-input-max" type="number" placeholder="default" disabled>
          <label for="curve-output-min">Output min</label><input class="field editable-property" id="curve-output-min" type="number" placeholder="default" disabled>
          <label for="curve-output-max">Output max</label><input class="field editable-property" id="curve-output-max" type="number" placeholder="default" disabled>
          <label for="curve-exponent">Exponent</label><input class="field editable-property" id="curve-exponent" type="number" min="0.01" step="0.01" placeholder="1" disabled>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Metadata</div>
        <div class="property-grid">
          <label for="author-edit">Author</label><input class="field editable-property wide" id="author-edit" type="text" disabled>
          <label for="source-edit">Source</label><input class="field editable-property wide" id="source-edit" type="text" disabled>
          <label for="license-edit">License</label><textarea class="field editable-property wide" id="license-edit" disabled></textarea>
          <label for="tags-edit">Tags</label><input class="field editable-property wide" id="tags-edit" type="text" placeholder="comma-separated" disabled>
          <label for="suggested-modes-edit">Suggested modes</label><input class="field editable-property wide" id="suggested-modes-edit" type="text" placeholder="comma-separated" disabled>
        </div>
      </div>
    </div>

    <div class="panel hidden" id="notes-panel">
      <div id="note-table">
        <div id="note-header">
          <span>#</span><span>Pitch</span><span>Acc</span><span>Start</span><span>Duration</span><span>Gate</span><span>Vel</span><span>Vel +</span><span>Vel \xD7</span><span>Legato</span><span>Tie</span><span></span>
        </div>
        <div id="note-rows"></div>
        <div id="add-row"><button class="btn" id="add-note-btn">+ Add Note</button></div>
      </div>
    </div>
  </div>
</div>

<div id="modal-backdrop" class="hidden" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div id="modal">
    <div id="modal-title"></div>
    <div id="modal-message"></div>
    <div id="modal-actions">
      <button class="btn" id="modal-cancel">Cancel</button>
      <button class="btn" id="modal-confirm">Continue</button>
    </div>
  </div>
</div>

<div id="debug-panel" aria-live="polite"></div>
<div id="debug-bar">
  <span id="debug-indicator">\u25CF</span><span id="debug-summary">Loading jweb bridge\u2026</span>
  <button id="debug-toggle" type="button">Debug</button>
</div>

<script>
  /** Diagnostic source label forwarded to the Max console. */
  const PAGE = 'library';
  /** Maximum number of notes allowed in one motif or Live clip import. */
  const MAX_MOTIF_NOTES = 512;
  /** Editable note schema used to generate rows and coerce outgoing field values. */
  const NOTE_FIELDS = [
    { name:'pitch', type:'number', required:true, step:'1' },
    { name:'accidental', type:'number', step:'1' },
    { name:'at', type:'number', required:true, min:'0', step:'1' },
    { name:'duration', type:'number', required:true, min:'1', step:'1' },
    { name:'gate', type:'number', min:'0.01', step:'0.01' },
    { name:'velocity', type:'number', min:'1', max:'127', step:'1' },
    { name:'velocityOffset', type:'number', step:'1' },
    { name:'velocityScale', type:'number', min:'0', step:'0.01' },
    { name:'legato', type:'checkbox' },
    { name:'tie', type:'checkbox' },
  ];
  /** Motif property controls that participate in dirty-state and edit-message handling. */
  const PROPERTY_INPUT_IDS = [
    'name-edit','description-edit','pitch-mode-edit','default-gate-edit','meter-numerator-edit',
    'meter-denominator-edit','pickup-ticks-edit','curve-input-min','curve-input-max',
    'curve-output-min','curve-output-max','curve-exponent','author-edit','source-edit',
    'license-edit','tags-edit','suggested-modes-edit',
  ];
  /** Whether the page is running inside Max's jweb bridge instead of a normal browser. */
  const isMax = typeof window.max !== 'undefined' && typeof window.max.outlet === 'function';

  if (!isMax) {
    const browserInlets = new Map();
    window.max = {
      outlet: (...args) => console.log('\u2192 Max:', ...args),
      bindInlet: (name, handler) => browserInlets.set(name, handler),
    };
    window.__motifBrowserInlets = browserInlets;
  }

  function createStore(initialState) {
    let current = initialState;
    const subscribers = new Set();
    return {
      getState: () => current,
      setState(update) {
        current = typeof update === 'function' ? update(current) : { ...current, ...update };
        for (const subscriber of subscribers) subscriber(current);
      },
      subscribe(subscriber) {
        subscribers.add(subscriber);
        return () => subscribers.delete(subscriber);
      },
    };
  }

  const store = createStore({
    server:null,
    modal:null,
    formDirty:false,
    activePanel:'properties',
    collapsedFolders:new Set(),
  });
  const debugEntries = [];
  let stateDeadline = null;
  let payloadErrorSignature = '';
  let pendingNoteTransfer = null;
  const debugIndicator = document.getElementById('debug-indicator');
  const debugSummary = document.getElementById('debug-summary');
  const debugPanel = document.getElementById('debug-panel');

  function errorText(reason) { return reason instanceof Error ? \`\${reason.name}: \${reason.message}\` : String(reason); }
  function debug(level, message) {
    const line = \`\${new Date().toLocaleTimeString()} [\${level}] \${message}\`;
    debugEntries.push(line);
    if (debugEntries.length > 80) debugEntries.shift();
    debugSummary.textContent = message;
    debugIndicator.className = level === 'error' ? 'error' : level === 'ok' ? 'ok' : '';
    debugPanel.classList.toggle('has-error', debugEntries.some((entry) => entry.includes('[error]')));
    debugPanel.textContent = debugEntries.join('\\n');
    if (isMax) window.max.outlet('web_debug', PAGE, level, encodeURIComponent(message));
  }

  window.addEventListener('error', (event) => debug('error', \`\${event.message} @ \${event.filename}:\${event.lineno}\`));
  window.addEventListener('unhandledrejection', (event) => debug('error', \`Unhandled promise: \${errorText(event.reason)}\`));
  document.getElementById('debug-toggle').addEventListener('click', () => debugPanel.classList.toggle('open'));

  function send(action) {
    try {
      window.max.outlet('lib_action', encodeURIComponent(JSON.stringify(action)));
      debug('info', \`Action: \${action.type}\`);
    } catch (reason) {
      debug('error', \`Action failed: \${errorText(reason)}\`);
    }
  }

  function selectedIsEditing(server) {
    return Boolean(server?.selected && server.editing?.active && server.editing.targetId === server.selected.id);
  }

  function hasUnsavedChanges() {
    const current = store.getState();
    return Boolean(current.formDirty || current.server?.editing?.dirty);
  }

  function openModal(options) { store.setState({ modal:options }); }
  function closeModal() { store.setState({ modal:null }); }
  function confirmDiscard(onConfirm, message = 'Discard the unsaved changes to this motif?') {
    if (!hasUnsavedChanges()) { onConfirm(); return; }
    openModal({ title:'Discard unsaved changes?', message, confirmLabel:'Discard', onConfirm });
  }

  function renderModal(modal) {
    const backdrop = document.getElementById('modal-backdrop');
    if (!modal) { backdrop.classList.add('hidden'); return; }
    backdrop.classList.remove('hidden');
    document.getElementById('modal-title').textContent = modal.title;
    document.getElementById('modal-message').textContent = modal.message;
    document.getElementById('modal-confirm').textContent = modal.confirmLabel ?? 'Continue';
    document.getElementById('modal-cancel').classList.toggle('hidden', Boolean(modal.dismissOnly));
  }

  function isFolderCollapsed(folder, query, collapsedFolders) {
    return !query && collapsedFolders.has(folder);
  }

  function toggleCollapsedFolder(folder, collapsedFolders) {
    const next = new Set(collapsedFolders);
    if (next.has(folder)) next.delete(folder);
    else next.add(folder);
    return next;
  }

  function renderBrowser(server) {
    const list = document.getElementById('browser-list');
    list.innerHTML = '';
    if (!server || server.items.length === 0) {
      const empty = document.createElement('div');
      empty.id = 'empty-list';
      empty.textContent = server?.query ? 'No matching motifs' : 'No motifs found';
      list.append(empty);
      return;
    }
    let currentFolder = null;
    let folderCollapsed = false;
    const collapsedFolders = store.getState().collapsedFolders;
    for (const item of server.items) {
      const folder = item.folder || 'Library';
      if (folder !== currentFolder) {
        currentFolder = folder;
        folderCollapsed = isFolderCollapsed(folder, server.query, collapsedFolders);
        const heading = document.createElement('button');
        heading.type = 'button';
        heading.className = 'browser-folder';
        heading.textContent = \`\${folderCollapsed ? '\u25B8' : '\u25BE'} \${folder}\`;
        heading.setAttribute('aria-expanded', String(!folderCollapsed));
        heading.title = \`\${folderCollapsed ? 'Expand' : 'Collapse'} \${folder}\`;
        heading.addEventListener('click', () => {
          store.setState({
            collapsedFolders:toggleCollapsedFolder(folder, store.getState().collapsedFolders),
          });
        });
        list.append(heading);
      }
      if (folderCollapsed) continue;
      const el = document.createElement('div');
      el.className = \`browser-item\${server.selected?.id === item.id ? ' selected' : ''}\`;
      const name = document.createElement('div');
      name.className = 'browser-name';
      name.textContent = item.name;
      el.append(name);
      if (Array.isArray(item.hotkeys) && item.hotkeys.length > 0) {
        const badge = document.createElement('div');
        badge.className = 'hotkey-badge';
        badge.textContent = item.hotkeys
          .map((mapping) => \`\${midiNoteName(mapping.pitch)} \${mapping.action === 'select' ? '\u21A6' : '\u25B6'}\`)
          .join(' ');
        el.append(badge);
      }
      if (item.showId) {
        const id = document.createElement('div');
        id.className = 'browser-id';
        id.textContent = item.id;
        el.append(id);
      }
      el.title = item.showId ? \`\${item.name}\\nID: \${item.id}\` : item.name;
      el.addEventListener('click', () => {
        if (server.selected?.id === item.id) return;
        confirmDiscard(() => send({ type:'select_browser', id:item.id, discardChanges:true }));
      });
      list.append(el);
    }
  }

  function midiNoteName(pitch) {
    const names = ['C','C\u266F','D','D\u266F','E','F','F\u266F','G','G\u266F','A','A\u266F','B'];
    const value = Math.max(0, Math.min(127, Math.round(Number(pitch))));
    return \`\${names[value % 12]}\${Math.floor(value / 12) - 2}\`;
  }

  function parseMidiNoteName(noteName) {
    const match = String(noteName).trim().match(/^([A-Ga-g])([#\u266Fb\u266D]?)(-2|-1|[0-8])$/);
    if (!match) return null;
    const pitchClasses = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };
    const accidental = match[2] === '#' || match[2] === '\u266F' ? 1 : match[2] === 'b' || match[2] === '\u266D' ? -1 : 0;
    const pitch = (Number(match[3]) + 2) * 12 + pitchClasses[match[1].toUpperCase()] + accidental;
    return pitch >= 0 && pitch <= 127 ? pitch : null;
  }

  function renderHotkeys(selected) {
    const input = document.getElementById('hotkey-input');
    const action = document.getElementById('hotkey-action');
    const assign = document.getElementById('assign-hotkey-btn');
    const list = document.getElementById('hotkey-list');
    const mappings = Array.isArray(selected?.hotkeys) ? selected.hotkeys : [];
    input.disabled = !selected;
    action.disabled = !selected;
    assign.disabled = !selected;
    list.innerHTML = '';
    if (!selected) return;
    if (mappings.length === 0) {
      const empty = document.createElement('span');
      empty.className = 'help';
      empty.textContent = 'None';
      list.append(empty);
      return;
    }
    for (const mapping of mappings) {
      const chip = document.createElement('button');
      chip.className = 'hotkey-chip';
      const actionLabel = mapping.action === 'select' ? 'Select' : 'Trigger';
      chip.title = \`Remove \${midiNoteName(mapping.pitch)} \xB7 \${actionLabel}\`;
      chip.textContent = \`\${midiNoteName(mapping.pitch)} \xB7 \${actionLabel}  \xD7\`;
      chip.addEventListener('click', () => send({ type:'unmap_trigger', pitch:mapping.pitch }));
      list.append(chip);
    }
  }

  function renderNoteRows(server, editing) {
    const notes = server?.selected?.notes ?? [];
    const noteCount = Number(server?.selected?.noteCount ?? notes.length);
    const container = document.getElementById('note-rows');
    container.innerHTML = '';
    notes.forEach((note, index) => {
      const row = document.createElement('div');
      row.className = 'note-row';
      const label = document.createElement('span');
      label.textContent = String(index + 1);
      row.append(label);
      for (const field of NOTE_FIELDS) {
        if (field.type === 'checkbox') {
          const cell = document.createElement('label');
          cell.className = 'check-cell';
          const input = document.createElement('input');
          input.type = 'checkbox';
          input.checked = Boolean(note[field.name]);
          input.disabled = !editing;
          input.addEventListener('change', () => send({
            type:'edit_note_at',
            index,
            field:field.name,
            value:input.checked,
          }));
          cell.append(input);
          row.append(cell);
          continue;
        }
        const input = document.createElement('input');
        input.type = 'number';
        input.value = note[field.name] == null ? '' : String(note[field.name]);
        input.disabled = !editing;
        if (field.min !== undefined) input.min = field.min;
        if (field.max !== undefined) input.max = field.max;
        if (field.step !== undefined) input.step = field.step;
        input.addEventListener('change', () => {
          const value = input.value === '' ? null : Number(input.value);
          if (value !== null && !Number.isFinite(value)) return;
          send({ type:'edit_note_at', index, field:field.name, value });
        });
        row.append(input);
      }
      const remove = document.createElement('button');
      remove.className = 'remove-btn';
      remove.textContent = '\u2715';
      remove.title = 'Remove note';
      remove.disabled = !editing || noteCount <= 1;
      remove.addEventListener('click', () => send({ type:'remove_note', index }));
      row.append(remove);
      container.append(row);
    });
  }

  function setValue(id, value, editing) {
    const input = document.getElementById(id);
    if (document.activeElement === input && editing) return;
    input.value = value == null ? '' : String(value);
  }

  function setEditable(editing) {
    for (const id of PROPERTY_INPUT_IDS) {
      const input = document.getElementById(id);
      if (id === 'name-edit' || id === 'description-edit') input.readOnly = !editing;
      else input.disabled = !editing;
    }
  }

  function renderProperties(selected, editing) {
    const curve = selected?.velocityCurve ?? {};
    const metadata = selected?.metadata ?? {};
    setValue('id-display', selected?.id ?? '', false);
    setValue('schema-display', selected ? \`v\${selected.schemaVersion}\` : '', false);
    setValue('length-display', selected ? \`\${selected.length} ticks\` : '', false);
    setValue('pitch-mode-edit', selected?.pitchMode ?? 'scale', editing);
    setValue('default-gate-edit', selected?.defaultGate, editing);
    setValue('meter-numerator-edit', selected?.sourceMeter?.numerator ?? '', editing);
    setValue('meter-denominator-edit', selected?.sourceMeter?.denominator ?? 4, editing);
    setValue('pickup-ticks-edit', metadata.pickupTicks, editing);
    setValue('curve-input-min', curve.inputMin, editing);
    setValue('curve-input-max', curve.inputMax, editing);
    setValue('curve-output-min', curve.outputMin, editing);
    setValue('curve-output-max', curve.outputMax, editing);
    setValue('curve-exponent', curve.exponent, editing);
    setValue('author-edit', metadata.author ?? '', editing);
    setValue('source-edit', metadata.source ?? '', editing);
    setValue('license-edit', metadata.license ?? '', editing);
    setValue('tags-edit', Array.isArray(metadata.tags) ? metadata.tags.join(', ') : '', editing);
    setValue('suggested-modes-edit', Array.isArray(metadata.suggestedModes) ? metadata.suggestedModes.join(', ') : '', editing);
  }

  function renderDetail(server, local) {
    const selected = server?.selected ?? null;
    const editing = selectedIsEditing(server);
    const edit = document.getElementById('edit-btn');
    const cancel = document.getElementById('cancel-edit-btn');
    const save = document.getElementById('save-motif-btn');
    const add = document.getElementById('add-note-btn');

    if (!selected) {
      setValue('name-edit', '', false); setValue('description-edit', '', false);
      setEditable(false); renderProperties(null, false);
      document.getElementById('stats-line').textContent = '\u2013';
      document.getElementById('edit-state').textContent = '';
      edit.disabled = true; cancel.classList.add('hidden'); save.disabled = true; add.disabled = true;
      renderNoteRows(server, false);
      renderHotkeys(null);
      return;
    }

    setValue('name-edit', selected.name, editing);
    setValue('description-edit', selected.description ?? '', editing);
    setEditable(editing);
    renderProperties(selected, editing);
    document.getElementById('stats-line').textContent = selected.stats ?? '';
    document.getElementById('edit-state').textContent = editing
      ? \`\${server.editing.dirty || local.formDirty ? 'Unsaved changes' : 'Editing'} \xB7 \${selected.id}\`
      : selected.isBuiltin
        ? 'Built-in \xB7 Edit creates a user copy'
        : \`\${selected.isPersisted ? 'Saved' : 'Not yet saved'} \xB7 \${selected.id}\`;
    edit.classList.toggle('hidden', editing);
    edit.disabled = Boolean(server.libraryScanning);
    cancel.classList.toggle('hidden', !editing);
    cancel.disabled = false;
    save.disabled = !editing || !server.libraryLoaded;
    save.title = server.libraryLoaded ? 'Save changes and exit editing' : 'Choose a valid library folder before saving';
    add.disabled = !editing
      || Boolean(selected.notesLoading)
      || selected.noteCount >= (selected.noteLimit ?? MAX_MOTIF_NOTES);
    renderNoteRows(server, editing);
    renderHotkeys(selected);
    document.getElementById('import-clip-btn').disabled = Boolean(server.libraryScanning);
  }

  function renderPanels(activePanel) {
    document.getElementById('properties-panel').classList.toggle('hidden', activePanel !== 'properties');
    document.getElementById('notes-panel').classList.toggle('hidden', activePanel !== 'notes');
    document.querySelectorAll('.panel-tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.panel === activePanel));
  }

  function render(state) {
    const server = state.server;
    renderBrowser(server);
    renderDetail(server, state);
    renderModal(state.modal);
    renderPanels(state.activePanel);
    const search = document.getElementById('search');
    if (server && document.activeElement !== search) search.value = server.query ?? '';
    const path = document.getElementById('library-path');
    path.textContent = server?.libraryPath
      ? \`\${server.libraryScanning ? 'Scanning \xB7 ' : server.libraryLoaded ? '' : 'Unavailable \xB7 '}\${server.libraryPath}\`
      : 'Built-ins only';
    path.title = server?.libraryPath || 'No user library selected';
    const refresh = document.getElementById('refresh-btn');
    refresh.disabled = !server?.libraryPath || Boolean(server?.libraryScanning);
    refresh.textContent = server?.libraryScanning ? 'Scanning\u2026' : 'Refresh';
  }

  function optionalNumber(id) {
    const value = document.getElementById(id).value.trim();
    return value === '' ? null : Number(value);
  }

  function textList(id) {
    return [...new Set(document.getElementById(id).value.split(/[\\n,]/).map((value) => value.trim()).filter(Boolean))];
  }

  function readProperties() {
    return {
      name:document.getElementById('name-edit').value,
      description:document.getElementById('description-edit').value,
      pitchMode:document.getElementById('pitch-mode-edit').value,
      sourceMeter:{
        numerator:Number(document.getElementById('meter-numerator-edit').value),
        denominator:Number(document.getElementById('meter-denominator-edit').value),
      },
      defaultGate:optionalNumber('default-gate-edit'),
      velocityCurve:{
        inputMin:optionalNumber('curve-input-min'), inputMax:optionalNumber('curve-input-max'),
        outputMin:optionalNumber('curve-output-min'), outputMax:optionalNumber('curve-output-max'),
        exponent:optionalNumber('curve-exponent'),
      },
      metadata:{
        author:document.getElementById('author-edit').value,
        source:document.getElementById('source-edit').value,
        license:document.getElementById('license-edit').value,
        tags:textList('tags-edit'), suggestedModes:textList('suggested-modes-edit'),
        pickupTicks:optionalNumber('pickup-ticks-edit'),
      },
    };
  }

  function pushProperties() {
    if (!selectedIsEditing(store.getState().server)) return;
    send({ type:'edit_motif', properties:readProperties() });
  }

  function normalizeServerState(value) {
    if (!value || !Array.isArray(value.items)) throw new TypeError('items must be an array');
    if (!value.editing || typeof value.editing.active !== 'boolean') throw new TypeError('editing state is missing');
    return {
      ...value,
      items:value.items.filter((item) => item && typeof item.id === 'string' && typeof item.name === 'string'),
      selectedIndex:Number.isInteger(value.selectedIndex) ? value.selectedIndex : -1,
      libraryPath:typeof value.libraryPath === 'string' ? value.libraryPath : '',
      libraryScanning:Boolean(value.libraryScanning),
    };
  }

  function receiveNoteChunk(payload) {
    const current = store.getState();
    const selected = current.server?.selected;
    const transferId = Number(payload.transferId);
    const offset = Number(payload.offset);
    const total = Number(payload.total);
    if (
      !selected
      || selected.id !== payload.motifId
      || selected.noteTransferId !== transferId
      || !Number.isInteger(offset)
      || !Number.isInteger(total)
      || total < 0
      || total > MAX_MOTIF_NOTES
      || !Array.isArray(payload.notes)
    ) return;

    if (
      !pendingNoteTransfer
      || pendingNoteTransfer.id !== transferId
      || pendingNoteTransfer.motifId !== payload.motifId
    ) {
      pendingNoteTransfer = {
        id:transferId,
        motifId:payload.motifId,
        total,
        notes:new Array(total),
        received:new Set(),
      };
    }

    payload.notes.forEach((note, index) => {
      const noteIndex = offset + index;
      if (noteIndex < 0 || noteIndex >= total || !note) return;
      pendingNoteTransfer.notes[noteIndex] = note;
      pendingNoteTransfer.received.add(noteIndex);
    });
    if (pendingNoteTransfer.received.size !== total) return;

    const notes = pendingNoteTransfer.notes;
    pendingNoteTransfer = null;
    store.setState({
      server:{
        ...current.server,
        selected:{ ...selected, notes, notesLoading:false },
      },
    });
  }

  function receiveData(...values) {
    const encoded = values[values.length - 1];
    try {
      const payload = JSON.parse(decodeURIComponent(String(encoded)));
      if (payload?.kind === 'note-chunk') {
        receiveNoteChunk(payload);
        payloadErrorSignature = '';
        return;
      }
      const server = normalizeServerState(payload);
      const previous = store.getState();
      const selectedChanged = previous.server?.selected?.id !== server.selected?.id;
      const editingEnded = previous.server?.editing?.active && !server.editing.active;
      pendingNoteTransfer = null;
      store.setState({ server, formDirty:selectedChanged || editingEnded ? false : previous.formDirty });
      if (server.alert?.id && server.alert.id !== previous.server?.alert?.id) {
        openModal({
          title:server.alert.title || 'Import warning',
          message:server.alert.message || 'The MIDI clip could not be imported.',
          confirmLabel:'OK',
          dismissOnly:true,
        });
      }
      payloadErrorSignature = '';
      if (stateDeadline !== null) { clearTimeout(stateDeadline); stateDeadline = null; }
      debug('ok', \`State: \${server.items.length} motifs\${server.libraryPath ? \` \xB7 \${server.libraryPath}\` : ''}\`);
    } catch (reason) {
      const detail = errorText(reason);
      if (detail === payloadErrorSignature) return;
      payloadErrorSignature = detail;
      if (/Unterminated string|Unexpected end of JSON|unterminated/i.test(detail)) {
        const message = 'The selected MIDI clip contains more note data than the Library can display. Shorten the clip or split it into smaller phrases, then import it again.';
        debug('error', \`MIDI file is too long: \${message}\`);
        openModal({
          title:'MIDI file is too long',
          message,
          confirmLabel:'OK',
          dismissOnly:true,
        });
      } else {
        debug('error', \`Library data could not be displayed: \${detail}\`);
      }
    }
  }

  store.subscribe(render);
  render(store.getState());

  document.querySelectorAll('.panel-tab').forEach((tab) => tab.addEventListener('click', () => store.setState({ activePanel:tab.dataset.panel })));
  document.getElementById('search').addEventListener('input', (event) => send({ type:'filter_motifs', query:event.target.value }));
  document.getElementById('clear-search').addEventListener('click', () => send({ type:'filter_motifs', query:'' }));
  document.getElementById('choose-btn').addEventListener('click', () => {
    confirmDiscard(() => {
      if (store.getState().server?.editing?.active) send({ type:'cancel_edit' });
      window.max.outlet('choose_library');
    }, 'Discard the current edits and choose another library folder?');
  });
  document.getElementById('refresh-btn').addEventListener('click', () => confirmDiscard(
    () => send({ type:'refresh_library', discardChanges:true }),
    'Discard the current edits and reload the library folder?',
  ));
  document.getElementById('edit-btn').addEventListener('click', () => send({ type:'begin_edit' }));
  document.getElementById('cancel-edit-btn').addEventListener('click', () => confirmDiscard(() => send({ type:'cancel_edit' })));
  document.getElementById('import-clip-btn').addEventListener('click', () => confirmDiscard(
    () => send({ type:'import_clip', pitchMode:document.getElementById('import-mode').value }),
    'Discard the current edits and import the selected Live clip?',
  ));
  document.getElementById('save-motif-btn').addEventListener('click', () => send({ type:'save_motif', properties:readProperties() }));
  document.getElementById('add-note-btn').addEventListener('click', () => send({ type:'add_note' }));
  document.getElementById('assign-hotkey-btn').addEventListener('click', () => {
    const selected = store.getState().server?.selected;
    const input = document.getElementById('hotkey-input');
    const pitch = parseMidiNoteName(input.value);
    if (!selected || pitch === null) {
      debug('error', 'Hot key must be a note name from C-2 through G8, such as C3');
      return;
    }
    input.value = midiNoteName(pitch);
    send({
      type:'map_trigger',
      pitch,
      motifId:selected.id,
      action:document.getElementById('hotkey-action').value,
    });
  });
  document.getElementById('hotkey-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      document.getElementById('assign-hotkey-btn').click();
    }
  });

  for (const id of PROPERTY_INPUT_IDS) {
    const input = document.getElementById(id);
    input.addEventListener('input', () => store.setState({ formDirty:true }));
    input.addEventListener('change', pushProperties);
    if (input.tagName === 'TEXTAREA' || input.type === 'text') input.addEventListener('blur', pushProperties);
  }

  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-backdrop').addEventListener('click', (event) => { if (event.target === event.currentTarget) closeModal(); });
  document.getElementById('modal-confirm').addEventListener('click', () => {
    const modal = store.getState().modal;
    closeModal();
    if (modal?.onConfirm) modal.onConfirm();
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && store.getState().modal) closeModal(); });

  if (isMax) {
    if (typeof window.max.bindInlet !== 'function') {
      debug('error', 'Max jweb bridge is missing bindInlet');
    } else {
      window.max.bindInlet('receiveData', receiveData);
      debug('info', \`Bridge ready; waiting for library state (\${location.href})\`);
      window.max.outlet('library_ready');
      stateDeadline = setTimeout(() => {
        if (!store.getState().server) debug('error', 'No library state received within 2 seconds');
      }, 2000);
    }
  } else {
    receiveData(encodeURIComponent(JSON.stringify({
      query:'', libraryPath:'/Users/example/Motifs', libraryLoaded:true, libraryScanning:false, scanProgress:null,
      editing:{ active:false, dirty:false, created:false, sourceId:null, targetId:null },
      items:[
        { id:'chromatic-turn', name:'Chromatic Turn', showId:false },
        { id:'scale-turn', name:'Scale Turn', showId:false },
      ],
      selectedIndex:0,
      selected:{
        schemaVersion:1, id:'chromatic-turn', name:'Chromatic Turn', description:'Fixed-interval phrase that ignores the selected scale.',
        pitchMode:'chromatic', sourceMeter:{ numerator:4, denominator:4 }, length:3360, defaultGate:.82,
        velocityCurve:{ inputMin:null, inputMax:null, outputMin:null, outputMax:null, exponent:null },
        metadata:{ author:'', source:'', license:'', tags:['demo','chromatic'], suggestedModes:[], pickupTicks:null },
        stats:'7 notes \u2022 0.88 bars \u2022 4/4 source \u2022 chromatic', isBuiltin:true, isPersisted:false,
        notes:[
          { pitch:0, accidental:null, at:0, duration:480, gate:null, velocity:null, velocityOffset:null, velocityScale:null, legato:false, tie:false },
          { pitch:2, accidental:null, at:480, duration:480, gate:null, velocity:null, velocityOffset:null, velocityScale:null, legato:false, tie:false },
        ],
      },
    })));
  }
</script>
</body>
</html>
`);
      const absolutePath = joinMaxPath(output.foldername, "uttori-motif-library-ce085acf5373.html");
      output.close();
      output = void 0;
      const verification = new File(absolutePath, "read");
      if (!verification.isopen) throw new Error(`could not reopen ${absolutePath}`);
      const byteLength = verification.eof;
      verification.close();
      if (byteLength < `<!DOCTYPE html>
<!--
  Max jweb bridge documentation:
  https://docs.cycling74.com/reference/jweb/
  https://docs.cycling74.com/userguide/web_browser/#javascript-communication
-->
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Motif Library</title>
  <style>
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    :root {
      --bg:#141415; --surface:#1c1c1e; --surface2:#18181a; --border:#2e2e32;
      --accent:#ff8c1f; --text:#e0e0e6; --muted:#7a7a82; --input:#0e0e10;
      --btn:#2a2a2e; --btn-hover:#363638; --danger:#d55549; --note-alt:#1a1a1c;
    }
    html, body { height:100%; background:var(--bg); color:var(--text); font:11px "Ableton Sans",system-ui,-apple-system,sans-serif; overflow:hidden; }
    button, input, textarea, select { font:inherit; }
    button:disabled, input:disabled, textarea:disabled, select:disabled { opacity:.42; cursor:not-allowed !important; }
    .hidden { display:none !important; }
    #app { display:flex; height:calc(100% - 20px); }
    #left { width:clamp(170px,30vw,240px); min-width:150px; flex-shrink:0; display:flex; flex-direction:column; border-right:1px solid var(--border); }
    #right { flex:1; min-width:0; display:flex; flex-direction:column; }
    #search-row { display:flex; align-items:center; gap:4px; padding:6px 6px 4px; }
    #search { flex:1; min-width:0; background:var(--input); border:1px solid var(--border); color:var(--text); padding:3px 6px; outline:none; }
    #clear-search { background:none; border:0; color:var(--muted); cursor:pointer; font-size:13px; padding:0 2px; }
    #browser-list { flex:1; overflow-y:auto; border-top:1px solid var(--border); }
    .browser-folder { position:sticky; top:0; z-index:1; width:100%; padding:4px 8px 3px; background:var(--surface2); border:0; border-bottom:1px solid var(--border); color:var(--muted); cursor:pointer; font-size:9px; font-weight:600; text-align:left; text-transform:uppercase; letter-spacing:.05em; }
    .browser-folder:hover { background:var(--btn); color:var(--text); }
    .browser-item { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:2px 5px; padding:5px 8px; cursor:pointer; border-bottom:1px solid transparent; }
    .browser-item:hover { background:var(--btn); }
    .browser-item.selected { background:var(--accent); color:#000; }
    .browser-name { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .browser-id { grid-column:1 / -1; margin-top:1px; color:var(--muted); font:9px ui-monospace,SFMono-Regular,Menlo,monospace; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .hotkey-badge { align-self:center; color:var(--accent); font:9px ui-monospace,SFMono-Regular,Menlo,monospace; white-space:nowrap; }
    .browser-item.selected .browser-id { color:rgba(0,0,0,.62); }
    .browser-item.selected .hotkey-badge { color:#000; }
    #empty-list { padding:12px 8px; color:var(--muted); text-align:center; }
    #browser-actions { border-top:1px solid var(--border); display:flex; gap:4px; padding:5px; }
    #library-path { padding:0 6px 5px; color:var(--muted); font:9px ui-monospace,SFMono-Regular,Menlo,monospace; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .btn { background:var(--btn); border:1px solid var(--border); color:var(--text); cursor:pointer; padding:3px 7px; text-align:center; white-space:nowrap; }
    .btn:hover:not(:disabled) { background:var(--btn-hover); }
    .btn:active:not(:disabled), .btn.accent { background:var(--accent); color:#000; border-color:transparent; }
    #meta { padding:6px 8px 4px; border-bottom:1px solid var(--border); display:flex; flex-direction:column; gap:3px; }
    #meta-row-1 { display:flex; align-items:center; gap:4px; }
    #name-edit { flex:1; min-width:0; font-size:12px; font-weight:600; }
    .field { background:var(--input); border:1px solid var(--border); color:var(--text); padding:3px 5px; outline:none; min-width:0; }
    .field:focus { border-color:var(--accent); }
    .field[readonly], .field:disabled { background:transparent; border-color:transparent; color:var(--muted); }
    #description-edit { resize:none; height:34px; width:100%; }
    #stats-line { color:var(--muted); font-size:10px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    #edit-state { color:var(--accent); font-size:10px; min-height:12px; }
    #detail-actions { display:flex; gap:4px; padding:4px 8px; border-bottom:1px solid var(--border); }
    #detail-actions .btn { flex:1; }
    #import-mode { width:104px; flex:0 0 auto; }
    #panel-tabs { display:flex; border-bottom:1px solid var(--border); background:var(--surface2); }
    .panel-tab { flex:1; border:0; border-right:1px solid var(--border); background:transparent; color:var(--muted); cursor:pointer; padding:4px 8px; }
    .panel-tab:last-child { border-right:0; }
    .panel-tab.active { background:var(--surface); color:var(--text); box-shadow:inset 0 -2px var(--accent); }
    .panel { flex:1; min-height:0; overflow:auto; }
    #properties-panel { padding:7px 8px 12px; }
    .section { margin-bottom:9px; }
    .section-title { color:var(--muted); font-size:10px; font-weight:600; text-transform:uppercase; letter-spacing:.05em; margin-bottom:4px; }
    .property-grid { display:grid; grid-template-columns:92px minmax(0,1fr) 92px minmax(0,1fr); gap:4px 6px; align-items:center; }
    .property-grid .wide { grid-column:2 / 5; }
    .property-grid label { color:var(--muted); font-size:10px; text-align:right; }
    .property-grid input, .property-grid select, .property-grid textarea { width:100%; }
    .property-grid textarea { min-height:38px; resize:vertical; }
    .identity { font:9px ui-monospace,SFMono-Regular,Menlo,monospace; }
    .help { grid-column:2 / 5; color:var(--muted); font-size:9px; line-height:1.25; }
    #hotkey-controls { display:flex; gap:4px; }
    #hotkey-input { width:72px; }
    #hotkey-action { width:112px; }
    #hotkey-list { display:flex; flex-wrap:wrap; gap:4px; }
    .hotkey-chip { background:var(--btn); border:1px solid var(--border); color:var(--text); cursor:pointer; padding:2px 5px; }
    .hotkey-chip:hover { background:var(--danger); border-color:var(--danger); color:#fff; }
    #notes-panel { overflow:auto; }
    #note-table { min-width:780px; display:flex; flex-direction:column; min-height:100%; }
    #note-header, .note-row { display:grid; grid-template-columns:28px 48px 38px 48px 54px 44px 48px 50px 50px 42px 42px 26px; }
    #note-header { position:sticky; top:0; z-index:2; background:var(--surface); border-bottom:1px solid var(--border); color:var(--muted); font-size:9px; font-weight:600; }
    #note-header span { padding:3px 2px; text-align:right; border-right:1px solid var(--border); }
    #note-header span:first-child, #note-header span:nth-last-child(-n+3) { text-align:center; }
    #note-rows { flex:1; }
    .note-row { border-bottom:1px solid var(--border); align-items:center; }
    .note-row:nth-child(even) { background:var(--note-alt); }
    .note-row > span { color:var(--muted); font-size:10px; text-align:center; padding:2px; }
    .note-row input[type="number"] { background:transparent; border:0; border-left:1px solid var(--border); color:var(--text); font-size:10px; padding:2px 3px; text-align:right; width:100%; outline:none; -moz-appearance:textfield; }
    .note-row input[type="number"]::-webkit-inner-spin-button, .note-row input[type="number"]::-webkit-outer-spin-button { display:none; }
    .note-row input[type="number"]:focus { background:var(--input); }
    .check-cell { display:flex; justify-content:center; border-left:1px solid var(--border); }
    .check-cell input { accent-color:var(--accent); }
    .remove-btn { background:none; border:0; border-left:1px solid var(--border); color:var(--danger); cursor:pointer; font-size:13px; width:100%; height:100%; }
    .remove-btn:hover:not(:disabled) { background:var(--danger); color:#fff; }
    #add-row { position:sticky; bottom:0; border-top:1px solid var(--border); padding:4px 8px; background:var(--bg); }
    #add-note-btn { width:100%; }
    #modal-backdrop { position:fixed; inset:0; z-index:100; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.68); }
    #modal { width:330px; max-width:calc(100% - 32px); background:var(--surface); border:1px solid #4a4a50; box-shadow:0 12px 40px rgba(0,0,0,.55); padding:12px; }
    #modal-title { font-size:13px; margin-bottom:7px; }
    #modal-message { color:var(--muted); line-height:1.4; white-space:pre-wrap; }
    #modal-actions { display:flex; justify-content:flex-end; gap:6px; margin-top:12px; }
    #debug-bar { position:fixed; left:0; right:0; bottom:0; height:20px; z-index:30; display:flex; align-items:center; gap:5px; padding:0 6px; border-top:1px solid var(--border); background:#101012; color:var(--muted); font-size:9px; }
    #debug-indicator { color:#b0a050; } #debug-indicator.ok { color:#70c070; } #debug-indicator.error { color:#ff7066; }
    #debug-summary { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    #debug-toggle { border:0; background:transparent; color:var(--muted); cursor:pointer; }
    #debug-panel { position:fixed; left:0; right:0; bottom:20px; z-index:29; display:none; max-height:160px; overflow:auto; padding:6px; border-top:1px solid var(--border); background:rgba(8,8,9,.97); color:#c8c8ce; font:9px ui-monospace,SFMono-Regular,Menlo,monospace; white-space:pre-wrap; user-select:text; }
    #debug-panel.open { display:block; } #debug-panel.has-error { color:#ff8b82; }
    @media (max-width:520px) {
      #app { flex-direction:column; }
      #left { width:100%; min-width:0; height:140px; border-right:0; border-bottom:1px solid var(--border); }
      #right { min-height:0; }
      .property-grid { grid-template-columns:80px minmax(0,1fr); }
      .property-grid .wide { grid-column:2; }
      .help { grid-column:1 / -1; }
    }
  /* Firefox */
  * {
    scrollbar-width: thin;
    scrollbar-color: #7a7a82 #141415;
  }
  /* Chrome, Edge, and Safari */
  *::-webkit-scrollbar {
    width: 16px;
  }
  *::-webkit-scrollbar-track {
    background: #141415;
  }
  *::-webkit-scrollbar-thumb {
    background-color: #7a7a82;
    border-radius: 10px;
    border: 3px none #000000;
  }
  </style>
</head>
<body>
<div id="app">
  <div id="left">
    <div id="search-row">
      <input id="search" type="text" placeholder="Search\u2026" autocomplete="off" spellcheck="false">
      <button id="clear-search" title="Clear search">\u2715</button>
    </div>
    <div id="browser-list"></div>
    <div id="browser-actions">
      <button class="btn" id="choose-btn" title="Choose and remember a library folder">Choose</button>
      <button class="btn" id="refresh-btn" title="Reload the chosen library folder">Refresh</button>
    </div>
    <div id="library-path" title="No user library selected">Built-ins only</div>
  </div>

  <div id="right">
    <div id="meta">
      <div id="meta-row-1">
        <input class="field" id="name-edit" type="text" placeholder="(no motif selected)" readonly>
        <button class="btn" id="edit-btn">Edit</button>
        <button class="btn hidden" id="cancel-edit-btn">Cancel Edit</button>
      </div>
      <textarea class="field" id="description-edit" placeholder="Description" readonly></textarea>
      <div id="stats-line">\u2013</div>
      <div id="edit-state"></div>
    </div>

    <div id="detail-actions">
      <select class="field" id="import-mode" title="Chromatic preserves the MIDI exactly; Scale and Hybrid encode relative scale degrees">
        <option value="chromatic">Exact / Chromatic</option>
        <option value="hybrid">Hybrid</option>
        <option value="scale">Scale</option>
      </select>
      <button class="btn accent" id="import-clip-btn">Import Clip</button>
      <button class="btn" id="save-motif-btn">Save &amp; Finish</button>
    </div>

    <div id="panel-tabs">
      <button class="panel-tab active" data-panel="properties">Properties</button>
      <button class="panel-tab" data-panel="notes">Notes</button>
    </div>

    <div class="panel" id="properties-panel">
      <div class="section">
        <div class="section-title">Identity</div>
        <div class="property-grid">
          <label for="id-display">ID</label><input class="field identity" id="id-display" readonly>
          <label for="schema-display">Schema</label><input class="field identity" id="schema-display" readonly>
          <label for="length-display">Length</label><input class="field identity" id="length-display" readonly>
          <div class="help">ID is generated once and remains stable. Length is recalculated from the final note end.</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">MIDI Hot Keys</div>
        <div class="property-grid">
          <label for="hotkey-input">Trigger note</label>
          <div class="wide" id="hotkey-controls">
            <input class="field identity" id="hotkey-input" type="text" value="C1" placeholder="C3" autocomplete="off" spellcheck="false">
            <select class="field" id="hotkey-action">
              <option value="trigger">Trigger Motif</option>
              <option value="select">Select Motif</option>
            </select>
            <button class="btn" id="assign-hotkey-btn">Assign to Motif</button>
          </div>
          <label>Assigned</label><div class="wide" id="hotkey-list"></div>
          <div class="help">Trigger Motif plays this motif using the device\u2019s current Trigger Mode. Select Motif makes it active for later trigger-zone notes. Enter a note name such as C3, F\u266F2, or Bb4; click an assignment to remove it.</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Pitch &amp; Timing</div>
        <div class="property-grid">
          <label for="pitch-mode-edit">Pitch mode</label>
          <select class="field editable-property" id="pitch-mode-edit" disabled>
            <option value="scale">Scale</option><option value="chromatic">Chromatic</option><option value="hybrid">Hybrid</option>
          </select>
          <label for="default-gate-edit">Default gate</label><input class="field editable-property" id="default-gate-edit" type="number" min="0.01" step="0.01" placeholder="1" disabled>
          <label for="meter-numerator-edit">Source meter</label>
          <div style="display:flex;gap:4px">
            <input class="field editable-property" id="meter-numerator-edit" type="number" min="1" step="1" disabled>
            <select class="field editable-property" id="meter-denominator-edit" disabled>
              <option>1</option><option>2</option><option>4</option><option>8</option><option>16</option><option>32</option>
            </select>
          </div>
          <label for="pickup-ticks-edit">Pickup ticks</label><input class="field editable-property" id="pickup-ticks-edit" type="number" min="0" step="1" placeholder="0" disabled>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Velocity Curve</div>
        <div class="property-grid">
          <label for="curve-input-min">Input min</label><input class="field editable-property" id="curve-input-min" type="number" placeholder="default" disabled>
          <label for="curve-input-max">Input max</label><input class="field editable-property" id="curve-input-max" type="number" placeholder="default" disabled>
          <label for="curve-output-min">Output min</label><input class="field editable-property" id="curve-output-min" type="number" placeholder="default" disabled>
          <label for="curve-output-max">Output max</label><input class="field editable-property" id="curve-output-max" type="number" placeholder="default" disabled>
          <label for="curve-exponent">Exponent</label><input class="field editable-property" id="curve-exponent" type="number" min="0.01" step="0.01" placeholder="1" disabled>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Metadata</div>
        <div class="property-grid">
          <label for="author-edit">Author</label><input class="field editable-property wide" id="author-edit" type="text" disabled>
          <label for="source-edit">Source</label><input class="field editable-property wide" id="source-edit" type="text" disabled>
          <label for="license-edit">License</label><textarea class="field editable-property wide" id="license-edit" disabled></textarea>
          <label for="tags-edit">Tags</label><input class="field editable-property wide" id="tags-edit" type="text" placeholder="comma-separated" disabled>
          <label for="suggested-modes-edit">Suggested modes</label><input class="field editable-property wide" id="suggested-modes-edit" type="text" placeholder="comma-separated" disabled>
        </div>
      </div>
    </div>

    <div class="panel hidden" id="notes-panel">
      <div id="note-table">
        <div id="note-header">
          <span>#</span><span>Pitch</span><span>Acc</span><span>Start</span><span>Duration</span><span>Gate</span><span>Vel</span><span>Vel +</span><span>Vel \xD7</span><span>Legato</span><span>Tie</span><span></span>
        </div>
        <div id="note-rows"></div>
        <div id="add-row"><button class="btn" id="add-note-btn">+ Add Note</button></div>
      </div>
    </div>
  </div>
</div>

<div id="modal-backdrop" class="hidden" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div id="modal">
    <div id="modal-title"></div>
    <div id="modal-message"></div>
    <div id="modal-actions">
      <button class="btn" id="modal-cancel">Cancel</button>
      <button class="btn" id="modal-confirm">Continue</button>
    </div>
  </div>
</div>

<div id="debug-panel" aria-live="polite"></div>
<div id="debug-bar">
  <span id="debug-indicator">\u25CF</span><span id="debug-summary">Loading jweb bridge\u2026</span>
  <button id="debug-toggle" type="button">Debug</button>
</div>

<script>
  /** Diagnostic source label forwarded to the Max console. */
  const PAGE = 'library';
  /** Maximum number of notes allowed in one motif or Live clip import. */
  const MAX_MOTIF_NOTES = 512;
  /** Editable note schema used to generate rows and coerce outgoing field values. */
  const NOTE_FIELDS = [
    { name:'pitch', type:'number', required:true, step:'1' },
    { name:'accidental', type:'number', step:'1' },
    { name:'at', type:'number', required:true, min:'0', step:'1' },
    { name:'duration', type:'number', required:true, min:'1', step:'1' },
    { name:'gate', type:'number', min:'0.01', step:'0.01' },
    { name:'velocity', type:'number', min:'1', max:'127', step:'1' },
    { name:'velocityOffset', type:'number', step:'1' },
    { name:'velocityScale', type:'number', min:'0', step:'0.01' },
    { name:'legato', type:'checkbox' },
    { name:'tie', type:'checkbox' },
  ];
  /** Motif property controls that participate in dirty-state and edit-message handling. */
  const PROPERTY_INPUT_IDS = [
    'name-edit','description-edit','pitch-mode-edit','default-gate-edit','meter-numerator-edit',
    'meter-denominator-edit','pickup-ticks-edit','curve-input-min','curve-input-max',
    'curve-output-min','curve-output-max','curve-exponent','author-edit','source-edit',
    'license-edit','tags-edit','suggested-modes-edit',
  ];
  /** Whether the page is running inside Max's jweb bridge instead of a normal browser. */
  const isMax = typeof window.max !== 'undefined' && typeof window.max.outlet === 'function';

  if (!isMax) {
    const browserInlets = new Map();
    window.max = {
      outlet: (...args) => console.log('\u2192 Max:', ...args),
      bindInlet: (name, handler) => browserInlets.set(name, handler),
    };
    window.__motifBrowserInlets = browserInlets;
  }

  function createStore(initialState) {
    let current = initialState;
    const subscribers = new Set();
    return {
      getState: () => current,
      setState(update) {
        current = typeof update === 'function' ? update(current) : { ...current, ...update };
        for (const subscriber of subscribers) subscriber(current);
      },
      subscribe(subscriber) {
        subscribers.add(subscriber);
        return () => subscribers.delete(subscriber);
      },
    };
  }

  const store = createStore({
    server:null,
    modal:null,
    formDirty:false,
    activePanel:'properties',
    collapsedFolders:new Set(),
  });
  const debugEntries = [];
  let stateDeadline = null;
  let payloadErrorSignature = '';
  let pendingNoteTransfer = null;
  const debugIndicator = document.getElementById('debug-indicator');
  const debugSummary = document.getElementById('debug-summary');
  const debugPanel = document.getElementById('debug-panel');

  function errorText(reason) { return reason instanceof Error ? \`\${reason.name}: \${reason.message}\` : String(reason); }
  function debug(level, message) {
    const line = \`\${new Date().toLocaleTimeString()} [\${level}] \${message}\`;
    debugEntries.push(line);
    if (debugEntries.length > 80) debugEntries.shift();
    debugSummary.textContent = message;
    debugIndicator.className = level === 'error' ? 'error' : level === 'ok' ? 'ok' : '';
    debugPanel.classList.toggle('has-error', debugEntries.some((entry) => entry.includes('[error]')));
    debugPanel.textContent = debugEntries.join('\\n');
    if (isMax) window.max.outlet('web_debug', PAGE, level, encodeURIComponent(message));
  }

  window.addEventListener('error', (event) => debug('error', \`\${event.message} @ \${event.filename}:\${event.lineno}\`));
  window.addEventListener('unhandledrejection', (event) => debug('error', \`Unhandled promise: \${errorText(event.reason)}\`));
  document.getElementById('debug-toggle').addEventListener('click', () => debugPanel.classList.toggle('open'));

  function send(action) {
    try {
      window.max.outlet('lib_action', encodeURIComponent(JSON.stringify(action)));
      debug('info', \`Action: \${action.type}\`);
    } catch (reason) {
      debug('error', \`Action failed: \${errorText(reason)}\`);
    }
  }

  function selectedIsEditing(server) {
    return Boolean(server?.selected && server.editing?.active && server.editing.targetId === server.selected.id);
  }

  function hasUnsavedChanges() {
    const current = store.getState();
    return Boolean(current.formDirty || current.server?.editing?.dirty);
  }

  function openModal(options) { store.setState({ modal:options }); }
  function closeModal() { store.setState({ modal:null }); }
  function confirmDiscard(onConfirm, message = 'Discard the unsaved changes to this motif?') {
    if (!hasUnsavedChanges()) { onConfirm(); return; }
    openModal({ title:'Discard unsaved changes?', message, confirmLabel:'Discard', onConfirm });
  }

  function renderModal(modal) {
    const backdrop = document.getElementById('modal-backdrop');
    if (!modal) { backdrop.classList.add('hidden'); return; }
    backdrop.classList.remove('hidden');
    document.getElementById('modal-title').textContent = modal.title;
    document.getElementById('modal-message').textContent = modal.message;
    document.getElementById('modal-confirm').textContent = modal.confirmLabel ?? 'Continue';
    document.getElementById('modal-cancel').classList.toggle('hidden', Boolean(modal.dismissOnly));
  }

  function isFolderCollapsed(folder, query, collapsedFolders) {
    return !query && collapsedFolders.has(folder);
  }

  function toggleCollapsedFolder(folder, collapsedFolders) {
    const next = new Set(collapsedFolders);
    if (next.has(folder)) next.delete(folder);
    else next.add(folder);
    return next;
  }

  function renderBrowser(server) {
    const list = document.getElementById('browser-list');
    list.innerHTML = '';
    if (!server || server.items.length === 0) {
      const empty = document.createElement('div');
      empty.id = 'empty-list';
      empty.textContent = server?.query ? 'No matching motifs' : 'No motifs found';
      list.append(empty);
      return;
    }
    let currentFolder = null;
    let folderCollapsed = false;
    const collapsedFolders = store.getState().collapsedFolders;
    for (const item of server.items) {
      const folder = item.folder || 'Library';
      if (folder !== currentFolder) {
        currentFolder = folder;
        folderCollapsed = isFolderCollapsed(folder, server.query, collapsedFolders);
        const heading = document.createElement('button');
        heading.type = 'button';
        heading.className = 'browser-folder';
        heading.textContent = \`\${folderCollapsed ? '\u25B8' : '\u25BE'} \${folder}\`;
        heading.setAttribute('aria-expanded', String(!folderCollapsed));
        heading.title = \`\${folderCollapsed ? 'Expand' : 'Collapse'} \${folder}\`;
        heading.addEventListener('click', () => {
          store.setState({
            collapsedFolders:toggleCollapsedFolder(folder, store.getState().collapsedFolders),
          });
        });
        list.append(heading);
      }
      if (folderCollapsed) continue;
      const el = document.createElement('div');
      el.className = \`browser-item\${server.selected?.id === item.id ? ' selected' : ''}\`;
      const name = document.createElement('div');
      name.className = 'browser-name';
      name.textContent = item.name;
      el.append(name);
      if (Array.isArray(item.hotkeys) && item.hotkeys.length > 0) {
        const badge = document.createElement('div');
        badge.className = 'hotkey-badge';
        badge.textContent = item.hotkeys
          .map((mapping) => \`\${midiNoteName(mapping.pitch)} \${mapping.action === 'select' ? '\u21A6' : '\u25B6'}\`)
          .join(' ');
        el.append(badge);
      }
      if (item.showId) {
        const id = document.createElement('div');
        id.className = 'browser-id';
        id.textContent = item.id;
        el.append(id);
      }
      el.title = item.showId ? \`\${item.name}\\nID: \${item.id}\` : item.name;
      el.addEventListener('click', () => {
        if (server.selected?.id === item.id) return;
        confirmDiscard(() => send({ type:'select_browser', id:item.id, discardChanges:true }));
      });
      list.append(el);
    }
  }

  function midiNoteName(pitch) {
    const names = ['C','C\u266F','D','D\u266F','E','F','F\u266F','G','G\u266F','A','A\u266F','B'];
    const value = Math.max(0, Math.min(127, Math.round(Number(pitch))));
    return \`\${names[value % 12]}\${Math.floor(value / 12) - 2}\`;
  }

  function parseMidiNoteName(noteName) {
    const match = String(noteName).trim().match(/^([A-Ga-g])([#\u266Fb\u266D]?)(-2|-1|[0-8])$/);
    if (!match) return null;
    const pitchClasses = { C:0, D:2, E:4, F:5, G:7, A:9, B:11 };
    const accidental = match[2] === '#' || match[2] === '\u266F' ? 1 : match[2] === 'b' || match[2] === '\u266D' ? -1 : 0;
    const pitch = (Number(match[3]) + 2) * 12 + pitchClasses[match[1].toUpperCase()] + accidental;
    return pitch >= 0 && pitch <= 127 ? pitch : null;
  }

  function renderHotkeys(selected) {
    const input = document.getElementById('hotkey-input');
    const action = document.getElementById('hotkey-action');
    const assign = document.getElementById('assign-hotkey-btn');
    const list = document.getElementById('hotkey-list');
    const mappings = Array.isArray(selected?.hotkeys) ? selected.hotkeys : [];
    input.disabled = !selected;
    action.disabled = !selected;
    assign.disabled = !selected;
    list.innerHTML = '';
    if (!selected) return;
    if (mappings.length === 0) {
      const empty = document.createElement('span');
      empty.className = 'help';
      empty.textContent = 'None';
      list.append(empty);
      return;
    }
    for (const mapping of mappings) {
      const chip = document.createElement('button');
      chip.className = 'hotkey-chip';
      const actionLabel = mapping.action === 'select' ? 'Select' : 'Trigger';
      chip.title = \`Remove \${midiNoteName(mapping.pitch)} \xB7 \${actionLabel}\`;
      chip.textContent = \`\${midiNoteName(mapping.pitch)} \xB7 \${actionLabel}  \xD7\`;
      chip.addEventListener('click', () => send({ type:'unmap_trigger', pitch:mapping.pitch }));
      list.append(chip);
    }
  }

  function renderNoteRows(server, editing) {
    const notes = server?.selected?.notes ?? [];
    const noteCount = Number(server?.selected?.noteCount ?? notes.length);
    const container = document.getElementById('note-rows');
    container.innerHTML = '';
    notes.forEach((note, index) => {
      const row = document.createElement('div');
      row.className = 'note-row';
      const label = document.createElement('span');
      label.textContent = String(index + 1);
      row.append(label);
      for (const field of NOTE_FIELDS) {
        if (field.type === 'checkbox') {
          const cell = document.createElement('label');
          cell.className = 'check-cell';
          const input = document.createElement('input');
          input.type = 'checkbox';
          input.checked = Boolean(note[field.name]);
          input.disabled = !editing;
          input.addEventListener('change', () => send({
            type:'edit_note_at',
            index,
            field:field.name,
            value:input.checked,
          }));
          cell.append(input);
          row.append(cell);
          continue;
        }
        const input = document.createElement('input');
        input.type = 'number';
        input.value = note[field.name] == null ? '' : String(note[field.name]);
        input.disabled = !editing;
        if (field.min !== undefined) input.min = field.min;
        if (field.max !== undefined) input.max = field.max;
        if (field.step !== undefined) input.step = field.step;
        input.addEventListener('change', () => {
          const value = input.value === '' ? null : Number(input.value);
          if (value !== null && !Number.isFinite(value)) return;
          send({ type:'edit_note_at', index, field:field.name, value });
        });
        row.append(input);
      }
      const remove = document.createElement('button');
      remove.className = 'remove-btn';
      remove.textContent = '\u2715';
      remove.title = 'Remove note';
      remove.disabled = !editing || noteCount <= 1;
      remove.addEventListener('click', () => send({ type:'remove_note', index }));
      row.append(remove);
      container.append(row);
    });
  }

  function setValue(id, value, editing) {
    const input = document.getElementById(id);
    if (document.activeElement === input && editing) return;
    input.value = value == null ? '' : String(value);
  }

  function setEditable(editing) {
    for (const id of PROPERTY_INPUT_IDS) {
      const input = document.getElementById(id);
      if (id === 'name-edit' || id === 'description-edit') input.readOnly = !editing;
      else input.disabled = !editing;
    }
  }

  function renderProperties(selected, editing) {
    const curve = selected?.velocityCurve ?? {};
    const metadata = selected?.metadata ?? {};
    setValue('id-display', selected?.id ?? '', false);
    setValue('schema-display', selected ? \`v\${selected.schemaVersion}\` : '', false);
    setValue('length-display', selected ? \`\${selected.length} ticks\` : '', false);
    setValue('pitch-mode-edit', selected?.pitchMode ?? 'scale', editing);
    setValue('default-gate-edit', selected?.defaultGate, editing);
    setValue('meter-numerator-edit', selected?.sourceMeter?.numerator ?? '', editing);
    setValue('meter-denominator-edit', selected?.sourceMeter?.denominator ?? 4, editing);
    setValue('pickup-ticks-edit', metadata.pickupTicks, editing);
    setValue('curve-input-min', curve.inputMin, editing);
    setValue('curve-input-max', curve.inputMax, editing);
    setValue('curve-output-min', curve.outputMin, editing);
    setValue('curve-output-max', curve.outputMax, editing);
    setValue('curve-exponent', curve.exponent, editing);
    setValue('author-edit', metadata.author ?? '', editing);
    setValue('source-edit', metadata.source ?? '', editing);
    setValue('license-edit', metadata.license ?? '', editing);
    setValue('tags-edit', Array.isArray(metadata.tags) ? metadata.tags.join(', ') : '', editing);
    setValue('suggested-modes-edit', Array.isArray(metadata.suggestedModes) ? metadata.suggestedModes.join(', ') : '', editing);
  }

  function renderDetail(server, local) {
    const selected = server?.selected ?? null;
    const editing = selectedIsEditing(server);
    const edit = document.getElementById('edit-btn');
    const cancel = document.getElementById('cancel-edit-btn');
    const save = document.getElementById('save-motif-btn');
    const add = document.getElementById('add-note-btn');

    if (!selected) {
      setValue('name-edit', '', false); setValue('description-edit', '', false);
      setEditable(false); renderProperties(null, false);
      document.getElementById('stats-line').textContent = '\u2013';
      document.getElementById('edit-state').textContent = '';
      edit.disabled = true; cancel.classList.add('hidden'); save.disabled = true; add.disabled = true;
      renderNoteRows(server, false);
      renderHotkeys(null);
      return;
    }

    setValue('name-edit', selected.name, editing);
    setValue('description-edit', selected.description ?? '', editing);
    setEditable(editing);
    renderProperties(selected, editing);
    document.getElementById('stats-line').textContent = selected.stats ?? '';
    document.getElementById('edit-state').textContent = editing
      ? \`\${server.editing.dirty || local.formDirty ? 'Unsaved changes' : 'Editing'} \xB7 \${selected.id}\`
      : selected.isBuiltin
        ? 'Built-in \xB7 Edit creates a user copy'
        : \`\${selected.isPersisted ? 'Saved' : 'Not yet saved'} \xB7 \${selected.id}\`;
    edit.classList.toggle('hidden', editing);
    edit.disabled = Boolean(server.libraryScanning);
    cancel.classList.toggle('hidden', !editing);
    cancel.disabled = false;
    save.disabled = !editing || !server.libraryLoaded;
    save.title = server.libraryLoaded ? 'Save changes and exit editing' : 'Choose a valid library folder before saving';
    add.disabled = !editing
      || Boolean(selected.notesLoading)
      || selected.noteCount >= (selected.noteLimit ?? MAX_MOTIF_NOTES);
    renderNoteRows(server, editing);
    renderHotkeys(selected);
    document.getElementById('import-clip-btn').disabled = Boolean(server.libraryScanning);
  }

  function renderPanels(activePanel) {
    document.getElementById('properties-panel').classList.toggle('hidden', activePanel !== 'properties');
    document.getElementById('notes-panel').classList.toggle('hidden', activePanel !== 'notes');
    document.querySelectorAll('.panel-tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.panel === activePanel));
  }

  function render(state) {
    const server = state.server;
    renderBrowser(server);
    renderDetail(server, state);
    renderModal(state.modal);
    renderPanels(state.activePanel);
    const search = document.getElementById('search');
    if (server && document.activeElement !== search) search.value = server.query ?? '';
    const path = document.getElementById('library-path');
    path.textContent = server?.libraryPath
      ? \`\${server.libraryScanning ? 'Scanning \xB7 ' : server.libraryLoaded ? '' : 'Unavailable \xB7 '}\${server.libraryPath}\`
      : 'Built-ins only';
    path.title = server?.libraryPath || 'No user library selected';
    const refresh = document.getElementById('refresh-btn');
    refresh.disabled = !server?.libraryPath || Boolean(server?.libraryScanning);
    refresh.textContent = server?.libraryScanning ? 'Scanning\u2026' : 'Refresh';
  }

  function optionalNumber(id) {
    const value = document.getElementById(id).value.trim();
    return value === '' ? null : Number(value);
  }

  function textList(id) {
    return [...new Set(document.getElementById(id).value.split(/[\\n,]/).map((value) => value.trim()).filter(Boolean))];
  }

  function readProperties() {
    return {
      name:document.getElementById('name-edit').value,
      description:document.getElementById('description-edit').value,
      pitchMode:document.getElementById('pitch-mode-edit').value,
      sourceMeter:{
        numerator:Number(document.getElementById('meter-numerator-edit').value),
        denominator:Number(document.getElementById('meter-denominator-edit').value),
      },
      defaultGate:optionalNumber('default-gate-edit'),
      velocityCurve:{
        inputMin:optionalNumber('curve-input-min'), inputMax:optionalNumber('curve-input-max'),
        outputMin:optionalNumber('curve-output-min'), outputMax:optionalNumber('curve-output-max'),
        exponent:optionalNumber('curve-exponent'),
      },
      metadata:{
        author:document.getElementById('author-edit').value,
        source:document.getElementById('source-edit').value,
        license:document.getElementById('license-edit').value,
        tags:textList('tags-edit'), suggestedModes:textList('suggested-modes-edit'),
        pickupTicks:optionalNumber('pickup-ticks-edit'),
      },
    };
  }

  function pushProperties() {
    if (!selectedIsEditing(store.getState().server)) return;
    send({ type:'edit_motif', properties:readProperties() });
  }

  function normalizeServerState(value) {
    if (!value || !Array.isArray(value.items)) throw new TypeError('items must be an array');
    if (!value.editing || typeof value.editing.active !== 'boolean') throw new TypeError('editing state is missing');
    return {
      ...value,
      items:value.items.filter((item) => item && typeof item.id === 'string' && typeof item.name === 'string'),
      selectedIndex:Number.isInteger(value.selectedIndex) ? value.selectedIndex : -1,
      libraryPath:typeof value.libraryPath === 'string' ? value.libraryPath : '',
      libraryScanning:Boolean(value.libraryScanning),
    };
  }

  function receiveNoteChunk(payload) {
    const current = store.getState();
    const selected = current.server?.selected;
    const transferId = Number(payload.transferId);
    const offset = Number(payload.offset);
    const total = Number(payload.total);
    if (
      !selected
      || selected.id !== payload.motifId
      || selected.noteTransferId !== transferId
      || !Number.isInteger(offset)
      || !Number.isInteger(total)
      || total < 0
      || total > MAX_MOTIF_NOTES
      || !Array.isArray(payload.notes)
    ) return;

    if (
      !pendingNoteTransfer
      || pendingNoteTransfer.id !== transferId
      || pendingNoteTransfer.motifId !== payload.motifId
    ) {
      pendingNoteTransfer = {
        id:transferId,
        motifId:payload.motifId,
        total,
        notes:new Array(total),
        received:new Set(),
      };
    }

    payload.notes.forEach((note, index) => {
      const noteIndex = offset + index;
      if (noteIndex < 0 || noteIndex >= total || !note) return;
      pendingNoteTransfer.notes[noteIndex] = note;
      pendingNoteTransfer.received.add(noteIndex);
    });
    if (pendingNoteTransfer.received.size !== total) return;

    const notes = pendingNoteTransfer.notes;
    pendingNoteTransfer = null;
    store.setState({
      server:{
        ...current.server,
        selected:{ ...selected, notes, notesLoading:false },
      },
    });
  }

  function receiveData(...values) {
    const encoded = values[values.length - 1];
    try {
      const payload = JSON.parse(decodeURIComponent(String(encoded)));
      if (payload?.kind === 'note-chunk') {
        receiveNoteChunk(payload);
        payloadErrorSignature = '';
        return;
      }
      const server = normalizeServerState(payload);
      const previous = store.getState();
      const selectedChanged = previous.server?.selected?.id !== server.selected?.id;
      const editingEnded = previous.server?.editing?.active && !server.editing.active;
      pendingNoteTransfer = null;
      store.setState({ server, formDirty:selectedChanged || editingEnded ? false : previous.formDirty });
      if (server.alert?.id && server.alert.id !== previous.server?.alert?.id) {
        openModal({
          title:server.alert.title || 'Import warning',
          message:server.alert.message || 'The MIDI clip could not be imported.',
          confirmLabel:'OK',
          dismissOnly:true,
        });
      }
      payloadErrorSignature = '';
      if (stateDeadline !== null) { clearTimeout(stateDeadline); stateDeadline = null; }
      debug('ok', \`State: \${server.items.length} motifs\${server.libraryPath ? \` \xB7 \${server.libraryPath}\` : ''}\`);
    } catch (reason) {
      const detail = errorText(reason);
      if (detail === payloadErrorSignature) return;
      payloadErrorSignature = detail;
      if (/Unterminated string|Unexpected end of JSON|unterminated/i.test(detail)) {
        const message = 'The selected MIDI clip contains more note data than the Library can display. Shorten the clip or split it into smaller phrases, then import it again.';
        debug('error', \`MIDI file is too long: \${message}\`);
        openModal({
          title:'MIDI file is too long',
          message,
          confirmLabel:'OK',
          dismissOnly:true,
        });
      } else {
        debug('error', \`Library data could not be displayed: \${detail}\`);
      }
    }
  }

  store.subscribe(render);
  render(store.getState());

  document.querySelectorAll('.panel-tab').forEach((tab) => tab.addEventListener('click', () => store.setState({ activePanel:tab.dataset.panel })));
  document.getElementById('search').addEventListener('input', (event) => send({ type:'filter_motifs', query:event.target.value }));
  document.getElementById('clear-search').addEventListener('click', () => send({ type:'filter_motifs', query:'' }));
  document.getElementById('choose-btn').addEventListener('click', () => {
    confirmDiscard(() => {
      if (store.getState().server?.editing?.active) send({ type:'cancel_edit' });
      window.max.outlet('choose_library');
    }, 'Discard the current edits and choose another library folder?');
  });
  document.getElementById('refresh-btn').addEventListener('click', () => confirmDiscard(
    () => send({ type:'refresh_library', discardChanges:true }),
    'Discard the current edits and reload the library folder?',
  ));
  document.getElementById('edit-btn').addEventListener('click', () => send({ type:'begin_edit' }));
  document.getElementById('cancel-edit-btn').addEventListener('click', () => confirmDiscard(() => send({ type:'cancel_edit' })));
  document.getElementById('import-clip-btn').addEventListener('click', () => confirmDiscard(
    () => send({ type:'import_clip', pitchMode:document.getElementById('import-mode').value }),
    'Discard the current edits and import the selected Live clip?',
  ));
  document.getElementById('save-motif-btn').addEventListener('click', () => send({ type:'save_motif', properties:readProperties() }));
  document.getElementById('add-note-btn').addEventListener('click', () => send({ type:'add_note' }));
  document.getElementById('assign-hotkey-btn').addEventListener('click', () => {
    const selected = store.getState().server?.selected;
    const input = document.getElementById('hotkey-input');
    const pitch = parseMidiNoteName(input.value);
    if (!selected || pitch === null) {
      debug('error', 'Hot key must be a note name from C-2 through G8, such as C3');
      return;
    }
    input.value = midiNoteName(pitch);
    send({
      type:'map_trigger',
      pitch,
      motifId:selected.id,
      action:document.getElementById('hotkey-action').value,
    });
  });
  document.getElementById('hotkey-input').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      document.getElementById('assign-hotkey-btn').click();
    }
  });

  for (const id of PROPERTY_INPUT_IDS) {
    const input = document.getElementById(id);
    input.addEventListener('input', () => store.setState({ formDirty:true }));
    input.addEventListener('change', pushProperties);
    if (input.tagName === 'TEXTAREA' || input.type === 'text') input.addEventListener('blur', pushProperties);
  }

  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-backdrop').addEventListener('click', (event) => { if (event.target === event.currentTarget) closeModal(); });
  document.getElementById('modal-confirm').addEventListener('click', () => {
    const modal = store.getState().modal;
    closeModal();
    if (modal?.onConfirm) modal.onConfirm();
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && store.getState().modal) closeModal(); });

  if (isMax) {
    if (typeof window.max.bindInlet !== 'function') {
      debug('error', 'Max jweb bridge is missing bindInlet');
    } else {
      window.max.bindInlet('receiveData', receiveData);
      debug('info', \`Bridge ready; waiting for library state (\${location.href})\`);
      window.max.outlet('library_ready');
      stateDeadline = setTimeout(() => {
        if (!store.getState().server) debug('error', 'No library state received within 2 seconds');
      }, 2000);
    }
  } else {
    receiveData(encodeURIComponent(JSON.stringify({
      query:'', libraryPath:'/Users/example/Motifs', libraryLoaded:true, libraryScanning:false, scanProgress:null,
      editing:{ active:false, dirty:false, created:false, sourceId:null, targetId:null },
      items:[
        { id:'chromatic-turn', name:'Chromatic Turn', showId:false },
        { id:'scale-turn', name:'Scale Turn', showId:false },
      ],
      selectedIndex:0,
      selected:{
        schemaVersion:1, id:'chromatic-turn', name:'Chromatic Turn', description:'Fixed-interval phrase that ignores the selected scale.',
        pitchMode:'chromatic', sourceMeter:{ numerator:4, denominator:4 }, length:3360, defaultGate:.82,
        velocityCurve:{ inputMin:null, inputMax:null, outputMin:null, outputMax:null, exponent:null },
        metadata:{ author:'', source:'', license:'', tags:['demo','chromatic'], suggestedModes:[], pickupTicks:null },
        stats:'7 notes \u2022 0.88 bars \u2022 4/4 source \u2022 chromatic', isBuiltin:true, isPersisted:false,
        notes:[
          { pitch:0, accidental:null, at:0, duration:480, gate:null, velocity:null, velocityOffset:null, velocityScale:null, legato:false, tie:false },
          { pitch:2, accidental:null, at:480, duration:480, gate:null, velocity:null, velocityOffset:null, velocityScale:null, legato:false, tie:false },
        ],
      },
    })));
  }
</script>
</body>
</html>
`.length) {
        throw new Error(`wrote a truncated page to ${absolutePath} (${byteLength} bytes)`);
      }
      emit("library-page", absolutePath);
    } catch (reason) {
      if (output?.isopen) output.close();
      emitError(`Library page preparation failed: ${reason instanceof Error ? reason.message : String(reason)}`);
    }
  }
  function web_debug(page, level, encodedMessage) {
    let message = String(encodedMessage);
    try {
      message = decodeURIComponent(message);
    } catch {
    }
    const line = `Motif jweb ${String(page)} [${String(level)}] ${message}
`;
    if (String(level).toLowerCase() === "error") {
      error(line);
    } else {
      post(line);
    }
  }
  function launchOffsetTicks() {
    if (!hostContext.isPlaying || launchQuantization === "immediate") return 0;
    const grid = quantizationTicks(launchQuantization, hostContext.timeSignature);
    return ticksUntilNextBoundary(Math.max(0, hostContext.currentSongTime * PPQ), grid);
  }
  function effectiveMotifLengthTicks(motif2) {
    if (meterMode === "preserve") return motif2.length;
    const targetBar = barLengthTicks(hostContext.timeSignature);
    const sourceBar = barLengthTicks(motif2.sourceMeter);
    return motif2.length * (targetBar / sourceBar);
  }
  function motifRepeatDelayMilliseconds(motif2) {
    return Math.max(
      MIN_REPEAT_DELAY_MS,
      ticksToMilliseconds(effectiveMotifLengthTicks(motif2), effectiveHost().tempo)
    );
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
  function motifIdForTrigger(triggerPitch) {
    const mapping = triggerMap.get(triggerPitch);
    return mapping?.action === "trigger" ? mapping.motifId : currentMotifId;
  }
  function triggerMotif(triggerPitch, triggerVelocity, channel, triggerOptions = {}) {
    const motifId = triggerOptions.motifId ?? motifIdForTrigger(triggerPitch);
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
      launchOffsetTicks: triggerOptions.launchOffsetTicks ?? launchOffsetTicks(),
      instanceId
    };
    if (pitchModeOverride !== void 0) options.pitchMode = pitchModeOverride;
    for (const event of compileMotif(selected, effectiveHost(), options)) {
      emitScheduledEvent(event.pitch, event.velocity, event.channel, event.offsetMs);
    }
    emitStatus("trigger", motifId, triggerPitch, instanceId);
    return instanceId;
  }
  function stopHeldRepeat(triggerPitch, emitFeedback = true) {
    const repeat = heldRepeats.get(triggerPitch);
    if (!repeat) return;
    repeat.task.cancel();
    repeat.task.freepeer();
    heldRepeats.delete(triggerPitch);
    sustainedRepeatReleases.delete(triggerPitch);
    if (emitFeedback) emitStatus("repeat-stopped", repeat.motifId, triggerPitch);
  }
  function stopAllHeldRepeats(emitFeedback = false) {
    for (const pitch of [...heldRepeats.keys()]) stopHeldRepeat(pitch, emitFeedback);
    sustainedRepeatReleases.clear();
  }
  function startHeldRepeat(triggerPitch, triggerVelocity, channel) {
    if (heldRepeats.has(triggerPitch)) return;
    const motifId = motifIdForTrigger(triggerPitch);
    const motif2 = resolveMotif(motifId);
    if (!motif2) {
      emitError(`Unknown motif: ${motifId}`);
      return;
    }
    const firstLaunchOffset = launchOffsetTicks();
    const instanceId = triggerMotif(triggerPitch, triggerVelocity, channel, {
      motifId: motif2.id,
      launchOffsetTicks: firstLaunchOffset
    });
    if (instanceId === void 0) return;
    let repeat;
    const task = new Task(() => {
      if (heldRepeats.get(triggerPitch) !== repeat) return;
      const repeatedMotif = resolveMotif(repeat.motifId);
      if (!repeatedMotif) {
        stopHeldRepeat(triggerPitch);
        return;
      }
      const repeatedInstance = triggerMotif(
        triggerPitch,
        repeat.velocity,
        repeat.channel,
        { motifId: repeat.motifId, launchOffsetTicks: 0 }
      );
      if (repeatedInstance === void 0 || heldRepeats.get(triggerPitch) !== repeat) return;
      repeat.task.schedule(motifRepeatDelayMilliseconds(repeatedMotif));
    });
    repeat = {
      motifId: motif2.id,
      velocity: triggerVelocity,
      channel,
      task
    };
    heldRepeats.set(triggerPitch, repeat);
    const firstDelay = ticksToMilliseconds(firstLaunchOffset, effectiveHost().tempo) + motifRepeatDelayMilliseconds(motif2);
    task.schedule(Math.max(MIN_REPEAT_DELAY_MS, firstDelay));
    emitStatus("repeat-started", motif2.id, triggerPitch);
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
    const mapping = triggerMap.get(pitch);
    const isTrigger = Boolean(mapping) || heldRepeats.has(pitch) || pitch >= triggerLow && pitch <= triggerHigh;
    if (shouldPassDry(isTrigger)) emitDirectNote(pitch, velocity, channel);
    if (!isTrigger) return;
    if (mapping?.action === "select") {
      if (velocity > 0) {
        select_browser(mapping.motifId);
        if (currentMotifId === mapping.motifId) {
          emitStatus("selected", mapping.motifId, pitch);
        }
      }
      return;
    }
    if (triggerMode === "hold-repeat" || heldRepeats.has(pitch)) {
      if (velocity > 0) {
        if (triggerMode === "hold-repeat") startHeldRepeat(pitch, velocity, channel);
      } else if (sustainDown) {
        sustainedRepeatReleases.add(pitch);
      } else {
        stopHeldRepeat(pitch);
      }
      return;
    }
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
      for (const pitch of [...sustainedRepeatReleases]) stopHeldRepeat(pitch);
      sustainedRepeatReleases.clear();
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
    emit("motif-selected", motifLabels().get(selected.id) ?? selected.name);
    emitSelectedMotifUi();
    emitStatus("Motif", selected.name);
  }
  function pitch_mode(mode) {
    if (mode === "motif") pitchModeOverride = void 0;
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
    const valid = ["one-shot", "hold", "hold-repeat", "toggle", "latch", "release-tail"];
    if (!valid.includes(mode)) {
      emitError(`Unknown trigger mode: ${mode}`);
      return;
    }
    const nextMode = mode;
    if (triggerMode === "hold-repeat" && nextMode !== "hold-repeat") stopAllHeldRepeats();
    triggerMode = nextMode;
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
  function triggerPitchValue(value) {
    if (typeof value === "string") {
      const named = parseMidiNoteName(value);
      if (named !== void 0) return named;
      const numeric = Number(value);
      return Number.isFinite(numeric) ? Math.round(clamp(numeric, 0, 127)) : void 0;
    }
    return Number.isFinite(value) ? Math.round(clamp(value, 0, 127)) : void 0;
  }
  function map_trigger(pitchValue, motifId, actionValue = "trigger") {
    const pitch = triggerPitchValue(pitchValue);
    if (pitch === void 0) {
      emitError(`Cannot map invalid MIDI note: ${String(pitchValue)}`);
      return;
    }
    const selected = resolveMotif(motifId);
    if (!selected) {
      emitError(`Cannot map ${pitch}: unknown motif ${motifId}`);
      return;
    }
    if (actionValue !== "trigger" && actionValue !== "select") {
      emitError(`Cannot map ${pitch}: unknown hot-key action ${actionValue}`);
      return;
    }
    const action = actionValue;
    stopHeldRepeat(pitch, false);
    triggerMap.set(pitch, { motifId: selected.id, action });
    emitLibraryState();
    emitStatus("mapped", pitch, selected.id, action);
  }
  function unmap_trigger(pitchValue) {
    const pitch = triggerPitchValue(pitchValue);
    if (pitch === void 0) {
      emitError(`Cannot unmap invalid MIDI note: ${String(pitchValue)}`);
      return;
    }
    stopHeldRepeat(pitch, false);
    triggerMap.delete(pitch);
    emitLibraryState();
    emitStatus("unmapped", pitch);
  }
  function clear_trigger_map() {
    for (const pitch of triggerMap.keys()) stopHeldRepeat(pitch, false);
    triggerMap.clear();
    emitLibraryState();
    emitStatus("map-cleared");
  }
  function pruneTriggerMap() {
    for (const [pitch, mapping] of triggerMap) {
      if (!store.has(mapping.motifId)) {
        stopHeldRepeat(pitch, false);
        triggerMap.delete(pitch);
      }
    }
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
  function loadUserMotifFile(fullPath, displayPath, scan) {
    scan.candidateOccupiedPaths.add(canonicalLibraryPath(fullPath));
    try {
      const result = validateMotif(readJsonFile(fullPath));
      if (!result.valid || !result.motif) {
        emitError(`${displayPath}: ${result.errors.join("; ")}`);
      } else if (scan.candidateStore.isBuiltin(result.motif.id)) {
        emitError(`${displayPath}: id \u201C${result.motif.id}\u201D conflicts with a built-in and was skipped`);
      } else if (scan.candidateFiles.has(result.motif.id)) {
        emitError(`${displayPath}: duplicate motif id \u201C${result.motif.id}\u201D was skipped`);
      } else {
        const errors = scan.candidateStore.add(result.motif);
        if (errors.length > 0) emitError(`${displayPath}: ${errors.join("; ")}`);
        else {
          scan.candidateFiles.set(result.motif.id, fullPath);
          scan.loadedMotifs += 1;
        }
      }
    } catch (reason) {
      emitError(`${displayPath}: ${reason instanceof Error ? reason.message : String(reason)}`);
    }
  }
  function cancelLibraryScan() {
    libraryScanGeneration += 1;
    if (libraryScanTask) {
      libraryScanTask.cancel();
      libraryScanTask.freepeer();
      libraryScanTask = void 0;
    }
    if (libraryScanState?.current) {
      libraryScanState.current.folder.close();
    }
    libraryScanState = void 0;
    libraryScanning = false;
  }
  function finishLibraryScan(scan) {
    if (scan.generation !== libraryScanGeneration || libraryScanState !== scan) return;
    store.resetToBuiltins();
    for (const motif2 of scan.candidateStore.list()) {
      if (!scan.candidateStore.isBuiltin(motif2.id)) store.add(motif2);
    }
    userLibraryFiles.clear();
    for (const [id, filename] of scan.candidateFiles) userLibraryFiles.set(id, filename);
    occupiedLibraryPaths.clear();
    for (const filename of scan.candidateOccupiedPaths) occupiedLibraryPaths.add(filename);
    libraryScanState = void 0;
    libraryScanning = false;
    userLibraryLoaded = true;
    if (libraryScanTask) {
      libraryScanTask.cancel();
      libraryScanTask.freepeer();
      libraryScanTask = void 0;
    }
    pruneTriggerMap();
    ensureCurrentMotifId();
    listMotifs();
    if (scan.completionStatus === "library") {
      emitStatus("library", userLibraryPath);
    } else {
      emitStatus("library-refreshed", store.list().length);
    }
  }
  function processLibraryScanBatch() {
    const scan = libraryScanState;
    if (!scan || scan.generation !== libraryScanGeneration) return;
    let operations = 0;
    while (operations < LIBRARY_SCAN_BATCH_SIZE) {
      if (!scan.current) {
        const next = scan.pending.shift();
        if (!next) {
          finishLibraryScan(scan);
          return;
        }
        const canonical = canonicalLibraryPath(next.pathname).replace(/\/+$/, "");
        if (scan.visited.has(canonical)) continue;
        scan.visited.add(canonical);
        const folder = new Folder(next.pathname);
        operations += 1;
        if (!folder.pathname) {
          folder.close();
          continue;
        }
        scan.current = { ...next, folder };
      }
      const active = scan.current;
      if (active.folder.end) {
        active.folder.close();
        scan.current = void 0;
        continue;
      }
      const filename = active.folder.filename;
      const filetype = active.folder.filetype;
      if (filename && filename !== "." && filename !== "..") {
        const fullPath = joinMaxPath(active.folder.pathname, filename);
        const displayPath = active.relativePath ? `${active.relativePath}/${filename}` : filename;
        if (filetype === "fold") {
          if (active.depth < MAX_LIBRARY_DEPTH) {
            scan.pending.push({
              pathname: fullPath,
              relativePath: displayPath,
              depth: active.depth + 1
            });
          } else {
            emitError(`${displayPath}: maximum library folder depth exceeded`);
          }
        } else if (filename.toLowerCase().endsWith(".json")) {
          loadUserMotifFile(fullPath, displayPath, scan);
        }
        scan.processedEntries += 1;
      }
      active.folder.next();
      operations += 1;
    }
    if (libraryScanTask && scan.generation === libraryScanGeneration) {
      libraryScanTask.schedule(0);
    }
  }
  function loadUserLibrary(completionStatus) {
    cancelLibraryScan();
    userLibraryLoaded = false;
    if (!userLibraryPath) return false;
    const root = new Folder(userLibraryPath);
    if (!root.pathname) {
      root.close();
      store.resetToBuiltins();
      userLibraryFiles.clear();
      occupiedLibraryPaths.clear();
      emitError(`Library folder not found: ${userLibraryPath}`);
      pruneTriggerMap();
      ensureCurrentMotifId();
      listMotifs();
      emitStatus("library-unavailable", userLibraryPath);
      return false;
    }
    libraryScanGeneration += 1;
    libraryScanning = true;
    libraryScanState = {
      generation: libraryScanGeneration,
      completionStatus,
      pending: [],
      current: { pathname: userLibraryPath, relativePath: "", depth: 0, folder: root },
      visited: /* @__PURE__ */ new Set([
        canonicalLibraryPath(userLibraryPath).replace(/\/+$/, "")
      ]),
      candidateStore: new MotifStore(),
      candidateFiles: /* @__PURE__ */ new Map(),
      candidateOccupiedPaths: /* @__PURE__ */ new Set(),
      processedEntries: 0,
      loadedMotifs: 0
    };
    emitLibraryState();
    emitStatus("library-scanning", userLibraryPath);
    libraryScanTask = new Task(processLibraryScanBatch);
    libraryScanTask.schedule(0);
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
    if (nextPath === userLibraryPath && (userLibraryLoaded || libraryScanning)) {
      emitLibraryState();
      return;
    }
    editor.abandon();
    userLibraryPath = nextPath;
    loadUserLibrary("library");
  }
  function refresh_library(discardChanges) {
    if (editor.isDirty() && !discardAllowed(discardChanges)) {
      emitError("Unsaved edits must be saved or discarded before refreshing");
      emitLibraryState();
      return;
    }
    editor.abandon();
    loadUserLibrary("library-refreshed");
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
  function filter_motifs(...queryParts) {
    const raw = flattenValues(queryParts).map(String).map((part) => part.trim()).filter(Boolean).join(" ").trim();
    browserQuery = raw;
    emitLibraryState();
    emitStatus("filter", browserQuery || "(all)");
  }
  function isLiveApiValid(api) {
    return api !== void 0 && api.id !== 0;
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
      const detail = new LiveAPI(void 0, "live_set view detail_clip");
      if (isLiveApiValid(detail) && isMidiClip(detail)) return detail;
    } catch {
    }
    try {
      const slot = new LiveAPI(void 0, "live_set view highlighted_clip_slot");
      if (!isLiveApiValid(slot) || !liveTruthy(slot.get("has_clip"))) return void 0;
      const clip = new LiveAPI(void 0, "live_set view highlighted_clip_slot clip");
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
  function readClipNotes(clip) {
    const payload = clip.call("get_notes_extended", 0, 128, 0, 4096);
    return parseClipNotesExtended(payload);
  }
  function import_clip(pitchModeValue = "chromatic") {
    if (libraryScanning) {
      emitError("Wait for the library scan to finish before importing a clip");
      emitLibraryState();
      return;
    }
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
      emitError("No clip selected - open a MIDI clip in Detail View, then Import Clip");
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
    if (absoluteNotes.length > MAX_MOTIF_NOTES) {
      emitLibraryAlert(
        "MIDI file is too long",
        `The selected MIDI clip contains ${absoluteNotes.length} notes. Motif can import up to ${MAX_MOTIF_NOTES} editable notes. Shorten the clip or split it into smaller phrases, then import it again.`
      );
      return;
    }
    const clipNameRaw = clip.getstring("name");
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
        currentMotifId = store.has(restoreId) ? restoreId : store.list()[0]?.id ?? DEFAULT_MOTIF_ID;
        listMotifs();
        emitError(errors.join("; "));
        return;
      }
      const edit = editor.begin(store, id, { dirty: true, created: true, sourceId: restoreId });
      if (!edit) {
        store.remove(id);
        currentMotifId = store.has(restoreId) ? restoreId : store.list()[0]?.id ?? DEFAULT_MOTIF_ID;
        emitError("Could not start editing the imported motif");
        listMotifs();
        return;
      }
      currentMotifId = id;
      listMotifs();
      emitStatus("imported-clip", id, absoluteNotes.length);
    } catch (reason) {
      store.remove(id);
      currentMotifId = store.has(restoreId) ? restoreId : store.list()[0]?.id ?? DEFAULT_MOTIF_ID;
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
    if (libraryScanning) {
      emitError("Wait for the library scan to finish before editing a motif");
      emitLibraryState();
      return;
    }
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
    listMotifs();
    emitStatus("editing", editable.id, editable.name);
  }
  function cancel_edit() {
    const restoredId = editor.cancel(store);
    if (!restoredId) {
      emitLibraryState();
      return;
    }
    currentMotifId = store.has(restoredId) ? restoredId : store.list()[0]?.id ?? DEFAULT_MOTIF_ID;
    pruneTriggerMap();
    listMotifs();
    emitStatus("editing-cancelled", currentMotifId);
  }
  function edit_motif(properties) {
    if (!applyMotifProperties(properties)) return;
    emitSelectedMotifUi();
    emitStatus("motif-edited", currentMotifId);
  }
  function select_browser(id, discardChanges) {
    const item = store.get(String(id));
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
    emit("motif-selected", motifLabels().get(selected.id) ?? selected.name);
    emitSelectedMotifUi();
    emitStatus("Motif", selected.name);
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
  function edit_note_at(rowIndexValue, fieldValue, valueValue) {
    updateNoteAt(Math.round(rowIndexValue), String(fieldValue), valueValue);
  }
  function add_note() {
    const editable = editableMotif();
    if (!editable) return;
    if (editable.notes.length >= MAX_MOTIF_NOTES) {
      emitError(`Maximum ${MAX_MOTIF_NOTES} notes per motif`);
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
          stringAtom(action["id"]),
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
        save_motif(action["properties"]);
        break;
      case "refresh_library":
        refresh_library(action["discardChanges"]);
        break;
      case "map_trigger":
        map_trigger(
          typeof action["pitch"] === "number" ? action["pitch"] : stringAtom(action["pitch"]),
          stringAtom(action["motifId"]),
          stringAtom(action["action"], "trigger")
        );
        break;
      case "unmap_trigger":
        unmap_trigger(
          typeof action["pitch"] === "number" ? action["pitch"] : stringAtom(action["pitch"])
        );
        break;
      case "clear_trigger_map":
        clear_trigger_map();
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
    stopAllHeldRepeats();
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
    library_prepare,
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
    select_browser,
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
