/**
 * Generate `max/Motif.maxpat` - the Motif MIDI Effect patcher.
 *
 * ## Architecture (do not regress)
 * - Presentation Mode, fixed 475×169 Live device height, Ableton Sans
 * - Song state via native `live.path` + `live.observer` (tempo, scale, meter, transport);
 *   JS receives updates as `song_context` through `deferlow`
 * - MIDI: fail-open until `status Ready`; non-note MIDI bypasses `v8`; scheduling via `pipe`
 * - Native jsui/mgraphics note preview; no HTML dependency in Live's device chain
 * - The Library page is materialized by the frozen engine into Max's temporary
 *   folder, then loaded through jweb's documented `readfile` message
 * - The Library page announces readiness before the engine resends its latest state
 * - Library/authoring UI in a floating `pcontrol` subpatcher
 * - Motif vs Settings pages via `live.tab` + `thispatcher` hide/show
 *
 * Prefer theme-default `live.*` colors. Every interactive control needs
 * `annotation_name`, `annotation`, and `hint`. Keep unlocked-patcher `§ ...` section comments.
 *
 * @see https://docs.cycling74.com/reference/live.path
 * @see https://docs.cycling74.com/reference/live.observer
 * @see https://docs.cycling74.com/reference/pipe
 * @see https://docs.cycling74.com/reference/midiselect
 * @see https://docs.cycling74.com/reference/deferlow
 * @see https://docs.cycling74.com/reference/pcontrol
 * @see https://docs.cycling74.com/reference/jsui
 * @see https://docs.cycling74.com/reference/jweb
 * @see https://github.com/Ableton/maxdevtools/tree/main/m4l-production-guidelines
 * @see https://github.com/Ableton/maxdevtools/tree/main/patch-code-standard
 */

import { writeFile } from "node:fs/promises";
import { SCALE_NAMES } from "../src/core/scales.js";
import {
  createStoredBlobParameterAttributes,
  MaxPatchBuilder,
  type MaxBuilderColors,
  type MaxPatchDocument,
  type MaxPatcher,
} from "./max-patch-builder.js";
import { readLibraryWindowConfig } from "./library-window-config.js";

const WIDTH = 475;
const FONT = "Ableton Sans";
const AUTHOR = "Matthew Callis";
const REPOSITORY_URL = "https://github.com/MatthewCallis/motif-m4l";
const INITIAL_DEVICE_STATE = encodeURIComponent(
  JSON.stringify({ schemaVersion: 1, selectedMotifId: "scale-turn", hotkeys: [] }),
);

/** Content-addressed JavaScript artifacts consumed by the generated Max patch. */
export interface MaxRuntimeArtifacts {
  engineFilename: string;
  previewFilename: string;
  /** User-facing version read from package.json by the build. */
  version: string;
}

/** Fixed RGBA values for non-`live.*` UI. Live owns the theme of `live.*` objects. */
const COLORS: MaxBuilderColors = {
  panel: [0.12, 0.12, 0.13, 1],
  text: [0.88, 0.88, 0.9, 1],
  muted: [0.58, 0.59, 0.63, 1],
  accent: [1.0, 0.55, 0.12, 1],
  previewBg: [0.08, 0.08, 0.09, 1],
  previewBorder: [0.2, 0.2, 0.22, 1],
};

/** Chromatic note names used by Live's `Song.root_note` property. */
const LIVE_ROOT_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

/**
 * Write a complete Motif.maxpat from the declarative layout below.
 *
 * The reusable, validated object/connection construction logic lives in
 * `max-patch-builder.ts`; this module now contains only Motif-specific layout,
 * routing, and patcher metadata.
 *
 * @param {MaxRuntimeArtifacts} runtime Content-addressed runtime filenames produced by the build.
 * @returns {Promise<void>} A promise that resolves after `max/Motif.maxpat` has been written.
 * @see https://docs.cycling74.com/userguide/object_reference/
 * @see https://docs.cycling74.com/apiref/js/patcher/
 */
