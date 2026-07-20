/**
 * Typed helpers for constructing the JSON representation used by `.maxpat` files.
 *
 * The public API intentionally mirrors Max concepts rather than exposing ad-hoc
 * object literals throughout the patch generator. Max does not publish a formal
 * TypeScript schema for `.maxpat` JSON, so these interfaces model the documented
 * object attributes used by Motif and keep an extensible JSON value escape hatch
 * for object-specific attributes.
 *
 * @see https://docs.cycling74.com/userguide/object_reference/
 * @see https://docs.cycling74.com/apiref/js/patcher/
 */

/** A JSON scalar accepted in a Max patcher document. */
export type MaxJsonScalar = string | number | boolean | null;

/** A recursively serializable value accepted in a Max patcher document. */
export type MaxJsonValue = MaxJsonScalar | MaxJsonValue[] | MaxJsonObject;

/** A recursively serializable object accepted in a Max patcher document. */
export interface MaxJsonObject {
  [key: string]: MaxJsonValue | undefined;
}

/**
 * A Max rectangle encoded as `[left, top, width, height]` in pixels.
 *
 * Max documents `patching_rect` and `presentation_rect` as four-float arrays.
 * Width and height must be non-negative; positions may be negative in an
 * unlocked patching canvas.
 *
 * @see https://docs.cycling74.com/reference/live.menu#patching_rect
 * @see https://docs.cycling74.com/reference/live.menu#presentation_rect
 */
export type MaxRect = [number, number, number, number];

/**
 * An RGBA color represented by four normalized floats in the range 0 through 1.
 *
 * @see https://docs.cycling74.com/reference/panel/#bgcolor
 */
export type MaxRgba = [number, number, number, number];

/** Max's integer representation of a false/true Inspector attribute. */
export type MaxBoolean = 0 | 1;

/** Max font-face values: regular, bold, italic, or bold italic. */
export type MaxFontFace = 0 | 1 | 2 | 3;

/** Max text-justification values: left, center, or right. */
export type MaxTextJustification = 0 | 1 | 2;

/** Max value-popup label sources documented by common box attributes. */
export type MaxValuePopupLabel = 0 | 1 | 2 | 3 | 4;

/**
 * User-facing help metadata displayed by Max and Ableton Live.
 *
 * `annotation_name` supplies the Info View title, `annotation` supplies clue
 * text, and `hint` supplies the locked-patcher tooltip.
 *
 * @see https://docs.cycling74.com/reference/live.menu#annotation_name
 * @see https://docs.cycling74.com/reference/live.menu#annotation
 * @see https://docs.cycling74.com/reference/live.menu#hint
 */
export interface MaxHelpInfo extends MaxJsonObject {
  name: string;
  description: string;
}

/** Common help attributes emitted onto an interactive Max box. */
export interface MaxHelpAttributes extends MaxJsonObject {
  annotation_name: string;
  annotation: string;
  hint: string;
}

/** Common object attributes used by Motif's generated patcher boxes. */
export interface MaxBoxAttributes extends MaxJsonObject {
  annotation_name?: string;
  annotation?: string;
  hint?: string;
  hidden?: MaxBoolean;
  ignoreclick?: MaxBoolean;
  presentation?: MaxBoolean;
  presentation_rect?: MaxRect;
  varname?: string;
}

/** A single object box in a `.maxpat` patcher. */
export interface MaxBox extends MaxJsonObject {
  id: string;
  maxclass: string;
  patching_rect: MaxRect;
}

/** The wrapper used by Max around every box entry in `patcher.boxes`. */
export interface MaxBoxEntry extends MaxJsonObject {
  box: MaxBox;
}

/**
 * A zero-based outlet or inlet reference in a patch cord endpoint.
 *
 * @see https://docs.cycling74.com/apiref/js/patcher/#connect
 */
export type MaxPatchEndpoint = [objectId: string, portIndex: number];

/** A patch cord connecting one outlet to one inlet. */
export interface MaxPatchline extends MaxJsonObject {
  source: MaxPatchEndpoint;
  destination: MaxPatchEndpoint;
  order?: number;
}

