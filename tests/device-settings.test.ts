import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MotifStore } from "../src/library/store.js";
import { DeviceSettingsState } from "../src/max/device-settings.js";

describe("DeviceSettingsState", () => {
  it("owns Live-restored performance defaults and trigger-zone invariants", () => {
    const settings = new DeviceSettingsState();

    assert.equal(settings.pitchModeOverride, undefined);
    assert.equal(settings.meterMode, "preserve");
    assert.equal(settings.retriggerMode, "replace");
    assert.equal(settings.triggerMode, "one-shot");
    assert.equal(settings.launchQuantization, "immediate");
    assert.equal(settings.passThroughPolicy, "non-triggers");
    assert.equal(settings.tempoMultiplier, 1);
    assert.deepEqual(settings.triggerZone, { low: 36, high: 84 });

    assert.deepEqual(settings.setTriggerLow(100), { low: 84, high: 84 });
    assert.deepEqual(settings.setTriggerHigh(-20), { low: 84, high: 84 });
    assert.deepEqual(settings.setTriggerLow(-20), { low: 0, high: 84 });
    assert.deepEqual(settings.setTriggerHigh(200), { low: 0, high: 127 });
  });

  it("applies transforms without mutating catalog motifs", () => {
    const store = new MotifStore("chromatic-turn");
    const source = store.current;
    assert.ok(source);
    const settings = new DeviceSettingsState();

    assert.equal(settings.transform(source), source);

    settings.invert = true;
    const inverted = settings.transform(source);
    assert.notEqual(inverted, source);
    assert.deepEqual(
      inverted.notes.map(({ pitch }) => pitch),
      source.notes.map(({ pitch }) => (pitch === 0 ? 0 : -pitch)),
    );

    settings.reverse = true;
    const transformed = settings.transform(source);
    assert.notDeepEqual(
      transformed.notes.map(({ at, pitch }) => [at, pitch]),
      inverted.notes.map(({ at, pitch }) => [at, pitch]),
    );
    assert.deepEqual(
      source.notes.map(({ pitch }) => pitch),
      store.get("chromatic-turn")?.notes.map(({ pitch }) => pitch),
    );
  });
});
