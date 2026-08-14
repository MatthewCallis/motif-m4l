import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import vm from "node:vm";
import { loadCompiledEngine } from "./helpers/max-engine.js";
import { readLibraryWindowConfig } from "../scripts/library-window-config.js";

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
  mode?: number;
  outputmode?: number;
  parameter_enable?: number;
  ignoreclick?: number;
  border?: number;
  jsarguments?: number[];
  rendermode?: number;
  fontname?: string;
  url?: string;
  saved_attribute_attributes?: {
    valueof?: {
      parameter_enum?: string[];
      parameter_initial?: Array<string | number>;
      parameter_initial_enable?: number;
      parameter_invisible?: 0 | 1 | 2;
      parameter_longname?: string;
      parameter_type?: number;
    };
  };
  patcher?: {
    rect?: [number, number, number, number];
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
  return (
    JSON.parse(await readFile("max/Motif.maxpat", "utf8")) as {
      patcher: ReturnType<typeof JSON.parse>;
    }
  ).patcher;
}

function boxByText(boxes: Array<{ box: Box }>, text: string): Box | undefined {
  return boxes.find(({ box }) => box.text === text)?.box;
}

function boxByVarname(boxes: Array<{ box: Box }>, varname: string): Box | undefined {
  return boxes.find(({ box }) => box.varname === varname)?.box;
}

function hasLine(
  lines: Array<{ patchline: PatchLine }>,
  source: Box,
  sourceOutlet: number,
  destination: Box,
  destinationInlet: number,
): boolean {
  return lines.some(
    ({ patchline }) =>
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
    if (box.patcher?.boxes) {
      out.push(...allBoxes(box.patcher.boxes));
    }
  }
  return out;
}

