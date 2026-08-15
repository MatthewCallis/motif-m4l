import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { HostContext, Motif } from "../../src/core/types.js";
import { MotifStore } from "../../src/library/store.js";
import { DeviceSettingsState } from "../../src/max/device-settings.js";
import { MotifHotkeyMap } from "../../src/max/hotkey-map.js";
import {
  launchOffsetTicksFor,
  motifRepeatDelayFor,
  PlaybackController,
  repeatTaskDelayFor,
  type PlaybackControllerCallbacks,
} from "../../src/max/playback-controller.js";

interface PlaybackHarness {
  playback: PlaybackController;
  store: MotifStore;
  hotkeys: MotifHotkeyMap;
  settings: DeviceSettingsState;
  events: number[][];
  statuses: unknown[][];
  errors: string[];
  previews: number[];
  selections: string[];
  clears: number;
  panics: number;
  scheduled: Array<{ delay: number; run: (lateness?: number) => void }>;
}

function createPlayback(eventDispatchMilliseconds = 0): PlaybackHarness {
  const scheduled: Array<{ delay: number; run: (lateness?: number) => void }> = [];
  let nowMilliseconds = 1_000_000;
  class MockTask {
    #cancelled = false;
    callback: (...args: unknown[]) => void;
    context?: object;
    args: unknown[];
    constructor(
      callback: (...args: unknown[]) => void,
      context: object = {},
      args: unknown[] = [],
    ) {
      this.callback = callback;
      this.context = context;
      this.args = args;
    }
    cancel(): void {
      this.#cancelled = true;
    }
    freepeer(): void {
      this.#cancelled = true;
    }
    schedule(delay = 0): void {
      scheduled.push({
        delay,
        run: (lateness = 0) => {
          nowMilliseconds += delay + lateness;
          if (!this.#cancelled) {
            this.callback.apply(this.context, this.args);
          }
        },
      });
    }
  }
  Object.assign(globalThis, { Task: MockTask });

  const store = new MotifStore("scale-turn");
  const hotkeys = new MotifHotkeyMap(store);
  const settings = new DeviceSettingsState();
  const events: number[][] = [];
  const statuses: unknown[][] = [];
  const errors: string[] = [];
  const previews: number[] = [];
  const selections: string[] = [];
  const state = { clears: 0, panics: 0 };
  const callbacks: PlaybackControllerCallbacks = {
    emitScheduledEvent: (pitch, velocity, channel, delay) => {
      events.push([pitch, velocity, channel, delay]);
      nowMilliseconds += eventDispatchMilliseconds;
    },
    emitClearScheduledNotes: () => {
      state.clears += 1;
    },
    emitPanic: () => {
      state.panics += 1;
    },
    emitError: (message) => errors.push(message),
    emitStatus: (...values) => statuses.push(values),
    onPreviewTrigger: (pitch) => previews.push(pitch),
    onSelectMotif: (id) => {
      selections.push(id);
      store.select(id);
    },
  };
  const host: HostContext = {
    tempo: 120,
    rootNote: 0,
    scaleName: "Major",
    scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
    scaleMode: true,
    timeSignature: { numerator: 4, denominator: 4 },
    isPlaying: false,
    currentSongTime: 0,
  };
  const playback = new PlaybackController(
    store,
    hotkeys,
    settings,
    host,
    callbacks,
    () => nowMilliseconds,
  );

  return {
    playback,
    store,
    hotkeys,
    settings,
    events,
    statuses,
    errors,
    previews,
    selections,
    get clears() {
      return state.clears;
    },
    get panics() {
      return state.panics;
    },
    scheduled,
  };
}

const launchHost: HostContext = {
  tempo: 120,
  rootNote: 0,
  scaleName: "Major",
  scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
  scaleMode: true,
  timeSignature: { numerator: 3, denominator: 4 },
  isPlaying: true,
  currentSongTime: 0.5,
};

