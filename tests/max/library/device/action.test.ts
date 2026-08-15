import { describe, it, expect } from "vitest";
import { decodeLibraryAction } from "../../../../src/max/library/device/action.js";

function encoded(action: unknown): string {
  return encodeURIComponent(JSON.stringify(action));
}

describe("Library action boundary", () => {
  it("normalizes every supported action into the discriminated command union", () => {
    const cases = [
      [{ type: "select_browser", id: "scale-turn", discardChanges: true }, "select_browser"],
      [{ type: "filter_motifs", query: "bass", tags: ["demo"], tagMode: "and" }, "filter_motifs"],
      [{ type: "import_clip" }, "import_clip"],
      [{ type: "save_motif", properties: { name: "Saved" } }, "save_motif"],
      [{ type: "refresh_library", discardChanges: 1 }, "refresh_library"],
      [
        { type: "map_trigger", pitch: "C3", motifId: "scale-turn", action: "select" },
        "map_trigger",
      ],
      [{ type: "unmap_trigger", pitch: 60 }, "unmap_trigger"],
      [{ type: "clear_trigger_map" }, "clear_trigger_map"],
      [{ type: "begin_edit" }, "begin_edit"],
      [{ type: "cancel_edit" }, "cancel_edit"],
      [{ type: "edit_motif", properties: { name: "Draft" } }, "edit_motif"],
      [{ type: "add_note" }, "add_note"],
      [{ type: "remove_note", index: "2" }, "remove_note"],
      [{ type: "edit_note_at", index: "3", field: "velocity", value: 90 }, "edit_note_at"],
    ] as const;

    for (const [input, expectedType] of cases) {
      const result = decodeLibraryAction([encoded(input)]);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.action.type).toBe(expectedType);
      }
    }
  });

  it("defaults trigger actions and preserves optional-field absence", () => {
    const mapped = decodeLibraryAction([
      encoded({ type: "map_trigger", pitch: 36, motifId: "scale-turn" }),
    ]);
    expect(mapped).toEqual({
      ok: true,
      action: {
        type: "map_trigger",
        pitch: 36,
        motifId: "scale-turn",
        action: "trigger",
      },
    });

    const imported = decodeLibraryAction([encoded({ type: "import_clip" })]);
    expect(imported).toEqual({
      ok: true,
      action: { type: "import_clip" },
    });

    const filtered = decodeLibraryAction([
      encoded({ type: "filter_motifs", query: "bass", tags: ["demo"], tagMode: "and" }),
    ]);
    expect(filtered).toEqual({
      ok: true,
      action: {
        type: "filter_motifs",
        query: "bass",
        tags: ["demo"],
        tagMode: "and",
      },
    });

    const refreshed = decodeLibraryAction([encoded({ type: "refresh_library" })]);
    expect(refreshed).toEqual({
      ok: true,
      action: { type: "refresh_library" },
    });
    expect(refreshed.ok && !("discardChanges" in refreshed.action)).toBe(true);
  });

  it("rejects missing, malformed, non-record, and unknown payloads", () => {
    expect(decodeLibraryAction([])).toEqual({
      ok: false,
      error: "lib_action: missing JSON payload",
    });
    expect(decodeLibraryAction(["%not-json"]).ok).toBe(false);
    expect(decodeLibraryAction([encoded([])])).toEqual({
      ok: false,
      error: "lib_action: unknown type ",
    });
    expect(decodeLibraryAction([encoded({ type: "missing" })])).toEqual({
      ok: false,
      error: "lib_action: unknown type missing",
    });
  });
});
