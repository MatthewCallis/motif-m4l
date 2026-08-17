import { describe, it, expect } from "vitest";
import { MotifStore } from "../../src/library/store.js";
import { MotifHotkeyMap } from "../../src/max/hotkey-map.js";

describe("hotkey map", () => {
  it("validates, sorts, removes, clears, and prunes hotkeys", () => {
    const store = new MotifStore();
    const hotkeys = new MotifHotkeyMap(store);
    expect(hotkeys.assign("invalid", "scale-turn").ok).toBe(false);
    expect(hotkeys.assign(Number.NaN, "scale-turn").ok).toBe(false);
    expect(hotkeys.assign(60, "missing").ok).toBe(false);
    expect(hotkeys.assign(60, "scale-turn", "invalid").ok).toBe(false);
    expect(hotkeys.assign("62", "scale-turn", "select").ok).toBe(true);
    expect(hotkeys.assign(60, "scale-turn").ok).toBe(true);
    expect(hotkeys.has(60)).toBe(true);
    expect(hotkeys.list()).toEqual([
      { pitch: 60, motifId: "scale-turn", action: "trigger" },
      { pitch: 62, motifId: "scale-turn", action: "select" },
    ]);
    expect(hotkeys.forMotif("scale-turn").map(({ pitch }) => pitch)).toEqual([60, 62]);
    expect(hotkeys.remove("C3")).toBe(60);
    expect(hotkeys.remove("invalid")).toBe(undefined);

    const user = { ...store.get("chromatic-turn")!, id: "temporary" };
    expect(store.add(user)).toEqual([]);
    expect(hotkeys.assign(64, "temporary").ok).toBe(true);
    store.remove("temporary");
    expect(hotkeys.prune()).toEqual([64]);
    expect(hotkeys.clear()).toEqual([62]);
  });
});
