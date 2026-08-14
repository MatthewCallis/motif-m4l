import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  appendMotifNote,
  applyMotifProperties,
  removeMotifNote,
  updateMotifNote,
} from "../src/library/motif-authoring.js";
import { MotifStore } from "../src/library/store.js";
import { hasOwn, isRecord, jsonValuesEqual, primitiveText } from "../src/core/type-guards.js";
import { MotifHotkeyMap } from "../src/max/hotkey-map.js";
import {
  encodeLibraryStateMessages,
  toLibraryHotkeyData,
  toLibraryNoteData,
} from "../src/max/library/device/serialization.js";
import {
  canonicalMaxPath,
  discardAllowed,
  emit,
  emitError,
  emitStatus,
  fileExists,
  flattenValues,
  joinMaxPath,
  mirrorWebDebug,
  numbers,
  pathFromAtoms,
  prepareLibraryPage,
  readJsonFile,
  stringAtom,
  toggleEnabled,
  writeJsonFile,
} from "../src/max/max-helpers.js";
import { readClipNotes, resolveDetailClip } from "../src/max/live-api.js";
import { MAX_LIBRARY_DEPTH } from "../src/max/device-types.js";
import { MaxUserLibrary } from "../src/max/library/device/repository.js";

interface MaxMocks {
  files: Record<string, string>;
  folders: Record<string, string[]>;
  outlets: unknown[][];
  errors: string[];
  posts: string[];
}

function installMaxMocks(): MaxMocks {
  const mocks: MaxMocks = {
    files: {},
    folders: {},
    outlets: [],
    errors: [],
    posts: [],
  };

  class MockFile {
    isopen: boolean;
    eof: number;
    foldername = "/tmp";
    position = 0;
    #buffer: string;

    constructor(
      readonly filename = "",
      readonly access: "read" | "write" | "readwrite" = "read",
    ) {
      this.isopen =
        access !== "read" || Object.prototype.hasOwnProperty.call(mocks.files, filename);
      this.#buffer = access === "write" ? "" : (mocks.files[filename] ?? "");
      this.eof = this.#buffer.length;
    }

    readstring(): string {
      return this.#buffer;
    }

    writestring(value: string): void {
      this.#buffer += value;
      this.eof = this.#buffer.length;
    }

    close(): void {
      if (this.access !== "read" && this.isopen) {
        mocks.files[this.filename] = this.#buffer;
        const basename = this.filename.split("/").at(-1) ?? this.filename;
        mocks.files[`/tmp/${basename}`] = this.#buffer;
      }
      this.isopen = false;
    }
  }

  class MockFolder {
    pathname: string;
    filename = "";
    #entries: string[];
    #index = 0;

    constructor(pathname: string) {
      const entries = mocks.folders[pathname];
      this.pathname = entries ? pathname : "";
      this.#entries = entries ?? [];
      this.filename = this.#entries[0] ?? "";
    }

    get count(): number {
      return this.#entries.length;
    }

    get end(): boolean {
      return this.#index >= this.#entries.length;
    }

    get extension(): string | null {
      const index = this.filename.lastIndexOf(".");
      return index < 0 ? null : this.filename.slice(index);
    }

    get filetype(): string | null {
      if (!this.pathname || !this.filename) {
        return null;
      }
      const fullPath = joinMaxPath(this.pathname, this.filename);
      if (Object.prototype.hasOwnProperty.call(mocks.folders, fullPath)) {
        return "fold";
      }
      return this.filename.toLowerCase().endsWith(".json") ? "JSON" : null;
    }

    next(): void {
      this.#index += 1;
      this.filename = this.#entries[this.#index] ?? "";
    }

    close(): void {
      this.#index = this.#entries.length;
    }
  }

  class MockTask {
    #cancelled = false;

    constructor(
      readonly callback: (...args: unknown[]) => void,
      readonly context?: object,
      readonly args: unknown[] = [],
    ) {}

    cancel(): void {
      this.#cancelled = true;
    }

    freepeer(): void {
      this.#cancelled = true;
    }

    schedule(): void {
      if (!this.#cancelled) {
        this.callback.apply(this.context, this.args);
      }
    }
  }

  Object.assign(globalThis, {
    File: MockFile,
    Folder: MockFolder,
    Task: MockTask,
    outlet: (_index: number, ...values: unknown[]) => mocks.outlets.push(values),
    error: (value: unknown) => mocks.errors.push(String(value)),
    post: (value: unknown) => mocks.posts.push(String(value)),
  });
  return mocks;
}

