import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { Window } from "happy-dom";
import { Fragment, h } from "preact";
import { encodeLibraryStateMessages } from "../../../../src/max/library/device/serialization.js";

// tsx's JSX transform still emits React.createElement for some .tsx loads;
// point that at Preact before the Library page module evaluates.
(globalThis as { React?: { createElement: typeof h; Fragment: typeof Fragment } }).React = {
  createElement: h,
  Fragment,
};

type OutletHandler = (...args: unknown[]) => void;

void describe("Library browser runtime", () => {
  const previous = {
    window: globalThis.window,
    document: globalThis.document,
    location: globalThis.location,
    HTMLElement: globalThis.HTMLElement,
    HTMLInputElement: globalThis.HTMLInputElement,
    HTMLTextAreaElement: globalThis.HTMLTextAreaElement,
    HTMLSelectElement: globalThis.HTMLSelectElement,
    HTMLButtonElement: globalThis.HTMLButtonElement,
    HTMLDivElement: globalThis.HTMLDivElement,
    HTMLSpanElement: globalThis.HTMLSpanElement,
    ResizeObserver: globalThis.ResizeObserver,
    requestAnimationFrame: globalThis.requestAnimationFrame,
    cancelAnimationFrame: globalThis.cancelAnimationFrame,
  };

  afterEach(() => {
    Object.assign(globalThis, previous);
  });

  void it("boots the typed controller, renders state, assembles chunks, and emits actions", async () => {
    const dom = new Window({ url: "file:///tmp/library.html" });
    const outlets: unknown[][] = [];
    let receiveData: ((...values: unknown[]) => void) | undefined;

    Object.assign(globalThis, {
      window: dom,
      document: dom.document,
      location: dom.location,
      HTMLElement: dom.HTMLElement,
      HTMLInputElement: dom.HTMLInputElement,
      HTMLTextAreaElement: dom.HTMLTextAreaElement,
      HTMLSelectElement: dom.HTMLSelectElement,
      HTMLButtonElement: dom.HTMLButtonElement,
      HTMLDivElement: dom.HTMLDivElement,
      HTMLSpanElement: dom.HTMLSpanElement,
      ResizeObserver: class {
        observe(): void {}
        unobserve(): void {}
        disconnect(): void {}
      },
      requestAnimationFrame: (callback: FrameRequestCallback) =>
        dom.setTimeout(() => callback(0), 0) as unknown as number,
      cancelAnimationFrame: (id: number) => dom.clearTimeout(id),
    });

    dom.document.body.innerHTML = '<div id="root"></div>';
    (dom as unknown as { max: unknown }).max = {
      outlet: ((...args: unknown[]) => {
        outlets.push(args);
      }) satisfies OutletHandler,
      bindInlet: (name: string, handler: (...values: unknown[]) => void) => {
        if (name === "receiveData") {
          receiveData = handler;
        }
      },
    };
    // happy-dom Window is assigned to globalThis.window; bridge reads window.max.
    (globalThis.window as unknown as { max: unknown }).max = (
      dom as unknown as { max: unknown }
    ).max;

    const moduleUrl = new URL("../../../../src/max/library/ui/main.ts", import.meta.url);
    moduleUrl.searchParams.set("t", String(Date.now()));
    await import(moduleUrl.href);
    // Flush Preact useEffect subscriptions before pushing device state.
    await new Promise((resolve) => setTimeout(resolve, 0));

    assert.ok(receiveData, "Library client must bind its Max inlet");
    assert.ok(outlets.some((args) => args[0] === "library_ready"));
    const { subscribeDebug } = await import("../../../../src/max/library/ui/bridge.js");
    let replayedDebug = "";
    const unsubscribeDebug = subscribeDebug((_entries, _level, message) => {
      replayedDebug = message;
    });
    unsubscribeDebug();
    assert.match(replayedDebug, /Bridge ready/);

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

    const doc = dom.document;
    const nameEdit = doc.getElementById("name-edit") as HTMLInputElement | null;
    assert.equal(nameEdit?.value, "Browser Test");
    assert.equal(
      (doc.getElementById("source-anchor-edit") as HTMLInputElement | null)?.value,
      "60",
    );
    assert.equal(doc.getElementById("source-anchor-name")?.textContent, "C3");
    assert.equal((doc.getElementById("source-root-edit") as HTMLInputElement | null)?.value, "0");
    assert.equal(doc.getElementById("source-root-name")?.textContent, "C");
    assert.equal(
      (doc.getElementById("source-scale-name-edit") as HTMLInputElement | null)?.value,
      "Major",
    );
    assert.equal(
      (doc.getElementById("source-scale-intervals-edit") as HTMLInputElement | null)?.value,
      "0, 2, 4, 5, 7, 9, 11",
    );
    assert.equal(doc.getElementById("note-rows")?.children.length, 2);
    assert.equal(doc.getElementById("browser-list")?.children.length, 4);
    assert.equal(doc.getElementById("browser-list")?.children[0]?.textContent, "▾ Library");
    assert.equal(
      doc.getElementById("browser-list")?.children[1]?.querySelector(".browser-name")?.textContent,
      "Scale Turn",
    );
    assert.equal(doc.getElementById("browser-list")?.children[2]?.textContent, "▾ Tests");
    assert.equal(
      doc.getElementById("browser-list")?.children[3]?.querySelector(".browser-name")?.textContent,
      "Browser Test",
    );
    const importClip = doc.getElementById("import-clip-btn") as HTMLButtonElement | null;
    assert.equal(importClip?.disabled, true);
    assert.equal(importClip?.title, "Finish or cancel editing before importing a clip");

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
    (doc.querySelector('[data-tag-mode="and"]') as HTMLButtonElement | null)?.click();
    assert.deepEqual(lastLibAction(), {
      type: "filter_motifs",
      query: "",
      tags: [],
      tagMode: "and",
    });

    outlets.length = 0;
    (doc.querySelector('[data-tag-mode="or"]') as HTMLButtonElement | null)?.click();
    assert.deepEqual(lastLibAction(), {
      type: "filter_motifs",
      query: "",
      tags: [],
      tagMode: "or",
    });

    outlets.length = 0;
    const demoChip = [...doc.querySelectorAll("#tag-filter-chips .tag-chip")].find(
      (button) => button.textContent === "demo",
    ) as HTMLButtonElement | undefined;
    assert.ok(demoChip);
    demoChip.click();
    assert.deepEqual(lastLibAction(), {
      type: "filter_motifs",
      query: "",
      tags: ["demo"],
      tagMode: "or",
    });
    assert.ok(doc.getElementById("save-motif-btn")?.classList.contains("accent"));
    assert.equal(doc.getElementById("edit-btn")?.classList.contains("accent"), false);
    const resizer = doc.getElementById("library-resizer");
    assert.ok(resizer);
    assert.equal(resizer.getAttribute("aria-valuemin"), "160");

    const tagInput = doc.getElementById("tag-edit-input") as HTMLInputElement | null;
    assert.ok(tagInput);
    tagInput.focus();
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.deepEqual(
      [...doc.querySelectorAll("#tag-suggestions button")].map((button) => button.textContent),
      ["scale"],
      "focusing an empty tag field should show unused popular tags",
    );
    tagInput.blur();

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
    assert.equal(saveBtn?.disabled, true);
    assert.equal(saveBtn?.textContent, "Library Folder Required");
    assert.match(doc.getElementById("edit-state")?.textContent ?? "", /Library folder required/);
    assert.equal(
      (doc.getElementById("import-clip-btn") as HTMLButtonElement | null)?.title,
      "Finish or cancel editing before importing a clip",
    );
    receiveData(encodeURIComponent(JSON.stringify(state)));
    await new Promise((resolve) => setTimeout(resolve, 0));

    const search = doc.getElementById("search") as HTMLInputElement | null;
    assert.ok(search);
    search.value = "stale query";
    search.dispatchEvent(new dom.Event("input", { bubbles: true }));
    (doc.getElementById("clear-search") as HTMLButtonElement | null)?.click();
    await new Promise((resolve) => setTimeout(resolve, 100));
    const filterActions = outlets.flatMap((args) => {
      if (args[0] !== "lib_action" || typeof args[1] !== "string") {
        return [];
      }
      const action = JSON.parse(decodeURIComponent(args[1])) as { type?: string; query?: string };
      return action.type === "filter_motifs" ? [action] : [];
    });
    assert.equal(filterActions.at(-1)?.query, "", "clearing search must cancel a stale debounce");

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
    assert.equal(doc.getElementById("note-rows")?.children.length, 40);

    const hotkeyInput = doc.getElementById("hotkey-input") as HTMLInputElement | null;
    assert.ok(hotkeyInput);
    hotkeyInput.value = "D3";
    hotkeyInput.dispatchEvent(new dom.Event("input", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    outlets.length = 0;
    (doc.getElementById("assign-hotkey-btn") as HTMLButtonElement | null)?.click();
    assert.ok(
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
    );

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
    (doc.getElementById("import-clip-btn") as HTMLButtonElement | null)?.click();
    assert.ok(
      outlets.some((args) => {
        if (args[0] !== "lib_action") {
          return false;
        }
        const action = JSON.parse(decodeURIComponent(String(args[1]))) as Record<string, unknown>;
        return action["type"] === "import_clip" && !("pitchMode" in action);
      }),
    );

    receiveData(encodeURIComponent(JSON.stringify(state)));
    await new Promise((resolve) => setTimeout(resolve, 0));

    (doc.querySelector('.panel-tab[data-panel="notes"]') as HTMLButtonElement | null)?.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(doc.getElementById("notes-panel")?.classList.contains("hidden"), false);

    outlets.length = 0;
    (doc.getElementById("choose-btn") as HTMLButtonElement | null)?.click();
    assert.ok(outlets.some((args) => args[0] === "choose_library"));

    const sourceAnchorInput = doc.getElementById("source-anchor-edit") as HTMLInputElement | null;
    assert.ok(sourceAnchorInput);
    sourceAnchorInput.focus();
    sourceAnchorInput.value = "61";
    sourceAnchorInput.dispatchEvent(new dom.Event("input", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(doc.getElementById("source-anchor-name")?.textContent, "C♯3");
    sourceAnchorInput.dispatchEvent(new dom.Event("change", { bubbles: true }));
    assert.ok(
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
    );

    const sourceRootInput = doc.getElementById("source-root-edit") as HTMLInputElement | null;
    assert.ok(sourceRootInput);
    sourceRootInput.value = "6";
    sourceRootInput.dispatchEvent(new dom.Event("input", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(doc.getElementById("source-root-name")?.textContent, "F♯");
    sourceRootInput.value = "";
    sourceRootInput.dispatchEvent(new dom.Event("input", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(doc.getElementById("source-root-name")?.textContent, "—");

    const hotkeyChip = doc.querySelector("#hotkey-list .hotkey-chip") as HTMLButtonElement | null;
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

    const pitchInput = doc.querySelector(
      "#note-rows .note-row input[type='number']",
    ) as HTMLInputElement | null;
    assert.ok(pitchInput);
    pitchInput.value = "4";
    outlets.length = 0;
    pitchInput.dispatchEvent(new dom.Event("change", { bubbles: true }));
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
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.equal(doc.getElementById("hotkey-list")?.textContent?.includes("None"), true);
    assert.equal(doc.getElementById("modal-title")?.textContent, "Source scale required");
    assert.equal(doc.getElementById("modal-cancel")?.classList.contains("hidden"), true);
    (doc.getElementById("modal-confirm") as HTMLButtonElement | null)?.click();

    dom.dispatchEvent(
      new dom.ErrorEvent("error", {
        message: "browser failure",
        filename: "library.html",
        lineno: 1,
      }),
    );
    receiveData("%broken");
    receiveData("%broken");
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.match(
      doc.getElementById("debug-panel")?.textContent ?? "",
      /Library data could not be displayed/,
    );
    doc.dispatchEvent(new dom.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    dom.close();
  });
});

void describe("Library canvas preview paint", () => {
  void it("paints empty and note payloads without throwing", async () => {
    const { paintLibraryPreview } = await import("../../../../src/max/library/ui/preview.js");
    const { buildMotifPreview, toMotifPreviewPaintData } =
      await import("../../../../src/core/preview.js");
    const { BUILTIN_MOTIFS } = await import("../../../../src/generated/builtins.js");
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