export async function generateMaxPatch(runtime: MaxRuntimeArtifacts): Promise<void> {
  const libraryWindow = await readLibraryWindowConfig();
  const libraryWindowSizeMessage = `window size ${libraryWindow.width} ${libraryWindow.height}`;
  const builder = new MaxPatchBuilder({ fontName: FONT, colors: COLORS });
  const {
    addBox: add,
    addObject: object,
    addMessage: message,
    addComment: uiComment,
    addDynamicMenu: uiDynamicMenu,
    addLiveMenu: uiLiveMenu,
    addLiveComment: uiLiveComment,
    addLiveTab: uiLiveTab,
    addLiveNumber: uiLiveNumber,
    addLiveTextButton: uiButton,
    addPatchComment: patchComment,
    addJsuiPreview: uiPreview,
    boxes,
    lines,
    connect,
    wireTabVisibility,
  } = builder;

  // ---------- Presentation UI (8px grid; Live owns device chrome) ----------
  //
  //  y=4   [Motif|Settings] [motif] [BPM ×][mult] [Info] [Panic]
  //  y=28  MIDI preview
  //  y=132 notes
  //  y=148 one row: Pitch [menu][Invert][Reverse]  Scale [root][name]

  uiLiveTab("page-tab", ["Motif", "Settings"], [0, 4, 96, 20], "Page", "Page", 0, {
    name: "Page",
    description: "Switch between the Motif performance view and Settings for less-used controls.",
  });

  const motifHidden = { hidden: 0 } as const;
  uiDynamicMenu(
    "motif-menu",
    ["Loading..."],
    [100, 4, 210, 20],
    {
      name: "Selected Motif",
      description:
        "Choose the phrase played when a trigger note is received. The preview updates immediately.",
    },
    { fontsize: 10, ...motifHidden },
  );
  uiLiveComment("tempo-mult-label", "BPM ×", [318, 5, 35, 20], motifHidden);
  uiLiveMenu(
    "tempo-mult-menu",
    ["0.5", "1", "1.5", "2"],
    [356, 6.5, 32, 20],
    "BPM Multiplier",
    "BPM ×",
    1,
    {
      name: "BPM Multiplier",
      description:
        "Multiplies Live's Song tempo for motif scheduling only. Does not change the Live Set tempo. Default is 1.",
    },
    motifHidden,
  );
  uiButton(
    "info-button",
    "Info",
    [399, 4, 32, 20],
    {
      name: "Library & Authoring",
      description:
        "Open the floating library browser: search motifs, import a Live clip, edit notes, and save JSON.",
    },
    motifHidden,
  );
  uiButton(
    "panic-button",
    "Panic",
    [435, 4, 40, 20],
    {
      name: "Panic",
      description:
        "Immediately clears scheduled phrase events, releases tracked notes, and resets sustain and all notes on every MIDI channel.",
    },
    motifHidden,
  );

  uiPreview(
    "motif-preview",
    [2, 28, 471, 120],
    {
      name: "Motif Note Preview",
      description:
        "A time-and-pitch preview of the selected motif after applying the effective scale, pitch mode, meter mode, BPM multiplier, and most recent trigger note.",
    },
    {
      ...motifHidden,
      border: 1,
      rounded: 6,
      filename: runtime.previewFilename,
    },
  );

  // Single bottom row - the Scale toggle chooses between Live and device-local scale context.
  uiLiveComment("pitch-label", "Pitch", [0, 150, 40, 18], motifHidden);
  uiLiveMenu(
    "pitch-menu",
    ["motif", "scale", "chromatic", "hybrid"],
    [32, 151, 64, 18],
    "Pitch Mode",
    "Pitch",
    0,
    {
      name: "Pitch Mode",
      description:
        "Motif uses the phrase's stored pitch mode. Scale maps stored degrees through the effective scale; Chromatic preserves semitone intervals; Hybrid combines scale degrees with accidentals.",
    },
    motifHidden,
  );
  uiButton(
    "invert-button",
    "Invert",
    [100, 150, 48, 18],
    {
      name: "Invert Motif Offsets",
      description:
        "Mirror relative pitch offsets around the trigger note without changing the stored motif.",
    },
    {
      mode: 1,
      parameter: {
        longName: "Invert Motif Offsets",
        shortName: "Invert",
        initial: 0,
      },
      ...motifHidden,
    },
  );
  uiButton(
    "reverse-button",
    "Reverse",
    [152, 150, 52, 18],
    {
      name: "Reverse Motif Notes",
      description:
        "Play the motif backward by mirroring note timing without changing the stored motif.",
    },
    {
      mode: 1,
      parameter: {
        longName: "Reverse Motif Notes",
        shortName: "Reverse",
        initial: 0,
      },
      ...motifHidden,
    },
  );
  uiButton(
    "scale-button",
    "Scale",
    [208, 150, 40, 18],
    {
      name: "Scale Override",
      description:
        "Use the selected root and scale for Motif instead of Live's current scale. Turn off to follow Live again.",
    },
    {
      mode: 1,
      parameter: {
        longName: "Scale Override",
        shortName: "Scale",
        initial: 0,
      },
      ...motifHidden,
    },
  );
  // Visible live.menu proxies keep Parameter Mode enabled because that is how live.menu
  // receives its enum. Hidden visibility prevents Live from storing/automating the proxy;
  // separate normal parameters retain and automate the actual override selections.
  uiLiveMenu(
    "root-display",
    LIVE_ROOT_NAMES,
    [252, 151, 40, 18],
    "Scale Root Display",
    "Root",
    0,
    {
      name: "Scale Root",
      description:
        "Shows Live's root while Scale is off. When Scale is on, choose Motif's device-local root.",
    },
    { parameterVisibility: 2, ...motifHidden },
  );
  uiLiveMenu(
    "scale-name-display",
    SCALE_NAMES,
    [296, 151, 177, 18],
    "Scale Name Display",
    "Scale",
    0,
    {
      name: "Scale Name",
      description:
        "Shows Live's scale while Scale is off. When Scale is on, choose Motif's device-local scale.",
    },
    { parameterVisibility: 2, ...motifHidden },
  );
  uiLiveMenu(
    "scale-root-override",
    LIVE_ROOT_NAMES,
    [252, 151, 40, 18],
    "Scale Override Root",
    "Root",
    0,
    {
      name: "Scale Override Root",
      description: "Stored and automatable root used while the Scale button is enabled.",
    },
    { hidden: 1 },
  );
  uiLiveMenu(
    "scale-name-override",
    SCALE_NAMES,
    [296, 151, 177, 18],
    "Scale Override Name",
    "Scale",
    0,
    {
      name: "Scale Override Name",
      description: "Stored and automatable scale used while the Scale button is enabled.",
    },
    { hidden: 1 },
  );

  // Settings tab (initially hidden) - same 8px vertical rhythm
  const settingsHidden = { hidden: 1 } as const;

  uiLiveComment("version-label", `Version ${runtime.version}`, [104, 5, 82, 18], settingsHidden);
  uiLiveComment("author-label", AUTHOR, [190, 5, 128, 18], settingsHidden);
  uiButton(
    "github-button",
    "GitHub Repository",
    [322, 4, 145, 20],
    {
      name: "Motif GitHub Repository",
      description: `Open ${REPOSITORY_URL} in the default browser.`,
    },
    settingsHidden,
  );

  uiComment("trigger-label", "Trigger", [8, 30, 80, 16], { fontsize: 10, ...settingsHidden });
  uiComment("quant-label", "Launch", [8, 52, 80, 16], { fontsize: 10, ...settingsHidden });
  uiComment("pass-label", "MIDI Pass", [8, 74, 80, 16], { fontsize: 10, ...settingsHidden });
  uiComment("meter-label", "Meter", [8, 96, 80, 16], { fontsize: 10, ...settingsHidden });
  uiComment("retrigger-label", "Retrigger", [8, 118, 80, 16], { fontsize: 10, ...settingsHidden });
  uiComment("zone-label", "Zone", [8, 140, 80, 16], { fontsize: 10, ...settingsHidden });
  uiComment("repeat-label", "Repeat", [232, 140, 64, 16], {
    fontsize: 10,
    ...settingsHidden,
  });

  uiLiveMenu(
    "trigger-menu",
    ["motif", "one-shot", "hold", "hold-repeat", "toggle", "latch", "release-tail"],
    [96, 28, 232, 20],
    "Trigger Mode",
    "Trigger",
    0,
    {
      name: "Trigger Mode",
      description:
        "Motif uses the saved lifecycle (legacy motifs use One-shot); other choices override it device-wide. Hold Repeat loops while held.",
    },
    settingsHidden,
  );
  uiLiveMenu(
    "quant-menu",
    ["immediate", "1/16", "1/8", "1/4", "bar"],
    [96, 50, 232, 20],
    "Launch Quantization",
    "Launch",
    0,
    {
      name: "Launch Quantization",
      description:
        "Delay phrase start to the selected musical boundary while Live is playing. Immediate starts as soon as the trigger is received.",
    },
    settingsHidden,
  );
  uiLiveMenu(
    "pass-menu",
    ["none", "non-triggers", "all"],
    [96, 72, 232, 20],
    "MIDI Pass Through",
    "MIDI Pass",
    1,
    {
      name: "MIDI Pass Through",
      description:
        "None blocks dry notes; Non-triggers consumes trigger-zone notes but passes other MIDI; All passes every incoming note alongside the motif.",
    },
    settingsHidden,
  );
  uiLiveTab(
    "meter-tab",
    ["preserve", "fit-bar"],
    [96, 94, 232, 20],
    "Meter Mode",
    "Meter",
    0,
    {
      name: "Meter Mode",
      description:
        "Preserve keeps the motif’s original timing. Fit Bar scales its source bars to the Live Set’s current time signature.",
    },
    settingsHidden,
  );
  uiLiveTab(
    "retrigger-tab",
    ["replace", "overlap"],
    [96, 116, 232, 20],
    "Retrigger Mode",
    "Retrigger",
    0,
    {
      name: "Retrigger Mode",
      description:
        "Replace clears scheduled motif notes before starting the next phrase. Overlap allows multiple triggered phrases to play together.",
    },
    settingsHidden,
  );
  uiLiveNumber(
    "low-number",
    [96, 138, 56, 20],
    "Trigger Low",
    "Low",
    36,
    {
      name: "Trigger Zone Low",
      description:
        "Lowest MIDI note treated as a motif trigger. Notes below this value follow the MIDI Pass setting.",
    },
    settingsHidden,
  );
  uiLiveMenu(
    "repeat-menu",
    ["motif", "exact", "1/4-bar", "1/2-bar", "1-bar"],
    [296, 138, 171, 20],
    "Repeat Rounding",
    "Repeat",
    0,
    {
      name: "Repeat Rounding",
      description:
        "Motif uses the triggered motif’s saved repeat grid. Exact and bar subdivisions override it for Hold Repeat only.",
    },
    settingsHidden,
  );
  uiLiveNumber(
    "high-number",
    [160, 138, 56, 20],
    "Trigger High",
    "High",
    84,
    {
      name: "Trigger Zone High",
      description:
        "Highest MIDI note treated as a motif trigger. Notes above this value follow the MIDI Pass setting.",
    },
    settingsHidden,
  );

  const MOTIF_BOXES = [
    "motif-menu",
    "tempo-mult-label",
    "tempo-mult-menu",
    "info-button",
    "panic-button",
    "motif-preview",
    "pitch-label",
    "pitch-menu",
    "invert-button",
    "reverse-button",
    "scale-button",
    "root-display",
    "scale-name-display",
  ];
  const SETTINGS_BOXES = [
    "version-label",
    "author-label",
    "github-button",
    "trigger-label",
    "trigger-menu",
    "quant-label",
    "quant-menu",
    "pass-label",
    "pass-menu",
    "meter-label",
    "meter-tab",
    "retrigger-label",
    "retrigger-tab",
    "zone-label",
    "low-number",
    "high-number",
    "repeat-label",
    "repeat-menu",
  ];

  // ---------- Floating Library / Authoring subpatcher (Presentation Mode) ----------
  /**
   * Build the floating authoring patcher that hosts the `jweb` library UI.
   *
   * @returns {MaxPatcher} A complete nested patcher body suitable for a `p library-info` box.
   * @see https://docs.cycling74.com/reference/jweb/
   * @see https://docs.cycling74.com/reference/pcontrol/
   * @see https://docs.cycling74.com/reference/thispatcher/
   */
  function buildLibrarySubpatcher(): MaxPatcher {
    const nestedBuilder = builder.createChild();
    const { addBox: nadd, addObject: nobject, connect: nconnect } = nestedBuilder;
    const POP_W = libraryWindow.width;
    const POP_H = libraryWindow.height;

    // jweb fills the configured fixed-size Presentation view. Avoid
    // relying on undocumented jweb sizing attributes.
    // This separate window has no overlapping Max UI, so onscreen rendering is
    // both faster and avoids offscreen-rendering issues with HTML form controls.
    nadd("jweb-library", "jweb", [0, 0, POP_W, POP_H], {
      presentation: 1,
      presentation_rect: [0, 0, POP_W, POP_H],
      rendermode: 1,
      varname: "jweb-library",
    });

    // inlet object gives library-info one inlet in the parent patcher so pcontrol can connect to it.
    // Messages arriving via pcontrol (window flags, open, etc.) reach lib-thispatcher here.
    nadd("lib-inlet", "inlet", [20, 20, 40, 22]);

    const LX = 20;
    const LY = 500;
    const LROW = 36;
    nobject("lib-thispatcher", "thispatcher", LX, LY, 90);
    nobject("lib-inlet-route", "route library_page", LX, LY - LROW, 160);
    nobject("lib-readfile-prepend", "prepend readfile", LX + 190, LY - LROW, 120);
    // loadmess fires on load to configure the floating window before it is first opened.
    nobject("lib-force-pres", "loadmess presentation 1", LX + 120, LY, 160);
    nobject("lib-force-size", `loadmess ${libraryWindowSizeMessage}`, LX + 300, LY, 180);
    nobject("lib-force-title", 'loadmess title "Motif Library"', LX + 500, LY, 210);
    nconnect("lib-force-pres", 0, "lib-thispatcher", 0);
    nconnect("lib-force-size", 0, "lib-thispatcher", 0);
    nconnect("lib-force-title", 0, "lib-thispatcher", 0);
    nconnect("lib-inlet", 0, "lib-inlet-route", 0);
    nconnect("lib-inlet-route", 0, "lib-readfile-prepend", 0);
    nconnect("lib-readfile-prepend", 0, "jweb-library", 0);
    nconnect("lib-inlet-route", 1, "lib-thispatcher", 0);

    nobject("lib-data-recv", "receive ---lib-data", LX, LY + LROW, 170);
    // The parent patch already prepends `receiveData`. Adding it again makes
    // bindInlet receive the literal selector instead of the encoded payload.
    nconnect("lib-data-recv", 0, "jweb-library", 0);

    // jweb outlet ➜ route actions, readiness, diagnostics, and documented load metadata.
    //   outlet 0 (choose_library): opendialog fold ➜ s ---library_path
    //   outlet 1 (library_ready): send selector directly to v8 so state is resent after load
    //   outlet 2 (web_debug): forward browser diagnostics to v8
    //   outlet 3 (lib_action): explicitly tagged encoded JSON action
    //   outlets 4-5 (url/title): print documented page-load metadata to the Max Console
    //   outlet 6 (no match): print undocumented lifecycle messages; never execute them
    // @see https://docs.cycling74.com/reference/jweb/#readfile
    nobject(
      "lib-out-route",
      "route choose_library library_ready web_debug lib_action url title",
      LX,
      LY + LROW * 3,
      500,
    );
    nobject("lib-opendialog", "opendialog fold", LX, LY + LROW * 4, 120);
    nobject("lib-s-path", "send ---library_path", LX + 160, LY + LROW * 4, 160);
    nadd("lib-ready-message", "message", [LX + 300, LY + LROW * 4, 110, 22], {
      text: "library_ready",
    });
    nobject("lib-action-prepend", "prepend lib_action", LX + 430, LY + LROW * 3, 160);
    nobject("lib-s-author", "send ---motif_author", LX + 620, LY + LROW * 3, 170);
    nobject("lib-debug-send", "send ---motif_web_debug", LX + 430, LY + LROW * 4, 190);
    nobject("lib-url-prepend", "prepend library-url", LX, LY + LROW * 5, 150);
    nobject("lib-title-prepend", "prepend library-title", LX + 180, LY + LROW * 5, 160);
    nobject("lib-jweb-print", "print Motif-jweb", LX + 380, LY + LROW * 5, 140);
    nobject("lib-unhandled-prepend", "prepend library-unhandled", LX + 540, LY + LROW * 5, 190);
    nconnect("jweb-library", 0, "lib-out-route", 0);
    nconnect("lib-out-route", 0, "lib-opendialog", 0);
    nconnect("lib-opendialog", 0, "lib-s-path", 0);
    nconnect("lib-out-route", 1, "lib-ready-message", 0);
    nconnect("lib-ready-message", 0, "lib-s-author", 0);
    nconnect("lib-out-route", 2, "lib-debug-send", 0);
    nconnect("lib-out-route", 3, "lib-action-prepend", 0);
    nconnect("lib-out-route", 4, "lib-url-prepend", 0);
    nconnect("lib-out-route", 5, "lib-title-prepend", 0);
    nconnect("lib-url-prepend", 0, "lib-jweb-print", 0);
    nconnect("lib-title-prepend", 0, "lib-jweb-print", 0);
    nconnect("lib-out-route", 6, "lib-unhandled-prepend", 0);
    nconnect("lib-unhandled-prepend", 0, "lib-jweb-print", 0);
    nconnect("lib-action-prepend", 0, "lib-s-author", 0);

    return {
      fileversion: 1,
      appversion: { major: 9, minor: 0, revision: 0, architecture: "x64", modernui: 1 },
      classnamespace: "box",
      // Match presentation size so pcontrol cannot open a 1400×1200 patching canvas.
      rect: [100, 100, POP_W, POP_H],
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
      boxes: nestedBuilder.boxes,
      lines: nestedBuilder.lines,
      dependency_cache: [],
      autosave: 0,
    };
  }

  // Unlocked patcher layout: Presentation UI occupies 0..475×0..169.
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
  patchComment(
    "section-midi",
    "§ MIDI I/O - fail-open gate ➜ midiselect ➜ engine / midiout",
    COL.midi,
    MIDI_Y - 40,
    420,
  );
  object("midiin", "midiin", COL.midi, MIDI_Y, 70);
  object("input-gate", "gate 2 1", COL.midi, MIDI_Y + ROW, 80);
  object("input-bypass-default", "loadmess 1", COL.midi + 160, MIDI_Y + ROW, 90);
  message("input-engine-mode", "2", COL.midi + 320, MIDI_Y + ROW, 40);
  object("midiselect", "midiselect @ch all @note all", COL.midi, MIDI_Y + ROW * 2, 220);
  object("sustain-parser", "midiparse", COL.midi + 320, MIDI_Y + ROW * 2, 90);
  object("note-unpack", "unpack 0 0", COL.midi, MIDI_Y + ROW * 3, 100);
  object("note-pack", "pack 0 0 1", COL.midi, MIDI_Y + ROW * 4, 110);
  object("note-prepend", "prepend note", COL.midi, MIDI_Y + ROW * 5, 110);
  object("sustain-route", "route 64", COL.midi + 320, MIDI_Y + ROW * 3, 80);
  object("sustain-pack", "pack 0 1", COL.midi + 320, MIDI_Y + ROW * 4, 80);
  object("sustain-prepend", "prepend sustain", COL.midi + 320, MIDI_Y + ROW * 5, 130);
  object("midiflush", "midiflush", COL.midi, MIDI_Y + ROW * 7, 80);
  object("midiout", "midiout", COL.midi, MIDI_Y + ROW * 8, 70);

  // ---------- Engine column ----------
  const ENG_Y = 280;
  patchComment(
    "section-engine",
    `§ Engine - v8 ${runtime.engineFilename} + event pipe / panic / clear`,
    COL.engine,
    ENG_Y - 40,
    620,
  );
  object("v8", `v8 ${runtime.engineFilename}`, COL.engine, ENG_Y + ROW * 2, 280, {
    numinlets: 1,
    numoutlets: 1,
    outlettype: [""],
  });
  object(
    "engine-route",
    "route event panic clear status error context motifs-reset motif-item motif-selected midi-pass ui library-page persist",
    COL.engine,
    ENG_Y + ROW * 3,
    980,
  );
  object("event-unpack", "unpack 0 0 0 0.", COL.engine, ENG_Y + ROW * 4, 140);
  object("event-pipe", "pipe 0 0 0 0.", COL.engine, ENG_Y + ROW * 5, 130);
  object("note-output-pack", "pack 0 0", COL.engine, ENG_Y + ROW * 6, 80);
  object("note-midiformat", "midiformat", COL.engine, ENG_Y + ROW * 7, 90);
  object("panic-trigger", "t b b b", COL.engine + 280, ENG_Y + ROW * 4, 70);
  object("clear-trigger", "t b b", COL.engine + 280, ENG_Y + ROW * 5, 60);
  message("clear-pipe-message", "clear", COL.engine + 400, ENG_Y + ROW * 5, 60);
  object("panic-channel-uzi", "uzi 16", COL.engine + 280, ENG_Y + ROW * 6, 60);
  object("panic-channel-trigger", "t b i", COL.engine + 360, ENG_Y + ROW * 6, 50);
  message("panic-controller-message", "64 0, 120 0, 123 0", COL.engine + 430, ENG_Y + ROW * 6, 130);
  object("panic-midiformat", "midiformat", COL.engine + 590, ENG_Y + ROW * 6, 90);

  // ---------- Feedback / menu / UI emit column ----------
  const FB_Y = 280;
  patchComment(
    "section-feedback",
    "§ Feedback - motif menu + jweb UI emits (lib/preview as encoded JSON)",
    COL.feedback,
    FB_Y - 40,
    560,
  );
  message("menu-clear", "clear", COL.feedback, FB_Y + ROW * 2, 60);
  object("menu-append", "prepend append", COL.feedback, FB_Y + ROW * 3, 120);
  object("menu-select", "prepend setsymbol", COL.feedback, FB_Y + ROW * 4, 140);
  object("ui-route", "route lib preview transforms", COL.feedback, FB_Y + ROW * 6, 260);
  // Library route ➜ prepend receiveData ➜ send to the subpatcher jweb.
  object("lib-data-prepend", "prepend receiveData", COL.feedback, FB_Y + ROW * 7, 180);
  object("lib-data-send", "send ---lib-data", COL.feedback, FB_Y + ROW * 8, 150);
  // Preview route ➜ prepend receiveData ➜ native jsui renderer in the main device.
  object("preview-data-prepend", "prepend receiveData", COL.feedback + 240, FB_Y + ROW * 7, 180);
  object(
    "preview-out-route",
    "route preview_ready preview_debug",
    COL.feedback + 500,
    FB_Y + ROW * 8,
    240,
  );
  message("preview-ready-message", "preview_ready", COL.feedback + 760, FB_Y + ROW * 8, 110);
  message(
    "preview-load-message",
    `jsfile ${runtime.previewFilename}, loadbang`,
    COL.feedback + 760,
    FB_Y + ROW * 9,
    300,
  );
  object("preview-debug-page", "prepend preview", COL.feedback + 500, FB_Y + ROW * 9, 130);
  object("preview-debug-prepend", "prepend web_debug", COL.feedback + 660, FB_Y + ROW * 9, 150);
  // Engine-owned transform state silently resets the visual `live.text` latches.
  object("transform-unpack", "unpack 0 0", COL.feedback + 480, FB_Y + ROW * 7, 100);
  object("invert-set-prepend", "prepend set", COL.feedback + 600, FB_Y + ROW * 7, 100);
  object("reverse-set-prepend", "prepend set", COL.feedback + 720, FB_Y + ROW * 7, 100);

  // ---------- Song observers ----------
  const OBS_Y = 1200;
  patchComment(
    "section-song",
    "§ Song observers - live.path live_set ➜ live.observer ➜ song_context ➜ v8",
    COL.song,
    OBS_Y - 40,
    560,
  );
  object("thisdevice", "live.thisdevice", COL.song, OBS_Y, 120);
  object("init-order", "t b b b b b b", COL.song, OBS_Y + ROW, 140);
  object("property-fanout", "t b b b b b b b b b", COL.song + 200, OBS_Y + ROW, 200);
  object("live-path", "live.path live_set", COL.song, OBS_Y + ROW * 2, 140);
  object("initialize-defer", "deferlow", COL.song, OBS_Y + ROW * 3, 80);
  message("initialize-message", "initialize", COL.song, OBS_Y + ROW * 4, 90);
  object("song-context-defer", "deferlow", COL.song + 220, OBS_Y + ROW * 4, 80);
  object("ready-route", "route Ready", COL.song + 400, OBS_Y + ROW * 4, 100);
  object("ready-trigger", "t b b b", COL.song + 580, OBS_Y + ROW * 4, 80);
  object("observer-refresh", "t b b b b b b b b b", COL.song + 720, OBS_Y + ROW * 4, 210);
  message("presentation-message", "presentation 1", COL.song + 400, OBS_Y + ROW * 2, 120);
  object("thispatcher", "thispatcher", COL.song + 620, OBS_Y + ROW * 2, 90);
  object("force-presentation", "loadmess presentation 1", COL.song + 400, OBS_Y + ROW, 170);

  const observers: Array<[string, string]> = [
    ["tempo", "tempo"],
    ["root-note", "root_note"],
    ["scale-mode", "scale_mode"],
    ["scale-intervals", "scale_intervals"],
    ["scale-name", "scale_name"],
    ["numerator", "signature_numerator"],
    ["denominator", "signature_denominator"],
    ["is-playing", "is_playing"],
    ["song-time", "current_song_time"],
  ];

  observers.forEach(([name, property], index) => {
    const y = OBS_Y + ROW * 6 + index * ROW;
    const x = COL.song;
    message(`${name}-property`, `property ${property}`, x, y, 210);
    object(`${name}-observer`, "live.observer", x + 280, y, 110);
    object(`${name}-property-name`, `prepend ${property}`, x + 460, y, 220);
    object(`${name}-song-context`, "prepend song_context", x + 760, y, 170);
    connect("property-fanout", index, `${name}-property`, 0);
    connect(`${name}-property`, 0, `${name}-observer`, 0);
    connect("live-path", 0, `${name}-observer`, 1);
    connect(`${name}-observer`, 0, `${name}-property-name`, 0);
    connect(`${name}-property-name`, 0, `${name}-song-context`, 0);
    connect(`${name}-song-context`, 0, "song-context-defer", 0);
  });

  const FMT_Y = OBS_Y + ROW * 16;
  patchComment(
    "section-format",
    "§ Scale display - follow Live when off; expose stored override when on",
    COL.format,
    FMT_Y - 40,
    600,
  );
  object("root-set", "prepend set", COL.format, FMT_Y, 100);
  object("scale-name-set", "prepend setsymbol", COL.format + 160, FMT_Y, 140);
  // gate inlet contract: inlet 0 selects/opens the outlet; inlet 1 carries values.
  // Reversing these produces errors such as `gate: doesn't understand "Lydian Dominant"`.
  object("root-display-gate", "gate 1", COL.format, FMT_Y + ROW, 80);
  object("scale-name-display-gate", "gate 1", COL.format + 160, FMT_Y + ROW, 100);
  object("scale-button-trigger", "t i i i", COL.format + 360, FMT_Y, 80);
  object("scale-follow-invert", "!- 1", COL.format + 360, FMT_Y + ROW, 60);
  object("scale-override-select", "sel 0 1", COL.format + 460, FMT_Y, 70);
  object("scale-off-fan", "t b b b", COL.format + 560, FMT_Y, 70);
  object("scale-on-fan", "t b b b", COL.format + 560, FMT_Y + ROW, 70);
  message("scale-menus-active-off", "active 0", COL.format + 680, FMT_Y, 80);
  message("scale-menus-active-on", "active 1", COL.format + 680, FMT_Y + ROW, 80);
  object("override-root-set", "prepend set", COL.format + 820, FMT_Y, 100);
  object("override-scale-name-set", "prepend setsymbol", COL.format + 820, FMT_Y + ROW, 140);

  connect("root-note-observer", 0, "root-display-gate", 1);
  connect("root-display-gate", 0, "root-set", 0);
  connect("root-set", 0, "root-display", 0);
  connect("scale-name-observer", 0, "scale-name-display-gate", 1);
  connect("scale-name-display-gate", 0, "scale-name-set", 0);
  connect("scale-name-set", 0, "scale-name-display", 0);
  connect("scale-button", 0, "scale-button-trigger", 0);
  connect("scale-button-trigger", 2, "scale-follow-invert", 0);
  connect("scale-follow-invert", 0, "root-display-gate", 0);
  connect("scale-follow-invert", 0, "scale-name-display-gate", 0);
  connect("scale-button-trigger", 1, "scale-override-select", 0);
  connect("scale-override-select", 0, "scale-off-fan", 0);
  connect("scale-override-select", 1, "scale-on-fan", 0);
  connect("scale-off-fan", 2, "root-note-observer", 0);
  connect("scale-off-fan", 1, "scale-name-observer", 0);
  connect("scale-off-fan", 0, "scale-menus-active-off", 0);
  connect("scale-menus-active-off", 0, "root-display", 0);
  connect("scale-menus-active-off", 0, "scale-name-display", 0);
  connect("scale-on-fan", 2, "scale-root-override", 0);
  connect("scale-on-fan", 1, "scale-name-override", 0);
  connect("scale-on-fan", 0, "scale-menus-active-on", 0);
  connect("scale-menus-active-on", 0, "root-display", 0);
  connect("scale-menus-active-on", 0, "scale-name-display", 0);
  connect("scale-root-override", 0, "override-root-set", 0);
  connect("override-root-set", 0, "root-display", 0);
  connect("scale-name-override", 1, "override-scale-name-set", 0);
  connect("override-scale-name-set", 0, "scale-name-display", 0);
  connect("root-display", 0, "scale-root-override", 0);
  connect("scale-name-display", 0, "scale-name-override", 0);

  connect("thisdevice", 0, "init-order", 0);
  connect("init-order", 2, "property-fanout", 0);
  connect("init-order", 1, "live-path", 0);
  connect("init-order", 0, "initialize-defer", 0);
  connect("initialize-defer", 0, "initialize-message", 0);
  connect("initialize-message", 0, "v8", 0);
  connect("song-context-defer", 0, "v8", 0);
  connect("engine-route", 3, "ready-route", 0);
  connect("ready-route", 0, "ready-trigger", 0);
  connect("ready-trigger", 1, "input-engine-mode", 0);
  connect("input-engine-mode", 0, "input-gate", 0);
  connect("ready-trigger", 0, "observer-refresh", 0);
  observers.forEach(([name], index) => {
    connect("observer-refresh", index, `${name}-observer`, 0);
  });
  connect("force-presentation", 0, "thispatcher", 0);
  connect("presentation-message", 0, "thispatcher", 0);

  // ---------- Tab visibility ----------
  const TAB_Y = 3200;
  patchComment(
    "section-tabs",
    "§ Tabs - live.tab ➜ thispatcher hide/show Motif vs Settings boxes",
    COL.tabs,
    TAB_Y - 40,
    520,
  );
  object("page-sel", "sel 0 1", COL.tabs, TAB_Y, 70);
  message("show-motif-bang", "bang", COL.tabs + 140, TAB_Y, 60);
  message("show-settings-bang", "bang", COL.tabs + 140, TAB_Y + ROW, 60);
  connect("page-tab", 0, "page-sel", 0);
  connect("page-sel", 0, "show-motif-bang", 0);
  connect("page-sel", 1, "show-settings-bang", 0);
  wireTabVisibility("show-motif-bang", SETTINGS_BOXES, MOTIF_BOXES, COL.tabs + 280, TAB_Y);
  wireTabVisibility(
    "show-settings-bang",
    MOTIF_BOXES,
    SETTINGS_BOXES,
    COL.tabs + 280,
    TAB_Y + ROW * 14,
  );

  // ---------- Floating Library window ----------
  const LIB_Y = 3200;
  patchComment(
    "section-library",
    "§ Library/Authoring - pcontrol float (search, clip import, note edit)",
    COL.library,
    LIB_Y - 40,
    480,
  );
  add("library-info", "newobj", [COL.library, LIB_Y + ROW * 5, 140, 22], {
    text: "p library-info",
    patcher: buildLibrarySubpatcher(),
  });
  object("library-pcontrol", "pcontrol", COL.library, LIB_Y + ROW * 3, 80);
  // Every click closes the existing floating window before reopening it on the
  // next scheduler turn. Reloading jweb while its patcher window is already
  // active can leave its onscreen renderer blank on repeated Info presses.
  object("info-trigger", "t b b", COL.library, LIB_Y, 70);
  message("library-close", "close", COL.library + 100, LIB_Y, 60);
  object("library-reopen-defer", "deferlow", COL.library + 100, LIB_Y + ROW, 80);
  // t fires right➜left after the close: configure ➜ open ➜ defer page
  // materialization/readfile until jweb is visible ➜ size again.
  object("library-open-trigger", "t b b b b b b", COL.library + 200, LIB_Y, 120);
  message("library-flags", "window flags float nogrow close zoom", COL.library + 200, LIB_Y, 230);
  message("library-size", libraryWindowSizeMessage, COL.library + 200, LIB_Y + ROW, 150);
  message("library-size-again", libraryWindowSizeMessage, COL.library + 200, LIB_Y + ROW * 2, 150);
  message("library-exec", "window exec", COL.library + 200, LIB_Y + ROW * 3, 110);
  message("library-open", "open", COL.library + 200, LIB_Y + ROW * 4, 60);
  object("library-prepare-defer", "deferlow", COL.library + 320, LIB_Y + ROW * 4, 80);
  message("library-prepare", "library_prepare", COL.library + 420, LIB_Y + ROW * 4, 120);
  object("library-page-prepend", "prepend library_page", COL.library + 560, LIB_Y + ROW * 4, 160);
  object("library-size-defer", "deferlow", COL.library + 400, LIB_Y + ROW * 2, 80);
  connect("info-button", 0, "info-trigger", 0);
  connect("info-trigger", 1, "library-close", 0);
  connect("info-trigger", 0, "library-reopen-defer", 0);
  connect("library-reopen-defer", 0, "library-open-trigger", 0);
  connect("library-open-trigger", 5, "library-flags", 0);
  connect("library-open-trigger", 4, "library-size", 0);
  connect("library-open-trigger", 3, "library-exec", 0);
  connect("library-open-trigger", 2, "library-open", 0);
  connect("library-open-trigger", 1, "library-prepare-defer", 0);
  connect("library-open-trigger", 0, "library-size-defer", 0);
  connect("library-prepare-defer", 0, "library-prepare", 0);
  connect("library-prepare", 0, "v8", 0);
  connect("library-size-defer", 0, "library-size-again", 0);
  // pcontrol only accepts patcher-control messages such as `open` and `close`.
  // Window configuration is forwarded through the subpatch inlet to its
  // nested `thispatcher` object.
  connect("library-flags", 0, "library-info", 0);
  connect("library-size", 0, "library-info", 0);
  connect("library-size-again", 0, "library-info", 0);
  connect("library-exec", 0, "library-info", 0);
  connect("library-close", 0, "library-pcontrol", 0);
  connect("library-open", 0, "library-pcontrol", 0);
  connect("library-pcontrol", 0, "library-info", 0);

  object("r-library-path", "receive ---library_path", COL.library + 420, LIB_Y, 180);
  add("library-path-pattr", "newobj", [COL.library + 640, LIB_Y, 520, 22], {
    text: "pattr motif_library_path @autorestore 0 @thru 0 @type symbol @parameter_enable 1 @parameter_mappable 0",
    saved_attribute_attributes: createStoredBlobParameterAttributes(
      "Motif Library Path",
      "Library",
      [""],
    ),
    saved_object_attributes: {
      parameter_enable: 1,
      parameter_mappable: 0,
    },
    varname: "motif_library_path",
  });
  object("library-prepend", "prepend library_path", COL.library + 1200, LIB_Y, 160);
  message("library-path-restore-bang", "bang", COL.library + 640, LIB_Y + ROW, 60);
  add("device-state-pattr", "newobj", [COL.library + 640, LIB_Y + ROW * 2, 520, 22], {
    text: "pattr motif_device_state @autorestore 0 @thru 0 @type symbol @parameter_enable 1 @parameter_mappable 0",
    saved_attribute_attributes: createStoredBlobParameterAttributes("Motif Device State", "State", [
      INITIAL_DEVICE_STATE,
    ]),
    saved_object_attributes: {
      parameter_enable: 1,
      parameter_mappable: 0,
    },
    varname: "motif_device_state",
  });
  message("device-state-restore-bang", "bang", COL.library + 760, LIB_Y + ROW, 60);
  object(
    "device-state-restore-prepend",
    "prepend restore_state",
    COL.library + 1200,
    LIB_Y + ROW,
    180,
  );
  // LiveAPI must run on Max's low-priority thread. Every Library action shares
  // this deferred path because Import Clip can instantiate LiveAPI.
  object("r-author", "receive ---motif_author", COL.library + 420, LIB_Y + ROW, 180);
  object("author-defer", "deferlow", COL.library + 420, LIB_Y + ROW * 2, 80);
  object("r-web-debug", "receive ---motif_web_debug", COL.library + 420, LIB_Y + ROW * 2, 210);
  object("web-debug-prepend", "prepend web_debug", COL.library + 680, LIB_Y + ROW * 2, 160);
  // New choices update the hidden pattr without echoing (`@thru 0`) and load immediately.
  // Live restores the parameter value before live.thisdevice; the ordered bang
  // then replays it so the folder is scanned even when jweb has not opened.
  connect("r-library-path", 0, "library-path-pattr", 0);
  connect("r-library-path", 0, "library-prepend", 0);
  connect("library-path-pattr", 0, "library-prepend", 0);
  connect("library-prepend", 0, "v8", 0);
  connect("library-path-restore-bang", 0, "library-path-pattr", 0);
  connect("device-state-restore-bang", 0, "device-state-pattr", 0);
  connect("device-state-pattr", 0, "device-state-restore-prepend", 0);
  connect("device-state-restore-prepend", 0, "v8", 0);
  connect("r-author", 0, "author-defer", 0);
  connect("author-defer", 0, "v8", 0);
  connect("r-web-debug", 0, "web-debug-prepend", 0);
  connect("web-debug-prepend", 0, "v8", 0);

  // ---------- MIDI wiring ----------
  connect("midiin", 0, "input-gate", 1);
  connect("input-bypass-default", 0, "input-gate", 0);
  connect("input-gate", 0, "midiflush", 0);
  connect("input-gate", 1, "midiselect", 0);
  connect("input-gate", 1, "sustain-parser", 0);
  connect("midiselect", 7, "midiflush", 0);
  connect("midiselect", 0, "note-unpack", 0);
  connect("midiselect", 6, "note-pack", 2);
  connect("note-unpack", 1, "note-pack", 1);
  connect("note-unpack", 0, "note-pack", 0);
  connect("note-pack", 0, "note-prepend", 0);
  connect("note-prepend", 0, "v8", 0);
  connect("sustain-parser", 6, "sustain-pack", 1);
  connect("sustain-parser", 2, "sustain-route", 0);
  connect("sustain-route", 0, "sustain-pack", 0);
  connect("sustain-pack", 0, "sustain-prepend", 0);
  connect("sustain-prepend", 0, "v8", 0);

  connect("v8", 0, "engine-route", 0);
  connect("engine-route", 0, "event-unpack", 0);
  for (let outlet = 0; outlet < 4; outlet += 1) {
    connect("event-unpack", outlet, "event-pipe", outlet);
  }
  connect("event-pipe", 2, "note-midiformat", 6);
  connect("event-pipe", 1, "note-output-pack", 1);
  connect("event-pipe", 0, "note-output-pack", 0);
  connect("note-output-pack", 0, "note-midiformat", 0);
  connect("note-midiformat", 0, "midiflush", 0);
  connect("midiflush", 0, "midiout", 0);
  connect("engine-route", 1, "panic-trigger", 0);
  connect("panic-trigger", 2, "clear-pipe-message", 0);
  connect("panic-trigger", 1, "panic-channel-uzi", 0);
  connect("panic-trigger", 0, "midiflush", 0);
  connect("panic-channel-uzi", 2, "panic-channel-trigger", 0);
  connect("panic-channel-trigger", 1, "panic-midiformat", 6);
  connect("panic-channel-trigger", 0, "panic-controller-message", 0);
  connect("panic-controller-message", 0, "panic-midiformat", 2);
  connect("panic-midiformat", 0, "midiflush", 0);
  connect("engine-route", 2, "clear-trigger", 0);
  connect("clear-trigger", 1, "clear-pipe-message", 0);
  connect("clear-trigger", 0, "midiflush", 0);
  connect("clear-pipe-message", 0, "event-pipe", 0);
  // status / error: Ready still fans to ready-route; debug text is Max console only (no UI status-display)
  connect("engine-route", 6, "menu-clear", 0);
  connect("menu-clear", 0, "motif-menu", 0);
  connect("engine-route", 7, "menu-append", 0);
  connect("menu-append", 0, "motif-menu", 0);
  connect("engine-route", 8, "menu-select", 0);
  connect("menu-select", 0, "motif-menu", 0);
  connect("engine-route", 10, "ui-route", 0);
  connect("engine-route", 11, "library-page-prepend", 0);
  connect("library-page-prepend", 0, "library-info", 0);
  connect("engine-route", 12, "device-state-pattr", 0);
  connect("ui-route", 0, "lib-data-prepend", 0);
  connect("lib-data-prepend", 0, "lib-data-send", 0);
  connect("ui-route", 1, "preview-data-prepend", 0);
  connect("preview-data-prepend", 0, "motif-preview", 0);
  connect("ui-route", 2, "transform-unpack", 0);
  connect("transform-unpack", 0, "invert-set-prepend", 0);
  connect("invert-set-prepend", 0, "invert-button", 0);
  connect("transform-unpack", 1, "reverse-set-prepend", 0);
  connect("reverse-set-prepend", 0, "reverse-button", 0);
  connect("motif-preview", 0, "preview-out-route", 0);
  connect("preview-out-route", 0, "preview-ready-message", 0);
  connect("preview-ready-message", 0, "v8", 0);
  connect("ready-trigger", 2, "preview-load-message", 0);
  connect("preview-load-message", 0, "motif-preview", 0);
  connect("preview-out-route", 1, "preview-debug-page", 0);
  connect("preview-debug-page", 0, "preview-debug-prepend", 0);
  connect("preview-debug-prepend", 0, "v8", 0);

  // ---------- UI control ➜ engine ----------
  const CTL_Y = 4800;
  patchComment(
    "section-controls",
    "§ Controls ➜ v8 - Live parameters + post-restore synchronization",
    COL.controls,
    CTL_Y - 40,
    480,
  );
  object("motif-prepend", "prepend motif", COL.controls, CTL_Y, 110);
  object("pitch-prepend", "prepend pitch_mode", COL.controls + 200, CTL_Y, 150);
  object("scale-override-prepend", "prepend scale_override", COL.controls, CTL_Y + ROW * 2, 170);
  object(
    "scale-override-root-prepend",
    "prepend scale_override_root",
    COL.controls + 200,
    CTL_Y + ROW * 2,
    200,
  );
  object(
    "scale-override-name-prepend",
    "prepend scale_override_name",
    COL.controls + 430,
    CTL_Y + ROW * 2,
    210,
  );
  object("invert-prepend", "prepend invert", COL.controls + 400, CTL_Y, 150);
  object("reverse-prepend", "prepend reverse", COL.controls + 560, CTL_Y, 160);
  object("tempo-mult-prepend", "prepend tempo_multiplier", COL.controls + 740, CTL_Y, 180);
  object("trigger-prepend", "prepend trigger_mode", COL.controls + 1000, CTL_Y, 160);
  object("repeat-prepend", "prepend repeat_rounding", COL.controls + 1180, CTL_Y + ROW, 180);
  object("quant-prepend", "prepend launch_quantization", COL.controls + 1240, CTL_Y, 200);
  object("pass-prepend", "prepend pass_through", COL.controls + 1500, CTL_Y, 170);
  object("meter-prepend", "prepend meter_mode", COL.controls, CTL_Y + ROW, 150);
  object("retrigger-prepend", "prepend retrigger", COL.controls + 240, CTL_Y + ROW, 140);
  object("low-prepend", "prepend trigger_low", COL.controls + 480, CTL_Y + ROW, 150);
  object("high-prepend", "prepend trigger_high", COL.controls + 720, CTL_Y + ROW, 150);
  message("panic-message", "panic", COL.controls + 980, CTL_Y + ROW, 60);
  message(
    "github-launch-message",
    `; max launchbrowser ${REPOSITORY_URL}`,
    COL.controls + 980,
    CTL_Y + ROW * 2,
    430,
  );

  connect("motif-menu", 1, "motif-prepend", 0);
  connect("motif-prepend", 0, "v8", 0);
  connect("pitch-menu", 1, "pitch-prepend", 0);
  connect("pitch-prepend", 0, "v8", 0);
  connect("scale-button-trigger", 0, "scale-override-prepend", 0);
  connect("scale-override-prepend", 0, "v8", 0);
  connect("scale-root-override", 0, "scale-override-root-prepend", 0);
  connect("scale-override-root-prepend", 0, "v8", 0);
  connect("scale-name-override", 1, "scale-override-name-prepend", 0);
  connect("scale-override-name-prepend", 0, "v8", 0);
  // The documented left outlet carries the absolute 0/1 toggle state.
  connect("invert-button", 0, "invert-prepend", 0);
  connect("invert-prepend", 0, "v8", 0);
  connect("reverse-button", 0, "reverse-prepend", 0);
  connect("reverse-prepend", 0, "v8", 0);
  connect("tempo-mult-menu", 1, "tempo-mult-prepend", 0);
  connect("tempo-mult-prepend", 0, "v8", 0);
  connect("trigger-menu", 1, "trigger-prepend", 0);
  connect("trigger-prepend", 0, "v8", 0);
  connect("repeat-menu", 1, "repeat-prepend", 0);
  connect("repeat-prepend", 0, "v8", 0);
  connect("quant-menu", 1, "quant-prepend", 0);
  connect("quant-prepend", 0, "v8", 0);
  connect("pass-menu", 1, "pass-prepend", 0);
  connect("pass-prepend", 0, "v8", 0);
  connect("meter-tab", 1, "meter-prepend", 0);
  connect("meter-prepend", 0, "v8", 0);
  connect("retrigger-tab", 1, "retrigger-prepend", 0);
  connect("retrigger-prepend", 0, "v8", 0);
  connect("low-number", 0, "low-prepend", 0);
  connect("low-prepend", 0, "v8", 0);
  connect("high-number", 0, "high-prepend", 0);
  connect("high-prepend", 0, "v8", 0);
  connect("panic-button", 0, "panic-message", 0);
  connect("panic-message", 0, "v8", 0);
  connect("github-button", 0, "github-launch-message", 0);

  // Live restores Parameter Mode values before live.thisdevice. Explicitly
  // output the restored values after initialization rather than overwriting
  // them with loadmess defaults.
  const RESTORE_Y = CTL_Y + ROW * 3;
  object(
    "parameter-restore-trigger",
    "t b b b b b b b b b b b b b b b b",
    COL.controls,
    RESTORE_Y,
    320,
  );
  message("scale-outputvalue", "outputvalue", COL.controls + 280, RESTORE_Y, 90);
  message("invert-outputvalue", "outputvalue", COL.controls + 280, RESTORE_Y, 90);
  message("reverse-outputvalue", "outputvalue", COL.controls + 400, RESTORE_Y, 90);
  const restoredControls = [
    "pitch-menu",
    "tempo-mult-menu",
    "trigger-menu",
    "quant-menu",
    "pass-menu",
    "meter-tab",
    "retrigger-tab",
    // trigger runs right-to-left: restore Low before High so cross-bounds stay valid.
    "high-number",
    "low-number",
    "repeat-menu",
    "page-tab",
  ] as const;
  restoredControls.forEach((destination, outlet) => {
    connect("parameter-restore-trigger", outlet, destination, 0);
  });
  connect("parameter-restore-trigger", 11, "scale-outputvalue", 0);
  connect("scale-outputvalue", 0, "scale-button", 0);
  connect("parameter-restore-trigger", 12, "scale-name-override", 0);
  connect("parameter-restore-trigger", 13, "scale-root-override", 0);
  connect("parameter-restore-trigger", 14, "invert-outputvalue", 0);
  connect("invert-outputvalue", 0, "invert-button", 0);
  connect("parameter-restore-trigger", 15, "reverse-outputvalue", 0);
  connect("reverse-outputvalue", 0, "reverse-button", 0);
  // trigger outputs right-to-left: library path starts its scan first, then
  // engine-owned state can wait for that scan, then Live parameters synchronize.
  connect("init-order", 5, "library-path-restore-bang", 0);
  connect("init-order", 4, "device-state-restore-bang", 0);
  connect("init-order", 3, "parameter-restore-trigger", 0);

  const patch: MaxPatchDocument = {
    patcher: {
      fileversion: 1,
      appversion: { major: 9, minor: 0, revision: 0, architecture: "x64", modernui: 1 },
      classnamespace: "box",
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
      description:
        "Scale-aware triggerable motif engine with native Live Song synchronization and visual note preview",
      digest:
        "Motif/Settings tabs; native Song observers; fail-open MIDI; BPM multiplier; Library authoring popup",
      tags: "midi motif phrase scale",
      boxes,
      lines,
      dependency_cache: [
        {
          name: runtime.engineFilename,
          bootpath: ".",
          patcherrelativepath: ".",
          type: "TEXT",
          implicit: 1,
        },
        {
          name: runtime.previewFilename,
          bootpath: ".",
          patcherrelativepath: ".",
          type: "TEXT",
          implicit: 1,
        },
      ],
      autosave: 0,
    },
  };

  await writeFile("max/Motif.maxpat", `${JSON.stringify(patch, null, 2)}\n`);
}
