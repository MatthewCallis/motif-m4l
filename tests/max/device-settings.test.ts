import { describe, it, expect } from "vitest";
import { MotifStore } from "../../src/library/store.js";
import { DeviceSettingsState } from "../../src/max/device-settings.js";

describe("DeviceSettingsState", () => {
  it("owns Live-restored performance defaults and trigger-zone invariants", () => {
    const settings = new DeviceSettingsState();

    expect(settings.pitchModeOverride).toBe(undefined);
    expect(settings.meterMode).toBe("preserve");
    expect(settings.retriggerMode).toBe("replace");
    expect(settings.triggerMode).toBe("motif");
    expect(settings.repeatRounding).toBe("motif");
    expect(settings.launchQuantization).toBe("immediate");
    expect(settings.passThroughPolicy).toBe("non-triggers");
    expect(settings.tempoMultiplier).toBe(1);
    expect(settings.triggerZone).toEqual({ low: 36, high: 84 });

    const motif = new MotifStore("scale-turn").current;
    expect(motif).toBeTruthy();
    const { repeatRounding: _repeatRounding, ...legacyMotif } = motif!;
    expect(settings.triggerModeFor(motif!)).toBe("one-shot");
    expect(settings.repeatRoundingFor(legacyMotif)).toBe("exact");
    settings.triggerMode = "hold";
    settings.repeatRounding = "1/2-bar";
    expect(settings.triggerModeFor({ ...motif!, triggerMode: "toggle" })).toBe("hold");
    expect(settings.repeatRoundingFor({ ...motif!, repeatRounding: "1-bar" })).toBe("1/2-bar");

    expect(settings.setTriggerLow(100)).toEqual({ low: 84, high: 84 });
    expect(settings.setTriggerHigh(-20)).toEqual({ low: 84, high: 84 });
    expect(settings.setTriggerLow(-20)).toEqual({ low: 0, high: 84 });
    expect(settings.setTriggerHigh(200)).toEqual({ low: 0, high: 127 });
  });

  it("applies transforms without mutating catalog motifs", () => {
    const store = new MotifStore("chromatic-turn");
    const source = store.current;
    expect(source).toBeTruthy();
    const settings = new DeviceSettingsState();

    expect(settings.transform(source!)).toBe(source);

    settings.invert = true;
    const inverted = settings.transform(source!);
    expect(inverted).not.toBe(source);
    expect(inverted.notes.map(({ pitch }) => pitch)).toEqual(
      source!.notes.map(({ pitch }) => (pitch === 0 ? 0 : -pitch)),
    );

    settings.reverse = true;
    const transformed = settings.transform(source!);
    expect(transformed.notes.map(({ at, pitch }) => [at, pitch])).not.toEqual(
      inverted.notes.map(({ at, pitch }) => [at, pitch]),
    );
    expect(source!.notes.map(({ pitch }) => pitch)).toEqual(
      store.get("chromatic-turn")?.notes.map(({ pitch }) => pitch),
    );
  });
});
