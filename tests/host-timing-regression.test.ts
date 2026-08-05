import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { compileMotif } from "../src/core/compile-motif.js";
import type { HostContext } from "../src/core/types.js";
import { BUILTIN_MOTIFS } from "../src/generated/builtins.js";

function host(tempo: number): HostContext {
  return {
    tempo,
    rootNote: 0,
    scaleName: "Major",
    scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
    scaleMode: true,
    timeSignature: { numerator: 4, denominator: 4 },
    isPlaying: true,
    currentSongTime: 0,
  };
}

describe("host timing regressions", () => {
  it("Chromatic Turn note-on delays remain sequential instead of collapsing", () => {
    const motif = BUILTIN_MOTIFS.find(({ id }) => id === "chromatic-turn");
    assert.ok(motif);
    const compiled = compileMotif(motif, host(120), {
      channel: 1,
      meterMode: "preserve",
      triggerPitch: 60,
      triggerVelocity: 100,
      instanceId: 1,
    });
    const noteOns = compiled.filter(({ velocity }) => velocity > 0);
    assert.deepEqual(
      noteOns.map(({ offsetMs }) => offsetMs),
      [0, 250, 500, 750, 1000, 1250, 1500],
    );
  });

  it("new triggers use the latest observed Song tempo", () => {
    const motif = BUILTIN_MOTIFS.find(({ id }) => id === "chromatic-turn");
    assert.ok(motif);
    const at120 = compileMotif(motif, host(120), {
      channel: 1,
      meterMode: "preserve",
      triggerPitch: 60,
      triggerVelocity: 100,
    });
    const at60 = compileMotif(motif, host(60), {
      channel: 1,
      meterMode: "preserve",
      triggerPitch: 60,
      triggerVelocity: 100,
    });
    const firstLateAt120 = at120.find(({ velocity, offsetMs }) => velocity > 0 && offsetMs > 0);
    const firstLateAt60 = at60.find(({ velocity, offsetMs }) => velocity > 0 && offsetMs > 0);
    assert.ok(firstLateAt120 && firstLateAt60);
    assert.equal(firstLateAt60.offsetMs, firstLateAt120.offsetMs * 2);
  });

  it("BPM multiplier scales motif timing like a faster or slower Song tempo", () => {
    const motif = BUILTIN_MOTIFS.find(({ id }) => id === "chromatic-turn");
    assert.ok(motif);
    const base = compileMotif(motif, host(120), {
      channel: 1,
      meterMode: "preserve",
      triggerPitch: 60,
      triggerVelocity: 100,
    });
    const half = compileMotif(motif, host(120 * 0.5), {
      channel: 1,
      meterMode: "preserve",
      triggerPitch: 60,
      triggerVelocity: 100,
    });
    const double = compileMotif(motif, host(120 * 2), {
      channel: 1,
      meterMode: "preserve",
      triggerPitch: 60,
      triggerVelocity: 100,
    });
    const firstBase = base.find(({ velocity, offsetMs }) => velocity > 0 && offsetMs > 0);
    const firstHalf = half.find(({ velocity, offsetMs }) => velocity > 0 && offsetMs > 0);
    const firstDouble = double.find(({ velocity, offsetMs }) => velocity > 0 && offsetMs > 0);
    assert.ok(firstBase && firstHalf && firstDouble);
    assert.equal(firstHalf.offsetMs, firstBase.offsetMs * 2);
    assert.equal(firstDouble.offsetMs, firstBase.offsetMs / 2);
  });
});
