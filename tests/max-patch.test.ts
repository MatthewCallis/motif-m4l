import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

type Box = {
  id: string;
  presentation?: number;
  presentation_rect?: [number, number, number, number];
  patching_rect?: [number, number, number, number];
  text?: string;
  maxclass: string;
  numoutlets?: number;
  filename?: string;
  varname?: string;
  annotation?: string;
  annotation_name?: string;
  hint?: string;
};

type PatchLine = {
  source: [string, number];
  destination: [string, number];
};

async function readPatch(): Promise<{
  openinpresentation: number;
  devicewidth: number;
  boxes: Array<{ box: Box }>;
  lines: Array<{ patchline: PatchLine }>;
  dependency_cache: Array<{ name: string }>;
}> {
  return (JSON.parse(await readFile('max/Motif.maxpat', 'utf8')) as { patcher: ReturnType<typeof JSON.parse> }).patcher;
}

function boxByText(boxes: Array<{ box: Box }>, text: string): Box | undefined {
  return boxes.find(({ box }) => box.text === text)?.box;
}

function boxByVarname(boxes: Array<{ box: Box }>, varname: string): Box | undefined {
  return boxes.find(({ box }) => box.varname === varname)?.box;
}

function hasLine(lines: Array<{ patchline: PatchLine }>, source: Box, sourceOutlet: number, destination: Box, destinationInlet: number): boolean {
  return lines.some(({ patchline }) =>
    patchline.source[0] === source.id &&
    patchline.source[1] === sourceOutlet &&
    patchline.destination[0] === destination.id &&
    patchline.destination[1] === destinationInlet,
  );
}

test('generates a compact Max 9 device with native Song displays and a native preview', async () => {
  const patcher = await readPatch();
  const { boxes, lines } = patcher;

  assert.equal(patcher.openinpresentation, 1);
  assert.equal(patcher.devicewidth, 820);
  assert.ok(boxes.filter(({ box }) => box.presentation === 1).length >= 35);
  for (const { box } of boxes.filter(({ box }) => box.presentation === 1)) {
    const rect = box.presentation_rect;
    assert.ok(rect, `${box.varname ?? box.id} is missing a presentation rectangle`);
    const [x, y, width, height] = rect;
    assert.ok(x >= 0 && y >= 0, `${box.varname ?? box.id} starts outside the device`);
    assert.ok(x + width <= 820, `${box.varname ?? box.id} exceeds the device width`);
    assert.ok(y + height <= 169, `${box.varname ?? box.id} exceeds Live's fixed 169px height`);
  }

  const texts = boxes.map(({ box }) => box.text).filter((text): text is string => Boolean(text));
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

  assert.ok(texts.includes('prepend song_context'));
  assert.ok(texts.includes('deferlow'));
  assert.ok(!texts.some((text) => text === 'prepend host' || text.startsWith('prepend host_')));
  assert.ok(texts.includes('route Ready'));
  assert.ok(texts.includes('t b b b b b b b b b'));
  assert.ok(texts.includes('route event panic clear status error context motifs-reset motif-item motif-selected midi-pass ui'));
  assert.ok(texts.includes('route preview-pitches preview-range preview-notes preview-root motif-title motif-description motif-stats motif-tags'));
  assert.ok(texts.includes('pipe 0 0 0 0.'));

  const v8 = boxByText(boxes, 'v8 motif-device.js');
  assert.equal(v8?.numoutlets, 1);
  assert.ok(v8);
  assert.ok(lines.every(({ patchline }) => patchline.source[0] !== v8.id || patchline.source[1] === 0));

  const songContextIds = boxes
    .filter(({ box }) => box.text === 'prepend song_context')
    .map(({ box }) => box);
  assert.equal(songContextIds.length, 9);
  const songContextDestinationIds = new Set(
    songContextIds.flatMap((source) =>
      lines
        .filter(({ patchline }) => patchline.source[0] === source.id)
        .map(({ patchline }) => patchline.destination[0]),
    ),
  );
  assert.equal(songContextDestinationIds.size, 1, 'all Song context messages must share one deferred path');
  const songContextDefer = boxes.find(({ box }) => songContextDestinationIds.has(box.id))?.box;
  assert.equal(songContextDefer?.text, 'deferlow');
  assert.ok(songContextDefer && hasLine(lines, songContextDefer, 0, v8, 0));

  const rootDisplay = boxByVarname(boxes, 'root-display');
  const tempoDisplay = boxByVarname(boxes, 'tempo-display');
  assert.equal(rootDisplay?.maxclass, 'comment', 'root must be read-only text, not a dropdown');
  assert.equal(tempoDisplay?.maxclass, 'comment', 'tempo must be read-only text, not a parameter control');

  const preview = boxByVarname(boxes, 'motif-preview');
  assert.equal(preview?.maxclass, 'multislider');
  assert.equal(preview?.annotation_name, 'Motif Note Preview');
  assert.ok(preview?.annotation);
  assert.ok(preview?.hint);
  assert.ok(!boxes.some(({ box }) => box.maxclass === 'v8ui'), 'preview must not depend on a second JavaScript runtime');

  assert.deepEqual(patcher.dependency_cache.map(({ name }) => name), ['motif-device.js']);
  assert.ok(!JSON.stringify(patcher).match(/motif-(?:device|preview)-v\d/i));

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
    const control = boxByVarname(boxes, varname);
    assert.ok(control, `missing ${varname}`);
    assert.ok(control.annotation_name, `${varname} is missing annotation_name`);
    assert.ok(control.annotation, `${varname} is missing annotation`);
    assert.ok(control.hint, `${varname} is missing hint`);
  }
});

