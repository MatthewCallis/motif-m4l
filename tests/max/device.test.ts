import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { installMaxMocks } from "../helpers/max-mocks.js";

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

    const { dispatch } = await import("../../src/max/device.js");
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
