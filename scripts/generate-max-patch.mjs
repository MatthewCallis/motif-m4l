import { writeFile } from 'node:fs/promises';

let nextId = 1;
const boxes = [];
const lines = [];
const ids = {};

const WIDTH = 820;
const HEIGHT = 169;

const COLORS = {
  frame: [0.34, 0.34, 0.35, 1],
  header: [0.22, 0.22, 0.23, 1],
  panel: [0.055, 0.058, 0.062, 1],
  panelRaised: [0.075, 0.078, 0.084, 1],
  control: [0.095, 0.098, 0.105, 1],
  controlActive: [1.0, 0.55, 0.12, 1],
  accent: [1.0, 0.55, 0.12, 1],
  accentDim: [0.55, 0.31, 0.10, 1],
  text: [0.88, 0.88, 0.90, 1],
  muted: [0.58, 0.59, 0.63, 1],
  darkText: [0.05, 0.05, 0.055, 1],
  border: [0.16, 0.16, 0.17, 1],
  danger: [0.95, 0.25, 0.28, 1],
  success: [0.43, 0.82, 0.49, 1],
};

function add(name, maxclass, patchingRect, options = {}) {
  const id = `obj-${nextId++}`;
  ids[name] = id;
  boxes.push({ box: { id, maxclass, patching_rect: patchingRect, ...options } });
  return id;
}

function object(name, text, x, y, width = 120, options = {}) {
  return add(name, 'newobj', [x, y, width, 22], { text, ...options });
}

function message(name, text, x, y, width = 90) {
  return add(name, 'message', [x, y, width, 22], { text });
}

function helpAttrs(name, description) {
  return {
    annotation_name: name,
    annotation: description,
    hint: description,
  };
}

function uiPanel(name, rect, color, rounded = 7) {
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
    fontsize: options.fontsize ?? 10,
    fontface: options.fontface ?? 0,
    textcolor: options.textcolor ?? COLORS.text,
    textjustification: options.justification ?? 0,
    linecount: options.linecount,
    presentation: 1,
    presentation_rect: rect,
    varname: name,
    ignoreclick: options.ignoreclick ?? 1,
    ...(options.help ? helpAttrs(options.help.name, options.help.description) : {}),
  });
}

function menuItems(values) {
  const items = [];
  for (const value of values) {
    if (items.length) items.push(',');
    items.push(value);
  }
  return items;
}

function baseControlStyle() {
  return {
    activebgcolor: COLORS.controlActive,
    activebgoncolor: COLORS.controlActive,
    bordercolor: COLORS.border,
    focusbordercolor: COLORS.accent,
    lcdbgcolor: COLORS.control,
    lcdcolor: COLORS.text,
    textcolor: COLORS.text,
    textoncolor: COLORS.darkText,
    hltcolor: COLORS.accent,
    hlttextcolor: COLORS.darkText,
    valuepopup: 1,
    valuepopuplabel: 3,
  };
}

