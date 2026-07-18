import { build } from 'esbuild';
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { generateBuiltins } from './generate-builtins.js';
import { generateMaxPatch } from './generate-max-patch.js';

const MAX_BRIDGE = `// Hand-written Max v8 bridge. Keep this at the top level and before the bundle.
var inlets = 1;
var outlets = 1;

function anything() {
  var message = messagename;
  var args = arrayfromargs(arguments);

  if (typeof MotifEngine === "undefined" || typeof MotifEngine.dispatch !== "function") {
    error("Motif: engine dispatcher is unavailable for " + message + "\\n");
    return;
  }

  return MotifEngine.dispatch(message, args);
}
`;

await generateBuiltins();
await generateMaxPatch();

await mkdir('dist', { recursive: true });
await mkdir('max', { recursive: true });

const enginePath = 'dist/.motif-engine.js';
await build({
  entryPoints: ['src/max/device.ts'],
  outfile: enginePath,
  bundle: true,
  format: 'iife',
  globalName: 'MotifEngine',
  platform: 'neutral',
  target: 'es2020',
  sourcemap: false,
  legalComments: 'none',
});

const engine = await readFile(enginePath, 'utf8');
const output = `${MAX_BRIDGE}\n${engine}`;
await writeFile('dist/motif-device.js', output);
await copyFile('dist/motif-device.js', 'max/motif-device.js');
await rm(enginePath, { force: true });
await rm('dist/motif-device.js.map', { force: true });
await rm('max/motif-device.js.map', { force: true });