/** The wrapper used by Max around every entry in `patcher.lines`. */
export interface MaxPatchlineEntry extends MaxJsonObject {
  patchline: MaxPatchline;
}

/** A dependency-cache entry embedded into a patcher. */
export interface MaxDependencyEntry extends MaxJsonObject {
  name: string;
  bootpath?: string;
  patcherrelativepath?: string;
  type?: string;
  implicit?: MaxBoolean;
}

/** Max application-version metadata stored in a patcher. */
export interface MaxAppVersion extends MaxJsonObject {
  major: number;
  minor: number;
  revision: number;
  architecture: string;
  modernui: MaxBoolean;
}

/**
 * A patcher body. Object-specific generators may add further documented Max
 * attributes through the inherited JSON index signature.
 */
export interface MaxPatcher extends MaxJsonObject {
  fileversion: number;
  appversion: MaxAppVersion;
  classnamespace: string;
  rect: MaxRect;
  boxes: MaxBoxEntry[];
  lines: MaxPatchlineEntry[];
  dependency_cache: MaxDependencyEntry[];
}

/** A complete `.maxpat` document. */
export interface MaxPatchDocument extends MaxJsonObject {
  patcher: MaxPatcher;
}

/** Color tokens used by Motif's non-`live.*` controls. */
export interface MaxBuilderColors {
  panel: MaxRgba;
  text: MaxRgba;
  muted: MaxRgba;
  accent: MaxRgba;
  previewBg: MaxRgba;
  previewBorder: MaxRgba;
}

/** Configuration shared by a builder and all child/subpatcher builders. */
export interface MaxPatchBuilderOptions {
  fontName: string;
  colors: MaxBuilderColors;
}

/** Optional attributes supported by {@link MaxPatchBuilder.addPanel}. */
export interface MaxPanelOptions {
  bgcolor?: MaxRgba;
  rounded?: number;
  hidden?: MaxBoolean;
}

/** Optional attributes supported by {@link MaxPatchBuilder.addComment}. */
export interface MaxCommentOptions {
  fontsize?: number;
  fontface?: MaxFontFace;
  textcolor?: MaxRgba;
  justification?: MaxTextJustification;
  linecount?: number;
  ignoreclick?: MaxBoolean;
  hidden?: MaxBoolean;
  help?: MaxHelpInfo;
}

/** Optional attributes shared by Motif's presentation controls. */
export interface MaxUiOptions {
  hidden?: MaxBoolean;
  ignoreclick?: MaxBoolean;
  fontsize?: number;
}

/** Parameter metadata serialized under `saved_attribute_attributes.valueof`. */
export interface MaxParameterValueAttributes extends MaxJsonObject {
  parameter_enum?: string[];
  parameter_initial: number[];
  parameter_initial_enable: MaxBoolean;
  parameter_longname: string;
  parameter_mmax: number;
  parameter_mmin?: number;
  parameter_shortname: string;
  parameter_type: number;
  parameter_unitstyle: number;
}

/** Wrapper used by Live UI objects for parameter metadata. */
export interface MaxSavedAttributeAttributes extends MaxJsonObject {
  valueof: MaxParameterValueAttributes;
}

/**
 * Convert help metadata into Max's three user-facing help attributes.
 *
 * @param {MaxHelpInfo} help Non-empty title and description shown in Max and Live.
 * @returns {MaxHelpAttributes} Attributes suitable for spreading onto a UI box.
 * @throws {TypeError} If either help string is empty.
 */
export function createHelpAttributes(help: MaxHelpInfo): MaxHelpAttributes {
  assertNonEmptyString(help.name, 'help.name');
  assertNonEmptyString(help.description, 'help.description');
  return {
    annotation_name: help.name,
    annotation: help.description,
    hint: help.description,
  };
}

/**
 * Encode `umenu` items using the comma separators expected by Max's Inspector
 * representation.
 *
 * @param {readonly string[]} values Menu labels in display order.
 * @returns {string[]} A new list alternating labels with comma separator atoms.
 * @throws {TypeError} If a label is empty.
 * @see https://docs.cycling74.com/reference/ubumenu/#items
 */
