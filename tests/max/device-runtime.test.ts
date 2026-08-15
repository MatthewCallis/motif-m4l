import { describe, it, expect } from "vitest";
import { createEngine, lastLibState, lastPersistedState } from "../helpers/max-engine.js";

describe("Max device runtime integration", () => {
  it("round-trips selected motif and MIDI hot keys through Live-stored state", async () => {
    const first = await createEngine();
    first.dispatch("initialize");
    first.dispatch("motif", "Chromatic Turn");
    first.dispatch("map_trigger", 20, "scale-turn", "select");
    first.dispatch("map_trigger", 21, "chromatic-turn", "trigger");

    const encoded = lastPersistedState(first.outlets);
    expect(encoded, "state changes must emit an encoded persistence snapshot").toBeTruthy();

    const restored = await createEngine();
    restored.dispatch("restore_state", encoded);
    restored.dispatch("initialize");

    const lib = lastLibState(restored.outlets);
    expect(lib).toBeTruthy();
    expect((lib!["selected"] as Record<string, unknown>)["id"]).toBe("chromatic-turn");
    const items = lib!["items"] as Array<{
      id: string;
      hotkeys: Array<{ pitch: number; action: string }>;
    }>;
    expect(items.find((item) => item.id === "scale-turn")?.hotkeys).toEqual([
      { pitch: 20, action: "select", label: "G♯-1" },
    ]);
    expect(items.find((item) => item.id === "chromatic-turn")?.hotkeys).toEqual([
      { pitch: 21, action: "trigger", label: "A-1" },
    ]);
    expect(restored.errors).toEqual([]);
  });

  it("waits for an asynchronous user-library scan before restoring stable ids", async () => {
    const path = "/Persisted Library";
    const filename = `${path}/saved.json`;
    const restored = await createEngine({
      files: { [filename]: JSON.stringify(userMotif("saved-user-motif", "Saved User Motif")) },
      folders: { [path]: ["saved.json"] },
      deferTasks: true,
    });
    const encoded = encodeURIComponent(
      JSON.stringify({
        schemaVersion: 1,
        selectedMotifId: "saved-user-motif",
        hotkeys: [
          {
            pitch: 24,
            motifId: "saved-user-motif",
            action: "trigger",
          },
        ],
      }),
    );

    restored.dispatch("library_path", path);
    restored.dispatch("restore_state", encoded);
    let lib = lastLibState(restored.outlets);
    expect(lib).toBeTruthy();
    expect(lib!["libraryScanning"]).toBe(true);
    expect((lib!["selected"] as Record<string, unknown>)["id"]).toBe("scale-turn");

    expect(restored.runScheduledTasks() >= 1).toBeTruthy();
    lib = lastLibState(restored.outlets);
    expect(lib).toBeTruthy();
    expect(lib!["libraryScanning"]).toBe(false);
    expect((lib!["selected"] as Record<string, unknown>)["id"]).toBe("saved-user-motif");
    expect((lib!["selected"] as Record<string, unknown>)["hotkeys"]).toEqual([
      { pitch: 24, action: "trigger", label: "C0" },
    ]);
    expect(restored.errors).toEqual([]);
  });

  it("fails soft when a saved engine snapshot is malformed or unsupported", async () => {
    const engine = await createEngine();
    engine.dispatch("restore_state", "%not-json");
    engine.dispatch(
      "restore_state",
      encodeURIComponent(
        JSON.stringify({
          schemaVersion: 99,
          selectedMotifId: "scale-turn",
          hotkeys: [],
        }),
      ),
    );
    engine.dispatch("initialize");

    const selected = lastLibState(engine.outlets)?.["selected"] as
      | Record<string, unknown>
      | undefined;
    expect(selected?.["id"]).toBe("scale-turn");
    expect(
      engine.errors.filter((message) => message.includes("Saved device state is invalid")).length,
    ).toBe(2);
  });

  it("filter_motifs emits a filtered browser list", async () => {
    const engine = await createEngine();
    engine.dispatch("initialize");
    engine.outlets.length = 0;
    engine.dispatch("filter_motifs", "chromatic");

    const lib = lastLibState(engine.outlets);
    expect(lib, "lib state must be emitted").toBeTruthy();
    const items = lib!["items"] as Array<{ name: string }>;
    expect(items.length >= 1).toBeTruthy();
    expect(items.every((item) => item.name.toLowerCase().includes("chromatic"))).toBeTruthy();
  });

  it("clearing search restores the full browser list", async () => {
    const engine = await createEngine();
    engine.dispatch("initialize");
    engine.dispatch("filter_motifs", "zzz-no-match");
    engine.outlets.length = 0;
    engine.dispatch("filter_motifs");

    const lib = lastLibState(engine.outlets);
    expect(lib, "lib state must be emitted").toBeTruthy();
    const items = lib!["items"] as Array<{ name: string }>;
    expect(items.length >= 2, "an empty query must restore builtins").toBeTruthy();
  });

  it("lib state includes notes for the selected motif", async () => {
    const engine = await createEngine();
    engine.dispatch("initialize");
    engine.dispatch("motif", "Chromatic Turn");

    const lib = lastLibState(engine.outlets);
    expect(lib, "lib state must be emitted").toBeTruthy();
    const selected = lib!["selected"] as Record<string, unknown> | null;
    expect(selected, "selected motif must be present in lib state").toBeTruthy();
    const notes = selected!["notes"] as Array<Record<string, unknown>>;
    expect(notes.length >= 1, "at least one note visible in lib state").toBeTruthy();
    // note shape: { pitch, accidental, at, duration, gate, velocity }
    for (const note of notes) {
      expect("pitch" in note, "note must have pitch").toBeTruthy();
      expect("at" in note, "note must have at").toBeTruthy();
      expect("duration" in note, "note must have duration").toBeTruthy();
    }
  });

  it("invert and reverse change playback and preview without mutating stored motif notes", async () => {
    const engine = await createEngine();
    engine.dispatch("initialize");
    expect(
      [...engine.outlets]
        .reverse()
        .find((args) => args[0] === "ui" && args[1] === "transforms")
        ?.slice(2),
    ).toEqual([0, 0]);

    engine.dispatch("invert", 1);
    expect(
      [...engine.outlets]
        .reverse()
        .find((args) => args[0] === "ui" && args[1] === "transforms")
        ?.slice(2),
    ).toEqual([1, 0]);
    engine.outlets.length = 0;
    engine.dispatch("note", 60, 100, 1);
    expect(
      engine.outlets
        .filter((args) => args[0] === "event" && Number(args[2]) > 0)
        .map((args) => args[1]),
    ).toEqual([60, 59, 57, 53, 55, 59, 60]);
    const invertedPreviewRaw = [...engine.outlets]
      .reverse()
      .find((args) => args[0] === "ui" && args[1] === "preview")?.[2];
    const invertedPreview = JSON.parse(decodeURIComponent(String(invertedPreviewRaw))) as {
      notes: Array<{ pitch: number }>;
    };
    expect(invertedPreview.notes.map(({ pitch }) => pitch)).toEqual([60, 59, 57, 53, 55, 59, 60]);

    engine.dispatch("invert", 0);
    engine.dispatch("reverse", 1);
    expect(
      [...engine.outlets]
        .reverse()
        .find((args) => args[0] === "ui" && args[1] === "transforms")
        ?.slice(2),
    ).toEqual([0, 1]);
    // Library state must show notes in stored (non-reversed) order even with Reverse active
    const selected = lastLibState(engine.outlets)?.["selected"] as Record<string, unknown>;
    expect(
      (selected["notes"] as Array<Record<string, unknown>>).map((note) => note["pitch"]),
    ).toEqual([0, 1, 2, 4, 3, 1, 0]);
    engine.outlets.length = 0;
    engine.dispatch("note", 60, 100, 1);
    expect(
      engine.outlets
        .filter((args) => args[0] === "event" && Number(args[2]) > 0)
        .map((args) => args[1]),
    ).toEqual([60, 62, 65, 67, 64, 62, 60]);
    expect(engine.outlets.filter((args) => args[0] === "ui" && args[1] === "lib")).toEqual([]);

    engine.dispatch("reverse", 0);
    expect(
      [...engine.outlets]
        .reverse()
        .find((args) => args[0] === "ui" && args[1] === "transforms")
        ?.slice(2),
    ).toEqual([0, 0]);
    engine.outlets.length = 0;
    engine.dispatch("note", 60, 100, 1);
    expect(
      engine.outlets
        .filter((args) => args[0] === "event" && Number(args[2]) > 0)
        .map((args) => args[1]),
    ).toEqual([60, 62, 64, 67, 65, 62, 60]);
    const restoredPreviewRaw = [...engine.outlets]
      .reverse()
      .find((args) => args[0] === "ui" && args[1] === "preview")?.[2];
    const restoredPreview = JSON.parse(decodeURIComponent(String(restoredPreviewRaw))) as {
      notes: Array<{ pitch: number }>;
    };
    expect(restoredPreview.notes.map(({ pitch }) => pitch)).toEqual([60, 62, 64, 67, 65, 62, 60]);
    expect(engine.errors).toEqual([]);
  });

  it("begin_edit clones builtins and edit_motif updates editable properties", async () => {
    const engine = await createEngine();
    engine.dispatch("initialize");
    engine.dispatch("motif", "Chromatic Turn");
    engine.outlets.length = 0;
    engine.dispatch("begin_edit");
    engine.dispatch("edit_motif", { name: "My Lick", description: "Edited blurb" });

    const lib = lastLibState(engine.outlets);
    expect(lib, "lib state must be emitted after edit_motif").toBeTruthy();
    const selected = lib!["selected"] as Record<string, unknown>;
    expect(selected).toBeTruthy();
    expect(String(selected["name"])).toBe("My Lick");
    expect(String(selected["description"]).includes("Edited")).toBeTruthy();
  });

  it("edit_note_at requires an explicit edit session and updates pitch", async () => {
    const engine = await createEngine();
    engine.dispatch("initialize");
    engine.dispatch("motif", "Chromatic Turn");
    engine.outlets.length = 0;
    engine.dispatch("begin_edit");
    engine.dispatch(
      "lib_action",
      encodeURIComponent(
        JSON.stringify({
          type: "edit_note_at",
          index: 0,
          field: "pitch",
          value: 7,
        }),
      ),
    );

    expect(!engine.errors.some((message) => message.includes("Unknown message"))).toBeTruthy();
    const edited = engine.outlets.find((args) => args[0] === "status" && args[1] === "note-edited");
    expect(edited).toBeTruthy();
    expect(edited![3]).toBe("pitch");
    expect(edited![4]).toBe(7);

    // lib state should reflect the updated pitch value
    const lib = lastLibState(engine.outlets);
    expect(lib, "lib state must be emitted after edit_note_at").toBeTruthy();
    const notes = (lib!["selected"] as Record<string, unknown>)?.["notes"] as Array<
      Record<string, number>
    >;
    expect(notes, "selected notes must be present").toBeTruthy();
    expect(notes[0]?.["pitch"]).toBe(7);
  });

  it("import_clip uses the documented LiveAPI constructor and full get_notes_extended pitch span", async () => {
    const constructorCalls: Array<[((args: unknown[]) => void) | undefined, string | undefined]> =
      [];
    const methodCalls: Array<[string, ...unknown[]]> = [];

    class MockLiveAPI {
      id: number;
      constructor(callback?: (args: unknown[]) => void, path?: string) {
        constructorCalls.push([callback, path]);
        this.id = path?.includes("detail_clip") ? 99 : 0;
      }
      get(property: string): number {
        if (property === "is_midi_clip") {
          return 1;
        }
        return 0;
      }
      getstring(property: string): string {
        return property === "name" ? "Clip Phrase" : "";
      }
      call(method: string, ...args: unknown[]): unknown {
        methodCalls.push([method, ...args]);
        if (method === "get_notes_extended") {
          return JSON.stringify({
            notes: [
              { pitch: 60, start_time: 0, duration: 0.5, velocity: 100, mute: 0 },
              { pitch: 63, start_time: 0.5, duration: 0.5, velocity: 90, mute: 0 },
            ],
          });
        }
        return [];
      }
    }

    const engine = await createEngine({ liveApi: MockLiveAPI, folders: { "/Motifs": [] } });
    engine.dispatch("library_path", "/Motifs");
    engine.dispatch("initialize");
    engine.dispatch("song_context", "root_note", 2);
    engine.dispatch("song_context", "scale_name", "Minor");
    engine.dispatch("song_context", "scale_intervals", 0, 2, 3, 5, 7, 8, 10);
    engine.outlets.length = 0;
    engine.dispatch("import_clip");

    expect(!engine.errors.some((message) => message.includes("No clip selected"))).toBeTruthy();
    const status = engine.outlets.find(
      (args) => args[0] === "status" && args[1] === "imported-clip",
    );
    expect(status).toBeTruthy();
    expect(status![3]).toBe(2);

    const lib = lastLibState(engine.outlets);
    expect(lib, "lib state must be emitted after import_clip").toBeTruthy();
    const selected = lib!["selected"] as Record<string, unknown>;
    expect(selected, "selected motif must be present after import").toBeTruthy();
    expect(String(selected["name"])).toBe("Clip Phrase");
    expect(selected["pitchMode"]).toBe("chromatic");
    expect(selected["sourcePitchContext"]).toEqual({
      anchorPitch: 60,
      scaleRootNote: 2,
      scaleName: "Minor",
      scaleIntervals: [0, 2, 3, 5, 7, 8, 10],
    });
    expect((lib!["actions"] as Record<string, unknown>)["canSave"]).toBe(true);
    expect(constructorCalls[0]).toEqual([undefined, "live_set view detail_clip"]);
    expect(methodCalls[0]).toEqual(["get_notes_extended", 0, 128, 0, 4096]);
  });

  it("import_clip parses get_notes_extended JSON strings from LiveAPI", async () => {
    class MockLiveAPI {
      id: number;
      constructor(_callback?: (args: unknown[]) => void, path?: string) {
        this.id = path?.includes("detail_clip") ? 42 : 0;
      }
      get(property: string): number {
        if (property === "is_midi_clip") {
          return 1;
        }
        return 0;
      }
      getstring(property: string): string {
        return property === "name" ? "JSON Clip" : "";
      }
      call(method: string): unknown {
        if (method === "get_notes_extended") {
          return JSON.stringify({
            notes: [
              { pitch: 60, start_time: 0, duration: 0.25, velocity: 100, mute: 0 },
              { pitch: 62, start_time: 0.25, duration: 0.25, velocity: 96, mute: 0 },
            ],
          });
        }
        return [];
      }
    }

    const engine = await createEngine({ liveApi: MockLiveAPI, folders: { "/Motifs": [] } });
    engine.dispatch("library_path", "/Motifs");
    engine.dispatch("initialize");
    engine.outlets.length = 0;
    engine.dispatch("import_clip");

    const status = engine.outlets.find(
      (args) => args[0] === "status" && args[1] === "imported-clip",
    );
    expect(status).toBeTruthy();
    expect(status![3]).toBe(2);
  });

  it("requires a loaded Library folder before creating an imported draft", async () => {
    class MockLiveAPI {
      id: number;
      constructor(_callback?: (args: unknown[]) => void, path?: string) {
        this.id = path?.includes("detail_clip") ? 42 : 0;
      }
      get(property: string): number {
        return property === "is_midi_clip" ? 1 : 0;
      }
      getstring(property: string): string {
        return property === "name" ? "Unsavable Clip" : "";
      }
      call(): unknown {
        throw new Error("notes must not be read without a save destination");
      }
    }

    const engine = await createEngine({ liveApi: MockLiveAPI, folders: { "/Motifs": [] } });
    engine.dispatch("import_clip");

    const lib = lastLibState(engine.outlets);
    expect(lib).toBeTruthy();
    expect(lib!["alert"]).toEqual({
      id: 1,
      title: "Library folder required",
      message:
        "Choose a valid Library folder before importing a clip so the new motif can be saved.",
    });
    expect((lib!["editing"] as Record<string, unknown>)["active"]).toBe(false);
    expect(
      !engine.outlets.some((args) => args[0] === "status" && args[1] === "imported-clip"),
    ).toBeTruthy();
  });

  it("rejects oversized MIDI clips with an actionable Library warning before creating a large payload", async () => {
    class MockLiveAPI {
      id: number;
      constructor(_callback?: (args: unknown[]) => void, path?: string) {
        this.id = path?.includes("detail_clip") ? 88 : 0;
      }
      get(property: string): number {
        return property === "is_midi_clip" ? 1 : 0;
      }
      getstring(property: string): string {
        return property === "name" ? "Oversized Clip" : "";
      }
      call(method: string): unknown {
        if (method !== "get_notes_extended") {
          return [];
        }
        return JSON.stringify({
          notes: Array.from({ length: 513 }, (_, index) => ({
            pitch: 60 + (index % 12),
            start_time: index * 0.25,
            duration: 0.25,
            velocity: 100,
            mute: 0,
          })),
        });
      }
    }

    const engine = await createEngine({ liveApi: MockLiveAPI, folders: { "/Motifs": [] } });
    engine.dispatch("library_path", "/Motifs");
    engine.dispatch("initialize");
    engine.outlets.length = 0;
    engine.dispatch("import_clip");

    expect(
      !engine.outlets.some((args) => args[0] === "status" && args[1] === "imported-clip"),
    ).toBeTruthy();
    const lib = lastLibState(engine.outlets);
    expect(lib).toBeTruthy();
    expect(lib!["alert"]).toEqual({
      id: 1,
      title: "MIDI file is too long",
      message:
        "The selected MIDI clip contains 513 notes. Motif can import up to 512 editable notes. Shorten the clip or split it into smaller phrases, then import it again.",
    });
    expect((lib!["selected"] as Record<string, unknown>)["id"]).toBe("scale-turn");
    expect(
      engine.errors.some(
        (message) =>
          message.includes("MIDI clip contains 513 notes") && message.includes("up to 512"),
      ),
    ).toBeTruthy();
  });

  it("imports exactly 512 notes using bounded chunks for one scrollable Library table", async () => {
    class MockLiveAPI {
      id: number;
      constructor(_callback?: (args: unknown[]) => void, path?: string) {
        this.id = path?.includes("detail_clip") ? 89 : 0;
      }
      get(property: string): number {
        return property === "is_midi_clip" ? 1 : 0;
      }
      getstring(property: string): string {
        return property === "name" ? "Full Length Clip" : "";
      }
      call(method: string): unknown {
        if (method !== "get_notes_extended") {
          return [];
        }
        return JSON.stringify({
          notes: Array.from({ length: 512 }, (_, index) => ({
            pitch: 60 + (index % 12),
            start_time: index * 0.25,
            duration: 0.25,
            velocity: 100,
            mute: 0,
          })),
        });
      }
    }

    const engine = await createEngine({ liveApi: MockLiveAPI, folders: { "/Motifs": [] } });
    engine.dispatch("library_path", "/Motifs");
    engine.dispatch("import_clip");

    expect(
      engine.outlets.some(
        (args) => args[0] === "status" && args[1] === "imported-clip" && args[3] === 512,
      ),
    ).toBeTruthy();
    const selected = lastLibState(engine.outlets)?.["selected"] as Record<string, unknown>;
    expect(selected["noteCount"]).toBe(512);
    expect(selected["noteLimit"]).toBe(512);
    expect((selected["notes"] as unknown[]).length).toBe(512);

    const chunks = engine.outlets
      .filter((args) => args[0] === "ui" && args[1] === "lib" && typeof args[2] === "string")
      .map((args) => JSON.parse(decodeURIComponent(String(args[2]))) as Record<string, unknown>)
      .filter((payload) => payload["kind"] === "state-chunk");
    expect(chunks.length > 1).toBeTruthy();
    expect(
      engine.outlets
        .filter((args) => args[0] === "ui" && args[1] === "lib" && typeof args[2] === "string")
        .every((args) => String(args[2]).length < 6_000),
    ).toBeTruthy();
  });

  function userMotif(id: string, name: string, pitch = 0): Record<string, unknown> {
    return {
      schemaVersion: 1,
      id,
      name,
      description: `${name} description`,
      pitchMode: "chromatic",
      sourcePitchContext: {
        anchorPitch: 60,
        scaleRootNote: 0,
        scaleName: "Major",
        scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
      },
      sourceMeter: { numerator: 4, denominator: 4 },
      length: 480,
      notes: [{ at: 0, duration: 480, pitch }],
    };
  }

  it("import_clip defaults to exact chromatic offsets", async () => {
    class MockLiveAPI {
      id: number;
      constructor(_callback?: (args: unknown[]) => void, path?: string) {
        this.id = path?.includes("detail_clip") ? 77 : 0;
      }
      get(property: string): number {
        if (property === "is_midi_clip") {
          return 1;
        }
        return 0;
      }
      getstring(property: string): string {
        return property === "name" ? "Descending Clip" : "";
      }
      call(method: string): unknown {
        if (method === "get_notes_extended") {
          return JSON.stringify({
            notes: [
              { pitch: 60, start_time: 0, duration: 1, velocity: 127, mute: 0 },
              { pitch: 58, start_time: 1, duration: 0.5, velocity: 127, mute: 0 },
            ],
          });
        }
        return [];
      }
    }

    const engine = await createEngine({ liveApi: MockLiveAPI, folders: { "/Motifs": [] } });
    engine.dispatch("library_path", "/Motifs");
    engine.dispatch("initialize");
    engine.outlets.length = 0;
    engine.dispatch("import_clip");

    const lib = lastLibState(engine.outlets);
    expect(lib).toBeTruthy();
    const selected = lib!["selected"] as Record<string, unknown>;
    expect(selected["pitchMode"]).toBe("chromatic");
    const notes = selected["notes"] as Array<Record<string, unknown>>;
    expect(notes.map((note) => note["pitch"])).toEqual([0, -2]);
  });

  it("changing a hybrid motif to chromatic re-encodes pitches instead of reinterpreting them", async () => {
    const engine = await createEngine();
    engine.dispatch("song_context", "root_note", 0);
    engine.dispatch("song_context", "scale_intervals", 0, 2, 3, 5, 7, 8, 10);
    engine.dispatch("motif", "Chromatic Turn");
    engine.dispatch("begin_edit");
    engine.dispatch("edit_motif", {
      pitchMode: "hybrid",
    });
    engine.dispatch("edit_note_at", 1, "pitch", -1);
    engine.dispatch("edit_note_at", 1, "accidental", null);
    engine.dispatch("edit_motif", {
      pitchMode: "chromatic",
    });

    const lib = lastLibState(engine.outlets);
    expect(lib).toBeTruthy();
    const selected = lib!["selected"] as Record<string, unknown>;
    expect(selected["pitchMode"]).toBe("chromatic");
    const notes = selected["notes"] as Array<Record<string, unknown>>;
    expect(notes[1]?.["pitch"]).toBe(2);
    expect(notes[1]?.["accidental"]).toBe(null);
  });

  it("chosen library folder loads immediately, including paths with spaces", async () => {
    const path = "/Users/test/Motif Library";
    const files = {
      [`${path}/alpha.json`]: JSON.stringify(userMotif("user-alpha", "Shared Name", 1)),
      [`${path}/beta.json`]: JSON.stringify(userMotif("user-beta", "Shared Name", 2)),
    };
    const engine = await createEngine({ files, folders: { [path]: ["alpha.json", "beta.json"] } });

    engine.dispatch("initialize");
    engine.outlets.length = 0;
    engine.dispatch("library_path", "/Users/test/Motif", "Library");

    const lib = lastLibState(engine.outlets);
    expect(lib).toBeTruthy();
    expect(lib!["libraryPath"]).toBe(path);
    expect(lib!["libraryLoaded"]).toBe(true);
    const items = lib!["items"] as Array<{ id: string; name: string; showId: boolean }>;
    expect(items.some((item) => item.id === "user-alpha")).toBeTruthy();
    expect(items.some((item) => item.id === "user-beta")).toBeTruthy();
    expect(
      items.filter((item) => item.name === "Shared Name").every((item) => item.showId),
    ).toBeTruthy();
  });

  it("transports the reported Chrono Trigger motif sizes without an oversized-MIDI warning", async () => {
    const path = "/Users/test/Motif Library/Chrono Trigger";
    const motifs = [
      ["chrono-trigger-a-strange-happening-arp-1", 32],
      ["chrono-trigger-a-premonition-harp-strum", 32],
      ["chrono-trigger-a-premonition-timpani-roll", 37],
    ] as const;
    const files: Record<string, string> = {};
    const filenames: string[] = [];
    for (const [id, noteCount] of motifs) {
      const filename = `${id}.json`;
      filenames.push(filename);
      files[`${path}/${filename}`] = JSON.stringify({
        ...userMotif(id, id),
        length: noteCount * 240,
        notes: Array.from({ length: noteCount }, (_, index) => ({
          at: index * 240,
          duration: 240,
          pitch: -(index % 6),
          velocity: 50 + (index % 61),
        })),
      });
    }
    const engine = await createEngine({ files, folders: { [path]: filenames } });
    engine.dispatch("library_path", path);

    for (const [id, noteCount] of motifs) {
      engine.outlets.length = 0;
      engine.dispatch("select_browser", id);
      const state = lastLibState(engine.outlets);
      expect(state).toBeTruthy();
      expect((state!["selected"] as Record<string, unknown>)["noteCount"]).toBe(noteCount);
      expect(((state!["selected"] as Record<string, unknown>)["notes"] as unknown[]).length).toBe(
        noteCount,
      );
      expect(state!["alert"]).toBe(null);
      expect(
        engine.outlets
          .filter((args) => args[0] === "ui" && args[1] === "lib" && typeof args[2] === "string")
          .every((args) => String(args[2]).length < 6_000),
      ).toBeTruthy();
    }
  });

  it("preserves ordinary note lists for the single scrollable Library table", async () => {
    const path = "/Motifs";
    const notes = Array.from({ length: 24 }, (_, index) => ({
      at: index * 120,
      duration: 120,
      pitch: index % 12,
    }));
    const motif = {
      ...userMotif("large-playback-motif", "Large Playback Motif"),
      length: notes.length * 120,
      notes,
    };
    const engine = await createEngine({
      files: { [`${path}/large.json`]: JSON.stringify(motif) },
      folders: { [path]: ["large.json"] },
    });
    engine.dispatch("library_path", path);
    engine.dispatch("select_browser", "large-playback-motif");

    const lib = lastLibState(engine.outlets);
    expect(lib).toBeTruthy();
    const selected = lib!["selected"] as Record<string, unknown>;
    expect(selected["noteCount"]).toBe(24);
    expect(selected["noteLimit"]).toBe(512);
    expect((selected["notes"] as unknown[]).length).toBe(24);
    expect(String(selected["previewBars"])).toMatch(/^[\d.]+$/);
    expect((selected["notes"] as Array<Record<string, unknown>>)[16]?.["pitch"]).toBe(4);
  });

  it("recursively loads, groups, and searches motifs in sub-directories", async () => {
    const path = "/Users/test/Motif Library";
    const files = {
      [`${path}/loose.json`]: JSON.stringify(userMotif("loose", "Loose Motif")),
      [`${path}/Bass/bass.json`]: JSON.stringify(userMotif("bass-line", "Bass Line")),
      [`${path}/Bass/Fills/fill.JSON`]: JSON.stringify(userMotif("bass-fill", "Turnaround")),
      [`${path}/Bass/notes.txt`]: "not a motif",
    };
    const folders = {
      [path]: ["loose.json", "Bass", "Empty"],
      [`${path}/Bass`]: ["bass.json", "Fills", "notes.txt"],
      [`${path}/Bass/Fills`]: ["fill.JSON"],
      [`${path}/Empty`]: [],
    };
    const engine = await createEngine({ files, folders });

    engine.dispatch("library_path", path);
    let lib = lastLibState(engine.outlets);
    expect(lib).toBeTruthy();
    const items = lib!["items"] as Array<{ id: string; folder: string }>;
    expect(items.find((item) => item.id === "loose")?.folder).toBe("Library");
    expect(items.find((item) => item.id === "bass-line")?.folder).toBe("Bass");
    expect(items.find((item) => item.id === "bass-fill")?.folder).toBe("Bass/Fills");
    expect(items.find((item) => item.id === "chromatic-turn")?.folder).toBe("Library");
    expect(!engine.errors.some((message) => message.includes("notes.txt"))).toBeTruthy();
    expect(engine.folderOpenPaths).toEqual([
      path,
      `${path}/Bass`,
      `${path}/Empty`,
      `${path}/Bass/Fills`,
    ]);

    engine.dispatch("filter_motifs", "bass/fills");
    lib = lastLibState(engine.outlets);
    expect(lib).toBeTruthy();
    expect((lib!["items"] as Array<{ id: string }>).map((item) => item.id)).toEqual(["bass-fill"]);
  });

  it("scans large libraries in bounded Task batches without replacing the active library early", async () => {
    const path = "/Large Library";
    const filenames = Array.from({ length: 100 }, (_, index) => `motif-${index}.json`);
    const files = Object.fromEntries(
      filenames.map((filename, index) => [
        `${path}/${filename}`,
        JSON.stringify(userMotif(`large-${index}`, `Large ${index}`)),
      ]),
    );
    const engine = await createEngine({
      files,
      folders: { [path]: filenames },
      deferTasks: true,
    });

    engine.dispatch("library_path", path);
    let lib = lastLibState(engine.outlets);
    expect(lib).toBeTruthy();
    expect(lib!["libraryScanning"]).toBe(true);
    expect(lib!["libraryLoaded"]).toBe(false);
    expect(
      (lib!["items"] as Array<{ id: string }>).some((item) => item.id === "scale-turn"),
      "the active library must remain available while the replacement scan is pending",
    ).toBeTruthy();
    expect((lib!["items"] as Array<{ id: string }>).some((item) => item.id === "large-0")).toBe(
      false,
    );

    expect(engine.runScheduledTasks(1)).toBe(1);
    lib = lastLibState(engine.outlets);
    expect(lib).toBeTruthy();
    expect(lib!["libraryScanning"]).toBe(true);

    engine.dispatch("begin_edit");
    lib = lastLibState(engine.outlets);
    expect(lib).toBeTruthy();
    expect((lib!["editing"] as Record<string, unknown>)["active"]).toBe(false);
    expect(engine.errors.some((message) => message.includes("scan to finish"))).toBeTruthy();

    engine.dispatch("filter_motifs", "scale");
    lib = lastLibState(engine.outlets);
    expect(lib).toBeTruthy();
    expect(lib!["libraryScanning"]).toBe(true);

    expect(engine.runScheduledTasks() >= 1).toBeTruthy();
    lib = lastLibState(engine.outlets);
    expect(lib).toBeTruthy();
    expect(lib!["libraryScanning"]).toBe(false);
    expect(lib!["libraryLoaded"]).toBe(true);
    expect(
      (lib!["items"] as Array<{ id: string }>).filter((item) => item.id.startsWith("large-"))
        .length,
    ).toBe(0);
    engine.dispatch("filter_motifs");
    lib = lastLibState(engine.outlets);
    expect(lib).toBeTruthy();
    expect(
      (lib!["items"] as Array<{ id: string }>).filter((item) => item.id.startsWith("large-"))
        .length,
    ).toBe(100);
    expect(engine.folderOpenPaths).toEqual([path]);
  });

  it("saves an edited motif back to its original sub-directory", async () => {
    const path = "/Motifs";
    const nestedFilename = `${path}/Leads/Arps/nested.json`;
    const files = {
      [nestedFilename]: JSON.stringify(userMotif("nested-motif", "Nested Motif")),
    };
    const engine = await createEngine({
      files,
      folders: {
        [path]: ["Leads"],
        [`${path}/Leads`]: ["Arps"],
        [`${path}/Leads/Arps`]: ["nested.json"],
      },
    });
    engine.dispatch("library_path", path);
    engine.dispatch("select_browser", "nested-motif");
    engine.dispatch("begin_edit");
    engine.dispatch("save_motif", { name: "Nested Motif Updated" });

    expect(
      (JSON.parse(engine.files[nestedFilename] ?? "{}") as Record<string, unknown>)["name"],
    ).toBe("Nested Motif Updated");
    expect(engine.files[`${path}/nested-motif.json`]).toBe(undefined);
    const selected = lastLibState(engine.outlets)?.["selected"] as Record<string, unknown>;
    expect(selected["folder"]).toBe("Leads/Arps");
  });

  it("reports duplicate motif ids with their relative sub-directory paths", async () => {
    const path = "/Motifs";
    const engine = await createEngine({
      files: {
        [`${path}/A/first.json`]: JSON.stringify(userMotif("duplicate-nested", "First")),
        [`${path}/B/second.json`]: JSON.stringify(userMotif("duplicate-nested", "Second")),
      },
      folders: {
        [path]: ["A", "B"],
        [`${path}/A`]: ["first.json"],
        [`${path}/B`]: ["second.json"],
      },
    });
    engine.dispatch("library_path", path);

    const items = lastLibState(engine.outlets)?.["items"] as Array<{ id: string }>;
    expect(items.filter((item) => item.id === "duplicate-nested").length).toBe(1);
    expect(
      engine.errors.some(
        (message) => message.includes("B/second.json") && message.includes("duplicate motif id"),
      ),
    ).toBeTruthy();
  });

  it("assigns, reassigns, and removes MIDI hot keys through library actions", async () => {
    const engine = await createEngine();
    engine.dispatch("initialize");
    engine.outlets.length = 0;

    engine.dispatch(
      "lib_action",
      encodeURIComponent(
        JSON.stringify({
          type: "map_trigger",
          pitch: 20,
          motifId: "chromatic-turn",
        }),
      ),
    );
    let lib = lastLibState(engine.outlets);
    let items = lib?.["items"] as Array<{
      id: string;
      hotkeys: Array<{ pitch: number; action: string }>;
    }>;
    expect(items.find((item) => item.id === "chromatic-turn")?.hotkeys).toEqual([
      { pitch: 20, action: "trigger", label: "G♯-1" },
    ]);

    engine.outlets.length = 0;
    engine.dispatch("note", 20, 100, 1);
    expect(
      engine.outlets.some(
        (args) =>
          args[0] === "status" &&
          args[1] === "trigger" &&
          args[2] === "chromatic-turn" &&
          args[3] === 20,
      ),
      "a mapped note outside the trigger zone must play its assigned motif",
    ).toBeTruthy();

    engine.dispatch(
      "lib_action",
      encodeURIComponent(
        JSON.stringify({
          type: "map_trigger",
          pitch: 20,
          motifId: "scale-turn",
        }),
      ),
    );
    lib = lastLibState(engine.outlets);
    expect(lib).toBeTruthy();
    items = lib?.["items"] as Array<{
      id: string;
      hotkeys: Array<{ pitch: number; action: string }>;
    }>;
    expect(items.find((item) => item.id === "chromatic-turn")?.hotkeys).toEqual([]);
    expect(items.find((item) => item.id === "scale-turn")?.hotkeys).toEqual([
      { pitch: 20, action: "trigger", label: "G♯-1" },
    ]);
    expect((lib!["selected"] as Record<string, unknown>)["hotkeys"]).toEqual([
      { pitch: 20, action: "trigger", label: "G♯-1" },
    ]);

    engine.dispatch(
      "lib_action",
      encodeURIComponent(
        JSON.stringify({
          type: "unmap_trigger",
          pitch: 20,
        }),
      ),
    );
    lib = lastLibState(engine.outlets);
    items = lib?.["items"] as Array<{
      id: string;
      hotkeys: Array<{ pitch: number; action: string }>;
    }>;
    expect(items.find((item) => item.id === "scale-turn")?.hotkeys).toEqual([]);

    engine.outlets.length = 0;
    engine.dispatch("note", 20, 100, 1);
    expect(
      !engine.outlets.some((args) => args[0] === "status" && args[1] === "trigger"),
    ).toBeTruthy();
    expect(
      engine.outlets.some((args) => args[0] === "event" && args[1] === 20 && args[2] === 100),
      "an unmapped note outside the trigger zone must return to dry pass-through",
    ).toBeTruthy();
  });

  it("select-mode MIDI hot keys change the motif used by later trigger notes without playing immediately", async () => {
    const engine = await createEngine();
    engine.dispatch("initialize");
    engine.dispatch(
      "lib_action",
      encodeURIComponent(
        JSON.stringify({
          type: "map_trigger",
          pitch: "G♯-1",
          motifId: "chromatic-turn",
          action: "select",
        }),
      ),
    );

    let lib = lastLibState(engine.outlets);
    expect(lib).toBeTruthy();
    const chromatic = (
      lib!["items"] as Array<{
        id: string;
        hotkeys: Array<{ pitch: number; action: string }>;
      }>
    ).find((item) => item.id === "chromatic-turn");
    expect(chromatic?.hotkeys).toEqual([{ pitch: 20, action: "select", label: "G♯-1" }]);
    expect((lib!["selected"] as Record<string, unknown>)["id"]).toBe("scale-turn");

    engine.outlets.length = 0;
    engine.dispatch("note", 20, 100, 1);
    lib = lastLibState(engine.outlets);
    expect(lib).toBeTruthy();
    expect((lib!["selected"] as Record<string, unknown>)["id"]).toBe("chromatic-turn");
    expect(
      engine.outlets.some(
        (args) =>
          args[0] === "status" &&
          args[1] === "selected" &&
          args[2] === "chromatic-turn" &&
          args[3] === 20,
      ),
    ).toBeTruthy();
    expect(
      !engine.outlets.some((args) => args[0] === "status" && args[1] === "trigger"),
    ).toBeTruthy();
    expect(
      !engine.outlets.some((args) => args[0] === "event"),
      "selection must not play a phrase",
    ).toBeTruthy();

    engine.outlets.length = 0;
    engine.dispatch("note", 60, 100, 1);
    expect(
      engine.outlets.some(
        (args) => args[0] === "status" && args[1] === "trigger" && args[2] === "chromatic-turn",
      ),
      "a later zone note must trigger the newly selected motif",
    ).toBeTruthy();
  });

  it("global hold-repeat mode loops trigger-zone notes at motif boundaries until note-off", async () => {
    const engine = await createEngine({ deferTasks: true });
    engine.dispatch("initialize");
    engine.dispatch("trigger_mode", "hold-repeat");

    engine.outlets.length = 0;
    engine.dispatch("note", 60, 96, 2);
    expect(
      engine.outlets.filter(
        (args) => args[0] === "status" && args[1] === "trigger" && args[2] === "scale-turn",
      ).length,
    ).toBe(1);
    expect(
      engine.outlets.some(
        (args) =>
          args[0] === "status" &&
          args[1] === "repeat-started" &&
          args[2] === "scale-turn" &&
          args[3] === 60,
      ),
    ).toBeTruthy();
    expect(engine.scheduledTaskDelays[engine.scheduledTaskDelays.length - 1]).toBe(1_875);

    engine.dispatch("note", 60, 80, 2);
    expect(engine.scheduledTaskDelays.length).toBe(1);

    const libraryUpdatesBeforeRepeat = engine.outlets.filter(
      (args) => args[0] === "ui" && args[1] === "lib",
    ).length;
    expect(engine.runScheduledTasks(1)).toBe(1);
    expect(
      engine.outlets.filter(
        (args) => args[0] === "status" && args[1] === "trigger" && args[2] === "scale-turn",
      ).length,
    ).toBe(2);
    expect(engine.scheduledTaskDelays[engine.scheduledTaskDelays.length - 1]).toBe(2_000);
    expect(engine.outlets.filter((args) => args[0] === "ui" && args[1] === "lib").length).toBe(
      libraryUpdatesBeforeRepeat,
    );

    engine.dispatch("note", 60, 0, 2);
    expect(
      engine.outlets.some(
        (args) =>
          args[0] === "status" &&
          args[1] === "repeat-stopped" &&
          args[2] === "scale-turn" &&
          args[3] === 60,
      ),
    ).toBeTruthy();
    engine.outlets.length = 0;
    engine.runScheduledTasks();
    expect(
      !engine.outlets.some((args) => args[0] === "status" && args[1] === "trigger"),
      "a canceled task already queued by Max must not launch another cycle",
    ).toBeTruthy();

    engine.dispatch("note", 60, 96, 2);
    engine.dispatch("trigger_mode", "one-shot");
    engine.outlets.length = 0;
    engine.runScheduledTasks();
    expect(
      !engine.outlets.some((args) => args[0] === "status" && args[1] === "trigger"),
      "leaving hold-repeat in Settings must cancel its pending cycle",
    ).toBeTruthy();
  });

  it("global hold-repeat applies to Trigger hot keys, sustain, and panic cleanup", async () => {
    const engine = await createEngine({ deferTasks: true });
    engine.dispatch("map_trigger", 20, "chromatic-turn", "trigger");
    engine.dispatch("trigger_mode", "hold-repeat");
    engine.dispatch("note", 20, 100, 1);
    engine.dispatch("sustain", 127, 1);
    engine.dispatch("note", 20, 0, 1);

    engine.outlets.length = 0;
    expect(engine.runScheduledTasks(1)).toBe(1);
    expect(
      engine.outlets.some(
        (args) => args[0] === "status" && args[1] === "trigger" && args[2] === "chromatic-turn",
      ),
      "sustain must defer stopping the Trigger hot key repeat",
    ).toBeTruthy();

    engine.dispatch("sustain", 0, 1);
    expect(
      engine.outlets.some((args) => args[0] === "status" && args[1] === "repeat-stopped"),
    ).toBeTruthy();
    engine.outlets.length = 0;
    engine.runScheduledTasks();
    expect(
      !engine.outlets.some((args) => args[0] === "status" && args[1] === "trigger"),
    ).toBeTruthy();

    engine.dispatch("note", 20, 100, 1);
    const outletsBeforePanic = engine.outlets.length;
    engine.dispatch("panic");
    const panicOutlets = engine.outlets.slice(outletsBeforePanic);
    expect(panicOutlets.filter((args) => args[0] === "panic").length).toBe(1);
    expect(panicOutlets.filter((args) => args[0] === "clear").length).toBe(0);
    engine.outlets.length = 0;
    engine.runScheduledTasks();
    expect(
      !engine.outlets.some((args) => args[0] === "status" && args[1] === "trigger"),
      "panic must cancel every pending repeat task",
    ).toBeTruthy();
  });

  it("uses motif-owned trigger mode and repeat rounding unless Settings override them", async () => {
    const path = "/Performance Motifs";
    const motif = {
      ...userMotif("self-repeating", "Self Repeating"),
      triggerMode: "hold-repeat",
      repeatRounding: "1-bar",
    };
    const engine = await createEngine({
      files: { [`${path}/self-repeating.json`]: JSON.stringify(motif) },
      folders: { [path]: ["self-repeating.json"] },
      deferTasks: true,
    });
    engine.dispatch("library_path", path);
    engine.runScheduledTasks();
    engine.dispatch("motif", "self-repeating");

    engine.dispatch("note", 60, 100, 1);
    expect(engine.scheduledTaskDelays[engine.scheduledTaskDelays.length - 1]).toBe(1_875);
    engine.dispatch("note", 60, 0, 1);

    engine.dispatch("trigger_mode", "one-shot");
    const taskCount = engine.scheduledTaskDelays.length;
    engine.dispatch("note", 61, 100, 1);
    expect(engine.scheduledTaskDelays.length).toBe(taskCount);
  });

  it("rejects invalid hot-key assignments and prunes mappings for removed library motifs", async () => {
    const path = "/Motifs";
    const filename = `${path}/temporary.json`;
    const folders = { [path]: ["temporary.json"] };
    const engine = await createEngine({
      files: { [filename]: JSON.stringify(userMotif("temporary", "Temporary")) },
      folders,
    });
    engine.dispatch("library_path", path);
    engine.dispatch("map_trigger", Number.NaN, "temporary");
    engine.dispatch("map_trigger", 12, "missing");
    engine.dispatch("map_trigger", 12, "temporary", "invalid-action");
    engine.dispatch("map_trigger", 13, "temporary", "repeat");
    expect(engine.errors.some((message) => message.includes("invalid MIDI note"))).toBeTruthy();
    expect(engine.errors.some((message) => message.includes("unknown motif"))).toBeTruthy();
    expect(
      engine.errors.some((message) => message.includes("unknown hot-key action")),
    ).toBeTruthy();
    expect(
      engine.errors.some((message) => message.includes("unknown hot-key action repeat")),
    ).toBeTruthy();

    engine.dispatch("map_trigger", 12, "temporary");
    folders[path] = [];
    engine.dispatch("refresh_library");

    const lib = lastLibState(engine.outlets);
    expect(lib).toBeTruthy();
    expect(
      !(lib!["items"] as Array<{ id: string }>).some((item) => item.id === "temporary"),
    ).toBeTruthy();
    engine.outlets.length = 0;
    engine.dispatch("note", 12, 100, 1);
    expect(
      !engine.outlets.some((args) => args[0] === "status" && args[1] === "trigger"),
    ).toBeTruthy();
  });

  it("same-name saved motifs remain independently selectable by stable id", async () => {
    const path = "/Motifs";
    const files = {
      [`${path}/alpha.json`]: JSON.stringify(userMotif("user-alpha", "Same Name", 1)),
      [`${path}/beta.json`]: JSON.stringify(userMotif("user-beta", "Same Name", 2)),
    };
    const engine = await createEngine({ files, folders: { [path]: ["alpha.json", "beta.json"] } });
    engine.dispatch("library_path", path);

    engine.dispatch("select_browser", "user-beta");
    let lib = lastLibState(engine.outlets);
    expect((lib?.["selected"] as Record<string, unknown>)?.["id"]).toBe("user-beta");

    engine.dispatch("select_browser", "user-alpha");
    lib = lastLibState(engine.outlets);
    expect((lib?.["selected"] as Record<string, unknown>)?.["id"]).toBe("user-alpha");
  });

  it("save writes the unique id file and exits edit mode", async () => {
    const path = "/Motifs";
    const engine = await createEngine({ folders: { [path]: [] } });
    engine.dispatch("library_path", path);
    engine.dispatch("motif", "Chromatic Turn");
    engine.dispatch("begin_edit");

    let lib = lastLibState(engine.outlets);
    const draftId = String((lib?.["selected"] as Record<string, unknown>)?.["id"]);
    expect(draftId).not.toBe("chromatic-turn");
    expect((lib?.["editing"] as Record<string, unknown>)?.["active"]).toBe(true);

    engine.dispatch(
      "lib_action",
      encodeURIComponent(
        JSON.stringify({
          type: "save_motif",
          name: "Chromatic Turn",
          description: "Saved copy",
        }),
      ),
    );

    lib = lastLibState(engine.outlets);
    expect((lib?.["editing"] as Record<string, unknown>)?.["active"]).toBe(false);
    expect((lib?.["selected"] as Record<string, unknown>)?.["id"]).toBe(draftId);
    expect((lib?.["selected"] as Record<string, unknown>)?.["isPersisted"]).toBe(true);
    expect(engine.files[`${path}/${draftId}.json`]).toBeTruthy();
  });

  it("cancel edit restores the original motif and removes a new draft", async () => {
    const engine = await createEngine();
    engine.dispatch("motif", "Chromatic Turn");
    engine.dispatch("begin_edit");
    engine.dispatch("edit_motif", { name: "Temporary Name" });

    const editing = lastLibState(engine.outlets);
    const draftId = String((editing?.["selected"] as Record<string, unknown>)?.["id"]);
    engine.dispatch("cancel_edit");

    const lib = lastLibState(engine.outlets);
    expect((lib?.["editing"] as Record<string, unknown>)?.["active"]).toBe(false);
    expect((lib?.["selected"] as Record<string, unknown>)?.["id"]).toBe("chromatic-turn");
    expect((lib?.["selected"] as Record<string, unknown>)?.["name"]).toBe("Chromatic Turn");
    expect(lib).toBeTruthy();
    expect(
      !(lib!["items"] as Array<{ id: string }>).some((item) => item.id === draftId),
    ).toBeTruthy();
  });

  it("dirty edits block both browser and main-menu selection until explicitly discarded", async () => {
    const engine = await createEngine();
    engine.dispatch("motif", "Chromatic Turn");
    engine.dispatch("begin_edit");
    engine.dispatch("edit_motif", { name: "Dirty Draft" });
    const draftId = String(
      (lastLibState(engine.outlets)?.["selected"] as Record<string, unknown>)?.["id"],
    );

    engine.dispatch("select_browser", "scale-turn");
    let lib = lastLibState(engine.outlets);
    expect((lib?.["selected"] as Record<string, unknown>)?.["id"]).toBe(draftId);

    engine.dispatch("motif", "Scale Turn");
    lib = lastLibState(engine.outlets);
    expect((lib?.["selected"] as Record<string, unknown>)?.["id"]).toBe(draftId);

    engine.dispatch("select_browser", "scale-turn", true);
    lib = lastLibState(engine.outlets);
    expect((lib?.["selected"] as Record<string, unknown>)?.["id"]).toBe("scale-turn");
    expect((lib?.["editing"] as Record<string, unknown>)?.["active"]).toBe(false);
    expect(lib).toBeTruthy();
    expect(
      !(lib!["items"] as Array<{ id: string }>).some((item) => item.id === draftId),
    ).toBeTruthy();
  });

  it("duplicate user ids are skipped without hiding distinct same-name motifs", async () => {
    const path = "/Motifs";
    const engine = await createEngine({
      files: {
        [`${path}/first.json`]: JSON.stringify(userMotif("duplicate-id", "First Name")),
        [`${path}/second.json`]: JSON.stringify(userMotif("duplicate-id", "Second Name")),
        [`${path}/third.json`]: JSON.stringify(userMotif("unique-id", "First Name")),
      },
      folders: { [path]: ["first.json", "second.json", "third.json"] },
    });
    engine.dispatch("library_path", path);

    const lib = lastLibState(engine.outlets);
    const items = lib?.["items"] as Array<{ id: string; name: string; showId: boolean }>;
    expect(items.filter((item) => item.id === "duplicate-id").length).toBe(1);
    expect(items.some((item) => item.id === "unique-id")).toBeTruthy();
    expect(engine.errors.some((message) => message.includes("duplicate motif id"))).toBeTruthy();
  });

  it("editable motif properties and advanced note fields save while data stays untouched", async () => {
    const path = "/Motifs";
    const engine = await createEngine({ folders: { [path]: [] } });
    engine.dispatch("library_path", path);
    engine.dispatch("motif", "Chromatic Turn");
    engine.dispatch("begin_edit");

    const properties = {
      name: "Complete Motif",
      description: "Exercises every editable motif property.",
      pitchMode: "hybrid",
      sourcePitchContext: {
        anchorPitch: 62,
        scaleRootNote: 2,
        scaleName: "Minor",
        scaleIntervals: [0, 2, 3, 5, 7, 8, 10],
      },
      sourceMeter: { numerator: 3, denominator: 8 },
      defaultGate: 0.75,
      velocityCurve: { inputMin: 5, inputMax: 120, outputMin: 20, outputMax: 110, exponent: 1.25 },
    };
    engine.dispatch(
      "lib_action",
      encodeURIComponent(JSON.stringify({ type: "edit_motif", properties })),
    );
    for (const [field, value] of [
      ["velocityOffset", 7],
      ["velocityScale", 0.5],
      ["legato", true],
      ["tie", true],
    ] as const) {
      engine.dispatch(
        "lib_action",
        encodeURIComponent(
          JSON.stringify({
            type: "edit_note_at",
            index: 0,
            field,
            value,
          }),
        ),
      );
    }

    let lib = lastLibState(engine.outlets);
    expect(lib).toBeTruthy();
    let selected = lib!["selected"] as Record<string, unknown>;
    expect(selected["name"]).toBe("Complete Motif");
    expect(selected["pitchMode"]).toBe("hybrid");
    expect(selected["sourcePitchContext"]).toEqual(properties.sourcePitchContext);
    expect(selected["sourceMeter"]).toEqual({ numerator: 3, denominator: 8 });
    expect(selected["defaultGate"]).toBe(0.75);
    expect(selected["velocityCurve"]).toEqual(properties.velocityCurve);
    const notes = selected["notes"] as Array<Record<string, unknown>>;
    expect(notes[0]?.["velocityOffset"]).toBe(7);
    expect(notes[0]?.["velocityScale"]).toBe(0.5);
    expect(notes[0]?.["legato"]).toBe(true);
    expect(notes[0]?.["tie"]).toBe(true);

    const draftId = String(selected["id"]);
    engine.dispatch(
      "lib_action",
      encodeURIComponent(JSON.stringify({ type: "save_motif", properties })),
    );
    lib = lastLibState(engine.outlets);
    expect((lib?.["editing"] as Record<string, unknown>)?.["active"]).toBe(false);
    const saved = JSON.parse(engine.files[`${path}/${draftId}.json`] ?? "{}") as Record<
      string,
      unknown
    >;
    expect(saved["name"]).toBe("Complete Motif");
    expect(saved["velocityCurve"]).toEqual(properties.velocityCurve);
    expect((saved["notes"] as Array<Record<string, unknown>>)[0]?.["legato"]).toBe(true);
  });

  it("optional editable properties can be cleared while existing data is preserved", async () => {
    const path = "/Motifs";
    const filename = `${path}/user-full.json`;
    const original = {
      ...userMotif("user-full", "User Full"),
      defaultGate: 0.8,
      velocityCurve: { outputMin: 20, outputMax: 100, exponent: 1.2 },
    };
    const engine = await createEngine({
      files: { [filename]: JSON.stringify(original) },
      folders: { [path]: ["user-full.json"] },
    });
    engine.dispatch("library_path", path);
    engine.dispatch("select_browser", "user-full");
    engine.dispatch("begin_edit");
    const properties = {
      name: "User Full",
      description: "User Full description",
      pitchMode: "chromatic",
      sourceMeter: { numerator: 4, denominator: 4 },
      defaultGate: null,
      velocityCurve: {
        inputMin: null,
        inputMax: null,
        outputMin: null,
        outputMax: null,
        exponent: null,
      },
    };
    engine.dispatch(
      "lib_action",
      encodeURIComponent(JSON.stringify({ type: "save_motif", properties })),
    );

    const saved = JSON.parse(engine.files[filename] ?? "{}") as Record<string, unknown>;
    expect(!("defaultGate" in saved)).toBeTruthy();
    expect(!("velocityCurve" in saved)).toBeTruthy();
    const selected = lastLibState(engine.outlets)?.["selected"] as Record<string, unknown>;
    expect(selected["defaultGate"]).toBe(null);
    expect(selected["velocityCurve"]).toEqual({
      inputMin: null,
      inputMax: null,
      outputMin: null,
      outputMax: null,
      exponent: null,
    });
  });

  it("invalid property updates are rejected atomically and read-only identity fields cannot change", async () => {
    const engine = await createEngine();
    engine.dispatch("motif", "Chromatic Turn");
    engine.dispatch("begin_edit");
    const before = lastLibState(engine.outlets)?.["selected"] as Record<string, unknown>;
    const draftId = String(before["id"]);

    engine.dispatch(
      "lib_action",
      encodeURIComponent(
        JSON.stringify({
          type: "edit_motif",
          properties: {
            name: "Should Not Apply",
            description: "Still invalid as a whole.",
            pitchMode: "scale",
            sourceMeter: { numerator: 7, denominator: 3 },
          },
        }),
      ),
    );
    let selected = lastLibState(engine.outlets)?.["selected"] as Record<string, unknown>;
    expect(selected["name"]).toBe("Chromatic Turn");
    expect(selected["pitchMode"]).toBe("chromatic");
    expect(
      engine.errors.some((message) => message.includes("sourceMeter.denominator")),
    ).toBeTruthy();

    engine.dispatch(
      "lib_action",
      encodeURIComponent(
        JSON.stringify({
          type: "edit_motif",
          properties: { id: "renamed-id" },
        }),
      ),
    );
    selected = lastLibState(engine.outlets)?.["selected"] as Record<string, unknown>;
    expect(selected["id"]).toBe(draftId);
    expect(engine.errors.some((message) => message.includes("cannot be changed"))).toBeTruthy();
  });

  it("blank names and out-of-range note edits are rejected without corrupting state", async () => {
    const path = "/Motifs";
    const engine = await createEngine({ folders: { [path]: [] } });
    engine.dispatch("library_path", path);
    engine.dispatch("motif", "Chromatic Turn");
    engine.dispatch("begin_edit");
    const before = lastLibState(engine.outlets);
    const draftId = String((before?.["selected"] as Record<string, unknown>)?.["id"]);

    engine.dispatch(
      "lib_action",
      encodeURIComponent(
        JSON.stringify({
          type: "save_motif",
          properties: { name: "   ", description: "invalid" },
        }),
      ),
    );
    let lib = lastLibState(engine.outlets);
    expect((lib?.["editing"] as Record<string, unknown>)?.["active"]).toBe(true);
    expect((lib?.["selected"] as Record<string, unknown>)?.["name"]).toBe("Chromatic Turn");
    expect(engine.files[`${path}/${draftId}.json`]).toBe(undefined);

    engine.dispatch(
      "lib_action",
      encodeURIComponent(
        JSON.stringify({
          type: "edit_note_at",
          index: 999,
          field: "pitch",
          value: 12,
        }),
      ),
    );
    lib = lastLibState(engine.outlets);
    const notes = (lib?.["selected"] as Record<string, unknown>)?.["notes"] as Array<
      Record<string, unknown>
    >;
    expect(notes[0]?.["pitch"]).toBe(0);
    expect(engine.errors.some((message) => message.includes("Unknown note row"))).toBeTruthy();
  });

  it("invalid and conflicting JSON filenames are reserved when creating user ids", async () => {
    const path = "/Motifs";
    const engine = await createEngine({
      files: {
        [`${path}/chromatic-turn-2.json`]: "{ invalid json",
        [`${path}/chromatic-turn-3.json`]: JSON.stringify(userMotif("other-id", "Other Motif")),
      },
      folders: { [path]: ["chromatic-turn-2.json", "chromatic-turn-3.json"] },
    });
    engine.dispatch("library_path", path);
    engine.dispatch("motif", "Chromatic Turn");
    engine.dispatch("begin_edit");

    const lib = lastLibState(engine.outlets);
    expect(lib).toBeTruthy();
    const selected = lib!["selected"] as Record<string, unknown>;
    expect(selected["id"]).toBe("chromatic-turn-4");
    expect(engine.errors.some((message) => message.includes("chromatic-turn-2.json"))).toBeTruthy();
  });

  it("save never overwrites an unscanned file that appeared after library load", async () => {
    const path = "/Motifs";
    const engine = await createEngine({ folders: { [path]: [] } });
    engine.dispatch("library_path", path);
    engine.dispatch("motif", "Chromatic Turn");
    engine.dispatch("begin_edit");

    const editing = lastLibState(engine.outlets);
    expect(editing).toBeTruthy();
    const draftId = String((editing!["selected"] as Record<string, unknown>)["id"]);
    const filename = `${path}/${draftId}.json`;
    engine.files[filename] = "external file";
    engine.dispatch("save_motif");

    const lib = lastLibState(engine.outlets);
    expect(lib).toBeTruthy();
    expect((lib!["editing"] as Record<string, unknown>)["active"]).toBe(true);
    expect(engine.files[filename]).toBe("external file");
    expect(engine.errors.some((message) => message.includes("Save refused"))).toBeTruthy();
  });

  it("unavailable library paths cannot be used for saving through direct messages", async () => {
    const engine = await createEngine();
    engine.dispatch("library_path", "/missing");
    engine.dispatch("motif", "Chromatic Turn");
    engine.dispatch("begin_edit");
    engine.dispatch("save_motif");

    const lib = lastLibState(engine.outlets);
    expect(lib).toBeTruthy();
    expect(lib!["libraryLoaded"]).toBe(false);
    expect((lib!["editing"] as Record<string, unknown>)["active"]).toBe(true);
    expect(engine.errors.some((message) => message.includes("valid library folder"))).toBeTruthy();
  });

  it("a failed clip import does not cancel a clean edit session", async () => {
    const engine = await createEngine();
    engine.dispatch("motif", "Chromatic Turn");
    engine.dispatch("begin_edit");
    const before = lastLibState(engine.outlets);
    expect(before).toBeTruthy();
    const draftId = (before!["selected"] as Record<string, unknown>)["id"];

    engine.dispatch("import_clip");

    const lib = lastLibState(engine.outlets);
    expect(lib).toBeTruthy();
    expect((lib!["editing"] as Record<string, unknown>)["active"]).toBe(true);
    expect((lib!["selected"] as Record<string, unknown>)["id"]).toBe(draftId);
    expect(engine.errors.some((message) => message.includes("No clip selected"))).toBeTruthy();
  });

  it("non-primitive property payloads are rejected without clearing fields", async () => {
    const engine = await createEngine();
    engine.dispatch("motif", "Chromatic Turn");
    engine.dispatch("begin_edit");
    engine.dispatch(
      "lib_action",
      encodeURIComponent(
        JSON.stringify({
          type: "save_motif",
          properties: {
            name: { malicious: true },
            description: [],
          },
        }),
      ),
    );

    const lib = lastLibState(engine.outlets);
    expect(lib).toBeTruthy();
    expect((lib!["selected"] as Record<string, unknown>)["name"]).toBe("Chromatic Turn");
    expect((lib!["editing"] as Record<string, unknown>)["active"]).toBe(true);
    expect(
      engine.errors.some((message) => message.includes("Motif name must be text")),
    ).toBeTruthy();
  });

  it("rejects unknown enum setters and dirty library path or refresh changes", async () => {
    const engine = await createEngine({ folders: { "/Motifs": [] } });
    engine.dispatch("initialize");
    engine.dispatch("library_path", "/Motifs");
    engine.errors.length = 0;

    engine.dispatch("pitch_mode", "motif");
    engine.dispatch("pitch_mode", "nope");
    engine.dispatch("meter_mode", "nope");
    engine.dispatch("retrigger", "nope");
    engine.dispatch("trigger_mode", "nope");
    engine.dispatch("repeat_rounding", "nope");
    engine.dispatch("launch_quantization", "nope");
    engine.dispatch("pass_through", "nope");
    engine.dispatch("tempo_multiplier", "nope");
    engine.dispatch("song_context", "unknown_property", 1);
    engine.dispatch("song_context", "is_playing", 1);
    engine.dispatch("song_context", "is_playing", 0);

    expect(engine.errors.some((message) => message.includes("Unknown pitch mode"))).toBeTruthy();
    expect(engine.errors.some((message) => message.includes("Unknown meter mode"))).toBeTruthy();
    expect(
      engine.errors.some((message) => message.includes("Unknown retrigger mode")),
    ).toBeTruthy();
    expect(engine.errors.some((message) => message.includes("Unknown trigger mode"))).toBeTruthy();
    expect(
      engine.errors.some((message) => message.includes("Unknown repeat rounding")),
    ).toBeTruthy();
    expect(
      engine.errors.some((message) => message.includes("Unknown launch quantization")),
    ).toBeTruthy();
    expect(
      engine.errors.some((message) => message.includes("Unknown pass-through policy")),
    ).toBeTruthy();
    expect(
      engine.errors.some((message) => message.includes("Unknown tempo multiplier")),
    ).toBeTruthy();
    expect(engine.errors.some((message) => message.includes("Unknown Song property"))).toBeTruthy();

    engine.dispatch("begin_edit");
    engine.dispatch(
      "lib_action",
      encodeURIComponent(JSON.stringify({ type: "edit_motif", properties: { name: "Dirty" } })),
    );
    engine.errors.length = 0;
    engine.dispatch("library_path", "/Other");
    engine.dispatch("refresh_library");
    expect(
      engine.errors.some((message) =>
        message.includes("Finish or cancel editing before changing the library folder"),
      ),
    ).toBeTruthy();
    expect(
      engine.errors.some((message) =>
        message.includes("Unsaved edits must be saved or discarded before refreshing"),
      ),
    ).toBeTruthy();
  });
});
