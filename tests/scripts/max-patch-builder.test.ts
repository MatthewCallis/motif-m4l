import { describe, it, expect } from "vitest";
import {
  MaxPatchBuilder,
  createEnumParameterAttributes,
  createHelpAttributes,
  createIntegerParameterAttributes,
  createMenuItems,
  createStoredBlobParameterAttributes,
  type MaxBuilderColors,
  type MaxBox,
  type MaxHelpInfo,
  type MaxRect,
  type MaxRgba,
} from "../../scripts/max-patch-builder.js";

const COLORS: MaxBuilderColors = {
  panel: [0.1, 0.1, 0.1, 1],
  text: [0.9, 0.9, 0.9, 1],
  muted: [0.5, 0.5, 0.5, 1],
  accent: [1, 0.5, 0, 1],
  previewBg: [0.05, 0.05, 0.05, 1],
  previewBorder: [0.2, 0.2, 0.2, 1],
};

const HELP: MaxHelpInfo = {
  name: "Control Name",
  description: "A complete control description.",
};

function createBuilder(): MaxPatchBuilder {
  return new MaxPatchBuilder({ fontName: "Ableton Sans", colors: COLORS });
}

function boxById(builder: MaxPatchBuilder, id: string): MaxBox {
  const box = builder.boxes.find((entry) => entry.box.id === id)?.box;
  expect(box, `missing box ${id}`).toBeTruthy();
  return box!;
}

describe("Max patch attribute helpers", () => {
  describe("createHelpAttributes", () => {
    it("creates the three Max and Live help attributes", () => {
      expect(createHelpAttributes(HELP)).toEqual({
        annotation_name: HELP.name,
        annotation: HELP.description,
        hint: HELP.description,
      });
    });

    it("rejects missing or blank help text", () => {
      expect(() => createHelpAttributes({ name: "", description: HELP.description })).toThrow(
        /help\.name must be a non-empty string/,
      );
      expect(() => createHelpAttributes({ name: HELP.name, description: "   " })).toThrow(
        /help\.description must be a non-empty string/,
      );
      expect(() =>
        createHelpAttributes({ name: 1 as unknown as string, description: HELP.description }),
      ).toThrow(/help\.name must be a non-empty string/);
    });
  });

  describe("createMenuItems", () => {
    it("encodes empty, single, and multiple-item menus", () => {
      expect(createMenuItems([])).toEqual([]);
      expect(createMenuItems(["One"])).toEqual(["One"]);
      expect(createMenuItems(["One", "Two", "Three"])).toEqual(["One", ",", "Two", ",", "Three"]);
    });

    it("rejects empty menu labels", () => {
      expect(() => createMenuItems(["One", ""])).toThrow(/menu item must be a non-empty string/);
    });
  });

  describe("createEnumParameterAttributes", () => {
    it("creates a zero-based enum with a validated initial index", () => {
      expect(createEnumParameterAttributes("Mode", "Mode", ["A", "B"], 1)).toEqual({
        valueof: {
          parameter_enum: ["A", "B"],
          parameter_longname: "Mode",
          parameter_mmax: 1,
          parameter_shortname: "Mode",
          parameter_type: 2,
          parameter_unitstyle: 9,
          parameter_initial_enable: 1,
          parameter_initial: [1],
        },
      });
      expect(
        createEnumParameterAttributes("Default", "Def", ["Only"]).valueof.parameter_initial,
      ).toEqual([0]);
    });

    it("can hide Song-owned enum helpers from Live parameter storage", () => {
      expect(
        createEnumParameterAttributes("Song Root", "Root", ["C", "C♯"], 0, 2).valueof
          .parameter_invisible,
      ).toBe(2);
    });

    it("rejects invalid names, values, and initial indices", () => {
      expect(() => createEnumParameterAttributes("", "Mode", ["A"])).toThrow(/parameter long name/);
      expect(() => createEnumParameterAttributes("Mode", "", ["A"])).toThrow(
        /parameter short name/,
      );
      expect(() => createEnumParameterAttributes("Mode", "Mode", [])).toThrow(/must not be empty/);
      expect(() => createEnumParameterAttributes("Mode", "Mode", [""])).toThrow(
        /enum parameter value/,
      );
      expect(() => createEnumParameterAttributes("Mode", "Mode", ["A"], -1)).toThrow(
        /between 0 and 0/,
      );
      expect(() => createEnumParameterAttributes("Mode", "Mode", ["A"], 1)).toThrow(
        /between 0 and 0/,
      );
      expect(() => createEnumParameterAttributes("Mode", "Mode", ["A"], 0.5)).toThrow(
        /between 0 and 0/,
      );
    });
  });

  describe("createStoredBlobParameterAttributes", () => {
    it("creates a Stored Only Blob parameter for opaque device state", () => {
      expect(
        createStoredBlobParameterAttributes("Motif Device State", "State", ["encoded"]),
      ).toEqual({
        valueof: {
          parameter_initial: ["encoded"],
          parameter_initial_enable: 1,
          parameter_invisible: 1,
          parameter_longname: "Motif Device State",
          parameter_shortname: "State",
          parameter_type: 3,
        },
      });
    });
  });

  describe("createIntegerParameterAttributes", () => {
    it("creates bounded integer parameter metadata", () => {
      expect(createIntegerParameterAttributes("MIDI Note", "Note", 60, 0, 127)).toEqual({
        valueof: {
          parameter_initial: [60],
          parameter_initial_enable: 1,
          parameter_longname: "MIDI Note",
          parameter_mmax: 127,
          parameter_mmin: 0,
          parameter_shortname: "Note",
          parameter_type: 1,
          parameter_unitstyle: 8,
        },
      });
    });

    it("rejects invalid ranges and initial values", () => {
      expect(() => createIntegerParameterAttributes("", "Note", 0, 0, 1)).toThrow(
        /parameter long name/,
      );
      expect(() => createIntegerParameterAttributes("Note", "", 0, 0, 1)).toThrow(
        /parameter short name/,
      );
      expect(() => createIntegerParameterAttributes("Note", "Note", 0, Number.NaN, 1)).toThrow(
        /minimum/,
      );
      expect(() =>
        createIntegerParameterAttributes("Note", "Note", 0, 0, Number.POSITIVE_INFINITY),
      ).toThrow(/maximum/);
      expect(() => createIntegerParameterAttributes("Note", "Note", 0, 2, 1)).toThrow(
        /must not exceed/,
      );
      expect(() => createIntegerParameterAttributes("Note", "Note", -1, 0, 1)).toThrow(
        /between 0 and 1/,
      );
      expect(() => createIntegerParameterAttributes("Note", "Note", 2, 0, 1)).toThrow(
        /between 0 and 1/,
      );
      expect(() => createIntegerParameterAttributes("Note", "Note", 0.5, 0, 1)).toThrow(
        /between 0 and 1/,
      );
    });
  });
});