export function createMenuItems(values: readonly string[]): string[] {
  const items: string[] = [];
  for (const value of values) {
    assertNonEmptyString(value, 'menu item');
    if (items.length > 0) items.push(',');
    items.push(value);
  }
  return items;
}

/**
 * Build an enumerated Max for Live parameter definition.
 *
 * Max for Live enum parameters are zero-based and require an initial index that
 * exists in `values`.
 *
 * @param {string} longName Unique automation name shown by Live.
 * @param {string} shortName Compact label shown by Live UI objects.
 * @param {readonly string[]} values Enumeration labels in numeric order.
 * @param {number} initial Zero-based initial enum index.
 * @returns {MaxSavedAttributeAttributes} Serialized parameter metadata for a Live UI box.
 * @throws {RangeError} If the enum is empty or the initial index is invalid.
 * @see https://docs.cycling74.com/userguide/m4l/live_parameters/
 * @see https://docs.cycling74.com/reference/live.menu/
 */
export function createEnumParameterAttributes(
  longName: string,
  shortName: string,
  values: readonly string[],
  initial = 0,
): MaxSavedAttributeAttributes {
  assertParameterNames(longName, shortName);
  if (values.length === 0) throw new RangeError('enum parameter values must not be empty');
  const parameterEnum = values.map((value) => {
    assertNonEmptyString(value, 'enum parameter value');
    return value;
  });
  assertIntegerInRange(initial, 0, values.length - 1, 'enum initial index');
  return {
    valueof: {
      parameter_enum: parameterEnum,
      parameter_longname: longName,
      parameter_mmax: values.length - 1,
      parameter_shortname: shortName,
      parameter_type: 2,
      parameter_unitstyle: 9,
      parameter_initial_enable: 1,
      parameter_initial: [initial],
    },
  };
}

/**
 * Build the integer parameter definition used by Motif's MIDI note controls.
 *
 * @param {string} longName Unique automation name shown by Live.
 * @param {string} shortName Compact label shown by the control.
 * @param {number} initial Initial integer value.
 * @param {number} minimum Inclusive lower bound.
 * @param {number} maximum Inclusive upper bound.
 * @returns {MaxSavedAttributeAttributes} Serialized parameter metadata for `live.numbox`.
 * @throws {RangeError} If the range or initial value is invalid.
 * @see https://docs.cycling74.com/reference/live.numbox/
 * @see https://docs.cycling74.com/userguide/m4l/live_parameters/
 */
export function createIntegerParameterAttributes(
  longName: string,
  shortName: string,
  initial: number,
  minimum: number,
  maximum: number,
): MaxSavedAttributeAttributes {
  assertParameterNames(longName, shortName);
  assertFiniteNumber(minimum, 'integer parameter minimum');
  assertFiniteNumber(maximum, 'integer parameter maximum');
  if (minimum > maximum) throw new RangeError('integer parameter minimum must not exceed maximum');
  assertIntegerInRange(initial, minimum, maximum, 'integer parameter initial value');
  return {
    valueof: {
      parameter_initial: [initial],
      parameter_initial_enable: 1,
      parameter_longname: longName,
      parameter_mmax: maximum,
      parameter_mmin: minimum,
      parameter_shortname: shortName,
      parameter_type: 1,
      parameter_unitstyle: 8,
    },
  };
}

class MaxObjectIdAllocator {
  private nextId = 1;

  allocate(): string {
    const id = `obj-${this.nextId}`;
    this.nextId += 1;
    return id;
  }
}

/**
 * Stateful, validated builder for one Max patcher level.
 *
 * A child builder shares the parent's object-ID allocator so generated IDs stay
 * unique across the complete document, while names remain local to each patcher
 * level just as Max scripting names do.
 */
export class MaxPatchBuilder {
  /** Boxes emitted at this patcher level, in insertion order. */
  readonly boxes: MaxBoxEntry[] = [];

  /** Patch cords emitted at this patcher level, in insertion order. */
  readonly lines: MaxPatchlineEntry[] = [];

  readonly fontName: string;
  readonly colors: MaxBuilderColors;

  private readonly ids = new Map<string, string>();
  private readonly objectIds = new Set<string>();
  private readonly allocator: MaxObjectIdAllocator;

