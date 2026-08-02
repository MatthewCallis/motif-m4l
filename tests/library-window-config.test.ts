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
const completeConfig = {
  width: 640,
  height: 460,
  sidebarMinWidth: 160,
  sidebarMaxWidth: 420,
  detailMinWidth: 320,
  sidebarResizerWidth: 5,
};

after(async () => {
  await Promise.all(
    temporaryDirectories.map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe("Library window configuration", () => {
  it("accepts bounded integer dimensions and rejects unsafe shapes", () => {
    assert.deepEqual(parseLibraryWindowConfig(completeConfig), completeConfig);
    assert.throws(() => parseLibraryWindowConfig({ ...completeConfig, file: "/tmp/x" }));
    assert.throws(() => parseLibraryWindowConfig({ width: 640, height: 460 }));
    assert.throws(() =>
      parseLibraryWindowConfig({
        ...completeConfig,
        width: LIBRARY_WINDOW_LIMITS.width.min - 1,
      }),
    );
    assert.throws(() => parseLibraryWindowConfig({ ...completeConfig, width: 640.5 }));
    assert.throws(() =>
      parseLibraryWindowConfig({
        ...completeConfig,
        sidebarMinWidth: completeConfig.sidebarMaxWidth + 1,
      }),
    );
  });

  it("writes deterministic JSON that can be loaded again", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "motif-library-window-"));
    temporaryDirectories.push(directory);
    const filename = path.join(directory, "library-window.json");

    const config = { ...completeConfig, width: 720, height: 540, sidebarResizerWidth: 7 };
    await writeLibraryWindowConfig(config, filename);

    assert.equal(
      await readFile(filename, "utf8"),
      '{\n  "width": 720,\n  "height": 540,\n  "sidebarMinWidth": 160,\n  "sidebarMaxWidth": 420,\n  "detailMinWidth": 320,\n  "sidebarResizerWidth": 7\n}\n',
    );
    assert.deepEqual(await readLibraryWindowConfig(filename), config);
  });
});
