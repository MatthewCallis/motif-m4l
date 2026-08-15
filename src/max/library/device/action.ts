import type { LibraryAction } from "../protocol.js";
import { flattenValues, stringAtom } from "../../max-helpers.js";

/** Successful or failed decoding of one jweb Library action. */
export type LibraryActionDecodeResult =
  | { ok: true; action: LibraryAction }
  | { ok: false; error: string };

/**
 * Decode and normalize one URL-encoded action emitted by the Library page.
 * @param {unknown[]} encodedParts Possibly nested Max atoms.
 * @returns {LibraryActionDecodeResult} Typed command or boundary diagnostic.
 */
export function decodeLibraryAction(encodedParts: unknown[]): LibraryActionDecodeResult {
  const payloads = flattenValues(encodedParts)
    .map((value) => stringAtom(value))
    .filter(Boolean);
  const encodedJson = payloads[payloads.length - 1];
  if (!encodedJson) {
    return { ok: false, error: "lib_action: missing JSON payload" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(decodeURIComponent(encodedJson));
  } catch {
    return {
      ok: false,
      error: `lib_action: invalid JSON (${encodedJson.slice(0, 48)})`,
    };
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, error: "lib_action: unknown type " };
  }

  const action = parsed as Record<string, unknown>;
  const type = stringAtom(action["type"]);
  const pitch = (): number | string =>
    typeof action["pitch"] === "number" ? action["pitch"] : stringAtom(action["pitch"]);
  const rawDiscardChanges = action["discardChanges"];
  const discardChanges =
    typeof rawDiscardChanges === "number" || typeof rawDiscardChanges === "boolean"
      ? rawDiscardChanges
      : undefined;

  switch (type) {
    case "select_browser":
      return {
        ok: true,
        action: {
          type,
          id: stringAtom(action["id"]),
          ...(discardChanges !== undefined ? { discardChanges } : {}),
        },
      };
    case "filter_motifs":
      return {
        ok: true,
        action: {
          type,
          query: action["query"],
          ...(action["tags"] !== undefined ? { tags: action["tags"] } : {}),
          ...(action["tagMode"] !== undefined ? { tagMode: action["tagMode"] } : {}),
        },
      };
    case "import_clip":
      return { ok: true, action: { type } };
    case "save_motif":
      return { ok: true, action: { type, properties: action["properties"] } };
    case "refresh_library":
      return {
        ok: true,
        action: {
          type,
          ...(discardChanges !== undefined ? { discardChanges } : {}),
        },
      };
    case "map_trigger":
      return {
        ok: true,
        action: {
          type,
          pitch: pitch(),
          motifId: stringAtom(action["motifId"]),
          action: stringAtom(action["action"], "trigger"),
        },
      };
    case "unmap_trigger":
      return { ok: true, action: { type, pitch: pitch() } };
    case "clear_trigger_map":
    case "begin_edit":
    case "cancel_edit":
    case "add_note":
      return { ok: true, action: { type } };
    case "edit_motif":
      return { ok: true, action: { type, properties: action["properties"] } };
    case "remove_note":
      return {
        ok: true,
        action: { type, index: Number(action["index"]) },
      };
    case "edit_note_at":
      return {
        ok: true,
        action: {
          type,
          index: Number(action["index"]),
          field: stringAtom(action["field"]),
          value: action["value"],
        },
      };
    default:
      return { ok: false, error: `lib_action: unknown type ${type}` };
  }
}
