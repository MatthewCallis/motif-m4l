import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { describe, it, expect } from "vitest";
import vm from "node:vm";
import { loadCompiledEngine } from "../helpers/max-engine.js";
import { readLibraryWindowConfig } from "../../scripts/library-window-config.js";

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
    const packageMetadata = JSON.parse(await readFile("package.json", "utf8")) as {
      version: string;
    };
    const patcher = await readPatch();
    const { boxes, lines } = patcher;
    const dependencyNames = patcher.dependency_cache.map(({ name }) => name);
    const engineFilename = dependencyNames.find((name) =>
      /^motif-device-[a-f0-9]{12}\.js$/.test(name),
    );
    const previewFilename = dependencyNames.find((name) =>
      /^motif-preview-[a-f0-9]{12}\.js$/.test(name),
    );
    expect(
      engineFilename && previewFilename,
      "runtime dependencies must use content-addressed filenames",
    ).toBeTruthy();
    const engineSource = await readFile(`max/${engineFilename}`, "utf8");
    const previewSource = await readFile(`max/${previewFilename}`, "utf8");
    expect(() => new vm.Script(previewSource, { filename: previewFilename })).not.toThrow();
    expect(
      previewSource,
      "production preview must remain compatible with the legacy jsui JavaScript host",
    ).not.toMatch(/`|=>|\b(?:const|let)\b|catch\s*\{/);
    expect(
      Math.max(...previewSource.split("\n").map((line) => line.length)) <= 1_100,
      "production preview lines must stay below jsui error-reporting limits",
    ).toBeTruthy();
    expect(engineFilename).toBe(
      `motif-device-${createHash("sha256").update(engineSource).digest("hex").slice(0, 12)}.js`,
    );
    expect(previewFilename).toBe(
      `motif-preview-${createHash("sha256").update(previewSource).digest("hex").slice(0, 12)}.js`,
    );
    const v8Text = `v8 ${engineFilename}`;

    expect(patcher.openinpresentation).toBe(1);
    expect(patcher.devicewidth).toBe(475);
    expect(patcher.default_fontname).toBe("Ableton Sans");
    expect(boxes.filter(({ box }) => box.presentation === 1).length >= 24).toBeTruthy();
    for (const { box } of boxes.filter(({ box }) => box.presentation === 1)) {
      const rect = box.presentation_rect;
      expect(rect, `${box.varname ?? box.id} is missing a presentation rectangle`).toBeTruthy();
      const [x, y, width, height] = rect!;
      expect(x >= 0 && y >= 0, `${box.varname ?? box.id} starts outside the device`).toBeTruthy();
      expect(
        x + width <= patcher.devicewidth,
        `${box.varname ?? box.id} exceeds the device width`,
      ).toBeTruthy();
      expect(
        y + height <= 169,
        `${box.varname ?? box.id} exceeds Live's fixed 169px height`,
      ).toBeTruthy();
    }

    const texts = boxes.map(({ box }) => box.text).filter((text): text is string => Boolean(text));
    expect(texts.includes(v8Text)).toBeTruthy();
    expect(texts.includes("live.path live_set")).toBeTruthy();
    expect(texts.includes("live.observer")).toBeTruthy();
    expect(texts.includes("pcontrol")).toBeTruthy();
    expect(texts.includes("p library-info")).toBeTruthy();
    expect(texts.includes("prepend tempo_multiplier")).toBeTruthy();
    expect(boxByVarname(boxes, "version-label")?.text).toBe(`Version ${packageMetadata.version}`);
    expect(boxByVarname(boxes, "author-label")?.text).toBe("Matthew Callis");
    const githubButton = boxByVarname(boxes, "github-button");
    const githubLaunchMessage = boxByText(
      boxes,
      "; max launchbrowser https://github.com/MatthewCallis/motif-m4l",
    );
    expect(githubButton?.maxclass).toBe("live.text");
    expect(githubButton?.parameter_enable).toBe(0);
    expect(
      githubButton &&
        githubLaunchMessage &&
        hasLine(lines, githubButton, 0, githubLaunchMessage, 0),
    ).toBeTruthy();
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
      expect(texts.includes(`property ${property}`)).toBeTruthy();
      expect(texts.includes(`prepend ${property}`)).toBeTruthy();
    }

    expect(texts.includes("prepend song_context")).toBeTruthy();
    expect(texts.includes("deferlow")).toBeTruthy();
    expect(
      !texts.some((text) => text === "prepend host" || text.startsWith("prepend host_")),
    ).toBeTruthy();
    expect(texts.includes("route Ready")).toBeTruthy();
    expect(texts.includes("t b b b b b b b b b")).toBeTruthy();
    expect(
      texts.includes(
        "route event panic clear status error context motifs-reset motif-item motif-selected midi-pass ui library-page persist",
      ),
    ).toBeTruthy();
    expect(
      texts.includes("route lib preview transforms"),
      "ui-route must handle library, preview, and transform state",
    ).toBeTruthy();
    expect(texts.includes(libraryWindowSizeMessage)).toBeTruthy();
    expect(texts.includes("window flags float nogrow close zoom")).toBeTruthy();
    expect(!texts.includes("window flags float grow close zoom")).toBeTruthy();
    expect(
      texts.filter((text) => text === libraryWindowSizeMessage).length >= 2,
      "size must be applied before and after open",
    ).toBeTruthy();
    expect(texts.includes("receive ---motif_author")).toBeTruthy();
    expect(texts.includes("pipe 0 0 0 0.")).toBeTruthy();

    const v8 = boxByText(boxes, v8Text);
    expect(v8?.numoutlets).toBe(1);
    expect(v8).toBeTruthy();
    expect(
      lines.every(({ patchline }) => patchline.source[0] !== v8!.id || patchline.source[1] === 0),
    ).toBeTruthy();

    const engineRoute = boxByText(
      boxes,
      "route event panic clear status error context motifs-reset motif-item motif-selected midi-pass ui library-page persist",
    );
    expect(engineRoute).toBeTruthy();
    expect(!boxByText(boxes, "prepend delete_file")).toBeTruthy();
    expect(
      !boxByText(boxes, "node.script motif-file-service.cjs @autostart 1 @restart 1"),
    ).toBeTruthy();

    const songContextIds = boxes
      .filter(({ box }) => box.text === "prepend song_context")
      .map(({ box }) => box);
    expect(songContextIds.length).toBe(9);
    const songContextDestinationIds = new Set(
      songContextIds.flatMap((source) =>
        lines
          .filter(({ patchline }) => patchline.source[0] === source.id)
          .map(({ patchline }) => patchline.destination[0]),
      ),
    );
    expect(songContextDestinationIds.size).toBe(1);
    const songContextDefer = boxes.find(({ box }) => songContextDestinationIds.has(box.id))?.box;
    expect(songContextDefer?.text).toBe("deferlow");
    expect(songContextDefer && hasLine(lines, songContextDefer, 0, v8!, 0)).toBeTruthy();

    const rootDisplay = boxByVarname(boxes, "root-display");
    expect(rootDisplay?.maxclass).toBe("live.menu");
    expect(rootDisplay?.parameter_enable).toBe(1);
    expect(rootDisplay?.saved_attribute_attributes?.valueof?.parameter_invisible).toBe(2);
    expect(rootDisplay?.ignoreclick).toBe(0);
    const scaleNameDisplay = boxByVarname(boxes, "scale-name-display");
    expect(scaleNameDisplay?.maxclass).toBe("live.menu");
    expect(scaleNameDisplay?.parameter_enable).toBe(1);
    expect(scaleNameDisplay?.ignoreclick).toBe(0);
    expect(scaleNameDisplay?.saved_attribute_attributes?.valueof?.parameter_invisible).toBe(2);
    const scaleButton = boxByVarname(boxes, "scale-button");
    expect(scaleButton?.maxclass).toBe("live.text");
    expect(scaleButton?.text).toBe("Scale");
    expect(scaleButton?.mode).toBe(1);
    expect(scaleButton?.parameter_enable).toBe(1);
    expect(boxByVarname(boxes, "scale-label")).toBeUndefined();
    const scaleRootOverride = boxByVarname(boxes, "scale-root-override");
    const scaleNameOverride = boxByVarname(boxes, "scale-name-override");
    expect(scaleRootOverride?.parameter_enable).toBe(1);
    expect(scaleRootOverride?.hidden).toBe(1);
    expect(scaleNameOverride?.parameter_enable).toBe(1);
    expect(scaleNameOverride?.hidden).toBe(1);
    expect(texts.includes("prepend scale_override")).toBeTruthy();
    expect(texts.includes("prepend scale_override_root")).toBeTruthy();
    expect(texts.includes("prepend scale_override_name")).toBeTruthy();
    const rootProperty = boxByText(boxes, "property root_note");
    const scaleNameProperty = boxByText(boxes, "property scale_name");
    const observerFor = (property: Box | undefined): Box | undefined => {
      const observerId = property
        ? lines.find(({ patchline }) => patchline.source[0] === property.id)?.patchline
            .destination[0]
        : undefined;
      return boxes.find(({ box }) => box.id === observerId)?.box;
    };
    const dataGateFor = (observer: Box | undefined): Box | undefined => {
      const gateId = observer
        ? lines.find(
            ({ patchline }) =>
              patchline.source[0] === observer.id &&
              patchline.destination[1] === 1 &&
              boxes.find(({ box }) => box.id === patchline.destination[0])?.box.text === "gate 1",
          )?.patchline.destination[0]
        : undefined;
      return boxes.find(({ box }) => box.id === gateId)?.box;
    };
    const rootObserver = observerFor(rootProperty);
    const scaleNameObserver = observerFor(scaleNameProperty);
    const rootDisplayGate = dataGateFor(rootObserver);
    const scaleNameDisplayGate = dataGateFor(scaleNameObserver);
    const scaleFollowInvert = boxByText(boxes, "!- 1");
    expect(rootDisplayGate && scaleNameDisplayGate && scaleFollowInvert).toBeTruthy();
    expect(hasLine(lines, scaleFollowInvert!, 0, rootDisplayGate!, 0)).toBeTruthy();
    expect(hasLine(lines, scaleFollowInvert!, 0, scaleNameDisplayGate!, 0)).toBeTruthy();
    expect(
      rootObserver && hasLine(lines, rootObserver, 0, rootDisplayGate!, 1),
      "observed values must enter the gate data inlet",
    ).toBeTruthy();
    expect(
      scaleNameObserver && hasLine(lines, scaleNameObserver, 0, scaleNameDisplayGate!, 1),
      "observed scale names must enter the gate data inlet",
    ).toBeTruthy();
    expect(
      !boxByVarname(boxes, "scale-mode-display"),
      "scale ♭♯ chip must be removed",
    ).toBeTruthy();
    expect(
      !boxByVarname(boxes, "tempo-display"),
      "computed BPM readout must be removed from the Presentation UI",
    ).toBeTruthy();
    expect(
      !boxByVarname(boxes, "status-display"),
      "debug status-display must not appear in the Presentation UI",
    ).toBeTruthy();
    expect(
      !boxByVarname(boxes, "preview-root-display"),
      "anchor/debug metadata line must be removed from Presentation",
    ).toBeTruthy();
    expect(
      texts.includes("active 0") && texts.includes("active 1"),
      "Scale menus must toggle active from the Scale button",
    ).toBeTruthy();
    expect(
      texts.some((text) => text.startsWith("§ ")),
      "unlocked patcher should label major sections",
    ).toBeTruthy();

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
    expect(
      preview &&
        previewReadyRoute &&
        previewReadyMessage &&
        previewLoadMessage &&
        previewDebugPage &&
        previewDebugPrepend &&
        readyTrigger,
    ).toBeTruthy();
    expect(preview!.maxclass).toBe("jsui");
    expect(preview!.filename).toBe(previewFilename);
    expect(preview!.template).toBe(previewFilename);
    expect(preview!.border).toBe(0);
    expect(preview!.jsarguments).toEqual([6, 1]);
    expect(preview!.ignoreclick).toBe(0);
    expect(
      !boxByText(boxes, "readfile preview.html"),
      "native preview must not load an external HTML page",
    ).toBeTruthy();
    expect(
      hasLine(lines, preview!, 0, previewReadyRoute!, 0),
      "preview output must route readiness and diagnostics",
    ).toBeTruthy();
    expect(hasLine(lines, previewReadyRoute!, 0, previewReadyMessage!, 0)).toBeTruthy();
    expect(
      hasLine(lines, previewReadyMessage!, 0, v8!, 0),
      "preview readiness must request fresh engine state",
    ).toBeTruthy();
    expect(
      hasLine(lines, readyTrigger!, 2, previewLoadMessage!, 0),
      "engine readiness must reload the frozen jsui dependency",
    ).toBeTruthy();
    expect(
      hasLine(lines, previewLoadMessage!, 0, preview!, 0),
      "the explicit jsfile message must target the preview",
    ).toBeTruthy();
    expect(hasLine(lines, previewReadyRoute!, 1, previewDebugPage!, 0)).toBeTruthy();
    expect(hasLine(lines, previewDebugPage!, 0, previewDebugPrepend!, 0)).toBeTruthy();
    expect(
      hasLine(lines, previewDebugPrepend!, 0, v8!, 0),
      "native preview diagnostics must reach the engine",
    ).toBeTruthy();
    expect(
      (preview!.presentation_rect?.[3] ?? 0) >= 80,
      "preview contour should use the height freed by collapsing the control row",
    ).toBeTruthy();
    expect(
      !boxes.some(({ box }) => box.maxclass === "v8ui"),
      "preview must not depend on v8ui",
    ).toBeTruthy();
    expect(
      !JSON.stringify(patcher).includes("live_lcd_"),
      "maxpat must not embed invalid live_lcd_* color tokens",
    ).toBeTruthy();

    const pageTab = boxByVarname(boxes, "page-tab");
    expect(pageTab?.maxclass).toBe("live.tab");
    expect(pageTab?.livemode).toBe(1);

    const tempoMult = boxByVarname(boxes, "tempo-mult-menu");
    expect(tempoMult?.maxclass).toBe("live.menu");
    const motifMenu = boxByVarname(boxes, "motif-menu");
    expect(
      (motifMenu?.presentation_rect?.[1] ?? 99) <= 8,
      "selected motif must sit on the top control row",
    ).toBeTruthy();
    const pitchMenu = boxByVarname(boxes, "pitch-menu");
    expect(
      (pitchMenu?.presentation_rect?.[0] ?? 999) <
        (boxByVarname(boxes, "root-display")?.presentation_rect?.[0] ?? 0),
      "pitch menu must sit to the left of the Scale menus",
    ).toBeTruthy();
    const pitchEnum = pitchMenu?.saved_attribute_attributes?.valueof?.parameter_enum;
    expect(pitchEnum?.includes("motif"), "Pitch Mode first item is motif").toBeTruthy();
    expect(!pitchEnum?.includes("auto"), "Pitch Mode auto was renamed to motif").toBeTruthy();
    const invertButton = boxByVarname(boxes, "invert-button");
    const reverseButton = boxByVarname(boxes, "reverse-button");
    expect(invertButton?.maxclass).toBe("live.text");
    expect(invertButton?.text).toBe("Invert");
    expect(invertButton?.mode).toBe(1);
    expect(invertButton?.outputmode).toBe(0);
    expect(invertButton?.parameter_enable).toBe(1);
    expect(invertButton?.saved_attribute_attributes?.valueof?.parameter_initial).toEqual([0]);
    expect(reverseButton?.maxclass).toBe("live.text");
    expect(reverseButton?.text).toBe("Reverse");
    expect(reverseButton?.mode).toBe(1);
    expect(reverseButton?.outputmode).toBe(0);
    expect(reverseButton?.parameter_enable).toBe(1);
    expect(reverseButton?.saved_attribute_attributes?.valueof?.parameter_initial).toEqual([0]);
    const invertPrepend = boxByText(boxes, "prepend invert");
    const reversePrepend = boxByText(boxes, "prepend reverse");
    expect(
      invertButton && invertPrepend && hasLine(lines, invertButton, 0, invertPrepend, 0),
    ).toBeTruthy();
    expect(invertPrepend && hasLine(lines, invertPrepend, 0, v8!, 0)).toBeTruthy();
    expect(
      reverseButton && reversePrepend && hasLine(lines, reverseButton, 0, reversePrepend, 0),
    ).toBeTruthy();
    expect(reversePrepend && hasLine(lines, reversePrepend, 0, v8!, 0)).toBeTruthy();
    expect(boxes.filter(({ box }) => box.text === "loadmess set 0").length).toBe(0);
    const parameterRestore = boxByText(boxes, "t b b b b b b b b b b b b b b b b");
    const invertOutputValue = boxByText(boxes, "outputvalue");
    const outputValueMessages = boxes
      .filter(({ box }) => box.text === "outputvalue")
      .map(({ box }) => box);
    expect(outputValueMessages.length).toBe(3);
    expect(parameterRestore && invertOutputValue).toBeTruthy();
    expect(
      outputValueMessages.some(
        (box) =>
          hasLine(lines, parameterRestore!, 14, box, 0) && hasLine(lines, box, 0, invertButton!, 0),
      ),
    ).toBeTruthy();
    expect(
      outputValueMessages.some(
        (box) =>
          hasLine(lines, parameterRestore!, 15, box, 0) &&
          hasLine(lines, box, 0, reverseButton!, 0),
      ),
    ).toBeTruthy();
    expect(
      outputValueMessages.some(
        (box) =>
          hasLine(lines, parameterRestore!, 11, box, 0) && hasLine(lines, box, 0, scaleButton!, 0),
      ),
    ).toBeTruthy();
    expect(hasLine(lines, parameterRestore!, 12, scaleNameOverride!, 0)).toBeTruthy();
    expect(hasLine(lines, parameterRestore!, 13, scaleRootOverride!, 0)).toBeTruthy();
    const lowNumber = boxByVarname(boxes, "low-number");
    const highNumber = boxByVarname(boxes, "high-number");
    expect(lowNumber && highNumber).toBeTruthy();
    expect(hasLine(lines, parameterRestore!, 8, lowNumber!, 0)).toBeTruthy();
    expect(hasLine(lines, parameterRestore!, 7, highNumber!, 0)).toBeTruthy();
    const transformRoute = boxByText(boxes, "route lib preview transforms");
    const transformUnpackId = transformRoute
      ? lines.find(
          ({ patchline }) => patchline.source[0] === transformRoute.id && patchline.source[1] === 2,
        )?.patchline.destination[0]
      : undefined;
    const transformUnpack = boxes.find(({ box }) => box.id === transformUnpackId)?.box;
    const setPrepends = boxes.filter(({ box }) => box.text === "prepend set").map(({ box }) => box);
    expect(transformRoute && transformUnpack).toBeTruthy();
    expect(hasLine(lines, transformRoute!, 2, transformUnpack!, 0)).toBeTruthy();
    expect(
      setPrepends.some(
        (box) =>
          hasLine(lines, transformUnpack!, 0, box, 0) && hasLine(lines, box, 0, invertButton!, 0),
      ),
    ).toBeTruthy();
    expect(
      setPrepends.some(
        (box) =>
          hasLine(lines, transformUnpack!, 1, box, 0) && hasLine(lines, box, 0, reverseButton!, 0),
      ),
    ).toBeTruthy();
    const triggerEnum = boxByVarname(boxes, "trigger-menu")?.saved_attribute_attributes?.valueof
      ?.parameter_enum;
    expect(triggerEnum?.[0]).toBe("motif");
    expect(
      triggerEnum?.includes("hold-repeat"),
      "Trigger Mode must expose hold-repeat",
    ).toBeTruthy();
    const repeatMenu = boxByVarname(boxes, "repeat-menu");
    const repeatEnum = repeatMenu?.saved_attribute_attributes?.valueof?.parameter_enum;
    expect(repeatEnum).toEqual(["motif", "exact", "1/4-bar", "1/2-bar", "1-bar"]);
    const repeatPrepend = boxByText(boxes, "prepend repeat_rounding");
    expect(
      repeatMenu && repeatPrepend && hasLine(lines, repeatMenu, 1, repeatPrepend, 0),
    ).toBeTruthy();
    expect(repeatPrepend && hasLine(lines, repeatPrepend, 0, v8!, 0)).toBeTruthy();

    const libraryPatcher = boxByText(boxes, "p library-info")?.patcher;
    expect(libraryPatcher, "Library/Info floating window subpatcher is required").toBeTruthy();

    expect(patcher.dependency_cache.map(({ name }) => name)).toEqual([
      engineFilename,
      previewFilename,
    ]);
    expect(!JSON.stringify(patcher).match(/motif-(?:device|preview)-v\d/i)).toBeTruthy();
    expect(
      !JSON.stringify(patcher).includes("file://"),
      "patch must not embed platform-specific file URLs",
    ).toBeTruthy();
    expect(
      !JSON.stringify(patcher).includes("Patcher:/"),
      "invalid Patcher:/ pseudo-path must not be generated",
    ).toBeTruthy();
    expect(
      !JSON.stringify(patcher).includes("prepend call receiveData"),
      "jweb state must use a bound inlet selector rather than JavaScript call injection",
    ).toBeTruthy();

    const nested = allBoxes(boxes);
    // Library window is now a single jweb object - check it exists.
    const jwebLibrary = nested.find((box) => box.varname === "jweb-library");
    expect(jwebLibrary, "library subpatcher must contain a jweb-library object").toBeTruthy();
    expect(jwebLibrary?.maxclass).toBe("jweb");
    expect(jwebLibrary?.patching_rect).toEqual([0, 0, libraryWindow.width, libraryWindow.height]);
    expect(jwebLibrary?.presentation_rect).toEqual([
      0,
      0,
      libraryWindow.width,
      libraryWindow.height,
    ]);
    expect(libraryPatcher!.rect).toEqual([100, 100, libraryWindow.width, libraryWindow.height]);
    expect(jwebLibrary!.url).toBe(undefined);
    expect(
      !JSON.stringify(libraryPatcher).includes("data:text/html"),
      "jweb must not receive a data URI",
    ).toBeTruthy();
    const libraryInlet = libraryPatcher!.boxes.find(({ box }) => box.maxclass === "inlet")?.box;
    const libraryInletRoute = boxByText(libraryPatcher!.boxes, "route library_page");
    const libraryReadfilePrepend = boxByText(libraryPatcher!.boxes, "prepend readfile");
    const libraryThispatcher = boxByText(libraryPatcher!.boxes, "thispatcher");
    const libraryRoute = boxByText(
      libraryPatcher!.boxes,
      "route choose_library library_ready web_debug lib_action url title",
    );
    const libraryReadyMessage = libraryPatcher!.boxes.find(
      ({ box }) => box.maxclass === "message" && box.text === "library_ready",
    )?.box;
    const libraryAction = boxByText(libraryPatcher!.boxes, "prepend lib_action");
    const libraryAuthorSend = boxByText(libraryPatcher!.boxes, "send ---motif_author");
    const libraryDebugSend = boxByText(libraryPatcher!.boxes, "send ---motif_web_debug");
    const libraryTitle = boxByText(libraryPatcher!.boxes, 'loadmess title "Motif Library"');
    const libraryReceiveData = boxByText(libraryPatcher!.boxes, "receive ---lib-data");
    expect(
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
    ).toBeTruthy();
    expect(jwebLibrary!.rendermode).toBe(1);
    expect(
      !("autosize" in jwebLibrary!),
      "library jweb must avoid undocumented sizing attributes",
    ).toBeTruthy();
    expect(hasLine(libraryPatcher!.lines, libraryInlet!, 0, libraryInletRoute!, 0)).toBeTruthy();
    expect(
      hasLine(libraryPatcher!.lines, libraryInletRoute!, 0, libraryReadfilePrepend!, 0),
    ).toBeTruthy();
    expect(
      hasLine(libraryPatcher!.lines, libraryReadfilePrepend!, 0, jwebLibrary!, 0),
    ).toBeTruthy();
    expect(
      hasLine(libraryPatcher!.lines, libraryInletRoute!, 1, libraryThispatcher!, 0),
    ).toBeTruthy();
    expect(hasLine(libraryPatcher!.lines, libraryReceiveData!, 0, jwebLibrary!, 0)).toBeTruthy();
    expect(hasLine(libraryPatcher!.lines, jwebLibrary!, 0, libraryRoute!, 0)).toBeTruthy();
    expect(hasLine(libraryPatcher!.lines, libraryRoute!, 1, libraryReadyMessage!, 0)).toBeTruthy();
    expect(
      hasLine(libraryPatcher!.lines, libraryReadyMessage!, 0, libraryAuthorSend!, 0),
    ).toBeTruthy();
    expect(hasLine(libraryPatcher!.lines, libraryRoute!, 2, libraryDebugSend!, 0)).toBeTruthy();
    expect(hasLine(libraryPatcher!.lines, libraryRoute!, 3, libraryAction!, 0)).toBeTruthy();

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
    expect(
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
    ).toBeTruthy();
    expect(
      hasLine(lines, infoTrigger!, 1, libraryClose!, 0),
      "each Info press must close the prior window first",
    ).toBeTruthy();
    expect(
      hasLine(lines, libraryClose!, 0, libraryPcontrol!, 0),
      "close must be sent to pcontrol",
    ).toBeTruthy();
    expect(
      hasLine(lines, infoTrigger!, 0, libraryReopenDefer!, 0),
      "reopening must wait until the close completes",
    ).toBeTruthy();
    expect(hasLine(lines, libraryReopenDefer!, 0, libraryOpenTrigger!, 0)).toBeTruthy();
    expect(
      hasLine(lines, libraryOpenTrigger!, 2, libraryOpen!, 0),
      "window must open before page preparation is deferred",
    ).toBeTruthy();
    expect(hasLine(lines, libraryOpenTrigger!, 1, libraryPrepareDefer!, 0)).toBeTruthy();
    expect(hasLine(lines, libraryPrepareDefer!, 0, libraryPrepare!, 0)).toBeTruthy();
    expect(hasLine(lines, libraryPrepare!, 0, v8!, 0)).toBeTruthy();
    expect(hasLine(lines, libraryEngineRoute!, 11, libraryPagePrepend!, 0)).toBeTruthy();
    expect(hasLine(lines, libraryPagePrepend!, 0, libraryInfo!, 0)).toBeTruthy();
    expect(
      hasLine(lines, libraryOpen!, 0, libraryPcontrol!, 0),
      "only open should be sent to pcontrol",
    ).toBeTruthy();
    for (const text of [
      "window flags float nogrow close zoom",
      libraryWindowSizeMessage,
      "window exec",
    ]) {
      for (const { box } of boxes.filter(({ box }) => box.text === text)) {
        expect(
          hasLine(lines, box, 0, libraryInfo!, 0),
          `${text} must be forwarded to the subpatch thispatcher`,
        ).toBeTruthy();
        expect(
          !hasLine(lines, box, 0, libraryPcontrol!, 0),
          `${text} must never be sent to pcontrol`,
        ).toBeTruthy();
      }
    }

    const libraryPathReceive = boxByText(boxes, "receive ---library_path");
    const libraryPathPattr = boxByText(
      boxes,
      "pattr motif_library_path @autorestore 0 @thru 0 @type symbol @parameter_enable 1 @parameter_mappable 0",
    );
    const libraryPathPrepend = boxByText(boxes, "prepend library_path");
    expect(libraryPathReceive && libraryPathPattr && libraryPathPrepend).toBeTruthy();
    expect(libraryPathPattr!.saved_attribute_attributes?.valueof?.parameter_type).toBe(3);
    expect(libraryPathPattr!.saved_attribute_attributes?.valueof?.parameter_invisible).toBe(1);
    expect(hasLine(lines, libraryPathReceive!, 0, libraryPathPattr!, 0)).toBeTruthy();
    expect(hasLine(lines, libraryPathReceive!, 0, libraryPathPrepend!, 0)).toBeTruthy();
    expect(hasLine(lines, libraryPathPattr!, 0, libraryPathPrepend!, 0)).toBeTruthy();

    const pathRestoreBang = boxes.find(
      ({ box }) =>
        box.maxclass === "message" &&
        box.text === "bang" &&
        hasLine(lines, box, 0, libraryPathPattr!, 0),
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
    expect(deviceStatePattr && stateRestoreBang && stateRestorePrepend && engineRoute).toBeTruthy();
    expect(deviceStatePattr!.saved_attribute_attributes?.valueof?.parameter_type).toBe(3);
    expect(deviceStatePattr!.saved_attribute_attributes?.valueof?.parameter_invisible).toBe(1);
    expect(hasLine(lines, deviceStatePattr!, 0, stateRestorePrepend!, 0)).toBeTruthy();
    expect(hasLine(lines, stateRestorePrepend!, 0, v8!, 0)).toBeTruthy();
    expect(hasLine(lines, engineRoute!, 12, deviceStatePattr!, 0)).toBeTruthy();

    const initOrder = boxByText(boxes, "t b b b b b b");
    const thisDevice = boxByText(boxes, "live.thisdevice");
    expect(pathRestoreBang && initOrder && thisDevice && parameterRestore).toBeTruthy();
    expect(hasLine(lines, thisDevice!, 0, initOrder!, 0)).toBeTruthy();
    expect(hasLine(lines, initOrder!, 5, pathRestoreBang!, 0)).toBeTruthy();
    expect(hasLine(lines, initOrder!, 4, stateRestoreBang!, 0)).toBeTruthy();
    expect(hasLine(lines, initOrder!, 3, parameterRestore!, 0)).toBeTruthy();

    const authorReceive = boxByText(boxes, "receive ---motif_author");
    const authorDefer = authorReceive
      ? boxes.find(({ box }) => box.text === "deferlow" && hasLine(lines, authorReceive, 0, box, 0))
          ?.box
      : undefined;
    expect(authorReceive && authorDefer).toBeTruthy();
    expect(hasLine(lines, authorDefer!, 0, v8!, 0)).toBeTruthy();

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
      expect(boxByVarname(boxes, varname)?.hidden).toBe(1);
    }
  });

  it("compiled Library page parses, targets ES2018, and binds receiveData before readiness", async () => {
    const libraryHtml = await readFile("max/library.html", "utf8");
    const script = libraryHtml.match(/<script>([\s\S]*?)<\/script>/)?.[1];
    expect(script, "production Library HTML must contain the compiled inline script").toBeTruthy();
    expect(() => new vm.Script(script!, { filename: "library.html" })).not.toThrow();
    expect(script, "Library JavaScript must be compiled to its ES2018 target").not.toMatch(
      /\?\.|\?\?|\binterface\b/,
    );
    const bindIndex = script!.search(/bindInlet\(\s*["']receiveData["']/);
    const readyIndex = script!.search(/outlet\(\s*["']library_ready["']/);
    expect(bindIndex >= 0, "library must bind the receiveData inlet").toBeTruthy();
    expect(
      readyIndex > bindIndex,
      "library must announce readiness after binding receiveData",
    ).toBeTruthy();
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
    expect(outletMessages.some((message) => message[1] === "preview_ready")).toBeTruthy();

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

    expect(errors.length).toBe(0);
    const velocityColor = context.velocityColor as (color: number[], velocity: number) => number[];
    const dim = Array.from(velocityColor([1, 0.55, 0.12, 1], 1));
    const bright = Array.from(velocityColor([1, 0.55, 0.12, 1], 127));
    expect(dim[0]! < bright[0]! && dim[1]! < bright[1]! && dim[2]! < bright[2]!).toBeTruthy();
    expect(dim[3]).toBe(bright[3]);
    expect(
      outletMessages.some((message) => message[1] === "preview_debug" && message[2] === "ok"),
    ).toBeTruthy();
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

    expect(
      midiin &&
        inputGate &&
        bypassDefault &&
        engineMode &&
        midiselect &&
        midiflush &&
        midiout &&
        readyRoute,
    ).toBeTruthy();
    expect(hasLine(lines, midiin!, 0, inputGate!, 1)).toBeTruthy();
    expect(hasLine(lines, bypassDefault!, 0, inputGate!, 0)).toBeTruthy();
    expect(
      hasLine(lines, inputGate!, 0, midiflush!, 0),
      "raw MIDI must bypass JavaScript before Ready",
    ).toBeTruthy();
    expect(
      hasLine(lines, inputGate!, 1, midiselect!, 0),
      "Ready mode must feed native MIDI selection",
    ).toBeTruthy();
    expect(
      hasLine(lines, midiselect!, 7, midiflush!, 0),
      "unselected raw MIDI must pass directly to output",
    ).toBeTruthy();
    expect(hasLine(lines, midiflush!, 0, midiout!, 0)).toBeTruthy();

    const readyTriggerId = lines.find(
      ({ patchline }) => patchline.source[0] === readyRoute!.id && patchline.source[1] === 0,
    )?.patchline.destination[0];
    const readyTrigger = boxes.find(({ box }) => box.id === readyTriggerId)?.box;
    expect(readyTrigger?.text).toBe("t b b b");
    expect(readyTrigger).toBeTruthy();
    expect(hasLine(lines, readyTrigger!, 1, engineMode!, 0)).toBeTruthy();
    expect(hasLine(lines, engineMode!, 0, inputGate!, 0)).toBeTruthy();
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

    expect(
      engineRoute &&
        panicTrigger &&
        clearTrigger &&
        clearMessage &&
        channelUzi &&
        channelTrigger &&
        controllerMessage &&
        panicMidiFormat &&
        midiflush,
    ).toBeTruthy();
    expect(hasLine(lines, engineRoute!, 1, panicTrigger!, 0)).toBeTruthy();
    expect(hasLine(lines, panicTrigger!, 2, clearMessage!, 0)).toBeTruthy();
    expect(hasLine(lines, panicTrigger!, 1, channelUzi!, 0)).toBeTruthy();
    expect(hasLine(lines, panicTrigger!, 0, midiflush!, 0)).toBeTruthy();
    expect(hasLine(lines, channelUzi!, 2, channelTrigger!, 0)).toBeTruthy();
    expect(hasLine(lines, channelTrigger!, 1, panicMidiFormat!, 6)).toBeTruthy();
    expect(hasLine(lines, channelTrigger!, 0, controllerMessage!, 0)).toBeTruthy();
    expect(hasLine(lines, panicMidiFormat!, 0, midiflush!, 0)).toBeTruthy();
    expect(hasLine(lines, engineRoute!, 2, clearTrigger!, 0)).toBeTruthy();
    expect(hasLine(lines, clearTrigger!, 1, clearMessage!, 0)).toBeTruthy();
    expect(hasLine(lines, clearTrigger!, 0, midiflush!, 0)).toBeTruthy();
  });

  it("compiled bundle uses one hand-written top-level Max dispatcher", async () => {
    const { source } = await loadCompiledEngine();
    expect(source.slice(0, 600)).toMatch(
      /var inlets\s*=\s*1;[\s\S]*var outlets\s*=\s*1;[\s\S]*function anything\(\)/,
    );
    expect(source).toMatch(/var message\s*=\s*messagename/);
    expect(source).toMatch(/arrayfromargs\(arguments\)/);
    expect(source).toMatch(/MotifEngine\.dispatch\(message,\s*args\)/);
    expect(source.slice(0, source.indexOf('"use strict";'))).not.toMatch(/function song_context\(/);
    expect(source).not.toMatch(/__motifHandlers/);
    expect(source).not.toMatch(/function host(?:_|\()/);
  });
});