describe("extracted type and authoring helpers", () => {
  it("narrows records and converts only primitive text", () => {
    assert.equal(isRecord({ value: 1 }), true);
    assert.equal(isRecord([]), false);
    assert.equal(isRecord(null), false);
    assert.equal(hasOwn({ value: undefined }, "value"), true);
    assert.equal(hasOwn({}, "value"), false);
    assert.equal(primitiveText(12), "12");
    assert.equal(primitiveText(false), "false");
    assert.equal(primitiveText({}, "fallback"), "fallback");
    assert.equal(jsonValuesEqual({ one: 1, two: [2] }, { two: [2], one: 1 }), true);
    assert.equal(jsonValuesEqual({ one: 1 }, { one: 2 }), false);
  });

  it("applies motif properties without mutating the source", () => {
    const motif = new MotifStore().get("chromatic-turn");
    assert.ok(motif);
    const result = applyMotifProperties(motif, {
      name: "Edited",
      description: "Description",
      pitchMode: "hybrid",
      sourceMeter: { numerator: 3, denominator: 4 },
      defaultGate: 0.75,
      velocityCurve: { inputMin: 1, exponent: 2 },
    });

    assert.equal(result.ok, true);
    if (!result.ok) {
      return;
    }
    assert.equal(result.changed, true);
    assert.equal(result.value.name, "Edited");
    assert.equal(result.value.pitchMode, "hybrid");
    assert.equal(motif.name, "Chromatic Turn");

    const unchanged = applyMotifProperties(motif, {});
    assert.equal(unchanged.ok && unchanged.changed, false);

    const tagged = applyMotifProperties(motif, { tags: [" Demo ", "demo", "lick"] });
    assert.equal(tagged.ok, true);
    if (!tagged.ok) {
      return;
    }
    assert.deepEqual(tagged.value.tags, ["Demo", "lick"]);
    const cleared = applyMotifProperties(tagged.value, { tags: [] });
    assert.equal(cleared.ok, true);
    if (!cleared.ok) {
      return;
    }
    assert.equal(cleared.value.tags, undefined);
    const clearedNull = applyMotifProperties(tagged.value, { tags: null });
    assert.equal(clearedNull.ok, true);
    if (!clearedNull.ok) {
      return;
    }
    assert.equal(clearedNull.value.tags, undefined);
    const preserved = applyMotifProperties(tagged.value, { name: tagged.value.name });
    assert.equal(preserved.ok, true);
    if (!preserved.ok) {
      return;
    }
    assert.deepEqual(preserved.value.tags, ["Demo", "lick"]);
  });

  it("rejects invalid motif properties atomically", () => {
    const motif = new MotifStore().get("chromatic-turn");
    assert.ok(motif);
    for (const [value, message] of [
      [null, "object"],
      [{ id: "changed" }, "generated"],
      [{ schemaVersion: 99 }, "read-only"],
      [{ length: 99 }, "derived"],
      [{ name: "" }, "cannot be empty"],
      [{ name: { nested: true } }, "must be text"],
      [{ pitchMode: "invalid" }, "pitchMode"],
      [{ sourceMeter: null }, "sourceMeter"],
      [{ sourceMeter: { numerator: 0, denominator: 4 } }, "numerator"],
      [{ sourceMeter: { numerator: 4, denominator: 3 } }, "denominator"],
      [{ defaultGate: 0 }, "greater than zero"],
      [{ velocityCurve: "invalid" }, "velocityCurve"],
      [{ velocityCurve: { exponent: 0 } }, "greater than zero"],
      [{ tags: "demo" }, "tags must be an array"],
      [{ tags: [""] }, "cannot be empty"],
      [{ tags: [1] }, "must be a string"],
      [{ sourcePitchContext: null }, "sourcePitchContext must be an object"],
      [
        {
          sourcePitchContext: {
            ...motif.sourcePitchContext,
            anchorPitch: 128,
          },
        },
        "anchorPitch",
      ],
      [
        {
          sourcePitchContext: {
            ...motif.sourcePitchContext,
            scaleRootNote: 12,
          },
        },
        "scaleRootNote",
      ],
      [
        {
          sourcePitchContext: {
            ...motif.sourcePitchContext,
            scaleName: "   ",
          },
        },
        "scaleName",
      ],
      [
        {
          sourcePitchContext: {
            ...motif.sourcePitchContext,
            scaleIntervals: "Major",
          },
        },
        "array or null",
      ],
      [
        {
          sourcePitchContext: {
            ...motif.sourcePitchContext,
            scaleIntervals: [0, 2, 2],
          },
        },
        "sorted, unique",
      ],
      [
        {
          sourcePitchContext: {
            ...motif.sourcePitchContext,
            scaleIntervals: [1, 2, 4],
          },
        },
        "starting at 0",
      ],
    ] as const) {
      const result = applyMotifProperties(motif, value);
      assert.equal(result.ok, false);
      if (!result.ok) {
        assert.match(result.error, new RegExp(message));
      }
    }
  });

  it("validates sourcePitchContext updates and pitch-mode conversion failures", () => {
    const motif = new MotifStore().get("chromatic-turn");
    assert.ok(motif);

    const unchanged = applyMotifProperties(motif, {
      sourcePitchContext: { ...motif.sourcePitchContext },
    });
    assert.equal(unchanged.ok && unchanged.changed, false);

    const withNullIntervals = applyMotifProperties(motif, {
      sourcePitchContext: {
        ...motif.sourcePitchContext,
        scaleIntervals: null,
      },
    });
    assert.equal(withNullIntervals.ok, true);
    if (!withNullIntervals.ok) {
      return;
    }
    assert.equal(withNullIntervals.changed, true);
    assert.equal(withNullIntervals.value.sourcePitchContext.scaleIntervals, null);

    const clearedCurve = applyMotifProperties(
      { ...motif, velocityCurve: { exponent: 1.5 } },
      { velocityCurve: null },
    );
    assert.equal(clearedCurve.ok, true);
    if (!clearedCurve.ok) {
      return;
    }
    assert.equal(clearedCurve.value.velocityCurve, undefined);

    const unresolved = applyMotifProperties(motif, {
      pitchMode: "scale",
      sourcePitchContext: {
        ...motif.sourcePitchContext,
        scaleIntervals: null,
        scaleName: "Custom Unknown Scale",
      },
    });
    assert.equal(unresolved.ok, false);
    if (!unresolved.ok) {
      assert.match(unresolved.error, /source scale intervals are unresolved/);
    }

    assert.equal(updateMotifNote(motif, 0, "bogus" as "pitch", 1).ok, false);
  });

  it("edits, appends, removes, and serializes motif notes", () => {
    const motif = new MotifStore().get("chromatic-turn");
    assert.ok(motif);
    const pitch = updateMotifNote(motif, 0, "pitch", -3);
    assert.equal(pitch.ok, true);
    if (!pitch.ok) {
      return;
    }
    assert.equal(pitch.notes[0]?.pitch, -3);
    assert.notEqual(pitch.notes, motif.notes);

    const legato = updateMotifNote(motif, 0, "legato", true);
    assert.equal(legato.ok && legato.notes[0]?.legato, true);
    assert.equal(updateMotifNote(motif, -1, "pitch", 1).ok, false);
    assert.equal(updateMotifNote(motif, 0, "velocity", 128).ok, false);

    const appended = appendMotifNote(motif, 512);
    assert.equal(appended.ok, true);
    if (!appended.ok) {
      return;
    }
    assert.equal(appended.notes.length, motif.notes.length + 1);
    assert.equal(appendMotifNote(motif, motif.notes.length).ok, false);
    assert.equal(removeMotifNote(motif, -1).ok, false);
    assert.equal(removeMotifNote(motif, 0).ok, true);

    assert.deepEqual(
      toLibraryNoteData({
        pitch: 2,
        accidental: -1,
        at: 10,
        duration: 20,
        legato: true,
      }),
      {
        pitch: 2,
        accidental: -1,
        at: 10,
        duration: 20,
        gate: null,
        velocity: null,
        velocityOffset: null,
        velocityScale: null,
        legato: true,
        tie: false,
      },
    );
    assert.deepEqual(toLibraryHotkeyData({ pitch: 60, action: "select" }), {
      pitch: 60,
      action: "select",
      label: "C3",
    });
  });

  it("keeps large Library state messages below the Max atom boundary", () => {
    const state = {
      items: [],
      selected: {
        notes: Array.from({ length: 37 }, (_, index) => ({
          pitch: index % 6 === 0 ? 0 : -(index % 6),
          accidental: null,
          at: index * 240,
          duration: 240,
          gate: null,
          velocity: 80,
          velocityOffset: null,
          velocityScale: null,
          legato: false,
          tie: false,
        })),
      },
    };
    const messages = encodeLibraryStateMessages(state, 7);
    assert.ok(messages.length > 1);
    assert.ok(messages.every((message) => message.length < 6_000));

    const chunks = messages.map(
      (message) =>
        JSON.parse(decodeURIComponent(message)) as {
          transferId: number;
          index: number;
          total: number;
          data: string;
        },
    );
    assert.ok(chunks.every((chunk) => chunk.transferId === 7));
    const encodedState = chunks
      .sort((left, right) => left.index - right.index)
      .map((chunk) => chunk.data)
      .join("");
    assert.deepEqual(JSON.parse(decodeURIComponent(encodedState)), state);
  });

  it("normalizes every editable note field and rejects invalid numeric values", () => {
    const motif = new MotifStore().get("chromatic-turn");
    assert.ok(motif);
    const accepted: Array<readonly [Parameters<typeof updateMotifNote>[2], unknown]> = [
      ["accidental", 1],
      ["accidental", null],
      ["at", 120],
      ["duration", 120],
      ["gate", 0.5],
      ["gate", null],
      ["velocity", 64],
      ["velocity", null],
      ["velocityOffset", -5],
      ["velocityOffset", 0],
      ["velocityScale", 0.5],
      ["velocityScale", null],
      ["tie", true],
      ["tie", false],
    ];
    for (const [field, value] of accepted) {
      assert.equal(updateMotifNote(motif, 0, field, value).ok, true, field);
    }

    for (const [field, value] of [
      ["pitch", null],
      ["pitch", "invalid"],
      ["at", -1],
      ["duration", 0],
      ["gate", 0],
      ["velocity", 1.5],
      ["velocityScale", -1],
    ] as const) {
      assert.equal(updateMotifNote(motif, 0, field, value).ok, false, field);
    }
  });
});