  /**
   * Create a patch builder with shared UI defaults.
   * @param {MaxPatchBuilderOptions} options Font and color defaults shared by generated UI objects.
   * @param {MaxObjectIdAllocator} allocator The document-wide object id allocator.
   * @throws {TypeError} If the font name or any RGBA color is invalid.
   */
  constructor(options: MaxPatchBuilderOptions, allocator = new MaxObjectIdAllocator()) {
    assertNonEmptyString(options.fontName, 'fontName');
    for (const [name, color] of Object.entries(options.colors)) validateColor(color, `colors.${name}`);
    this.fontName = options.fontName;
    this.colors = options.colors;
    this.allocator = allocator;
  }

  /**
   * Create a builder for a nested patcher while sharing document-wide IDs.
   *
   * @returns {MaxPatchBuilder} An empty builder with the same fonts/colors and a local name table.
   */
  readonly createChild = (): MaxPatchBuilder => new MaxPatchBuilder({
    fontName: this.fontName,
    colors: this.colors,
  }, this.allocator);

  /**
   * Add a generic Max object box.
   *
   * @param {string} name Local scripting key used by later {@link connect} calls.
   * @param {string} maxclass Max object's class name, such as `panel`, `message`, or `jweb`.
   * @param {MaxRect} patchingRect Unlocked-patcher position and size.
   * @param {MaxBoxAttributes} options Documented object-specific attributes.
   * @returns {string} The generated Max object ID.
   * @throws {Error} If `name` is duplicated at this patcher level.
   * @see https://docs.cycling74.com/apiref/js/patcher/#newobject
   */
  readonly addBox = (
    name: string,
    maxclass: string,
    patchingRect: MaxRect,
    options: MaxBoxAttributes = {},
  ): string => {
    assertNonEmptyString(name, 'box name');
    assertNonEmptyString(maxclass, 'maxclass');
    validateRect(patchingRect, 'patchingRect');
    if (this.ids.has(name)) throw new Error(`Duplicate Max box name: ${name}`);

    const id = this.allocator.allocate();
    this.ids.set(name, id);
    this.objectIds.add(id);
    this.boxes.push({
      box: {
        ...options,
        id,
        maxclass,
        patching_rect: [...patchingRect] as MaxRect,
      },
    });
    return id;
  };

  /**
   * Add a typed `newobj` box containing a Max object expression.
   *
   * @param {string} name The local scripting key for the box.
   * @param {string} text The Max object expression.
   * @param {number} x The patching-view left position.
   * @param {number} y The patching-view top position.
   * @param {number} width The patching-view width.
   * @param {MaxBoxAttributes} options Additional box attributes.
   * @returns {string} The generated Max object id.
   * @see https://docs.cycling74.com/apiref/js/patcher/#newdefault
   */
  readonly addObject = (
    name: string,
    text: string,
    x: number,
    y: number,
    width = 120,
    options: MaxBoxAttributes = {},
  ): string => {
    assertNonEmptyString(text, 'object text');
    return this.addBox(name, 'newobj', [x, y, width, 22], { text, ...options });
  };

  /**
   * Add a Max `message` box.
   *
   * @param {string} name The local scripting key for the box.
   * @param {string} text The message contents.
   * @param {number} x The patching-view left position.
   * @param {number} y The patching-view top position.
   * @param {number} width The patching-view width.
   * @returns {string} The generated Max object id.
   * @see https://docs.cycling74.com/reference/message/
   */
  readonly addMessage = (name: string, text: string, x: number, y: number, width = 90): string => {
    assertNonEmptyString(text, 'message text');
    return this.addBox(name, 'message', [x, y, width, 22], { text });
  };

  /**
   * Add a presentation-mode `panel` used as a visual background.
   *
   * @param {string} name The local scripting key and varname.
   * @param {MaxRect} rect The patching and presentation rectangle.
   * @param {MaxPanelOptions} options Optional panel styling and visibility.
   * @returns {string} The generated Max object id.
   * @see https://docs.cycling74.com/reference/panel/
   */
  readonly addPanel = (name: string, rect: MaxRect, options: MaxPanelOptions = {}): string => this.addBox(
    name,
    'panel',
    rect,
    {
      background: 1,
      border: 0,
      bgcolor: options.bgcolor ?? this.colors.panel,
      rounded: options.rounded ?? 0,
      presentation: 1,
      presentation_rect: [...rect] as MaxRect,
      varname: name,
      hidden: options.hidden ?? 0,
    },
  );

