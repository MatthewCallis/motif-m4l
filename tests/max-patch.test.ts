import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';
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
  template?: string;
  varname?: string;
  annotation?: string;
  annotation_name?: string;
  hint?: string;
  hidden?: number;
  livemode?: number;
  outputmode?: number;
  parameter_enable?: number;
  ignoreclick?: number;
  border?: number;
  jsarguments?: number[];
  rendermode?: number;
  fontname?: string;
  url?: string;
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

describe('Motif Max patch integration', () => {
  it('generates a compact Max 9 device with Motif/Settings tabs and native preview', async () => {
    const patcher = await readPatch();
    const { boxes, lines } = patcher;
    const dependencyNames = patcher.dependency_cache.map(({ name }) => name);
    const engineFilename = dependencyNames.find((name) => /^motif-device-[a-f0-9]{12}\.js$/.test(name));
    const previewFilename = dependencyNames.find((name) => /^motif-preview-[a-f0-9]{12}\.js$/.test(name));
    assert.ok(engineFilename && previewFilename, 'runtime dependencies must use content-addressed filenames');
    const engineSource = await readFile(`max/${engineFilename}`, 'utf8');
    const previewSource = await readFile(`max/${previewFilename}`, 'utf8');
    assert.equal(engineSource, await readFile('dist/motif-device.js', 'utf8'));
    assert.equal(previewSource, await readFile('src/max/motif-preview.js', 'utf8'));
    assert.equal(
      engineFilename,
      `motif-device-${createHash('sha256').update(engineSource).digest('hex').slice(0, 12)}.js`,
    );
    assert.equal(
      previewFilename,
      `motif-preview-${createHash('sha256').update(previewSource).digest('hex').slice(0, 12)}.js`,
    );
    const v8Text = `v8 ${engineFilename}`;

    assert.equal(patcher.openinpresentation, 1);
    assert.equal(patcher.devicewidth, 475);
    assert.equal(patcher.default_fontname, 'Ableton Sans');
    assert.ok(boxes.filter(({ box }) => box.presentation === 1).length >= 24);
    for (const { box } of boxes.filter(({ box }) => box.presentation === 1)) {
      const rect = box.presentation_rect;
      assert.ok(rect, `${box.varname ?? box.id} is missing a presentation rectangle`);
      const [x, y, width, height] = rect;
      assert.ok(x >= 0 && y >= 0, `${box.varname ?? box.id} starts outside the device`);
      assert.ok(x + width <= patcher.devicewidth, `${box.varname ?? box.id} exceeds the device width`);
      assert.ok(y + height <= 169, `${box.varname ?? box.id} exceeds Live's fixed 169px height`);
    }

    const texts = boxes.map(({ box }) => box.text).filter((text): text is string => Boolean(text));
    assert.ok(texts.includes(v8Text));
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
    assert.ok(texts.includes('route event panic clear status error context motifs-reset motif-item motif-selected midi-pass ui library-page'));
    assert.ok(texts.includes('route lib preview'), 'ui-route must handle library and preview state');
    assert.ok(texts.includes('window size 640 460'));
    assert.ok(texts.includes('window flags float nogrow close zoom'));
    assert.ok(!texts.includes('window flags float grow close zoom'));
    assert.ok(texts.filter((text) => text === 'window size 640 460').length >= 2, 'size must be applied before and after open');
    assert.ok(texts.includes('receive ---motif_author'));
    assert.ok(texts.includes('pipe 0 0 0 0.'));

    const v8 = boxByText(boxes, v8Text);
    assert.equal(v8?.numoutlets, 1);
    assert.ok(v8);
    assert.ok(lines.every(({ patchline }) => patchline.source[0] !== v8.id || patchline.source[1] === 0));

    const engineRoute = boxByText(boxes, 'route event panic clear status error context motifs-reset motif-item motif-selected midi-pass ui library-page');
    assert.ok(engineRoute);
    assert.ok(!boxByText(boxes, 'prepend delete_file'));
    assert.ok(!boxByText(boxes, 'node.script motif-file-service.cjs @autostart 1 @restart 1'));

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
    const previewLoadMessage = boxByText(boxes, `jsfile ${previewFilename}, loadbang`);
    const previewDebugPage = boxByText(boxes, 'prepend preview');
    const previewDebugPrepend = boxByText(boxes, 'prepend web_debug');
    const engineReadyRoute = boxByText(boxes, 'route Ready');
    const readyTriggerId = engineReadyRoute
      ? lines.find(({ patchline }) =>
        patchline.source[0] === engineReadyRoute.id && patchline.source[1] === 0)?.patchline.destination[0]
      : undefined;
    const readyTrigger = boxes.find(({ box }) => box.id === readyTriggerId)?.box;
    assert.ok(
      preview
      && previewReadyRoute
      && previewReadyMessage
      && previewLoadMessage
      && previewDebugPage
      && previewDebugPrepend
      && readyTrigger,
    );
    assert.equal(preview.maxclass, 'jsui', 'preview must use native jsui rather than jweb in Live');
    assert.equal(preview.filename, previewFilename);
    assert.equal(preview.template, previewFilename, 'preview must never fall back to Max’s stock radial dial');
    assert.equal(preview.border, 0, 'preview draws its own rounded border in motif-preview.js');
    assert.deepEqual(preview.jsarguments, [6, 1], 'preview chrome radius and border are forwarded to jsui');
    assert.equal(preview.ignoreclick, 0, 'preview diagnostics must remain clickable in locked Presentation Mode');
    assert.ok(!boxByText(boxes, 'readfile preview.html'), 'native preview must not load an external HTML page');
    assert.ok(hasLine(lines, preview, 0, previewReadyRoute, 0), 'preview output must route readiness and diagnostics');
    assert.ok(hasLine(lines, previewReadyRoute, 0, previewReadyMessage, 0));
    assert.ok(hasLine(lines, previewReadyMessage, 0, v8, 0), 'preview readiness must request fresh engine state');
    assert.ok(hasLine(lines, readyTrigger, 2, previewLoadMessage, 0), 'engine readiness must reload the frozen jsui dependency');
    assert.ok(hasLine(lines, previewLoadMessage, 0, preview, 0), 'the explicit jsfile message must target the preview');
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
      [engineFilename, previewFilename],
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
    // Library window is now a single jweb object - check it exists.
    const jwebLibrary = nested.find((box) => box.varname === 'jweb-library');
    assert.ok(jwebLibrary, 'library subpatcher must contain a jweb-library object');
    assert.equal(jwebLibrary?.maxclass, 'jweb', 'jweb-library must be a jweb object');
    assert.equal(jwebLibrary.url, undefined, 'jweb must not navigate through an unsupported URL attribute');
    assert.ok(
      !JSON.stringify(libraryPatcher).includes('data:text/html'),
      'jweb must not receive a data URI',
    );
    const libraryInlet = libraryPatcher.boxes.find(({ box }) => box.maxclass === 'inlet')?.box;
    const libraryInletRoute = boxByText(libraryPatcher.boxes, 'route library_page');
    const libraryReadfilePrepend = boxByText(libraryPatcher.boxes, 'prepend readfile');
    const libraryThispatcher = boxByText(libraryPatcher.boxes, 'thispatcher');
    const libraryRoute = boxByText(libraryPatcher.boxes, 'route choose_library library_ready web_debug lib_action url title');
    const libraryReadyMessage = libraryPatcher.boxes.find(({ box }) =>
      box.maxclass === 'message' && box.text === 'library_ready')?.box;
    const libraryAction = boxByText(libraryPatcher.boxes, 'prepend lib_action');
    const libraryAuthorSend = boxByText(libraryPatcher.boxes, 'send ---motif_author');
    const libraryDebugSend = boxByText(libraryPatcher.boxes, 'send ---motif_web_debug');
    const libraryTitle = boxByText(libraryPatcher.boxes, 'loadmess title "Motif Library"');
    const libraryReceiveData = boxByText(libraryPatcher.boxes, 'receive ---lib-data');
    assert.ok(
      libraryInlet &&
        libraryInletRoute &&
        libraryReadfilePrepend &&
        libraryThispatcher &&
        libraryRoute &&
        libraryReadyMessage &&
        libraryAction &&
        libraryAuthorSend &&
        libraryDebugSend &&
        libraryTitle &&
        libraryReceiveData,
    );
    assert.equal(jwebLibrary.rendermode, 1, 'standalone library window must use onscreen jweb rendering');
    assert.ok(!('autosize' in jwebLibrary), 'library jweb must avoid undocumented sizing attributes');
    assert.ok(hasLine(libraryPatcher.lines, libraryInlet, 0, libraryInletRoute, 0));
    assert.ok(hasLine(libraryPatcher.lines, libraryInletRoute, 0, libraryReadfilePrepend, 0));
    assert.ok(hasLine(libraryPatcher.lines, libraryReadfilePrepend, 0, jwebLibrary, 0));
    assert.ok(hasLine(libraryPatcher.lines, libraryInletRoute, 1, libraryThispatcher, 0));
    assert.ok(hasLine(libraryPatcher.lines, libraryReceiveData, 0, jwebLibrary, 0));
    assert.ok(hasLine(libraryPatcher.lines, jwebLibrary, 0, libraryRoute, 0));
    assert.ok(hasLine(libraryPatcher.lines, libraryRoute, 1, libraryReadyMessage, 0));
    assert.ok(hasLine(libraryPatcher.lines, libraryReadyMessage, 0, libraryAuthorSend, 0));
    assert.ok(hasLine(libraryPatcher.lines, libraryRoute, 2, libraryDebugSend, 0));
    assert.ok(hasLine(libraryPatcher.lines, libraryRoute, 3, libraryAction, 0));

    const libraryInfo = boxByText(boxes, 'p library-info');
    const libraryPcontrol = boxByText(boxes, 'pcontrol');
    const libraryOpenTrigger = boxByText(boxes, 't b b b b b b');
    const libraryClose = boxes.find(({ box }) => box.maxclass === 'message' && box.text === 'close')?.box;
    const infoTrigger = libraryClose
      ? boxes.find(({ box }) => box.text === 't b b' && hasLine(lines, box, 1, libraryClose, 0))?.box
      : undefined;
    const libraryReopenDefer = libraryOpenTrigger
      ? boxes.find(({ box }) => box.text === 'deferlow' && hasLine(lines, box, 0, libraryOpenTrigger, 0))?.box
      : undefined;
    const libraryOpen = boxes.find(({ box }) => box.maxclass === 'message' && box.text === 'open')?.box;
    const libraryPrepare = boxes.find(({ box }) =>
      box.maxclass === 'message' && box.text === 'library_prepare')?.box;
    const libraryPrepareDefer = libraryPrepare
      ? boxes.find(({ box }) => box.text === 'deferlow' && hasLine(lines, box, 0, libraryPrepare, 0))?.box
      : undefined;
    const libraryPagePrepend = boxByText(boxes, 'prepend library_page');
    const libraryEngineRoute = boxByText(boxes, 'route event panic clear status error context motifs-reset motif-item motif-selected midi-pass ui library-page');
    assert.ok(
      libraryInfo &&
        libraryPcontrol &&
        infoTrigger &&
        libraryOpenTrigger &&
        libraryClose &&
        libraryReopenDefer &&
        libraryOpen &&
        libraryPrepare &&
        libraryPrepareDefer &&
        libraryPagePrepend &&
        libraryEngineRoute &&
        v8,
    );
    assert.ok(hasLine(lines, infoTrigger, 1, libraryClose, 0), 'each Info press must close the prior window first');
    assert.ok(hasLine(lines, libraryClose, 0, libraryPcontrol, 0), 'close must be sent to pcontrol');
    assert.ok(hasLine(lines, infoTrigger, 0, libraryReopenDefer, 0), 'reopening must wait until the close completes');
    assert.ok(hasLine(lines, libraryReopenDefer, 0, libraryOpenTrigger, 0));
    assert.ok(hasLine(lines, libraryOpenTrigger, 2, libraryOpen, 0), 'window must open before page preparation is deferred');
    assert.ok(hasLine(lines, libraryOpenTrigger, 1, libraryPrepareDefer, 0));
    assert.ok(hasLine(lines, libraryPrepareDefer, 0, libraryPrepare, 0));
    assert.ok(hasLine(lines, libraryPrepare, 0, v8, 0));
    assert.ok(hasLine(lines, libraryEngineRoute, 11, libraryPagePrepend, 0));
    assert.ok(hasLine(lines, libraryPagePrepend, 0, libraryInfo, 0));
    assert.ok(hasLine(lines, libraryOpen, 0, libraryPcontrol, 0), 'only open should be sent to pcontrol');
    for (const text of ['window flags float nogrow close zoom', 'window size 640 460', 'window exec']) {
      for (const { box } of boxes.filter(({ box }) => box.text === text)) {
        assert.ok(hasLine(lines, box, 0, libraryInfo, 0), `${text} must be forwarded to the subpatch thispatcher`);
        assert.ok(!hasLine(lines, box, 0, libraryPcontrol, 0), `${text} must never be sent to pcontrol`);
      }
    }

    const libraryPathReceive = boxByText(boxes, 'receive ---library_path');
    const libraryPathPattr = boxByText(boxes, 'pattr motif_library_path @autorestore 1 @thru 2 @parameter_enable 1 @parameter_mappable 0');
    const libraryPathPrepend = boxByText(boxes, 'prepend library_path');
    assert.ok(libraryPathReceive && libraryPathPattr && libraryPathPrepend);
    assert.ok(hasLine(lines, libraryPathReceive, 0, libraryPathPattr, 0));
    assert.ok(hasLine(lines, libraryPathReceive, 0, libraryPathPrepend, 0));
    assert.ok(hasLine(lines, libraryPathPattr, 0, libraryPathPrepend, 0));

    const restoreBang = boxes.find(({ box }) =>
      box.maxclass === 'message' && box.text === 'bang' && hasLine(lines, box, 0, libraryPathPattr, 0))?.box;
    const restoreDefer = restoreBang
      ? boxes.find(({ box }) => hasLine(lines, box, 0, restoreBang, 0))?.box
      : undefined;
    const thisDevice = boxByText(boxes, 'live.thisdevice');
    assert.ok(restoreBang && restoreDefer && thisDevice);
    assert.equal(restoreDefer.text, 'deferlow');
    assert.ok(hasLine(lines, thisDevice, 0, restoreDefer, 0), 'saved library path must be replayed after device load');

    for (const varname of ['trigger-menu', 'quant-menu', 'pass-menu', 'meter-tab', 'retrigger-tab', 'low-number', 'high-number']) {
      assert.equal(boxByVarname(boxes, varname)?.hidden, 1, `${varname} should start hidden on the Settings tab`);
    }
  });

  it('library jweb binds receiveData before readiness and contains valid diagnostic JavaScript', async () => {
    const libraryHtml = await readFile('src/max/library.html', 'utf8');
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
    assert.ok(libraryHtml.includes("title:'MIDI file is too long'"), 'oversized payloads must show a user warning');
    assert.ok(libraryHtml.includes('detail === payloadErrorSignature'), 'repeated payload errors must be deduplicated');
    assert.ok(libraryHtml.includes("confirmLabel:'OK'"), 'user warnings must be dismissible');
    assert.ok(!libraryHtml.includes('debug(\'error\', `Bad library payload:'), 'raw JSON parse errors must not be shown');
    assert.ok(
      libraryHtml.includes("window.max.outlet('lib_action', encodeURIComponent(JSON.stringify(action)))"),
      'library actions must use an explicit selector',
    );
    assert.ok(libraryHtml.includes('function createStore(initialState)'), 'library must use one explicit local state store');
    assert.ok(libraryHtml.includes("type:'cancel_edit'"), 'library must provide an explicit way to exit editing');
    assert.ok(!libraryHtml.includes('delete_motif'), 'library deletion must remain removed');
    assert.ok(!libraryHtml.includes('skipDeleteConfirmation'), 'removed delete preference must not remain');
    assert.ok(libraryHtml.includes("type:'select_browser', id:item.id"), 'browser selection must use stable ids');
    assert.ok(libraryHtml.includes("className = 'browser-folder'"), 'library must render relative folder groups');
    assert.ok(libraryHtml.includes('collapsedFolders:new Set()'), 'library folders must retain local collapsed state');
    assert.ok(libraryHtml.includes("heading.setAttribute('aria-expanded'"), 'folder headings must be accessible expanders');
    assert.ok(libraryHtml.includes('if (folderCollapsed) continue'), 'collapsed folders must hide their motifs');
    assert.ok(libraryHtml.includes('isFolderCollapsed(folder, server.query'), 'search must reveal matches in collapsed folders');
    assert.ok(libraryHtml.includes('item.folder'), 'library browser items must carry folder metadata');
    assert.ok(libraryHtml.includes('server?.libraryScanning'), 'library must display asynchronous scan progress');
    assert.ok(libraryHtml.includes('id="hotkey-input"'), 'library must expose a MIDI hot-key input');
    assert.ok(libraryHtml.includes('id="hotkey-input" type="text"'), 'MIDI hot-key input must use note names');
    assert.ok(libraryHtml.includes('id="hotkey-action"'), 'MIDI hot keys must choose their behavior');
    assert.ok(libraryHtml.includes('<option value="trigger">Trigger Motif</option>'));
    assert.ok(libraryHtml.includes('<option value="select">Select Motif</option>'));
    assert.ok(libraryHtml.includes('<option value="repeat">Hold &amp; Repeat</option>'));
    assert.ok(libraryHtml.includes("mapping.action === 'repeat' ? '↻'"));
    assert.ok(libraryHtml.includes("? 'Hold & Repeat'"));
    assert.ok(libraryHtml.includes('function parseMidiNoteName(noteName)'), 'library must parse MIDI note names');
    assert.ok(!libraryHtml.includes('`${midiNoteName(pitch)} · ${pitch}'), 'assignments must not display MIDI numbers');
    assert.ok(libraryHtml.includes("type:'map_trigger'"), 'library must assign MIDI hot keys');
    assert.ok(libraryHtml.includes("action:document.getElementById('hotkey-action').value"));
    assert.ok(libraryHtml.includes("type:'unmap_trigger'"), 'library must remove MIDI hot keys');
    assert.ok(libraryHtml.includes('Save changes and exit editing'), 'Save must document that it exits edit mode');
    assert.ok(libraryHtml.includes("type:'edit_motif', properties:readProperties()"), 'library must submit complete motif properties');
    assert.ok(libraryHtml.includes('const MAX_MOTIF_NOTES = 512'), 'Library must expose the 512-note motif limit');
    assert.ok(libraryHtml.includes('#notes-panel { overflow:auto; }'), 'the complete note table must scroll');
    assert.ok(!libraryHtml.includes('note-page-prev'), 'the note table must not expose pagination');
    assert.ok(!libraryHtml.includes('set_note_page'), 'the note table must not maintain page state');
    assert.ok(libraryHtml.includes('function receiveNoteChunk(payload)'), 'bounded note transport must be assembled internally');
    assert.ok(libraryHtml.includes("payload?.kind === 'note-chunk'"));
    assert.ok(libraryHtml.includes('notes.forEach((note, index) => {'), 'all assembled notes must render into one table');
    assert.ok(libraryHtml.includes("type:'edit_note_at', index"), 'scrolling-table edits must use absolute row indices');
    assert.ok(libraryHtml.includes('id="import-mode"'), 'library must expose the import pitch mode');
    assert.ok(libraryHtml.includes('<option value="chromatic">Exact / Chromatic</option>'), 'exact chromatic import must be the default');
    assert.ok(libraryHtml.includes("type:'import_clip', pitchMode:"), 'library must send the selected import mode');
    const noteHelpersStart = libraryHtml.indexOf('  function midiNoteName');
    const noteHelpersEnd = libraryHtml.indexOf('  function renderHotkeys');
    assert.ok(noteHelpersStart >= 0 && noteHelpersEnd > noteHelpersStart);
    const noteHelpers = libraryHtml.slice(noteHelpersStart, noteHelpersEnd);
    const noteResults = vm.runInNewContext(`${noteHelpers}
      [midiNoteName(60), parseMidiNoteName('C3'), parseMidiNoteName('F♯2'),
       parseMidiNoteName('Bb4'), parseMidiNoteName('60'), parseMidiNoteName('G#8')]`) as unknown[];
    assert.deepEqual(Array.from(noteResults), ['C3', 60, 54, 82, null, null]);
    const folderHelpersStart = libraryHtml.indexOf('  function isFolderCollapsed');
    const folderHelpersEnd = libraryHtml.indexOf('  function renderBrowser');
    assert.ok(folderHelpersStart >= 0 && folderHelpersEnd > folderHelpersStart);
    const folderHelpers = libraryHtml.slice(folderHelpersStart, folderHelpersEnd);
    const folderResults = vm.runInNewContext(`${folderHelpers}
      (() => {
        const collapsed = new Set(['Bass']);
        const expanded = toggleCollapsedFolder('Bass', collapsed);
        const added = toggleCollapsedFolder('Leads', collapsed);
        return [
          isFolderCollapsed('Bass', '', collapsed),
          isFolderCollapsed('Bass', 'fill', collapsed),
          expanded.has('Bass'),
          added.has('Bass'),
          added.has('Leads'),
          collapsed.has('Leads'),
        ];
      })()`) as unknown[];
    assert.deepEqual(Array.from(folderResults), [true, false, false, true, true, false]);
    for (const field of ['pitch-mode-edit', 'meter-numerator-edit', 'default-gate-edit', 'curve-exponent', 'author-edit', 'tags-edit']) {
      assert.ok(libraryHtml.includes(`id="${field}"`), `library must expose ${field}`);
    }
    for (const field of ['velocityOffset', 'velocityScale', 'legato', 'tie']) {
      assert.ok(libraryHtml.includes(field), `library must expose note field ${field}`);
    }
  });

  it('native preview script parses and exposes state, readiness, and diagnostics handlers', async () => {
    const previewScript = await readFile('src/max/motif-preview.js', 'utf8');

    assert.doesNotThrow(() => new vm.Script(previewScript, { filename: 'motif-preview.js' }));
    assert.match(previewScript, /mgraphics\.init\(\)/);
    assert.match(previewScript, /function receiveData\(\)/);
    assert.match(previewScript, /function loadbang\(\)/);
    assert.match(previewScript, /outlet\(0, "preview_ready"\)/);
    assert.match(previewScript, /outlet\(0, "preview_debug", level/);
    assert.match(previewScript, /function paint\(\)/);
    assert.match(
      previewScript,
      /jsarguments\.length > 1[\s\S]*Number\(jsarguments\[1\]\)[\s\S]*jsarguments\.length > 2[\s\S]*Number\(jsarguments\[2\]\)/,
      'preview arguments must skip jsarguments[0], which Max reserves for the filename',
    );
    assert.doesNotMatch(previewScript, /mgraphics\.clip\(/, 'legacy jsui does not expose mgraphics.clip()');
    assert.doesNotMatch(previewScript, /window\.max|readfile|preview\.html/);
  });

  it('native preview executes and renders a valid payload without jweb', async () => {
    const previewScript = await readFile('src/max/motif-preview.js', 'utf8');
    const outletMessages: unknown[][] = [];
    const errors: string[] = [];
    const drawingMethods = [
      'init',
      'rectangle',
      'rectangle_rounded',
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

  it('MIDI routing is fail-open and follows the documented midiselect pattern', async () => {
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
    assert.equal(readyTrigger?.text, 't b b b');
    assert.ok(readyTrigger);
    assert.ok(hasLine(lines, readyTrigger, 1, engineMode, 0));
    assert.ok(hasLine(lines, engineMode, 0, inputGate, 0));
  });

  it('compiled bundle uses one hand-written top-level Max dispatcher', async () => {
    const source = await readFile('dist/motif-device.js', 'utf8');
    assert.match(source.slice(0, 600), /var inlets = 1;[\s\S]*var outlets = 1;[\s\S]*function anything\(\)/);
    assert.match(source, /var message = messagename;/);
    assert.match(source, /arrayfromargs\(arguments\)/);
    assert.match(source, /MotifEngine\.dispatch\(message, args\)/);
    assert.doesNotMatch(source.slice(0, source.indexOf('"use strict";')), /function song_context\(/);
    assert.doesNotMatch(source, /__motifHandlers/);
    assert.doesNotMatch(source, /function host(?:_|\()/);
  });
});
