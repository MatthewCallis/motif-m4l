import { writeFile } from 'node:fs/promises';

let nextId = 1;
const boxes = [];
const lines = [];
const ids = {};

const WIDTH = 860;
const HEIGHT = 238;

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
  return add(name, 'v8ui', rect, {
    filename: 'motif-preview.js',
    border: 0,
    nofsaa: 0,
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
uiPanel('ui-header', [3, 3, WIDTH - 6, 29], COLORS.header, 5);
uiPanel('ui-accent', [3, 31, WIDTH - 6, 2], COLORS.accent, 0);
uiPanel('ui-preview-panel', [8, 39, 535, 120], COLORS.panel, 6);
uiPanel('ui-info-panel', [550, 39, 302, 120], COLORS.panel, 6);
uiPanel('ui-controls-panel', [8, 166, 844, 64], COLORS.panel, 6);

uiComment('title', 'MOTIF', [14, 7, 72, 20], { fontsize: 15, fontface: 1, textcolor: COLORS.accent });
uiComment('subtitle', 'scale-aware phrase trigger', [88, 9, 160, 18], { fontsize: 9, textcolor: COLORS.muted });
uiDynamicMenu(
  'root-display',
  ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'],
  [360, 7, 44, 20],
  { name: 'Live Scale Root', description: "Live Set's current scale root. This display is observed directly from Song.root_note." },
  { ignoreclick: 1, fontsize: 10 },
);
uiComment('scale-name-display', 'Major', [407, 8, 92, 18], {
  fontsize: 10,
  fontface: 1,
  help: { name: 'Live Scale Name', description: "Live Set's current scale name, observed directly from Song.scale_name." },
});
uiComment('scale-mode-display', 'Scale On', [500, 9, 54, 16], {
  fontsize: 8,
  textcolor: COLORS.success,
  help: { name: 'Live Scale Mode', description: "Whether Live's Scale Mode is active, observed from Song.scale_mode." },
});
uiReadOnlyNumber('tempo-display', [566, 6, 48, 21], 120, {
  name: 'Live Tempo',
  description: "Current Live Set tempo in BPM, observed directly from Song.tempo. Motif timing follows this value on each trigger.",
});
uiComment('tempo-unit', 'BPM', [614, 9, 28, 16], { fontsize: 8, textcolor: COLORS.muted });
uiComment('meter-display', '4/4', [650, 8, 40, 18], {
  fontsize: 10,
  fontface: 1,
  justification: 1,
  help: { name: 'Live Meter', description: "Current Live Set time signature from Song.signature_numerator and Song.signature_denominator." },
});
uiComment('transport-display', 'Stopped', [697, 9, 65, 16], {
  fontsize: 9,
  justification: 1,
  help: { name: 'Live Transport', description: "Current Live transport state observed from Song.is_playing." },
});
uiComment('status-display', 'Loading…', [768, 9, 80, 16], { fontsize: 8, textcolor: COLORS.muted, justification: 2 });

uiComment('motif-label', 'MOTIF', [16, 44, 205, 14], { fontsize: 8, textcolor: COLORS.muted });
uiDynamicMenu('motif-menu', ['Loading…'], [16, 58, 205, 22], {
  name: 'Selected Motif',
  description: 'Choose the phrase played when a trigger note is received. The preview and motif details update immediately.',
});
uiComment('pitch-label', 'PITCH MODE', [228, 44, 105, 14], { fontsize: 8, textcolor: COLORS.muted });
uiLiveMenu(
  'pitch-menu',
  ['auto', 'scale', 'chromatic', 'hybrid'],
  [228, 58, 105, 22],
  'Pitch Mode',
  'Pitch',
  0,
  {
    name: 'Pitch Mode',
    description: 'Auto uses the motif default. Scale maps stored degrees through Live’s current scale; Chromatic preserves semitone intervals; Hybrid combines scale degrees with accidentals.',
  },
);
uiComment('preview-root-display', 'C3 anchor  •  Major  •  chromatic', [341, 46, 193, 18], {
  fontsize: 8,
  textcolor: COLORS.accent,
  justification: 2,
  help: { name: 'Preview Context', description: 'Shows the trigger anchor, Live scale, and effective pitch mode used to calculate the preview.' },
});
uiPreview('motif-preview', [16, 84, 518, 50], {
  name: 'Motif Note Preview',
  description: 'A time-and-pitch preview of the selected motif after applying the current Live scale, pitch mode, meter mode, and most recent trigger note.',
});
uiComment('preview-notes-display', 'C3  ·  A♯2  ·  D♯3  ·  D3  ·  C♯3  ·  C3', [16, 137, 518, 17], {
  fontsize: 8,
  textcolor: COLORS.muted,
  justification: 1,
  help: { name: 'Preview Notes', description: 'The exact MIDI note names that the current preview will play.' },
});

uiComment('motif-title-display', 'Mitsuda Lick', [560, 46, 280, 20], {
  fontsize: 13,
  fontface: 1,
  textcolor: COLORS.accent,
  help: { name: 'Motif Name', description: 'Human-readable name of the selected motif.' },
});
uiComment('motif-stats-display', '6 notes  •  2 bars  •  4/4 source  •  chromatic', [560, 69, 280, 16], {
  fontsize: 8,
  textcolor: COLORS.muted,
  help: { name: 'Motif Statistics', description: 'Note count, effective length, source meter, and effective pitch interpretation.' },
});
uiComment('motif-description-display', 'Canonical two-bar contour: long tonic, step down, leap up a fourth, then a fast chromatic descent to tonic.', [560, 88, 280, 39], {
  fontsize: 9,
  linecount: 3,
  help: { name: 'Motif Description', description: 'Description stored with the selected motif.' },
});
uiComment('motif-tags-display', 'mitsuda · chromatic · cadence', [560, 134, 280, 17], {
  fontsize: 8,
  textcolor: COLORS.accentDim,
  help: { name: 'Motif Tags', description: 'Tags and suggested modes stored in the motif metadata.' },
});

const labelY = 171;
const controlY = 187;
uiComment('trigger-label', 'TRIGGER', [16, labelY, 112, 14], { fontsize: 8, textcolor: COLORS.muted });
uiLiveMenu('trigger-menu', ['one-shot', 'hold', 'toggle', 'latch', 'release-tail'], [16, controlY, 112, 24], 'Trigger Mode', 'Trigger', 0, {
  name: 'Trigger Mode',
  description: 'One-shot plays the full motif; Hold stops on key release; Toggle alternates on/off; Latch replaces the active phrase; Release-tail lets scheduled notes finish.',
});
uiComment('quant-label', 'LAUNCH', [134, labelY, 88, 14], { fontsize: 8, textcolor: COLORS.muted });
uiLiveMenu('quant-menu', ['immediate', '1/16', '1/8', '1/4', 'bar'], [134, controlY, 88, 24], 'Launch Quantization', 'Launch', 0, {
  name: 'Launch Quantization',
  description: 'Delay phrase start to the selected musical boundary while Live is playing. Immediate starts as soon as the trigger is received.',
});
uiComment('pass-label', 'MIDI PASS', [228, labelY, 110, 14], { fontsize: 8, textcolor: COLORS.muted });
uiLiveMenu('pass-menu', ['none', 'non-triggers', 'all'], [228, controlY, 110, 24], 'MIDI Pass Through', 'MIDI Pass', 1, {
  name: 'MIDI Pass Through',
  description: 'None blocks dry notes; Non-triggers consumes trigger-zone notes but passes other MIDI; All passes every incoming note alongside the motif.',
});
uiComment('meter-label', 'METER', [344, labelY, 120, 14], { fontsize: 8, textcolor: COLORS.muted });
uiLiveTab('meter-tab', ['preserve', 'fit-bar'], [344, controlY, 120, 24], 'Meter Mode', 'Meter', 0, {
  name: 'Meter Mode',
  description: 'Preserve keeps the motif’s original timing. Fit Bar scales its source bars to the Live Set’s current time signature.',
});
uiComment('retrigger-label', 'RETRIGGER', [470, labelY, 120, 14], { fontsize: 8, textcolor: COLORS.muted });
uiLiveTab('retrigger-tab', ['replace', 'overlap'], [470, controlY, 120, 24], 'Retrigger Mode', 'Retrigger', 0, {
  name: 'Retrigger Mode',
  description: 'Replace clears scheduled motif notes before starting the next phrase. Overlap allows multiple triggered phrases to play together.',
});
uiComment('zone-label', 'TRIGGER ZONE', [596, labelY, 104, 14], { fontsize: 8, textcolor: COLORS.muted });
uiLiveNumber('low-number', [596, controlY, 50, 24], 'Trigger Low', 'Low', 36, {
  name: 'Trigger Zone Low',
  description: 'Lowest MIDI note treated as a motif trigger. Notes below this value follow the MIDI Pass setting.',
});
uiLiveNumber('high-number', [650, controlY, 50, 24], 'Trigger High', 'High', 84, {
  name: 'Trigger Zone High',
  description: 'Highest MIDI note treated as a motif trigger. Notes above this value follow the MIDI Pass setting.',
});
uiComment('library-label', 'LIBRARY', [706, labelY, 98, 14], { fontsize: 8, textcolor: COLORS.muted });
uiButton('choose-library', 'Choose', [706, controlY, 51, 24], {
  name: 'Choose Motif Library',
  description: 'Select a folder containing additional motif JSON files. Built-in motifs remain available.',
});
uiButton('refresh-button', '↻', [761, controlY, 35, 24], {
  name: 'Refresh Motif Library',
  description: 'Reload built-in motifs and all JSON motifs from the selected library folder.',
}, { fontsize: 13 });
uiButton('panic-button', '!', [800, controlY, 36, 24], {
  name: 'Panic',
  description: 'Immediately clears scheduled phrase events and sends note-offs for active MIDI notes.',
}, { danger: true, fontsize: 13 });

// ---------- MIDI engine ----------
object('midiin', 'midiin', 30, 270, 50);
object('midiparse', 'midiparse', 30, 305, 70);
object('note-unpack', 'unpack 0 0', 30, 345, 80);
object('note-pack', 'pack 0 0 1', 30, 380, 85);
object('note-prepend', 'prepend note', 30, 415, 90);
object('cc-unpack', 'unpack 0 0', 130, 345, 80);
object('cc-pack', 'pack 0 0 1', 130, 380, 85);
object('cc-prepend', 'prepend cc', 130, 415, 85);
object('v8', 'v8 motif-device.js', 260, 415, 175, { numinlets: 1, numoutlets: 1, outlettype: [''] });

object('engine-route', 'route event panic clear status error context motifs-reset motif-item motif-selected midi-pass ui', 260, 460, 765);
object('event-unpack', 'unpack 0 0 0 0.', 260, 500, 115);
object('event-pipe', 'pipe 0 0 0 0.', 260, 540, 105);
object('note-output-pack', 'pack 0 0', 260, 580, 65);
object('note-midiformat', 'midiformat', 260, 620, 75);
object('midiflush', 'midiflush', 170, 660, 65);
object('midiout', 'midiout', 170, 700, 55);
object('panic-trigger', 't b b', 385, 500, 45);
message('clear-pipe-message', 'clear', 440, 540, 40);
object('status-set', 'prepend set', 500, 500, 80);
object('error-set', 'prepend set', 590, 500, 80);
message('menu-clear', 'clear', 680, 500, 40);
object('menu-append', 'prepend append', 730, 500, 100);
object('menu-select', 'prepend setsymbol', 840, 500, 115);
object('ui-route', 'route preview preview-notes preview-root motif-title motif-description motif-stats motif-tags', 1035, 500, 660);
object('preview-notes-set', 'prepend set', 1035, 540, 80);
object('preview-root-set', 'prepend set', 1125, 540, 80);
object('motif-title-set', 'prepend set', 1215, 540, 80);
object('motif-description-set', 'prepend set', 1305, 540, 80);
object('motif-stats-set', 'prepend set', 1395, 540, 80);
object('motif-tags-set', 'prepend set', 1485, 540, 80);

object('poly-reverse', 'zl rev', 30, 460, 45);
object('other-midiformat', 'midiformat', 30, 495, 75);
object('other-gate', 'gate 1 1', 30, 535, 60);
object('load-gate', 'loadmess 1', 105, 535, 75);

// ---------- Native Live Song observers ----------
object('thisdevice', 'live.thisdevice', 520, 270, 95);
object('init-order', 't b b b', 520, 305, 60);
object('property-fanout', 't b b b b b b b b b', 600, 305, 155);
object('live-path', 'live.path live_set', 520, 345, 115);
object('initialize-defer', 'deferlow', 520, 385, 60);
message('initialize-message', 'initialize', 520, 420, 65);
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
  object(`${name}-host`, 'prepend host', x + 470, y, 105);
  connect('property-fanout', index, `${name}-property`, 0);
  connect(`${name}-property`, 0, `${name}-observer`, 0);
  connect('live-path', 0, `${name}-observer`, 1);
  connect(`${name}-observer`, 0, `${name}-property-name`, 0);
  connect(`${name}-property-name`, 0, `${name}-host`, 0);
  connect(`${name}-host`, 0, 'v8', 0);
});