describe("extracted Max helpers", () => {
  it("normalizes atoms, paths, toggles, and outlet messages", () => {
    const mocks = installMaxMocks();
    assert.deepEqual(flattenValues([1, [2, 3], "four"]), [1, 2, 3, "four"]);
    assert.deepEqual(numbers([1, ["2", "bad"]]), [1, 2]);
    assert.equal(stringAtom(true), "true");
    assert.equal(stringAtom({}, "fallback"), "fallback");
    assert.equal(pathFromAtoms(["/tmp/My", "Library"]), "/tmp/My Library");
    assert.equal(joinMaxPath("/tmp", "file.json"), "/tmp/file.json");
    assert.equal(joinMaxPath("Volume:", "file.json"), "Volume:file.json");
    assert.equal(canonicalMaxPath("C:\\Foo//Bar"), "c:/foo/bar");
    assert.equal(toggleEnabled("on"), true);
    assert.equal(toggleEnabled(0), false);
    assert.equal(discardAllowed(true), true);
    assert.equal(discardAllowed(0), false);

    emit("value", 1);
    emitStatus("ready");
    emitError("broken");
    assert.deepEqual(mocks.outlets, [
      ["value", 1],
      ["status", "ready"],
      ["error", "broken"],
    ]);
    assert.match(mocks.errors[0] ?? "", /Motif: broken/);
  });

  it("reads, writes, checks, and materializes Max files", () => {
    const mocks = installMaxMocks();
    mocks.files["/tmp/input.json"] = '{"value":1}';
    assert.deepEqual(readJsonFile("/tmp/input.json"), { value: 1 });
    assert.equal(fileExists("/tmp/input.json"), true);
    assert.equal(fileExists("/tmp/missing.json"), false);

    writeJsonFile("/tmp/output.json", { value: 2 });
    assert.match(mocks.files["/tmp/output.json"] ?? "", /"value": 2/);
    assert.equal(
      prepareLibraryPage("library.html", "<!doctype html><p>ready</p>"),
      "/tmp/library.html",
    );
    assert.match(mocks.files["/tmp/library.html"] ?? "", /ready/);
    assert.throws(() => readJsonFile("/tmp/missing.json"), /could not open/);
  });

  it("routes decoded and malformed web diagnostics to the correct console stream", () => {
    const mocks = installMaxMocks();
    mirrorWebDebug("library", "info", encodeURIComponent("ready now"));
    mirrorWebDebug("preview", "error", "%invalid");
    assert.match(mocks.posts[0] ?? "", /ready now/);
    assert.match(mocks.errors[0] ?? "", /%invalid/);
  });
});

