import { writeFile } from 'node:fs/promises';

let nextId = 1;
const boxes = [];
const lines = [];
const ids = {};

const COLORS = {
  background: [0.095, 0.102, 0.118, 1],
  header: [0.065, 0.071, 0.084, 1],
  group: [0.135, 0.145, 0.165, 1],
  badge: [0.16, 0.17, 0.195, 1],
  accent: [1, 0.42, 0.13, 1],
  text: [0.94, 0.95, 0.97, 1],
  muted: [0.62, 0.65, 0.70, 1],
  danger: [0.95, 0.27, 0.27, 1],
};

function add(name, maxclass, patchingRect, options = {}) {
  const id = `obj-${nextId++}`;
  ids[name] = id;
  boxes.push({ box: { id, maxclass, patching_rect: patchingRect, ...options } });
  return id;
}

function object(name, text, x, y, width = 120) {
  return add(name, 'newobj', [x, y, width, 22], { text });
}

function message(name, text, x, y, width = 90) {
  return add(name, 'message', [x, y, width, 22], { text });
}

function uiPanel(name, rect, color, rounded = 8) {
  return add(name, 'panel', rect, {
    background: 1,
    border: 0,
    bgcolor: color,
    rounded,
    presentation: 1,
    presentation_rect: rect,
  });
}

function uiComment(name, text, rect, options = {}) {
  return add(name, options.live ? 'live.comment' : 'comment', rect, {
    text,
    fontsize: options.fontsize ?? 11,
    fontface: options.fontface ?? 0,
    textcolor: options.textcolor ?? COLORS.text,
    textjustification: options.justification ?? 0,
    presentation: 1,
    presentation_rect: rect,
    ...(options.ignoreclick === false ? {} : { ignoreclick: 1 }),
  });
}

function uiDynamicMenu(name, items, rect) {
  const separated = [];
  for (const item of items) {
    if (separated.length > 0) separated.push(',');
    separated.push(item);
  }
  return add(name, 'umenu', rect, {
    items: separated,
    fontsize: 11,
    bgcolor: COLORS.badge,
    textcolor: COLORS.text,
    bordercolor: [0.25, 0.27, 0.31, 1],
    hltcolor: COLORS.accent,
    presentation: 1,
    presentation_rect: rect,
  });
}

function parameterAttributes(longName, shortName, values, initial = 0) {
  return {
    valueof: {
      parameter_enum: values,
      parameter_longname: longName,
      parameter_mmax: Math.max(0, values.length - 1),
      parameter_shortname: shortName,
      parameter_type: 2,
      parameter_unitstyle: 9,
      parameter_initial_enable: 1,
      parameter_initial: [initial],
    },
  };
}

function uiLiveMenu(name, values, rect, longName, shortName, initial = 0) {
  return add(name, 'live.menu', rect, {
    appearance: 0,
    fontsize: 11,
    parameter_enable: 1,
    presentation: 1,
    presentation_rect: rect,
    saved_attribute_attributes: parameterAttributes(longName, shortName, values, initial),
    varname: longName,
  });
}

function uiLiveTab(name, values, rect, longName, shortName, initial = 0) {
  return add(name, 'live.tab', rect, {
    fontsize: 10,
    mode: 0,
    multiline: 0,
    num_lines_patching: 1,
    num_lines_presentation: 1,
    parameter_enable: 1,
    presentation: 1,
    presentation_rect: rect,
    saved_attribute_attributes: parameterAttributes(longName, shortName, values, initial),
    varname: longName,
  });
}

function uiLiveNumber(name, rect, longName, shortName, initial) {
  return add(name, 'live.numbox', rect, {
    appearance: 4,
    fontsize: 11,
    parameter_enable: 1,
    presentation: 1,
    presentation_rect: rect,
    saved_attribute_attributes: {
      valueof: {
        parameter_initial: [initial],
        parameter_initial_enable: 1,
        parameter_longname: longName,
        parameter_mmax: 127,
        parameter_mmin: 0,
        parameter_shortname: shortName,
        parameter_type: 1,
        parameter_unitstyle: 8,
      },
    },
    varname: longName,
  });
}

