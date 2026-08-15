import { afterEach, describe, expect, it, vi } from "vitest";
import { installMaxMocks, mockMessages, outletLists } from "../helpers/max-mocks.js";
import {
  canonicalMaxPath,
  discardAllowed,
  emit,
  emitError,
  emitStatus,
  fileExists,
  flattenValues,
  joinMaxPath,
  mirrorWebDebug,
  numbers,
  pathFromAtoms,
  prepareLibraryPage,
  readJsonFile,
  stringAtom,
  toggleEnabled,
  writeJsonFile,
} from "../../src/max/max-helpers.js";

describe("Max helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("normalizes atoms, paths, toggles, and outlet messages", () => {
    const mocks = installMaxMocks();
    expect(flattenValues([1, [2, 3], "four"])).toEqual([1, 2, 3, "four"]);
    expect(numbers([1, ["2", "bad"]])).toEqual([1, 2]);
    expect(stringAtom(true)).toBe("true");
    expect(stringAtom({}, "fallback")).toBe("fallback");
    expect(pathFromAtoms(["/tmp/My", "Library"])).toBe("/tmp/My Library");
    expect(joinMaxPath("/tmp", "file.json")).toBe("/tmp/file.json");
    expect(joinMaxPath("Volume:", "file.json")).toBe("Volume:file.json");
    expect(canonicalMaxPath("C:\\Foo//Bar")).toBe("c:/foo/bar");
    expect(toggleEnabled("on")).toBe(true);
    expect(toggleEnabled(0)).toBe(false);
    expect(discardAllowed(true)).toBe(true);
    expect(discardAllowed(0)).toBe(false);

    emit("value", 1);
    emitStatus("ready");
    emitError("broken");
    expect(outletLists(mocks.outlet)).toEqual([
      ["value", 1],
      ["status", "ready"],
      ["error", "broken"],
    ]);
    expect(mockMessages(mocks.error)[0] ?? "").toMatch(/Motif: broken/);
  });

  it("reads, writes, checks, and materializes Max files", () => {
    const mocks = installMaxMocks();
    mocks.files["/tmp/input.json"] = '{"value":1}';
    expect(readJsonFile("/tmp/input.json")).toEqual({ value: 1 });
    expect(fileExists("/tmp/input.json")).toBe(true);
    expect(fileExists("/tmp/missing.json")).toBe(false);

    writeJsonFile("/tmp/output.json", { value: 2 });
    expect(mocks.files["/tmp/output.json"] ?? "").toMatch(/"value": 2/);
    expect(prepareLibraryPage("library.html", "<!doctype html><p>ready</p>")).toBe(
      "/tmp/library.html",
    );
    expect(mocks.files["/tmp/library.html"] ?? "").toMatch(/ready/);
    expect(() => readJsonFile("/tmp/missing.json")).toThrow(/could not open/);
  });

  it("routes decoded and malformed web diagnostics to the correct console stream", () => {
    const mocks = installMaxMocks();
    mirrorWebDebug("library", "info", encodeURIComponent("ready now"));
    mirrorWebDebug("preview", "error", "%invalid");
    expect(mockMessages(mocks.post)[0] ?? "").toMatch(/ready now/);
    expect(mockMessages(mocks.error)[0] ?? "").toMatch(/%invalid/);
  });
});
