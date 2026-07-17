import { readFile, writeFile } from 'node:fs/promises';
import { motifToMidiBytes } from '../src/tools/midi.js';

const [input, output, trigger = '60'] = process.argv.slice(2);
if (!input || !output) {
  throw new Error('Usage: npm run midi:export -- input.json output.mid [triggerPitch]');
}
const motif = JSON.parse(await readFile(input, 'utf8')) as unknown;
await writeFile(output, motifToMidiBytes(motif, Number(trigger)));