describe("Motif Max patch integration", () => {
  it("generates a compact Max 9 device with Motif/Settings tabs and native preview", async () => {
    const libraryWindow = await readLibraryWindowConfig();
    const libraryWindowSizeMessage = `window size ${libraryWindow.width} ${libraryWindow.height}`;
    const patcher = await readPatch();
    const { boxes, lines } = patcher;
    const dependencyNames = patcher.dependency_cache.map(({ name }) => name);
    const engineFilename = dependencyNames.find((name) =>
      /^motif-device-[a-f0-9]{12}\.js$/.test(name),
    );
    const previewFilename = dependencyNames.find((name) =>
      /^motif-preview-[a-f0-9]{12}\.js$/.test(name),
    );
    assert.ok(
      engineFilename && previewFilename,
      "runtime dependencies must use content-addressed filenames",
    );
    const engineSource = await readFile(`max/${engineFilename}`, "utf8");
    const previewSource = await readFile(`max/${previewFilename}`, "utf8");
    const previewCanonicalSource = await readFile("src/max/motif-preview.js", "utf8");
    const deviceCanonicalSources = await Promise.all(
      [
        "device.ts",
        "library/device/authoring-controller.ts",
        "device-settings.ts",
        "library/device/action.ts",
        "library/device/projection.ts",
        "playback-controller.ts",
      ].map((filename) => readFile(`src/max/${filename}`, "utf8")),
    );
    const libraryCanonicalSources = await Promise.all(
      [
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
    const libraryOutput = await readFile("max/library.html", "utf8");
    assert.ok(
      previewSource.length < previewCanonicalSource.length,
      "production preview must be minified",
    );
    assert.ok(
      libraryOutput.length <
        libraryCanonicalSources.reduce((length, source) => length + source.length, 0),
      "production Library HTML, CSS, and JavaScript must be minified",
    );
    assert.ok(
      engineSource.length <
        deviceCanonicalSources.reduce((length, source) => length + source.length, 0) +
          libraryCanonicalSources.reduce((length, source) => length + source.length, 0),
      "production engine must be minified",
    );
    assert.doesNotThrow(() => new vm.Script(previewSource, { filename: previewFilename }));
    assert.doesNotMatch(
      previewSource,
      /`|=>|\b(?:const|let)\b|catch\s*\{/,
      "production preview must remain compatible with the legacy jsui JavaScript host",
    );
    assert.ok(
      Math.max(...previewSource.split("\n").map((line) => line.length)) <= 1_100,
      "production preview lines must stay below jsui error-reporting limits",
    );
    assert.equal(
      engineFilename,
      `motif-device-${createHash("sha256").update(engineSource).digest("hex").slice(0, 12)}.js`,
    );
    assert.equal(
      previewFilename,
      `motif-preview-${createHash("sha256").update(previewSource).digest("hex").slice(0, 12)}.js`,
    );
    const v8Text = `v8 ${engineFilename}`;

    assert.equal(patcher.openinpresentation, 1);
    assert.equal(patcher.devicewidth, 475);
    assert.equal(patcher.default_fontname, "Ableton Sans");
    assert.ok(boxes.filter(({ box }) => box.presentation === 1).length >= 24);
    for (const { box } of boxes.filter(({ box }) => box.presentation === 1)) {
      const rect = box.presentation_rect;
      assert.ok(rect, `${box.varname ?? box.id} is missing a presentation rectangle`);
      const [x, y, width, height] = rect;
      assert.ok(x >= 0 && y >= 0, `${box.varname ?? box.id} starts outside the device`);
      assert.ok(
        x + width <= patcher.devicewidth,
        `${box.varname ?? box.id} exceeds the device width`,
      );
      assert.ok(y + height <= 169, `${box.varname ?? box.id} exceeds Live's fixed 169px height`);
    }

    const texts = boxes.map(({ box }) => box.text).filter((text): text is string => Boolean(text));
    assert.ok(texts.includes(v8Text));
    assert.ok(texts.includes("live.path live_set"));
    assert.ok(texts.includes("live.observer"));
    assert.ok(texts.includes("pcontrol"));
    assert.ok(texts.includes("p library-info"));
    assert.ok(texts.includes("prepend tempo_multiplier"));
    for (const property of [
      "tempo",
      "root_note",
      "scale_mode",
      "scale_name",
      "scale_intervals",
      "signature_numerator",
      "signature_denominator",
      "is_playing",
      "current_song_time",
    ]) {
      assert.ok(texts.includes(`property ${property}`));
      assert.ok(texts.includes(`prepend ${property}`));
    }

    assert.ok(texts.includes("prepend song_context"));
    assert.ok(texts.includes("deferlow"));
    assert.ok(!texts.some((text) => text === "prepend host" || text.startsWith("prepend host_")));
    assert.ok(texts.includes("route Ready"));
    assert.ok(texts.includes("t b b b b b b b b b"));
    assert.ok(
      texts.includes(
        "route event panic clear status error context motifs-reset motif-item motif-selected midi-pass ui library-page persist",
      ),
    );
    assert.ok(
      texts.includes("route lib preview transforms"),
      "ui-route must handle library, preview, and transform state",
    );
    assert.ok(texts.includes(libraryWindowSizeMessage));
    assert.ok(texts.includes("window flags float nogrow close zoom"));
    assert.ok(!texts.includes("window flags float grow close zoom"));
    assert.ok(
      texts.filter((text) => text === libraryWindowSizeMessage).length >= 2,
      "size must be applied before and after open",
    );
    assert.ok(texts.includes("receive ---motif_author"));
    assert.ok(texts.includes("pipe 0 0 0 0."));

    const v8 = boxByText(boxes, v8Text);
    assert.equal(v8?.numoutlets, 1);
    assert.ok(v8);
    assert.ok(
      lines.every(({ patchline }) => patchline.source[0] !== v8.id || patchline.source[1] === 0),
    );

    const engineRoute = boxByText(
      boxes,
      "route event panic clear status error context motifs-reset motif-item motif-selected midi-pass ui library-page persist",
    );
    assert.ok(engineRoute);
    assert.ok(!boxByText(boxes, "prepend delete_file"));
    assert.ok(!boxByText(boxes, "node.script motif-file-service.cjs @autostart 1 @restart 1"));

    const songContextIds = boxes
      .filter(({ box }) => box.text === "prepend song_context")
      .map(({ box }) => box);
    assert.equal(songContextIds.length, 9);
    const songContextDestinationIds = new Set(
      songContextIds.flatMap((source) =>
        lines
          .filter(({ patchline }) => patchline.source[0] === source.id)
          .map(({ patchline }) => patchline.destination[0]),
      ),
    );
    assert.equal(
      songContextDestinationIds.size,
      1,
      "all Song context messages must share one deferred path",
    );
    const songContextDefer = boxes.find(({ box }) => songContextDestinationIds.has(box.id))?.box;
    assert.equal(songContextDefer?.text, "deferlow");
    assert.ok(songContextDefer && hasLine(lines, songContextDefer, 0, v8, 0));

    const rootDisplay = boxByVarname(boxes, "root-display");
    assert.equal(
      rootDisplay?.maxclass,
      "live.menu",
      "root must use theme-default live.menu like Live’s Scale device",
    );
    assert.equal(
      rootDisplay?.parameter_enable,
      1,
      "live.menu needs an enabled parameter to own its enum",
    );
    assert.equal(
      rootDisplay?.saved_attribute_attributes?.valueof?.parameter_invisible,
      2,
      "Song-owned root display must be hidden from Live parameter storage and automation",
    );
    assert.equal(rootDisplay?.ignoreclick, 1, "root display must not be user-editable");
    const scaleNameDisplay = boxByVarname(boxes, "scale-name-display");
    assert.equal(scaleNameDisplay?.maxclass, "live.menu");
    assert.equal(scaleNameDisplay?.ignoreclick, 1);
    assert.equal(scaleNameDisplay?.saved_attribute_attributes?.valueof?.parameter_invisible, 2);
    assert.ok(!boxByVarname(boxes, "scale-mode-display"), "scale ♭♯ chip must be removed");
    assert.ok(
      !boxByVarname(boxes, "tempo-display"),
      "computed BPM readout must be removed from the Presentation UI",
    );
    assert.ok(
      !boxByVarname(boxes, "status-display"),
      "debug status-display must not appear in the Presentation UI",
    );
    assert.ok(
      !boxByVarname(boxes, "preview-root-display"),
      "anchor/debug metadata line must be removed from Presentation",
    );
    assert.equal(boxByVarname(boxes, "scale-label")?.maxclass, "live.comment");
    assert.equal(boxByVarname(boxes, "scale-label")?.text, "Scale");
    assert.equal(boxByVarname(boxes, "pitch-label")?.maxclass, "live.comment");
    assert.equal(boxByVarname(boxes, "pitch-label")?.text, "Pitch");
    assert.equal(boxByVarname(boxes, "tempo-mult-label")?.text, "BPM ×");
    assert.ok(
      texts.includes("active 0") && texts.includes("active 1"),
      "Scale menus must toggle active from Song.scale_mode",
    );
    assert.ok(
      texts.some((text) => text.startsWith("§ ")),
      "unlocked patcher should label major sections",
    );

    const preview = boxByVarname(boxes, "motif-preview");
    const previewReadyRoute = boxByText(boxes, "route preview_ready preview_debug");
    const previewReadyMessage = boxes.find(
      ({ box }) => box.maxclass === "message" && box.text === "preview_ready",
    )?.box;
    const previewLoadMessage = boxByText(boxes, `jsfile ${previewFilename}, loadbang`);
    const previewDebugPage = boxByText(boxes, "prepend preview");
    const previewDebugPrepend = boxByText(boxes, "prepend web_debug");
    const engineReadyRoute = boxByText(boxes, "route Ready");
    const readyTriggerId = engineReadyRoute
      ? lines.find(
          ({ patchline }) =>
            patchline.source[0] === engineReadyRoute.id && patchline.source[1] === 0,
        )?.patchline.destination[0]
      : undefined;
    const readyTrigger = boxes.find(({ box }) => box.id === readyTriggerId)?.box;
    assert.ok(
      preview &&
        previewReadyRoute &&
        previewReadyMessage &&
        previewLoadMessage &&
        previewDebugPage &&
        previewDebugPrepend &&
        readyTrigger,
    );
    assert.equal(preview.maxclass, "jsui", "preview must use native jsui rather than jweb in Live");
    assert.equal(preview.filename, previewFilename);
    assert.equal(
      preview.template,
      previewFilename,
      "preview must never fall back to Max’s stock radial dial",
    );
    assert.equal(preview.border, 0, "preview draws its own rounded border in motif-preview.js");
    assert.deepEqual(
      preview.jsarguments,
      [6, 1],
      "preview chrome radius and border are forwarded to jsui",
    );
    assert.equal(
      preview.ignoreclick,
      0,
      "preview diagnostics must remain clickable in locked Presentation Mode",
    );
    assert.ok(
      !boxByText(boxes, "readfile preview.html"),
      "native preview must not load an external HTML page",
    );
    assert.ok(
      hasLine(lines, preview, 0, previewReadyRoute, 0),
      "preview output must route readiness and diagnostics",
    );
    assert.ok(hasLine(lines, previewReadyRoute, 0, previewReadyMessage, 0));
    assert.ok(
      hasLine(lines, previewReadyMessage, 0, v8, 0),
      "preview readiness must request fresh engine state",
    );
    assert.ok(
      hasLine(lines, readyTrigger, 2, previewLoadMessage, 0),
      "engine readiness must reload the frozen jsui dependency",
    );
    assert.ok(
      hasLine(lines, previewLoadMessage, 0, preview, 0),
      "the explicit jsfile message must target the preview",
    );
    assert.ok(hasLine(lines, previewReadyRoute, 1, previewDebugPage, 0));
    assert.ok(hasLine(lines, previewDebugPage, 0, previewDebugPrepend, 0));
    assert.ok(
      hasLine(lines, previewDebugPrepend, 0, v8, 0),
      "native preview diagnostics must reach the engine",
    );
    assert.equal(preview.annotation_name, "Motif Note Preview");
    assert.ok(preview.annotation);
    assert.ok(preview.hint);
    assert.ok(
      (preview.presentation_rect?.[3] ?? 0) >= 80,
      "preview contour should use the height freed by collapsing the control row",
    );
    assert.ok(!boxes.some(({ box }) => box.maxclass === "v8ui"), "preview must not depend on v8ui");
    assert.ok(
      !JSON.stringify(patcher).includes("live_lcd_"),
      "maxpat must not embed invalid live_lcd_* color tokens",
    );

    const pageTab = boxByVarname(boxes, "page-tab");
    assert.equal(pageTab?.maxclass, "live.tab");
    assert.equal(pageTab?.livemode, 1, "page tabs must use Live mode");

    const tempoMult = boxByVarname(boxes, "tempo-mult-menu");
    assert.equal(tempoMult?.maxclass, "live.menu");
    const motifMenu = boxByVarname(boxes, "motif-menu");
    assert.ok(
      (motifMenu?.presentation_rect?.[1] ?? 99) <= 8,
      "selected motif must sit on the top control row",
    );
    const pitchMenu = boxByVarname(boxes, "pitch-menu");
    assert.ok(
      (pitchMenu?.presentation_rect?.[0] ?? 999) <
        (boxByVarname(boxes, "root-display")?.presentation_rect?.[0] ?? 0),
      "pitch menu must sit to the left of the Scale menus",
    );
    const pitchEnum = pitchMenu?.saved_attribute_attributes?.valueof?.parameter_enum;
    assert.ok(pitchEnum?.includes("motif"), "Pitch Mode first item is motif");
    assert.ok(!pitchEnum?.includes("auto"), "Pitch Mode auto was renamed to motif");
    const invertButton = boxByVarname(boxes, "invert-button");
    const reverseButton = boxByVarname(boxes, "reverse-button");
    assert.equal(invertButton?.maxclass, "live.text");
    assert.equal(invertButton?.text, "Invert");
    assert.equal(invertButton?.mode, 1, "Invert must visually latch on/off");
    assert.equal(
      invertButton?.outputmode,
      0,
      "Invert must emit the new toggle state on mouse-down",
    );
    assert.equal(invertButton?.parameter_enable, 1, "Invert must be stored as a Live parameter");
    assert.deepEqual(invertButton?.saved_attribute_attributes?.valueof?.parameter_initial, [0]);
    assert.equal(reverseButton?.maxclass, "live.text");
    assert.equal(reverseButton?.text, "Reverse");
    assert.equal(reverseButton?.mode, 1, "Reverse must visually latch on/off");
    assert.equal(
      reverseButton?.outputmode,
      0,
      "Reverse must emit the new toggle state on mouse-down",
    );
    assert.equal(reverseButton?.parameter_enable, 1, "Reverse must be stored as a Live parameter");
    assert.deepEqual(reverseButton?.saved_attribute_attributes?.valueof?.parameter_initial, [0]);
    const invertPrepend = boxByText(boxes, "prepend invert");
    const reversePrepend = boxByText(boxes, "prepend reverse");
    assert.ok(invertButton && invertPrepend && hasLine(lines, invertButton, 0, invertPrepend, 0));
    assert.ok(invertPrepend && hasLine(lines, invertPrepend, 0, v8, 0));
    assert.ok(
      reverseButton && reversePrepend && hasLine(lines, reverseButton, 0, reversePrepend, 0),
    );
    assert.ok(reversePrepend && hasLine(lines, reversePrepend, 0, v8, 0));
    assert.equal(
      boxes.filter(({ box }) => box.text === "loadmess set 0").length,
      0,
      "startup messages must not overwrite Live-restored transform values",
    );
    const parameterRestore = boxByText(boxes, "t b b b b b b b b b b b b b");
    const invertOutputValue = boxByText(boxes, "outputvalue");
    const outputValueMessages = boxes
      .filter(({ box }) => box.text === "outputvalue")
      .map(({ box }) => box);
    assert.equal(outputValueMessages.length, 2);
    assert.ok(parameterRestore && invertOutputValue);
    assert.ok(
      outputValueMessages.some(
        (box) =>
          hasLine(lines, parameterRestore, 11, box, 0) && hasLine(lines, box, 0, invertButton, 0),
      ),
    );
    assert.ok(
      outputValueMessages.some(
        (box) =>
          hasLine(lines, parameterRestore, 12, box, 0) && hasLine(lines, box, 0, reverseButton, 0),
      ),
    );
    const lowNumber = boxByVarname(boxes, "low-number");
    const highNumber = boxByVarname(boxes, "high-number");
    assert.ok(lowNumber && highNumber);
    assert.ok(hasLine(lines, parameterRestore, 8, lowNumber, 0));
    assert.ok(hasLine(lines, parameterRestore, 7, highNumber, 0));
    const transformRoute = boxByText(boxes, "route lib preview transforms");
    const transformUnpackId = transformRoute
      ? lines.find(
          ({ patchline }) => patchline.source[0] === transformRoute.id && patchline.source[1] === 2,
        )?.patchline.destination[0]
      : undefined;
    const transformUnpack = boxes.find(({ box }) => box.id === transformUnpackId)?.box;
    const setPrepends = boxes.filter(({ box }) => box.text === "prepend set").map(({ box }) => box);
    assert.ok(transformRoute && transformUnpack);
    assert.ok(hasLine(lines, transformRoute, 2, transformUnpack, 0));
    assert.ok(
      setPrepends.some(
        (box) =>
          hasLine(lines, transformUnpack, 0, box, 0) && hasLine(lines, box, 0, invertButton, 0),
      ),
    );
    assert.ok(
      setPrepends.some(
        (box) =>
          hasLine(lines, transformUnpack, 1, box, 0) && hasLine(lines, box, 0, reverseButton, 0),
      ),
    );
    const triggerEnum = boxByVarname(boxes, "trigger-menu")?.saved_attribute_attributes?.valueof
      ?.parameter_enum;
    assert.equal(triggerEnum?.[0], "motif", "Trigger Mode must default to motif-owned behavior");
    assert.ok(triggerEnum?.includes("hold-repeat"), "Trigger Mode must expose hold-repeat");
    const repeatMenu = boxByVarname(boxes, "repeat-menu");
    const repeatEnum = repeatMenu?.saved_attribute_attributes?.valueof?.parameter_enum;
    assert.deepEqual(repeatEnum, ["motif", "exact", "1/4-bar", "1/2-bar", "1-bar"]);
    const repeatPrepend = boxByText(boxes, "prepend repeat_rounding");
    assert.ok(repeatMenu && repeatPrepend && hasLine(lines, repeatMenu, 1, repeatPrepend, 0));
    assert.ok(repeatPrepend && hasLine(lines, repeatPrepend, 0, v8, 0));

    const libraryPatcher = boxByText(boxes, "p library-info")?.patcher;
    assert.ok(libraryPatcher, "Library/Info floating window subpatcher is required");

    assert.deepEqual(
      patcher.dependency_cache.map(({ name }) => name),
      [engineFilename, previewFilename],
    );
    assert.ok(!JSON.stringify(patcher).match(/motif-(?:device|preview)-v\d/i));
    assert.ok(
      !JSON.stringify(patcher).includes("file://"),
      "patch must not embed platform-specific file URLs",
    );
    assert.ok(
      !JSON.stringify(patcher).includes("Patcher:/"),
      "invalid Patcher:/ pseudo-path must not be generated",
    );
    assert.ok(
      !JSON.stringify(patcher).includes("prepend call receiveData"),
      "jweb state must use a bound inlet selector rather than JavaScript call injection",
    );

    const controls = [
      "page-tab",
      "motif-menu",
      "pitch-menu",
      "invert-button",
      "reverse-button",
      "tempo-mult-menu",
      "trigger-menu",
      "repeat-menu",
      "quant-menu",
      "pass-menu",
      "meter-tab",
      "retrigger-tab",
      "low-number",
      "high-number",
      "info-button",
      "panic-button",
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
    const jwebLibrary = nested.find((box) => box.varname === "jweb-library");
    assert.ok(jwebLibrary, "library subpatcher must contain a jweb-library object");
    assert.equal(jwebLibrary?.maxclass, "jweb", "jweb-library must be a jweb object");
    assert.deepEqual(jwebLibrary?.patching_rect, [0, 0, libraryWindow.width, libraryWindow.height]);
    assert.deepEqual(jwebLibrary?.presentation_rect, [
      0,
      0,
      libraryWindow.width,
      libraryWindow.height,
    ]);
    assert.deepEqual(libraryPatcher.rect, [100, 100, libraryWindow.width, libraryWindow.height]);
    assert.equal(
      jwebLibrary.url,
      undefined,
      "jweb must not navigate through an unsupported URL attribute",
    );
    assert.ok(
      !JSON.stringify(libraryPatcher).includes("data:text/html"),
      "jweb must not receive a data URI",
    );
    const libraryInlet = libraryPatcher.boxes.find(({ box }) => box.maxclass === "inlet")?.box;
    const libraryInletRoute = boxByText(libraryPatcher.boxes, "route library_page");
    const libraryReadfilePrepend = boxByText(libraryPatcher.boxes, "prepend readfile");
    const libraryThispatcher = boxByText(libraryPatcher.boxes, "thispatcher");
    const libraryRoute = boxByText(
      libraryPatcher.boxes,
      "route choose_library library_ready web_debug lib_action url title",
    );
    const libraryReadyMessage = libraryPatcher.boxes.find(
      ({ box }) => box.maxclass === "message" && box.text === "library_ready",
    )?.box;
    const libraryAction = boxByText(libraryPatcher.boxes, "prepend lib_action");
    const libraryAuthorSend = boxByText(libraryPatcher.boxes, "send ---motif_author");
    const libraryDebugSend = boxByText(libraryPatcher.boxes, "send ---motif_web_debug");
    const libraryTitle = boxByText(libraryPatcher.boxes, 'loadmess title "Motif Library"');
    const libraryReceiveData = boxByText(libraryPatcher.boxes, "receive ---lib-data");
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
    assert.equal(
      jwebLibrary.rendermode,
      1,
      "standalone library window must use onscreen jweb rendering",
    );
    assert.ok(
      !("autosize" in jwebLibrary),
      "library jweb must avoid undocumented sizing attributes",
    );
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

    const libraryInfo = boxByText(boxes, "p library-info");
    const libraryPcontrol = boxByText(boxes, "pcontrol");
    const libraryOpen = boxes.find(
      ({ box }) => box.maxclass === "message" && box.text === "open",
    )?.box;
    const libraryOpenTrigger = libraryOpen
      ? boxes.find(
          ({ box }) => box.text === "t b b b b b b" && hasLine(lines, box, 2, libraryOpen, 0),
        )?.box
      : undefined;
    const libraryClose = boxes.find(
      ({ box }) => box.maxclass === "message" && box.text === "close",
    )?.box;
    const infoTrigger = libraryClose
      ? boxes.find(({ box }) => box.text === "t b b" && hasLine(lines, box, 1, libraryClose, 0))
          ?.box
      : undefined;
    const libraryReopenDefer = libraryOpenTrigger
      ? boxes.find(
          ({ box }) => box.text === "deferlow" && hasLine(lines, box, 0, libraryOpenTrigger, 0),
        )?.box
      : undefined;
    const libraryPrepare = boxes.find(
      ({ box }) => box.maxclass === "message" && box.text === "library_prepare",
    )?.box;
    const libraryPrepareDefer = libraryPrepare
      ? boxes.find(
          ({ box }) => box.text === "deferlow" && hasLine(lines, box, 0, libraryPrepare, 0),
        )?.box
      : undefined;
    const libraryPagePrepend = boxByText(boxes, "prepend library_page");
    const libraryEngineRoute = boxByText(
      boxes,
      "route event panic clear status error context motifs-reset motif-item motif-selected midi-pass ui library-page persist",
    );
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
    assert.ok(
      hasLine(lines, infoTrigger, 1, libraryClose, 0),
      "each Info press must close the prior window first",
    );
    assert.ok(
      hasLine(lines, libraryClose, 0, libraryPcontrol, 0),
      "close must be sent to pcontrol",
    );
    assert.ok(
      hasLine(lines, infoTrigger, 0, libraryReopenDefer, 0),
      "reopening must wait until the close completes",
    );
    assert.ok(hasLine(lines, libraryReopenDefer, 0, libraryOpenTrigger, 0));
    assert.ok(
      hasLine(lines, libraryOpenTrigger, 2, libraryOpen, 0),
      "window must open before page preparation is deferred",
    );
    assert.ok(hasLine(lines, libraryOpenTrigger, 1, libraryPrepareDefer, 0));
    assert.ok(hasLine(lines, libraryPrepareDefer, 0, libraryPrepare, 0));
    assert.ok(hasLine(lines, libraryPrepare, 0, v8, 0));
    assert.ok(hasLine(lines, libraryEngineRoute, 11, libraryPagePrepend, 0));
    assert.ok(hasLine(lines, libraryPagePrepend, 0, libraryInfo, 0));
    assert.ok(
      hasLine(lines, libraryOpen, 0, libraryPcontrol, 0),
      "only open should be sent to pcontrol",
    );
    for (const text of [
      "window flags float nogrow close zoom",
      libraryWindowSizeMessage,
      "window exec",
    ]) {
      for (const { box } of boxes.filter(({ box }) => box.text === text)) {
        assert.ok(
          hasLine(lines, box, 0, libraryInfo, 0),
          `${text} must be forwarded to the subpatch thispatcher`,
        );
        assert.ok(
          !hasLine(lines, box, 0, libraryPcontrol, 0),
          `${text} must never be sent to pcontrol`,
        );
      }
    }

    const libraryPathReceive = boxByText(boxes, "receive ---library_path");
    const libraryPathPattr = boxByText(
      boxes,
      "pattr motif_library_path @autorestore 0 @thru 0 @type symbol @parameter_enable 1 @parameter_mappable 0",
    );
    const libraryPathPrepend = boxByText(boxes, "prepend library_path");
    assert.ok(libraryPathReceive && libraryPathPattr && libraryPathPrepend);
    assert.equal(libraryPathPattr.saved_attribute_attributes?.valueof?.parameter_type, 3);
    assert.equal(libraryPathPattr.saved_attribute_attributes?.valueof?.parameter_invisible, 1);
    assert.ok(hasLine(lines, libraryPathReceive, 0, libraryPathPattr, 0));
    assert.ok(hasLine(lines, libraryPathReceive, 0, libraryPathPrepend, 0));
    assert.ok(hasLine(lines, libraryPathPattr, 0, libraryPathPrepend, 0));

    const pathRestoreBang = boxes.find(
      ({ box }) =>
        box.maxclass === "message" &&
        box.text === "bang" &&
        hasLine(lines, box, 0, libraryPathPattr, 0),
    )?.box;
    const deviceStatePattr = boxByText(
      boxes,
      "pattr motif_device_state @autorestore 0 @thru 0 @type symbol @parameter_enable 1 @parameter_mappable 0",
    );
    const stateRestoreBang = deviceStatePattr
      ? boxes.find(
          ({ box }) =>
            box.maxclass === "message" &&
            box.text === "bang" &&
            hasLine(lines, box, 0, deviceStatePattr, 0),
        )?.box
      : undefined;
    const stateRestorePrepend = boxByText(boxes, "prepend restore_state");
    assert.ok(deviceStatePattr && stateRestoreBang && stateRestorePrepend && engineRoute);
    assert.equal(deviceStatePattr.saved_attribute_attributes?.valueof?.parameter_type, 3);
    assert.equal(deviceStatePattr.saved_attribute_attributes?.valueof?.parameter_invisible, 1);
    assert.ok(hasLine(lines, deviceStatePattr, 0, stateRestorePrepend, 0));
    assert.ok(hasLine(lines, stateRestorePrepend, 0, v8, 0));
    assert.ok(hasLine(lines, engineRoute, 12, deviceStatePattr, 0));

    const initOrder = boxByText(boxes, "t b b b b b b");
    const thisDevice = boxByText(boxes, "live.thisdevice");
    assert.ok(pathRestoreBang && initOrder && thisDevice && parameterRestore);
    assert.ok(hasLine(lines, thisDevice, 0, initOrder, 0));
    assert.ok(hasLine(lines, initOrder, 5, pathRestoreBang, 0));
    assert.ok(hasLine(lines, initOrder, 4, stateRestoreBang, 0));
    assert.ok(hasLine(lines, initOrder, 3, parameterRestore, 0));

    const authorReceive = boxByText(boxes, "receive ---motif_author");
    const authorDefer = authorReceive
      ? boxes.find(({ box }) => box.text === "deferlow" && hasLine(lines, authorReceive, 0, box, 0))
          ?.box
      : undefined;
    assert.ok(authorReceive && authorDefer);
    assert.ok(hasLine(lines, authorDefer, 0, v8, 0));

    for (const varname of [
      "trigger-menu",
      "repeat-menu",
      "quant-menu",
      "pass-menu",
      "meter-tab",
      "retrigger-tab",
      "low-number",
      "high-number",
    ]) {
      assert.equal(
        boxByVarname(boxes, varname)?.hidden,
        1,
        `${varname} should start hidden on the Settings tab`,
      );
    }
  });

  it("library jweb binds receiveData before readiness and contains valid diagnostic JavaScript", async () => {
    const [
      template,
      controller,
      bridge,
      app,
      pageState,
      browserList,
      hotkeyList,
      librarySidebar,
      noteTable,
      propertyForm,
      pageStore,
      protocol,
      style,
      libraryHtml,
    ] = await Promise.all([
      readFile("src/max/library/ui/index.html", "utf8"),
      readFile("src/max/library/ui/main.ts", "utf8"),
      readFile("src/max/library/ui/bridge.ts", "utf8"),
      readFile("src/max/library/ui/app.tsx", "utf8"),
      readFile("src/max/library/ui/page-state.ts", "utf8"),
      readFile("src/max/library/ui/components/BrowserList.tsx", "utf8"),
      readFile("src/max/library/ui/components/HotkeyList.tsx", "utf8"),
      readFile("src/max/library/ui/components/LibrarySidebar.tsx", "utf8"),
      readFile("src/max/library/ui/components/NoteTable.tsx", "utf8"),
      readFile("src/max/library/ui/components/PropertyForm.tsx", "utf8"),
      readFile("src/max/library/ui/page-store.ts", "utf8"),
      readFile("src/max/library/protocol.ts", "utf8"),
      readFile("src/max/library/ui/styles.css", "utf8"),
      readFile("max/library.html", "utf8"),
    ]);
    const client = [
      controller,
      bridge,
      app,
      pageState,
      browserList,
      hotkeyList,
      librarySidebar,
      noteTable,
      propertyForm,
      pageStore,
      protocol,
    ].join("\n");
    const bindIndex = client.search(/maxBridge\.bindInlet\(["']receiveData["'], receiveData\)/);
    const readyIndex = client.search(/maxBridge\.outlet\(["']library_ready["']\)/);
    const script = libraryHtml.match(/<script>([\s\S]*?)<\/script>/)?.[1];

    assert.match(template, /<link rel="stylesheet" href="styles\.css" data-motif-build \/>/);
    assert.match(template, /<script type="module" src="\.\/main\.ts" data-motif-build><\/script>/);
    assert.doesNotMatch(template, /<style>|<script>(?!<\/script>)/);
    assert.ok(script, "production Library HTML must contain the compiled inline script");
    assert.match(libraryHtml, /<style>[\s\S]+<\/style>/);
    assert.doesNotMatch(libraryHtml, /(?:styles\.css|main\.ts)|data-motif-build/);
    assert.doesNotThrow(
      () => new vm.Script(script, { filename: "library.html" }),
      "library JavaScript must parse",
    );
    assert.doesNotMatch(
      script,
      /\?\.|\?\?|\binterface\b/,
      "Library JavaScript must be compiled to its ES2018 target",
    );
    assert.ok(bindIndex >= 0, "library must bind the receiveData inlet");
    assert.ok(readyIndex > bindIndex, "library must announce readiness after binding receiveData");
    assert.match(client, /maxBridge\.outlet\(["']web_debug["']/);
    assert.ok(
      /window\.addEventListener\(["']error["']/.test(client),
      "library must capture JavaScript errors",
    );
    assert.ok(
      /window\.addEventListener\(["']unhandledrejection["']/.test(client),
      "library must capture promise rejections",
    );
    assert.ok(
      !client.includes("window.receiveData = receiveData"),
      "library must not rely on an unbound global function",
    );
    assert.ok(
      !client.includes("outlet.toString().includes('console.log')"),
      "library must not infer Max from source text",
    );
    assert.ok(
      client.includes("No library state received within 2 seconds"),
      "library must report missing state",
    );
    assert.ok(
      !client.includes("MIDI file is too long"),
      "the page must not infer domain warnings from transport failures",
    );
    assert.ok(
      client.includes("Library data could not be displayed"),
      "transport failures must retain a truthful diagnostic",
    );
    assert.ok(
      client.includes("detail === payloadErrorSignature"),
      "repeated payload errors must be deduplicated",
    );
    assert.match(client, /confirmLabel:\s*["']OK["']/, "user warnings must be dismissible");
    assert.ok(!client.includes("Bad library payload:"), "raw JSON parse errors must not be shown");
    assert.ok(
      /maxBridge\.outlet\(["']lib_action["'], encodeURIComponent\(JSON\.stringify\(action\)\)\)/.test(
        client,
      ),
      "library actions must use an explicit selector",
    );
    assert.match(
      client,
      /function createStore<T>/,
      "library must use one explicit typed local state store",
    );
    assert.match(
      client,
      /type:\s*["']cancel_edit["']/,
      "library must provide an explicit way to exit editing",
    );
    assert.doesNotMatch(client, /delete_motif|skipDeleteConfirmation/);
    assert.doesNotMatch(
      client,
      /from\s+["'][^"']*\/device\//,
      "Library UI must communicate through protocol.ts instead of device-side modules",
    );
    assert.match(client, /type:\s*["']select_browser["']/, "browser selection must use stable ids");
    assert.match(client, /class=["']browser-folder["']/);
    assert.match(client, /aria-expanded=\{!collapsed\}/);
    assert.match(client, /function LibrarySidebar\(\)/);
    assert.doesNotMatch(controller, /getElementById\(["'](?:app|left|library-resizer)["']\)/);
    assert.ok(client.includes("item.folder"));
    assert.ok(client.includes("server?.libraryScanning"));
    assert.match(client, /id="hotkey-input"/);
    assert.match(client, /id="hotkey-action"/);
    assert.match(client, /<option value="trigger">Trigger Motif<\/option>/);
    assert.match(client, /<option value="select">Select Motif<\/option>/);
    assert.doesNotMatch(client, /<option value="repeat">/);
    assert.ok(client.includes("mapping.label"));
    assert.match(client, /type:\s*["']map_trigger["']/);
    assert.match(client, /onClick=\{assignHotkey\}/);
    assert.doesNotMatch(client, /getElementById\(["']hotkey-(?:input|action)["']\)/);
    assert.match(client, /type:\s*["']unmap_trigger["']/);
    assert.ok(client.includes("Save changes and exit editing"));
    assert.match(client, /type:\s*["']edit_motif["'], properties:\s*readProperties\(\)/);
    assert.ok(client.includes("canAddNote"));
    assert.match(style, /#notes-panel\s*\{\s*overflow:\s*auto;/);
    assert.match(
      style,
      /#left\s*\{[^}]*min-height:\s*0;[^}]*overflow:\s*hidden;/s,
      "sidebar must constrain its browser list so folder actions remain visible",
    );
    assert.match(
      style,
      /#app\s*\{[^}]*height:\s*calc\(100vh\s*-\s*20px\);[^}]*overflow:\s*hidden;/s,
      "Library shell must reserve the fixed debug bar without content-driven height growth",
    );
    assert.match(
      style,
      /#right\s*\{[^}]*min-height:\s*0;[^}]*overflow:\s*hidden;/s,
      "detail column must constrain the active panel so properties can scroll",
    );
    assert.doesNotMatch(client, /note-page-prev|set_note_page/);
    assert.ok(client.includes("function receiveStateChunk(payload: LibraryStateChunk)"));
    assert.match(client, /LIBRARY_STATE_CHUNK_KIND = ["']state-chunk["']/);
    assert.ok(client.includes("kind === LIBRARY_STATE_CHUNK_KIND"));
    assert.ok(client.includes("notes.map((note, index)"));
    assert.match(client, /type:\s*["']edit_note_at["']/);
    assert.doesNotMatch(template, /id="import-mode"/);
    assert.match(client, /type:\s*["']import_clip["']/);
    for (const field of [
      "pitch-mode-edit",
      "source-anchor-edit",
      "source-anchor-name",
      "source-root-edit",
      "source-root-name",
      "source-scale-name-edit",
      "source-scale-intervals-edit",
      "meter-numerator-edit",
      "default-gate-edit",
      "curve-exponent",
    ]) {
      assert.ok(client.includes(`id="${field}"`), `library must expose ${field}`);
    }
    for (const field of ["velocityOffset", "velocityScale", "legato", "tie"]) {
      assert.ok(client.includes(field), `library must expose note field ${field}`);
    }
  });

  it("native preview script parses and exposes state, readiness, and diagnostics handlers", async () => {
    const previewScript = await readFile("src/max/motif-preview.js", "utf8");

    assert.doesNotThrow(() => new vm.Script(previewScript, { filename: "motif-preview.js" }));
    assert.match(previewScript, /mgraphics\.init\(\)/);
    assert.match(previewScript, /function receiveData\(\)/);
    assert.match(previewScript, /function loadbang\(\)/);
    assert.match(previewScript, /outlet\(0, "preview_ready"\)/);
    assert.match(previewScript, /outlet\(0, "preview_debug", level/);
    assert.match(previewScript, /function paint\(\)/);
    assert.match(previewScript, /function velocityColor\(color, velocity\)/);
    assert.match(
      previewScript,
      /jsarguments\.length > 1[\s\S]*Number\(jsarguments\[1\]\)[\s\S]*jsarguments\.length > 2[\s\S]*Number\(jsarguments\[2\]\)/,
      "preview arguments must skip jsarguments[0], which Max reserves for the filename",
    );
    assert.doesNotMatch(
      previewScript,
      /mgraphics\.clip\(/,
      "legacy jsui does not expose mgraphics.clip()",
    );
    assert.doesNotMatch(previewScript, /window\.max|readfile|preview\.html/);
  });

  it("native preview executes and renders a valid payload without jweb", async () => {
    const previewScript = await readFile("src/max/motif-preview.js", "utf8");
    const outletMessages: unknown[][] = [];
    const errors: string[] = [];
    const drawingMethods = [
      "init",
      "rectangle",
      "rectangle_rounded",
      "fill",
      "set_source_rgba",
      "set_line_width",
      "move_to",
      "line_to",
      "stroke",
      "select_font_face",
      "set_font_size",
      "show_text",
      "redraw",
    ];
    const mgraphics = Object.fromEntries(
      drawingMethods.map((name) => [name, () => undefined]),
    ) as Record<string, unknown>;
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

    new vm.Script(previewScript, { filename: "motif-preview.js" }).runInContext(context);
    (context.loadbang as () => void)();
    assert.ok(outletMessages.some((message) => message[1] === "preview_ready"));

    const payload = encodeURIComponent(
      JSON.stringify({
        notes: [
          { pitch: 60, atTicks: 0, durationTicks: 480, velocity: 20 },
          { pitch: 63, atTicks: 480, durationTicks: 480, velocity: 120 },
        ],
        totalTicks: 960,
        lowPitch: 59,
        highPitch: 64,
        noteNames: "C3  ·  D♯3",
      }),
    );
    (context.receiveData as (value: string) => void)(payload);
    (context.paint as () => void)();

    assert.equal(errors.length, 0);
    const velocityColor = context.velocityColor as (color: number[], velocity: number) => number[];
    const dim = Array.from(velocityColor([1, 0.55, 0.12, 1], 1));
    const bright = Array.from(velocityColor([1, 0.55, 0.12, 1], 127));
    assert.ok(dim[0]! < bright[0]! && dim[1]! < bright[1]! && dim[2]! < bright[2]!);
    assert.equal(dim[3], bright[3], "velocity shading must not make notes transparent");
    assert.ok(
      outletMessages.some((message) => message[1] === "preview_debug" && message[2] === "ok"),
    );
  });

  it("MIDI routing is fail-open and follows the documented midiselect pattern", async () => {
    const patcher = await readPatch();
    const { boxes, lines } = patcher;
    const midiin = boxByText(boxes, "midiin");
    const inputGate = boxByText(boxes, "gate 2 1");
    const bypassDefault = boxByText(boxes, "loadmess 1");
    const engineMode = boxes.find(({ box }) => box.maxclass === "message" && box.text === "2")?.box;
    const midiselect = boxByText(boxes, "midiselect @ch all @note all");
    const midiflush = boxByText(boxes, "midiflush");
    const midiout = boxByText(boxes, "midiout");
    const readyRoute = boxByText(boxes, "route Ready");

    assert.ok(
      midiin &&
        inputGate &&
        bypassDefault &&
        engineMode &&
        midiselect &&
        midiflush &&
        midiout &&
        readyRoute,
    );
    assert.ok(hasLine(lines, midiin, 0, inputGate, 1));
    assert.ok(hasLine(lines, bypassDefault, 0, inputGate, 0));
    assert.ok(
      hasLine(lines, inputGate, 0, midiflush, 0),
      "raw MIDI must bypass JavaScript before Ready",
    );
    assert.ok(
      hasLine(lines, inputGate, 1, midiselect, 0),
      "Ready mode must feed native MIDI selection",
    );
    assert.ok(
      hasLine(lines, midiselect, 7, midiflush, 0),
      "unselected raw MIDI must pass directly to output",
    );
    assert.ok(hasLine(lines, midiflush, 0, midiout, 0));

    const readyTriggerId = lines.find(
      ({ patchline }) => patchline.source[0] === readyRoute.id && patchline.source[1] === 0,
    )?.patchline.destination[0];
    const readyTrigger = boxes.find(({ box }) => box.id === readyTriggerId)?.box;
    assert.equal(readyTrigger?.text, "t b b b");
    assert.ok(readyTrigger);
    assert.ok(hasLine(lines, readyTrigger, 1, engineMode, 0));
    assert.ok(hasLine(lines, engineMode, 0, inputGate, 0));
  });

  it("separates ordinary queue clearing from a full sixteen-channel panic", async () => {
    const { boxes, lines } = await readPatch();
    const engineRoute = boxByText(
      boxes,
      "route event panic clear status error context motifs-reset motif-item motif-selected midi-pass ui library-page persist",
    );
    const panicTrigger = boxByText(boxes, "t b b b");
    const clearTrigger = boxByText(boxes, "t b b");
    const clearMessage = boxByText(boxes, "clear");
    const channelUzi = boxByText(boxes, "uzi 16");
    const channelTrigger = boxByText(boxes, "t b i");
    const controllerMessage = boxByText(boxes, "64 0, 120 0, 123 0");
    const midiFormats = boxes.filter(({ box }) => box.text === "midiformat").map(({ box }) => box);
    const panicMidiFormat = midiFormats.find((candidate) =>
      controllerMessage ? hasLine(lines, controllerMessage, 0, candidate, 2) : false,
    );
    const midiflush = boxByText(boxes, "midiflush");

    assert.ok(
      engineRoute &&
        panicTrigger &&
        clearTrigger &&
        clearMessage &&
        channelUzi &&
        channelTrigger &&
        controllerMessage &&
        panicMidiFormat &&
        midiflush,
    );
    assert.ok(hasLine(lines, engineRoute, 1, panicTrigger, 0));
    assert.ok(hasLine(lines, panicTrigger, 2, clearMessage, 0));
    assert.ok(hasLine(lines, panicTrigger, 1, channelUzi, 0));
    assert.ok(hasLine(lines, panicTrigger, 0, midiflush, 0));
    assert.ok(hasLine(lines, channelUzi, 2, channelTrigger, 0));
    assert.ok(hasLine(lines, channelTrigger, 1, panicMidiFormat, 6));
    assert.ok(hasLine(lines, channelTrigger, 0, controllerMessage, 0));
    assert.ok(hasLine(lines, panicMidiFormat, 0, midiflush, 0));
    assert.ok(hasLine(lines, engineRoute, 2, clearTrigger, 0));
    assert.ok(hasLine(lines, clearTrigger, 1, clearMessage, 0));
    assert.ok(hasLine(lines, clearTrigger, 0, midiflush, 0));
  });

  it("compiled bundle uses one hand-written top-level Max dispatcher", async () => {
    const { source } = await loadCompiledEngine();
    assert.match(
      source.slice(0, 600),
      /var inlets\s*=\s*1;[\s\S]*var outlets\s*=\s*1;[\s\S]*function anything\(\)/,
    );
    assert.match(source, /var message\s*=\s*messagename/);
    assert.match(source, /arrayfromargs\(arguments\)/);
    assert.match(source, /MotifEngine\.dispatch\(message,\s*args\)/);
    assert.doesNotMatch(
      source.slice(0, source.indexOf('"use strict";')),
      /function song_context\(/,
    );
    assert.doesNotMatch(source, /__motifHandlers/);
    assert.doesNotMatch(source, /function host(?:_|\()/);
  });
});
