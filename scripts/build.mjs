import { build } from 'esbuild';
import { copyFile, mkdir } from 'node:fs/promises';
import './generate-builtins.mjs';
import './generate-max-patch.mjs';

const handlerNames = [
  'initialize',
  'note',
  'cc',
  'sustain',
  'motif',
  'pitch_mode',
  'meter_mode',
  'retrigger',
  'trigger_mode',
  'launch_quantization',
  'pass_through',
  'trigger_low',
  'trigger_high',
  'map_trigger',
  'unmap_trigger',
  'clear_trigger_map',
  'library_path',
  'refresh_library',
  'panic',
  'list_motifs',
  'dump_context',
  'song_context',
];

const deviceFooter = [
  ...handlerNames.map(
    (name) =>
      `function ${name}() { return globalThis.__motifHandlers.${name}.apply(null, arguments); }`,
  ),
  `function anything() {
  const handler = globalThis.__motifHandlers[this.messagename];
  if (typeof handler !== 'function') {
    error('Motif: unknown message ' + this.messagename + '\\n');
    return;
  }
  return handler.apply(null, arguments);
}`,
].join('\n');



await mkdir('dist', { recursive: true });
await mkdir('max', { recursive: true });

await build({
  entryPoints: ['src/max/device.ts'],
  outfile: 'dist/motif-device.js',
  bundle: true,
  format: 'iife',
  platform: 'neutral',
  target: 'es2020',
  sourcemap: true,
  legalComments: 'none',
  footer: { js: deviceFooter },
});



for (const filename of ['motif-device.js', 'motif-device.js.map']) {
  await copyFile(`dist/${filename}`, `max/${filename}`);
}