function uiButton(name, text, rect, options = {}) {
  return add(name, 'live.text', rect, {
    appearance: 0,
    fontsize: 10,
    mode: 0,
    parameter_enable: 0,
    rounded: 5,
    text,
    texton: text,
    ...(options.danger
      ? {
          activebgcolor: COLORS.danger,
          activebgoncolor: COLORS.danger,
          textcolor: COLORS.text,
          textoncolor: COLORS.text,
        }
      : {}),
    presentation: 1,
    presentation_rect: rect,
  });
}

function connect(source, sourceOutlet, destination, destinationInlet, order) {
  const patchline = {
    source: [ids[source] ?? source, sourceOutlet],
    destination: [ids[destination] ?? destination, destinationInlet],
  };
  if (order !== undefined) patchline.order = order;
  lines.push({ patchline });
}

// Presentation layer. Panels are added first and placed in the background layer.
uiPanel('ui-background', [0, 0, 900, 164], COLORS.background, 0);
uiPanel('ui-header', [0, 0, 900, 34], COLORS.header, 0);
uiPanel('ui-accent', [0, 32, 900, 2], COLORS.accent, 0);
uiPanel('ui-main-group', [7, 40, 886, 53], COLORS.group, 7);
uiPanel('ui-tools-group', [7, 99, 886, 56], COLORS.group, 7);

for (const [name, rect] of [
  ['key-badge', [319, 6, 178, 22]],
  ['tempo-badge', [504, 6, 92, 22]],
  ['meter-badge', [603, 6, 60, 22]],
  ['transport-badge', [670, 6, 86, 22]],
  ['status-badge', [763, 6, 127, 22]],
]) {
  uiPanel(name, rect, COLORS.badge, 5);
}

uiComment('title', 'MOTIF', [12, 6, 76, 22], {
  fontsize: 16,
  fontface: 1,
  textcolor: COLORS.accent,
});
uiComment('version', 'v0.3.1', [88, 9, 55, 18], { fontsize: 10, textcolor: COLORS.muted });
uiComment('subtitle', 'scale-aware phrase trigger', [145, 9, 165, 18], {
  fontsize: 10,
  textcolor: COLORS.muted,
});

uiComment('key-display', 'C Major', [327, 9, 162, 18], { fontsize: 11, fontface: 1 });
uiComment('tempo-display', '120 BPM', [512, 9, 76, 18], {
  fontsize: 11,
  fontface: 1,
  justification: 1,
});
uiComment('meter-display', '4/4', [611, 9, 44, 18], {
  fontsize: 11,
  fontface: 1,
  justification: 1,
});
uiComment('transport-display', 'Stopped', [678, 9, 70, 18], {
  fontsize: 10,
  justification: 1,
});
uiComment('status-display', 'Starting…', [771, 9, 111, 18], {
  fontsize: 10,
  textcolor: COLORS.muted,
  justification: 1,
});

uiComment('motif-label', 'MOTIF', [15, 44, 190, 16], { fontsize: 9, textcolor: COLORS.muted });
uiDynamicMenu('motif-menu', ['Loading…'], [15, 61, 190, 24]);

uiComment('pitch-label', 'PITCH MODE', [214, 44, 118, 16], { fontsize: 9, textcolor: COLORS.muted });
uiLiveMenu('pitch-menu', ['auto', 'scale', 'chromatic', 'hybrid'], [214, 61, 118, 24], 'Pitch Mode', 'Pitch', 0);

uiComment('trigger-label', 'TRIGGER MODE', [341, 44, 132, 16], { fontsize: 9, textcolor: COLORS.muted });
uiLiveMenu(
  'trigger-menu',
  ['one-shot', 'hold', 'toggle', 'latch', 'release-tail'],
  [341, 61, 132, 24],
  'Trigger Mode',
  'Trigger',
  0,
);

