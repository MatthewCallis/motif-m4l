import { describe, it, expect } from "vitest";
import { createEngine, lastLibState, lastPersistedState } from "../helpers/max-engine.js";

describe("Device controller integration", () => {
  it("connects guarded selection, hot keys, projection, and persistence", async () => {
    const engine = await createEngine();
    engine.dispatch("initialize");
    engine.dispatch("motif", "Chromatic Turn");
    engine.dispatch("map_trigger", 20, "scale-turn", "select");

    const state = lastLibState(engine.outlets);
    expect((state?.["selected"] as Record<string, unknown>)?.["id"]).toBe("chromatic-turn");
    expect(lastPersistedState(engine.outlets)).toBeTruthy();

    engine.outlets.length = 0;
    engine.dispatch("note", 20, 100, 1);
    expect((lastLibState(engine.outlets)?.["selected"] as Record<string, unknown>)?.["id"]).toBe(
      "scale-turn",
    );
    expect(
      engine.outlets.some((message) => message[0] === "status" && message[1] === "selected"),
    ).toBeTruthy();
  });

  it("connects trigger-mode changes to held-repeat task cleanup", async () => {
    const engine = await createEngine({ deferTasks: true });
    engine.dispatch("trigger_mode", "hold-repeat");
    engine.dispatch("note", 60, 100, 1);
    expect(engine.scheduledTaskDelays.length).toBe(1);

    engine.dispatch("trigger_mode", "one-shot");
    engine.outlets.length = 0;
    engine.runScheduledTasks();
    expect(
      !engine.outlets.some((message) => message[0] === "status" && message[1] === "trigger"),
    ).toBeTruthy();
  });
});
