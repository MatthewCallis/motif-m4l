import { describe, it, expect } from "vitest";
import { MotifEditorState } from "../../src/library/editor-state.js";
import { MotifStore } from "../../src/library/store.js";
import { addUserCopy } from "../helpers/motif-store.js";

describe("MotifEditorState", () => {
  it("built-in editing creates a unique same-name draft and cancel removes it", () => {
    const store = new MotifStore();
    const editor = new MotifEditorState();
    const source = store.get("chromatic-turn");
    expect(source).toBeTruthy();

    const draft = editor.begin(store, source!.id);
    expect(draft).toBeTruthy();
    expect(draft!.id).not.toBe(source!.id);
    expect(draft!.name).toBe(source!.name);
    expect(editor.snapshot().created).toBe(true);

    store.update({ ...draft, name: "Temporary" });
    editor.markDirty();
    expect(editor.cancel(store)).toBe(source!.id);
    expect(store.get(draft!.id)).toBe(undefined);
    expect(editor.snapshot().active).toBe(false);
  });

  it("cancel restores an existing user motif snapshot", () => {
    const store = new MotifStore();
    const editor = new MotifEditorState();
    const user = addUserCopy(store, "chromatic-turn", "user-motif");
    expect(user).toBeTruthy();

    editor.begin(store, user!.id);
    store.update({ ...user, name: "Changed" });
    editor.markDirty();
    expect(editor.cancel(store)).toBe(user!.id);
    expect(store.get(user!.id)?.name).toBe(user!.name);
  });

  it("new imported sessions are removed on cancel and successful save exits editing", () => {
    const store = new MotifStore();
    const editor = new MotifEditorState();
    const imported = addUserCopy(store, "chromatic-turn", "imported");
    expect(imported).toBeTruthy();

    editor.begin(store, imported!.id, { created: true, dirty: true, sourceId: "scale-turn" });
    expect(editor.cancel(store)).toBe("scale-turn");
    expect(store.has(imported!.id)).toBe(false);

    const saved = addUserCopy(store, "chromatic-turn", "saved-copy");
    expect(saved).toBeTruthy();
    editor.begin(store, saved!.id, { dirty: true });
    expect(editor.finishSave()).toBe(saved!.id);
    expect(editor.snapshot()).toEqual({
      active: false,
      dirty: false,
      created: false,
      sourceId: null,
      targetId: null,
    });
  });

  it("an active session cannot silently switch targets", () => {
    const store = new MotifStore();
    const editor = new MotifEditorState();
    const first = addUserCopy(store, "chromatic-turn", "first");
    const second = addUserCopy(store, "chromatic-turn", "second");
    expect(first && second).toBeTruthy();

    expect(editor.begin(store, first!.id)?.id).toBe(first!.id);
    expect(editor.begin(store, second!.id)).toBe(undefined);
    expect(editor.snapshot().targetId).toBe(first!.id);
  });

  it("built-in editing accepts a pre-reserved target id", () => {
    const store = new MotifStore();
    const editor = new MotifEditorState();
    const draft = editor.begin(store, "chromatic-turn", { targetId: "chromatic-turn-9" });
    expect(draft?.id).toBe("chromatic-turn-9");
    expect(editor.snapshot().targetId).toBe("chromatic-turn-9");
  });

  it("clones tags into cancel snapshots and fails closed when builtin draft add errors", () => {
    const store = new MotifStore();
    const editor = new MotifEditorState();
    const tagged = addUserCopy(store, "chromatic-turn", "tagged-source");
    expect(tagged).toBeTruthy();
    expect(store.update({ ...tagged, tags: ["Demo", "lick"] })).toEqual([]);
    const session = editor.begin(store, "tagged-source");
    expect(session).toBeTruthy();
    expect(session!.tags).toEqual(["Demo", "lick"]);
    session!.tags?.push("mutated");
    expect(store.get("tagged-source")?.tags).toEqual(["Demo", "lick", "mutated"]);
    editor.cancel(store);
    expect(store.get("tagged-source")?.tags).toEqual(["Demo", "lick"]);

    const originalAdd = store.add.bind(store);
    store.add = () => ["forced add failure"];
    expect(editor.begin(store, "chromatic-turn")).toBe(undefined);
    store.add = originalAdd;
  });

  it("handles inactive and unknown edit transitions safely", () => {
    const store = new MotifStore();
    const editor = new MotifEditorState();
    expect(editor.snapshot()).toEqual({
      active: false,
      dirty: false,
      created: false,
      sourceId: null,
      targetId: null,
    });
    expect(editor.isEditing()).toBe(false);
    expect(editor.isDirty()).toBe(false);
    expect(editor.current(store)).toBe(undefined);
    expect(editor.begin(store, "missing")).toBe(undefined);
    expect(editor.cancel(store)).toBe(undefined);
    expect(editor.finishSave()).toBe(undefined);
    editor.markDirty();
    editor.abandon();
    expect(editor.isEditing()).toBe(false);
  });

  it("returns the active motif when begin repeats the same target", () => {
    const store = new MotifStore();
    const editor = new MotifEditorState();
    const first = editor.begin(store, "chromatic-turn");
    expect(first).toBeTruthy();
    expect(editor.begin(store, first!.id)?.id).toBe(first!.id);
    expect(editor.isEditing(first!.id)).toBe(true);
    expect(editor.current(store)?.id).toBe(first!.id);
    expect(editor.isEditing("scale-turn")).toBe(false);
  });
});