uiComment('quant-label', 'LAUNCH', [482, 44, 103, 16], { fontsize: 9, textcolor: COLORS.muted });
uiLiveMenu(
  'quant-menu',
  ['immediate', '1/16', '1/8', '1/4', 'bar'],
  [482, 61, 103, 24],
  'Launch Quantization',
  'Launch',
  0,
);

uiComment('pass-label', 'MIDI PASS', [594, 44, 127, 16], { fontsize: 9, textcolor: COLORS.muted });
uiLiveMenu(
  'pass-menu',
  ['none', 'non-triggers', 'all'],
  [594, 61, 127, 24],
  'MIDI Pass Through',
  'MIDI Pass',
  1,
);

uiComment('meter-label', 'METER FIT', [730, 44, 155, 16], { fontsize: 9, textcolor: COLORS.muted });
uiLiveTab('meter-tab', ['preserve', 'fit-bar'], [730, 61, 155, 24], 'Meter Mode', 'Meter', 0);

uiComment('zone-label', 'TRIGGER ZONE', [15, 103, 128, 16], { fontsize: 9, textcolor: COLORS.muted });
uiComment('low-label', 'LOW', [15, 121, 40, 15], { fontsize: 8, textcolor: COLORS.muted });
uiLiveNumber('low-number', [15, 135, 58, 18], 'Trigger Low', 'Low', 36);
uiComment('high-label', 'HIGH', [82, 121, 45, 15], { fontsize: 8, textcolor: COLORS.muted });
uiLiveNumber('high-number', [82, 135, 58, 18], 'Trigger High', 'High', 84);

uiComment('retrigger-label', 'RETRIGGER', [154, 103, 148, 16], { fontsize: 9, textcolor: COLORS.muted });
uiLiveTab('retrigger-tab', ['replace', 'overlap'], [154, 122, 148, 28], 'Retrigger Mode', 'Retrigger', 0);

uiComment('library-label', 'LIBRARY', [316, 103, 260, 16], { fontsize: 9, textcolor: COLORS.muted });
uiButton('choose-library', 'Choose…', [316, 122, 84, 28]);
uiButton('refresh-button', 'Refresh', [407, 122, 72, 28]);
uiButton('panic-button', 'Panic', [486, 122, 66, 28], { danger: true });

uiComment('error-display', '', [568, 104, 316, 18], { fontsize: 9, textcolor: COLORS.danger });
uiComment(
  'help-display',
  'Triggers consumed · expressive MIDI passes through',
  [568, 124, 316, 27],
  { fontsize: 9, textcolor: COLORS.muted },
);

// MIDI processing and TypeScript runtime.
object('midiin', 'midiin', 30, 220, 50);
object('midiparse', 'midiparse', 30, 255, 70);
object('note-unpack', 'unpack 0 0', 30, 295, 80);
object('note-pack', 'pack 0 0 1', 30, 330, 85);
object('note-prepend', 'prepend note', 30, 365, 90);
object('cc-unpack', 'unpack 0 0', 130, 295, 80);
object('cc-pack', 'pack 0 0 1', 130, 330, 85);
object('cc-prepend', 'prepend cc', 130, 365, 85);
object('v8', 'v8 motif-device.js', 260, 365, 150);

object('thisdevice', 'live.thisdevice', 260, 220, 95);
object('deferlow', 'deferlow', 260, 255, 60);
object('init-trigger', 't b b b', 260, 290, 60);
message('initialize', 'initialize', 260, 325, 65);
message('live-set-path-message', 'path live_set', 335, 325, 80);
message('presentation-message', 'presentation 1', 425, 325, 90);
object('thispatcher', 'thispatcher', 525, 325, 75);
object('force-presentation', 'loadmess presentation 1', 425, 290, 145);

