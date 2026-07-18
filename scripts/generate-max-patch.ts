import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/** Rectangle coordinates: [x, y, width, height] */
type Rect = [number, number, number, number];
/** Help text attributes: { name: string; description: string } */
type HelpInfo = { name: string; description: string };
/** Box options: key-value pairs for any Max object attribute */
type BoxOptions = Record<string, unknown>;

type MaxBox = {
  id: string;
  maxclass: string;
  patching_rect: Rect;
  [key: string]: unknown;
};

type PatchLine = {
  patchline: {
    source: [string, number];
    destination: [string, number];
    order?: number;
  };
};

function asHelp(value: unknown): HelpInfo | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Record<string, unknown>;
  if (typeof record.name === 'string' && typeof record.description === 'string') {
    return { name: record.name, description: record.description };
  }
  return undefined;
}

export async function generateMaxPatch(): Promise<void> {
  let nextId = 1;
  const boxes: Array<{ box: MaxBox }> = [];
  const lines: PatchLine[] = [];
  const ids: Record<string, string> = {};

  const WIDTH = 480;
  const FONT = 'Ableton Sans';

  /** Fixed RGBA only — Max rejects named dynamic-color tokens in maxpat JSON. live.* keep defaults for theme follow. */
  const COLORS = {
    panel: [0.12, 0.12, 0.13, 1],
    text: [0.88, 0.88, 0.9, 1],
    muted: [0.58, 0.59, 0.63, 1],
    accent: [1.0, 0.55, 0.12, 1],
    previewBg: [0.08, 0.08, 0.09, 1],
    previewBorder: [0.2, 0.2, 0.22, 1],
  };

  /** Common Live Song.scale_name values — keeps live.menu setsymbol in-range. */
  const LIVE_SCALE_NAMES = [
    'Major', 'Minor', 'Dorian', 'Mixolydian', 'Lydian', 'Phrygian', 'Locrian',
    'Whole Tone', 'Half-whole Dim.', 'Whole-half Dim.', 'Minor Blues', 'Minor Pentatonic',
    'Major Pentatonic', 'Harmonic Minor', 'Harmonic Major', 'Dorian #4', 'Phrygian Dominant',
    'Melodic Minor', 'Lydian Augmented', 'Lydian Dominant', 'Super Locrian', 'Spanish',
    'Bhairav', 'Hungarian Minor', 'Chinese', 'Hirajoshi', 'In-Sen', 'Iwato', 'Kumoi', 'Pelog',
    'Messiaen 3', 'Messiaen 4', 'Messiaen 5', 'Messiaen 6', 'Messiaen 7',
  ] as const;

  const LIVE_ROOT_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

  function add(name: string, maxclass: string, patchingRect: Rect, options: BoxOptions = {}): string {
    const id = `obj-${nextId++}`;
    ids[name] = id;
    boxes.push({ box: { id, maxclass, patching_rect: patchingRect, ...options } });
    return id;
  }

  function object(name: string, text: string, x: number, y: number, width = 120, options: BoxOptions = {}): string {
    return add(name, 'newobj', [x, y, width, 22], { text, ...options });
  }

  function message(name: string, text: string, x: number, y: number, width = 90): string {
    return add(name, 'message', [x, y, width, 22], { text });
  }

  function helpAttrs(name: string, description: string): { annotation_name: string; annotation: string; hint: string } {
    return {
      annotation_name: name,
      annotation: description,
      hint: description,
    };
  }

  function uiPanel(name: string, rect: Rect, options: BoxOptions = {}): string {
    return add(name, 'panel', rect, {
      background: 1,
      border: 0,
      bgcolor: options.bgcolor ?? COLORS.panel,
      rounded: options.rounded ?? 0,
      presentation: 1,
      presentation_rect: rect,
      varname: name,
      hidden: options.hidden ?? 0,
    });
  }

  function uiComment(name: string, text: string, rect: Rect, options: BoxOptions = {}): string {
    return add(name, 'comment', rect, {
      text,
      fontname: FONT,
      fontsize: options.fontsize ?? 10,
      fontface: options.fontface ?? 0,
      textcolor: options.textcolor ?? COLORS.text,
      textjustification: options.justification ?? 0,
      linecount: options.linecount,
      presentation: 1,
      presentation_rect: rect,
      varname: name,
      ignoreclick: options.ignoreclick ?? 1,
      hidden: options.hidden ?? 0,
      ...((() => {
        const help = asHelp(options.help);
        return help ? helpAttrs(help.name, help.description) : {};
      })()),
    });
  }

  function menuItems(values: readonly string[]): string[] {
    const items = [];
    for (const value of values) {
      if (items.length) items.push(',');
      items.push(value);
    }
    return items;
  }

  function parameterAttributes(longName: string, shortName: string, values: readonly string[], initial = 0): BoxOptions {
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

  function uiDynamicMenu(name: string, items: readonly string[], rect: Rect, help: { name: string; description: string }, options: BoxOptions = {}): string {
    return add(name, 'umenu', rect, {
      items: menuItems(items),
      fontname: FONT,
      fontsize: options.fontsize ?? 10,
      bgcolor: COLORS.previewBg,
      textcolor: COLORS.text,
      bordercolor: COLORS.previewBorder,
      hltcolor: COLORS.accent,
      ignoreclick: options.ignoreclick ?? 0,
      presentation: 1,
      presentation_rect: rect,
      varname: name,
      hidden: options.hidden ?? 0,
      ...helpAttrs(help.name, help.description),
    });
  }

  function uiLiveMenu(name: string, values: readonly string[], rect: Rect, longName: string, shortName: string, initial: number, help: { name: string; description: string }, options: BoxOptions = {}): string {
    return add(name, 'live.menu', rect, {
      appearance: 0,
      // No font/color overrides — Live theme owns live.menu chrome (matches stock Scale device).
      parameter_enable: options.parameter_enable ?? 1,
      presentation: 1,
      presentation_rect: rect,
      saved_attribute_attributes: parameterAttributes(longName, shortName, values, initial),
      varname: name,
      valuepopup: 1,
      valuepopuplabel: 3,
      ignoreclick: options.ignoreclick ?? 0,
      hidden: options.hidden ?? 0,
      ...helpAttrs(help.name, help.description),
    });
  }

  /** Section labels that follow Live’s live.comment styling (Scale / Pitch / BPM ×). */
  function uiLiveComment(name: string, text: string, rect: Rect, options: BoxOptions = {}): string {
    return add(name, 'live.comment', rect, {
      text,
      presentation: 1,
      presentation_rect: rect,
      varname: name,
      hidden: options.hidden ?? 0,
    });
  }

  function uiLiveTab(name: string, values: readonly string[], rect: Rect, longName: string, shortName: string, initial: number, help: { name: string; description: string }, options: BoxOptions = {}): string {
    return add(name, 'live.tab', rect, {
      fontname: FONT,
      fontsize: 9,
      mode: 0,
      livemode: 1,
      multiline: 0,
      num_lines_patching: 1,
      num_lines_presentation: 1,
      parameter_enable: 1,
      presentation: 1,
      presentation_rect: rect,
      saved_attribute_attributes: parameterAttributes(longName, shortName, values, initial),
      varname: name,
      valuepopup: 1,
      valuepopuplabel: 3,
      hidden: options.hidden ?? 0,
      ...helpAttrs(help.name, help.description),
    });
  }

  function uiLiveNumber(name: string, rect: Rect, longName: string, shortName: string, initial: number, help: { name: string; description: string }, options: BoxOptions = {}): string {
    return add(name, 'live.numbox', rect, {
      appearance: 4,
      fontname: FONT,
      fontsize: 10,
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
      varname: name,
      valuepopup: 1,
      valuepopuplabel: 3,
      hidden: options.hidden ?? 0,
      ...helpAttrs(help.name, help.description),
    });
  }

  function uiButton(name: string, text: string, rect: Rect, help: { name: string; description: string }, options: BoxOptions = {}): string {
    return add(name, 'live.text', rect, {
      // Theme-default live.text (Mouse Up) — matches stock Live pill buttons; no custom colors.
      appearance: 0,
      fontname: FONT,
      fontsize: options.fontsize ?? 10,
      mode: 0,
      outputmode: 1,
      parameter_enable: 0,
      text,
      texton: text,
      presentation: 1,
      presentation_rect: rect,
      varname: name,
      hidden: options.hidden ?? 0,
      ...helpAttrs(help.name, help.description),
    });
  }

  /** Patching-view only section header (not in Presentation). */
  function patchComment(name: string, text: string, x: number, y: number, width = 240): string {
    return add(name, 'comment', [x, y, width, 20], {
      text,
      fontname: FONT,
      fontsize: 12,
      fontface: 1,
      presentation: 0,
    });
  }

  function uiPreview(name: string, rect: Rect, help: { name: string; description: string }, options: BoxOptions = {}): string {
    return add(name, 'multislider', rect, {
      settype: 0,
      setstyle: 1,
      setminmax: [0, 12],
      // Initial column count only; runtime sends `size N` then `setlist` per motif.
      size: 8,
      thickness: 6,
      spacing: 2,
      drawpeaks: 0,
      contdata: 2,
      listresize: 1,
      bgcolor: COLORS.previewBg,
      slidercolor: COLORS.accent,
      bordercolor: COLORS.previewBorder,
      ignoreclick: 1,
      parameter_enable: 0,
      presentation: 1,
      presentation_rect: rect,
      varname: name,
      hidden: options.hidden ?? 0,
      ...helpAttrs(help.name, help.description),
    });
  }

  function connect(source: string, sourceOutlet: number, destination: string, destinationInlet: number, order?: number): void {
    const patchline: PatchLine['patchline'] = {
      source: [ids[source] ?? source, sourceOutlet],
      destination: [ids[destination] ?? destination, destinationInlet],
    };
    lines.push({
      patchline: order === undefined ? patchline : { ...patchline, order },
    });
  }

  /**
   * Build tab visibility as one short message per object.
   * A single giant comma-message is truncated by Max and breaks hide/show.
   */
  function wireTabVisibility(triggerName: string, hideNames: readonly string[], showNames: readonly string[], baseX: number, baseY: number): void {
    const count = hideNames.length + showNames.length;
    const bangs = Array.from({ length: count }, () => 'b').join(' ');
    const fanName = `${triggerName}-fan`;
    object(fanName, `t ${bangs}`, baseX, baseY, Math.max(80, count * 14));
    connect(triggerName, 0, fanName, 0);

    const rowPitch = 70;
    const colPitch = 320;
    const rowsPerCol = 12;
    let outlet = 0;
    let slot = 0;
    for (const name of hideNames) {
      const col = Math.floor(slot / rowsPerCol);
      const row = slot % rowsPerCol;
      const x = baseX + 120 + col * colPitch;
      const y = baseY + row * rowPitch;
      const msg = `${triggerName}-hide-${name}`;
      message(msg, `script sendbox ${name} hidden 1`, x, y, 260);
      connect(fanName, outlet, msg, 0);
      connect(msg, 0, 'thispatcher', 0);
      outlet += 1;
      slot += 1;
    }
    for (const name of showNames) {
      const col = Math.floor(slot / rowsPerCol);
      const row = slot % rowsPerCol;
      const x = baseX + 120 + col * colPitch;
      const y = baseY + row * rowPitch;
      const msg = `${triggerName}-show-${name}`;
      message(msg, `script sendbox ${name} hidden 0`, x, y, 260);
      connect(fanName, outlet, msg, 0);
      connect(msg, 0, 'thispatcher', 0);
      outlet += 1;
      slot += 1;
    }
  }

  // ---------- Presentation UI (8px grid; Live owns device chrome) ----------
  //
  //  y=4   [Motif|Settings] [motif] [BPM ×][mult] [Info] [Panic]
  //  y=28  MIDI preview
  //  y=132 notes
  //  y=148 one row: Pitch [menu]  Scale [root][name]  (scale menus active↔Song.scale_mode)

  uiLiveTab(
    'page-tab',
    ['Motif', 'Settings'],
    [8, 4, 96, 20],
    'Page',
    'Page',
    0,
    {
      name: 'Page',
      description: 'Switch between the Motif performance view and Settings for less-used controls.',
    },
  );

  const motifHidden = { hidden: 0 };
  uiDynamicMenu('motif-menu', ['Loading…'], [112, 4, 176, 20], {
    name: 'Selected Motif',
    description: 'Choose the phrase played when a trigger note is received. The preview updates immediately.',
  }, { fontsize: 10, ...motifHidden });
  uiLiveComment('tempo-mult-label', 'BPM ×', [312, 5, 35, 20], motifHidden);
  uiLiveMenu(
    'tempo-mult-menu',
    ['0.5', '1', '1.5', '2'],
    [356, 6.5, 32, 20],
    'BPM Multiplier',
    'BPM ×',
    1,
    {
      name: 'BPM Multiplier',
      description: 'Multiplies Live’s Song tempo for motif scheduling only. Does not change the Live Set tempo. Default is 1.',
    },
    motifHidden,
  );
  uiButton('info-button', 'Info', [396, 4, 32, 20], {
    name: 'Library & Info',
    description: 'Open the floating Library & Info window with motif description, tags, and library controls.',
  }, motifHidden);
  uiButton('panic-button', 'Panic', [432, 4, 40, 20], {
    name: 'Panic',
    description: 'Immediately clears scheduled phrase events and sends note-offs for active MIDI notes.',
  }, motifHidden);

  uiPanel('ui-preview-panel', [8, 28, 464, 100], { bgcolor: COLORS.previewBg, ...motifHidden });
  uiPreview('motif-preview', [12, 32, 456, 92], {
    name: 'Motif Note Preview',
    description: 'A time-and-pitch preview of the selected motif after applying the current Live scale, pitch mode, meter mode, BPM multiplier, and most recent trigger note.',
  }, motifHidden);

  uiComment('preview-notes-display', 'C3  ·  A♯2  ·  D♯3  ·  D3  ·  C♯3  ·  C3', [8, 130, 464, 14], {
    fontsize: 11,
    fontface: 1,
    textcolor: COLORS.text,
    justification: 0,
    help: { name: 'Preview Notes', description: 'The exact MIDI note names that the current preview will play.' },
    ...motifHidden,
  });

  // Single bottom row — inline labels; Scale menus dim via `active` when Song.scale_mode is off
  uiLiveComment('pitch-label', 'Pitch', [8, 146.5, 40, 18], motifHidden);
  uiLiveMenu(
    'pitch-menu',
    ['motif', 'scale', 'chromatic', 'hybrid'],
    [52, 148, 88, 18],
    'Pitch Mode',
    'Pitch',
    0,
    {
      name: 'Pitch Mode',
      description: 'Motif uses the phrase’s stored pitch mode. Scale maps stored degrees through Live’s current scale; Chromatic preserves semitone intervals; Hybrid combines scale degrees with accidentals.',
    },
    motifHidden,
  );
  uiLiveComment('scale-label', 'Scale', [148, 146.5, 44, 18], motifHidden);
  // parameter_enable must stay 1 — live.menu loads parameter_enum from the Live parameter.
  // ignoreclick keeps them Song-driven; active 0/1 follows Song.scale_mode for Live’s disabled look.
  uiLiveMenu(
    'root-display',
    LIVE_ROOT_NAMES,
    [196, 148, 40, 18],
    'Live Scale Root',
    'Root',
    0,
    {
      name: 'Live Scale Root',
      description: "Live Set's current scale root, observed from Song.root_note. Dimmed when Scale Mode is off.",
    },
    { ignoreclick: 1, ...motifHidden },
  );
  uiLiveMenu(
    'scale-name-display',
    LIVE_SCALE_NAMES,
    [240, 148, 132, 18],
    'Live Scale Name',
    'Scale',
    0,
    {
      name: 'Live Scale Name',
      description: "Live Set's current scale name, observed from Song.scale_name. Dimmed when Scale Mode is off.",
    },
    { ignoreclick: 1, ...motifHidden },
  );

  // Settings tab (initially hidden) — same 8px vertical rhythm
  const settingsHidden = { hidden: 1 };

  uiComment('trigger-label', 'Trigger', [8, 30, 80, 16], { fontsize: 10, ...settingsHidden });
  uiComment('quant-label', 'Launch', [8, 52, 80, 16], { fontsize: 10, ...settingsHidden });
  uiComment('pass-label', 'MIDI Pass', [8, 74, 80, 16], { fontsize: 10, ...settingsHidden });
  uiComment('meter-label', 'Meter', [8, 96, 80, 16], { fontsize: 10, ...settingsHidden });
  uiComment('retrigger-label', 'Retrigger', [8, 118, 80, 16], { fontsize: 10, ...settingsHidden });
  uiComment('zone-label', 'Zone', [8, 140, 80, 16], { fontsize: 10, ...settingsHidden });

  uiLiveMenu('trigger-menu', ['one-shot', 'hold', 'toggle', 'latch', 'release-tail'], [96, 28, 232, 20], 'Trigger Mode', 'Trigger', 0, {
    name: 'Trigger Mode',
    description: 'One-shot plays the full motif; Hold stops on key release; Toggle alternates on/off; Latch replaces the active phrase; Release-tail lets scheduled notes finish.',
  }, settingsHidden);
  uiLiveMenu('quant-menu', ['immediate', '1/16', '1/8', '1/4', 'bar'], [96, 50, 232, 20], 'Launch Quantization', 'Launch', 0, {
    name: 'Launch Quantization',
    description: 'Delay phrase start to the selected musical boundary while Live is playing. Immediate starts as soon as the trigger is received.',
  }, settingsHidden);
  uiLiveMenu('pass-menu', ['none', 'non-triggers', 'all'], [96, 72, 232, 20], 'MIDI Pass Through', 'MIDI Pass', 1, {
    name: 'MIDI Pass Through',
    description: 'None blocks dry notes; Non-triggers consumes trigger-zone notes but passes other MIDI; All passes every incoming note alongside the motif.',
  }, settingsHidden);
  uiLiveTab('meter-tab', ['preserve', 'fit-bar'], [96, 94, 232, 20], 'Meter Mode', 'Meter', 0, {
    name: 'Meter Mode',
    description: 'Preserve keeps the motif’s original timing. Fit Bar scales its source bars to the Live Set’s current time signature.',
  }, settingsHidden);
  uiLiveTab('retrigger-tab', ['replace', 'overlap'], [96, 116, 232, 20], 'Retrigger Mode', 'Retrigger', 0, {
    name: 'Retrigger Mode',
    description: 'Replace clears scheduled motif notes before starting the next phrase. Overlap allows multiple triggered phrases to play together.',
  }, settingsHidden);
  uiLiveNumber('low-number', [96, 138, 56, 20], 'Trigger Low', 'Low', 36, {
    name: 'Trigger Zone Low',
    description: 'Lowest MIDI note treated as a motif trigger. Notes below this value follow the MIDI Pass setting.',
  }, settingsHidden);
  uiLiveNumber('high-number', [160, 138, 56, 20], 'Trigger High', 'High', 84, {
    name: 'Trigger Zone High',
    description: 'Highest MIDI note treated as a motif trigger. Notes above this value follow the MIDI Pass setting.',
  }, settingsHidden);

  const MOTIF_BOXES = [
    'motif-menu',
    'tempo-mult-label',
    'tempo-mult-menu',
    'info-button',
    'panic-button',
    'ui-preview-panel',
    'motif-preview',
    'preview-notes-display',
    'pitch-label',
    'pitch-menu',
    'scale-label',
    'root-display',
    'scale-name-display',
  ];
  const SETTINGS_BOXES = [
    'trigger-label',
    'trigger-menu',
    'quant-label',
    'quant-menu',
    'pass-label',
    'pass-menu',
    'meter-label',
    'meter-tab',
    'retrigger-label',
    'retrigger-tab',
    'zone-label',
    'low-number',
    'high-number',
  ];

  // ---------- Floating Library / Info subpatcher (Presentation Mode) ----------
  function buildLibrarySubpatcher(): BoxOptions {
    const nestedBoxes: Array<{ box: MaxBox }> = [];
    const nestedLines: PatchLine[] = [];
    const nestedIds: Record<string, string> = {};
    const POP_W = 420;
    const POP_H = 260;

    function nadd(name: string, maxclass: string, patchingRect: Rect, options: BoxOptions = {}): string {
      const id = `obj-${nextId++}`;
      nestedIds[name] = id;
      nestedBoxes.push({ box: { id, maxclass, patching_rect: patchingRect, ...options } });
      return id;
    }

    function nobject(name: string, text: string, x: number, y: number, width = 120, options: BoxOptions = {}): string {
      return nadd(name, 'newobj', [x, y, width, 22], { text, ...options });
    }

    function nconnect(source: string, sourceOutlet: number, destination: string, destinationInlet: number): void {
      const sourceId = nestedIds[source];
      const destinationId = nestedIds[destination];
      if (!sourceId || !destinationId) {
        throw new Error(`Unknown nested connection ${source} -> ${destination}`);
      }
      nestedLines.push({
        patchline: {
          source: [sourceId, sourceOutlet],
          destination: [destinationId, destinationInlet],
        },
      });
    }

  function nui(name: string, maxclass: string, presentationRect: Rect, options: BoxOptions = {}): string {
    return nadd(name, maxclass, presentationRect, {
      presentation: 1,
      presentation_rect: presentationRect,
      ...options,
    });
  }

    // Inlet for pcontrol (not in presentation)
    nadd('lib-inlet', 'inlet', [20, 20, 40, 20]);

    nui('lib-bg', 'panel', [0, 0, POP_W, POP_H], {
      background: 1,
      border: 0,
      bgcolor: COLORS.panel,
      rounded: 0,
      varname: 'lib-bg',
    });
    nui('lib-title', 'comment', [16, 12, 388, 22], {
      text: 'Motif',
      fontname: FONT,
      fontsize: 14,
      fontface: 1,
      textcolor: COLORS.accent,
      varname: 'motif-title-display',
    });
    nui('lib-stats', 'comment', [16, 38, 388, 16], {
      text: '0 notes  •  0 bars',
      fontname: FONT,
      fontsize: 9,
      textcolor: COLORS.muted,
      varname: 'motif-stats-display',
    });
    nui('lib-description', 'comment', [16, 62, 388, 100], {
      text: 'Select a motif to see its description.',
      fontname: FONT,
      fontsize: 11,
      textcolor: COLORS.text,
      linecount: 6,
      varname: 'motif-description-display',
    });
    nui('lib-tags', 'comment', [16, 170, 388, 16], {
      text: '',
      fontname: FONT,
      fontsize: 9,
      textcolor: COLORS.muted,
      varname: 'motif-tags-display',
    });
    nui('lib-library-label', 'comment', [16, 208, 70, 16], {
      text: 'Library',
      fontname: FONT,
      fontsize: 9,
      textcolor: COLORS.text,
    });
    nui('choose-library', 'live.text', [90, 204, 72, 22], {
      appearance: 0,
      fontname: FONT,
      fontsize: 9,
      mode: 0,
      outputmode: 1,
      parameter_enable: 0,
      text: 'Choose',
      texton: 'Choose',
      varname: 'choose-library',
      ...helpAttrs('Choose Motif Library', 'Select a folder containing additional motif JSON files. Built-in motifs remain available.'),
    });
    nui('refresh-button', 'live.text', [170, 204, 72, 22], {
      appearance: 0,
      fontname: FONT,
      fontsize: 9,
      mode: 0,
      outputmode: 1,
      parameter_enable: 0,
      text: 'Refresh',
      texton: 'Refresh',
      varname: 'refresh-button',
      ...helpAttrs('Refresh Motif Library', 'Reload built-in motifs and all JSON motifs from the selected library folder.'),
    });

  // Logic — patching only (outside presentation), generously spaced
  const LX = 560;
  const LY = 40;
  const LROW = 80;
  nobject('lib-thispatcher', 'thispatcher', LX, LY, 90);
  nobject('lib-force-pres', 'loadmess presentation 1', LX, LY + LROW, 160);
  nconnect('lib-force-pres', 0, 'lib-thispatcher', 0);

  nobject('r-title', 'receive ---motif-title', LX, LY + LROW * 3, 160);
  nobject('r-stats', 'receive ---motif-stats', LX, LY + LROW * 4, 160);
  nobject('r-description', 'receive ---motif-description', LX, LY + LROW * 5, 190);
  nobject('r-tags', 'receive ---motif-tags', LX, LY + LROW * 6, 160);
  nobject('title-set', 'prepend set', LX + 280, LY + LROW * 3, 100);
  nobject('stats-set', 'prepend set', LX + 280, LY + LROW * 4, 100);
  nobject('description-set', 'prepend set', LX + 280, LY + LROW * 5, 100);
  nobject('tags-set', 'prepend set', LX + 280, LY + LROW * 6, 100);

  nobject('open-library', 'opendialog fold', LX, LY + LROW * 8, 120);
  nobject('s-library', 'send ---library_path', LX + 280, LY + LROW * 8, 160);
  nobject('s-refresh', 'send ---refresh_library', LX + 280, LY + LROW * 9, 170);

    nconnect('r-title', 0, 'title-set', 0);
    nconnect('title-set', 0, 'lib-title', 0);
    nconnect('r-stats', 0, 'stats-set', 0);
    nconnect('stats-set', 0, 'lib-stats', 0);
    nconnect('r-description', 0, 'description-set', 0);
    nconnect('description-set', 0, 'lib-description', 0);
    nconnect('r-tags', 0, 'tags-set', 0);
    nconnect('tags-set', 0, 'lib-tags', 0);
    nconnect('choose-library', 0, 'open-library', 0);
    nconnect('open-library', 0, 's-library', 0);
    nconnect('refresh-button', 0, 's-refresh', 0);

    return {
      fileversion: 1,
      appversion: { major: 9, minor: 0, revision: 0, architecture: 'x64', modernui: 1 },
      classnamespace: 'box',
    rect: [80, 80, 1200, 900],
    bglocked: 0,
    openinpresentation: 1,
    default_fontsize: 10,
    default_fontface: 0,
    default_fontname: FONT,
    gridonopen: 1,
    gridsize: [20, 20],
    gridsnaponopen: 1,
    objectsnaponopen: 1,
    statusbarvisible: 2,
    toolbarvisible: 1,
    boxes: nestedBoxes,
    lines: nestedLines,
    dependency_cache: [],
    autosave: 0,
  };
}

  // Unlocked patcher layout: Presentation UI occupies 0..480×0..169.
  // Logic uses wide columns below/right so cords and boxes stay readable.
  const ROW = 90;
  const COL = {
    midi: 80,
    engine: 720,
    feedback: 1600,
    song: 80,
    format: 80,
    tabs: 80,
    library: 2000,
    controls: 80,
  };

  // ---------- MIDI I/O column ----------
  const MIDI_Y = 280;
  patchComment('section-midi', '§ MIDI I/O — fail-open gate → midiselect → engine / midiout', COL.midi, MIDI_Y - 40, 420);
  object('midiin', 'midiin', COL.midi, MIDI_Y, 70);
  object('input-gate', 'gate 2 1', COL.midi, MIDI_Y + ROW, 80);
  object('input-bypass-default', 'loadmess 1', COL.midi + 160, MIDI_Y + ROW, 90);
  message('input-engine-mode', '2', COL.midi + 320, MIDI_Y + ROW, 40);
  object('midiselect', 'midiselect @ch all @note all', COL.midi, MIDI_Y + ROW * 2, 220);
  object('sustain-parser', 'midiparse', COL.midi + 320, MIDI_Y + ROW * 2, 90);
  object('note-unpack', 'unpack 0 0', COL.midi, MIDI_Y + ROW * 3, 100);
  object('note-pack', 'pack 0 0 1', COL.midi, MIDI_Y + ROW * 4, 110);
  object('note-prepend', 'prepend note', COL.midi, MIDI_Y + ROW * 5, 110);
  object('sustain-route', 'route 64', COL.midi + 320, MIDI_Y + ROW * 3, 80);
  object('sustain-pack', 'pack 0 1', COL.midi + 320, MIDI_Y + ROW * 4, 80);
  object('sustain-prepend', 'prepend sustain', COL.midi + 320, MIDI_Y + ROW * 5, 130);
  object('midiflush', 'midiflush', COL.midi, MIDI_Y + ROW * 7, 80);
  object('midiout', 'midiout', COL.midi, MIDI_Y + ROW * 8, 70);

  // ---------- Engine column ----------
  const ENG_Y = 280;
  patchComment('section-engine', '§ Engine — v8 motif-device.js + event pipe / panic / clear', COL.engine, ENG_Y - 40, 480);
  object('v8', 'v8 motif-device.js', COL.engine, ENG_Y + ROW * 2, 200, { numinlets: 1, numoutlets: 1, outlettype: [''] });
  object('engine-route', 'route event panic clear status error context motifs-reset motif-item motif-selected midi-pass ui', COL.engine, ENG_Y + ROW * 3, 820);
  object('event-unpack', 'unpack 0 0 0 0.', COL.engine, ENG_Y + ROW * 4, 140);
  object('event-pipe', 'pipe 0 0 0 0.', COL.engine, ENG_Y + ROW * 5, 130);
  object('note-output-pack', 'pack 0 0', COL.engine, ENG_Y + ROW * 6, 80);
  object('note-midiformat', 'midiformat', COL.engine, ENG_Y + ROW * 7, 90);
  object('panic-trigger', 't b b', COL.engine + 280, ENG_Y + ROW * 4, 60);
  message('clear-pipe-message', 'clear', COL.engine + 400, ENG_Y + ROW * 5, 60);

  // ---------- Feedback / menu / UI emit column ----------
  const FB_Y = 280;
  patchComment('section-feedback', '§ Feedback — motif menu + preview / library UI emits (status stays in Max window)', COL.feedback, FB_Y - 40, 560);
  message('menu-clear', 'clear', COL.feedback, FB_Y + ROW * 2, 60);
  object('menu-append', 'prepend append', COL.feedback, FB_Y + ROW * 3, 120);
  object('menu-select', 'prepend setsymbol', COL.feedback, FB_Y + ROW * 4, 140);
  object('ui-route', 'route preview-size preview-pitches preview-range preview-notes preview-root motif-title motif-description motif-stats motif-tags', COL.feedback, FB_Y + ROW * 6, 900);
  object('preview-size-set', 'prepend size', COL.feedback, FB_Y + ROW * 7, 100);
  object('preview-pitches-set', 'prepend setlist', COL.feedback + 160, FB_Y + ROW * 7, 120);
  object('preview-range-set', 'prepend setmax', COL.feedback + 340, FB_Y + ROW * 7, 120);
  object('preview-notes-set', 'prepend set', COL.feedback + 520, FB_Y + ROW * 7, 100);
  object('s-motif-title', 'send ---motif-title', COL.feedback, FB_Y + ROW * 8, 160);
  object('s-motif-description', 'send ---motif-description', COL.feedback + 240, FB_Y + ROW * 8, 190);
  object('s-motif-stats', 'send ---motif-stats', COL.feedback, FB_Y + ROW * 9, 160);
  object('s-motif-tags', 'send ---motif-tags', COL.feedback + 240, FB_Y + ROW * 9, 160);

  // ---------- Song observers ----------
  const OBS_Y = 1200;
  patchComment('section-song', '§ Song observers — live.path live_set → live.observer → song_context → v8', COL.song, OBS_Y - 40, 560);
  object('thisdevice', 'live.thisdevice', COL.song, OBS_Y, 120);
  object('init-order', 't b b b', COL.song, OBS_Y + ROW, 80);
  object('property-fanout', 't b b b b b b b b b', COL.song + 200, OBS_Y + ROW, 200);
  object('live-path', 'live.path live_set', COL.song, OBS_Y + ROW * 2, 140);
  object('initialize-defer', 'deferlow', COL.song, OBS_Y + ROW * 3, 80);
  message('initialize-message', 'initialize', COL.song, OBS_Y + ROW * 4, 90);
  object('song-context-defer', 'deferlow', COL.song + 220, OBS_Y + ROW * 4, 80);
  object('ready-route', 'route Ready', COL.song + 400, OBS_Y + ROW * 4, 100);
  object('ready-trigger', 't b b', COL.song + 580, OBS_Y + ROW * 4, 60);
  object('observer-refresh', 't b b b b b b b b b', COL.song + 720, OBS_Y + ROW * 4, 210);
  message('presentation-message', 'presentation 1', COL.song + 400, OBS_Y + ROW * 2, 120);
  object('thispatcher', 'thispatcher', COL.song + 620, OBS_Y + ROW * 2, 90);
  object('force-presentation', 'loadmess presentation 1', COL.song + 400, OBS_Y + ROW, 170);

  const observers: Array<[string, string]> = [
    ['tempo', 'tempo'],
    ['root-note', 'root_note'],
    ['scale-mode', 'scale_mode'],
    ['scale-intervals', 'scale_intervals'],
    ['scale-name', 'scale_name'],
    ['numerator', 'signature_numerator'],
    ['denominator', 'signature_denominator'],
    ['is-playing', 'is_playing'],
    ['song-time', 'current_song_time'],
  ];

  observers.forEach(([name, property], index) => {
    const y = OBS_Y + ROW * 6 + index * ROW;
    const x = COL.song;
    message(`${name}-property`, `property ${property}`, x, y, 210);
    object(`${name}-observer`, 'live.observer', x + 280, y, 110);
    object(`${name}-property-name`, `prepend ${property}`, x + 460, y, 220);
    object(`${name}-song-context`, 'prepend song_context', x + 760, y, 170);
    connect('property-fanout', index, `${name}-property`, 0);
    connect(`${name}-property`, 0, `${name}-observer`, 0);
    connect('live-path', 0, `${name}-observer`, 1);
    connect(`${name}-observer`, 0, `${name}-property-name`, 0);
    connect(`${name}-property-name`, 0, `${name}-song-context`, 0);
    connect(`${name}-song-context`, 0, 'song-context-defer', 0);
  });

  const FMT_Y = OBS_Y + ROW * 16;
  patchComment('section-format', '§ Host displays — Scale live.menus; active follows Song.scale_mode', COL.format, FMT_Y - 40, 520);
  object('root-set', 'prepend set', COL.format, FMT_Y, 100);
  object('scale-name-set', 'prepend setsymbol', COL.format + 160, FMT_Y, 140);
  object('scale-mode-select', 'sel 0 1', COL.format + 360, FMT_Y, 70);
  object('scale-off-fan', 't b b', COL.format + 500, FMT_Y, 60);
  object('scale-on-fan', 't b b', COL.format + 500, FMT_Y + ROW, 60);
  message('root-active-off', 'active 0', COL.format + 620, FMT_Y, 80);
  message('scale-name-active-off', 'active 0', COL.format + 760, FMT_Y, 80);
  message('root-active-on', 'active 1', COL.format + 620, FMT_Y + ROW, 80);
  message('scale-name-active-on', 'active 1', COL.format + 760, FMT_Y + ROW, 80);

  connect('root-note-observer', 0, 'root-set', 0);
  connect('root-set', 0, 'root-display', 0);
  connect('scale-name-observer', 0, 'scale-name-set', 0);
  connect('scale-name-set', 0, 'scale-name-display', 0);
  connect('scale-mode-observer', 0, 'scale-mode-select', 0);
  connect('scale-mode-select', 0, 'scale-off-fan', 0);
  connect('scale-mode-select', 1, 'scale-on-fan', 0);
  connect('scale-off-fan', 0, 'root-active-off', 0);
  connect('scale-off-fan', 1, 'scale-name-active-off', 0);
  connect('root-active-off', 0, 'root-display', 0);
  connect('scale-name-active-off', 0, 'scale-name-display', 0);
  connect('scale-on-fan', 0, 'root-active-on', 0);
  connect('scale-on-fan', 1, 'scale-name-active-on', 0);
  connect('root-active-on', 0, 'root-display', 0);
  connect('scale-name-active-on', 0, 'scale-name-display', 0);

  connect('thisdevice', 0, 'init-order', 0);
  connect('init-order', 2, 'property-fanout', 0);
  connect('init-order', 1, 'live-path', 0);
  connect('init-order', 0, 'initialize-defer', 0);
  connect('initialize-defer', 0, 'initialize-message', 0);
  connect('initialize-message', 0, 'v8', 0);
  connect('song-context-defer', 0, 'v8', 0);
  connect('engine-route', 3, 'ready-route', 0);
  connect('ready-route', 0, 'ready-trigger', 0);
  connect('ready-trigger', 1, 'input-engine-mode', 0);
  connect('input-engine-mode', 0, 'input-gate', 0);
  connect('ready-trigger', 0, 'observer-refresh', 0);
  observers.forEach(([name], index) => {
    connect('observer-refresh', index, `${name}-observer`, 0);
  });
  connect('force-presentation', 0, 'thispatcher', 0);
  connect('presentation-message', 0, 'thispatcher', 0);

  // ---------- Tab visibility ----------
  const TAB_Y = 3200;
  patchComment('section-tabs', '§ Tabs — live.tab → thispatcher hide/show Motif vs Settings boxes', COL.tabs, TAB_Y - 40, 520);
  object('page-sel', 'sel 0 1', COL.tabs, TAB_Y, 70);
  message('show-motif-bang', 'bang', COL.tabs + 140, TAB_Y, 60);
  message('show-settings-bang', 'bang', COL.tabs + 140, TAB_Y + ROW, 60);
  connect('page-tab', 0, 'page-sel', 0);
  connect('page-sel', 0, 'show-motif-bang', 0);
  connect('page-sel', 1, 'show-settings-bang', 0);
  wireTabVisibility('show-motif-bang', SETTINGS_BOXES, MOTIF_BOXES, COL.tabs + 280, TAB_Y);
  wireTabVisibility('show-settings-bang', MOTIF_BOXES, SETTINGS_BOXES, COL.tabs + 280, TAB_Y + ROW * 14);

  // ---------- Floating Library window ----------
  const LIB_Y = 3200;
  patchComment('section-library', '§ Library/Info — pcontrol float window (Presentation Mode)', COL.library, LIB_Y - 40, 420);
  add('library-info', 'newobj', [COL.library, LIB_Y + ROW * 5, 140, 22], {
    text: 'p library-info',
    patcher: buildLibrarySubpatcher(),
  });
  object('library-pcontrol', 'pcontrol', COL.library, LIB_Y + ROW * 3, 80);
  object('info-trigger', 't b b b b', COL.library, LIB_Y, 90);
  message('library-flags', 'window flags float', COL.library + 180, LIB_Y, 140);
  message('library-size', 'window size 420 260', COL.library + 180, LIB_Y + ROW, 150);
  message('library-exec', 'window exec', COL.library + 180, LIB_Y + ROW * 2, 110);
  message('library-open', 'open', COL.library + 180, LIB_Y + ROW * 3, 60);
  connect('info-button', 0, 'info-trigger', 0);
  connect('info-trigger', 3, 'library-flags', 0);
  connect('info-trigger', 2, 'library-size', 0);
  connect('info-trigger', 1, 'library-exec', 0);
  connect('info-trigger', 0, 'library-open', 0);
  connect('library-flags', 0, 'library-pcontrol', 0);
  connect('library-size', 0, 'library-pcontrol', 0);
  connect('library-exec', 0, 'library-pcontrol', 0);
  connect('library-open', 0, 'library-pcontrol', 0);
  connect('library-pcontrol', 0, 'library-info', 0);

  object('r-library-path', 'receive ---library_path', COL.library + 420, LIB_Y, 180);
  object('library-prepend', 'prepend library_path', COL.library + 680, LIB_Y, 160);
  object('r-refresh', 'receive ---refresh_library', COL.library + 420, LIB_Y + ROW, 190);
  message('refresh-message', 'refresh_library', COL.library + 700, LIB_Y + ROW, 120);
  connect('r-library-path', 0, 'library-prepend', 0);
  connect('library-prepend', 0, 'v8', 0);
  connect('r-refresh', 0, 'refresh-message', 0);
  connect('refresh-message', 0, 'v8', 0);

  // ---------- MIDI wiring ----------
  connect('midiin', 0, 'input-gate', 1);
  connect('input-bypass-default', 0, 'input-gate', 0);
  connect('input-gate', 0, 'midiflush', 0);
  connect('input-gate', 1, 'midiselect', 0);
  connect('input-gate', 1, 'sustain-parser', 0);
  connect('midiselect', 7, 'midiflush', 0);
  connect('midiselect', 0, 'note-unpack', 0);
  connect('midiselect', 6, 'note-pack', 2);
  connect('note-unpack', 1, 'note-pack', 1);
  connect('note-unpack', 0, 'note-pack', 0);
  connect('note-pack', 0, 'note-prepend', 0);
  connect('note-prepend', 0, 'v8', 0);
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
  // status / error: Ready still fans to ready-route; debug text is Max console only (no UI status-display)
  connect('engine-route', 6, 'menu-clear', 0);
  connect('menu-clear', 0, 'motif-menu', 0);
  connect('engine-route', 7, 'menu-append', 0);
  connect('menu-append', 0, 'motif-menu', 0);
  connect('engine-route', 8, 'menu-select', 0);
  connect('menu-select', 0, 'motif-menu', 0);
  connect('engine-route', 10, 'ui-route', 0);
  connect('ui-route', 0, 'preview-size-set', 0);
  connect('preview-size-set', 0, 'motif-preview', 0);
  connect('ui-route', 1, 'preview-pitches-set', 0);
  connect('preview-pitches-set', 0, 'motif-preview', 0);
  connect('ui-route', 2, 'preview-range-set', 0);
  connect('preview-range-set', 0, 'motif-preview', 0);
  connect('ui-route', 3, 'preview-notes-set', 0);
  connect('preview-notes-set', 0, 'preview-notes-display', 0);
  // ui-route outlet 4 (preview-root) unused in Presentation — pitch/scale are live.* controls
  connect('ui-route', 5, 's-motif-title', 0);
  connect('ui-route', 6, 's-motif-description', 0);
  connect('ui-route', 7, 's-motif-stats', 0);
  connect('ui-route', 8, 's-motif-tags', 0);

  // ---------- UI control → engine ----------
  const CTL_Y = 4800;
  patchComment('section-controls', '§ Controls → v8 — menus/tabs/numbers + loadmess defaults', COL.controls, CTL_Y - 40, 480);
  object('motif-prepend', 'prepend motif', COL.controls, CTL_Y, 110);
  object('pitch-prepend', 'prepend pitch_mode', COL.controls + 200, CTL_Y, 150);
  object('tempo-mult-prepend', 'prepend tempo_multiplier', COL.controls + 440, CTL_Y, 180);
  object('trigger-prepend', 'prepend trigger_mode', COL.controls + 720, CTL_Y, 160);
  object('quant-prepend', 'prepend launch_quantization', COL.controls + 980, CTL_Y, 200);
  object('pass-prepend', 'prepend pass_through', COL.controls + 1280, CTL_Y, 170);
  object('meter-prepend', 'prepend meter_mode', COL.controls, CTL_Y + ROW, 150);
  object('retrigger-prepend', 'prepend retrigger', COL.controls + 240, CTL_Y + ROW, 140);
  object('low-prepend', 'prepend trigger_low', COL.controls + 480, CTL_Y + ROW, 150);
  object('high-prepend', 'prepend trigger_high', COL.controls + 720, CTL_Y + ROW, 150);
  message('panic-message', 'panic', COL.controls + 980, CTL_Y + ROW, 60);

  connect('motif-menu', 1, 'motif-prepend', 0);
  connect('motif-prepend', 0, 'v8', 0);
  connect('pitch-menu', 1, 'pitch-prepend', 0);
  connect('pitch-prepend', 0, 'v8', 0);
  connect('tempo-mult-menu', 1, 'tempo-mult-prepend', 0);
  connect('tempo-mult-prepend', 0, 'v8', 0);
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
  connect('panic-button', 0, 'panic-message', 0);
  connect('panic-message', 0, 'v8', 0);

  const DEF_Y = CTL_Y + ROW * 3;
  const defaults: Array<[string, number, number]> = [
    ['pitch-default', 0, 0],
    ['tempo-mult-default', 1, 1],
    ['trigger-default', 0, 2],
    ['quant-default', 0, 3],
    ['pass-default', 1, 4],
    ['meter-default', 0, 5],
    ['retrigger-default', 0, 6],
    ['low-default', 36, 7],
    ['high-default', 84, 8],
    ['page-default', 0, 9],
  ];
  for (const [name, value, index] of defaults) {
    object(name, `loadmess ${value}`, COL.controls + index * 160, DEF_Y, 90);
  }

  const defaultWires: Array<[string, string]> = [
    ['pitch-default', 'pitch-menu'],
    ['tempo-mult-default', 'tempo-mult-menu'],
    ['trigger-default', 'trigger-menu'],
    ['quant-default', 'quant-menu'],
    ['pass-default', 'pass-menu'],
    ['meter-default', 'meter-tab'],
    ['retrigger-default', 'retrigger-tab'],
    ['low-default', 'low-number'],
    ['high-default', 'high-number'],
    ['page-default', 'page-tab'],
  ];
  for (const [source, destination] of defaultWires) {
    connect(source, 0, destination, 0);
  }

  const patch = {
    patcher: {
      fileversion: 1,
      appversion: { major: 9, minor: 0, revision: 0, architecture: 'x64', modernui: 1 },
      classnamespace: 'box',
      rect: [60, 60, 2800, 1800],
      bglocked: 0,
      openinpresentation: 1,
      default_fontsize: 10,
      default_fontface: 0,
      default_fontname: FONT,
      gridonopen: 1,
      gridsize: [8, 8],
      gridsnaponopen: 1,
      objectsnaponopen: 1,
      statusbarvisible: 2,
      toolbarvisible: 1,
      devicewidth: WIDTH,
      description: 'Scale-aware triggerable motif engine with native Live Song synchronization and visual note preview',
      digest: 'Motif/Settings tabs; native Song observers; fail-open MIDI; BPM multiplier; Library/Info popup',
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
}

const isMain = process.argv[1] !== undefined
  && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);

if (isMain) {
  await generateMaxPatch();
}
