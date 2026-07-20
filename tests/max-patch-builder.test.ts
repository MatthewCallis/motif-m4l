import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  MaxPatchBuilder,
  createEnumParameterAttributes,
  createHelpAttributes,
  createIntegerParameterAttributes,
  createMenuItems,
  type MaxBuilderColors,
  type MaxBox,
  type MaxHelpInfo,
  type MaxRect,
  type MaxRgba,
} from '../scripts/max-patch-builder.js';

const COLORS: MaxBuilderColors = {
  panel: [0.1, 0.1, 0.1, 1],
  text: [0.9, 0.9, 0.9, 1],
  muted: [0.5, 0.5, 0.5, 1],
  accent: [1, 0.5, 0, 1],
  previewBg: [0.05, 0.05, 0.05, 1],
  previewBorder: [0.2, 0.2, 0.2, 1],
};

const HELP: MaxHelpInfo = {
  name: 'Control Name',
  description: 'A complete control description.',
};

function createBuilder(): MaxPatchBuilder {
  return new MaxPatchBuilder({ fontName: 'Ableton Sans', colors: COLORS });
}

function boxById(builder: MaxPatchBuilder, id: string): MaxBox {
  const box = builder.boxes.find((entry) => entry.box.id === id)?.box;
  assert.ok(box, `missing box ${id}`);
  return box;
}

describe('Max patch attribute helpers', () => {
  describe('createHelpAttributes', () => {
    it('creates the three Max and Live help attributes', () => {
      assert.deepEqual(createHelpAttributes(HELP), {
        annotation_name: HELP.name,
        annotation: HELP.description,
        hint: HELP.description,
      });
    });

    it('rejects missing or blank help text', () => {
      assert.throws(
        () => createHelpAttributes({ name: '', description: HELP.description }),
        /help\.name must be a non-empty string/,
      );
      assert.throws(
        () => createHelpAttributes({ name: HELP.name, description: '   ' }),
        /help\.description must be a non-empty string/,
      );
      assert.throws(
        () => createHelpAttributes({ name: 1 as unknown as string, description: HELP.description }),
        /help\.name must be a non-empty string/,
      );
    });
  });

  describe('createMenuItems', () => {
    it('encodes empty, single, and multiple-item menus', () => {
      assert.deepEqual(createMenuItems([]), []);
      assert.deepEqual(createMenuItems(['One']), ['One']);
      assert.deepEqual(createMenuItems(['One', 'Two', 'Three']), ['One', ',', 'Two', ',', 'Three']);
    });

    it('rejects empty menu labels', () => {
      assert.throws(() => createMenuItems(['One', '']), /menu item must be a non-empty string/);
    });
  });

  describe('createEnumParameterAttributes', () => {
    it('creates a zero-based enum with a validated initial index', () => {
      assert.deepEqual(createEnumParameterAttributes('Mode', 'Mode', ['A', 'B'], 1), {
        valueof: {
          parameter_enum: ['A', 'B'],
          parameter_longname: 'Mode',
          parameter_mmax: 1,
          parameter_shortname: 'Mode',
          parameter_type: 2,
          parameter_unitstyle: 9,
          parameter_initial_enable: 1,
          parameter_initial: [1],
        },
      });
      assert.deepEqual(
        createEnumParameterAttributes('Default', 'Def', ['Only']).valueof.parameter_initial,
        [0],
      );
    });

    it('rejects invalid names, values, and initial indices', () => {
      assert.throws(() => createEnumParameterAttributes('', 'Mode', ['A']), /parameter long name/);
      assert.throws(() => createEnumParameterAttributes('Mode', '', ['A']), /parameter short name/);
      assert.throws(() => createEnumParameterAttributes('Mode', 'Mode', []), /must not be empty/);
      assert.throws(() => createEnumParameterAttributes('Mode', 'Mode', ['']), /enum parameter value/);
      assert.throws(() => createEnumParameterAttributes('Mode', 'Mode', ['A'], -1), /between 0 and 0/);
      assert.throws(() => createEnumParameterAttributes('Mode', 'Mode', ['A'], 1), /between 0 and 0/);
      assert.throws(() => createEnumParameterAttributes('Mode', 'Mode', ['A'], 0.5), /between 0 and 0/);
    });
  });

  describe('createIntegerParameterAttributes', () => {
    it('creates bounded integer parameter metadata', () => {
      assert.deepEqual(createIntegerParameterAttributes('MIDI Note', 'Note', 60, 0, 127), {
        valueof: {
          parameter_initial: [60],
          parameter_initial_enable: 1,
          parameter_longname: 'MIDI Note',
          parameter_mmax: 127,
          parameter_mmin: 0,
          parameter_shortname: 'Note',
          parameter_type: 1,
          parameter_unitstyle: 8,
        },
      });
    });

    it('rejects invalid ranges and initial values', () => {
      assert.throws(() => createIntegerParameterAttributes('', 'Note', 0, 0, 1), /parameter long name/);
      assert.throws(() => createIntegerParameterAttributes('Note', '', 0, 0, 1), /parameter short name/);
      assert.throws(() => createIntegerParameterAttributes('Note', 'Note', 0, Number.NaN, 1), /minimum/);
      assert.throws(() => createIntegerParameterAttributes('Note', 'Note', 0, 0, Number.POSITIVE_INFINITY), /maximum/);
      assert.throws(() => createIntegerParameterAttributes('Note', 'Note', 0, 2, 1), /must not exceed/);
      assert.throws(() => createIntegerParameterAttributes('Note', 'Note', -1, 0, 1), /between 0 and 1/);
      assert.throws(() => createIntegerParameterAttributes('Note', 'Note', 2, 0, 1), /between 0 and 1/);
      assert.throws(() => createIntegerParameterAttributes('Note', 'Note', 0.5, 0, 1), /between 0 and 1/);
    });
  });
});

