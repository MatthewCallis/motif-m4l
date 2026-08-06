/* oxlint-disable typescript/no-unsafe-call, typescript/no-unsafe-member-access */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { encodeLibraryStateMessages } from "../src/max/library-view.js";

type Listener = (event: {
  key?: string;
  reason?: unknown;
  message?: string;
  filename?: string;
  lineno?: number;
  target?: unknown;
  currentTarget?: unknown;
  preventDefault: () => void;
}) => void;

class FakeClassList {
  readonly values = new Set<string>();

  add(value: string): void {
    this.values.add(value);
  }

  remove(value: string): void {
    this.values.delete(value);
  }

  toggle(value: string, force?: boolean): boolean {
    const enabled = force ?? !this.values.has(value);
    if (enabled) this.values.add(value);
    else this.values.delete(value);
    return enabled;
  }
}

class FakeElement {
  readonly classList = new FakeClassList();
  readonly children: FakeElement[] = [];
  readonly listeners = new Map<string, Listener[]>();
  readonly dataset: Record<string, string> = {};
  readonly style: Record<string, string> = {};
  id = "";
  className = "";
  textContent = "";
  #innerHTML = "";
  title = "";
  value = "";
  type = "";
  min = "";
  max = "";
  step = "";
  checked = false;
  disabled = false;
  readOnly = false;

  constructor(readonly tagName: string) {}

  get innerHTML(): string {
    return this.#innerHTML;
  }

  set innerHTML(value: string) {
    this.#innerHTML = value;
    if (value === "") this.children.length = 0;
  }

  append(...children: FakeElement[]): void {
    this.children.push(...children);
  }

  setAttribute(name: string, value: string): void {
    if (name.startsWith("data-")) this.dataset[name.slice(5)] = value;
  }

  addEventListener(name: string, listener: Listener): void {
    const listeners = this.listeners.get(name) ?? [];
    listeners.push(listener);
    this.listeners.set(name, listeners);
  }

  getBoundingClientRect(): { left: number; width: number } {
    let fallback = 0;
    if (this.id === "app") fallback = 800;
    else if (this.id === "left") fallback = 240;
    return { left: 0, width: Number.parseFloat(this.style["width"] ?? "") || fallback };
  }

  dispatch(name: string, event: Partial<Parameters<Listener>[0]> = {}): void {
    const complete = {
      preventDefault: () => undefined,
      target: this,
      currentTarget: this,
      ...event,
    };
    for (const listener of this.listeners.get(name) ?? []) listener(complete);
  }

  click(): void {
    this.dispatch("click");
  }
}

class FakeInputElement extends FakeElement {
  constructor() {
    super("INPUT");
  }
}

class FakeTextAreaElement extends FakeElement {
  constructor() {
    super("TEXTAREA");
  }
}

class FakeSelectElement extends FakeElement {
  constructor() {
    super("SELECT");
  }
}

function createElementForId(id: string): FakeElement {
  if (id === "description-edit") return new FakeTextAreaElement();
  if (id === "motif-preview-canvas") {
    const canvas = new FakeElement("CANVAS");
    Object.assign(canvas, {
      width: 1,
      height: 1,
      style: canvas.style,
      getContext() {
        return null;
      },
    });
    return canvas;
  }
  if (
    id === "pitch-mode-edit" ||
    id === "meter-denominator-edit" ||
    id === "import-mode" ||
    id === "hotkey-action"
  )
    return new FakeSelectElement();
  if (
    id.includes("input") ||
    id.includes("edit") ||
    id.includes("display") ||
    id === "search" ||
    id.startsWith("curve-") ||
    id.startsWith("meter-") ||
    id === "default-gate-edit"
  )
    return new FakeInputElement();
  return new FakeElement(id.endsWith("btn") ? "BUTTON" : "DIV");
}

