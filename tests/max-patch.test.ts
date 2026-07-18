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
  hidden?: number;
  livemode?: number;
  outputmode?: number;
  parameter_enable?: number;
  ignoreclick?: number;
  fontname?: string;
  saved_attribute_attributes?: { valueof?: { parameter_enum?: string[] } };
  patcher?: {
    boxes: Array<{ box: Box }>;
    lines: Array<{ patchline: PatchLine }>;
  };
};

type PatchLine = {
  source: [string, number];
  destination: [string, number];
};

async function readPatch(): Promise<{
  openinpresentation: number;
  devicewidth: number;
  default_fontname?: string;
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

function allBoxes(boxes: Array<{ box: Box }>): Box[] {
  const out: Box[] = [];
  for (const { box } of boxes) {
    out.push(box);
    if (box.patcher?.boxes) out.push(...allBoxes(box.patcher.boxes));
  }
  return out;
}

test('generates a compact Max 9 device with Motif/Settings tabs and native preview', async () => {
  const patcher = await readPatch();
  const { boxes, lines } = patcher;

  assert.equal(patcher.openinpresentation, 1);
  assert.equal(patcher.devicewidth, 480);
  assert.equal(patcher.default_fontname, 'Ableton Sans');
  assert.ok(boxes.filter(({ box }) => box.presentation === 1).length >= 24);
  for (const { box } of boxes.filter(({ box }) => box.presentation === 1)) {
    const rect = box.presentation_rect;
    assert.ok(rect, `${box.varname ?? box.id} is missing a presentation rectangle`);
    const [x, y, width, height] = rect;
    assert.ok(x >= 0 && y >= 0, `${box.varname ?? box.id} starts outside the device`);
    assert.ok(x + width <= 480, `${box.varname ?? box.id} exceeds the device width`);
    assert.ok(y + height <= 169, `${box.varname ?? box.id} exceeds Live's fixed 169px height`);
  }

  const texts = boxes.map(({ box }) => box.text).filter((text): text is string => Boolean(text));
  assert.ok(texts.includes('v8 motif-device.js'));
  assert.ok(texts.includes('live.path live_set'));
  assert.ok(texts.includes('live.observer'));
  assert.ok(texts.includes('pcontrol'));
  assert.ok(texts.includes('p library-info'));
  assert.ok(texts.includes('prepend tempo_multiplier'));
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
  assert.ok(texts.includes('route preview-size preview-pitches preview-range preview-notes preview-root motif-title motif-description motif-stats motif-tags'));
  assert.ok(texts.includes('prepend size'), 'preview column count must be set before setlist');
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
  assert.equal(rootDisplay?.maxclass, 'live.menu', 'root must use theme-default live.menu like Live’s Scale device');
  assert.equal(rootDisplay?.parameter_enable, 1, 'live.menu needs an enabled parameter to own its enum');
  assert.equal(rootDisplay?.ignoreclick, 1, 'root display must not be user-editable');
  assert.equal(boxByVarname(boxes, 'scale-name-display')?.maxclass, 'live.menu');
  assert.equal(boxByVarname(boxes, 'scale-name-display')?.ignoreclick, 1);
  assert.ok(!boxByVarname(boxes, 'scale-mode-display'), 'scale ♭♯ chip must be removed');
  assert.ok(!boxByVarname(boxes, 'tempo-display'), 'computed BPM readout must be removed from the Presentation UI');
  assert.ok(!boxByVarname(boxes, 'status-display'), 'debug status-display must not appear in the Presentation UI');
  assert.ok(!boxByVarname(boxes, 'preview-root-display'), 'anchor/debug metadata line must be removed from Presentation');
  assert.equal(boxByVarname(boxes, 'scale-label')?.maxclass, 'live.comment');
  assert.equal(boxByVarname(boxes, 'scale-label')?.text, 'Scale');
  assert.equal(boxByVarname(boxes, 'pitch-label')?.maxclass, 'live.comment');
  assert.equal(boxByVarname(boxes, 'pitch-label')?.text, 'Pitch');
  assert.equal(boxByVarname(boxes, 'tempo-mult-label')?.text, 'BPM ×');
  assert.ok(texts.includes('active 0') && texts.includes('active 1'), 'Scale menus must toggle active from Song.scale_mode');
  assert.ok(texts.some((text) => text.startsWith('§ ')), 'unlocked patcher should label major sections');

  const preview = boxByVarname(boxes, 'motif-preview');
  assert.equal(preview?.maxclass, 'multislider');
  assert.equal(preview?.annotation_name, 'Motif Note Preview');
  assert.ok(preview?.annotation);
  assert.ok(preview?.hint);
  assert.ok((preview?.presentation_rect?.[3] ?? 0) >= 80, 'preview contour should use the height freed by collapsing the control row');
  assert.ok(!boxes.some(({ box }) => box.maxclass === 'v8ui'), 'preview must not depend on a second JavaScript runtime');
  assert.ok(!JSON.stringify(patcher).includes('live_lcd_'), 'maxpat must not embed invalid live_lcd_* color tokens');

  const pageTab = boxByVarname(boxes, 'page-tab');
  assert.equal(pageTab?.maxclass, 'live.tab');
  assert.equal(pageTab?.livemode, 1, 'page tabs must use Live mode');

  const tempoMult = boxByVarname(boxes, 'tempo-mult-menu');
  assert.equal(tempoMult?.maxclass, 'live.menu');
  const motifMenu = boxByVarname(boxes, 'motif-menu');
  assert.ok((motifMenu?.presentation_rect?.[1] ?? 99) <= 8, 'selected motif must sit on the top control row');
  const pitchMenu = boxByVarname(boxes, 'pitch-menu');
  assert.ok(
    (pitchMenu?.presentation_rect?.[0] ?? 999) < (boxByVarname(boxes, 'root-display')?.presentation_rect?.[0] ?? 0),
    'pitch menu must sit to the left of the Scale menus',
  );
  const pitchEnum = pitchMenu?.saved_attribute_attributes?.valueof?.parameter_enum;
  assert.ok(pitchEnum?.includes('motif'), 'Pitch Mode first item is motif');
  assert.ok(!pitchEnum?.includes('auto'), 'Pitch Mode auto was renamed to motif');

  assert.ok(boxByText(boxes, 'p library-info')?.patcher, 'Library/Info floating window subpatcher is required');

  assert.deepEqual(patcher.dependency_cache.map(({ name }) => name), ['motif-device.js']);
  assert.ok(!JSON.stringify(patcher).match(/motif-(?:device|preview)-v\d/i));

  const controls = [
    'page-tab',
    'motif-menu',
    'pitch-menu',
    'tempo-mult-menu',
    'trigger-menu',
    'quant-menu',
    'pass-menu',
    'meter-tab',
    'retrigger-tab',
    'low-number',
    'high-number',
    'info-button',
    'panic-button',
  ];
  for (const varname of controls) {
    const control = boxByVarname(boxes, varname);
    assert.ok(control, `missing ${varname}`);
    assert.ok(control.annotation_name, `${varname} is missing annotation_name`);
    assert.ok(control.annotation, `${varname} is missing annotation`);
    assert.ok(control.hint, `${varname} is missing hint`);
  }

  const nested = allBoxes(boxes);
  for (const varname of ['choose-library', 'refresh-button', 'motif-title-display', 'motif-description-display']) {
    const control = nested.find((box) => box.varname === varname);
    assert.ok(control, `missing nested ${varname}`);
    if (varname === 'choose-library' || varname === 'refresh-button') {
      assert.ok(control.annotation_name, `${varname} is missing annotation_name`);
      assert.equal(control.outputmode, 1, `${varname} should use Mouse Up output`);
    }
  }

  for (const varname of ['trigger-menu', 'quant-menu', 'pass-menu', 'meter-tab', 'retrigger-tab', 'low-number', 'high-number']) {
    assert.equal(boxByVarname(boxes, varname)?.hidden, 1, `${varname} should start hidden on the Settings tab`);
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

test('compiled bundle uses one hand-written top-level Max dispatcher', async () => {
  const source = await readFile('dist/motif-device.js', 'utf8');
  assert.match(source.slice(0, 600), /var inlets = 1;[\s\S]*var outlets = 1;[\s\S]*function anything\(\)/);
  assert.match(source, /var message = messagename;/);
  assert.match(source, /arrayfromargs\(arguments\)/);
  assert.match(source, /MotifEngine\.dispatch\(message, args\)/);
  assert.doesNotMatch(source.slice(0, source.indexOf('"use strict";')), /function song_context\(/);
  assert.doesNotMatch(source, /__motifHandlers/);
  assert.doesNotMatch(source, /function host(?:_|\()/);
});
