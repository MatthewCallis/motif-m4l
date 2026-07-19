import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

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
  rendermode?: number;
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
  assert.ok(texts.includes('route lib preview'), 'ui-route must handle library and preview state');
  assert.ok(texts.includes('window size 640 460'));
  assert.ok(texts.filter((text) => text === 'window size 640 460').length >= 2, 'size must be applied before and after open');
  assert.ok(texts.includes('receive ---motif_author'));
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
  const previewReadyRoute = boxByText(boxes, 'route preview_ready preview_debug');
  const previewReadyMessage = boxes.find(({ box }) => box.maxclass === 'message' && box.text === 'preview_ready')?.box;
  const previewDebugPage = boxByText(boxes, 'prepend preview');
  const previewDebugPrepend = boxByText(boxes, 'prepend web_debug');
  assert.ok(preview && previewReadyRoute && previewReadyMessage && previewDebugPage && previewDebugPrepend);
  assert.equal(preview.maxclass, 'jsui', 'preview must use native jsui rather than jweb in Live');
  assert.equal(preview.filename, 'motif-preview.js');
  assert.equal(preview.ignoreclick, 0, 'preview diagnostics must remain clickable in locked Presentation Mode');
  assert.ok(!boxByText(boxes, 'readfile preview.html'), 'native preview must not load an external HTML page');
  assert.ok(hasLine(lines, preview, 0, previewReadyRoute, 0), 'preview output must route readiness and diagnostics');
  assert.ok(hasLine(lines, previewReadyRoute, 0, previewReadyMessage, 0));
  assert.ok(hasLine(lines, previewReadyMessage, 0, v8, 0), 'preview readiness must request fresh engine state');
  assert.ok(hasLine(lines, previewReadyRoute, 1, previewDebugPage, 0));
  assert.ok(hasLine(lines, previewDebugPage, 0, previewDebugPrepend, 0));
  assert.ok(hasLine(lines, previewDebugPrepend, 0, v8, 0), 'native preview diagnostics must reach the engine');
  assert.equal(preview.annotation_name, 'Motif Note Preview');
  assert.ok(preview.annotation);
  assert.ok(preview.hint);
  assert.ok((preview.presentation_rect?.[3] ?? 0) >= 80, 'preview contour should use the height freed by collapsing the control row');
  assert.ok(!boxes.some(({ box }) => box.maxclass === 'v8ui'), 'preview must not depend on v8ui');
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

  const libraryPatcher = boxByText(boxes, 'p library-info')?.patcher;
  assert.ok(libraryPatcher, 'Library/Info floating window subpatcher is required');

  assert.deepEqual(
    patcher.dependency_cache.map(({ name }) => name),
    ['motif-device.js', 'motif-preview.js', 'library.html'],
  );
  assert.ok(!JSON.stringify(patcher).match(/motif-(?:device|preview)-v\d/i));
  assert.ok(!JSON.stringify(patcher).includes('file://'), 'patch must not embed platform-specific file URLs');
  assert.ok(!JSON.stringify(patcher).includes('Patcher:/'), 'invalid Patcher:/ pseudo-path must not be generated');
  assert.ok(
    !JSON.stringify(patcher).includes('prepend call receiveData'),
    'jweb state must use a bound inlet selector rather than JavaScript call injection',
  );

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
  // Library window is now a single jweb object — check it exists.
  const jwebLibrary = nested.find((box) => box.varname === 'jweb-library');
  assert.ok(jwebLibrary, 'library subpatcher must contain a jweb-library object');
  assert.equal(jwebLibrary?.maxclass, 'jweb', 'jweb-library must be a jweb object');
  const libraryLoad = boxByText(libraryPatcher.boxes, 'loadmess readfile library.html');
  const libraryRoute = boxByText(libraryPatcher.boxes, 'route choose_library library_ready web_debug lib_action url title');
  const libraryReadyMessage = libraryPatcher.boxes.find(({ box }) =>
    box.maxclass === 'message' && box.text === 'library_ready')?.box;
  const libraryAction = boxByText(libraryPatcher.boxes, 'prepend lib_action');
  const libraryAuthorSend = boxByText(libraryPatcher.boxes, 'send ---motif_author');
  const libraryDebugSend = boxByText(libraryPatcher.boxes, 'send ---motif_web_debug');
  const libraryTitle = boxByText(libraryPatcher.boxes, 'loadmess title "Motif Library"');
  const libraryReceiveData = boxByText(libraryPatcher.boxes, 'receive ---lib-data');
  assert.ok(
    libraryLoad &&
      libraryRoute &&
      libraryReadyMessage &&
      libraryAction &&
      libraryAuthorSend &&
      libraryDebugSend &&
      libraryTitle &&
      libraryReceiveData,
  );
  assert.ok(hasLine(libraryPatcher.lines, libraryLoad, 0, jwebLibrary, 0));
  assert.equal(jwebLibrary.rendermode, 0, 'library must use offscreen jweb rendering in Live');
  assert.ok(hasLine(libraryPatcher.lines, libraryReceiveData, 0, jwebLibrary, 0));
  assert.ok(hasLine(libraryPatcher.lines, jwebLibrary, 0, libraryRoute, 0));
  assert.ok(hasLine(libraryPatcher.lines, libraryRoute, 1, libraryReadyMessage, 0));
  assert.ok(hasLine(libraryPatcher.lines, libraryReadyMessage, 0, libraryAuthorSend, 0));
  assert.ok(hasLine(libraryPatcher.lines, libraryRoute, 2, libraryDebugSend, 0));
  assert.ok(hasLine(libraryPatcher.lines, libraryRoute, 3, libraryAction, 0));

  const libraryInfo = boxByText(boxes, 'p library-info');
  const libraryPcontrol = boxByText(boxes, 'pcontrol');
  const libraryOpen = boxes.find(({ box }) => box.maxclass === 'message' && box.text === 'open')?.box;
  assert.ok(libraryInfo && libraryPcontrol && libraryOpen);
  assert.ok(hasLine(lines, libraryOpen, 0, libraryPcontrol, 0), 'only open should be sent to pcontrol');
  for (const text of ['window flags float', 'window size 640 460', 'window exec']) {
    for (const { box } of boxes.filter(({ box }) => box.text === text)) {
      assert.ok(hasLine(lines, box, 0, libraryInfo, 0), `${text} must be forwarded to the subpatch thispatcher`);
      assert.ok(!hasLine(lines, box, 0, libraryPcontrol, 0), `${text} must never be sent to pcontrol`);
    }
  }

  for (const varname of ['trigger-menu', 'quant-menu', 'pass-menu', 'meter-tab', 'retrigger-tab', 'low-number', 'high-number']) {
    assert.equal(boxByVarname(boxes, varname)?.hidden, 1, `${varname} should start hidden on the Settings tab`);
  }
});

