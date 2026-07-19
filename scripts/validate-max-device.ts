/**
 * Static assertions over the generated Max device (`max/Motif.maxpat` + `motif-device.js`).
 *
 * Guards the contributor contracts that are easy to break in the patch generator
 * or bridge: Presentation bounds (169px), unversioned runtime filenames, fail-open
 * MIDI graph, native Song observers (no JS LiveAPI for Song sync), and a single
 * top-level `anything()` — not per-message globals or esbuild footer handlers.
 *
 * Run via `npm run validate:max` (also part of `npm run verify`).
 *
 * @see https://github.com/Ableton/maxdevtools/tree/main/m4l-production-guidelines
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

type Rect = [number, number, number, number];

type MaxBox = {
  id: string;
  maxclass: string;
  text?: string;
  varname?: string;
  presentation?: number;
  presentation_rect?: Rect;
  livemode?: number;
  patcher?: {
    openinpresentation?: number;
    rect?: [number, number, number, number];
    boxes?: Array<{ box: MaxBox }>;
  };
};

type PatchLine = {
  source: [string, number];
  destination: [string, number];
};

type Patcher = {
  openinpresentation: number;
  devicewidth: number;
  default_fontname?: string;
  boxes: Array<{ box: MaxBox }>;
  lines: Array<{ patchline: PatchLine }>;
  dependency_cache: Array<{ name: string }>;
};

const DEVICE_HEIGHT = 169;
const patch = (JSON.parse(await readFile('max/Motif.maxpat', 'utf8')) as { patcher: Patcher }).patcher;
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

const byText = (text: string): MaxBox | undefined => boxes.find((box) => box.text === text);
const byVarname = (varname: string): MaxBox | undefined => boxes.find((box) => box.varname === varname);
const hasLine = (
  source: MaxBox | undefined,
  sourceOutlet: number,
  destination: MaxBox | undefined,
  destinationInlet: number,
): boolean =>
  Boolean(
    source &&
      destination &&
      lines.some(
        (line) =>
          line.source[0] === source.id &&
          line.source[1] === sourceOutlet &&
          line.destination[0] === destination.id &&
          line.destination[1] === destinationInlet,
      ),
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

assert.equal(patch.devicewidth, 480, 'device width should be the compact 480px Presentation width');
assert.equal(patch.default_fontname, 'Ableton Sans', 'device should use Ableton Sans');
assert.equal(byVarname('root-display')?.maxclass, 'live.menu', 'root must be theme-default live.menu');
assert.equal(byVarname('scale-name-display')?.maxclass, 'live.menu', 'scale name must be theme-default live.menu');
assert.ok(!byVarname('scale-mode-display'), 'scale ♭♯ chip must not appear');
assert.ok(!byVarname('tempo-display'), 'Presentation UI must not show a BPM readout');
assert.ok(!byVarname('status-display'), 'Presentation UI must not show debug status text');
assert.equal(byVarname('scale-label')?.maxclass, 'live.comment');
assert.equal(byVarname('scale-label')?.text, 'Scale', 'Scale strip label is required');
assert.equal(byVarname('pitch-label')?.text, 'Pitch', 'Pitch label is required beside Scale');
assert.equal(byVarname('tempo-mult-label')?.text, 'BPM ×', 'BPM multiplier label must be BPM ×');
assert.ok(boxes.some((box) => box.text === 'active 0'), 'Scale menus need active 0 when scale mode is off');
assert.equal(byVarname('motif-preview')?.maxclass, 'multislider', 'preview must use a native multislider');
assert.equal(byVarname('page-tab')?.maxclass, 'live.tab', 'Motif/Settings page tabs are required');
assert.equal(byVarname('page-tab')?.livemode, 1, 'page tabs must enable Live mode');
assert.equal(byVarname('tempo-mult-menu')?.maxclass, 'live.menu', 'BPM multiplier menu is required');
assert.ok(byText('p library-info')?.patcher, 'Library/Authoring floating subpatcher is required');
assert.ok(byText('pcontrol'), 'floating window must use pcontrol');
assert.ok(byText('window size 640 460'), 'authoring float window size must be 640×460');
assert.ok(byText('receive ---motif_author'), 'authoring controls must feed v8 via ---motif_author');
assert.ok(byText('prepend tempo_multiplier'), 'BPM multiplier must be wired to the engine');
assert.ok(!boxes.some((box) => box.maxclass === 'v8ui'), 'core preview must not depend on v8ui');
assert.ok(!JSON.stringify(patch).includes('live_lcd_'), 'maxpat must not embed invalid live_lcd_* color tokens');
assert.ok(!JSON.stringify(patch).includes('jit.'), 'maxpat must not embed Jitter objects (breaks M4L load)');
assert.equal(byText('p library-info')?.patcher?.openinpresentation, 1, 'Library window must open in Presentation Mode');
const libraryBoxes = byText('p library-info')?.patcher?.boxes ?? [];
const libraryVarnames = new Set(libraryBoxes.map((entry) => entry.box.varname).filter(Boolean));
for (const varname of [
  'motif-search',
  'clear-search-button',
  'browser-list',
  'name-edit',
  'description-edit',
  'edit-button',
  'import-clip-button',
  'save-motif-button',
  'add-note-button',
  'nr0-pitch',
  'nr0-acc',
  'nr0-start',
  'nr0-dur',
  'nr0-gate',
  'nr0-vel',
  'nr0-remove',
]) {
  assert.ok(libraryVarnames.has(varname), `library subpatcher missing ${varname}`);
}
assert.equal(byText('p library-info')?.patcher?.rect?.[2], 640, 'library float patcher width must be 640');
assert.equal(byText('p library-info')?.patcher?.rect?.[3], 460, 'library float patcher height must be 460');
assert.ok((byVarname('motif-preview')?.presentation_rect?.[3] ?? 0) >= 60, 'preview contour must be tall enough to read');

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
assert.ok(contextDefer && lines.some((line) => line.source[0] === contextDefer.id && line.destination[0] === v8.id), 'deferred Song context does not feed v8');

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
