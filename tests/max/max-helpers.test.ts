import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { installMaxMocks } from "../helpers/max-mocks.js";
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
  it("normalizes atoms, paths, toggles, and outlet messages", () => {
    const mocks = installMaxMocks();
    assert.deepEqual(flattenValues([1, [2, 3], "four"]), [1, 2, 3, "four"]);
    assert.deepEqual(numbers([1, ["2", "bad"]]), [1, 2]);
    assert.equal(stringAtom(true), "true");
    assert.equal(stringAtom({}, "fallback"), "fallback");
    assert.equal(pathFromAtoms(["/tmp/My", "Library"]), "/tmp/My Library");
    assert.equal(joinMaxPath("/tmp", "file.json"), "/tmp/file.json");
    assert.equal(joinMaxPath("Volume:", "file.json"), "Volume:file.json");
    assert.equal(canonicalMaxPath("C:\\Foo//Bar"), "c:/foo/bar");
    assert.equal(toggleEnabled("on"), true);
    assert.equal(toggleEnabled(0), false);
    assert.equal(discardAllowed(true), true);
    assert.equal(discardAllowed(0), false);

    emit("value", 1);
    emitStatus("ready");
    emitError("broken");
    assert.deepEqual(mocks.outlets, [
      ["value", 1],
      ["status", "ready"],
      ["error", "broken"],
    ]);
    assert.match(mocks.errors[0] ?? "", /Motif: broken/);
  });

  it("reads, writes, checks, and materializes Max files", () => {
    const mocks = installMaxMocks();
    mocks.files["/tmp/input.json"] = '{"value":1}';
    assert.deepEqual(readJsonFile("/tmp/input.json"), { value: 1 });
    assert.equal(fileExists("/tmp/input.json"), true);
    assert.equal(fileExists("/tmp/missing.json"), false);

    writeJsonFile("/tmp/output.json", { value: 2 });
    assert.match(mocks.files["/tmp/output.json"] ?? "", /"value": 2/);
    assert.equal(
      prepareLibraryPage("library.html", "<!doctype html><p>ready</p>"),
      "/tmp/library.html",
    );
    assert.match(mocks.files["/tmp/library.html"] ?? "", /ready/);
    assert.throws(() => readJsonFile("/tmp/missing.json"), /could not open/);
  });

  it("routes decoded and malformed web diagnostics to the correct console stream", () => {
    const mocks = installMaxMocks();
    mirrorWebDebug("library", "info", encodeURIComponent("ready now"));
    mirrorWebDebug("preview", "error", "%invalid");
    assert.match(mocks.posts[0] ?? "", /ready now/);
    assert.match(mocks.errors[0] ?? "", /%invalid/);
  });
});