// Native Live API observation. This is more reliable than JS observers in Max 9.
object('live-path', 'live.path live_set', 620, 220, 110);
for (const [name, property, x, y, width] of [
  ['tempo-observer', 'tempo', 620, 260, 115],
  ['root-observer', 'root_note', 745, 260, 135],
  ['scale-mode-observer', 'scale_mode', 890, 260, 145],
  ['scale-intervals-observer', 'scale_intervals', 1045, 260, 165],
  ['scale-name-observer', 'scale_name', 1220, 260, 145],
  ['numerator-observer', 'signature_numerator', 620, 300, 195],
  ['denominator-observer', 'signature_denominator', 825, 300, 205],
  ['playing-observer', 'is_playing', 1040, 300, 135],
]) {
  object(name, `live.observer ${property}`, x, y, width);
  object(`${name}-prepend`, `prepend host_${property}`, x, y + 35, width + 15);
  connect(name, 0, `${name}-prepend`, 0);
  connect(`${name}-prepend`, 0, 'v8', 0);
}

object('schedule-route', 'route ticks ms', 260, 410, 95);
object('ticks-unpack', 'unpack 0 0 0 0.', 260, 445, 115);
object('ms-unpack', 'unpack 0 0 0 0.', 400, 445, 115);
object('ticks-pipe', 'pipe 0 0 0 @delaytime 0 ticks', 260, 485, 205);
object('ms-pipe', 'pipe 0 0 0 0.', 480, 485, 105);
object('note-output-pack', 'pack 0 0', 260, 525, 65);
object('note-midiformat', 'midiformat', 260, 565, 75);
object('poly-reverse', 'zl rev', 30, 410, 45);
object('other-midiformat', 'midiformat', 30, 445, 75);
object('other-gate', 'gate 1 1', 30, 485, 60);
object('midiflush', 'midiflush', 170, 605, 65);
object('midiout', 'midiout', 170, 645, 55);
object('load-gate', 'loadmess 1', 105, 485, 75);

object(
  'control-route',
  'route panic clear status error context host-key host-tempo host-meter host-transport motifs-reset motif-item motif-selected midi-pass',
  620,
  410,
  820,
);
object('panic-trigger', 't b b', 620, 450, 45);
message('clear-pipes', 'clear', 675, 490, 40);
object('status-set', 'prepend set', 730, 450, 80);
object('error-set', 'prepend set', 820, 450, 80);
object('context-set', 'prepend set', 910, 450, 80);
object('key-set', 'prepend set', 1000, 450, 80);
object('tempo-set', 'prepend set', 1090, 450, 80);
object('meter-set', 'prepend set', 1180, 450, 80);
object('transport-set', 'prepend set', 1270, 450, 90);
message('menu-clear', 'clear', 1000, 490, 40);
object('menu-append', 'prepend append', 1050, 490, 100);
object('menu-select', 'prepend setsymbol', 1160, 490, 115);

object('motif-prepend', 'prepend motif', 620, 535, 95);
object('pitch-prepend', 'prepend pitch_mode', 725, 535, 125);
object('trigger-prepend', 'prepend trigger_mode', 860, 535, 135);
object('quant-prepend', 'prepend launch_quantization', 1005, 535, 180);
object('pass-prepend', 'prepend pass_through', 1195, 535, 145);
object('meter-prepend', 'prepend meter_mode', 620, 575, 125);
object('retrigger-prepend', 'prepend retrigger', 755, 575, 115);
object('low-prepend', 'prepend trigger_low', 880, 575, 120);
object('high-prepend', 'prepend trigger_high', 1010, 575, 125);
object('open-library', 'opendialog fold', 1145, 575, 100);
object('library-prepend', 'prepend library_path', 1255, 575, 135);
message('refresh-message', 'refresh_library', 1145, 615, 95);
message('panic-message', 'panic', 1250, 615, 45);

for (const [name, value, x, y] of [
  ['pitch-default', 0, 620, 655],
  ['trigger-default', 0, 700, 655],
  ['quant-default', 0, 780, 655],
  ['pass-default', 1, 860, 655],
  ['meter-default', 0, 940, 655],
  ['retrigger-default', 0, 1020, 655],
  ['low-default', 36, 1100, 655],
  ['high-default', 84, 1180, 655],
]) {
  object(name, `loadmess ${value}`, x, y, 75);
}

