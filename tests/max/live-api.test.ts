import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { installMaxMocks } from "../helpers/max-mocks.js";
import { readClipNotes, resolveDetailClip } from "../../src/max/live-api.js";

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
      path: string;
      constructor(_callback?: (args: unknown[]) => void, path = "") {
        this.path = path;
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
      path: string;
      constructor(_callback?: (args: unknown[]) => void, path = "") {
        this.path = path;
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