  /**
   * Add a presentation-mode `comment` label.
   *
   * @param {string} name The local scripting key and varname.
   * @param {string} text The label text.
   * @param {MaxRect} rect The patching and presentation rectangle.
   * @param {MaxCommentOptions} options Optional typography, help, and visibility.
   * @returns {string} The generated Max object id.
   * @see https://docs.cycling74.com/reference/comment/
   */
  readonly addComment = (
    name: string,
    text: string,
    rect: MaxRect,
    options: MaxCommentOptions = {},
  ): string => this.addBox(name, 'comment', rect, {
    text,
    fontname: this.fontName,
    fontsize: options.fontsize ?? 10,
    fontface: options.fontface ?? 0,
    textcolor: options.textcolor ?? this.colors.text,
    textjustification: options.justification ?? 0,
    linecount: options.linecount,
    presentation: 1,
    presentation_rect: [...rect] as MaxRect,
    varname: name,
    ignoreclick: options.ignoreclick ?? 1,
    hidden: options.hidden ?? 0,
    ...(options.help === undefined ? {} : createHelpAttributes(options.help)),
  });

  /**
   * Add a dynamically populated `umenu` presentation control.
   *
   * @param {string} name The local scripting key and varname.
   * @param {readonly string[]} items The initial menu items.
   * @param {MaxRect} rect The patching and presentation rectangle.
   * @param {MaxHelpInfo} help The user-facing help metadata.
   * @param {MaxUiOptions} options Optional UI attributes.
   * @returns {string} The generated Max object id.
   * @see https://docs.cycling74.com/reference/ubumenu/
   */
  readonly addDynamicMenu = (
    name: string,
    items: readonly string[],
    rect: MaxRect,
    help: MaxHelpInfo,
    options: MaxUiOptions = {},
  ): string => this.addBox(name, 'umenu', rect, {
    items: createMenuItems(items),
    fontname: this.fontName,
    fontsize: options.fontsize ?? 10,
    bgcolor: this.colors.previewBg,
    textcolor: this.colors.text,
    bordercolor: this.colors.previewBorder,
    hltcolor: this.colors.accent,
    ignoreclick: options.ignoreclick ?? 0,
    presentation: 1,
    presentation_rect: [...rect] as MaxRect,
    varname: name,
    hidden: options.hidden ?? 0,
    ...createHelpAttributes(help),
  });

  /**
   * Add an enumerated `live.menu` parameter.
   *
   * @param {string} name The local scripting key and varname.
   * @param {readonly string[]} values The enumeration labels.
   * @param {MaxRect} rect The patching and presentation rectangle.
   * @param {string} longName The unique Live automation name.
   * @param {string} shortName The compact control label.
   * @param {number} initial The zero-based initial enum index.
   * @param {MaxHelpInfo} help The user-facing help metadata.
   * @param {MaxUiOptions & { parameter_enable?: MaxBoolean }} options Optional UI attributes.
   * @returns {string} The generated Max object id.
   * @see https://docs.cycling74.com/reference/live.menu/
   */
  readonly addLiveMenu = (
    name: string,
    values: readonly string[],
    rect: MaxRect,
    longName: string,
    shortName: string,
    initial: number,
    help: MaxHelpInfo,
    options: MaxUiOptions & { parameter_enable?: MaxBoolean } = {},
  ): string => this.addBox(name, 'live.menu', rect, {
    appearance: 0,
    parameter_enable: options.parameter_enable ?? 1,
    presentation: 1,
    presentation_rect: [...rect] as MaxRect,
    saved_attribute_attributes: createEnumParameterAttributes(longName, shortName, values, initial),
    varname: name,
    valuepopup: 1,
    valuepopuplabel: 3 satisfies MaxValuePopupLabel,
    ignoreclick: options.ignoreclick ?? 0,
    hidden: options.hidden ?? 0,
    ...createHelpAttributes(help),
  });