// MIDI input parsing.
connect('midiin', 0, 'midiparse', 0);
connect('midiparse', 0, 'note-unpack', 0);
connect('midiparse', 6, 'note-pack', 2);
connect('note-unpack', 1, 'note-pack', 1);
connect('note-unpack', 0, 'note-pack', 0);
connect('note-pack', 0, 'note-prepend', 0);
connect('note-prepend', 0, 'v8', 0);
connect('midiparse', 2, 'cc-unpack', 0);
connect('midiparse', 6, 'cc-pack', 2);
connect('cc-unpack', 1, 'cc-pack', 1);
connect('cc-unpack', 0, 'cc-pack', 0);
connect('cc-pack', 0, 'cc-prepend', 0);
connect('cc-prepend', 0, 'v8', 0);
connect('midiparse', 1, 'poly-reverse', 0);
connect('poly-reverse', 0, 'other-midiformat', 1);
for (let outlet = 2; outlet <= 5; outlet += 1) connect('midiparse', outlet, 'other-midiformat', outlet);
connect('midiparse', 6, 'other-midiformat', 6);
connect('other-midiformat', 0, 'other-gate', 1);
connect('load-gate', 0, 'other-gate', 0);
connect('other-gate', 0, 'midiflush', 0);

// Device initialization and presentation enforcement.
connect('thisdevice', 0, 'deferlow', 0);
connect('deferlow', 0, 'init-trigger', 0);
connect('init-trigger', 2, 'presentation-message', 0);
connect('presentation-message', 0, 'thispatcher', 0);
connect('force-presentation', 0, 'thispatcher', 0);
connect('init-trigger', 1, 'live-set-path-message', 0);
connect('live-set-path-message', 0, 'live-path', 0);
connect('init-trigger', 0, 'initialize', 0);
connect('initialize', 0, 'v8', 0);

// One Live object id is shared by all song property observers.
for (const name of [
  'tempo-observer',
  'root-observer',
  'scale-mode-observer',
  'scale-intervals-observer',
  'scale-name-observer',
  'numerator-observer',
  'denominator-observer',
  'playing-observer',
]) {
  connect('live-path', 0, name, 1);
}

// Scheduled motif MIDI output.
connect('v8', 0, 'schedule-route', 0);
connect('schedule-route', 0, 'ticks-unpack', 0);
connect('schedule-route', 1, 'ms-unpack', 0);
for (let outlet = 0; outlet < 4; outlet += 1) connect('ticks-unpack', outlet, 'ticks-pipe', outlet);
for (let outlet = 0; outlet < 4; outlet += 1) connect('ms-unpack', outlet, 'ms-pipe', outlet);
for (const pipe of ['ticks-pipe', 'ms-pipe']) {
  connect(pipe, 2, 'note-midiformat', 6);
  connect(pipe, 1, 'note-output-pack', 1);
  connect(pipe, 0, 'note-output-pack', 0);
}
connect('note-output-pack', 0, 'note-midiformat', 0);
connect('note-midiformat', 0, 'midiflush', 0);
connect('midiflush', 0, 'midiout', 0);

// Runtime control and presentation updates.
connect('v8', 1, 'control-route', 0);
connect('control-route', 0, 'panic-trigger', 0);
connect('panic-trigger', 1, 'clear-pipes', 0);
connect('panic-trigger', 0, 'midiflush', 0);
connect('control-route', 1, 'clear-pipes', 0);
connect('clear-pipes', 0, 'ticks-pipe', 0);
connect('clear-pipes', 0, 'ms-pipe', 0);
connect('control-route', 2, 'status-set', 0);
connect('status-set', 0, 'status-display', 0);
connect('control-route', 3, 'error-set', 0);
connect('error-set', 0, 'error-display', 0);
connect('control-route', 4, 'context-set', 0);
connect('control-route', 5, 'key-set', 0);
connect('key-set', 0, 'key-display', 0);
connect('control-route', 6, 'tempo-set', 0);
connect('tempo-set', 0, 'tempo-display', 0);
connect('control-route', 7, 'meter-set', 0);
connect('meter-set', 0, 'meter-display', 0);
connect('control-route', 8, 'transport-set', 0);
connect('transport-set', 0, 'transport-display', 0);
connect('control-route', 9, 'menu-clear', 0);
connect('menu-clear', 0, 'motif-menu', 0);
connect('control-route', 10, 'menu-append', 0);
connect('menu-append', 0, 'motif-menu', 0);
connect('control-route', 11, 'menu-select', 0);
connect('menu-select', 0, 'motif-menu', 0);
connect('control-route', 12, 'other-gate', 0);