describe("LiveAPI adapter", () => {
  it("parses notes, filters muted notes, and clamps velocity through readClipNotes", () => {
    installMaxMocks();
    const payload = {
      notes: [
        { pitch: 64, start_time: 1.5, duration: 0.5, velocity: 200 },
        { pitch: 65, start_time: 2, duration: 1, mute: true },
        { pitch: "bad", start_time: 0, duration: 1 },
      ],
    };
    class StringPayloadApi {
      id = 1;
      get(): number {
        return 1;
      }
      getstring(): string {
        return "";
      }
      call(): unknown {
        return JSON.stringify(payload);
      }
    }
    Object.assign(globalThis, { LiveAPI: StringPayloadApi });
    const clip = resolveDetailClip();
    assert.ok(clip);
    assert.deepEqual(readClipNotes(clip), [{ pitch: 64, at: 1440, duration: 480, velocity: 127 }]);
  });

  it("gracefully returns empty notes for invalid payload and missing clip", () => {
    installMaxMocks();
    class InvalidPayloadApi {
      id = 1;
      get(): number {
        return 1;
      }
      getstring(): string {
        return "";
      }
      call(): unknown {
        return "{invalid";
      }
    }
    Object.assign(globalThis, { LiveAPI: InvalidPayloadApi });
    const clip = resolveDetailClip();
    assert.ok(clip);
    assert.deepEqual(readClipNotes(clip), []);
  });

  it("resolves Detail View and highlighted-slot clips and reads their notes", () => {
    installMaxMocks();
    class DetailLiveApi {
      id: number;
      constructor(
        _callback?: (args: unknown[]) => void,
        readonly path = "",
      ) {
        this.id = path.includes("detail_clip") ? 1 : 0;
      }
      get(property: string): number {
        return property === "is_midi_clip" ? 1 : 0;
      }
      getstring(): string {
        return "Clip";
      }
      call(): unknown {
        return JSON.stringify({
          notes: [{ pitch: 60, start_time: 0, duration: 1, velocity: 100 }],
        });
      }
    }
    Object.assign(globalThis, { LiveAPI: DetailLiveApi });
    const detail = resolveDetailClip();
    assert.ok(detail);
    assert.equal(readClipNotes(detail).length, 1);

    class SlotLiveApi extends DetailLiveApi {
      constructor(callback?: (args: unknown[]) => void, path = "") {
        super(callback, path);
        this.id = path.endsWith("detail_clip") ? 0 : 1;
      }
      override get(property: string): number {
        if (property === "has_clip" || property === "is_midi_clip") {
          return 1;
        }
        return 0;
      }
    }
    Object.assign(globalThis, { LiveAPI: SlotLiveApi });
    assert.ok(resolveDetailClip());

    class AudioLiveApi extends DetailLiveApi {
      override get(property: string): number {
        return property === "is_audio_clip" ? 1 : 0;
      }
    }
    Object.assign(globalThis, { LiveAPI: AudioLiveApi });
    assert.equal(resolveDetailClip(), undefined);

    Object.assign(globalThis, { LiveAPI: undefined });
    assert.equal(resolveDetailClip(), undefined);
  });

  it("interprets LiveAPI string truthiness and Dict-like note payloads", () => {
    installMaxMocks();
    class StringTruthyApi {
      id = 1;
      constructor(
        _callback?: (args: unknown[]) => void,
        readonly path = "",
      ) {
        this.id = path.includes("detail_clip") ? 1 : 0;
      }
      get(property: string): string {
        if (property === "is_midi_clip") {
          return "false";
        }
        if (property === "is_audio_clip") {
          return "id 0";
        }
        return "0";
      }
      getstring(): string {
        return "";
      }
      call(): unknown {
        return {
          stringify: () =>
            JSON.stringify({
              notes: [{ pitch: 61, start_time: 0, duration: 0.25, velocity: 90 }],
            }),
        };
      }
    }
    Object.assign(globalThis, { LiveAPI: StringTruthyApi });
    // is_midi_clip "false" and is_audio_clip "id 0" both fail soft ➜ try notes.
    const clip = resolveDetailClip();
    assert.ok(clip);
    assert.deepEqual(readClipNotes(clip), [{ pitch: 61, at: 0, duration: 240, velocity: 90 }]);

    class ThrowingDetailApi {
      id = 1;
      constructor(_callback?: (args: unknown[]) => void, path = "") {
        if (path.includes("detail_clip")) {
          throw new Error("detail unavailable");
        }
        this.id = 0;
      }
      get(): number {
        return 0;
      }
      getstring(): string {
        return "";
      }
      call(): unknown {
        return [];
      }
    }
    Object.assign(globalThis, { LiveAPI: ThrowingDetailApi });
    assert.equal(resolveDetailClip(), undefined);
  });
});

