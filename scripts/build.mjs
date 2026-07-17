import { build } from 'esbuild';
import { copyFile, mkdir } from 'node:fs/promises';
import './generate-builtins.mjs';
import './generate-max-patch.mjs';

const handlerNames = [
  'initialize',
  'note',
  'cc',
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
  'host',
];

const deviceFooter = handlerNames
  .map(
    (name) =>
      `function ${name}() { return globalThis.__motifHandlers.${name}.apply(null, arguments); }`,
  )
  .join('\n');

const previewFooter = [
  'function data() { return globalThis.__motifPreviewHandlers.data.apply(null, arguments); }',
  'function clear() { return globalThis.__motifPreviewHandlers.clear.apply(null, arguments); }',
  'function paint() { return globalThis.__motifPreviewHandlers.paint.apply(null, arguments); }',
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

await build({
  entryPoints: ['src/max/preview.ts'],
  outfile: 'dist/motif-preview.js',
  bundle: true,
  format: 'iife',
  platform: 'neutral',
  target: 'es2020',
  sourcemap: true,
  legalComments: 'none',
  footer: { js: previewFooter },
});

for (const filename of ['motif-device.js', 'motif-device.js.map', 'motif-preview.js', 'motif-preview.js.map']) {
  await copyFile(`dist/${filename}`, `max/${filename}`);
}