test('MIDI routing is fail-open and follows the documented midiselect pattern', async () => {
  const patcher = await readPatch();
  const { boxes, lines } = patcher;
  const midiin = boxByText(boxes, 'midiin');
  const inputGate = boxByText(boxes, 'gate 2 1');
  const bypassDefault = boxByText(boxes, 'loadmess 1');
  const engineMode = boxes.find(({ box }) => box.maxclass === 'message' && box.text === '2')?.box;
  const midiselect = boxByText(boxes, 'midiselect @ch all @note all');
  const midiflush = boxByText(boxes, 'midiflush');
  const midiout = boxByText(boxes, 'midiout');
  const readyRoute = boxByText(boxes, 'route Ready');

  assert.ok(midiin && inputGate && bypassDefault && engineMode && midiselect && midiflush && midiout && readyRoute);
  assert.ok(hasLine(lines, midiin, 0, inputGate, 1));
  assert.ok(hasLine(lines, bypassDefault, 0, inputGate, 0));
  assert.ok(hasLine(lines, inputGate, 0, midiflush, 0), 'raw MIDI must bypass JavaScript before Ready');
  assert.ok(hasLine(lines, inputGate, 1, midiselect, 0), 'Ready mode must feed native MIDI selection');
  assert.ok(hasLine(lines, midiselect, 7, midiflush, 0), 'unselected raw MIDI must pass directly to output');
  assert.ok(hasLine(lines, midiflush, 0, midiout, 0));

  const readyTriggerId = lines.find(({ patchline }) =>
    patchline.source[0] === readyRoute.id && patchline.source[1] === 0)?.patchline.destination[0];
  const readyTrigger = boxes.find(({ box }) => box.id === readyTriggerId)?.box;
  assert.equal(readyTrigger?.text, 't b b');
  assert.ok(readyTrigger);
  assert.ok(hasLine(lines, readyTrigger, 1, engineMode, 0));
  assert.ok(hasLine(lines, engineMode, 0, inputGate, 0));
});

test('compiled bundle exposes all real top-level Max handlers', async () => {
  const source = await readFile('dist/motif-device.js', 'utf8');
  for (const handler of ['initialize', 'note', 'sustain', 'song_context']) {
    assert.match(source, new RegExp(`function ${handler}\\(\\) \\{ return globalThis\\.__motifHandlers\\.${handler}`));
  }
  assert.match(source, /function anything\(\)/);
  assert.doesNotMatch(source, /function host(?:_|\()/);
});