describe("hotkey and user-library owners", () => {
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

  it("scans, groups, saves, and collision-protects a Max user library", () => {
    const mocks = installMaxMocks();
    const store = new MotifStore();
    const userMotif = { ...store.get("chromatic-turn")!, id: "user-one", name: "User One" };
    mocks.folders["/library"] = ["nested", "user-one.json"];
    mocks.folders["/library/nested"] = ["ignored.txt"];
    mocks.files["/library/user-one.json"] = JSON.stringify(userMotif);
    const errors: string[] = [];
    const statuses: unknown[][] = [];
    let changes = 0;
    const library = new MaxUserLibrary(store, {
      onError: (message) => errors.push(message),
      onStateChange: () => {
        changes += 1;
      },
      onStatus: (...values) => statuses.push(values),
      onContentsChanged: () => {
        changes += 1;
      },
    });

    assert.equal(library.selectPath("/library"), true);
    assert.equal(library.loaded, true);
    assert.equal(store.has("user-one"), true);
    assert.equal(library.browserFolder("scale-turn"), "Library");
    assert.equal(library.browserFolder("user-one"), "Library");
    assert.equal(library.uniqueId("User One"), "user-one-2");
    assert.equal(library.save("user-one"), "/library/user-one.json");
    assert.ok(changes > 0);
    assert.ok(statuses.some(([status]) => status === "library"));
    assert.equal(errors.length, 0);

    mocks.files["/library/collision.json"] = "{}";
    const collision = { ...userMotif, id: "collision" };
    assert.deepEqual(store.add(collision), []);
    assert.throws(() => library.save("collision"), /already exists/);
    assert.equal(library.isOccupied("/LIBRARY/collision.json"), true);
    assert.throws(() => library.save("missing"), /Unknown motif/);

    assert.equal(library.selectPath("/missing"), false);
    assert.equal(library.loaded, false);
    assert.ok(errors.some((message) => message.includes("not found")));
  });

  it("skips invalid, builtin-conflicting, and duplicate motif files during scan", () => {
    const mocks = installMaxMocks();
    const store = new MotifStore();
    const valid = { ...store.get("chromatic-turn")!, id: "user-valid", name: "Valid" };
    const duplicate = { ...valid, name: "Duplicate" };
    const builtinClash = { ...valid, id: "chromatic-turn", name: "Builtin Clash" };
    mocks.folders["/library"] = [
      "broken.json",
      "builtin.json",
      "valid.json",
      "duplicate.json",
      "nested",
    ];
    mocks.folders["/library/nested"] = ["deep.json"];
    mocks.files["/library/broken.json"] = '{"id":""}';
    mocks.files["/library/builtin.json"] = JSON.stringify(builtinClash);
    mocks.files["/library/valid.json"] = JSON.stringify(valid);
    mocks.files["/library/duplicate.json"] = JSON.stringify(duplicate);
    mocks.files["/library/nested/deep.json"] = JSON.stringify({
      ...valid,
      id: "nested-user",
      name: "Nested",
    });
    const errors: string[] = [];
    const statuses: unknown[][] = [];
    let stateChanges = 0;
    const library = new MaxUserLibrary(store, {
      onError: (message) => errors.push(message),
      onStateChange: () => {
        stateChanges += 1;
      },
      onStatus: (...values) => statuses.push(values),
      onContentsChanged: () => undefined,
    });

    assert.equal(library.selectPath("/library"), true);
    assert.equal(library.loaded, true);
    assert.equal(store.has("user-valid"), true);
    assert.equal(store.has("nested-user"), true);
    assert.equal(library.browserFolder("nested-user"), "nested");
    assert.equal(library.browserFolder("missing-user"), "Library");
    library.files.set("outside", "/elsewhere/outside.json");
    assert.equal(library.browserFolder("outside"), "Library");
    assert.ok(errors.some((message) => message.includes("broken.json")));
    assert.ok(errors.some((message) => message.includes("conflicts with a built-in")));
    assert.ok(errors.some((message) => message.includes("duplicate motif id")));

    const changesBefore = stateChanges;
    assert.equal(library.selectPath("/library"), false);
    assert.equal(stateChanges, changesBefore + 1);
    assert.equal(library.loaded, true);

    library.load("library-refreshed");
    assert.ok(statuses.some(([status]) => status === "library-refreshed"));
  });

  it("cancels mid-scan work and reports maximum folder depth", () => {
    const mocks = installMaxMocks();
    const store = new MotifStore();
    const errors: string[] = [];
    const library = new MaxUserLibrary(store, {
      onError: (message) => errors.push(message),
      onStateChange: () => undefined,
      onStatus: () => undefined,
      onContentsChanged: () => undefined,
    });

    const deferred: Array<() => void> = [];
    class DeferredTask {
      #cancelled = false;
      constructor(
        readonly callback: (...args: unknown[]) => void,
        readonly context?: object,
        readonly args: unknown[] = [],
      ) {}
      cancel(): void {
        this.#cancelled = true;
      }
      freepeer(): void {
        this.#cancelled = true;
      }
      schedule(): void {
        deferred.push(() => {
          if (!this.#cancelled) {
            this.callback.apply(this.context, this.args);
          }
        });
      }
    }
    Object.assign(globalThis, { Task: DeferredTask });
    mocks.folders["/slow"] = ["a.json"];
    mocks.files["/slow/a.json"] = JSON.stringify({
      ...store.get("chromatic-turn")!,
      id: "slow-user",
      name: "Slow",
    });

    assert.equal(library.selectPath("/slow"), true);
    assert.equal(library.scanning, true);
    assert.ok(library.scanTask);
    library.cancelScan();
    assert.equal(library.scanning, false);
    assert.equal(library.scanTask, undefined);
    assert.equal(store.has("slow-user"), false);

    let path = "/deep";
    mocks.folders[path] = ["child"];
    for (let depth = 0; depth < MAX_LIBRARY_DEPTH; depth += 1) {
      const child = `${path}/child`;
      mocks.folders[child] = ["child"];
      path = child;
    }
    mocks.folders[`${path}/child`] = [];
    Object.assign(globalThis, {
      Task: class ImmediateTask {
        constructor(
          readonly callback: (...args: unknown[]) => void,
          readonly context?: object,
          readonly args: unknown[] = [],
        ) {}
        cancel(): void {}
        freepeer(): void {}
        schedule(): void {
          this.callback.apply(this.context, this.args);
        }
      },
    });
    errors.length = 0;
    library.selectPath("/deep");
    assert.ok(errors.some((message) => message.includes("maximum library folder depth exceeded")));
  });
});