describe("MaxPatchBuilder", () => {
  describe("construction and generic boxes", () => {
    it("validates shared font and color configuration", () => {
      const builder = createBuilder();
      expect(builder.fontName).toBe("Ableton Sans");
      expect(builder.colors).toBe(COLORS);

      expect(() => new MaxPatchBuilder({ fontName: "", colors: COLORS })).toThrow(/fontName/);
      expect(
        () =>
          new MaxPatchBuilder({
            fontName: "Ableton Sans",
            colors: { ...COLORS, panel: [0, 0, 0] as unknown as MaxRgba },
          }),
      ).toThrow(/four RGBA values/);
      expect(
        () =>
          new MaxPatchBuilder({
            fontName: "Ableton Sans",
            colors: { ...COLORS, panel: [0, 0, Number.NaN, 1] },
          }),
      ).toThrow(/finite number/);
      expect(
        () =>
          new MaxPatchBuilder({
            fontName: "Ableton Sans",
            colors: { ...COLORS, panel: [0, 0, 2, 1] },
          }),
      ).toThrow(/between 0 and 1/);
    });

    it("adds immutable core box identity and validates names and rectangles", () => {
      const builder = createBuilder();
      const rect: MaxRect = [-10, 20, 30, 40];
      const id = builder.addBox("generic", "toggle", rect, {
        id: "attempted-override",
        maxclass: "button",
        patching_rect: [0, 0, 1, 1],
        hidden: 1,
      });
      rect[0] = 999;

      expect(id).toBe("obj-1");
      expect(boxById(builder, id)).toEqual({
        id: "obj-1",
        maxclass: "toggle",
        patching_rect: [-10, 20, 30, 40],
        hidden: 1,
      });
      expect(() => builder.addBox("generic", "toggle", [0, 0, 1, 1])).toThrow(/Duplicate/);
      expect(() => builder.addBox("", "toggle", [0, 0, 1, 1])).toThrow(/box name/);
      expect(() => builder.addBox("blank-class", "", [0, 0, 1, 1])).toThrow(/maxclass/);
      expect(() => builder.addBox("nan", "toggle", [0, 0, Number.NaN, 1])).toThrow(/finite number/);
      expect(() => builder.addBox("negative", "toggle", [0, 0, -1, 1])).toThrow(/non-negative/);
    });

    it("adds newobj and message boxes with default and custom sizes", () => {
      const builder = createBuilder();
      const objectId = builder.addObject("object", "pack 0 0", 1, 2, 140, { numinlets: 2 });
      const defaultObjectId = builder.addObject("default-object", "bangbang", 3, 4);
      const messageId = builder.addMessage("message", "clear", 5, 6, 70);
      const defaultMessageId = builder.addMessage("default-message", "bang", 7, 8);

      expect(boxById(builder, objectId)).toEqual({
        id: objectId,
        maxclass: "newobj",
        patching_rect: [1, 2, 140, 22],
        text: "pack 0 0",
        numinlets: 2,
      });
      expect(boxById(builder, defaultObjectId).patching_rect).toEqual([3, 4, 120, 22]);
      expect(boxById(builder, messageId).patching_rect).toEqual([5, 6, 70, 22]);
      expect(boxById(builder, defaultMessageId).patching_rect).toEqual([7, 8, 90, 22]);
      expect(() => builder.addObject("bad-object", "", 0, 0)).toThrow(/object text/);
      expect(() => builder.addMessage("bad-message", "", 0, 0)).toThrow(/message text/);
    });

    it("shares IDs but not scripting names with child patchers", () => {
      const parent = createBuilder();
      expect(parent.addBox("same-name", "button", [0, 0, 1, 1])).toBe("obj-1");
      const child = parent.createChild();
      expect(child.addBox("same-name", "button", [0, 0, 1, 1])).toBe("obj-2");
      expect(parent.boxes.length).toBe(1);
      expect(child.boxes.length).toBe(1);
    });
  });

  describe("specialized Max and Live UI objects", () => {
    it("adds panels with documented presentation attributes", () => {
      const builder = createBuilder();
      const defaultId = builder.addPanel("default-panel", [1, 2, 3, 4]);
      const customId = builder.addPanel("custom-panel", [5, 6, 7, 8], {
        bgcolor: [0.3, 0.4, 0.5, 1],
        rounded: 4,
        hidden: 1,
      });

      expect(boxById(builder, defaultId)).toEqual({
        id: defaultId,
        maxclass: "panel",
        patching_rect: [1, 2, 3, 4],
        background: 1,
        border: 0,
        bgcolor: COLORS.panel,
        rounded: 0,
        presentation: 1,
        presentation_rect: [1, 2, 3, 4],
        varname: "default-panel",
        hidden: 0,
      });
      expect(boxById(builder, customId).hidden).toBe(1);
      expect(boxById(builder, customId).rounded).toBe(4);
    });

    it("adds comments with defaults, optional help, and custom typography", () => {
      const builder = createBuilder();
      const defaultId = builder.addComment("default-comment", "Default", [0, 0, 100, 20]);
      const customId = builder.addComment("custom-comment", "Custom", [0, 20, 100, 20], {
        fontsize: 12,
        fontface: 1,
        textcolor: [0.2, 0.3, 0.4, 1],
        justification: 2,
        linecount: 2,
        ignoreclick: 0,
        hidden: 1,
        help: HELP,
      });

      const defaultBox = boxById(builder, defaultId);
      expect(defaultBox.fontsize).toBe(10);
      expect(defaultBox.fontface).toBe(0);
      expect(defaultBox.textjustification).toBe(0);
      expect(defaultBox.ignoreclick).toBe(1);
      expect(defaultBox.annotation).toBe(undefined);

      const customBox = boxById(builder, customId);
      expect(customBox.fontsize).toBe(12);
      expect(customBox.fontface).toBe(1);
      expect(customBox.textjustification).toBe(2);
      expect(customBox.linecount).toBe(2);
      expect(customBox.annotation_name).toBe(HELP.name);
    });

    it("adds styled dynamic umenus with default and custom interaction attributes", () => {
      const builder = createBuilder();
      const defaultId = builder.addDynamicMenu("default-menu", ["One"], [1, 2, 100, 20], HELP);
      const customId = builder.addDynamicMenu(
        "custom-menu",
        ["One", "Two"],
        [1, 24, 100, 20],
        HELP,
        {
          fontsize: 11,
          ignoreclick: 1,
          hidden: 1,
        },
      );
      const defaultBox = boxById(builder, defaultId);
      const customBox = boxById(builder, customId);
      expect(defaultBox.fontsize).toBe(10);
      expect(defaultBox.ignoreclick).toBe(0);
      expect(defaultBox.hidden).toBe(0);
      expect(customBox.maxclass).toBe("umenu");
      expect(customBox.items).toEqual(["One", ",", "Two"]);
      expect(customBox.fontsize).toBe(11);
      expect(customBox.ignoreclick).toBe(1);
      expect(customBox.hidden).toBe(1);
      expect(customBox.annotation_name).toBe(HELP.name);
    });

    it("adds live.menu with parameter metadata and theme-owned chrome", () => {
      const builder = createBuilder();
      const defaultId = builder.addLiveMenu(
        "default-live-menu",
        ["A", "B"],
        [0, 0, 100, 20],
        "Mode",
        "Mode",
        0,
        HELP,
      );
      const customId = builder.addLiveMenu(
        "custom-live-menu",
        ["A", "B"],
        [0, 20, 100, 20],
        "Mode 2",
        "Mode2",
        1,
        HELP,
        {
          parameter_enable: 0,
          ignoreclick: 1,
          hidden: 1,
        },
      );

      expect(boxById(builder, defaultId).parameter_enable).toBe(1);
      expect(boxById(builder, defaultId).ignoreclick).toBe(0);
      expect(boxById(builder, customId).parameter_enable).toBe(0);
      expect(boxById(builder, customId).ignoreclick).toBe(1);
      expect(boxById(builder, customId).hidden).toBe(1);
    });

    it("adds live.comment labels", () => {
      const builder = createBuilder();
      const defaultId = builder.addLiveComment("default-label", "Label", [0, 0, 40, 20]);
      const hiddenId = builder.addLiveComment("hidden-label", "Hidden", [0, 20, 40, 20], {
        hidden: 1,
      });
      expect(boxById(builder, defaultId).maxclass).toBe("live.comment");
      expect(boxById(builder, defaultId).hidden).toBe(0);
      expect(boxById(builder, hiddenId).hidden).toBe(1);
    });

    it("adds parameter-enabled live.text toggles with a stored initial value", () => {
      const builder = createBuilder();
      const toggleId = builder.addLiveTextButton("toggle", "Toggle", [0, 0, 70, 20], HELP, {
        mode: 1,
        parameter: {
          longName: "Transform Toggle",
          shortName: "Toggle",
          initial: 0,
        },
      });
      const momentaryId = builder.addLiveTextButton(
        "momentary",
        "Momentary",
        [0, 20, 70, 20],
        HELP,
      );

      const toggle = boxById(builder, toggleId);
      expect(toggle.parameter_enable).toBe(1);
      expect(
        (
          toggle.saved_attribute_attributes as {
            valueof: { parameter_initial: number[]; parameter_mmax: number };
          }
        ).valueof,
      ).toEqual({
        parameter_initial: [0],
        parameter_initial_enable: 1,
        parameter_longname: "Transform Toggle",
        parameter_mmax: 1,
        parameter_mmin: 0,
        parameter_shortname: "Toggle",
        parameter_type: 1,
        parameter_unitstyle: 8,
      });
      expect(boxById(builder, momentaryId).parameter_enable).toBe(0);
    });

    it("adds live.tab controls with enum parameter metadata", () => {
      const builder = createBuilder();
      const defaultId = builder.addLiveTab(
        "default-tab",
        ["A", "B"],
        [0, 0, 100, 20],
        "Tab",
        "Tab",
        0,
        HELP,
      );
      const hiddenId = builder.addLiveTab(
        "hidden-tab",
        ["A", "B"],
        [0, 20, 100, 20],
        "Tab 2",
        "Tab2",
        1,
        HELP,
        { hidden: 1 },
      );
      expect(boxById(builder, defaultId).livemode).toBe(1);
      expect(boxById(builder, defaultId).hidden).toBe(0);
      expect(boxById(builder, hiddenId).hidden).toBe(1);
    });

    it("adds live.numbox controls with default and custom ranges", () => {
      const builder = createBuilder();
      const defaultId = builder.addLiveNumber(
        "default-number",
        [0, 0, 50, 20],
        "Note",
        "Note",
        60,
        HELP,
      );
      const customId = builder.addLiveNumber(
        "custom-number",
        [0, 20, 50, 20],
        "Channel",
        "Ch",
        8,
        HELP,
        {
          minimum: 1,
          maximum: 16,
          hidden: 1,
        },
      );
      const defaultValue = boxById(builder, defaultId).saved_attribute_attributes as {
        valueof: { parameter_mmin: number; parameter_mmax: number };
      };
      const customValue = boxById(builder, customId).saved_attribute_attributes as {
        valueof: { parameter_mmin: number; parameter_mmax: number };
      };
      expect(defaultValue.valueof).toEqual({
        ...defaultValue.valueof,
        parameter_mmin: 0,
        parameter_mmax: 127,
      });
      expect(customValue.valueof.parameter_mmin).toBe(1);
      expect(customValue.valueof.parameter_mmax).toBe(16);
      expect(boxById(builder, customId).hidden).toBe(1);
    });

    it("adds momentary and toggle live.text buttons", () => {
      const builder = createBuilder();
      const defaultId = builder.addLiveTextButton("default-button", "Run", [0, 0, 50, 20], HELP);
      const customId = builder.addLiveTextButton("custom-button", "Stop", [0, 20, 50, 20], HELP, {
        fontsize: 12,
        hidden: 1,
        mode: 1,
      });
      expect(boxById(builder, defaultId).outputmode).toBe(0);
      expect(boxById(builder, defaultId).mode).toBe(0);
      expect(boxById(builder, defaultId).fontsize).toBe(10);
      expect(boxById(builder, customId).fontsize).toBe(12);
      expect(boxById(builder, customId).hidden).toBe(1);
      expect(boxById(builder, customId).mode).toBe(1);
      expect(boxById(builder, customId).outputmode).toBe(0);
    });

    it("adds patch-only comments", () => {
      const builder = createBuilder();
      const defaultId = builder.addPatchComment("default-section", "§ Default", 1, 2);
      const customId = builder.addPatchComment("custom-section", "§ Custom", 3, 4, 300);
      expect(boxById(builder, defaultId).patching_rect).toEqual([1, 2, 240, 20]);
      expect(boxById(builder, customId).patching_rect).toEqual([3, 4, 300, 20]);
      expect(boxById(builder, customId).presentation).toBe(0);
    });

    it("adds jsui previews with matching patching and presentation rectangles", () => {
      const builder = createBuilder();
      const defaultId = builder.addJsuiPreview("default-preview", [1, 2, 300, 80], HELP);
      const customId = builder.addJsuiPreview("custom-preview", [3, 4, 320, 90], HELP, {
        filename: "custom-preview.js",
        hidden: 1,
        border: 1,
        rounded: 8,
      });
      const defaultBox = boxById(builder, defaultId);
      expect(defaultBox.filename).toBe("motif-preview.js");
      expect(defaultBox.template).toBe("motif-preview.js");
      expect(defaultBox.patching_rect).toEqual(defaultBox.presentation_rect);
      expect(defaultBox.border).toBe(0);
      expect(defaultBox.jsarguments).toBe(undefined);

      const customBox = boxById(builder, customId);
      expect(customBox.filename).toBe("custom-preview.js");
      expect(customBox.template).toBe("custom-preview.js");
      expect(customBox.hidden).toBe(1);
      expect(customBox.jsarguments).toEqual([8, 1]);
    });
  });

  describe("connections and tab visibility", () => {
    it("connects named boxes and direct IDs with optional ordering", () => {
      const builder = createBuilder();
      const sourceId = builder.addBox("source", "button", [0, 0, 10, 10]);
      const destinationId = builder.addBox("destination", "button", [20, 0, 10, 10]);
      builder.connect("source", 0, "destination", 1);
      builder.connect(sourceId, 2, destinationId, 3, 4);

      expect(builder.lines).toEqual([
        { patchline: { source: [sourceId, 0], destination: [destinationId, 1] } },
        { patchline: { source: [sourceId, 2], destination: [destinationId, 3], order: 4 } },
      ]);
    });

    it("rejects unknown endpoints and invalid port metadata", () => {
      const builder = createBuilder();
      builder.addBox("source", "button", [0, 0, 10, 10]);
      builder.addBox("destination", "button", [20, 0, 10, 10]);

      expect(() => builder.connect("missing", 0, "destination", 0)).toThrow(
        /Unknown Max box reference/,
      );
      expect(() => builder.connect("source", 0, "missing", 0)).toThrow(/Unknown Max box reference/);
      expect(() => builder.connect("", 0, "destination", 0)).toThrow(/object reference/);
      expect(() => builder.connect("source", -1, "destination", 0)).toThrow(/source outlet/);
      expect(() => builder.connect("source", 0.5, "destination", 0)).toThrow(/source outlet/);
      expect(() => builder.connect("source", 0, "destination", -1)).toThrow(/destination inlet/);
      expect(() => builder.connect("source", 0, "destination", 0, -1)).toThrow(/patchline order/);
    });

    it("wires hide/show messages across multiple layout columns", () => {
      const builder = createBuilder();
      builder.addBox("trigger", "button", [0, 0, 10, 10]);
      builder.addObject("thispatcher", "thispatcher", 0, 20);
      const hideNames = Array.from({ length: 13 }, (_, index) => `hide-${index}`);
      const showNames = ["show-0", "show-1"];
      for (const name of [...hideNames, ...showNames]) {
        builder.addBox(name, "panel", [0, 0, 10, 10]);
      }

      builder.wireTabVisibility("trigger", hideNames, showNames, 100, 200);

      const fan = builder.boxes.find(
        ({ box }) => box.text === `t ${Array.from({ length: 15 }, () => "b").join(" ")}`,
      )?.box;
      expect(fan).toBeTruthy();
      expect(
        builder.boxes.find(({ box }) => box.text === "script sendbox hide-12 hidden 1")?.box
          .patching_rect,
      ).toEqual([540, 200, 260, 22]);
      expect(
        builder.boxes.some(({ box }) => box.text === "script sendbox show-1 hidden 0"),
      ).toBeTruthy();
      expect(builder.lines.length).toBe(31);
    });

    it("rejects empty visibility groups and unknown controls", () => {
      const empty = createBuilder();
      expect(() => empty.wireTabVisibility("trigger", [], [], 0, 0)).toThrow(/at least one target/);

      const missingTrigger = createBuilder();
      missingTrigger.addObject("thispatcher", "thispatcher", 0, 0);
      missingTrigger.addBox("target", "panel", [0, 0, 10, 10]);
      expect(() => missingTrigger.wireTabVisibility("trigger", ["target"], [], 0, 0)).toThrow(
        /Unknown Max box reference/,
      );

      const missingTarget = createBuilder();
      missingTarget.addBox("trigger", "button", [0, 0, 10, 10]);
      missingTarget.addObject("thispatcher", "thispatcher", 0, 0);
      expect(() => missingTarget.wireTabVisibility("trigger", ["target"], [], 0, 0)).toThrow(
        /Unknown Max box reference/,
      );

      const missingThispatcher = createBuilder();
      missingThispatcher.addBox("trigger", "button", [0, 0, 10, 10]);
      missingThispatcher.addBox("target", "panel", [0, 0, 10, 10]);
      expect(() => missingThispatcher.wireTabVisibility("trigger", ["target"], [], 0, 0)).toThrow(
        /thispatcher/,
      );
    });
  });
});
