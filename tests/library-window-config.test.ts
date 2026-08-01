import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { after, describe, it } from "node:test";
import {
  LIBRARY_WINDOW_LIMITS,
  parseLibraryWindowConfig,
  readLibraryWindowConfig,
  writeLibraryWindowConfig,
} from "../scripts/library-window-config.js";

const temporaryDirectories: string[] = [];

after(async () => {
  await Promise.all(
    temporaryDirectories.map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe("Library window configuration", () => {
  it("accepts bounded integer dimensions and rejects unsafe shapes", () => {
    assert.deepEqual(parseLibraryWindowConfig({ width: 640, height: 460 }), {
      width: 640,
      height: 460,
    });
    assert.throws(() => parseLibraryWindowConfig({ width: 640, height: 460, file: "/tmp/x" }));
    assert.throws(() =>
      parseLibraryWindowConfig({
        width: LIBRARY_WINDOW_LIMITS.minWidth - 1,
        height: 460,
      }),
    );
    assert.throws(() => parseLibraryWindowConfig({ width: 640.5, height: 460 }));
  });

  it("writes deterministic JSON that can be loaded again", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "motif-library-window-"));
    temporaryDirectories.push(directory);
    const filename = path.join(directory, "library-window.json");

    await writeLibraryWindowConfig({ width: 720, height: 540 }, filename);

    assert.equal(await readFile(filename, "utf8"), '{\n  "width": 720,\n  "height": 540\n}\n');
    assert.deepEqual(await readLibraryWindowConfig(filename), { width: 720, height: 540 });
  });
});
