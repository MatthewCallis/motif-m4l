import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import vm from "node:vm";
import { loadCompiledEngine } from "./helpers/max-engine.js";

type Emission = unknown[];

function lastEmission(emissions: Emission[], prefix: readonly unknown[]): Emission | undefined {
  return [...emissions]
    .reverse()
    .find((entry) => prefix.every((value, index) => entry[index] === value));
}

function encodedPayload(emission: Emission | undefined): string {
  const payload = emission?.[2];
  if (typeof payload !== "string") {
    assert.fail("UI payload must be a URL-encoded JSON string");
  }
  return payload;
}

describe("compiled Max runtime", () => {
  it("compiled Max runtime initializes, receives Song context, previews, and schedules MIDI", async () => {
    const { filename, source } = await loadCompiledEngine();
    const emissions: Emission[] = [];
    const errors: string[] = [];
    const temporaryFiles = new Map<string, string>();
    class MockFile {
      isopen: boolean;
      eof = 0;
      position = 0;
      filename: string;
      foldername: string;
      private readonly absolutePath: string;

      constructor(filename: string, access = "read") {
        this.filename = filename.split("/").pop() ?? filename;
        this.foldername = filename.startsWith("Tempfolder:")
          ? "/tmp/max-temp"
          : filename.slice(0, filename.lastIndexOf("/"));
        this.absolutePath = filename.startsWith("Tempfolder:")
          ? `${this.foldername}/${this.filename}`
          : filename;
        this.isopen = access === "write" || temporaryFiles.has(this.absolutePath);
        this.eof = Buffer.byteLength(temporaryFiles.get(this.absolutePath) ?? "");
      }

      writestring(text: string): void {
        const current = temporaryFiles.get(this.absolutePath) ?? "";
        temporaryFiles.set(this.absolutePath, `${current}${text}`);
        this.position += text.length;
        this.eof = temporaryFiles.get(this.absolutePath)?.length ?? 0;
      }

      close(): void {
        this.isopen = false;
      }
    }
    const context = vm.createContext({
      outlet: (_index: number, ...values: unknown[]) => emissions.push(values),
      error: (message: string) => errors.push(String(message)),
      post: () => undefined,
      arrayfromargs: (values: IArguments | ArrayLike<unknown>) => Array.from(values),
      messagename: "",
      File: MockFile,
      Folder: class {},
      console,
    });

    vm.runInContext(source, context, { filename });
    const send = (message: string, ...args: unknown[]) => {
      (context as Record<string, unknown>).messagename = message;
      (context as Record<string, unknown>).__args = args;
      vm.runInContext("anything.apply(null, __args)", context);
    };

    send("initialize");

    assert.ok(lastEmission(emissions, ["status", "Ready"]));

    // Preview is now a piano roll encoded as JSON in `ui preview encodedJson`.
    const initialPreviewRaw = lastEmission(emissions, ["ui", "preview"]);
    assert.ok(initialPreviewRaw, "preview state must be emitted on initialize");
    const initialPreview = JSON.parse(decodeURIComponent(encodedPayload(initialPreviewRaw))) as {
      notes: Array<{ pitch: number; atTicks: number; durationTicks: number; velocity: number }>;
      totalTicks: number;
      lowPitch: number;
      highPitch: number;
      noteNames: string;
    };
    assert.ok(
      Array.isArray(initialPreview.notes) && initialPreview.notes.length > 0,
      "preview must include notes",
    );
    assert.ok(typeof initialPreview.totalTicks === "number" && initialPreview.totalTicks > 0);
    assert.ok(initialPreview.notes.every(({ velocity }) => velocity >= 1 && velocity <= 127));
    assert.ok(
      new Set(initialPreview.notes.map(({ velocity }) => velocity)).size > 1,
      "preview must preserve the motif's rising and falling effective velocities",
    );

    emissions.length = 0;
    send("preview_ready");
    send("library_ready");
    send("library_prepare");
    assert.ok(
      lastEmission(emissions, ["ui", "preview"]),
      "preview readiness must resend current preview state",
    );
    const libraryStateRaw = lastEmission(emissions, ["ui", "lib"]);
    assert.ok(libraryStateRaw, "library readiness must resend current library state");
    const libraryState = JSON.parse(decodeURIComponent(encodedPayload(libraryStateRaw))) as {
      items: Array<{ id: string; name: string }>;
      selected: { name: string } | null;
    };
    assert.ok(libraryState.items.length > 0, "library state must contain built-in motifs");
    assert.ok(
      libraryState.items.some((item) => item.id === "scale-turn"),
      "library state must include Scale Turn",
    );
    assert.ok(libraryState.selected, "library state must include selected motif details");
    const libraryPage = lastEmission(emissions, ["library-page"]);
    assert.match(
      String(libraryPage?.[1]),
      /^\/tmp\/max-temp\/uttori-motif-library-[a-f0-9]{12}\.html$/,
    );
    assert.equal(
      temporaryFiles.get(String(libraryPage?.[1])),
      await readFile("max/library.html", "utf8"),
      "library_prepare must materialize the exact bundled page",
    );

    send("song_context", "tempo", 96);
    send("song_context", "root_note", 5);
    send("song_context", "scale_name", "Minor");
    send("song_context", "scale_intervals", 0, 2, 3, 5, 7, 8, 10);

    // After song context update, a new preview JSON must arrive with updated note names.
    const updatedPreviewRaw = lastEmission(emissions, ["ui", "preview"]);
    const updatedPreview = JSON.parse(
      decodeURIComponent(encodedPayload(updatedPreviewRaw)),
    ) as typeof initialPreview;
    assert.ok(typeof updatedPreview.noteNames === "string" && updatedPreview.noteNames.length > 0);

    const beforeTrigger = emissions.length;
    send("note", 60, 100, 1);
    const triggerEmissions = emissions.slice(beforeTrigger);
    const noteEvents = triggerEmissions.filter((entry) => entry[0] === "event");
    assert.ok(noteEvents.length >= 12, "trigger must emit note-on and note-off events");
    assert.ok(noteEvents.some((entry) => entry[1] === 60 && Number(entry[2]) > 0));

    const beforeDryNote = emissions.length;
    send("note", 20, 90, 1);
    assert.ok(
      emissions
        .slice(beforeDryNote)
        .some(
          (entry) => entry[0] === "event" && entry[1] === 20 && entry[2] === 90 && entry[4] === 0,
        ),
      "a non-trigger note must pass through with the default policy",
    );

    assert.deepEqual(errors, []);
  });
});