const repeatMotif: Motif = {
  schemaVersion: 1,
  id: "playback-repeat",
  name: "Playback Repeat",
  description: "Repeat delay fixture.",
  pitchMode: "chromatic",
  sourcePitchContext: {
    anchorPitch: 60,
    scaleRootNote: 0,
    scaleName: "Major",
    scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
  },
  sourceMeter: { numerator: 4, denominator: 4 },
  length: 3840,
  notes: [
    { at: 0, duration: 480, pitch: -2 },
    { at: 960, duration: 480, pitch: 4 },
  ],
};

describe("launchOffsetTicksFor", () => {
  it("calculates launch offsets from song position and quantization", () => {
    assert.equal(launchOffsetTicksFor(launchHost, "1/4"), 480);
    assert.equal(launchOffsetTicksFor({ ...launchHost, isPlaying: false }, "1/4"), 0);
    assert.equal(launchOffsetTicksFor(launchHost, "immediate"), 0);
  });
});

describe("motifRepeatDelayFor", () => {
  it("calculates preserve/fit repeat delays", () => {
    assert.equal(motifRepeatDelayFor(repeatMotif, "preserve", launchHost, 1), 2000);
    assert.equal(motifRepeatDelayFor(repeatMotif, "fit-bar", launchHost, 1), 1500);
    assert.equal(motifRepeatDelayFor(repeatMotif, "fit-bar", launchHost, 2), 750);
    assert.equal(motifRepeatDelayFor({ ...repeatMotif, length: 0 }, "preserve", launchHost, 1), 1);
    assert.equal(
      motifRepeatDelayFor({ ...repeatMotif, length: 3360 }, "preserve", launchHost, 1, "1-bar"),
      2000,
    );
    assert.equal(
      motifRepeatDelayFor({ ...repeatMotif, length: 3360 }, "fit-bar", launchHost, 1, "1-bar"),
      1500,
    );
    assert.equal(
      motifRepeatDelayFor({ ...repeatMotif, length: 9480 }, "preserve", launchHost, 1, "1-bar"),
      6000,
    );
  });
});

describe("repeatTaskDelayFor", () => {
  it("wakes the low-priority Task before the intended repeat boundary", () => {
    assert.equal(repeatTaskDelayFor(2_000, 1_000), 875);
    assert.equal(repeatTaskDelayFor(1_000, 1_000), 1);
  });
});