  /**
   * Add a theme-owned `live.comment` presentation label.
   *
   * @param {string} name The local scripting key and varname.
   * @param {string} text The label text.
   * @param {MaxRect} rect The patching and presentation rectangle.
   * @param {Pick<MaxUiOptions, 'hidden'>} options Optional visibility attributes.
   * @returns {string} The generated Max object id.
   * @see https://docs.cycling74.com/reference/live.comment/
   */
  readonly addLiveComment = (
    name: string,
    text: string,
    rect: MaxRect,
    options: Pick<MaxUiOptions, 'hidden'> = {},
  ): string => this.addBox(name, 'live.comment', rect, {
    text,
    presentation: 1,
    presentation_rect: [...rect] as MaxRect,
    varname: name,
    hidden: options.hidden ?? 0,
  });

  /**
   * Add an enumerated `live.tab` parameter.
   *
   * @param {string} name The local scripting key and varname.
   * @param {readonly string[]} values The tab labels.
   * @param {MaxRect} rect The patching and presentation rectangle.
   * @param {string} longName The unique Live automation name.
   * @param {string} shortName The compact control label.
   * @param {number} initial The zero-based initial tab index.
   * @param {MaxHelpInfo} help The user-facing help metadata.
   * @param {Pick<MaxUiOptions, 'hidden'>} options Optional visibility attributes.
   * @returns {string} The generated Max object id.
   * @see https://docs.cycling74.com/reference/live.tab/
   */
  readonly addLiveTab = (
    name: string,
    values: readonly string[],
    rect: MaxRect,
    longName: string,
    shortName: string,
    initial: number,
    help: MaxHelpInfo,
    options: Pick<MaxUiOptions, 'hidden'> = {},
  ): string => this.addBox(name, 'live.tab', rect, {
    fontname: this.fontName,
    fontsize: 9,
    mode: 0,
    livemode: 1,
    multiline: 0,
    num_lines_patching: 1,
    num_lines_presentation: 1,
    parameter_enable: 1,
    presentation: 1,
    presentation_rect: [...rect] as MaxRect,
    saved_attribute_attributes: createEnumParameterAttributes(longName, shortName, values, initial),
    varname: name,
    valuepopup: 1,
    valuepopuplabel: 3 satisfies MaxValuePopupLabel,
    hidden: options.hidden ?? 0,
    ...createHelpAttributes(help),
  });

  /**
   * Add a bounded integer `live.numbox` parameter.
   *
   * @param {string} name The local scripting key and varname.
   * @param {MaxRect} rect The patching and presentation rectangle.
   * @param {string} longName The unique Live automation name.
   * @param {string} shortName The compact control label.
   * @param {number} initial The initial integer value.
   * @param {MaxHelpInfo} help The user-facing help metadata.
   * @param {Pick<MaxUiOptions, 'hidden'> & { minimum?: number; maximum?: number }} options Optional bounds and visibility.
   * @returns {string} The generated Max object id.
   * @see https://docs.cycling74.com/reference/live.numbox/
   */
  readonly addLiveNumber = (
    name: string,
    rect: MaxRect,
    longName: string,
    shortName: string,
    initial: number,
    help: MaxHelpInfo,
    options: Pick<MaxUiOptions, 'hidden'> & { minimum?: number; maximum?: number } = {},
  ): string => this.addBox(name, 'live.numbox', rect, {
    appearance: 4,
    fontname: this.fontName,
    fontsize: 10,
    parameter_enable: 1,
    presentation: 1,
    presentation_rect: [...rect] as MaxRect,
    saved_attribute_attributes: createIntegerParameterAttributes(
      longName,
      shortName,
      initial,
      options.minimum ?? 0,
      options.maximum ?? 127,
    ),
    varname: name,
    valuepopup: 1,
    valuepopuplabel: 3 satisfies MaxValuePopupLabel,
    hidden: options.hidden ?? 0,
    ...createHelpAttributes(help),
  });

