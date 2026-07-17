import { build } from 'esbuild';
import { copyFile, mkdir } from 'node:fs/promises';
import './generate-builtins.mjs';
import './generate-max-patch.mjs';

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
});

await copyFile('dist/motif-device.js', 'max/motif-device.js');
await copyFile('dist/motif-device.js.map', 'max/motif-device.js.map');