describe('MaxPatchBuilder', () => {
  describe('construction and generic boxes', () => {
    it('validates shared font and color configuration', () => {
      const builder = createBuilder();
      assert.equal(builder.fontName, 'Ableton Sans');
      assert.equal(builder.colors, COLORS);

      assert.throws(() => new MaxPatchBuilder({ fontName: '', colors: COLORS }), /fontName/);
      assert.throws(
        () => new MaxPatchBuilder({
          fontName: 'Ableton Sans',
          colors: { ...COLORS, panel: [0, 0, 0] as unknown as MaxRgba },
        }),
        /four RGBA values/,
      );
      assert.throws(
        () => new MaxPatchBuilder({
          fontName: 'Ableton Sans',
          colors: { ...COLORS, panel: [0, 0, Number.NaN, 1] },
        }),
        /finite number/,
      );
      assert.throws(
        () => new MaxPatchBuilder({
          fontName: 'Ableton Sans',
          colors: { ...COLORS, panel: [0, 0, 2, 1] },
        }),
        /between 0 and 1/,
      );
    });

    it('adds immutable core box identity and validates names and rectangles', () => {
      const builder = createBuilder();
      const rect: MaxRect = [-10, 20, 30, 40];
      const id = builder.addBox('generic', 'toggle', rect, {
        id: 'attempted-override',
        maxclass: 'button',
        patching_rect: [0, 0, 1, 1],
        hidden: 1,
      });
      rect[0] = 999;

      assert.equal(id, 'obj-1');
      assert.deepEqual(boxById(builder, id), {
        id: 'obj-1',
        maxclass: 'toggle',
        patching_rect: [-10, 20, 30, 40],
        hidden: 1,
      });
      assert.throws(() => builder.addBox('generic', 'toggle', [0, 0, 1, 1]), /Duplicate/);
      assert.throws(() => builder.addBox('', 'toggle', [0, 0, 1, 1]), /box name/);
      assert.throws(() => builder.addBox('blank-class', '', [0, 0, 1, 1]), /maxclass/);
      assert.throws(() => builder.addBox('nan', 'toggle', [0, 0, Number.NaN, 1]), /finite number/);
      assert.throws(() => builder.addBox('negative', 'toggle', [0, 0, -1, 1]), /non-negative/);
    });

    it('adds newobj and message boxes with default and custom sizes', () => {
      const builder = createBuilder();
      const objectId = builder.addObject('object', 'pack 0 0', 1, 2, 140, { numinlets: 2 });
      const defaultObjectId = builder.addObject('default-object', 'bangbang', 3, 4);
      const messageId = builder.addMessage('message', 'clear', 5, 6, 70);
      const defaultMessageId = builder.addMessage('default-message', 'bang', 7, 8);

      assert.deepEqual(boxById(builder, objectId), {
        id: objectId,
        maxclass: 'newobj',
        patching_rect: [1, 2, 140, 22],
        text: 'pack 0 0',
        numinlets: 2,
      });
      assert.deepEqual(boxById(builder, defaultObjectId).patching_rect, [3, 4, 120, 22]);
      assert.deepEqual(boxById(builder, messageId).patching_rect, [5, 6, 70, 22]);
      assert.deepEqual(boxById(builder, defaultMessageId).patching_rect, [7, 8, 90, 22]);
      assert.throws(() => builder.addObject('bad-object', '', 0, 0), /object text/);
      assert.throws(() => builder.addMessage('bad-message', '', 0, 0), /message text/);
    });

    it('shares IDs but not scripting names with child patchers', () => {
      const parent = createBuilder();
      assert.equal(parent.addBox('same-name', 'button', [0, 0, 1, 1]), 'obj-1');
      const child = parent.createChild();
      assert.equal(child.addBox('same-name', 'button', [0, 0, 1, 1]), 'obj-2');
      assert.equal(parent.boxes.length, 1);
      assert.equal(child.boxes.length, 1);
    });
  });

  describe('specialized Max and Live UI objects', () => {
    it('adds panels with documented presentation attributes', () => {
      const builder = createBuilder();
      const defaultId = builder.addPanel('default-panel', [1, 2, 3, 4]);
      const customId = builder.addPanel('custom-panel', [5, 6, 7, 8], {
        bgcolor: [0.3, 0.4, 0.5, 1],
        rounded: 4,
        hidden: 1,
      });

      assert.deepEqual(boxById(builder, defaultId), {
        id: defaultId,
        maxclass: 'panel',
        patching_rect: [1, 2, 3, 4],
        background: 1,
        border: 0,
        bgcolor: COLORS.panel,
        rounded: 0,
        presentation: 1,
        presentation_rect: [1, 2, 3, 4],
        varname: 'default-panel',
        hidden: 0,
      });
      assert.equal(boxById(builder, customId).hidden, 1);
      assert.equal(boxById(builder, customId).rounded, 4);
    });

    it('adds comments with defaults, optional help, and custom typography', () => {
      const builder = createBuilder();
      const defaultId = builder.addComment('default-comment', 'Default', [0, 0, 100, 20]);
      const customId = builder.addComment('custom-comment', 'Custom', [0, 20, 100, 20], {
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
      assert.equal(defaultBox.fontsize, 10);
      assert.equal(defaultBox.fontface, 0);
      assert.equal(defaultBox.textjustification, 0);
      assert.equal(defaultBox.ignoreclick, 1);
      assert.equal(defaultBox.annotation, undefined);

      const customBox = boxById(builder, customId);
      assert.equal(customBox.fontsize, 12);
      assert.equal(customBox.fontface, 1);
      assert.equal(customBox.textjustification, 2);
      assert.equal(customBox.linecount, 2);
      assert.equal(customBox.annotation_name, HELP.name);
    });

    it('adds styled dynamic umenus with default and custom interaction attributes', () => {
      const builder = createBuilder();
      const defaultId = builder.addDynamicMenu('default-menu', ['One'], [1, 2, 100, 20], HELP);
      const customId = builder.addDynamicMenu('custom-menu', ['One', 'Two'], [1, 24, 100, 20], HELP, {
        fontsize: 11,
        ignoreclick: 1,
        hidden: 1,
      });
      const defaultBox = boxById(builder, defaultId);
      const customBox = boxById(builder, customId);
      assert.equal(defaultBox.fontsize, 10);
      assert.equal(defaultBox.ignoreclick, 0);
      assert.equal(defaultBox.hidden, 0);
      assert.equal(customBox.maxclass, 'umenu');
      assert.deepEqual(customBox.items, ['One', ',', 'Two']);
      assert.equal(customBox.fontsize, 11);
      assert.equal(customBox.ignoreclick, 1);
      assert.equal(customBox.hidden, 1);
      assert.equal(customBox.annotation_name, HELP.name);
    });

    it('adds live.menu with parameter metadata and theme-owned chrome', () => {
      const builder = createBuilder();
      const defaultId = builder.addLiveMenu('default-live-menu', ['A', 'B'], [0, 0, 100, 20], 'Mode', 'Mode', 0, HELP);
      const customId = builder.addLiveMenu('custom-live-menu', ['A', 'B'], [0, 20, 100, 20], 'Mode 2', 'Mode2', 1, HELP, {
        parameter_enable: 0,
        ignoreclick: 1,
        hidden: 1,
      });

      assert.equal(boxById(builder, defaultId).parameter_enable, 1);
      assert.equal(boxById(builder, defaultId).ignoreclick, 0);
      assert.equal(boxById(builder, customId).parameter_enable, 0);
      assert.equal(boxById(builder, customId).ignoreclick, 1);
      assert.equal(boxById(builder, customId).hidden, 1);
    });

    it('adds live.comment labels', () => {
      const builder = createBuilder();
      const defaultId = builder.addLiveComment('default-label', 'Label', [0, 0, 40, 20]);
      const hiddenId = builder.addLiveComment('hidden-label', 'Hidden', [0, 20, 40, 20], { hidden: 1 });
      assert.equal(boxById(builder, defaultId).maxclass, 'live.comment');
      assert.equal(boxById(builder, defaultId).hidden, 0);
      assert.equal(boxById(builder, hiddenId).hidden, 1);
    });

    it('adds live.tab controls with enum parameter metadata', () => {
      const builder = createBuilder();
      const defaultId = builder.addLiveTab('default-tab', ['A', 'B'], [0, 0, 100, 20], 'Tab', 'Tab', 0, HELP);
      const hiddenId = builder.addLiveTab('hidden-tab', ['A', 'B'], [0, 20, 100, 20], 'Tab 2', 'Tab2', 1, HELP, { hidden: 1 });
      assert.equal(boxById(builder, defaultId).livemode, 1);
      assert.equal(boxById(builder, defaultId).hidden, 0);
      assert.equal(boxById(builder, hiddenId).hidden, 1);
    });

    it('adds live.numbox controls with default and custom ranges', () => {
      const builder = createBuilder();
      const defaultId = builder.addLiveNumber('default-number', [0, 0, 50, 20], 'Note', 'Note', 60, HELP);
      const customId = builder.addLiveNumber('custom-number', [0, 20, 50, 20], 'Channel', 'Ch', 8, HELP, {
        minimum: 1,
        maximum: 16,
        hidden: 1,
      });
      const defaultValue = boxById(builder, defaultId).saved_attribute_attributes as {
        valueof: { parameter_mmin: number; parameter_mmax: number };
      };
      const customValue = boxById(builder, customId).saved_attribute_attributes as {
        valueof: { parameter_mmin: number; parameter_mmax: number };
      };
      assert.deepEqual(defaultValue.valueof, { ...defaultValue.valueof, parameter_mmin: 0, parameter_mmax: 127 });
      assert.equal(customValue.valueof.parameter_mmin, 1);
      assert.equal(customValue.valueof.parameter_mmax, 16);
      assert.equal(boxById(builder, customId).hidden, 1);
    });

    it('adds live.text momentary buttons', () => {
      const builder = createBuilder();
      const defaultId = builder.addLiveTextButton('default-button', 'Run', [0, 0, 50, 20], HELP);
      const customId = builder.addLiveTextButton('custom-button', 'Stop', [0, 20, 50, 20], HELP, {
        fontsize: 12,
        hidden: 1,
      });
      assert.equal(boxById(builder, defaultId).outputmode, 1);
      assert.equal(boxById(builder, defaultId).fontsize, 10);
      assert.equal(boxById(builder, customId).fontsize, 12);
      assert.equal(boxById(builder, customId).hidden, 1);
    });

    it('adds patch-only comments', () => {
      const builder = createBuilder();
      const defaultId = builder.addPatchComment('default-section', '§ Default', 1, 2);
      const customId = builder.addPatchComment('custom-section', '§ Custom', 3, 4, 300);
      assert.deepEqual(boxById(builder, defaultId).patching_rect, [1, 2, 240, 20]);
      assert.deepEqual(boxById(builder, customId).patching_rect, [3, 4, 300, 20]);
      assert.equal(boxById(builder, customId).presentation, 0);
    });

    it('adds jsui previews with matching patching and presentation rectangles', () => {
      const builder = createBuilder();
      const defaultId = builder.addJsuiPreview('default-preview', [1, 2, 300, 80], HELP);
      const customId = builder.addJsuiPreview('custom-preview', [3, 4, 320, 90], HELP, {
        filename: 'custom-preview.js',
        hidden: 1,
      });
      const defaultBox = boxById(builder, defaultId);
      assert.equal(defaultBox.filename, 'motif-preview.js');
      assert.deepEqual(defaultBox.patching_rect, defaultBox.presentation_rect);
      assert.equal(boxById(builder, customId).filename, 'custom-preview.js');
      assert.equal(boxById(builder, customId).hidden, 1);
    });
  });

  describe('connections and tab visibility', () => {
    it('connects named boxes and direct IDs with optional ordering', () => {
      const builder = createBuilder();
      const sourceId = builder.addBox('source', 'button', [0, 0, 10, 10]);
      const destinationId = builder.addBox('destination', 'button', [20, 0, 10, 10]);
      builder.connect('source', 0, 'destination', 1);
      builder.connect(sourceId, 2, destinationId, 3, 4);

      assert.deepEqual(builder.lines, [
        { patchline: { source: [sourceId, 0], destination: [destinationId, 1] } },
        { patchline: { source: [sourceId, 2], destination: [destinationId, 3], order: 4 } },
      ]);
    });

    it('rejects unknown endpoints and invalid port metadata', () => {
      const builder = createBuilder();
      builder.addBox('source', 'button', [0, 0, 10, 10]);
      builder.addBox('destination', 'button', [20, 0, 10, 10]);

      assert.throws(() => builder.connect('missing', 0, 'destination', 0), /Unknown Max box reference/);
      assert.throws(() => builder.connect('source', 0, 'missing', 0), /Unknown Max box reference/);
      assert.throws(() => builder.connect('', 0, 'destination', 0), /object reference/);
      assert.throws(() => builder.connect('source', -1, 'destination', 0), /source outlet/);
      assert.throws(() => builder.connect('source', 0.5, 'destination', 0), /source outlet/);
      assert.throws(() => builder.connect('source', 0, 'destination', -1), /destination inlet/);
      assert.throws(() => builder.connect('source', 0, 'destination', 0, -1), /patchline order/);
    });

    it('wires hide/show messages across multiple layout columns', () => {
      const builder = createBuilder();
      builder.addBox('trigger', 'button', [0, 0, 10, 10]);
      builder.addObject('thispatcher', 'thispatcher', 0, 20);
      const hideNames = Array.from({ length: 13 }, (_, index) => `hide-${index}`);
      const showNames = ['show-0', 'show-1'];
      for (const name of [...hideNames, ...showNames]) builder.addBox(name, 'panel', [0, 0, 10, 10]);

      builder.wireTabVisibility('trigger', hideNames, showNames, 100, 200);

      const fan = builder.boxes.find(({ box }) => box.text === `t ${Array.from({ length: 15 }, () => 'b').join(' ')}`)?.box;
      assert.ok(fan);
      assert.deepEqual(
        builder.boxes.find(({ box }) => box.text === 'script sendbox hide-12 hidden 1')?.box.patching_rect,
        [540, 200, 260, 22],
      );
      assert.ok(builder.boxes.some(({ box }) => box.text === 'script sendbox show-1 hidden 0'));
      assert.equal(builder.lines.length, 31);
    });

    it('rejects empty visibility groups and unknown controls', () => {
      const empty = createBuilder();
      assert.throws(() => empty.wireTabVisibility('trigger', [], [], 0, 0), /at least one target/);

      const missingTrigger = createBuilder();
      missingTrigger.addObject('thispatcher', 'thispatcher', 0, 0);
      missingTrigger.addBox('target', 'panel', [0, 0, 10, 10]);
      assert.throws(() => missingTrigger.wireTabVisibility('trigger', ['target'], [], 0, 0), /Unknown Max box reference/);

      const missingTarget = createBuilder();
      missingTarget.addBox('trigger', 'button', [0, 0, 10, 10]);
      missingTarget.addObject('thispatcher', 'thispatcher', 0, 0);
      assert.throws(() => missingTarget.wireTabVisibility('trigger', ['target'], [], 0, 0), /Unknown Max box reference/);

      const missingThispatcher = createBuilder();
      missingThispatcher.addBox('trigger', 'button', [0, 0, 10, 10]);
      missingThispatcher.addBox('target', 'panel', [0, 0, 10, 10]);
      assert.throws(() => missingThispatcher.wireTabVisibility('trigger', ['target'], [], 0, 0), /thispatcher/);
    });
  });
});
