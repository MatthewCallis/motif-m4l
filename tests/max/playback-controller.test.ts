import { afterEach, describe, expect, it, vi } from "vitest";
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
  vi.stubGlobal("Task", MockTask);

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
    expect(launchOffsetTicksFor(launchHost, "1/4")).toBe(480);
    expect(launchOffsetTicksFor({ ...launchHost, isPlaying: false }, "1/4")).toBe(0);
    expect(launchOffsetTicksFor(launchHost, "immediate")).toBe(0);
  });
});

describe("motifRepeatDelayFor", () => {
  it("calculates preserve/fit repeat delays", () => {
    expect(motifRepeatDelayFor(repeatMotif, "preserve", launchHost, 1)).toBe(2000);
    expect(motifRepeatDelayFor(repeatMotif, "fit-bar", launchHost, 1)).toBe(1500);
    expect(motifRepeatDelayFor(repeatMotif, "fit-bar", launchHost, 2)).toBe(750);
    expect(motifRepeatDelayFor({ ...repeatMotif, length: 0 }, "preserve", launchHost, 1)).toBe(1);
    expect(
      motifRepeatDelayFor({ ...repeatMotif, length: 3360 }, "preserve", launchHost, 1, "1-bar"),
    ).toBe(2000);
    expect(
      motifRepeatDelayFor({ ...repeatMotif, length: 3360 }, "fit-bar", launchHost, 1, "1-bar"),
    ).toBe(1500);
    expect(
      motifRepeatDelayFor({ ...repeatMotif, length: 9480 }, "preserve", launchHost, 1, "1-bar"),
    ).toBe(6000);
  });
});

describe("repeatTaskDelayFor", () => {
  it("wakes the low-priority Task before the intended repeat boundary", () => {
    expect(repeatTaskDelayFor(2_000, 1_000)).toBe(875);
    expect(repeatTaskDelayFor(1_000, 1_000)).toBe(1);
  });
});

