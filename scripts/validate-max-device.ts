/**
 * Static assertions over the generated Max device and its hashed runtime artifacts.
 *
 * Guards the contributor contracts that are easy to break in the patch generator
 * or bridge: Presentation bounds (169px), content-addressed runtime filenames, fail-open
 * MIDI graph, native Song observers (no JS LiveAPI for Song sync), and a single
 * top-level `anything()` - not per-message globals or esbuild footer handlers.
 *
 * Run via `npm run validate:max` (also part of `npm run verify`).
 *
 * @see https://github.com/Ableton/maxdevtools/tree/main/m4l-production-guidelines
 */

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import vm from "node:vm";
import { readLibraryWindowConfig } from "./library-window-config.js";

type Rect = [number, number, number, number];

type MaxBox = {
  id: string;
  maxclass: string;
  text?: string;
  filename?: string;
  template?: string;
  varname?: string;
  presentation?: number;
  presentation_rect?: Rect;
  livemode?: number;
  ignoreclick?: number;
  rendermode?: number;
  url?: string;
  parameter_enable?: number;
  saved_attribute_attributes?: {
    valueof?: {
      parameter_enum?: string[];
      parameter_initial?: Array<string | number>;
      parameter_invisible?: 0 | 1 | 2;
      parameter_type?: number;
    };
  };
  patcher?: {
    openinpresentation?: number;
    rect?: [number, number, number, number];
    boxes?: Array<{ box: MaxBox }>;
    lines?: Array<{ patchline: PatchLine }>;
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
const libraryWindow = await readLibraryWindowConfig();
const libraryWindowSizeMessage = `window size ${libraryWindow.width} ${libraryWindow.height}`;
const patch = (JSON.parse(await readFile("max/Motif.maxpat", "utf8")) as { patcher: Patcher })
  .patcher;
const boxes = patch.boxes.map(({ box }) => box);
const lines = patch.lines.map(({ patchline }) => patchline);
const dependencyNames = patch.dependency_cache.map(({ name }) => name);
const engineFilename = dependencyNames.find((name) => /^motif-device-[a-f0-9]{12}\.js$/.test(name));
const previewFilename = dependencyNames.find((name) =>
  /^motif-preview-[a-f0-9]{12}\.js$/.test(name),
);
assert.ok(
  engineFilename && previewFilename,
  "runtime dependencies must use content-addressed filenames",
);
const maxOutputFiles = await readdir("max");
const generatedRuntimeFiles = maxOutputFiles
  .filter((name) => /^motif-(?:device|preview)-[a-f0-9]{12}\.js$/.test(name))
  .sort();
assert.deepEqual(
  generatedRuntimeFiles,
  [engineFilename, previewFilename].sort(),
  "max directory contains missing or stale hashed runtime artifacts",
);
assert.ok(
  !maxOutputFiles.some((name) => ["motif-device.js", "motif-preview.js"].includes(name)),
  "max directory must not contain unreferenced stable-name runtime leftovers",
);

assert.equal(patch.openinpresentation, 1, "device must open in Presentation Mode");
assert.ok(Number.isFinite(patch.devicewidth) && patch.devicewidth > 0, "devicewidth must be fixed");

for (const box of boxes.filter((item) => item.presentation === 1)) {
  const rect = box.presentation_rect;
  assert.ok(
    Array.isArray(rect) && rect.length === 4,
    `${box.varname ?? box.id}: missing presentation_rect`,
  );
  const [x, y, width, height] = rect;
  assert.ok(x >= 0 && y >= 0, `${box.varname ?? box.id}: negative Presentation position`);
  assert.ok(x + width <= patch.devicewidth, `${box.varname ?? box.id}: exceeds device width`);
  assert.ok(
    y + height <= DEVICE_HEIGHT,
    `${box.varname ?? box.id}: exceeds Live's ${DEVICE_HEIGHT}px height`,
  );
}

const byText = (text: string): MaxBox | undefined => boxes.find((box) => box.text === text);
const byVarname = (varname: string): MaxBox | undefined =>
  boxes.find((box) => box.varname === varname);
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

const v8 = byText(`v8 ${engineFilename}`);
const midiin = byText("midiin");
const inputGate = byText("gate 2 1");
const bypassDefault = byText("loadmess 1");
const midiselect = byText("midiselect @ch all @note all");
const midiflush = byText("midiflush");
const midiout = byText("midiout");
assert.ok(v8, `missing v8 ${engineFilename}`);
assert.ok(
  midiin && inputGate && bypassDefault && midiselect && midiflush && midiout,
  "missing native MIDI routing object",
);
assert.ok(hasLine(midiin, 0, inputGate, 1), "midiin does not feed fail-open gate");
assert.ok(hasLine(bypassDefault, 0, inputGate, 0), "fail-open gate has no startup selection");
assert.ok(hasLine(inputGate, 0, midiflush, 0), "raw startup bypass is missing");
assert.ok(hasLine(inputGate, 1, midiselect, 0), "engine MIDI route is missing");
assert.ok(hasLine(midiselect, 7, midiflush, 0), "unselected raw MIDI is not passed through");
assert.ok(hasLine(midiflush, 0, midiout, 0), "MIDI output chain is incomplete");

const engineRoute = byText(
  "route event panic clear status error context motifs-reset motif-item motif-selected midi-pass ui library-page persist",
);
assert.ok(engineRoute, "missing engine output route");
const panicTrigger = byText("t b b b");
const clearTrigger = byText("t b b");
const clearMessage = byText("clear");
const panicChannelUzi = byText("uzi 16");
const panicChannelTrigger = byText("t b i");
const panicControllerMessage = byText("64 0, 120 0, 123 0");
const panicMidiFormat = boxes
  .filter((box) => box.text === "midiformat")
  .find((candidate) => hasLine(panicControllerMessage, 0, candidate, 2));
assert.ok(
  panicTrigger &&
    clearTrigger &&
    clearMessage &&
    panicChannelUzi &&
    panicChannelTrigger &&
    panicControllerMessage &&
    panicMidiFormat,
  "missing hard-panic MIDI reset graph",
);
assert.ok(hasLine(engineRoute, 1, panicTrigger, 0), "panic is not routed to hard reset");
assert.ok(hasLine(panicTrigger, 2, clearMessage, 0), "panic does not clear scheduled events");
assert.ok(hasLine(panicTrigger, 1, panicChannelUzi, 0), "panic does not reset MIDI channels");
assert.ok(hasLine(panicTrigger, 0, midiflush, 0), "panic does not flush tracked notes");
assert.ok(
  hasLine(panicChannelUzi, 2, panicChannelTrigger, 0),
  "panic does not enumerate all MIDI channels",
);
assert.ok(
  hasLine(panicChannelTrigger, 1, panicMidiFormat, 6),
  "panic channel does not reach midiformat",
);
assert.ok(
  hasLine(panicChannelTrigger, 0, panicControllerMessage, 0),
  "panic controller reset is not triggered",
);
assert.ok(
  hasLine(panicMidiFormat, 0, midiflush, 0),
  "panic controller reset does not reach MIDI output",
);
assert.ok(hasLine(engineRoute, 2, clearTrigger, 0), "clear is not routed independently");
assert.ok(hasLine(clearTrigger, 1, clearMessage, 0), "clear does not empty scheduled events");
assert.ok(hasLine(clearTrigger, 0, midiflush, 0), "clear does not flush tracked notes");
assert.ok(!byText("prepend delete_file"), "removed motif deletion path must not be generated");
assert.ok(
  !byText("node.script motif-file-service.cjs @autostart 1 @restart 1"),
  "removed deletion service must not be packaged",
);

assert.equal(patch.devicewidth, 475, "device width should be the compact 475px Presentation width");
assert.equal(patch.default_fontname, "Ableton Sans", "device should use Ableton Sans");
assert.equal(
  byVarname("root-display")?.maxclass,
  "live.menu",
  "root must be theme-default live.menu",
);
assert.equal(
  byVarname("scale-name-display")?.maxclass,
  "live.menu",
  "scale name must be theme-default live.menu",
);
assert.equal(
  byVarname("root-display")?.saved_attribute_attributes?.valueof?.parameter_invisible,
  2,
  "Song root display must not become a stored/automatable device parameter",
);
assert.equal(
  byVarname("scale-name-display")?.saved_attribute_attributes?.valueof?.parameter_invisible,
  2,
  "Song scale display must not become a stored/automatable device parameter",
);
assert.ok(!byVarname("scale-mode-display"), "scale ♭♯ chip must not appear");
assert.ok(!byVarname("tempo-display"), "Presentation UI must not show a BPM readout");
assert.ok(!byVarname("status-display"), "Presentation UI must not show debug status text");
assert.equal(byVarname("scale-label")?.maxclass, "live.comment");
assert.equal(byVarname("scale-label")?.text, "Scale", "Scale strip label is required");
assert.equal(byVarname("pitch-label")?.text, "Pitch", "Pitch label is required beside Scale");
assert.equal(byVarname("tempo-mult-label")?.text, "BPM ×", "BPM multiplier label must be BPM ×");
assert.ok(
  boxes.some((box) => box.text === "active 0"),
  "Scale menus need active 0 when scale mode is off",
);
assert.equal(byVarname("motif-preview")?.maxclass, "jsui", "preview must use native jsui in Live");
assert.equal(
  byVarname("motif-preview")?.filename,
  previewFilename,
  `preview must load ${previewFilename}`,
);
assert.equal(
  byVarname("motif-preview")?.template,
  previewFilename,
  "preview fallback template must not be Max’s stock radial dial",
);
assert.equal(byVarname("motif-preview")?.ignoreclick, 0, "preview diagnostics must be clickable");
assert.ok(!byText("readfile preview.html"), "preview must not depend on an external HTML page");
assert.ok(
  byText("route preview_ready preview_debug"),
  "native preview readiness and diagnostics must be routed",
);
assert.ok(
  byText(`jsfile ${previewFilename}, loadbang`),
  "engine readiness must explicitly load the frozen preview dependency",
);
assert.equal(byVarname("page-tab")?.maxclass, "live.tab", "Motif/Settings page tabs are required");
assert.equal(byVarname("page-tab")?.livemode, 1, "page tabs must enable Live mode");
assert.equal(
  byVarname("tempo-mult-menu")?.maxclass,
  "live.menu",
  "BPM multiplier menu is required",
);
assert.ok(byText("p library-info")?.patcher, "Library/Authoring floating subpatcher is required");
assert.ok(byText("pcontrol"), "floating window must use pcontrol");
assert.ok(
  byText(libraryWindowSizeMessage),
  `authoring float window must start at ${libraryWindow.width}×${libraryWindow.height}`,
);
assert.ok(
  byText("window flags float nogrow close zoom"),
  "authoring float window must use documented fixed sizing",
);
assert.ok(
  !byText("window flags float grow close zoom"),
  "authoring float window must not depend on resize behavior",
);
assert.ok(byText("receive ---motif_author"), "authoring controls must feed v8 via ---motif_author");
const authorReceive = byText("receive ---motif_author");
const authorDefer = authorReceive
  ? boxes.find((box) => box.text === "deferlow" && hasLine(authorReceive, 0, box, 0))
  : undefined;
assert.ok(
  authorDefer && hasLine(authorDefer, 0, v8, 0),
  "Library actions that may create LiveAPI must run through deferlow",
);
assert.ok(byText("prepend tempo_multiplier"), "BPM multiplier must be wired to the engine");
assert.ok(byText("prepend repeat_rounding"), "Repeat rounding must be wired to the engine");
assert.equal(
  byVarname("trigger-menu")?.saved_attribute_attributes?.valueof?.parameter_enum?.[0],
  "motif",
  "Trigger Mode must default to motif-owned behavior",
);
assert.deepEqual(
  byVarname("repeat-menu")?.saved_attribute_attributes?.valueof?.parameter_enum,
  ["motif", "exact", "1/4-bar", "1/2-bar", "1-bar"],
  "Repeat Rounding must expose motif delegation and every supported override",
);
assert.ok(!boxes.some((box) => box.maxclass === "v8ui"), "core preview must not depend on v8ui");
assert.ok(
  !JSON.stringify(patch).includes("live_lcd_"),
  "maxpat must not embed invalid live_lcd_* color tokens",
);
assert.ok(
  !JSON.stringify(patch).includes("jit."),
  "maxpat must not embed Jitter objects (breaks M4L load)",
);
assert.equal(
  byText("p library-info")?.patcher?.openinpresentation,
  1,
  "Library window must open in Presentation Mode",
);
const libraryBoxes = byText("p library-info")?.patcher?.boxes ?? [];
const libraryLines =
  byText("p library-info")?.patcher?.lines?.map(({ patchline }) => patchline) ?? [];
const libraryByText = (text: string): MaxBox | undefined =>
  libraryBoxes.find((entry) => entry.box.text === text)?.box;
const libraryHasLine = (
  source: MaxBox | undefined,
  sourceOutlet: number,
  destination: MaxBox | undefined,
  destinationInlet: number,
): boolean =>
  Boolean(
    source &&
    destination &&
    libraryLines.some(
      (line) =>
        line.source[0] === source.id &&
        line.source[1] === sourceOutlet &&
        line.destination[0] === destination.id &&
        line.destination[1] === destinationInlet,
    ),
  );
const libraryVarnames = new Set(libraryBoxes.map((entry) => entry.box.varname).filter(Boolean));
assert.ok(
  libraryVarnames.has("jweb-library"),
  "library subpatcher must contain a jweb-library object",
);
const jwebLibraryBox = libraryBoxes.find((entry) => entry.box.varname === "jweb-library");
assert.equal(jwebLibraryBox?.box.maxclass, "jweb", "jweb-library must be a jweb object");
assert.equal(
  jwebLibraryBox?.box.rendermode,
  1,
  "standalone library window must use onscreen rendering",
);
assert.ok(
  jwebLibraryBox && !("autosize" in jwebLibraryBox.box),
  "library jweb must not use the undocumented autosize attribute",
);
assert.equal(
  jwebLibraryBox?.box.url,
  undefined,
  "library jweb must not use URL or data-URI navigation",
);
assert.ok(
  !JSON.stringify(byText("p library-info")?.patcher).includes("data:text/html"),
  "library jweb must not use a data URI",
);
const libraryInlet = libraryBoxes.find((entry) => entry.box.maxclass === "inlet")?.box;
const libraryInletRoute = libraryByText("route library_page");
const libraryReadfilePrepend = libraryByText("prepend readfile");
const libraryThispatcher = libraryByText("thispatcher");
assert.ok(libraryInlet && libraryInletRoute && libraryReadfilePrepend && libraryThispatcher);
assert.ok(
  libraryHasLine(libraryInlet, 0, libraryInletRoute, 0),
  "library inlet must route page paths",
);
assert.ok(
  libraryHasLine(libraryInletRoute, 0, libraryReadfilePrepend, 0),
  "page paths must become readfile messages",
);
assert.ok(
  libraryHasLine(libraryReadfilePrepend, 0, jwebLibraryBox?.box, 0),
  "readfile must reach jweb",
);
assert.ok(
  libraryHasLine(libraryInletRoute, 1, libraryThispatcher, 0),
  "window messages must reach thispatcher",
);
assert.ok(
  libraryBoxes.some(
    (entry) =>
      entry.box.text === "route choose_library library_ready web_debug lib_action url title",
  ),
  "library jweb readiness must be routed back to the engine",
);
assert.ok(
  libraryHasLine(libraryByText("receive ---lib-data"), 0, jwebLibraryBox?.box, 0),
  "library state must reach jweb without duplicating the receiveData selector",
);
assert.ok(
  !libraryByText("prepend receiveData"),
  "library subpatch must not prepend receiveData twice",
);
assert.ok(
  libraryBoxes.some((entry) => entry.box.text === 'loadmess title "Motif Library"'),
  "library floating window must have a readable title",
);
assert.equal(
  byText("p library-info")?.patcher?.rect?.[2],
  libraryWindow.width,
  "library float patcher width must match its JSON configuration",
);
assert.equal(
  byText("p library-info")?.patcher?.rect?.[3],
  libraryWindow.height,
  "library float patcher height must match its JSON configuration",
);
assert.ok(
  (byVarname("motif-preview")?.presentation_rect?.[3] ?? 0) >= 60,
  "preview contour must be tall enough to read",
);

const pcontrol = byText("pcontrol");
const libraryInfo = byText("p library-info");
const closeMessage = boxes.find((box) => box.maxclass === "message" && box.text === "close");
const infoTrigger = closeMessage
  ? boxes.find((box) => box.text === "t b b" && hasLine(box, 1, closeMessage, 0))
  : undefined;
const openMessage = boxes.find((box) => box.maxclass === "message" && box.text === "open");
const libraryOpenTrigger = openMessage
  ? boxes.find((box) => box.text === "t b b b b b b" && hasLine(box, 2, openMessage, 0))
  : undefined;
const reopenDefer = libraryOpenTrigger
  ? boxes.find((box) => box.text === "deferlow" && hasLine(box, 0, libraryOpenTrigger, 0))
  : undefined;
const prepareMessage = boxes.find(
  (box) => box.maxclass === "message" && box.text === "library_prepare",
);
const prepareDefer = prepareMessage
  ? boxes.find((box) => box.text === "deferlow" && hasLine(box, 0, prepareMessage, 0))
  : undefined;
const libraryPagePrepend = byText("prepend library_page");
assert.ok(
  infoTrigger &&
    libraryOpenTrigger &&
    closeMessage &&
    reopenDefer &&
    prepareDefer &&
    prepareMessage &&
    libraryPagePrepend &&
    engineRoute,
  "Info trigger must prepare a real library page after opening",
);
assert.ok(
  hasLine(infoTrigger, 1, closeMessage, 0),
  "repeated Info presses must close the prior window",
);
assert.ok(hasLine(closeMessage, 0, pcontrol, 0), "close must be sent to pcontrol");
assert.ok(
  hasLine(infoTrigger, 0, reopenDefer, 0),
  "reopening must be deferred until the close completes",
);
assert.ok(
  hasLine(reopenDefer, 0, libraryOpenTrigger, 0),
  "deferred reopening must reach its ordered trigger",
);
assert.ok(
  hasLine(libraryOpenTrigger, 2, openMessage, 0),
  "library window must open before page preparation",
);
assert.ok(
  hasLine(libraryOpenTrigger, 1, prepareDefer, 0),
  "page preparation must be deferred until jweb is visible",
);
assert.ok(
  hasLine(prepareDefer, 0, prepareMessage, 0),
  "deferred preparation must reach the engine message",
);
assert.ok(hasLine(prepareMessage, 0, v8, 0), "library_prepare must reach v8");
assert.ok(
  hasLine(engineRoute, 11, libraryPagePrepend, 0),
  "engine page paths must be routed separately",
);
assert.ok(
  hasLine(libraryPagePrepend, 0, libraryInfo, 0),
  "resolved page path must reach the library subpatch",
);
assert.ok(hasLine(openMessage, 0, pcontrol, 0), "open must be sent to pcontrol");
for (const text of [
  "window flags float nogrow close zoom",
  libraryWindowSizeMessage,
  "window exec",
]) {
  for (const box of boxes.filter((item) => item.text === text)) {
    assert.ok(hasLine(box, 0, libraryInfo, 0), `${text} must be sent to the library subpatch`);
    assert.ok(!hasLine(box, 0, pcontrol, 0), `${text} must not be sent to pcontrol`);
  }
}

const libraryPathReceive = byText("receive ---library_path");
const libraryPathPattr = byText(
  "pattr motif_library_path @autorestore 0 @thru 0 @type symbol @parameter_enable 1 @parameter_mappable 0",
);
const libraryPathPrepend = byText("prepend library_path");
assert.ok(
  libraryPathReceive && libraryPathPattr && libraryPathPrepend,
  "library path persistence graph is incomplete",
);
assert.ok(hasLine(libraryPathReceive, 0, libraryPathPattr, 0), "chosen path does not reach pattr");
assert.ok(
  hasLine(libraryPathReceive, 0, libraryPathPrepend, 0),
  "chosen path does not load immediately",
);
assert.ok(
  hasLine(libraryPathPattr, 0, libraryPathPrepend, 0),
  "restored path does not reload the library",
);
assert.equal(
  libraryPathPattr.saved_attribute_attributes?.valueof?.parameter_type,
  3,
  "library path must use Live's Blob parameter type",
);
assert.equal(
  libraryPathPattr.saved_attribute_attributes?.valueof?.parameter_invisible,
  1,
  "library path must be Stored Only",
);
const pathRestoreBang = boxes.find(
  (box) =>
    box.maxclass === "message" && box.text === "bang" && hasLine(box, 0, libraryPathPattr, 0),
);
const deviceStatePattr = byText(
  "pattr motif_device_state @autorestore 0 @thru 0 @type symbol @parameter_enable 1 @parameter_mappable 0",
);
const stateRestoreBang = deviceStatePattr
  ? boxes.find(
      (box) =>
        box.maxclass === "message" && box.text === "bang" && hasLine(box, 0, deviceStatePattr, 0),
    )
  : undefined;
const stateRestorePrepend = byText("prepend restore_state");
assert.ok(
  deviceStatePattr && stateRestoreBang && stateRestorePrepend,
  "engine-owned device-state persistence graph is incomplete",
);
assert.equal(
  deviceStatePattr.saved_attribute_attributes?.valueof?.parameter_type,
  3,
  "engine-owned state must use Live's Blob parameter type",
);
assert.equal(
  deviceStatePattr.saved_attribute_attributes?.valueof?.parameter_invisible,
  1,
  "engine-owned state must be Stored Only",
);
assert.ok(hasLine(deviceStatePattr, 0, stateRestorePrepend, 0));
assert.ok(hasLine(stateRestorePrepend, 0, v8, 0));
assert.ok(hasLine(engineRoute, 12, deviceStatePattr, 0));

const initOrder = byText("t b b b b b b");
const parameterRestore = byText("t b b b b b b b b b b b b b");
assert.ok(
  initOrder &&
    pathRestoreBang &&
    stateRestoreBang &&
    parameterRestore &&
    hasLine(byText("live.thisdevice"), 0, initOrder, 0) &&
    hasLine(initOrder, 5, pathRestoreBang, 0) &&
    hasLine(initOrder, 4, stateRestoreBang, 0) &&
    hasLine(initOrder, 3, parameterRestore, 0),
  "live.thisdevice must replay path, state, and restored Live parameters in order",
);

const invertButton = byVarname("invert-button");
const reverseButton = byVarname("reverse-button");
const invertPrepend = byText("prepend invert");
const reversePrepend = byText("prepend reverse");
assert.equal(invertButton?.parameter_enable, 1, "Invert must be a stored Live parameter");
assert.equal(reverseButton?.parameter_enable, 1, "Reverse must be a stored Live parameter");
assert.ok(hasLine(invertButton, 0, invertPrepend, 0) && hasLine(invertPrepend, 0, v8, 0));
assert.ok(hasLine(reverseButton, 0, reversePrepend, 0) && hasLine(reversePrepend, 0, v8, 0));
assert.equal(
  boxes.filter((box) => box.text === "loadmess set 0").length,
  0,
  "loadmess defaults must not overwrite Live-restored transform parameters",
);

const contextSources = boxes.filter((box) => box.text === "prepend song_context");
assert.equal(contextSources.length, 9, "expected nine Song context properties");
const contextDestinationIds = new Set(
  contextSources.flatMap((source) =>
    lines.filter((line) => line.source[0] === source.id).map((line) => line.destination[0]),
  ),
);
assert.equal(contextDestinationIds.size, 1, "Song context messages must share one deferred path");
const contextDefer = boxes.find((box) => contextDestinationIds.has(box.id));
assert.equal(contextDefer?.text, "deferlow", "Song context path must be deferred");
assert.ok(
  contextDefer &&
    lines.some((line) => line.source[0] === contextDefer.id && line.destination[0] === v8.id),
  "deferred Song context does not feed v8",
);

assert.deepEqual(
  patch.dependency_cache.map(({ name }) => name),
  [engineFilename, previewFilename],
);
assert.ok(
  !JSON.stringify(patch).match(/motif-(?:device|preview)-v\d/i),
  "versioned runtime dependency found",
);
assert.ok(
  !JSON.stringify(patch).includes("file://"),
  "generated patch must not contain platform-specific file URLs",
);
assert.ok(
  !JSON.stringify(patch).includes("Patcher:/"),
  "generated patch must not contain the invalid Patcher:/ pseudo-path",
);
assert.ok(
  !JSON.stringify(patch).includes("prepend call receiveData"),
  "jweb state must use bound inlet selectors rather than JavaScript call injection",
);

const previewSource = await readFile("src/max/motif-preview.js", "utf8");
const hashedPreviewSource = await readFile(`max/${previewFilename}`, "utf8");
assert.ok(
  hashedPreviewSource.length < previewSource.length,
  "hashed preview artifact must be minified",
);
assert.equal(
  previewFilename,
  `motif-preview-${createHash("sha256").update(hashedPreviewSource).digest("hex").slice(0, 12)}.js`,
  "preview filename does not match its content hash",
);
assert.doesNotThrow(
  () => new vm.Script(previewSource, { filename: "motif-preview.js" }),
  "native preview JavaScript must parse",
);
assert.doesNotThrow(
  () => new vm.Script(hashedPreviewSource, { filename: previewFilename }),
  "minified native preview JavaScript must parse",
);
assert.doesNotMatch(
  hashedPreviewSource,
  /`|=>|\b(?:const|let)\b|catch\s*\{/,
  "minified native preview must remain compatible with the legacy jsui JavaScript host",
);
assert.ok(
  Math.max(...hashedPreviewSource.split("\n").map((line) => line.length)) <= 1_100,
  "minified native preview lines must stay below jsui error-reporting limits",
);
assert.match(previewSource, /mgraphics\.init\(\)/, "native preview must initialize mgraphics");
assert.match(previewSource, /function receiveData\(\)/, "native preview must accept preview state");
assert.match(
  previewSource,
  /outlet\(0, "preview_ready"\)/,
  "native preview must request fresh state on load",
);
assert.doesNotMatch(
  previewSource,
  /mgraphics\.clip\(/,
  "legacy jsui does not expose mgraphics.clip()",
);
assert.doesNotMatch(
  previewSource,
  /window\.max|readfile|preview\.html/,
  "native preview must not depend on jweb",
);

const libraryTemplate = await readFile("src/max/library/ui/index.html", "utf8");
const libraryController = await readFile("src/max/library/ui/main.ts", "utf8");
const libraryBridge = await readFile("src/max/library/ui/bridge.ts", "utf8");
const libraryApp = await readFile("src/max/library/ui/app.tsx", "utf8");
const libraryPageState = await readFile("src/max/library/ui/page-state.ts", "utf8");
const librarySidebar = await readFile("src/max/library/ui/components/LibrarySidebar.tsx", "utf8");
const libraryPropertyForm = await readFile(
  "src/max/library/ui/components/PropertyForm.tsx",
  "utf8",
);
const libraryPageStore = await readFile("src/max/library/ui/page-store.ts", "utf8");
const libraryProtocol = await readFile("src/max/library/protocol.ts", "utf8");
const libraryClient = [
  libraryController,
  libraryBridge,
  libraryApp,
  libraryPageState,
  librarySidebar,
  libraryPropertyForm,
  libraryPageStore,
  libraryProtocol,
].join("\n");
const librarySource = await readFile("max/library.html", "utf8");
const libraryScript = librarySource.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(libraryScript, "generated library.html must include its compiled state manager");
assert.doesNotThrow(
  () => new vm.Script(libraryScript, { filename: "library.html" }),
  "library state manager must parse",
);
assert.match(
  libraryTemplate,
  /styles\.css/,
  "Library template must reference its extracted stylesheet",
);
assert.match(libraryTemplate, /main\.ts/, "Library template must reference its TypeScript entry");
assert.doesNotMatch(
  librarySource,
  /(?:styles\.css|main\.ts)|data-motif-build/,
  "generated Library must inline its assets",
);
assert.match(
  libraryClient,
  /function createStore<T>/,
  "Library must have one explicit typed local state store",
);
assert.match(libraryClient, /type:\s*["']cancel_edit["']/, "Library must expose cancel editing");
assert.doesNotMatch(
  libraryClient,
  /delete_motif|Delete motif|skipDeleteConfirmation/,
  "Library deletion UI must remain removed",
);
for (const id of [
  "pitch-mode-edit",
  "meter-numerator-edit",
  "default-gate-edit",
  "curve-exponent",
]) {
  assert.match(libraryClient, new RegExp(`id="${id}"`), `Library must expose ${id}`);
}
assert.match(
  libraryClient,
  /type:\s*["']edit_motif["']/,
  "Library must submit complete motif properties",
);
assert.match(libraryClient, /velocityOffset/, "Library must expose advanced note velocity fields");
assert.match(libraryClient, /legato/, "Library must expose note articulation fields");

const source = await readFile(`max/${engineFilename}`, "utf8");
const engineCanonicalSources = await Promise.all(
  [
    "src/max/device.ts",
    "src/max/library/device/authoring-controller.ts",
    "src/max/playback-controller.ts",
    "src/max/library/device/projection.ts",
    "src/max/library/device/action.ts",
    "src/max/library/device/serialization.ts",
    "src/max/library/device/repository.ts",
    "src/max/library/ui/index.html",
    "src/max/library/ui/styles.css",
    "src/max/library/ui/main.ts",
    "src/max/library/ui/app.tsx",
    "src/max/library/ui/bridge.ts",
    "src/max/library/ui/page-state.ts",
    "src/max/library/ui/preview.ts",
    "src/max/library/ui/store.tsx",
    "src/max/library/ui/browser-model.ts",
    "src/max/library/ui/format.ts",
    "src/max/library/ui/page-store.ts",
    "src/max/library/ui/sidebar-layout.ts",
    "src/max/library/ui/components/BrowserList.tsx",
    "src/max/library/ui/components/DebugBar.tsx",
    "src/max/library/ui/components/HotkeyList.tsx",
    "src/max/library/ui/components/LibrarySidebar.tsx",
    "src/max/library/ui/components/Modal.tsx",
    "src/max/library/ui/components/MotifTags.tsx",
    "src/max/library/ui/components/NoteTable.tsx",
    "src/max/library/ui/components/PropertyForm.tsx",
    "src/max/library/ui/components/TagFilter.tsx",
    "node_modules/preact/dist/preact.module.js",
    "node_modules/preact/hooks/dist/hooks.module.js",
    "node_modules/preact/jsx-runtime/dist/jsxRuntime.module.js",
  ].map((filename) => readFile(filename, "utf8")),
);
assert.ok(
  source.length < engineCanonicalSources.reduce((length, text) => length + text.length, 0),
  "hashed engine artifact must be minified",
);
assert.equal(
  engineFilename,
  `motif-device-${createHash("sha256").update(source).digest("hex").slice(0, 12)}.js`,
  "engine filename does not match its content hash",
);
assert.match(
  source,
  /uttori-motif-library-[a-f0-9]{12}\.html/,
  "engine must use a content-addressed temporary page",
);
assert.ok(
  /<!doctype html>/i.test(source),
  "compiled engine must contain the build-injected library page",
);
assert.match(
  source.slice(0, 600),
  /var inlets\s*=\s*1;[\s\S]*var outlets\s*=\s*1;[\s\S]*function anything\(\)/,
  "hand-written Max bridge must be the first code in the compiled file",
);
assert.match(source, /var message\s*=\s*messagename/, "bridge must use Max messagename");
assert.match(source, /arrayfromargs\(arguments\)/, "bridge must normalize Max arguments");
assert.match(
  source,
  /MotifEngine\.dispatch\(message,\s*args\)/,
  "bridge must use the single engine dispatcher",
);
assert.doesNotMatch(
  source.slice(0, source.indexOf('"use strict";')),
  /function song_context\(/,
  "named Max handlers must not be generated in the Max bridge",
);
assert.doesNotMatch(source, /__motifHandlers/, "legacy global handler table found");
assert.doesNotMatch(source, /function host(?:_|\()/, "legacy host handler found");

console.log(
  `Validated Motif.maxpat: ${patch.devicewidth}×${DEVICE_HEIGHT}, fail-open MIDI, native host displays, jsui preview.`,
);
