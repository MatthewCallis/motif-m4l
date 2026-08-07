/**
 * Remove generated build artifacts while preserving the hand-authored Max
 * sources, installation documentation, and packaged `Motif.amxd`.
 *
 * @see ../src/max/library/ui/index.html
 * @see ../src/max/library/ui/main.ts
 * @see ../src/max/library/ui/styles.css
 * @see ../src/max/motif-preview.js
 */

import { readdir, rm } from "node:fs/promises";
import path from "node:path";

const HASHED_RUNTIME_PATTERN = /^motif-(?:device|preview)-[a-f0-9]{12}\.js$/;

/**
 * Remove generated content-addressed runtime files from the Max output folder.
 * @returns {Promise<void>} A promise that resolves after all matching files are removed.
 */
async function removeHashedMaxRuntimes(): Promise<void> {
  const files = await readdir("max").catch((reason: unknown) => {
    if ((reason as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw reason;
  });
  await Promise.all(
    files
      .filter((filename) => HASHED_RUNTIME_PATTERN.test(filename))
      .map((filename) => rm(path.join("max", filename), { force: true })),
  );
}

await Promise.all([
  rm("dist", { recursive: true, force: true }),
  rm("src/generated/builtins.ts", { force: true }),
  rm("max/Motif.maxpat", { force: true }),
  rm("max/library.html", { force: true }),
  rm("max/motif-device.js", { force: true }),
  rm("max/motif-preview.js", { force: true }),
  removeHashedMaxRuntimes(),
]);