  /**
   * Add a momentary `live.text` button that emits on mouse-up.
   *
   * @param {string} name The local scripting key and varname.
   * @param {string} text The button label.
   * @param {MaxRect} rect The patching and presentation rectangle.
   * @param {MaxHelpInfo} help The user-facing help metadata.
   * @param {Pick<MaxUiOptions, 'hidden' | 'fontsize'>} options Optional font and visibility attributes.
   * @returns {string} The generated Max object id.
   * @see https://docs.cycling74.com/reference/live.text/
   */
  readonly addLiveTextButton = (
    name: string,
    text: string,
    rect: MaxRect,
    help: MaxHelpInfo,
    options: Pick<MaxUiOptions, 'hidden' | 'fontsize'> = {},
  ): string => this.addBox(name, 'live.text', rect, {
    appearance: 0,
    fontname: this.fontName,
    fontsize: options.fontsize ?? 10,
    mode: 0,
    outputmode: 1,
    parameter_enable: 0,
    text,
    texton: text,
    presentation: 1,
    presentation_rect: [...rect] as MaxRect,
    varname: name,
    hidden: options.hidden ?? 0,
    ...createHelpAttributes(help),
  });

  /**
   * Add a bold patching-view-only section label.
   *
   * @param {string} name The local scripting key.
   * @param {string} text The section label text.
   * @param {number} x The patching-view left position.
   * @param {number} y The patching-view top position.
   * @param {number} width The patching-view width.
   * @returns {string} The generated Max object id.
   * @see https://docs.cycling74.com/reference/comment/
   */
  readonly addPatchComment = (name: string, text: string, x: number, y: number, width = 240): string => this.addBox(
    name,
    'comment',
    [x, y, width, 20],
    {
      text,
      fontname: this.fontName,
      fontsize: 12,
      fontface: 1,
      presentation: 0,
    },
  );

  /**
   * Add Motif's native `jsui` note-preview surface.
   *
   * Max requires patching and Presentation dimensions to remain identical for
   * reliable mouse coordinates and redraw behavior in `jsui`.
   *
   * @param {string} name The local scripting key and varname.
   * @param {MaxRect} rect The patching and presentation rectangle.
   * @param {MaxHelpInfo} help The user-facing help metadata.
   * @param {Pick<MaxUiOptions, 'hidden'> & { filename?: string }} options Optional filename and visibility.
   * @returns {string} The generated Max object id.
   * @see https://docs.cycling74.com/reference/jsui/
   */
  readonly addJsuiPreview = (
    name: string,
    rect: MaxRect,
    help: MaxHelpInfo,
    options: Pick<MaxUiOptions, 'hidden'> & { filename?: string } = {},
  ): string => this.addBox(name, 'jsui', rect, {
    filename: options.filename ?? 'motif-preview.js',
    border: 0,
    ignoreclick: 0,
    numinlets: 1,
    numoutlets: 1,
    outlettype: [''],
    parameter_enable: 0,
    presentation: 1,
    presentation_rect: [...rect] as MaxRect,
    varname: name,
    hidden: options.hidden ?? 0,
    ...createHelpAttributes(help),
  });

  /**
   * Connect a source outlet to a destination inlet using zero-based indices.
   *
   * Names are resolved only within this patcher level. A generated object ID may
   * also be supplied directly when it belongs to this builder.
   *
   * @param {string} source The local name or generated id of the source box.
   * @param {number} sourceOutlet The zero-based source outlet.
   * @param {string} destination The local name or generated id of the destination box.
   * @param {number} destinationInlet The zero-based destination inlet.
   * @param {number | undefined} order Optional patch-cord execution order.
   * @returns {void}
   * @throws {Error} If either endpoint is unknown.
   * @throws {RangeError} If a port index or order is not a non-negative integer.
   * @see https://docs.cycling74.com/apiref/js/patcher/#connect
   */
  readonly connect = (
    source: string,
    sourceOutlet: number,
    destination: string,
    destinationInlet: number,
    order?: number,
  ): void => {
    assertNonNegativeInteger(sourceOutlet, 'source outlet');
    assertNonNegativeInteger(destinationInlet, 'destination inlet');
    if (order !== undefined) assertNonNegativeInteger(order, 'patchline order');

    const patchline: MaxPatchline = {
      source: [this.resolveObjectReference(source), sourceOutlet],
      destination: [this.resolveObjectReference(destination), destinationInlet],
    };
    if (order !== undefined) patchline.order = order;
    this.lines.push({ patchline });
  };

