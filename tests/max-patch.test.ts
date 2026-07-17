import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('generates a polished Max 9 presentation patch with native Live observers', async () => {
  const document = JSON.parse(await readFile('max/Motif.maxpat', 'utf8')) as {
    patcher: {
      openinpresentation: number;
      devicewidth: number;
      boxes: Array<{ box: { presentation?: number; text?: string; maxclass: string } }>;
    };
  };
  const patcher = document.patcher;
  assert.equal(patcher.openinpresentation, 1);
  assert.equal(patcher.devicewidth, 900);
  assert.ok(patcher.boxes.filter(({ box }) => box.presentation === 1).length >= 40);

  const texts = patcher.boxes.map(({ box }) => box.text).filter(Boolean);
  assert.ok(texts.includes('v8 motif-device.js'));
  assert.ok(texts.includes('presentation 1'));
  assert.ok(texts.includes('live.path live_set'));
  assert.ok(texts.includes('live.observer tempo'));
  assert.ok(texts.includes('live.observer root_note'));
  assert.ok(texts.includes('live.observer scale_name'));
  assert.ok(texts.includes('live.observer scale_intervals'));
  assert.ok(texts.includes('live.observer signature_numerator'));
  assert.ok(texts.includes('live.observer signature_denominator'));
  assert.ok(texts.includes('live.observer is_playing'));
  assert.ok(texts.includes('route ticks ms'));
  assert.ok(texts.includes('pipe 0 0 0 @delaytime 0 ticks'));
  assert.ok(texts.includes('route panic clear status error context host-key host-tempo host-meter host-transport motifs-reset motif-item motif-selected midi-pass'));

  const classes = patcher.boxes.map(({ box }) => box.maxclass);
  assert.ok(classes.filter((value) => value === 'live.menu').length >= 4);
  assert.ok(classes.filter((value) => value === 'live.tab').length >= 2);
  assert.ok(classes.filter((value) => value === 'live.numbox').length >= 2);
  assert.ok(classes.filter((value) => value === 'live.text').length >= 3);
});
