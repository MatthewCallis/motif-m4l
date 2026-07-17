"use strict";
(() => {
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

  // src/core/types.ts
  var PPQ = 960;

  // src/core/timing.ts
  function barLengthTicks(signature) {
    return signature.numerator * PPQ * (4 / signature.denominator);
  }
  function ticksToMilliseconds(ticks, tempo) {
    const safeTempo = Number.isFinite(tempo) && tempo > 0 ? tempo : 120;
    return ticks / PPQ * (6e4 / safeTempo);
  }

  // src/core/compile-motif.ts
  function resolveVelocity(note2, triggerVelocity) {
    const base = note2.velocity ?? triggerVelocity;
    const scaled = base * (note2.velocityScale ?? 1);
    return Math.round(clamp(scaled + (note2.velocityOffset ?? 0), 1, 127));
  }
  function compileMotif(motif2, host, options) {
    const pitchMode = options.pitchMode ?? motif2.pitchMode;
    const targetBar = barLengthTicks(host.timeSignature);
    const sourceBar = barLengthTicks(motif2.sourceMeter);
    const timeScale = options.meterMode === "fit-bar" ? targetBar / sourceBar : 1;
    const channel = Math.round(clamp(options.channel, 1, 16));
    const events = [];
    for (const note2 of motif2.notes) {
      const pitch = pitchMode === "chromatic" ? transposeChromatically(options.triggerPitch, note2.pitch) : transposeByScaleDegree(
        options.triggerPitch,
        note2.pitch,
        host.rootNote,
        host.scaleIntervals
      );
      const velocity = resolveVelocity(note2, options.triggerVelocity);
      const noteOnTicks = Math.max(0, note2.at * timeScale);
      const noteOffTicks = Math.max(noteOnTicks, (note2.at + note2.duration) * timeScale);
      events.push({
        pitch,
        velocity,
        channel,
        offsetTicks: noteOnTicks,
        offsetMs: ticksToMilliseconds(noteOnTicks, host.tempo)
      });
      events.push({
        pitch,
        velocity: 0,
        channel,
        offsetTicks: noteOffTicks,
        offsetMs: ticksToMilliseconds(noteOffTicks, host.tempo)
      });
    }
    return events.sort((left, right) => {
      if (left.offsetTicks !== right.offsetTicks) {
        return left.offsetTicks - right.offsetTicks;
      }
      return left.velocity - right.velocity;
    });
  }

  // src/library/motifs.ts
  var EIGHTH = PPQ / 2;
  var SIXTEENTH = PPQ / 4;
  var MOTIFS = [
    {
      id: "scale-turn",
      name: "Scale Turn",
      description: "A compact scale-aware turn used to validate one-key phrase triggering.",
      pitchMode: "scale",
      sourceMeter: { numerator: 4, denominator: 4 },
      length: EIGHTH * 7,
      tags: ["demo", "scale", "turn"],
      notes: [
        { at: EIGHTH * 0, duration: EIGHTH * 0.82, pitch: 0, velocityOffset: 4 },
        { at: EIGHTH * 1, duration: EIGHTH * 0.82, pitch: 1 },
        { at: EIGHTH * 2, duration: EIGHTH * 0.82, pitch: 2, velocityOffset: 3 },
        { at: EIGHTH * 3, duration: EIGHTH * 0.82, pitch: 4, velocityOffset: 7 },
        { at: EIGHTH * 4, duration: EIGHTH * 0.82, pitch: 3 },
        { at: EIGHTH * 5, duration: EIGHTH * 0.82, pitch: 1, velocityOffset: -3 },
        { at: EIGHTH * 6, duration: EIGHTH * 0.95, pitch: 0, velocityOffset: 2 }
      ]
    },
    {
      id: "quick-answer",
      name: "Quick Answer",
      description: "A short sixteenth-note response with a wider final interval.",
      pitchMode: "scale",
      sourceMeter: { numerator: 4, denominator: 4 },
      length: SIXTEENTH * 8,
      tags: ["demo", "response"],
      notes: [
        { at: SIXTEENTH * 0, duration: SIXTEENTH * 0.72, pitch: 0 },
        { at: SIXTEENTH * 1, duration: SIXTEENTH * 0.72, pitch: 2 },
        { at: SIXTEENTH * 2, duration: SIXTEENTH * 0.72, pitch: 1 },
        { at: SIXTEENTH * 3, duration: SIXTEENTH * 0.72, pitch: 3 },
        { at: SIXTEENTH * 4, duration: SIXTEENTH * 0.72, pitch: 2 },
        { at: SIXTEENTH * 5, duration: SIXTEENTH * 0.72, pitch: 5, velocityOffset: 5 },
        { at: SIXTEENTH * 6, duration: SIXTEENTH * 1.8, pitch: 4 }
      ]
    },
    {
      id: "chromatic-turn",
      name: "Chromatic Turn",
      description: "A fixed-interval phrase that ignores the selected scale.",
      pitchMode: "chromatic",
      sourceMeter: { numerator: 4, denominator: 4 },
      length: EIGHTH * 7,
      tags: ["demo", "chromatic"],
      notes: [
        { at: EIGHTH * 0, duration: EIGHTH * 0.82, pitch: 0 },
        { at: EIGHTH * 1, duration: EIGHTH * 0.82, pitch: 2 },
        { at: EIGHTH * 2, duration: EIGHTH * 0.82, pitch: 3 },
        { at: EIGHTH * 3, duration: EIGHTH * 0.82, pitch: 7, velocityOffset: 6 },
        { at: EIGHTH * 4, duration: EIGHTH * 0.82, pitch: 5 },
        { at: EIGHTH * 5, duration: EIGHTH * 0.82, pitch: 2 },
        { at: EIGHTH * 6, duration: EIGHTH * 0.95, pitch: 0 }
      ]
    }
  ];
  function findMotif(id) {
    return MOTIFS.find((motif2) => motif2.id === id);
  }

  // src/max/device.ts
  inlets = 1;
  outlets = 2;
  var currentMotifId = MOTIFS[0]?.id ?? "scale-turn";
  var pitchModeOverride;
  var meterMode = "preserve";
  var retriggerMode = "replace";
  var initialized = false;
  var observers = [];
  var hostContext = {
    tempo: 120,
    rootNote: 0,
    scaleName: "Major",
    scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
    scaleMode: true,
    timeSignature: { numerator: 4, denominator: 4 }
  };
  function emitStatus(...values) {
    outlet(1, "status", ...values);
  }
  function emitContext() {
    outlet(
      1,
      "context",
      hostContext.tempo,
      hostContext.rootNote,
      hostContext.scaleName,
      hostContext.timeSignature.numerator,
      hostContext.timeSignature.denominator,
      ...hostContext.scaleIntervals
    );
  }
  function unwrapNumbers(value) {
    if (Array.isArray(value)) {
      return value.filter((item) => typeof item === "number");
    }
    return typeof value === "number" ? [value] : [];
  }
  function callbackValues(args) {
    return typeof args[0] === "string" ? args.slice(1) : args;
  }
  function observeNumber(property, apply) {
    const api = new LiveAPI((args) => {
      const value = unwrapNumbers(callbackValues(args))[0];
      if (value !== void 0) {
        apply(value);
        emitContext();
      }
    }, "live_set");
    if (!api.valid) {
      outlet(1, "error", `Unable to observe Live property: ${property}`);
      return;
    }
    const initial = unwrapNumbers(api.get(property))[0];
    if (initial !== void 0) {
      apply(initial);
    }
    api.property = property;
    observers.push(api);
  }
  function observeNumberList(property, apply) {
    const api = new LiveAPI((args) => {
      const values = unwrapNumbers(callbackValues(args));
      if (values.length > 0) {
        apply(values);
        emitContext();
      }
    }, "live_set");
    if (!api.valid) {
      outlet(1, "error", `Unable to observe Live property: ${property}`);
      return;
    }
    const initial = unwrapNumbers(api.get(property));
    if (initial.length > 0) {
      apply(initial);
    }
    api.property = property;
    observers.push(api);
  }
  function observeString(property, apply) {
    const api = new LiveAPI((args) => {
      const values = callbackValues(args);
      const value = values.map(String).join(" ");
      if (value) {
        apply(value);
        emitContext();
      }
    }, "live_set");
    if (!api.valid) {
      outlet(1, "error", `Unable to observe Live property: ${property}`);
      return;
    }
    const initial = api.getstring(property);
    const initialString = Array.isArray(initial) ? initial.join(" ") : initial;
    if (initialString) {
      apply(initialString);
    }
    api.property = property;
    observers.push(api);
  }
  function initialize() {
    if (initialized) {
      emitContext();
      return;
    }
    initialized = true;
    observeNumber("tempo", (value) => {
      hostContext.tempo = value;
    });
    observeNumber("root_note", (value) => {
      hostContext.rootNote = value;
    });
    observeNumber("scale_mode", (value) => {
      hostContext.scaleMode = value !== 0;
    });
    observeNumberList("scale_intervals", (value) => {
      hostContext.scaleIntervals = value;
    });
    observeString("scale_name", (value) => {
      hostContext.scaleName = value;
    });
    observeNumber("signature_numerator", (value) => {
      hostContext.timeSignature.numerator = value;
    });
    observeNumber("signature_denominator", (value) => {
      hostContext.timeSignature.denominator = value;
    });
    emitStatus("ready", currentMotifId);
    emitContext();
  }
  function note(pitch, velocity, channel = 1) {
    if (!Number.isFinite(pitch) || !Number.isFinite(velocity) || velocity <= 0) {
      return;
    }
    const selected = findMotif(currentMotifId);
    if (!selected) {
      outlet(1, "error", `Unknown motif: ${currentMotifId}`);
      return;
    }
    if (retriggerMode === "replace") {
      outlet(1, "panic");
    }
    const options = {
      channel,
      meterMode,
      triggerPitch: Math.round(pitch),
      triggerVelocity: Math.round(velocity)
    };
    if (pitchModeOverride !== void 0) {
      options.pitchMode = pitchModeOverride;
    }
    const events = compileMotif(selected, hostContext, options);
    for (const event of events) {
      outlet(0, event.pitch, event.velocity, event.channel, event.offsetMs);
    }
  }
  function motif(id) {
    if (!findMotif(id)) {
      outlet(1, "error", `Unknown motif: ${id}`);
      return;
    }
    currentMotifId = id;
    emitStatus("motif", id);
  }
  function pitch_mode(mode) {
    if (mode === "auto") {
      pitchModeOverride = void 0;
    } else if (mode === "scale" || mode === "chromatic") {
      pitchModeOverride = mode;
    } else {
      outlet(1, "error", `Unknown pitch mode: ${mode}`);
      return;
    }
    emitStatus("pitch-mode", mode);
  }
  function meter_mode(mode) {
    if (mode !== "preserve" && mode !== "fit-bar") {
      outlet(1, "error", `Unknown meter mode: ${mode}`);
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
      outlet(1, "error", `Unknown retrigger mode: ${String(mode)}`);
      return;
    }
    emitStatus("retrigger", retriggerMode);
  }
  function panic() {
    outlet(1, "panic");
  }
  function list_motifs() {
    for (const item of MOTIFS) {
      outlet(1, "status", "motif-item", item.id, item.name);
    }
  }
  function dump_context() {
    emitContext();
  }
  var maxGlobal = globalThis;
  maxGlobal.initialize = initialize;
  maxGlobal.note = note;
  maxGlobal.motif = motif;
  maxGlobal.pitch_mode = pitch_mode;
  maxGlobal.meter_mode = meter_mode;
  maxGlobal.retrigger = retrigger;
  maxGlobal.panic = panic;
  maxGlobal.list_motifs = list_motifs;
  maxGlobal.dump_context = dump_context;
})();
//# sourceMappingURL=motif-device.js.map
