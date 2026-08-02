import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clampLibrarySidebarWidth,
  createStore,
  errorText,
  isFolderCollapsed,
  isLibrarySidebarLayout,
  isLibraryStateChunk,
  libraryBrowserDisplayName,
  optionalNumberValue,
  toggleCollapsedFolder,
} from "../src/max/library-logic.js";

describe("Library pure logic", () => {
  it("updates and unsubscribes from synchronous store state", () => {
    const store = createStore({ count: 0 });
    const observedCounts: number[] = [];
    const unsubscribe = store.subscribe((value) => observedCounts.push(value.count));

    store.setState({ count: 1 });
    store.setState((value) => ({ count: value.count + 1 }));
    unsubscribe();
    store.setState({ count: 3 });

    assert.equal(store.getState().count, 3);
    assert.deepEqual(observedCounts, [1, 2]);
  });

  it("normalizes errors and optional numbers", () => {
    assert.equal(errorText(new TypeError("bad value")), "TypeError: bad value");
    assert.equal(errorText("bad value"), "bad value");
    assert.equal(optionalNumberValue("  "), null);
    assert.equal(optionalNumberValue(" 1.5 "), 1.5);
  });

  it("resolves immutable folder toggles and search expansion", () => {
    const collapsed = new Set(["Tests"]);
    assert.equal(isFolderCollapsed("Tests", "", collapsed), true);
    assert.equal(isFolderCollapsed("Tests", "query", collapsed), false);

    const expanded = toggleCollapsedFolder("Tests", collapsed);
    const additional = toggleCollapsedFolder("Other", collapsed);
    assert.equal(expanded.has("Tests"), false);
    assert.equal(additional.has("Other"), true);
    assert.deepEqual([...collapsed], ["Tests"]);
  });

  it("removes only a matching leaf-folder prefix from browser labels", () => {
    assert.equal(
      libraryBrowserDisplayName("Chrono Trigger - Wind Scene", "Chrono Trigger"),
      "Wind Scene",
    );
    assert.equal(
      libraryBrowserDisplayName("chrono trigger - Frog's Theme", "Games/Chrono Trigger"),
      "Frog's Theme",
    );
    assert.equal(
      libraryBrowserDisplayName("Chrono Triggered - Wind Scene", "Chrono Trigger"),
      "Chrono Triggered - Wind Scene",
    );
    assert.equal(
      libraryBrowserDisplayName("Chrono Trigger - ", "Chrono Trigger"),
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
    assert.equal(clampLibrarySidebarWidth(80, 800, layout), 150);
    assert.equal(clampLibrarySidebarWidth(280, 800, layout), 280);
    assert.equal(clampLibrarySidebarWidth(900, 800, layout), 400);
    assert.equal(clampLibrarySidebarWidth(400, 560, layout), 252);
    assert.equal(clampLibrarySidebarWidth(Number.NaN, Number.NaN, layout), 240);
    assert.equal(isLibrarySidebarLayout(layout), true);
    assert.equal(isLibrarySidebarLayout({ ...layout, sidebarMaxWidth: 100 }), false);
  });

  it("narrows only Library state chunk envelopes", () => {
    assert.equal(isLibraryStateChunk(null), false);
    assert.equal(isLibraryStateChunk({ kind: "other" }), false);
    assert.equal(
      isLibraryStateChunk({
        kind: "state-chunk",
        transferId: 1,
        index: 0,
        total: 1,
        data: "state",
      }),
      true,
    );
  });
});
