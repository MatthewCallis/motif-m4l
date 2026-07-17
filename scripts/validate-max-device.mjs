import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const DEVICE_HEIGHT = 169;
const patch = JSON.parse(await readFile('max/Motif.maxpat', 'utf8')).patcher;
const boxes = patch.boxes.map(({ box }) => box);
const lines = patch.lines.map(({ patchline }) => patchline);

assert.equal(patch.openinpresentation, 1, 'device must open in Presentation Mode');
assert.ok(Number.isFinite(patch.devicewidth) && patch.devicewidth > 0, 'devicewidth must be fixed');

for (const box of boxes.filter((item) => item.presentation === 1)) {
  const rect = box.presentation_rect;
  assert.ok(Array.isArray(rect) && rect.length === 4, `${box.varname ?? box.id}: missing presentation_rect`);
  const [x, y, width, height] = rect;
  assert.ok(x >= 0 && y >= 0, `${box.varname ?? box.id}: negative Presentation position`);
  assert.ok(x + width <= patch.devicewidth, `${box.varname ?? box.id}: exceeds device width`);
  assert.ok(y + height <= DEVICE_HEIGHT, `${box.varname ?? box.id}: exceeds Live's ${DEVICE_HEIGHT}px height`);
}

const byText = (text) => boxes.find((box) => box.text === text);
const byVarname = (varname) => boxes.find((box) => box.varname === varname);
const hasLine = (source, sourceOutlet, destination, destinationInlet) => lines.some((line) =>
  line.source[0] === source.id &&
  line.source[1] === sourceOutlet &&
  line.destination[0] === destination.id &&
  line.destination[1] === destinationInlet,
);

const v8 = byText('v8 motif-device.js');
const midiin = byText('midiin');
const inputGate = byText('gate 2 1');
const bypassDefault = byText('loadmess 1');
const midiselect = byText('midiselect @ch all @note all');
const midiflush = byText('midiflush');
const midiout = byText('midiout');
assert.ok(v8, 'missing v8 motif-device.js');
assert.ok(midiin && inputGate && bypassDefault && midiselect && midiflush && midiout, 'missing native MIDI routing object');
assert.ok(hasLine(midiin, 0, inputGate, 1), 'midiin does not feed fail-open gate');
assert.ok(hasLine(bypassDefault, 0, inputGate, 0), 'fail-open gate has no startup selection');
assert.ok(hasLine(inputGate, 0, midiflush, 0), 'raw startup bypass is missing');
assert.ok(hasLine(inputGate, 1, midiselect, 0), 'engine MIDI route is missing');
assert.ok(hasLine(midiselect, 7, midiflush, 0), 'unselected raw MIDI is not passed through');
assert.ok(hasLine(midiflush, 0, midiout, 0), 'MIDI output chain is incomplete');

assert.equal(byVarname('root-display')?.maxclass, 'comment', 'root display must be read-only text');
assert.equal(byVarname('tempo-display')?.maxclass, 'comment', 'tempo display must be read-only text');
assert.equal(byVarname('motif-preview')?.maxclass, 'multislider', 'preview must use a native multislider');
assert.ok(!boxes.some((box) => box.maxclass === 'v8ui'), 'core preview must not depend on v8ui');

const contextSources = boxes.filter((box) => box.text === 'prepend song_context');
assert.equal(contextSources.length, 9, 'expected nine Song context properties');
const contextDestinationIds = new Set(
  contextSources.flatMap((source) =>
    lines.filter((line) => line.source[0] === source.id).map((line) => line.destination[0]),
  ),
);
assert.equal(contextDestinationIds.size, 1, 'Song context messages must share one deferred path');
const contextDefer = boxes.find((box) => contextDestinationIds.has(box.id));
assert.equal(contextDefer?.text, 'deferlow', 'Song context path must be deferred');
assert.ok(lines.some((line) => line.source[0] === contextDefer.id && line.destination[0] === v8.id), 'deferred Song context does not feed v8');

assert.deepEqual(patch.dependency_cache.map(({ name }) => name), ['motif-device.js']);
assert.ok(!JSON.stringify(patch).match(/motif-(?:device|preview)-v\d/i), 'versioned runtime dependency found');

const source = await readFile('dist/motif-device.js', 'utf8');
assert.match(
  source.slice(0, 600),
  /var inlets = 1;[\s\S]*var outlets = 1;[\s\S]*function anything\(\)/,
  'hand-written Max bridge must be the first code in the compiled file',
);
assert.match(source, /var message = messagename;/, 'bridge must use Max messagename');
assert.match(source, /arrayfromargs\(arguments\)/, 'bridge must normalize Max arguments');
assert.match(source, /MotifEngine\.dispatch\(message, args\)/, 'bridge must use the single engine dispatcher');
assert.doesNotMatch(
  source.slice(0, source.indexOf('"use strict";')),
  /function song_context\(/,
  'named Max handlers must not be generated in the Max bridge',
);
assert.doesNotMatch(source, /__motifHandlers/, 'legacy global handler table found');
assert.doesNotMatch(source, /function host(?:_|\()/, 'legacy host handler found');

console.log(`Validated Motif.maxpat: ${patch.devicewidth}×${DEVICE_HEIGHT}, fail-open MIDI, native host displays, native preview.`);
