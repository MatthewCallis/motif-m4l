import { afterEach, describe, expect, it, vi } from "vitest";
import { encodeLibraryStateMessages } from "../../../../src/max/library/device/serialization.js";

describe("Library browser runtime", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("boots the typed controller, renders state, assembles chunks, and emits actions", async () => {
    const outlets: unknown[][] = [];
    let receiveData: ((...values: unknown[]) => void) | undefined;
    const outlet = vi.fn((...args: unknown[]) => {
      outlets.push(args);
    });
    const bindInlet = vi.fn((name: string, handler: (...values: unknown[]) => void) => {
      if (name === "receiveData") {
        receiveData = handler;
      }
    });

    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe(): void {}
        unobserve(): void {}
        disconnect(): void {}
      },
    );
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
      measureText: (text: string) => ({ width: text.length * 6 }),
      setTransform: vi.fn(),
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
    window.max = { outlet, bindInlet };
    document.body.innerHTML = '<div id="root"></div>';

    await import("../../../../src/max/library/ui/main.js");
    // Flush Preact useEffect subscriptions before pushing device state.
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(receiveData, "Library client must bind its Max inlet").toBeTruthy();
    if (!receiveData) {
      throw new Error("Library client must bind its Max inlet");
    }
    expect(outlets.some((args) => args[0] === "library_ready")).toBeTruthy();
    const { subscribeDebug } = await import("../../../../src/max/library/ui/bridge.js");
    let replayedDebug = "";
    const unsubscribeDebug = subscribeDebug((_entries, _level, message) => {
      replayedDebug = message;
    });
    unsubscribeDebug();
    expect(replayedDebug).toBeTruthy();
    expect(replayedDebug).toMatch(/Bridge ready/);

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
        triggerMode: "one-shot" as const,
        repeatRounding: "exact" as const,
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
    // Allow Preact store subscribers to flush.
    await new Promise((resolve) => setTimeout(resolve, 0));

    const doc = document;
    const nameEdit = doc.getElementById("name-edit") as HTMLInputElement | null;
    expect(nameEdit?.value).toBe("Browser Test");
    expect((doc.getElementById("source-anchor-edit") as HTMLInputElement | null)?.value).toBe("60");
    expect(doc.getElementById("source-anchor-name")?.textContent).toBe("C3");
    expect((doc.getElementById("source-root-edit") as HTMLInputElement | null)?.value).toBe("0");
    expect(doc.getElementById("source-root-name")?.textContent).toBe("C");
    expect((doc.getElementById("source-scale-name-edit") as HTMLInputElement | null)?.value).toBe(
      "Major",
    );
    expect(
      (doc.getElementById("source-scale-intervals-edit") as HTMLInputElement | null)?.value,
    ).toBe("0, 2, 4, 5, 7, 9, 11");
    expect(doc.getElementById("note-rows")?.children.length).toBe(2);
    expect(doc.getElementById("browser-list")?.children.length).toBe(4);
    expect(doc.getElementById("browser-list")?.children[0]?.textContent).toBe("▾ Library");
    expect(
      doc.getElementById("browser-list")?.children[1]?.querySelector(".browser-name")?.textContent,
    ).toBe("Scale Turn");
    expect(doc.getElementById("browser-list")?.children[2]?.textContent).toBe("▾ Tests");
    expect(
      doc.getElementById("browser-list")?.children[3]?.querySelector(".browser-name")?.textContent,
    ).toBe("Browser Test");
    const importClip = doc.getElementById("import-clip-btn") as HTMLButtonElement | null;
    expect(importClip?.disabled).toBe(true);
    expect(importClip?.title).toBe("Finish or cancel editing before importing a clip");

    const lastLibAction = (): Record<string, unknown> => {
      for (let index = outlets.length - 1; index >= 0; index -= 1) {
        const args = outlets[index];
        if (!args || args[0] !== "lib_action" || typeof args[1] !== "string") {
          continue;
        }
        return JSON.parse(decodeURIComponent(args[1])) as Record<string, unknown>;
      }
      throw new Error("expected a lib_action outlet");
    };

    outlets.length = 0;
    nameEdit!.value = "Browser Test Renamed";
    nameEdit!.dispatchEvent(new Event("input", { bubbles: true }));
    nameEdit!.dispatchEvent(new Event("change", { bubbles: true }));
    expect(lastLibAction()).toMatchObject({
      type: "edit_motif",
      properties: { name: "Browser Test Renamed" },
    });

    const descriptionEdit = doc.getElementById("description-edit") as HTMLTextAreaElement | null;
    expect(descriptionEdit).toBeTruthy();
    descriptionEdit!.value = "Updated description";
    descriptionEdit!.dispatchEvent(new Event("input", { bubbles: true }));
    descriptionEdit!.dispatchEvent(new Event("blur", { bubbles: true }));
    expect(lastLibAction()).toMatchObject({
      type: "edit_motif",
      properties: { description: "Updated description" },
    });

    outlets.length = 0;
    (doc.getElementById("save-motif-btn") as HTMLButtonElement | null)?.click();
    expect(lastLibAction()).toMatchObject({ type: "save_motif" });
    (doc.getElementById("cancel-edit-btn") as HTMLButtonElement | null)?.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(doc.getElementById("modal-title")?.textContent).toBe("Discard unsaved changes?");
    (doc.getElementById("modal-confirm") as HTMLButtonElement | null)?.click();
    expect(lastLibAction()).toEqual({ type: "cancel_edit" });

    receiveData(
      encodeURIComponent(
        JSON.stringify({
          ...state,
          libraryLoaded: false,
          libraryScanning: true,
          editing: { ...state.editing, active: false, dirty: false },
          actions: { ...state.actions, editing: false, canImportClip: false },
          selectedIndex: 0,
          selected: {
            ...state.selected,
            id: "scale-turn",
            name: "Scale Turn",
            isBuiltin: true,
            isPersisted: false,
          },
        }),
      ),
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect((doc.getElementById("import-clip-btn") as HTMLButtonElement | null)?.title).toBe(
      "Wait for the Library scan to finish",
    );
    expect(doc.getElementById("edit-state")?.textContent).toBe(
      "Built-in · Edit creates a user copy",
    );
    receiveData(encodeURIComponent(JSON.stringify(state)));
    await new Promise((resolve) => setTimeout(resolve, 0));
    window.dispatchEvent(new Event("resize"));

    outlets.length = 0;
    (doc.querySelector('[data-tag-mode="and"]') as HTMLButtonElement | null)?.click();
    expect(lastLibAction()).toEqual({
      type: "filter_motifs",
      query: "",
      tags: [],
      tagMode: "and",
    });

    outlets.length = 0;
    (doc.querySelector('[data-tag-mode="or"]') as HTMLButtonElement | null)?.click();
    expect(lastLibAction()).toEqual({
      type: "filter_motifs",
      query: "",
      tags: [],
      tagMode: "or",
    });

    outlets.length = 0;
    const demoChip = [...doc.querySelectorAll("#tag-filter-chips .tag-chip")].find(
      (button) => button.textContent === "demo",
    ) as HTMLButtonElement | undefined;
    expect(demoChip).toBeTruthy();
    demoChip!.click();
    expect(lastLibAction()).toEqual({
      type: "filter_motifs",
      query: "",
      tags: ["demo"],
      tagMode: "or",
    });
    expect(doc.getElementById("save-motif-btn")?.classList.contains("accent")).toBeTruthy();
    expect(doc.getElementById("edit-btn")?.classList.contains("accent")).toBe(false);
    const resizer = doc.getElementById("library-resizer");
    expect(resizer).toBeTruthy();
    expect(resizer!.getAttribute("aria-valuemin")).toBe("160");

    const tagInput = doc.getElementById("tag-edit-input") as HTMLInputElement | null;
    expect(tagInput).toBeTruthy();
    tagInput!.focus();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(
      [...doc.querySelectorAll("#tag-suggestions button")].map((button) => button.textContent),
    ).toEqual(["scale"]);
    tagInput!.blur();

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
    await new Promise((resolve) => setTimeout(resolve, 0));
    const saveBtn = doc.getElementById("save-motif-btn") as HTMLButtonElement | null;
    expect(saveBtn?.disabled).toBe(true);
    expect(saveBtn?.textContent).toBe("Library Folder Required");
    expect(doc.getElementById("edit-state")?.textContent ?? "").toMatch(/Library folder required/);
    expect((doc.getElementById("import-clip-btn") as HTMLButtonElement | null)?.title).toBe(
      "Finish or cancel editing before importing a clip",
    );
    receiveData(encodeURIComponent(JSON.stringify(state)));
    await new Promise((resolve) => setTimeout(resolve, 0));

    const search = doc.getElementById("search") as HTMLInputElement | null;
    expect(search).toBeTruthy();
    search!.value = "stale query";
    search!.dispatchEvent(new Event("input", { bubbles: true }));
    (doc.getElementById("clear-search") as HTMLButtonElement | null)?.click();
    await new Promise((resolve) => setTimeout(resolve, 100));
    const filterActions = outlets.flatMap((args) => {
      if (args[0] !== "lib_action" || typeof args[1] !== "string") {
        return [];
      }
      const action = JSON.parse(decodeURIComponent(args[1])) as { type?: string; query?: string };
      return action.type === "filter_motifs" ? [action] : [];
    });
    expect(filterActions[filterActions.length - 1]?.query).toBe("");

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
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(doc.getElementById("note-rows")?.children.length).toBe(40);

    const hotkeyInput = doc.getElementById("hotkey-input") as HTMLInputElement | null;
    expect(hotkeyInput).toBeTruthy();
    hotkeyInput!.value = "D3";
    hotkeyInput!.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    outlets.length = 0;
    (doc.getElementById("assign-hotkey-btn") as HTMLButtonElement | null)?.click();
    expect(
      outlets.some((args) => {
        if (args[0] !== "lib_action") {
          return false;
        }
        const action = JSON.parse(decodeURIComponent(String(args[1]))) as {
          type?: string;
          pitch?: string;
        };
        return action.type === "map_trigger" && action.pitch === "D3";
      }),
    ).toBeTruthy();

    // Disabled buttons do not fire in a real DOM; exercise import while enabled.
    receiveData(
      encodeURIComponent(
        JSON.stringify({
          ...state,
          editing: { ...state.editing, active: false, dirty: false },
          actions: {
            ...state.actions,
            editing: false,
            canImportClip: true,
            canSave: false,
          },
        }),
      ),
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    outlets.length = 0;
    (doc.getElementById("edit-btn") as HTMLButtonElement | null)?.click();
    expect(lastLibAction()).toEqual({ type: "begin_edit" });
    outlets.length = 0;
    (doc.getElementById("import-clip-btn") as HTMLButtonElement | null)?.click();
    expect(
      outlets.some((args) => {
        if (args[0] !== "lib_action") {
          return false;
        }
        const action = JSON.parse(decodeURIComponent(String(args[1]))) as Record<string, unknown>;
        return action["type"] === "import_clip" && !("pitchMode" in action);
      }),
    ).toBeTruthy();

    receiveData(encodeURIComponent(JSON.stringify(state)));
    await new Promise((resolve) => setTimeout(resolve, 0));

    (doc.querySelector('.panel-tab[data-panel="notes"]') as HTMLButtonElement | null)?.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(doc.getElementById("notes-panel")?.classList.contains("hidden")).toBe(false);
    (doc.querySelector('.panel-tab[data-panel="properties"]') as HTMLButtonElement | null)?.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(doc.getElementById("notes-panel")?.classList.contains("hidden")).toBe(true);

    outlets.length = 0;
    (doc.getElementById("choose-btn") as HTMLButtonElement | null)?.click();
    expect(outlets.some((args) => args[0] === "choose_library")).toBeTruthy();

    const sourceAnchorInput = doc.getElementById("source-anchor-edit") as HTMLInputElement | null;
    expect(sourceAnchorInput).toBeTruthy();
    sourceAnchorInput!.focus();
    sourceAnchorInput!.value = "61";
    sourceAnchorInput!.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(doc.getElementById("source-anchor-name")?.textContent).toBe("C♯3");
    sourceAnchorInput!.dispatchEvent(new Event("change", { bubbles: true }));
    expect(
      outlets.some((args) => {
        if (args[0] !== "lib_action") {
          return false;
        }
        const action = JSON.parse(decodeURIComponent(String(args[1]))) as {
          type?: unknown;
          properties?: { sourcePitchContext?: { anchorPitch?: unknown } };
        };
        return (
          action.type === "edit_motif" && action.properties?.sourcePitchContext?.anchorPitch === 61
        );
      }),
    ).toBeTruthy();

    const sourceRootInput = doc.getElementById("source-root-edit") as HTMLInputElement | null;
    expect(sourceRootInput).toBeTruthy();
    sourceRootInput!.value = "6";
    sourceRootInput!.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(doc.getElementById("source-root-name")?.textContent).toBe("F♯");
    sourceRootInput!.value = "";
    sourceRootInput!.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(doc.getElementById("source-root-name")?.textContent).toBe("—");

    const hotkeyChip = doc.querySelector("#hotkey-list .hotkey-chip") as HTMLButtonElement | null;
    expect(hotkeyChip).toBeTruthy();
    outlets.length = 0;
    hotkeyChip!.click();
    expect(
      outlets.some(
        (args) =>
          args[0] === "lib_action" &&
          decodeURIComponent(String(args[1])).includes('"type":"unmap_trigger"'),
      ),
    ).toBeTruthy();

    const pitchInput = doc.querySelector(
      "#note-rows .note-row input[type='number']",
    ) as HTMLInputElement | null;
    expect(pitchInput).toBeTruthy();
    pitchInput!.value = "4";
    outlets.length = 0;
    pitchInput!.dispatchEvent(new Event("change", { bubbles: true }));
    expect(
      outlets.some(
        (args) =>
          args[0] === "lib_action" &&
          decodeURIComponent(String(args[1])).includes('"type":"edit_note_at"'),
      ),
    ).toBeTruthy();

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
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(doc.getElementById("hotkey-list")?.textContent?.includes("None")).toBe(true);
    expect(doc.getElementById("modal-title")?.textContent).toBe("Source scale required");
    expect(doc.getElementById("modal-cancel")?.classList.contains("hidden")).toBe(true);
    (doc.getElementById("modal-confirm") as HTMLButtonElement | null)?.click();

    window.dispatchEvent(
      new ErrorEvent("error", {
        message: "browser failure",
        filename: "library.html",
        lineno: 1,
      }),
    );
    receiveData("%broken");
    receiveData("%broken");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(doc.getElementById("debug-panel")?.textContent ?? "").toMatch(
      /Library data could not be displayed/,
    );
    doc.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
});

describe("Library canvas preview paint", () => {
  it("paints empty and note payloads without throwing", async () => {
    const { paintLibraryPreview } = await import("../../../../src/max/library/ui/preview.js");
    const { buildMotifPreview, toMotifPreviewPaintData } =
      await import("../../../../src/core/preview.js");
    const { BUILTIN_MOTIFS } = await import("../../../../src/generated/builtins.js");
    const chromaticTurn = BUILTIN_MOTIFS.find(({ id }) => id === "chromatic-turn");
    expect(chromaticTurn).toBeTruthy();

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
    expect(calls.includes("clear")).toBeTruthy();
    expect(calls.some((entry) => entry.startsWith("text:Select a motif"))).toBeTruthy();

    const paint = toMotifPreviewPaintData(
      buildMotifPreview(
        chromaticTurn!,
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
    expect(calls.includes("fill")).toBeTruthy();
    expect(calls.some((entry) => entry.startsWith("text:"))).toBeTruthy();
  });
});