describe("PlaybackController", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("routes pass-through notes and select-mode hot keys", () => {
    const harness = createPlayback();
    harness.playback.note(20, 100, 1);
    expect(harness.events).toEqual([[20, 100, 1, 0]]);

    harness.events.length = 0;
    harness.hotkeys.assign(20, "chromatic-turn", "select");
    harness.playback.note(20, 100, 1);
    expect(harness.selections).toEqual(["chromatic-turn"]);
    expect(harness.store.currentId).toBe("chromatic-turn");
    expect(harness.events.length).toBe(0);
  });

  it("compiles triggers and owns hold/sustain cleanup state", () => {
    const harness = createPlayback();
    harness.settings.triggerMode = "hold";
    harness.playback.note(60, 100, 2);
    expect(harness.events.some((event) => (event[1] ?? 0) > 0)).toBeTruthy();
    expect(harness.previews).toEqual([60]);
    expect(harness.playback.activeTriggers.has(60)).toBe(true);

    harness.playback.sustain(127);
    harness.playback.note(60, 0, 2);
    expect(harness.playback.sustainedReleases.has(60)).toBe(true);
    harness.playback.sustain(0);
    expect(harness.playback.sustainedReleases.size).toBe(0);
    expect(harness.clears > 0).toBeTruthy();
  });

  it("schedules one held repeat and cancels it on release and panic", () => {
    const harness = createPlayback();
    harness.settings.triggerMode = "hold-repeat";
    harness.settings.repeatRounding = "exact";
    harness.playback.note(60, 100, 1);
    harness.playback.note(60, 80, 1);
    expect(harness.playback.heldRepeats.size).toBe(1);
    expect(harness.scheduled.length).toBe(1);
    expect(harness.scheduled[0]?.delay).toBe(1625);

    harness.scheduled.shift()?.run();
    expect(
      harness.statuses.filter(([selector]) => selector === "trigger").length >= 2,
    ).toBeTruthy();
    expect(harness.previews).toEqual([60]);
    expect(harness.scheduled[0]?.delay).toBe(1750);
    harness.playback.note(60, 0, 1);
    expect(harness.playback.heldRepeats.size).toBe(0);

    harness.playback.note(60, 100, 1);
    harness.playback.panic();
    expect(harness.playback.heldRepeats.size).toBe(0);
    expect(harness.statuses.some(([selector]) => selector === "panic")).toBeTruthy();
    expect(harness.errors).toEqual([]);
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

    expect(harness.playback.heldRepeats.size).toBe(0);
    expect(harness.playback.activeTriggers.size).toBe(0);
    expect(harness.playback.activeTriggerModes.size).toBe(0);
    expect(harness.playback.sustainedReleases.size).toBe(0);
    expect(harness.playback.sustainedRepeatReleases.size).toBe(0);
    expect(harness.playback.sustainDown).toBe(false);
    expect(harness.clears).toBe(clearsBeforePanic);
    expect(harness.panics).toBe(1);

    harness.scheduled.shift()?.run();
    expect(harness.statuses.filter(([selector]) => selector === "trigger").length).toBe(1);
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
    expect(repeatedEvents[0]?.[3]).toBe(35);
    expect(harness.clears).toBe(initialClearCount);
    expect(harness.scheduled[0]?.delay).toBe(1660);

    harness.playback.note(60, 0, 1);
    expect(harness.clears).toBe(initialClearCount + 1);
  });

  it("anchors the first repeat to the first native event instead of the end of dispatch", () => {
    const harness = createPlayback(5);
    harness.settings.triggerMode = "hold-repeat";
    harness.settings.repeatRounding = "exact";
    harness.playback.note(60, 100, 1);
    const initialEventCount = harness.events.length;

    expect(initialEventCount > 1).toBeTruthy();
    expect(harness.scheduled[0]?.delay).toBe(1625 - initialEventCount * 5);

    harness.scheduled.shift()?.run();
    expect(harness.events[initialEventCount]?.[3]).toBe(125);
  });

  it("resolves motif-owned trigger mode and repeat rounding with device overrides", () => {
    const harness = createPlayback();
    const motif = harness.store.current;
    expect(motif).toBeTruthy();
    expect(
      harness.store.add({
        ...motif,
        id: "motif-owned-repeat",
        name: "Motif-owned Repeat",
        triggerMode: "hold-repeat",
        repeatRounding: "1-bar",
      }),
    ).toEqual([]);
    expect(harness.store.select("motif-owned-repeat")).toBeTruthy();

    harness.playback.note(60, 100, 1);
    expect(harness.playback.heldRepeats.size).toBe(1);
    expect(harness.scheduled[0]?.delay).toBe(1875);
    harness.playback.note(60, 0, 1);

    harness.settings.triggerMode = "one-shot";
    harness.playback.note(61, 100, 1);
    expect(harness.playback.heldRepeats.size).toBe(0);

    harness.settings.triggerMode = "hold-repeat";
    harness.settings.repeatRounding = "exact";
    harness.playback.note(62, 100, 1);
    expect(harness.scheduled[harness.scheduled.length - 1]?.delay).toBe(1625);
  });

  it("reports unknown motifs and compilation failures without scheduling", () => {
    const harness = createPlayback();
    harness.store.currentId = "missing";
    expect(harness.playback.triggerMotif(60, 100, 1)).toBe(undefined);
    harness.playback.note(60, 100, 1);
    expect(
      harness.errors.filter((message) => message.includes("Unknown motif: missing")).length,
    ).toBe(2);

    harness.store.select("chromatic-turn");
    const chromatic = harness.store.current!;
    harness.settings.pitchModeOverride = "hybrid";
    harness.settings.transform = () => ({
      ...chromatic,
      sourcePitchContext: {
        ...chromatic.sourcePitchContext,
        scaleName: "Unresolved Custom Scale",
        scaleIntervals: null,
      },
    });
    expect(harness.playback.triggerMotif(60, 100, 1, { motifId: "chromatic-turn" })).toBe(
      undefined,
    );
    expect(harness.errors.some((message) => message.includes("source scale intervals"))).toBe(true);

    const clears = harness.clears;
    harness.playback.cancelTrigger(99);
    harness.playback.cc(1, 127);
    expect(harness.clears).toBe(clears);
  });

  it("releases toggle, hold, release-tail, and sustained repeat triggers", () => {
    const toggle = createPlayback();
    toggle.settings.triggerMode = "toggle";
    toggle.playback.note(60, 100, 1);
    expect(toggle.playback.activeTriggers.has(60)).toBe(true);
    toggle.playback.note(60, 100, 1);
    expect(toggle.playback.activeTriggers.has(60)).toBe(false);

    const hold = createPlayback();
    hold.settings.triggerMode = "hold";
    hold.playback.note(60, 100, 1);
    hold.playback.note(60, 0, 1);
    expect(hold.playback.activeTriggers.has(60)).toBe(false);

    const releaseTail = createPlayback();
    releaseTail.settings.triggerMode = "release-tail";
    releaseTail.playback.note(60, 100, 1);
    releaseTail.playback.note(60, 0, 1);
    expect(releaseTail.playback.activeTriggers.has(60)).toBe(false);
    expect(releaseTail.playback.activeTriggerModes.has(60)).toBe(false);

    const repeat = createPlayback();
    repeat.settings.triggerMode = "hold-repeat";
    repeat.playback.note(60, 100, 1);
    repeat.playback.sustain(127);
    repeat.playback.note(60, 0, 1);
    expect(repeat.playback.sustainedRepeatReleases.has(60)).toBe(true);
    repeat.playback.sustain(0);
    expect(repeat.playback.heldRepeats.has(60)).toBe(false);

    repeat.playback.note(61, 100, 1);
    expect(repeat.playback.heldRepeats.has(61)).toBe(true);
    repeat.playback.stopAllHeldRepeats(true);
    expect(repeat.playback.heldRepeats.size).toBe(0);
    expect(repeat.statuses.some(([selector]) => selector === "repeat-stopped")).toBe(true);
  });

  it("guards held-repeat tasks when their captured state becomes stale", () => {
    const stale = createPlayback();
    stale.settings.triggerMode = "hold-repeat";
    stale.playback.note(60, 100, 1);
    const captured = stale.playback.heldRepeats.get(60)!;
    stale.playback.heldRepeats.set(60, { ...captured });
    const triggersBefore = stale.statuses.filter(([selector]) => selector === "trigger").length;
    stale.scheduled.shift()?.run();
    expect(stale.statuses.filter(([selector]) => selector === "trigger")).toHaveLength(
      triggersBefore,
    );

    const vanished = createPlayback();
    const user = { ...vanished.store.current!, id: "temporary-repeat", name: "Temporary Repeat" };
    expect(vanished.store.add(user)).toEqual([]);
    vanished.store.select(user.id);
    vanished.settings.triggerMode = "hold-repeat";
    vanished.playback.note(60, 100, 1);
    vanished.store.remove(user.id);
    vanished.scheduled.shift()?.run();
    expect(vanished.playback.heldRepeats.has(60)).toBe(false);

    const failedCycle = createPlayback();
    failedCycle.settings.triggerMode = "hold-repeat";
    failedCycle.playback.note(60, 100, 1);
    failedCycle.playback.triggerMotif = () => undefined;
    failedCycle.scheduled.shift()?.run();
    expect(failedCycle.scheduled).toHaveLength(0);

    const failedStart = createPlayback();
    failedStart.settings.triggerMode = "hold-repeat";
    failedStart.playback.triggerMotif = () => undefined;
    failedStart.playback.startHeldRepeat(60, 100, 1);
    expect(failedStart.playback.heldRepeats.size).toBe(0);

    const unknownStart = createPlayback();
    unknownStart.store.currentId = "missing-repeat";
    unknownStart.playback.startHeldRepeat(60, 100, 1);
    expect(unknownStart.errors).toContain("Unknown motif: missing-repeat");
  });
});
