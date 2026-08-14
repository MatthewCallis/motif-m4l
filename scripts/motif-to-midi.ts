/**
 * CLI: Motif JSON ➜ Standard MIDI File.
 *
 * Usage: `npm run midi:export -- input.json output.mid [triggerPitch]`
 * `triggerPitch` defaults to 60 (Live C3) for relative ➜ absolute mapping.
 */

import { readFile, writeFile } from "node:fs/promises";
import { motifToMidiBytes } from "./midi-conversion.js";

const [input, output, trigger = "60"] = process.argv.slice(2);
if (!input || !output) {
  throw new Error("Usage: npm run midi:export -- input.json output.mid [triggerPitch]");
}
const motif = JSON.parse(await readFile(input, "utf8")) as unknown;
await writeFile(output, motifToMidiBytes(motif, Number(trigger)));
