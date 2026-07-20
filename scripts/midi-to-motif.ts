/**
 * CLI: Standard MIDI File → Motif JSON.
 *
 * Usage: `npm run midi:import -- input.mid output.json [chromatic|scale|hybrid]`
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { midiBytesToMotif } from '../src/tools/midi.js';

const [input, output, mode = 'chromatic'] = process.argv.slice(2);
if (!input || !output || !['chromatic', 'scale', 'hybrid'].includes(mode)) {
  throw new Error('Usage: npm run midi:import -- input.mid output.json [chromatic|scale|hybrid]');
}
const id = path.basename(output, path.extname(output)).replace(/[^a-z0-9-]+/gi, '-').toLowerCase();
const bytes = new Uint8Array(await readFile(input));
const motif = midiBytesToMotif(bytes, { id, name: id, pitchMode: mode as 'chromatic' | 'scale' | 'hybrid' });
await writeFile(output, `${JSON.stringify(motif, null, 2)}\n`);