describe("PlaybackController", () => {
  it("routes pass-through notes and select-mode hot keys", () => {
    const harness = createPlayback();
    harness.playback.note(20, 100, 1);
    assert.deepEqual(harness.events, [[20, 100, 1, 0]]);

    harness.events.length = 0;
    harness.hotkeys.assign(20, "chromatic-turn", "select");
    harness.playback.note(20, 100, 1);
    assert.deepEqual(harness.selections, ["chromatic-turn"]);
    assert.equal(harness.store.currentId, "chromatic-turn");
    assert.equal(harness.events.length, 0);
  });

  it("compiles triggers and owns hold/sustain cleanup state", () => {
    const harness = createPlayback();
    harness.settings.triggerMode = "hold";
    harness.playback.note(60, 100, 2);
    assert.ok(harness.events.some((event) => (event[1] ?? 0) > 0));
    assert.deepEqual(harness.previews, [60]);
    assert.equal(harness.playback.activeTriggers.has(60), true);

    harness.playback.sustain(127);
    harness.playback.note(60, 0, 2);
    assert.equal(harness.playback.sustainedReleases.has(60), true);
    harness.playback.sustain(0);
    assert.equal(harness.playback.sustainedReleases.size, 0);
    assert.ok(harness.clears > 0);
  });

  it("schedules one held repeat and cancels it on release and panic", () => {
    const harness = createPlayback();
    harness.settings.triggerMode = "hold-repeat";
    harness.settings.repeatRounding = "exact";
    harness.playback.note(60, 100, 1);
    harness.playback.note(60, 80, 1);
    assert.equal(harness.playback.heldRepeats.size, 1);
    assert.equal(harness.scheduled.length, 1);
    assert.equal(harness.scheduled[0]?.delay, 1625);

    harness.scheduled.shift()?.run();
    assert.ok(harness.statuses.filter(([selector]) => selector === "trigger").length >= 2);
    assert.deepEqual(harness.previews, [60]);
    assert.equal(harness.scheduled[0]?.delay, 1750);
    harness.playback.note(60, 0, 1);
    assert.equal(harness.playback.heldRepeats.size, 0);

    harness.playback.note(60, 100, 1);
    harness.playback.panic();
    assert.equal(harness.playback.heldRepeats.size, 0);
    assert.ok(harness.statuses.some(([selector]) => selector === "panic"));
    assert.deepEqual(harness.errors, []);
  });

  it("panic discards every retained trigger, repeat, and sustain state", () => {
    const harness = createPlayback();
    harness.settings.triggerMode = "hold-repeat";
    harness.playback.note(60, 100, 1);
    harness.playback.sustain(127);
    harness.playback.note(60, 0, 1);
    harness.playback.activeTriggers.add(61);
    harness.playback.activeTriggerModes.set(61, "hold");
    harness.playback.sustainedReleases.add(61);
    const clearsBeforePanic = harness.clears;

    harness.playback.panic();

    assert.equal(harness.playback.heldRepeats.size, 0);
    assert.equal(harness.playback.activeTriggers.size, 0);
    assert.equal(harness.playback.activeTriggerModes.size, 0);
    assert.equal(harness.playback.sustainedReleases.size, 0);
    assert.equal(harness.playback.sustainedRepeatReleases.size, 0);
    assert.equal(harness.playback.sustainDown, false);
    assert.equal(harness.clears, clearsBeforePanic);
    assert.equal(harness.panics, 1);

    harness.scheduled.shift()?.run();
    assert.equal(
      harness.statuses.filter(([selector]) => selector === "trigger").length,
      1,
      "a canceled repeat callback must not relaunch after panic",
    );
  });

  it("absorbs a late repeat Task inside the native scheduling lookahead", () => {
    const harness = createPlayback();
    harness.settings.triggerMode = "hold-repeat";
    harness.settings.repeatRounding = "exact";
    harness.playback.note(60, 100, 1);
    const initialEventCount = harness.events.length;
    const initialClearCount = harness.clears;

    harness.scheduled.shift()?.run(90);

    const repeatedEvents = harness.events.slice(initialEventCount);
    assert.equal(repeatedEvents[0]?.[3], 35);
    assert.equal(harness.clears, initialClearCount);
    assert.equal(harness.scheduled[0]?.delay, 1660);

    harness.playback.note(60, 0, 1);
    assert.equal(harness.clears, initialClearCount + 1);
  });

  it("anchors the first repeat to the first native event instead of the end of dispatch", () => {
    const harness = createPlayback(5);
    harness.settings.triggerMode = "hold-repeat";
    harness.settings.repeatRounding = "exact";
    harness.playback.note(60, 100, 1);
    const initialEventCount = harness.events.length;

    assert.ok(initialEventCount > 1);
    assert.equal(harness.scheduled[0]?.delay, 1625 - initialEventCount * 5);

    harness.scheduled.shift()?.run();
    assert.equal(harness.events[initialEventCount]?.[3], 125);
  });

  it("resolves motif-owned trigger mode and repeat rounding with device overrides", () => {
    const harness = createPlayback();
    const motif = harness.store.current;
    assert.ok(motif);
    assert.deepEqual(
      harness.store.add({
        ...motif,
        id: "motif-owned-repeat",
        name: "Motif-owned Repeat",
        triggerMode: "hold-repeat",
        repeatRounding: "1-bar",
      }),
      [],
    );
    assert.ok(harness.store.select("motif-owned-repeat"));

    harness.playback.note(60, 100, 1);
    assert.equal(harness.playback.heldRepeats.size, 1);
    assert.equal(harness.scheduled[0]?.delay, 1875);
    harness.playback.note(60, 0, 1);

    harness.settings.triggerMode = "one-shot";
    harness.playback.note(61, 100, 1);
    assert.equal(harness.playback.heldRepeats.size, 0);

    harness.settings.triggerMode = "hold-repeat";
    harness.settings.repeatRounding = "exact";
    harness.playback.note(62, 100, 1);
    assert.equal(harness.scheduled[harness.scheduled.length - 1]?.delay, 1625);
  });
});
