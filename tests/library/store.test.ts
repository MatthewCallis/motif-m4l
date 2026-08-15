import { describe, it, expect } from "vitest";
import { MotifStore, uniqueMotifId } from "../../src/library/store.js";
import { addUserCopy } from "../helpers/motif-store.js";

describe("MotifStore", () => {
  it("filter matches name, id, description, and tags", () => {
    const store = new MotifStore("scale-turn");
    expect(store.current?.id).toBe("scale-turn");
    expect(store.select("chromatic-turn")?.id).toBe("chromatic-turn");
    expect(store.select("missing")).toBe(undefined);
    expect(store.current?.id).toBe("chromatic-turn");
    const byName = store.filter("chromatic");
    expect(byName.some((motif) => motif.id === "chromatic-turn")).toBeTruthy();
    expect(store.allTags()).toEqual([]);

    const tagged = addUserCopy(store, "chromatic-turn", "tagged-user");
    expect(tagged).toBeTruthy();
    expect(store.update({ ...tagged, tags: ["Demo", "lick"] })).toEqual([]);
    expect(store.filter("demo").some((motif) => motif.id === "tagged-user")).toBeTruthy();
    expect(store.allTags()).toEqual(["Demo", "lick"]);

    const secondTagged = addUserCopy(store, "scale-turn", "tagged-scale");
    expect(secondTagged).toBeTruthy();
    expect(store.update({ ...secondTagged, tags: ["lick"] })).toEqual([]);
    expect(store.allTags()).toEqual(["lick", "Demo"]);

    expect(store.filter("zzz-no-such-motif").length).toBe(0);
    expect(store.filter("").length >= store.filter("chromatic").length).toBeTruthy();
  });

  it("addUserCopy stores a builtin clone under a new editable id", () => {
    const store = new MotifStore();
    expect(store.isBuiltin("chromatic-turn")).toBe(true);

    const clone = addUserCopy(store, "chromatic-turn");
    expect(clone).toBeTruthy();
    expect(clone!.id).toBe("chromatic-turn-2");
    expect(store.isBuiltin(clone!.id)).toBe(false);
    expect(clone!.name).toBe("Chromatic Turn");

    const again = addUserCopy(store, "chromatic-turn");
    expect(again).toBeTruthy();
    expect(again!.id).not.toBe(clone!.id);
  });

  it("unique ids are deterministic and duplicate names sort stably", () => {
    const store = new MotifStore();
    const first = addUserCopy(store, "chromatic-turn");
    const second = addUserCopy(store, "chromatic-turn");
    expect(first && second).toBeTruthy();
    expect(first!.id).toBe("chromatic-turn-2");
    expect(second!.id).toBe("chromatic-turn-3");

    const sameName = store.list().filter((motif) => motif.name === "Chromatic Turn");
    expect(sameName.map((motif) => motif.id)).toEqual([
      "chromatic-turn",
      "chromatic-turn-2",
      "chromatic-turn-3",
    ]);
    expect(store.labels().get("chromatic-turn")).toBe("Chromatic Turn · chromatic-turn");
    expect(store.resolve("Chromatic Turn · chromatic-turn-2")?.id).toBe("chromatic-turn-2");
    expect(store.resolve("chromatic-turn-3")?.id).toBe("chromatic-turn-3");
  });

  it("allocates around external reservations and atomically replaces user motifs", () => {
    const current = new MotifStore();
    expect(current.uniqueId("Reserved", undefined, (candidate) => candidate === "reserved")).toBe(
      "reserved-2",
    );

    const candidate = new MotifStore();
    const user = addUserCopy(candidate, "chromatic-turn", "replacement-user");
    expect(user).toBeTruthy();
    current.replaceUsersFrom(candidate);

    expect(current.has("chromatic-turn"), "builtins remain present").toBeTruthy();
    expect(current.has(user!.id), "candidate user motifs are committed").toBeTruthy();
    current.select(user!.id);
    current.replaceUsersFrom(new MotifStore());
    expect(current.ensureCurrent("scale-turn")?.id).toBe("scale-turn");
  });

  it("built-in ids cannot be overwritten or removed", () => {
    const store = new MotifStore();
    const builtin = store.get("chromatic-turn");
    expect(builtin).toBeTruthy();
    expect(store.add({ ...builtin, name: "Corrupted" })).toEqual([
      "Cannot overwrite built-in motif: chromatic-turn",
    ]);
    expect(store.remove("chromatic-turn")).toBe(false);
    expect(store.get("chromatic-turn")?.name).toBe("Chromatic Turn");
  });

  it("setNotes recomputes length and validates", () => {
    const store = new MotifStore();
    const clone = addUserCopy(store, "chromatic-turn");
    expect(clone).toBeTruthy();

    const errors = store.setNotes(clone!.id, [
      { at: 0, duration: 480, pitch: 0 },
      { at: 480, duration: 960, pitch: 2 },
    ]);
    expect(errors).toEqual([]);

    const updated = store.get(clone!.id);
    expect(updated).toBeTruthy();
    expect(updated!.notes.length).toBe(2);
    expect(updated!.length).toBe(1440);

    expect(store.setNotes(clone!.id, [{ at: 0, duration: 240, pitch: 0 }])).toEqual([]);
    expect(store.get(clone!.id)?.length).toBe(240);

    expect(store.setNotes(clone!.id, [])).toEqual(["notes must be a non-empty array"]);
    expect(store.get(clone!.id)?.length).toBe(240);
    expect(store.setNotes("missing-motif", [{ at: 0, duration: 240, pitch: 0 }])).toEqual([
      "Unknown motif: missing-motif",
    ]);
  });

  it("normalizes ids and safely handles unknown or invalid values", () => {
    expect(uniqueMotifId("  Déjà Vu!  ")).toBe("deja-vu");
    expect(uniqueMotifId("🎵", "fallback")).toBe("fallback");

    const store = new MotifStore();
    expect(store.has("chromatic-turn")).toBe(true);
    expect(store.get("missing")).toBe(undefined);
    expect(addUserCopy(store, "missing")).toBe(undefined);
    expect(store.remove("missing")).toBe(false);
    expect(store.add(null).some((error) => error.includes("object"))).toBeTruthy();

    const clone = addUserCopy(store, "chromatic-turn", "custom");
    expect(clone).toBeTruthy();
    store.select(clone!.id);
    expect(store.remove(clone!.id)).toBe(true);
    expect(store.has(clone!.id)).toBe(false);
    expect(store.current).toBe(undefined);
    expect(store.ensureCurrent("scale-turn")?.id).toBe("scale-turn");
    store.resetToBuiltins();
    expect(store.list().length).toBe(2);
  });
});