// Native UI formatting. These displays never depend on JavaScript.
message('root-set-message', 'set $1', 620, 560, 55);
object('scale-name-set', 'prepend set', 685, 560, 80);
object('scale-mode-select', 'sel 0 1', 775, 560, 55);
message('scale-off-message', 'set Scale Off', 840, 550, 90);
message('scale-on-message', 'set Scale On', 840, 575, 90);
object('meter-pak', 'pak 4 4', 940, 560, 60);
object('meter-format', 'sprintf %ld/%ld', 1010, 560, 100);
object('meter-set', 'prepend set', 1120, 560, 80);
object('transport-select', 'sel 0 1', 1210, 560, 55);
message('stopped-message', 'set Stopped', 1275, 550, 80);
message('playing-message', 'set Playing', 1275, 575, 80);

connect('root-note-observer', 0, 'root-set-message', 0);
connect('root-set-message', 0, 'root-display', 0);
connect('scale-name-observer', 0, 'scale-name-set', 0);
connect('scale-name-set', 0, 'scale-name-display', 0);
connect('scale-mode-observer', 0, 'scale-mode-select', 0);
connect('scale-mode-select', 0, 'scale-off-message', 0);
connect('scale-mode-select', 1, 'scale-on-message', 0);
connect('scale-off-message', 0, 'scale-mode-display', 0);
connect('scale-on-message', 0, 'scale-mode-display', 0);
connect('tempo-observer', 0, 'tempo-display', 0);
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