  /**
   * Build tab visibility using one `script sendbox … hidden` message per object.
   *
   * Separate messages avoid Max truncating one very large comma-separated
   * `thispatcher` script message. The target `thispatcher` box and all listed
   * controls must already exist.
   *
   * @param {string} triggerName The tab control that drives visibility.
   * @param {readonly string[]} hideNames The controls to hide for this tab state.
   * @param {readonly string[]} showNames The controls to show for this tab state.
   * @param {number} baseX The patching-view x origin for generated helper boxes.
   * @param {number} baseY The patching-view y origin for generated helper boxes.
   * @returns {void}
   * @see https://docs.cycling74.com/reference/thispatcher/
   * @see https://docs.cycling74.com/reference/trigger/
   */
  readonly wireTabVisibility = (
    triggerName: string,
    hideNames: readonly string[],
    showNames: readonly string[],
    baseX: number,
    baseY: number,
  ): void => {
    const count = hideNames.length + showNames.length;
    if (count === 0) throw new RangeError('tab visibility requires at least one target');
    const bangs = Array.from({ length: count }, () => 'b').join(' ');
    const fanName = `${triggerName}-fan`;
    this.addObject(fanName, `t ${bangs}`, baseX, baseY, Math.max(80, count * 14));
    this.connect(triggerName, 0, fanName, 0);

    const names = [
      ...hideNames.map((name) => ({ name, hidden: 1, action: 'hide' })),
      ...showNames.map((name) => ({ name, hidden: 0, action: 'show' })),
    ];
    const rowPitch = 70;
    const colPitch = 320;
    const rowsPerCol = 12;

    names.forEach(({ name, hidden, action }, outlet) => {
      this.resolveObjectReference(name);
      const col = Math.floor(outlet / rowsPerCol);
      const row = outlet % rowsPerCol;
      const x = baseX + 120 + col * colPitch;
      const y = baseY + row * rowPitch;
      const messageName = `${triggerName}-${action}-${name}`;
      this.addMessage(messageName, `script sendbox ${name} hidden ${hidden}`, x, y, 260);
      this.connect(fanName, outlet, messageName, 0);
      this.connect(messageName, 0, 'thispatcher', 0);
    });
  };

  private resolveObjectReference(reference: string): string {
    assertNonEmptyString(reference, 'object reference');
    const namedId = this.ids.get(reference);
    if (namedId !== undefined) return namedId;
    if (this.objectIds.has(reference)) return reference;
    throw new Error(`Unknown Max box reference: ${reference}`);
  }
}

function assertNonEmptyString(value: string, label: string): void {
  if (typeof value !== 'string' || value.trim().length === 0) throw new TypeError(`${label} must be a non-empty string`);
}

function assertFiniteNumber(value: number, label: string): void {
  if (!Number.isFinite(value)) throw new TypeError(`${label} must be a finite number`);
}

function assertNonNegativeInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0) throw new RangeError(`${label} must be a non-negative integer`);
}

function assertIntegerInRange(value: number, minimum: number, maximum: number, label: string): void {
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new RangeError(`${label} must be an integer between ${minimum} and ${maximum}`);
  }
}

function assertParameterNames(longName: string, shortName: string): void {
  assertNonEmptyString(longName, 'parameter long name');
  assertNonEmptyString(shortName, 'parameter short name');
}

function validateRect(rect: MaxRect, label: string): void {
  rect.forEach((value, index) => assertFiniteNumber(value, `${label}[${index}]`));
  if (rect[2] < 0 || rect[3] < 0) throw new RangeError(`${label} width and height must be non-negative`);
}

function validateColor(color: MaxRgba, label: string): void {
  if (!Array.isArray(color) || color.length !== 4) throw new TypeError(`${label} must contain four RGBA values`);
  color.forEach((value, index) => {
    assertFiniteNumber(value, `${label}[${index}]`);
    if (value < 0 || value > 1) throw new RangeError(`${label}[${index}] must be between 0 and 1`);
  });
}
