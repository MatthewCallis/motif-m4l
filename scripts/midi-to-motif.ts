/**
 * CLI: Standard MIDI File ➜ Motif JSON.
 *
 * Usage: `npm run midi:import -- input.mid output.json`
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { midiBytesToMotif } from "./midi-conversion.js";

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  throw new Error("Usage: npm run midi:import -- input.mid output.json");
}
const id = path
  .basename(output, path.extname(output))
  .replace(/[^a-z0-9-]+/gi, "-")
  .toLowerCase();
const bytes = new Uint8Array(await readFile(input));
const motif = midiBytesToMotif(bytes, {
  id,
  name: id,
});
await writeFile(output, `${JSON.stringify(motif, null, 2)}\n`);