function uiDynamicMenu(name, items, rect, help, options = {}) {
  return add(name, 'umenu', rect, {
    items: menuItems(items),
    fontsize: options.fontsize ?? 10,
    bgcolor: options.bgcolor ?? COLORS.control,
    textcolor: options.textcolor ?? COLORS.text,
    bordercolor: COLORS.border,
    hltcolor: COLORS.accent,
    ignoreclick: options.ignoreclick ?? 0,
    presentation: 1,
    presentation_rect: rect,
    varname: name,
    ...helpAttrs(help.name, help.description),
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

function uiLiveMenu(name, values, rect, longName, shortName, initial, help) {
  return add(name, 'live.menu', rect, {
    appearance: 0,
    fontsize: 10,
    parameter_enable: 1,
    presentation: 1,
    presentation_rect: rect,
    saved_attribute_attributes: parameterAttributes(longName, shortName, values, initial),
    varname: name,
    ...baseControlStyle(),
    ...helpAttrs(help.name, help.description),
  });
}

function uiLiveTab(name, values, rect, longName, shortName, initial, help) {
  return add(name, 'live.tab', rect, {
    fontsize: 9,
    mode: 0,
    multiline: 0,
    num_lines_patching: 1,
    num_lines_presentation: 1,
    parameter_enable: 1,
    presentation: 1,
    presentation_rect: rect,
    saved_attribute_attributes: parameterAttributes(longName, shortName, values, initial),
    varname: name,
    ...baseControlStyle(),
    ...helpAttrs(help.name, help.description),
  });
}

function uiLiveNumber(name, rect, longName, shortName, initial, help) {
  return add(name, 'live.numbox', rect, {
    appearance: 4,
    fontsize: 10,
    parameter_enable: 1,
    presentation: 1,
    presentation_rect: rect,
    activebgcolor: COLORS.control,
    activetricolor: COLORS.accent,
    bordercolor: COLORS.border,
    textcolor: COLORS.accent,
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
    varname: name,
    valuepopup: 1,
    valuepopuplabel: 3,
    ...helpAttrs(help.name, help.description),
  });
}

function uiReadOnlyNumber(name, rect, initial, help) {
  return add(name, 'live.numbox', rect, {
    appearance: 4,
    fontsize: 11,
    ignoreclick: 1,
    parameter_enable: 0,
    presentation: 1,
    presentation_rect: rect,
    value: initial,
    activebgcolor: COLORS.header,
    bordercolor: COLORS.header,
    textcolor: COLORS.text,
    ...helpAttrs(help.name, help.description),
  });
}

function uiButton(name, text, rect, help, options = {}) {
  const bg = options.danger ? COLORS.danger : COLORS.control;
  const active = options.danger ? COLORS.danger : COLORS.accent;
  return add(name, 'live.text', rect, {
    appearance: 0,
    fontsize: options.fontsize ?? 9,
    mode: 0,
    parameter_enable: 0,
    rounded: 4,
    text,
    texton: text,
    activebgcolor: active,
    activebgoncolor: active,
    bgcolor: bg,
    bordercolor: COLORS.border,
    textcolor: options.danger ? COLORS.text : COLORS.muted,
    textoncolor: options.danger ? COLORS.text : COLORS.darkText,
    presentation: 1,
    presentation_rect: rect,
    varname: name,
    ...helpAttrs(help.name, help.description),
  });
}

function uiPreview(name, rect, help) {
  return add(name, 'multislider', rect, {
    settype: 0,
    setstyle: 0,
    setminmax: [0, 12],
    size: 6,
    thickness: 3,
    spacing: 5,
    drawpeaks: 0,
    contdata: 2,
    listresize: 1,
    bgcolor: COLORS.panel,
    slidercolor: COLORS.accent,
    bordercolor: COLORS.border,
    ignoreclick: 1,
    parameter_enable: 0,
    presentation: 1,
    presentation_rect: rect,
    varname: name,
    ...helpAttrs(help.name, help.description),
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

// ---------- Presentation UI ----------
uiPanel('ui-background', [0, 0, WIDTH, HEIGHT], COLORS.frame, 0);
uiPanel('ui-header', [3, 3, WIDTH - 6, 25], COLORS.header, 5);
uiPanel('ui-accent', [3, 27, WIDTH - 6, 1], COLORS.accent, 0);
uiPanel('ui-preview-panel', [8, 33, 500, 76], COLORS.panel, 6);
uiPanel('ui-info-panel', [514, 33, 298, 76], COLORS.panel, 6);
uiPanel('ui-controls-panel', [8, 114, 804, 48], COLORS.panel, 6);

uiComment('title', 'MOTIF', [14, 5, 58, 18], { fontsize: 13, fontface: 1, textcolor: COLORS.accent });
uiComment('subtitle', 'scale-aware phrase trigger', [74, 7, 142, 15], { fontsize: 8, textcolor: COLORS.muted });
uiComment('root-display', 'C', [348, 6, 34, 16], {
  fontsize: 9,
  fontface: 1,
  justification: 1,
  help: { name: 'Live Scale Root', description: "Live Set's current scale root, observed directly from Song.root_note." },
});
uiComment('scale-name-display', 'Major', [386, 6, 90, 16], {
  fontsize: 9,
  fontface: 1,
  help: { name: 'Live Scale Name', description: "Live Set's current scale name, observed directly from Song.scale_name." },
});
uiComment('scale-mode-display', 'Scale On', [477, 7, 50, 14], {
  fontsize: 7,
  textcolor: COLORS.success,
  help: { name: 'Live Scale Mode', description: "Whether Live's Scale Mode is active, observed from Song.scale_mode." },
});
uiComment('tempo-display', '120', [536, 6, 44, 16], {
  fontsize: 9,
  fontface: 1,
  justification: 2,
  help: {
    name: 'Live Tempo',
    description: "Current Live Set tempo in BPM, observed directly from Song.tempo. Motif timing follows this value on each trigger.",
  },
});
uiComment('tempo-unit', 'BPM', [581, 7, 25, 14], { fontsize: 7, textcolor: COLORS.muted });
uiComment('meter-display', '4/4', [610, 6, 34, 16], {
  fontsize: 9,
  fontface: 1,
  justification: 1,
  help: { name: 'Live Meter', description: "Current Live Set time signature from Song.signature_numerator and Song.signature_denominator." },
});
uiComment('transport-display', 'Stopped', [649, 7, 58, 14], {
  fontsize: 8,
  justification: 1,
  help: { name: 'Live Transport', description: "Current Live transport state observed from Song.is_playing." },
});
uiComment('status-display', 'Loading…', [712, 7, 94, 14], { fontsize: 7, textcolor: COLORS.muted, justification: 2 });

uiComment('motif-label', 'MOTIF', [16, 36, 196, 10], { fontsize: 7, textcolor: COLORS.muted });
uiDynamicMenu('motif-menu', ['Loading…'], [16, 47, 196, 20], {
  name: 'Selected Motif',
  description: 'Choose the phrase played when a trigger note is received. The preview and motif details update immediately.',
}, { fontsize: 9 });
uiComment('pitch-label', 'PITCH MODE', [218, 36, 92, 10], { fontsize: 7, textcolor: COLORS.muted });
uiLiveMenu(
  'pitch-menu',
  ['auto', 'scale', 'chromatic', 'hybrid'],
  [218, 47, 92, 20],
  'Pitch Mode',
  'Pitch',
  0,
  {
    name: 'Pitch Mode',
    description: 'Auto uses the motif default. Scale maps stored degrees through Live’s current scale; Chromatic preserves semitone intervals; Hybrid combines scale degrees with accidentals.',
  },
);
uiComment('preview-root-display', 'C3 anchor  •  Major  •  chromatic', [316, 37, 184, 14], {
  fontsize: 7,
  textcolor: COLORS.accent,
  justification: 2,
  help: { name: 'Preview Context', description: 'Shows the trigger anchor, Live scale, and effective pitch mode used to calculate the preview.' },
});
uiPreview('motif-preview', [16, 71, 484, 24], {
  name: 'Motif Note Preview',
  description: 'A time-and-pitch preview of the selected motif after applying the current Live scale, pitch mode, meter mode, and most recent trigger note.',
});
uiComment('preview-notes-display', 'C3  ·  A♯2  ·  D♯3  ·  D3  ·  C♯3  ·  C3', [16, 97, 484, 10], {
  fontsize: 7,
  textcolor: COLORS.muted,
  justification: 1,
  help: { name: 'Preview Notes', description: 'The exact MIDI note names that the current preview will play.' },
});

uiComment('motif-title-display', 'Mitsuda Lick', [524, 37, 278, 16], {
  fontsize: 11,
  fontface: 1,
  textcolor: COLORS.accent,
  help: { name: 'Motif Name', description: 'Human-readable name of the selected motif.' },
});
uiComment('motif-stats-display', '6 notes  •  2 bars  •  4/4 source  •  chromatic', [524, 54, 278, 11], {
  fontsize: 7,
  textcolor: COLORS.muted,
  help: { name: 'Motif Statistics', description: 'Note count, effective length, source meter, and effective pitch interpretation.' },
});
uiComment('motif-description-display', 'Canonical two-bar contour: long tonic, step down, leap up a fourth, then a fast chromatic descent to tonic.', [524, 67, 278, 26], {
  fontsize: 8,
  linecount: 2,
  help: { name: 'Motif Description', description: 'Description stored with the selected motif.' },
});
uiComment('motif-tags-display', 'mitsuda · chromatic · cadence', [524, 96, 278, 10], {
  fontsize: 7,
  textcolor: COLORS.accentDim,
  help: { name: 'Motif Tags', description: 'Tags and suggested modes stored in the motif metadata.' },
});

const labelY = 116;
const controlY = 128;
uiComment('trigger-label', 'TRIGGER', [16, labelY, 90, 9], { fontsize: 7, textcolor: COLORS.muted });
uiLiveMenu('trigger-menu', ['one-shot', 'hold', 'toggle', 'latch', 'release-tail'], [16, controlY, 92, 21], 'Trigger Mode', 'Trigger', 0, {
  name: 'Trigger Mode',
  description: 'One-shot plays the full motif; Hold stops on key release; Toggle alternates on/off; Latch replaces the active phrase; Release-tail lets scheduled notes finish.',
});
uiComment('quant-label', 'LAUNCH', [114, labelY, 72, 9], { fontsize: 7, textcolor: COLORS.muted });
uiLiveMenu('quant-menu', ['immediate', '1/16', '1/8', '1/4', 'bar'], [114, controlY, 76, 21], 'Launch Quantization', 'Launch', 0, {
  name: 'Launch Quantization',
  description: 'Delay phrase start to the selected musical boundary while Live is playing. Immediate starts as soon as the trigger is received.',
});
uiComment('pass-label', 'MIDI PASS', [196, labelY, 94, 9], { fontsize: 7, textcolor: COLORS.muted });
uiLiveMenu('pass-menu', ['none', 'non-triggers', 'all'], [196, controlY, 100, 21], 'MIDI Pass Through', 'MIDI Pass', 1, {
  name: 'MIDI Pass Through',
  description: 'None blocks dry notes; Non-triggers consumes trigger-zone notes but passes other MIDI; All passes every incoming note alongside the motif.',
});
uiComment('meter-label', 'METER', [302, labelY, 92, 9], { fontsize: 7, textcolor: COLORS.muted });
uiLiveTab('meter-tab', ['preserve', 'fit-bar'], [302, controlY, 98, 21], 'Meter Mode', 'Meter', 0, {
  name: 'Meter Mode',
  description: 'Preserve keeps the motif’s original timing. Fit Bar scales its source bars to the Live Set’s current time signature.',
});
uiComment('retrigger-label', 'RETRIGGER', [406, labelY, 94, 9], { fontsize: 7, textcolor: COLORS.muted });
uiLiveTab('retrigger-tab', ['replace', 'overlap'], [406, controlY, 100, 21], 'Retrigger Mode', 'Retrigger', 0, {
  name: 'Retrigger Mode',
  description: 'Replace clears scheduled motif notes before starting the next phrase. Overlap allows multiple triggered phrases to play together.',
});
uiComment('zone-label', 'ZONE', [512, labelY, 80, 9], { fontsize: 7, textcolor: COLORS.muted });
uiLiveNumber('low-number', [512, controlY, 38, 21], 'Trigger Low', 'Low', 36, {
  name: 'Trigger Zone Low',
  description: 'Lowest MIDI note treated as a motif trigger. Notes below this value follow the MIDI Pass setting.',
});
uiLiveNumber('high-number', [554, controlY, 38, 21], 'Trigger High', 'High', 84, {
  name: 'Trigger Zone High',
  description: 'Highest MIDI note treated as a motif trigger. Notes above this value follow the MIDI Pass setting.',
});
uiComment('library-label', 'LIBRARY', [598, labelY, 80, 9], { fontsize: 7, textcolor: COLORS.muted });
uiButton('choose-library', 'Choose', [598, controlY, 48, 21], {
  name: 'Choose Motif Library',
  description: 'Select a folder containing additional motif JSON files. Built-in motifs remain available.',
}, { fontsize: 8 });
uiButton('refresh-button', '↻', [650, controlY, 28, 21], {
  name: 'Refresh Motif Library',
  description: 'Reload built-in motifs and all JSON motifs from the selected library folder.',
}, { fontsize: 11 });
uiComment('panic-label', 'PANIC', [684, labelY, 34, 9], { fontsize: 7, textcolor: COLORS.muted });
uiButton('panic-button', '!', [684, controlY, 34, 21], {
  name: 'Panic',
  description: 'Immediately clears scheduled phrase events and sends note-offs for active MIDI notes.',
}, { danger: true, fontsize: 11 });


// ---------- MIDI engine ----------
// The MIDI stream is fail-open until the TypeScript engine reports Ready.
// Once ready, midiselect removes only note messages for processing and passes
// every unselected MIDI byte downstream unchanged, following Cycling '74's
// documented Max for Live MIDI Effect pattern.
object('midiin', 'midiin', 30, 270, 50);
object('input-gate', 'gate 2 1', 30, 305, 65);
object('input-bypass-default', 'loadmess 1', 105, 305, 75);
message('input-engine-mode', '2', 185, 305, 30);
object('midiselect', 'midiselect @ch all @note all', 30, 345, 190);
object('sustain-parser', 'midiparse', 230, 345, 70);
object('note-unpack', 'unpack 0 0', 30, 385, 80);
object('note-pack', 'pack 0 0 1', 30, 420, 85);
object('note-prepend', 'prepend note', 30, 455, 90);
object('sustain-route', 'route 64', 230, 385, 65);
object('sustain-pack', 'pack 0 1', 230, 420, 65);
object('sustain-prepend', 'prepend sustain', 230, 455, 110);
object('v8', 'v8 motif-device.js', 360, 415, 175, { numinlets: 1, numoutlets: 1, outlettype: [''] });

object('engine-route', 'route event panic clear status error context motifs-reset motif-item motif-selected midi-pass ui', 360, 460, 765);
object('event-unpack', 'unpack 0 0 0 0.', 360, 500, 115);
object('event-pipe', 'pipe 0 0 0 0.', 360, 540, 105);
object('note-output-pack', 'pack 0 0', 360, 580, 65);
object('note-midiformat', 'midiformat', 360, 620, 75);
object('midiflush', 'midiflush', 170, 660, 65);
object('midiout', 'midiout', 170, 700, 55);
object('panic-trigger', 't b b', 485, 500, 45);
message('clear-pipe-message', 'clear', 540, 540, 40);
object('status-set', 'prepend set', 600, 500, 80);
object('error-set', 'prepend set', 690, 500, 80);
message('menu-clear', 'clear', 780, 500, 40);
object('menu-append', 'prepend append', 830, 500, 100);
object('menu-select', 'prepend setsymbol', 940, 500, 115);
object('ui-route', 'route preview-pitches preview-range preview-notes preview-root motif-title motif-description motif-stats motif-tags', 1065, 500, 760);
object('preview-pitches-set', 'prepend setlist', 1065, 540, 95);
object('preview-range-set', 'prepend setmax', 1170, 540, 95);
object('preview-notes-set', 'prepend set', 1275, 540, 80);
object('preview-root-set', 'prepend set', 1365, 540, 80);
object('motif-title-set', 'prepend set', 1455, 540, 80);
object('motif-description-set', 'prepend set', 1545, 540, 80);
object('motif-stats-set', 'prepend set', 1635, 540, 80);
object('motif-tags-set', 'prepend set', 1725, 540, 80);

// ---------- Native Live Song observers ----------
object('thisdevice', 'live.thisdevice', 520, 270, 95);
object('init-order', 't b b b', 520, 305, 60);
object('property-fanout', 't b b b b b b b b b', 600, 305, 155);
object('live-path', 'live.path live_set', 520, 345, 115);
object('initialize-defer', 'deferlow', 520, 385, 60);
message('initialize-message', 'initialize', 520, 420, 65);
object('song-context-defer', 'deferlow', 600, 420, 60);
object('ready-route', 'route Ready', 670, 420, 80);
object('ready-trigger', 't b b', 760, 420, 45);
object('observer-refresh', 't b b b b b b b b b', 815, 420, 175);
message('presentation-message', 'presentation 1', 425, 385, 90);
object('thispatcher', 'thispatcher', 425, 420, 75);
object('force-presentation', 'loadmess presentation 1', 425, 345, 145);

const observers = [
  ['tempo', 'tempo', 620, 350],
  ['root-note', 'root_note', 620, 390],
  ['scale-mode', 'scale_mode', 620, 430],
  ['scale-intervals', 'scale_intervals', 620, 470],
  ['scale-name', 'scale_name', 980, 350],
  ['numerator', 'signature_numerator', 980, 390],
  ['denominator', 'signature_denominator', 980, 430],
  ['is-playing', 'is_playing', 980, 470],
  ['song-time', 'current_song_time', 980, 510],
];

observers.forEach(([name, property, x, y], index) => {
  message(`${name}-property`, `property ${property}`, x, y, 170);
  object(`${name}-observer`, 'live.observer', x + 180, y, 90);
  object(`${name}-property-name`, `prepend ${property}`, x + 280, y, 180);
  object(`${name}-song-context`, 'prepend song_context', x + 470, y, 145);
  connect('property-fanout', index, `${name}-property`, 0);
  connect(`${name}-property`, 0, `${name}-observer`, 0);
  connect('live-path', 0, `${name}-observer`, 1);
  connect(`${name}-observer`, 0, `${name}-property-name`, 0);
  connect(`${name}-property-name`, 0, `${name}-song-context`, 0);
  connect(`${name}-song-context`, 0, 'song-context-defer', 0);
});

// Native UI formatting. These displays never depend on JavaScript.
object('root-select', 'sel 0 1 2 3 4 5 6 7 8 9 10 11', 620, 560, 220);
const rootNames = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
rootNames.forEach((name, index) => {
  message(`root-${index}-message`, `set ${name}`, 620 + index * 48, 595, 45);
  connect('root-select', index, `root-${index}-message`, 0);
  connect(`root-${index}-message`, 0, 'root-display', 0);
});
object('tempo-set', 'prepend set', 850, 560, 80);
object('scale-name-set', 'prepend set', 940, 560, 80);
object('scale-mode-select', 'sel 0 1', 1030, 560, 55);
message('scale-off-message', 'set Scale Off', 1095, 550, 90);
message('scale-on-message', 'set Scale On', 1095, 575, 90);
object('meter-pak', 'pak 4 4', 1195, 560, 60);
object('meter-format', 'sprintf %ld/%ld', 1265, 560, 100);
object('meter-set', 'prepend set', 1375, 560, 80);
object('transport-select', 'sel 0 1', 1465, 560, 55);
message('stopped-message', 'set Stopped', 1530, 550, 80);
message('playing-message', 'set Playing', 1530, 575, 80);

connect('root-note-observer', 0, 'root-select', 0);
connect('tempo-observer', 0, 'tempo-set', 0);
connect('tempo-set', 0, 'tempo-display', 0);
connect('scale-name-observer', 0, 'scale-name-set', 0);
connect('scale-name-set', 0, 'scale-name-display', 0);
connect('scale-mode-observer', 0, 'scale-mode-select', 0);
connect('scale-mode-select', 0, 'scale-off-message', 0);
connect('scale-mode-select', 1, 'scale-on-message', 0);
connect('scale-off-message', 0, 'scale-mode-display', 0);
connect('scale-on-message', 0, 'scale-mode-display', 0);
connect('numerator-observer', 0, 'meter-pak', 0);
connect('denominator-observer', 0, 'meter-pak', 1);
connect('meter-pak', 0, 'meter-format', 0);
connect('meter-format', 0, 'meter-set', 0);
connect('meter-set', 0, 'meter-display', 0);
connect('is-playing-observer', 0, 'transport-select', 0);
connect('transport-select', 0, 'stopped-message', 0);
connect('transport-select', 1, 'playing-message', 0);
connect('stopped-message', 0, 'transport-display', 0);
connect('playing-message', 0, 'transport-display', 0);

// Startup ordering: configure observable Song properties, assign live_set,
// initialize TypeScript, then request a complete observer snapshot when Ready.
connect('thisdevice', 0, 'init-order', 0);
connect('init-order', 2, 'property-fanout', 0);
connect('init-order', 1, 'live-path', 0);
connect('init-order', 0, 'initialize-defer', 0);
connect('initialize-defer', 0, 'initialize-message', 0);
connect('initialize-message', 0, 'v8', 0);
connect('song-context-defer', 0, 'v8', 0);
connect('engine-route', 3, 'ready-route', 0);
connect('ready-route', 0, 'ready-trigger', 0);
// Switch MIDI from fail-open bypass to processing, then request the full Song snapshot.
connect('ready-trigger', 1, 'input-engine-mode', 0);
connect('input-engine-mode', 0, 'input-gate', 0);
connect('ready-trigger', 0, 'observer-refresh', 0);
observers.forEach(([name], index) => {
  connect('observer-refresh', index, `${name}-observer`, 0);
});
connect('force-presentation', 0, 'thispatcher', 0);
connect('presentation-message', 0, 'thispatcher', 0);

// ---------- MIDI input/output wiring ----------
// Fail-open raw MIDI bypass until the engine reports Ready.
connect('midiin', 0, 'input-gate', 1);
connect('input-bypass-default', 0, 'input-gate', 0);
connect('input-gate', 0, 'midiflush', 0);
connect('input-gate', 1, 'midiselect', 0);
connect('input-gate', 1, 'sustain-parser', 0);

// midiselect handles every note while its rightmost outlet passes all other
// raw MIDI unchanged, as required for a Max for Live MIDI Effect.
connect('midiselect', 7, 'midiflush', 0);
connect('midiselect', 0, 'note-unpack', 0);
connect('midiselect', 6, 'note-pack', 2);
connect('note-unpack', 1, 'note-pack', 1);
connect('note-unpack', 0, 'note-pack', 0);
connect('note-pack', 0, 'note-prepend', 0);
connect('note-prepend', 0, 'v8', 0);

// Observe sustain without removing it from the native raw pass-through path.
connect('sustain-parser', 6, 'sustain-pack', 1);
connect('sustain-parser', 2, 'sustain-route', 0);
connect('sustain-route', 0, 'sustain-pack', 0);
connect('sustain-pack', 0, 'sustain-prepend', 0);
connect('sustain-prepend', 0, 'v8', 0);

connect('v8', 0, 'engine-route', 0);
connect('engine-route', 0, 'event-unpack', 0);
for (let outlet = 0; outlet < 4; outlet += 1) connect('event-unpack', outlet, 'event-pipe', outlet);
connect('event-pipe', 2, 'note-midiformat', 6);
connect('event-pipe', 1, 'note-output-pack', 1);
connect('event-pipe', 0, 'note-output-pack', 0);
connect('note-output-pack', 0, 'note-midiformat', 0);
connect('note-midiformat', 0, 'midiflush', 0);
connect('midiflush', 0, 'midiout', 0);
connect('engine-route', 1, 'panic-trigger', 0);
connect('panic-trigger', 1, 'clear-pipe-message', 0);
connect('panic-trigger', 0, 'midiflush', 0);
connect('engine-route', 2, 'clear-pipe-message', 0);
connect('clear-pipe-message', 0, 'event-pipe', 0);
connect('engine-route', 3, 'status-set', 0);
connect('status-set', 0, 'status-display', 0);
connect('engine-route', 4, 'error-set', 0);
connect('error-set', 0, 'status-display', 0);
connect('engine-route', 6, 'menu-clear', 0);
connect('menu-clear', 0, 'motif-menu', 0);
connect('engine-route', 7, 'menu-append', 0);
connect('menu-append', 0, 'motif-menu', 0);
connect('engine-route', 8, 'menu-select', 0);
connect('menu-select', 0, 'motif-menu', 0);
connect('engine-route', 10, 'ui-route', 0);
connect('ui-route', 0, 'preview-pitches-set', 0);
connect('preview-pitches-set', 0, 'motif-preview', 0);
connect('ui-route', 1, 'preview-range-set', 0);
connect('preview-range-set', 0, 'motif-preview', 0);
connect('ui-route', 2, 'preview-notes-set', 0);
connect('preview-notes-set', 0, 'preview-notes-display', 0);
connect('ui-route', 3, 'preview-root-set', 0);
connect('preview-root-set', 0, 'preview-root-display', 0);
connect('ui-route', 4, 'motif-title-set', 0);
connect('motif-title-set', 0, 'motif-title-display', 0);
connect('ui-route', 5, 'motif-description-set', 0);
connect('motif-description-set', 0, 'motif-description-display', 0);
connect('ui-route', 6, 'motif-stats-set', 0);
connect('motif-stats-set', 0, 'motif-stats-display', 0);
connect('ui-route', 7, 'motif-tags-set', 0);
connect('motif-tags-set', 0, 'motif-tags-display', 0);

// ---------- UI controls ----------
object('motif-prepend', 'prepend motif', 620, 650, 95);
object('pitch-prepend', 'prepend pitch_mode', 725, 650, 125);
object('trigger-prepend', 'prepend trigger_mode', 860, 650, 135);
object('quant-prepend', 'prepend launch_quantization', 1005, 650, 180);
object('pass-prepend', 'prepend pass_through', 1195, 650, 145);
object('meter-prepend', 'prepend meter_mode', 620, 690, 125);
object('retrigger-prepend', 'prepend retrigger', 755, 690, 115);
object('low-prepend', 'prepend trigger_low', 880, 690, 120);
object('high-prepend', 'prepend trigger_high', 1010, 690, 125);
object('open-library', 'opendialog fold', 1145, 690, 100);
object('library-prepend', 'prepend library_path', 1255, 690, 135);
message('refresh-message', 'refresh_library', 1145, 730, 95);
message('panic-message', 'panic', 1250, 730, 45);

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

for (const [name, value, x, y] of [
  ['pitch-default', 0, 620, 750],
  ['trigger-default', 0, 700, 750],
  ['quant-default', 0, 780, 750],
  ['pass-default', 1, 860, 750],
  ['meter-default', 0, 940, 750],
  ['retrigger-default', 0, 1020, 750],
  ['low-default', 36, 1100, 750],
  ['high-default', 84, 1180, 750],
]) object(name, `loadmess ${value}`, x, y, 75);

for (const [source, destination] of [
  ['pitch-default', 'pitch-menu'],
  ['trigger-default', 'trigger-menu'],
  ['quant-default', 'quant-menu'],
  ['pass-default', 'pass-menu'],
  ['meter-default', 'meter-tab'],
  ['retrigger-default', 'retrigger-tab'],
  ['low-default', 'low-number'],
  ['high-default', 'high-number'],
]) connect(source, 0, destination, 0);

const patch = {
  patcher: {
    fileversion: 1,
    appversion: { major: 9, minor: 0, revision: 0, architecture: 'x64', modernui: 1 },
    classnamespace: 'box',
    rect: [80, 80, 1710, 830],
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
    devicewidth: WIDTH,
    description: 'Scale-aware triggerable motif engine with native Live Song synchronization and visual note preview',
    digest: 'Native Song observers for tempo and scale; fail-open MIDI routing; TypeScript motif processing; native multislider preview',
    tags: 'midi motif phrase scale preview',
    boxes,
    lines,
    dependency_cache: [
      { name: 'motif-device.js', bootpath: '.', patcherrelativepath: '.', type: 'TEXT', implicit: 1 },
    ],
    autosave: 0,
  },
};

await writeFile('max/Motif.maxpat', `${JSON.stringify(patch, null, 2)}\n`);