// Proven startup ordering: property first, live_set id second, TypeScript initialization last.
connect('thisdevice', 0, 'init-order', 0);
connect('init-order', 2, 'property-fanout', 0);
connect('init-order', 1, 'live-path', 0);
connect('init-order', 0, 'initialize-defer', 0);
connect('initialize-defer', 0, 'initialize-message', 0);
connect('initialize-message', 0, 'v8', 0);
connect('force-presentation', 0, 'thispatcher', 0);
connect('presentation-message', 0, 'thispatcher', 0);

// ---------- MIDI input/output wiring ----------
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
connect('engine-route', 9, 'other-gate', 0);
connect('engine-route', 10, 'ui-route', 0);
connect('ui-route', 0, 'motif-preview', 0);
connect('ui-route', 1, 'preview-notes-set', 0);
connect('preview-notes-set', 0, 'preview-notes-display', 0);
connect('ui-route', 2, 'preview-root-set', 0);
connect('preview-root-set', 0, 'preview-root-display', 0);
connect('ui-route', 3, 'motif-title-set', 0);
connect('motif-title-set', 0, 'motif-title-display', 0);
connect('ui-route', 4, 'motif-description-set', 0);
connect('motif-description-set', 0, 'motif-description-display', 0);
connect('ui-route', 5, 'motif-stats-set', 0);
connect('motif-stats-set', 0, 'motif-stats-display', 0);
connect('ui-route', 6, 'motif-tags-set', 0);
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
    digest: 'Native Song observers for tempo and scale; TypeScript motif processing; Max 9 v8ui preview',
    tags: 'midi motif phrase scale preview',
    boxes,
    lines,
    dependency_cache: [
      { name: 'motif-device.js', bootpath: '.', patcherrelativepath: '.', type: 'TEXT', implicit: 1 },
      { name: 'motif-preview.js', bootpath: '.', patcherrelativepath: '.', type: 'TEXT', implicit: 1 },
    ],
    autosave: 0,
  },
};

await writeFile('max/Motif.maxpat', `${JSON.stringify(patch, null, 2)}\n`);
