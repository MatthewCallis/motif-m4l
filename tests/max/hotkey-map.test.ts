import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MotifStore } from "../../src/library/store.js";
import { MotifHotkeyMap } from "../../src/max/hotkey-map.js";

describe("hotkey map", () => {
  it("validates, sorts, removes, clears, and prunes hotkeys", () => {
    const store = new MotifStore();
    const hotkeys = new MotifHotkeyMap(store);
    assert.equal(hotkeys.assign("invalid", "scale-turn").ok, false);
    assert.equal(hotkeys.assign(Number.NaN, "scale-turn").ok, false);
    assert.equal(hotkeys.assign(60, "missing").ok, false);
    assert.equal(hotkeys.assign(60, "scale-turn", "invalid").ok, false);
    assert.equal(hotkeys.assign("62", "scale-turn", "select").ok, true);
    assert.equal(hotkeys.assign(60, "scale-turn").ok, true);
    assert.equal(hotkeys.has(60), true);
    assert.deepEqual(
      hotkeys.forMotif("scale-turn").map(({ pitch }) => pitch),
      [60, 62],
    );
    assert.equal(hotkeys.remove("C3"), 60);
    assert.equal(hotkeys.remove("invalid"), undefined);

    const user = { ...store.get("chromatic-turn")!, id: "temporary" };
    assert.deepEqual(store.add(user), []);
    assert.equal(hotkeys.assign(64, "temporary").ok, true);
    store.remove("temporary");
    assert.deepEqual(hotkeys.prune(), [64]);
    assert.deepEqual(hotkeys.clear(), [62]);
  });
});
