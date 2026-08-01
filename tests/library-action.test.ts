import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { decodeLibraryAction } from "../src/max/library-action.js";

function encoded(action: unknown): string {
  return encodeURIComponent(JSON.stringify(action));
}

describe("Library action boundary", () => {
  it("normalizes every supported action into the discriminated command union", () => {
    const cases = [
      [{ type: "select_browser", id: "scale-turn", discardChanges: true }, "select_browser"],
      [{ type: "filter_motifs", query: "bass" }, "filter_motifs"],
      [{ type: "import_clip", pitchMode: "hybrid" }, "import_clip"],
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
      assert.equal(result.ok, true);
      if (result.ok) assert.equal(result.action.type, expectedType);
    }
  });

  it("defaults trigger actions and preserves optional-field absence", () => {
    const mapped = decodeLibraryAction([
      encoded({ type: "map_trigger", pitch: 36, motifId: "scale-turn" }),
    ]);
    assert.deepEqual(mapped, {
      ok: true,
      action: {
        type: "map_trigger",
        pitch: 36,
        motifId: "scale-turn",
        action: "trigger",
      },
    });

    const imported = decodeLibraryAction([encoded({ type: "import_clip" })]);
    assert.deepEqual(imported, {
      ok: true,
      action: { type: "import_clip" },
    });
  });

  it("rejects missing, malformed, non-record, and unknown payloads", () => {
    assert.deepEqual(decodeLibraryAction([]), {
      ok: false,
      error: "lib_action: missing JSON payload",
    });
    assert.equal(decodeLibraryAction(["%not-json"]).ok, false);
    assert.deepEqual(decodeLibraryAction([encoded([])]), {
      ok: false,
      error: "lib_action: unknown type ",
    });
    assert.deepEqual(decodeLibraryAction([encoded({ type: "missing" })]), {
      ok: false,
      error: "lib_action: unknown type missing",
    });
  });
});
