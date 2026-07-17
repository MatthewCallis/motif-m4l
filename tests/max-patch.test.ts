import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

type Box = {
  id: string;
  presentation?: number;
  presentation_rect?: number[];
  patching_rect?: number[];
  text?: string;
  maxclass: string;
  numoutlets?: number;
  filename?: string;
  varname?: string;
  annotation?: string;
  annotation_name?: string;
  hint?: string;
};

test('generates a compact Max 9 device with native Song observers and visual preview', async () => {
  const document = JSON.parse(await readFile('max/Motif.maxpat', 'utf8')) as {
    patcher: {
      openinpresentation: number;
      devicewidth: number;
      boxes: Array<{ box: Box }>;
      lines: Array<{ patchline: { source: [string, number]; destination: [string, number] } }>;
      dependency_cache: Array<{ name: string }>;
    };
  };

  const patcher = document.patcher;
  assert.equal(patcher.openinpresentation, 1);
  assert.equal(patcher.devicewidth, 860);
  assert.ok(patcher.boxes.filter(({ box }) => box.presentation === 1).length >= 35);

  const texts = patcher.boxes.map(({ box }) => box.text).filter((text): text is string => Boolean(text));
  assert.ok(texts.includes('v8 motif-device.js'));
  assert.ok(texts.includes('live.path live_set'));
  assert.ok(texts.includes('live.observer'));
  for (const property of [
    'tempo',
    'root_note',
    'scale_mode',
    'scale_name',
    'scale_intervals',
    'signature_numerator',
    'signature_denominator',
    'is_playing',
    'current_song_time',
  ]) {
    assert.ok(texts.includes(`property ${property}`));
    assert.ok(texts.includes(`prepend ${property}`));
  }

  assert.ok(texts.includes('prepend host'));
  assert.ok(!texts.some((text) => text.startsWith('prepend host_')));
  assert.ok(texts.includes('route event panic clear status error context motifs-reset motif-item motif-selected midi-pass ui'));
  assert.ok(texts.includes('route preview preview-notes preview-root motif-title motif-description motif-stats motif-tags'));
  assert.ok(texts.includes('pipe 0 0 0 0.'));

  const v8 = patcher.boxes.find(({ box }) => box.text === 'v8 motif-device.js')?.box;
  assert.equal(v8?.numoutlets, 1);
  const v8Id = v8?.id;
  assert.ok(v8Id);
  assert.ok(patcher.lines.every(({ patchline }) => patchline.source[0] !== v8Id || patchline.source[1] === 0));

  const preview = patcher.boxes.find(({ box }) => box.maxclass === 'v8ui')?.box;
  assert.equal(preview?.filename, 'motif-preview.js');
  assert.deepEqual(preview?.patching_rect, preview?.presentation_rect);
  assert.equal(preview?.annotation_name, 'Motif Note Preview');
  assert.ok(preview?.annotation);
  assert.ok(preview?.hint);

  const expectedDependencies = ['motif-device.js', 'motif-preview.js'];
  assert.deepEqual(patcher.dependency_cache.map(({ name }) => name).sort(), expectedDependencies.sort());
  assert.ok(!JSON.stringify(document).match(/motif-(?:device|preview)-v\d/i));

  const controls = [
    'motif-menu',
    'pitch-menu',
    'trigger-menu',
    'quant-menu',
    'pass-menu',
    'meter-tab',
    'retrigger-tab',
    'low-number',
    'high-number',
    'choose-library',
    'refresh-button',
    'panic-button',
  ];
  for (const varname of controls) {
    const control = patcher.boxes.find(({ box }) => box.varname === varname)?.box;
    assert.ok(control, `missing ${varname}`);
    assert.ok(control.annotation_name, `${varname} is missing annotation_name`);
    assert.ok(control.annotation, `${varname} is missing annotation`);
    assert.ok(control.hint, `${varname} is missing hint`);
  }
});

test('compiled bundles expose real top-level Max handlers without versioned filenames', async () => {
  const source = await readFile('dist/motif-device.js', 'utf8');
  assert.match(source, /function initialize\(\) \{ return globalThis\.__motifHandlers\.initialize/);
  assert.match(source, /function note\(\) \{ return globalThis\.__motifHandlers\.note/);
  assert.match(source, /function host\(\) \{ return globalThis\.__motifHandlers\.host/);
  assert.doesNotMatch(source, /function host_tempo\(/);

  const preview = await readFile('dist/motif-preview.js', 'utf8');
  assert.match(preview, /function data\(\) \{ return globalThis\.__motifPreviewHandlers\.data/);
  assert.match(preview, /function clear\(\) \{ return globalThis\.__motifPreviewHandlers\.clear/);
  assert.match(preview, /function paint\(\) \{ return globalThis\.__motifPreviewHandlers\.paint/);
});
