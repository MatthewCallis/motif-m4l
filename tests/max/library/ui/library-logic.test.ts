import { describe, it, expect } from "vitest";
import { normalizeTagFilterMode } from "../../../../src/library/tags.js";
import {
  addTagSelection,
  isFolderCollapsed,
  libraryBrowserDisplayName,
  removeTagSelection,
  suggestTags,
  toggleCollapsedFolder,
  toggleTagSelection,
} from "../../../../src/max/library/ui/browser-model.js";
import { createStore } from "../../../../src/max/library/ui/page-store.js";
import { NOTE_EDIT_FIELDS } from "../../../../src/library/note-edit-schema.js";
import { propertiesFromDraft } from "../../../../src/max/library/ui/bridge.js";
import {
  NOTE_FIELDS,
  emptyPropertyDraft,
  initialLibraryPageState,
  optionalNumberValue,
  propertyDraftFromSelected,
} from "../../../../src/max/library/ui/page-state.js";
import {
  isLibraryStateChunk,
  type LibrarySelectedMotifData,
} from "../../../../src/max/library/protocol.js";
import {
  clampLibrarySidebarWidth,
  isLibrarySidebarLayout,
} from "../../../../src/max/library/ui/sidebar-layout.js";

describe("Library pure logic", () => {
  it("updates and unsubscribes from synchronous store state", () => {
    const store = createStore({ count: 0 });
    const observedCounts: number[] = [];
    const unsubscribe = store.subscribe((value) => observedCounts.push(value.count));

    store.setState({ count: 1 });
    store.setState((value) => ({ count: value.count + 1 }));
    unsubscribe();
    store.setState({ count: 3 });

    expect(store.getState().count).toBe(3);
    expect(observedCounts).toEqual([1, 2]);
  });

  it("normalizes optional numbers", () => {
    expect(optionalNumberValue("  ")).toBe(null);
    expect(optionalNumberValue(" 1.5 ")).toBe(1.5);
  });

  it("resolves immutable folder toggles and search expansion", () => {
    const collapsed = new Set(["Tests"]);
    expect(isFolderCollapsed("Tests", "", collapsed)).toBe(true);
    expect(isFolderCollapsed("Tests", "query", collapsed)).toBe(false);
    expect(isFolderCollapsed("Tests", "", collapsed, ["demo"])).toBe(false);

    const expanded = toggleCollapsedFolder("Tests", collapsed);
    const additional = toggleCollapsedFolder("Other", collapsed);
    expect(expanded.has("Tests")).toBe(false);
    expect(additional.has("Other")).toBe(true);
    expect([...collapsed]).toEqual(["Tests"]);
  });

  it("toggles, adds, removes, and suggests tags without mutation", () => {
    const selected = ["Demo"];
    expect(toggleTagSelection("demo", selected)).toEqual([]);
    expect(toggleTagSelection("Scale", selected)).toEqual(["Demo", "Scale"]);
    expect(toggleTagSelection("   ", selected)).toEqual(["Demo"]);
    expect(addTagSelection(selected, " demo ")).toEqual(["Demo"]);
    expect(addTagSelection(selected, "lick")).toEqual(["Demo", "lick"]);
    expect(addTagSelection(selected, "  ")).toEqual(["Demo"]);
    expect(removeTagSelection(["Demo", "Scale"], "demo")).toEqual(["Scale"]);
    expect(removeTagSelection(["Demo", "Scale"], "   ")).toEqual(["Demo", "Scale"]);
    expect(suggestTags(["demo", "scale", "lick"], ["Demo"], "li")).toEqual(["lick"]);
    expect(suggestTags(["demo", "scale", "lick", "phrase"], [], "", 1)).toEqual(["demo"]);
    expect(normalizeTagFilterMode("and")).toBe("and");
    expect(normalizeTagFilterMode("nope")).toBe("or");
    expect(selected).toEqual(["Demo"]);
  });

  it("removes only a matching leaf-folder prefix from browser labels", () => {
    expect(libraryBrowserDisplayName("Chrono Trigger - Wind Scene", "Chrono Trigger")).toBe(
      "Wind Scene",
    );
    expect(libraryBrowserDisplayName("chrono trigger - Frog's Theme", "Games/Chrono Trigger")).toBe(
      "Frog's Theme",
    );
    expect(libraryBrowserDisplayName("Chrono Triggered - Wind Scene", "Chrono Trigger")).toBe(
      "Chrono Triggered - Wind Scene",
    );
    expect(libraryBrowserDisplayName("Chrono Trigger - ", "Chrono Trigger")).toBe(
      "Chrono Trigger - ",
    );
  });

  it("bounds sidebar width while preserving a useful detail pane", () => {
    const layout = {
      sidebarMinWidth: 150,
      sidebarMaxWidth: 400,
      detailMinWidth: 300,
      sidebarResizerWidth: 8,
    };
    expect(clampLibrarySidebarWidth(80, 800, layout)).toBe(150);
    expect(clampLibrarySidebarWidth(280, 800, layout)).toBe(280);
    expect(clampLibrarySidebarWidth(900, 800, layout)).toBe(400);
    expect(clampLibrarySidebarWidth(400, 560, layout)).toBe(252);
    expect(clampLibrarySidebarWidth(Number.NaN, Number.NaN, layout)).toBe(240);
    expect(isLibrarySidebarLayout(layout)).toBe(true);
    expect(isLibrarySidebarLayout({ ...layout, sidebarMaxWidth: 100 })).toBe(false);
  });

  it("narrows only Library state chunk envelopes", () => {
    expect(isLibraryStateChunk(null)).toBe(false);
    expect(isLibraryStateChunk({ kind: "other" })).toBe(false);
    expect(
      isLibraryStateChunk({
        kind: "state-chunk",
        transferId: 1,
        index: 0,
        total: 1,
        data: "state",
      }),
    ).toBe(true);
  });

  it("keeps Library note fields aligned with the shared edit schema", () => {
    expect(NOTE_FIELDS.map((field) => field.name)).toEqual([...NOTE_EDIT_FIELDS]);
  });

  it("projects selected motif fields into a property draft", () => {
    expect(propertyDraftFromSelected(null)).toEqual(emptyPropertyDraft());
    const initial = initialLibraryPageState();
    expect(initial.server).toBe(null);
    expect(initial.formDirty).toBe(false);
    expect(initial.activePanel).toBe("properties");
    expect(initial.editTags).toEqual([]);

    const selected = {
      name: "Draft",
      description: "Notes",
      pitchMode: "",
      triggerMode: "",
      repeatRounding: "",
      sourcePitchContext: {
        anchorPitch: 60,
        scaleRootNote: 2,
        scaleName: "Major",
        scaleIntervals: [0, 2, 4],
      },
      sourceMeter: { numerator: 3, denominator: 8 },
      defaultGate: 0.8,
      velocityCurve: {
        inputMin: 1,
        inputMax: 127,
        outputMin: 10,
        outputMax: 100,
        exponent: 1.5,
      },
    } as unknown as LibrarySelectedMotifData;
    const draft = propertyDraftFromSelected(selected);
    expect(draft.name).toBe("Draft");
    expect(draft.pitchMode).toBe("scale");
    expect(draft.triggerMode).toBe("one-shot");
    expect(draft.repeatRounding).toBe("exact");
    expect(draft.sourceAnchor).toBe("60");
    expect(draft.sourceRoot).toBe("2");
    expect(draft.sourceScaleIntervals).toBe("0, 2, 4");
    expect(draft.meterNumerator).toBe("3");
    expect(draft.defaultGate).toBe("0.8");
    expect(draft.curveExponent).toBe("1.5");
  });

  it("serializes draft intervals and omits an empty list", () => {
    const draft = {
      ...emptyPropertyDraft(),
      name: "Split",
      sourceAnchor: "60",
      sourceRoot: "0",
      sourceScaleName: "Major",
      sourceScaleIntervals: "0, 2  4,7",
      meterNumerator: "4",
      meterDenominator: "4",
    };
    const filled = propertiesFromDraft(draft, ["demo"]);
    expect(filled["tags"]).toEqual(["demo"]);
    expect(filled["sourcePitchContext"]).toEqual({
      anchorPitch: 60,
      scaleRootNote: 0,
      scaleName: "Major",
      scaleIntervals: ["0", "2", "4", "7"],
    });
    expect(
      propertiesFromDraft({ ...draft, sourceScaleIntervals: "  ,  " }, [])["sourcePitchContext"],
    ).toEqual({
      anchorPitch: 60,
      scaleRootNote: 0,
      scaleName: "Major",
      scaleIntervals: null,
    });
  });
});
