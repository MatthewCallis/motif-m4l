import type { HotkeyAssignment } from "./hotkey-map.js";

/** Current Live-stored device-state schema. */
export const DEVICE_STATE_SCHEMA_VERSION = 1;

/** Engine-owned state that is not represented by an ordinary Live UI parameter. */
export interface PersistedDeviceState {
  /** Version used to reject incompatible future snapshots safely. */
  schemaVersion: typeof DEVICE_STATE_SCHEMA_VERSION;
  /** Stable motif identity, never the dynamic menu index or display label. */
  selectedMotifId: string;
  /** Stable MIDI-pitch assignments restored after the user library finishes scanning. */
  hotkeys: HotkeyAssignment[];
}

/**
 * URL-encode device state into one Max-safe symbol atom.
 * @param {PersistedDeviceState} state Valid durable state.
 * @returns {string} Encoded JSON suitable for a parameter-enabled `pattr`.
 */
export function encodePersistedDeviceState(state: PersistedDeviceState): string {
  return encodeURIComponent(JSON.stringify(state));
}

/**
 * Decode and validate one Live-stored device-state symbol.
 * @param {unknown} raw Encoded JSON atom emitted by `pattr`.
 * @returns {PersistedDeviceState | undefined} Normalized state, or undefined for malformed data.
 */
export function decodePersistedDeviceState(raw: unknown): PersistedDeviceState | undefined {
  if (typeof raw !== "string" || raw.trim() === "") {
    return undefined;
  }

  let parsed: unknown;
  try {
    const text = raw.trim();
    parsed = JSON.parse(text.startsWith("{") ? text : decodeURIComponent(text));
  } catch {
    return undefined;
  }
  if (!parsed || typeof parsed !== "object") {
    return undefined;
  }

  const record = parsed as Record<string, unknown>;
  if (record["schemaVersion"] !== DEVICE_STATE_SCHEMA_VERSION) {
    return undefined;
  }
  const selectedMotifId =
    typeof record["selectedMotifId"] === "string" ? record["selectedMotifId"].trim() : "";
  if (!selectedMotifId) {
    return undefined;
  }

  const assignments = new Map<number, HotkeyAssignment>();
  const rawHotkeys = Array.isArray(record["hotkeys"]) ? record["hotkeys"] : [];
  for (const rawHotkey of rawHotkeys) {
    if (!rawHotkey || typeof rawHotkey !== "object") {
      continue;
    }
    const hotkey = rawHotkey as Record<string, unknown>;
    const pitch = Number(hotkey["pitch"]);
    const motifId = typeof hotkey["motifId"] === "string" ? hotkey["motifId"].trim() : "";
    const action = hotkey["action"];
    if (
      !Number.isInteger(pitch) ||
      pitch < 0 ||
      pitch > 127 ||
      !motifId ||
      (action !== "trigger" && action !== "select")
    ) {
      continue;
    }
    assignments.set(pitch, {
      pitch,
      motifId,
      action,
    });
  }

  return {
    schemaVersion: DEVICE_STATE_SCHEMA_VERSION,
    selectedMotifId,
    hotkeys: [...assignments.values()].sort((left, right) => left.pitch - right.pitch),
  };
}
