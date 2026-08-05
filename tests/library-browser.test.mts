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
    const fallback = this.id === "app" ? 800 : this.id === "left" ? 240 : 0;
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
        return selector === ".panel-tab" ? panelTabs : [];
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
        canImportClip: true,
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
        effectivePitchMode: "chromatic",
        isBuiltin: false,
        isPersisted: true,
        hotkeys: [{ pitch: 60, label: "C3", action: "trigger" }],
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
      },
      alert: null,
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
      "Choose a valid Library folder before importing a clip",
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