test('library jweb binds receiveData before readiness and contains valid diagnostic JavaScript', async () => {
  const libraryHtml = await readFile('max/library.html', 'utf8');
  const bindIndex = libraryHtml.indexOf("window.max.bindInlet('receiveData', receiveData)");
  const readyIndex = libraryHtml.indexOf("window.max.outlet('library_ready')");
  const script = libraryHtml.match(/<script>([\s\S]*?)<\/script>/)?.[1];

  assert.ok(script, 'library must contain an inline script');
  assert.doesNotThrow(() => new vm.Script(script, { filename: 'library.html' }), 'library JavaScript must parse');
  assert.ok(bindIndex >= 0, 'library must bind the receiveData inlet');
  assert.ok(readyIndex > bindIndex, 'library must announce readiness after binding receiveData');
  assert.ok(libraryHtml.includes("window.max.outlet('web_debug'"), 'library must report diagnostics to Max');
  assert.ok(libraryHtml.includes("window.addEventListener('error'"), 'library must capture JavaScript errors');
  assert.ok(libraryHtml.includes("window.addEventListener('unhandledrejection'"), 'library must capture promise rejections');
  assert.ok(!libraryHtml.includes('window.receiveData = receiveData'), 'library must not rely on an unbound global function');
  assert.ok(!libraryHtml.includes("outlet.toString().includes('console.log')"), 'library must not infer Max from source text');
  assert.ok(libraryHtml.includes('No library state received within 2 seconds'), 'library must report missing state');
  assert.ok(
    libraryHtml.includes("window.max.outlet('lib_action', encodeURIComponent(JSON.stringify(action)))"),
    'library actions must use an explicit selector',
  );
});

test('native preview script parses and exposes state, readiness, and diagnostics handlers', async () => {
  const previewScript = await readFile('max/motif-preview.js', 'utf8');

  assert.doesNotThrow(() => new vm.Script(previewScript, { filename: 'motif-preview.js' }));
  assert.match(previewScript, /mgraphics\.init\(\)/);
  assert.match(previewScript, /function receiveData\(\)/);
  assert.match(previewScript, /function loadbang\(\)/);
  assert.match(previewScript, /outlet\(0, "preview_ready"\)/);
  assert.match(previewScript, /outlet\(0, "preview_debug", level/);
  assert.match(previewScript, /function paint\(\)/);
  assert.doesNotMatch(previewScript, /window\.max|readfile|preview\.html/);
});

test('native preview executes and renders a valid payload without jweb', async () => {
  const previewScript = await readFile('max/motif-preview.js', 'utf8');
  const outletMessages: unknown[][] = [];
  const errors: string[] = [];
  const drawingMethods = [
    'init',
    'rectangle',
    'fill',
    'set_source_rgba',
    'set_line_width',
    'move_to',
    'line_to',
    'stroke',
    'select_font_face',
    'set_font_size',
    'show_text',
    'redraw',
  ];
  const mgraphics = Object.fromEntries(drawingMethods.map((name) => [name, () => undefined])) as Record<string, unknown>;
  mgraphics.text_measure = (value: string) => [String(value).length * 5, 10];

  const context = vm.createContext({
    mgraphics,
    box: { rect: [0, 0, 456, 92] },
    outlet: (...values: unknown[]) => outletMessages.push(values),
    post: () => undefined,
    error: (message: string) => errors.push(message),
    arrayfromargs: (values: IArguments) => Array.from(values),
    encodeURIComponent,
    decodeURIComponent,
    JSON,
    Math,
    Number,
    String,
    TypeError,
    Array,
    isFinite,
  });

  new vm.Script(previewScript, { filename: 'motif-preview.js' }).runInContext(context);
  (context.loadbang as () => void)();
  assert.ok(outletMessages.some((message) => message[1] === 'preview_ready'));

  const payload = encodeURIComponent(JSON.stringify({
    notes: [
      { pitch: 60, atTicks: 0, durationTicks: 480 },
      { pitch: 63, atTicks: 480, durationTicks: 480 },
    ],
    totalTicks: 960,
    lowPitch: 59,
    highPitch: 64,
    noteNames: 'C3  ·  D♯3',
  }));
  (context.receiveData as (value: string) => void)(payload);
  (context.paint as () => void)();

  assert.equal(errors.length, 0);
  assert.ok(outletMessages.some((message) => message[1] === 'preview_debug' && message[2] === 'ok'));
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
