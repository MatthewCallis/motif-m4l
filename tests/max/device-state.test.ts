import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEVICE_STATE_SCHEMA_VERSION,
  decodePersistedDeviceState,
  encodePersistedDeviceState,
} from "../../src/max/device-state.js";

describe("Live-stored device state", () => {
  it("round-trips stable motif selection and sorted hot-key assignments", () => {
    const encoded = encodePersistedDeviceState({
      schemaVersion: DEVICE_STATE_SCHEMA_VERSION,
      selectedMotifId: "user-phrase",
      hotkeys: [
        { pitch: 64, motifId: "scale-turn", action: "select" },
        { pitch: 36, motifId: "user-phrase", action: "trigger" },
      ],
    });

    assert.ok(!encoded.includes(" "));
    assert.deepEqual(decodePersistedDeviceState(encoded), {
      schemaVersion: DEVICE_STATE_SCHEMA_VERSION,
      selectedMotifId: "user-phrase",
      hotkeys: [
        { pitch: 36, motifId: "user-phrase", action: "trigger" },
        { pitch: 64, motifId: "scale-turn", action: "select" },
      ],
    });
  });

  it("accepts raw JSON and normalizes duplicate or malformed assignments", () => {
    assert.deepEqual(
      decodePersistedDeviceState(
        JSON.stringify({
          schemaVersion: 1,
          selectedMotifId: "scale-turn",
          hotkeys: [
            { pitch: 20, motifId: "chromatic-turn", action: "trigger" },
            { pitch: 20, motifId: "scale-turn", action: "select" },
            { pitch: 128, motifId: "scale-turn", action: "trigger" },
            { pitch: 21, motifId: "", action: "trigger" },
            { pitch: 22, motifId: "scale-turn", action: "repeat" },
          ],
        }),
      ),
      {
        schemaVersion: DEVICE_STATE_SCHEMA_VERSION,
        selectedMotifId: "scale-turn",
        hotkeys: [{ pitch: 20, motifId: "scale-turn", action: "select" }],
      },
    );
  });

  it("rejects empty, malformed, and unsupported snapshots", () => {
    assert.equal(decodePersistedDeviceState(""), undefined);
    assert.equal(decodePersistedDeviceState("%not-json"), undefined);
    assert.equal(decodePersistedDeviceState("null"), undefined);
    assert.equal(decodePersistedDeviceState("[]"), undefined);
    assert.equal(
      decodePersistedDeviceState(
        encodeURIComponent(
          JSON.stringify({
            schemaVersion: 2,
            selectedMotifId: "scale-turn",
            hotkeys: [],
          }),
        ),
      ),
      undefined,
    );
    assert.equal(
      decodePersistedDeviceState(
        encodeURIComponent(
          JSON.stringify({
            schemaVersion: 1,
            selectedMotifId: " ",
            hotkeys: [],
          }),
        ),
      ),
      undefined,
    );
    assert.deepEqual(
      decodePersistedDeviceState(
        JSON.stringify({
          schemaVersion: 1,
          selectedMotifId: 42,
          hotkeys: [{ pitch: 60, motifId: "scale-turn", action: "trigger" }],
        }),
      ),
      undefined,
    );
    assert.deepEqual(
      decodePersistedDeviceState(
        JSON.stringify({
          schemaVersion: 1,
          selectedMotifId: "scale-turn",
          hotkeys: [null, "bad", { pitch: 60, motifId: "scale-turn", action: "trigger" }],
        }),
      ),
      {
        schemaVersion: DEVICE_STATE_SCHEMA_VERSION,
        selectedMotifId: "scale-turn",
        hotkeys: [{ pitch: 60, motifId: "scale-turn", action: "trigger" }],
      },
    );
  });
});