void describe("Library browser runtime", () => {
  void it("boots the typed controller, renders state, assembles chunks, and emits actions", async () => {
    const elements = new Map<string, FakeElement>();
    const panelTabs = [
      Object.assign(new FakeElement("BUTTON"), { dataset: { panel: "properties" } }),
      Object.assign(new FakeElement("BUTTON"), { dataset: { panel: "notes" } }),
    ];
    const documentListeners = new Map<string, Listener>();
    const windowListeners = new Map<string, Listener>();
    const outlets: unknown[][] = [];
    let receiveData: ((...values: unknown[]) => void) | undefined;

    const fakeDocument = {
      activeElement: null as FakeElement | null,
      getElementById(id: string): FakeElement {
        let value = elements.get(id);
        if (!value) {
          value = createElementForId(id);
          value.id = id;
          elements.set(id, value);
        }
        return value;
      },
      createElement(tagName: string): FakeElement {
        if (tagName === "input") return new FakeInputElement();
        if (tagName === "textarea") return new FakeTextAreaElement();
        if (tagName === "select") return new FakeSelectElement();
        return new FakeElement(tagName.toUpperCase());
      },
      querySelectorAll(selector: string): FakeElement[] {
        if (selector === ".panel-tab") return panelTabs;
        if (selector === ".tag-mode-btn") {
          return [
            Object.assign(new FakeElement("BUTTON"), { dataset: { tagMode: "or" } }),
            Object.assign(new FakeElement("BUTTON"), { dataset: { tagMode: "and" } }),
          ];
        }
        return [];
      },
      addEventListener(name: string, listener: Listener): void {
        documentListeners.set(name, listener);
      },
    };
    const fakeWindow = {
      innerWidth: 800,
      max: {
        outlet: (...args: unknown[]) => outlets.push(args),
        bindInlet: (name: string, handler: (...values: unknown[]) => void) => {
          if (name === "receiveData") receiveData = handler;
        },
      },
      addEventListener(name: string, listener: Listener): void {
        windowListeners.set(name, listener);
      },
    };

    Object.assign(globalThis, {
      window: fakeWindow,
      document: fakeDocument,
      location: { href: "file:///tmp/library.html" },
      HTMLElement: FakeElement,
      HTMLInputElement: FakeInputElement,
      HTMLTextAreaElement: FakeTextAreaElement,
      HTMLSelectElement: FakeSelectElement,
      HTMLButtonElement: FakeElement,
      HTMLDivElement: FakeElement,
      HTMLSpanElement: FakeElement,
    });

    await import("../src/max/library.js");
    assert.ok(receiveData, "Library client must bind its Max inlet");
    assert.ok(outlets.some((args) => args[0] === "library_ready"));

    const state = {
      query: "",
      tags: [],
      tagMode: "or" as const,
      availableTags: ["demo", "scale"],
      libraryPath: "/Motifs",
      libraryLoaded: true,
      libraryScanning: false,
      editing: {
        active: true,
        dirty: false,
        created: false,
        sourceId: "browser-test",
        targetId: "browser-test",
      },
      actions: {
        editing: true,
        canEdit: true,
        canSave: true,
        canImportClip: false,
        canRefreshLibrary: true,
      },
      items: [
        {
          id: "scale-turn",
          name: "Scale Turn",
          showId: false,
          isBuiltin: true,
          folder: "Library",
          hotkeys: [],
        },
        {
          id: "browser-test",
          name: "Tests - Browser Test",
          showId: false,
          isBuiltin: false,
          folder: "Tests",
          hotkeys: [{ pitch: 60, label: "C3", action: "trigger" }],
        },
      ],
      selectedIndex: 1,
      selected: {
        schemaVersion: 1,
        id: "browser-test",
        name: "Browser Test",
        description: "Browser test motif",
        pitchMode: "chromatic",
        sourcePitchContext: {
          anchorPitch: 60,
          scaleRootNote: 0,
          scaleName: "Major",
          scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
        },
        sourceMeter: { numerator: 4, denominator: 4 },
        length: 960,
        defaultGate: null,
        velocityCurve: {
          inputMin: null,
          inputMax: null,
          outputMin: null,
          outputMax: null,
          exponent: null,
        },
        previewBars: 1,
        effectivePitchMode: "chromatic" as const,
        isBuiltin: false,
        isPersisted: true,
        folder: "Tests",
        hotkeys: [{ pitch: 60, label: "C3", action: "trigger" as const }],
        tags: ["demo"],
        noteCount: 2,
        noteLimit: 512,
        canAddNote: true,
        canRemoveNote: true,
        notes: [
          {
            pitch: 0,
            accidental: null,
            at: 0,
            duration: 480,
            gate: null,
            velocity: 100,
            velocityOffset: null,
            velocityScale: null,
            legato: false,
            tie: false,
          },
          {
            pitch: 2,
            accidental: null,
            at: 480,
            duration: 480,
            gate: null,
            velocity: 90,
            velocityOffset: null,
            velocityScale: null,
            legato: true,
            tie: false,
          },
        ],
        preview: {
          notes: [
            { pitch: 60, atTicks: 0, durationTicks: 480, velocity: 100 },
            { pitch: 62, atTicks: 480, durationTicks: 480, velocity: 90 },
          ],
          totalTicks: 960,
          lowPitch: 59,
          highPitch: 63,
          noteNames: "C3 ·  D3",
        },
      },
      alert: null,
      scanProgress: null,
    };

    receiveData(encodeURIComponent(JSON.stringify(state)));
    assert.equal(elements.get("name-edit")?.value, "Browser Test");
    assert.equal(elements.get("source-anchor-edit")?.value, "60");
    assert.equal(elements.get("source-anchor-name")?.textContent, "C3");
    assert.equal(elements.get("source-root-edit")?.value, "0");
    assert.equal(elements.get("source-root-name")?.textContent, "C");
    assert.equal(elements.get("source-scale-name-edit")?.value, "Major");
    assert.equal(elements.get("source-scale-intervals-edit")?.value, "0, 2, 4, 5, 7, 9, 11");
    assert.equal(elements.get("note-rows")?.children.length, 2);
    assert.equal(elements.get("browser-list")?.children.length, 4);
    assert.equal(elements.get("browser-list")?.children[0]?.textContent, "▾ Library");
    assert.equal(elements.get("browser-list")?.children[1]?.children[0]?.textContent, "Scale Turn");
    assert.equal(elements.get("browser-list")?.children[2]?.textContent, "▾ Tests");
    assert.equal(
      elements.get("browser-list")?.children[3]?.children[0]?.textContent,
      "Browser Test",
    );
    assert.equal(elements.get("import-clip-btn")?.disabled, true);
    assert.equal(
      elements.get("import-clip-btn")?.title,
      "Finish or cancel editing before importing a clip",
    );
    assert.ok(elements.get("save-motif-btn")?.classList.values.has("accent"));
    assert.equal(elements.get("edit-btn")?.classList.values.has("accent"), false);
    assert.ok(elements.get("library-resizer")?.listeners.has("pointerdown"));
    assert.ok(elements.get("library-resizer")?.listeners.has("keydown"));

    receiveData(
      encodeURIComponent(
        JSON.stringify({
          ...state,
          libraryPath: "",
          libraryLoaded: false,
          actions: { ...state.actions, canSave: false },
        }),
      ),
    );
    assert.equal(elements.get("save-motif-btn")?.disabled, true);
    assert.equal(elements.get("save-motif-btn")?.textContent, "Library Folder Required");
    assert.match(elements.get("edit-state")?.textContent ?? "", /Library folder required/);
    assert.equal(
      elements.get("import-clip-btn")?.title,
      "Finish or cancel editing before importing a clip",
    );
    receiveData(encodeURIComponent(JSON.stringify(state)));

    const chunkedState = {
      ...state,
      query: "browser",
      selected: {
        ...state.selected,
        notes: Array.from({ length: 40 }, (_, index) => ({
          ...state.selected.notes[0],
          at: index * 120,
        })),
        noteCount: 40,
      },
    };
    for (const message of encodeLibraryStateMessages(chunkedState, 12)) {
      receiveData(message);
    }
    assert.equal(elements.get("note-rows")?.children.length, 40);

    const hotkeyInput = elements.get("hotkey-input");
    assert.ok(hotkeyInput);
    hotkeyInput.value = "D3";
    elements.get("assign-hotkey-btn")?.click();
    assert.ok(
      outlets.some(
        (args) =>
          args[0] === "lib_action" &&
          decodeURIComponent(String(args[1])).includes('"type":"map_trigger"'),
      ),
    );

    elements.get("import-clip-btn")?.click();
    assert.ok(
      outlets.some((args) => {
        if (args[0] !== "lib_action") return false;
        const action = JSON.parse(decodeURIComponent(String(args[1]))) as Record<string, unknown>;
        return action["type"] === "import_clip" && !("pitchMode" in action);
      }),
    );

    panelTabs[1]?.click();
    assert.equal(elements.get("notes-panel")?.classList.values.has("hidden"), false);
    elements.get("choose-btn")?.click();
    assert.ok(outlets.some((args) => args[0] === "choose_library"));

    const sourceAnchorInput = elements.get("source-anchor-edit");
    assert.ok(sourceAnchorInput);
    fakeDocument.activeElement = sourceAnchorInput;
    sourceAnchorInput.value = "61";
    sourceAnchorInput.dispatch("input");
    assert.equal(elements.get("source-anchor-name")?.textContent, "C♯3");
    sourceAnchorInput.dispatch("change");
    assert.ok(
      outlets.some((args) => {
        if (args[0] !== "lib_action") return false;
        const action = JSON.parse(decodeURIComponent(String(args[1]))) as {
          type?: unknown;
          properties?: { sourcePitchContext?: { anchorPitch?: unknown } };
        };
        return (
          action.type === "edit_motif" && action.properties?.sourcePitchContext?.anchorPitch === 61
        );
      }),
    );

    const sourceRootInput = elements.get("source-root-edit");
    assert.ok(sourceRootInput);
    fakeDocument.activeElement = sourceRootInput;
    sourceRootInput.value = "6";
    sourceRootInput.dispatch("input");
    assert.equal(elements.get("source-root-name")?.textContent, "F♯");
    sourceRootInput.value = "";
    sourceRootInput.dispatch("input");
    assert.equal(elements.get("source-root-name")?.textContent, "—");

    const hotkeyChip = elements.get("hotkey-list")?.children[0];
    assert.ok(hotkeyChip);
    outlets.length = 0;
    hotkeyChip.click();
    assert.ok(
      outlets.some(
        (args) =>
          args[0] === "lib_action" &&
          decodeURIComponent(String(args[1])).includes('"type":"unmap_trigger"'),
      ),
    );

    const noteRow = elements.get("note-rows")?.children[0];
    assert.ok(noteRow);
    const pitchInput = noteRow.children.find(
      (child) => child instanceof FakeInputElement && child.type === "number",
    );
    assert.ok(pitchInput);
    pitchInput.value = "4";
    outlets.length = 0;
    pitchInput.dispatch("change");
    assert.ok(
      outlets.some(
        (args) =>
          args[0] === "lib_action" &&
          decodeURIComponent(String(args[1])).includes('"type":"edit_note_at"'),
      ),
    );

    receiveData(
      encodeURIComponent(
        JSON.stringify({
          ...state,
          selected: {
            ...state.selected,
            hotkeys: [],
          },
          alert: {
            id: 7,
            title: "Source scale required",
            message: "Enter source intervals before changing Pitch Mode.",
          },
        }),
      ),
    );
    assert.equal(elements.get("hotkey-list")?.children[0]?.textContent, "None");
    assert.equal(elements.get("modal-title")?.textContent, "Source scale required");
    assert.equal(elements.get("modal-cancel")?.classList.values.has("hidden"), true);
    elements.get("modal-confirm")?.click();

    windowListeners.get("error")?.({
      message: "browser failure",
      filename: "library.html",
      lineno: 1,
      preventDefault: () => undefined,
    });
    receiveData("%broken");
    receiveData("%broken");
    assert.match(
      elements.get("debug-panel")?.textContent ?? "",
      /Library data could not be displayed/,
    );
    documentListeners.get("keydown")?.({
      key: "Escape",
      preventDefault: () => undefined,
    });
  });
});

