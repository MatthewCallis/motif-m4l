"use strict";
(() => {
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
  var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

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
  function resolvePitch(note2, motif2, host, options) {
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
    const launchOffsetTicks = Math.max(0, options.launchOffsetTicks ?? 0);
    const instanceId = options.instanceId ?? 0;
    const events = [];
    for (let index = 0; index < motif2.notes.length; index += 1) {
      const note2 = motif2.notes[index];
      if (!note2) {
        continue;
      }
      const next = motif2.notes[index + 1];
      const pitch = resolvePitch(note2, motif2, host, options);
      const velocity = resolveVelocity(note2, motif2, options.triggerVelocity);
      const noteOnTicks = launchOffsetTicks + Math.max(0, note2.at * timeScale);
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

  // src/core/runtime-scheduler.ts
  function noteKey(pitch, channel) {
    return `${channel}:${pitch}`;
  }
  function parseNoteKey(key) {
    const [channel = "1", pitch = "0"] = key.split(":");
    return { channel: Number(channel), pitch: Number(pitch) };
  }
  var _queue, _activeByInstance, _activeTotals, _unit, _lastNow, _RuntimeScheduler_instances, apply_fn, rebuild_fn;
  var RuntimeScheduler = class {
    constructor() {
      __privateAdd(this, _RuntimeScheduler_instances);
      __privateAdd(this, _queue, []);
      __privateAdd(this, _activeByInstance, /* @__PURE__ */ new Map());
      __privateAdd(this, _activeTotals, /* @__PURE__ */ new Map());
      __privateAdd(this, _unit);
      __privateAdd(this, _lastNow, 0);
    }
    get unit() {
      return __privateGet(this, _unit);
    }
    reset() {
      const releases = [...__privateGet(this, _activeTotals).entries()].filter(([, count]) => count > 0).map(([key]) => {
        const { pitch, channel } = parseNoteKey(key);
        return { pitch, velocity: 0, channel, delay: 0, unit: "ms", instanceId: -1 };
      });
      __privateSet(this, _queue, []);
      __privateGet(this, _activeByInstance).clear();
      __privateGet(this, _activeTotals).clear();
      __privateSet(this, _unit, void 0);
      __privateSet(this, _lastNow, 0);
      return releases;
    }
    advance(now, unit) {
      if (__privateGet(this, _unit) !== void 0 && __privateGet(this, _unit) !== unit) {
        this.reset();
        __privateSet(this, _unit, unit);
        __privateSet(this, _lastNow, now);
        return;
      }
      if (__privateGet(this, _unit) === unit && now + 1 < __privateGet(this, _lastNow)) {
        this.reset();
      }
      __privateSet(this, _unit, unit);
      __privateSet(this, _lastNow, now);
      const remaining = [];
      for (const event of __privateGet(this, _queue)) {
        if (event.due <= now + 0.5) {
          __privateMethod(this, _RuntimeScheduler_instances, apply_fn).call(this, event);
        } else {
          remaining.push(event);
        }
      }
      __privateSet(this, _queue, remaining);
    }
    add(events, now, unit) {
      this.advance(now, unit);
      for (const event of events) {
        const offset = unit === "ticks" ? event.offsetTicks : event.offsetMs;
        __privateGet(this, _queue).push({ ...event, due: now + offset, unit });
      }
      __privateGet(this, _queue).sort((left, right) => left.due - right.due || left.velocity - right.velocity);
      return __privateMethod(this, _RuntimeScheduler_instances, rebuild_fn).call(this, now, unit);
    }
    cancelInstance(instanceId, now, unit) {
      return this.cancelInstances([instanceId], now, unit);
    }
    cancelInstances(instanceIds, now, unit) {
      this.advance(now, unit);
      const ids = new Set(instanceIds);
      __privateSet(this, _queue, __privateGet(this, _queue).filter((event) => !ids.has(event.instanceId)));
      const releases = [];
      for (const instanceId of ids) {
        const instanceNotes = __privateGet(this, _activeByInstance).get(instanceId);
        if (!instanceNotes) {
          continue;
        }
        for (const [key, count] of instanceNotes.entries()) {
          if (count <= 0) {
            continue;
          }
          const total = Math.max(0, (__privateGet(this, _activeTotals).get(key) ?? 0) - count);
          __privateGet(this, _activeTotals).set(key, total);
          if (total === 0) {
            const { pitch, channel } = parseNoteKey(key);
            releases.push({ pitch, velocity: 0, channel, delay: 0, unit: "ms", instanceId });
          }
        }
        __privateGet(this, _activeByInstance).delete(instanceId);
      }
      return [...releases, ...__privateMethod(this, _RuntimeScheduler_instances, rebuild_fn).call(this, now, unit)];
    }
  };
  _queue = new WeakMap();
  _activeByInstance = new WeakMap();
  _activeTotals = new WeakMap();
  _unit = new WeakMap();
  _lastNow = new WeakMap();
  _RuntimeScheduler_instances = new WeakSet();
  apply_fn = function(event) {
    const key = noteKey(event.pitch, event.channel);
    const instance = __privateGet(this, _activeByInstance).get(event.instanceId) ?? /* @__PURE__ */ new Map();
    const delta = event.velocity > 0 ? 1 : -1;
    const instanceCount = Math.max(0, (instance.get(key) ?? 0) + delta);
    const totalCount = Math.max(0, (__privateGet(this, _activeTotals).get(key) ?? 0) + delta);
    instance.set(key, instanceCount);
    __privateGet(this, _activeByInstance).set(event.instanceId, instance);
    __privateGet(this, _activeTotals).set(key, totalCount);
  };
  rebuild_fn = function(now, unit) {
    const simulatedTotals = new Map(__privateGet(this, _activeTotals));
    const output = [];
    for (const event of __privateGet(this, _queue)) {
      const key = noteKey(event.pitch, event.channel);
      const before = simulatedTotals.get(key) ?? 0;
      const after = Math.max(0, before + (event.velocity > 0 ? 1 : -1));
      simulatedTotals.set(key, after);
      if (event.velocity > 0 && before === 0 || event.velocity === 0 && after === 0 && before > 0) {
        output.push({
          pitch: event.pitch,
          velocity: event.velocity,
          channel: event.channel,
          delay: Math.max(0, event.due - now),
          unit,
          instanceId: event.instanceId
        });
      }
    }
    return output;
  };

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
  inlets = 1;
  outlets = 2;
  var store = new MotifStore();
  var scheduler = new RuntimeScheduler();
  var triggerMap = /* @__PURE__ */ new Map();
  var activeInstances = /* @__PURE__ */ new Map();
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
  var songApi;
  var hostContext = {
    tempo: 120,
    rootNote: 0,
    scaleName: "Major",
    scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
    scaleMode: true,
    timeSignature: { numerator: 4, denominator: 4 },
    isPlaying: false
  };
  function emitStatus(...values) {
    outlet(1, "status", ...values);
  }
  function emitError(message) {
    outlet(1, "error", message);
    error(`Motif: ${message}
`);
  }
  function noteName(value) {
    return ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"][(Math.round(value) % 12 + 12) % 12] ?? "C";
  }
  function emitContext() {
    const key = `${noteName(hostContext.rootNote)} ${hostContext.scaleName}${hostContext.scaleMode ? "" : " \xB7 Scale Off"}`;
    const meter = `${hostContext.timeSignature.numerator}/${hostContext.timeSignature.denominator}`;
    const tempo = `${Math.round(hostContext.tempo * 10) / 10} BPM`;
    const transport = hostContext.isPlaying ? "Playing" : "Stopped";
    outlet(1, "host-key", key);
    outlet(1, "host-meter", meter);
    outlet(1, "host-tempo", tempo);
    outlet(1, "host-transport", transport);
    outlet(1, "context", key, meter, tempo, transport);
  }
  function flattenValues(values) {
    return values.flatMap((value) => Array.isArray(value) ? value : [value]);
  }
  function unwrapNumbers(value) {
    return flattenValues([value]).filter((item) => typeof item === "number");
  }
  function host_tempo(value) {
    if (Number.isFinite(value) && value > 0) {
      hostContext.tempo = value;
      emitContext();
    }
  }
  function host_root_note(value) {
    if (Number.isFinite(value)) {
      hostContext.rootNote = Math.round(value);
      emitContext();
    }
  }
  function host_scale_mode(value) {
    hostContext.scaleMode = value !== 0;
    emitContext();
  }
  function host_scale_intervals(...values) {
    const intervals = flattenValues(values).filter((value) => typeof value === "number");
    if (intervals.length > 0) {
      hostContext.scaleIntervals = intervals;
      emitContext();
    }
  }
  function host_scale_name(...values) {
    const name = flattenValues(values).map(String).join(" ").trim();
    if (name) {
      hostContext.scaleName = name;
      emitContext();
    }
  }
  function host_signature_numerator(value) {
    if (Number.isFinite(value) && value > 0) {
      hostContext.timeSignature.numerator = Math.round(value);
      emitContext();
    }
  }
  function host_signature_denominator(value) {
    if (Number.isFinite(value) && value > 0) {
      hostContext.timeSignature.denominator = Math.round(value);
      emitContext();
    }
  }
  function host_is_playing(value) {
    const wasPlaying = hostContext.isPlaying;
    hostContext.isPlaying = value !== 0;
    if (wasPlaying && !hostContext.isPlaying) {
      scheduler.reset();
      activeInstances.clear();
      sustainedReleases.clear();
      outlet(1, "panic");
    }
    emitContext();
  }
  function listMotifs() {
    outlet(1, "motifs-reset");
    for (const item of store.list()) {
      outlet(1, "motif-item", item.id);
    }
    outlet(1, "motif-selected", currentMotifId);
  }
  function initialize() {
    if (!initialized) {
      initialized = true;
      songApi = new LiveAPI(void 0, "live_set");
      emitStatus("ready", "v0.3.1");
      emitMidiPassState();
    }
    emitContext();
    listMotifs();
  }
  function safeSongNumber(property) {
    if (!songApi || songApi.valid !== 1) {
      return void 0;
    }
    try {
      return unwrapNumbers(songApi.get(property))[0];
    } catch {
      return void 0;
    }
  }
  function currentClock() {
    if (hostContext.isPlaying) {
      const songBeats = safeSongNumber("current_song_time");
      if (songBeats !== void 0) {
        const now = songBeats * PPQ;
        const grid = quantizationTicks(launchQuantization, hostContext.timeSignature);
        return {
          now,
          unit: "ticks",
          launchOffsetTicks: ticksUntilNextBoundary(now, grid)
        };
      }
    }
    return { now: Date.now(), unit: "ms", launchOffsetTicks: 0 };
  }
  function emitRuntimeEvent(event) {
    outlet(0, event.unit, event.pitch, event.velocity, event.channel, event.delay);
  }
  function emitRuntimeEvents(events) {
    for (const event of events) {
      emitRuntimeEvent(event);
    }
  }
  function emitDirectNote(pitch, velocity, channel) {
    outlet(0, "ms", pitch, velocity, channel, 0);
  }
  function emitMidiPassState() {
    outlet(1, "midi-pass", passThroughPolicy === "none" ? 0 : 1);
  }
  function shouldPassDry(isTrigger) {
    return passThroughPolicy === "all" || passThroughPolicy === "non-triggers" && !isTrigger;
  }
  function triggerMotif(triggerPitch, triggerVelocity, channel) {
    const mappedId = triggerMap.get(triggerPitch);
    const motifId = mappedId ?? currentMotifId;
    const selected = store.get(motifId);
    if (!selected) {
      emitError(`Unknown motif: ${motifId}`);
      return void 0;
    }
    const instanceId = instanceCounter++;
    const clock = currentClock();
    if (retriggerMode === "replace" || triggerMode === "latch") {
      scheduler.advance(clock.now, clock.unit);
      scheduler.reset();
      activeInstances.clear();
      outlet(1, "panic");
    } else {
      outlet(1, "clear");
    }
    const options = {
      channel: Math.round(clamp(channel, 1, 16)),
      meterMode,
      triggerPitch: Math.round(triggerPitch),
      triggerVelocity: Math.round(triggerVelocity),
      launchOffsetTicks: clock.launchOffsetTicks,
      instanceId
    };
    if (pitchModeOverride !== void 0) {
      options.pitchMode = pitchModeOverride;
    }
    const events = compileMotif(selected, hostContext, options);
    emitRuntimeEvents(scheduler.add(events, clock.now, clock.unit));
    emitStatus("trigger", motifId, triggerPitch, instanceId);
    return instanceId;
  }
  function rememberInstance(triggerPitch, instanceId) {
    const current = activeInstances.get(triggerPitch) ?? [];
    current.push(instanceId);
    activeInstances.set(triggerPitch, current);
  }
  function cancelTrigger(triggerPitch) {
    const instances = activeInstances.get(triggerPitch);
    if (!instances || instances.length === 0) {
      return;
    }
    const clock = currentClock();
    outlet(1, "clear");
    emitRuntimeEvents(scheduler.cancelInstances(instances, clock.now, clock.unit));
    activeInstances.delete(triggerPitch);
    emitStatus("release", triggerPitch);
  }
  function note(pitchValue, velocityValue, channelValue = 1) {
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
      if (triggerMode === "toggle" && activeInstances.has(pitch)) {
        cancelTrigger(pitch);
        return;
      }
      const instanceId = triggerMotif(pitch, velocity, channel);
      if (instanceId !== void 0 && triggerMode !== "one-shot") {
        rememberInstance(pitch, instanceId);
      }
      return;
    }
    if (triggerMode === "hold") {
      if (sustainDown) {
        sustainedReleases.add(pitch);
      } else {
        cancelTrigger(pitch);
      }
    } else if (triggerMode === "release-tail") {
      activeInstances.delete(pitch);
    }
  }
  function cc(controllerValue, valueValue) {
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
    emitStatus("sustain", sustainDown ? "on" : "off");
  }
  function motif(id) {
    if (!store.get(id)) {
      emitError(`Unknown motif: ${id}`);
      return;
    }
    currentMotifId = id;
    outlet(1, "motif-selected", id);
    emitStatus("motif", id);
  }
  function pitch_mode(mode) {
    if (mode === "auto") {
      pitchModeOverride = void 0;
    } else if (mode === "scale" || mode === "chromatic" || mode === "hybrid") {
      pitchModeOverride = mode;
    } else {
      emitError(`Unknown pitch mode: ${mode}`);
      return;
    }
    emitStatus("pitch-mode", mode);
  }
  function meter_mode(mode) {
    if (mode !== "preserve" && mode !== "fit-bar") {
      emitError(`Unknown meter mode: ${mode}`);
      return;
    }
    meterMode = mode;
    emitStatus("meter-mode", mode);
  }
  function retrigger(mode) {
    if (mode === 1 || mode === "replace") {
      retriggerMode = "replace";
    } else if (mode === 0 || mode === "overlap") {
      retriggerMode = "overlap";
    } else {
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
    if (!store.get(motifId)) {
      emitError(`Cannot map ${pitch}: unknown motif ${motifId}`);
      return;
    }
    triggerMap.set(pitch, motifId);
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
    if (!file.isopen) {
      throw new Error("could not open file");
    }
    try {
      return JSON.parse(file.readstring(file.eof));
    } finally {
      file.close();
    }
  }
  function loadUserLibrary() {
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
      if (filename.toLowerCase().endsWith(".json")) {
        const separator = folder.pathname.endsWith("/") || folder.pathname.endsWith(":") ? "" : "/";
        const fullPath = `${folder.pathname}${separator}${filename}`;
        try {
          const errors = store.add(readJsonFile(fullPath));
          if (errors.length > 0) {
            emitError(`${filename}: ${errors.join("; ")}`);
          }
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
    if (!store.get(currentMotifId)) {
      currentMotifId = store.list()[0]?.id ?? "mitsuda-lick";
    }
    listMotifs();
    emitStatus("library", userLibraryPath || "built-ins");
  }
  function refresh_library() {
    loadUserLibrary();
    listMotifs();
    emitStatus("library-refreshed", store.list().length);
  }
  function panic() {
    scheduler.reset();
    activeInstances.clear();
    sustainedReleases.clear();
    outlet(1, "panic");
    emitStatus("panic");
  }
  function dump_context() {
    emitContext();
  }
  var maxGlobal = globalThis;
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
})();
//# sourceMappingURL=motif-device.js.map