describe("TypeScript device dispatcher", () => {
  it("executes source handlers directly in addition to compiled-bundle contract tests", async () => {
    const mocks = installMaxMocks();
    class EmptyLiveApi {
      id = 0;
      get(): number {
        return 0;
      }
      getstring(): string {
        return "";
      }
      call(): unknown {
        return { notes: [] };
      }
    }
    Object.assign(globalThis, {
      LiveAPI: EmptyLiveApi,
      __MOTIF_LIBRARY_HTML__: "<!doctype html><p>Motif</p>",
      __MOTIF_LIBRARY_PAGE_NAME__: "motif-library-test.html",
    });

    const { dispatch } = await import("../src/max/device.js");
    const messages: ReadonlyArray<readonly [string, ...unknown[]]> = [
      ["initialize"],
      ["preview_ready"],
      ["library_ready"],
      [
        "restore_state",
        encodeURIComponent(
          JSON.stringify({
            schemaVersion: 1,
            selectedMotifId: "scale-turn",
            hotkeys: [],
          }),
        ),
      ],
      ["library_prepare"],
      ["web_debug", "library", "info", encodeURIComponent("ready")],
      ["song_context", "tempo", 128],
      ["song_context", "root_note", 2],
      ["song_context", "scale_mode", 1],
      ["song_context", "scale_name", "D Major"],
      ["song_context", "scale_intervals", 0, 2, 4, 5, 7, 9, 11],
      ["song_context", "signature_numerator", 3],
      ["song_context", "signature_denominator", 4],
      ["song_context", "is_playing", 1],
      ["song_context", "current_song_time", 2],
      ["motif", "Chromatic Turn"],
      ["pitch_mode", "motif"],
      ["pitch_mode", "hybrid"],
      ["pitch_mode", "nope"],
      ["invert", 1],
      ["reverse", 1],
      ["meter_mode", "fit-bar"],
      ["meter_mode", "nope"],
      ["retrigger", "overlap"],
      ["retrigger", "nope"],
      ["trigger_mode", "hold"],
      ["trigger_mode", "motif"],
      ["trigger_mode", "nope"],
      ["repeat_rounding", "1/2-bar"],
      ["repeat_rounding", "nope"],
      ["launch_quantization", "1/4"],
      ["launch_quantization", "nope"],
      ["pass_through", "all"],
      ["pass_through", "nope"],
      ["trigger_low", 40],
      ["trigger_high", 80],
      ["map_trigger", "C3", "scale-turn"],
      ["note", 60, 100, 1],
      ["note", 60, 0, 1],
      ["sustain", 127, 1],
      ["sustain", 0, 1],
      ["unmap_trigger", "C3"],
      ["clear_trigger_map"],
      ["tempo_multiplier", 2],
      ["tempo_multiplier", "nope"],
      ["filter_motifs", "scale"],
      ["song_context", "unknown_property", 1],
      ["song_context", "is_playing", 0],
      ["begin_edit"],
      ["edit_motif", { name: "Direct Source Draft" }],
      ["edit_note_at", 0, "pitch", 2],
      ["lib_action", encodeURIComponent(JSON.stringify({ type: "add_note" }))],
      [
        "lib_action",
        encodeURIComponent(
          JSON.stringify({
            type: "edit_note_at",
            index: 0,
            field: "velocity",
            value: 90,
          }),
        ),
      ],
      ["lib_action", encodeURIComponent(JSON.stringify({ type: "remove_note", index: 999 }))],
      [
        "lib_action",
        encodeURIComponent(
          JSON.stringify({
            type: "map_trigger",
            pitch: 62,
            motifId: "scale-turn",
            action: "select",
          }),
        ),
      ],
      ["lib_action", encodeURIComponent(JSON.stringify({ type: "unmap_trigger", pitch: 62 }))],
      ["lib_action", encodeURIComponent(JSON.stringify({ type: "clear_trigger_map" }))],
      ["lib_action", encodeURIComponent(JSON.stringify({ type: "begin_edit" }))],
      [
        "lib_action",
        encodeURIComponent(
          JSON.stringify({ type: "edit_motif", properties: { description: "via lib" } }),
        ),
      ],
      ["lib_action", encodeURIComponent(JSON.stringify({ type: "import_clip" }))],
      ["lib_action", encodeURIComponent(JSON.stringify({ type: "save_motif" }))],
      ["lib_action", encodeURIComponent(JSON.stringify({ type: "refresh_library" }))],
      ["lib_action", encodeURIComponent(JSON.stringify({ type: "cancel_edit" }))],
      ["cancel_edit"],
      [
        "lib_action",
        encodeURIComponent(
          JSON.stringify({
            type: "select_browser",
            id: "scale-turn",
          }),
        ),
      ],
      [
        "lib_action",
        encodeURIComponent(
          JSON.stringify({
            type: "filter_motifs",
            query: "scale",
            tags: ["demo"],
            tagMode: "and",
          }),
        ),
      ],
      ["lib_action", encodeURIComponent(JSON.stringify({ type: "filter_motifs", query: "" }))],
      ["lib_action", encodeURIComponent(JSON.stringify({ type: "unknown-action" }))],
      ["refresh_library"],
      ["import_clip"],
      ["panic"],
      ["list_motifs"],
      ["dump_context"],
    ];

    for (const [message, ...args] of messages) {
      dispatch(message, args);
    }

    mocks.folders["/Motifs"] = [];
    dispatch("library_path", ["/Motifs"]);
    dispatch("begin_edit", []);
    dispatch("edit_motif", [{ name: "Dirty Path" }]);
    const errorsBeforePath = mocks.errors.length;
    dispatch("library_path", ["/Other"]);
    assert.ok(
      mocks.errors
        .slice(errorsBeforePath)
        .some((message) =>
          message.includes("Finish or cancel editing before changing the library"),
        ),
    );
    dispatch("library_path", []);
    dispatch("cancel_edit", []);
    dispatch("library_path", ["/Motifs"]);
    dispatch("library_path", ["/Motifs"]);

    dispatch("unknown-source-message", []);

    assert.ok(mocks.errors.some((message) => message.includes("Unknown message")));
    assert.ok(mocks.errors.some((message) => message.includes("Unknown pitch mode")));
    assert.ok(mocks.errors.some((message) => message.includes("Unknown Song property")));
  });
});