void describe("Library canvas preview paint", () => {
  void it("paints empty and note payloads without throwing", async () => {
    const { paintLibraryPreview } = await import("../src/max/library-preview.js");
    const { buildMotifPreview, toMotifPreviewPaintData } = await import("../src/core/preview.js");
    const { BUILTIN_MOTIFS } = await import("../src/generated/builtins.js");
    const chromaticTurn = BUILTIN_MOTIFS.find(({ id }) => id === "chromatic-turn");
    assert.ok(chromaticTurn);

    const calls: string[] = [];
    const ctx = {
      clearRect: () => calls.push("clear"),
      fillRect: () => calls.push("fill"),
      strokeRect: () => calls.push("strokeRect"),
      beginPath: () => undefined,
      moveTo: () => undefined,
      lineTo: () => undefined,
      stroke: () => calls.push("stroke"),
      fillText: (text: string) => calls.push(`text:${text}`),
      measureText: (text: string) => ({ width: text.length * 6 }),
      setTransform: () => undefined,
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 1,
      font: "",
      textBaseline: "alphabetic",
    } as unknown as CanvasRenderingContext2D;

    paintLibraryPreview(ctx, null, 200, 100);
    assert.ok(calls.includes("clear"));
    assert.ok(calls.some((entry) => entry.startsWith("text:Select a motif")));

    const paint = toMotifPreviewPaintData(
      buildMotifPreview(
        chromaticTurn,
        {
          tempo: 120,
          rootNote: 0,
          scaleName: "Major",
          scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
          scaleMode: true,
          timeSignature: { numerator: 4, denominator: 4 },
          isPlaying: false,
          currentSongTime: 0,
        },
        60,
        undefined,
        "preserve",
      ),
    );
    calls.length = 0;
    paintLibraryPreview(ctx, paint, 320, 140);
    assert.ok(calls.includes("fill"));
    assert.ok(calls.some((entry) => entry.startsWith("text:")));
  });
});