// UI controls.
connect('motif-menu', 1, 'motif-prepend', 0);
connect('motif-prepend', 0, 'v8', 0);
connect('pitch-menu', 1, 'pitch-prepend', 0);
connect('pitch-prepend', 0, 'v8', 0);
connect('trigger-menu', 1, 'trigger-prepend', 0);
connect('trigger-prepend', 0, 'v8', 0);
connect('quant-menu', 1, 'quant-prepend', 0);
connect('quant-prepend', 0, 'v8', 0);
connect('pass-menu', 1, 'pass-prepend', 0);
connect('pass-prepend', 0, 'v8', 0);
connect('meter-tab', 1, 'meter-prepend', 0);
connect('meter-prepend', 0, 'v8', 0);
connect('retrigger-tab', 1, 'retrigger-prepend', 0);
connect('retrigger-prepend', 0, 'v8', 0);
connect('low-number', 0, 'low-prepend', 0);
connect('low-prepend', 0, 'v8', 0);
connect('high-number', 0, 'high-prepend', 0);
connect('high-prepend', 0, 'v8', 0);
connect('choose-library', 0, 'open-library', 0);
connect('open-library', 0, 'library-prepend', 0);
connect('library-prepend', 0, 'v8', 0);
connect('refresh-button', 0, 'refresh-message', 0);
connect('refresh-message', 0, 'v8', 0);
connect('panic-button', 0, 'panic-message', 0);
connect('panic-message', 0, 'v8', 0);

for (const [source, destination] of [
  ['pitch-default', 'pitch-menu'],
  ['trigger-default', 'trigger-menu'],
  ['quant-default', 'quant-menu'],
  ['pass-default', 'pass-menu'],
  ['meter-default', 'meter-tab'],
  ['retrigger-default', 'retrigger-tab'],
  ['low-default', 'low-number'],
  ['high-default', 'high-number'],
]) {
  connect(source, 0, destination, 0);
}

const patch = {
  patcher: {
    fileversion: 1,
    appversion: { major: 9, minor: 0, revision: 0, architecture: 'x64', modernui: 1 },
    classnamespace: 'box',
    rect: [80, 80, 1480, 760],
    bglocked: 0,
    openinpresentation: 1,
    default_fontsize: 12,
    default_fontface: 0,
    default_fontname: 'Arial',
    gridonopen: 1,
    gridsize: [10, 10],
    gridsnaponopen: 1,
    objectsnaponopen: 1,
    statusbarvisible: 2,
    toolbarvisible: 1,
    lefttoolbarpinned: 0,
    toptoolbarpinned: 0,
    righttoolbarpinned: 0,
    bottomtoolbarpinned: 0,
    toolbars_unpinned_last_save: 0,
    tallnewobj: 0,
    boxanimatetime: 200,
    enablehscroll: 1,
    enablevscroll: 1,
    devicewidth: 900,
    description: 'Scale-aware triggerable motif engine',
    digest: 'TypeScript motif engine with Max 9 native Live observers and presentation UI',
    tags: 'midi motif phrase scale',
    boxes,
    lines,
    dependency_cache: [
      { name: 'motif-device.js', bootpath: '.', patcherrelativepath: '.', type: 'TEXT', implicit: 1 },
    ],
    autosave: 0,
  },
};

await writeFile('max/Motif.maxpat', `${JSON.stringify(patch, null, 2)}\n`);
