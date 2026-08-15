import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { installMaxMocks } from "../../../helpers/max-mocks.js";
import { MotifStore } from "../../../../src/library/store.js";
import { MAX_LIBRARY_DEPTH } from "../../../../src/max/device-types.js";
import { MaxUserLibrary } from "../../../../src/max/library/device/repository.js";

describe("Max user library", () => {
  it("scans, groups, saves, and collision-protects a Max user library", () => {
    const mocks = installMaxMocks();
    const store = new MotifStore();
    const userMotif = { ...store.get("chromatic-turn")!, id: "user-one", name: "User One" };
    mocks.folders["/library"] = ["nested", "user-one.json"];
    mocks.folders["/library/nested"] = ["ignored.txt"];
    mocks.files["/library/user-one.json"] = JSON.stringify(userMotif);
    const errors: string[] = [];
    const statuses: unknown[][] = [];
    let changes = 0;
    const library = new MaxUserLibrary(store, {
      onError: (message) => errors.push(message),
      onStateChange: () => {
        changes += 1;
      },
      onStatus: (...values) => statuses.push(values),
      onContentsChanged: () => {
        changes += 1;
      },
    });

    assert.equal(library.selectPath("/library"), true);
    assert.equal(library.loaded, true);
    assert.equal(store.has("user-one"), true);
    assert.equal(library.browserFolder("scale-turn"), "Library");
    assert.equal(library.browserFolder("user-one"), "Library");
    assert.equal(library.uniqueId("User One"), "user-one-2");
    assert.equal(library.save("user-one"), "/library/user-one.json");
    assert.ok(changes > 0);
    assert.ok(statuses.some(([status]) => status === "library"));
    assert.equal(errors.length, 0);

    mocks.files["/library/collision.json"] = "{}";
    const collision = { ...userMotif, id: "collision" };
    assert.deepEqual(store.add(collision), []);
    assert.throws(() => library.save("collision"), /already exists/);
    assert.equal(library.isOccupied("/LIBRARY/collision.json"), true);
    assert.throws(() => library.save("missing"), /Unknown motif/);

    assert.equal(library.selectPath("/missing"), false);
    assert.equal(library.loaded, false);
    assert.ok(errors.some((message) => message.includes("not found")));
  });

  it("skips invalid, builtin-conflicting, and duplicate motif files during scan", () => {
    const mocks = installMaxMocks();
    const store = new MotifStore();
    const valid = { ...store.get("chromatic-turn")!, id: "user-valid", name: "Valid" };
    const duplicate = { ...valid, name: "Duplicate" };
    const builtinClash = { ...valid, id: "chromatic-turn", name: "Builtin Clash" };
    mocks.folders["/library"] = [
      "broken.json",
      "builtin.json",
      "valid.json",
      "duplicate.json",
      "nested",
    ];
    mocks.folders["/library/nested"] = ["deep.json"];
    mocks.files["/library/broken.json"] = '{"id":""}';
    mocks.files["/library/builtin.json"] = JSON.stringify(builtinClash);
    mocks.files["/library/valid.json"] = JSON.stringify(valid);
    mocks.files["/library/duplicate.json"] = JSON.stringify(duplicate);
    mocks.files["/library/nested/deep.json"] = JSON.stringify({
      ...valid,
      id: "nested-user",
      name: "Nested",
    });
    const errors: string[] = [];
    const statuses: unknown[][] = [];
    let stateChanges = 0;
    const library = new MaxUserLibrary(store, {
      onError: (message) => errors.push(message),
      onStateChange: () => {
        stateChanges += 1;
      },
      onStatus: (...values) => statuses.push(values),
      onContentsChanged: () => undefined,
    });

    assert.equal(library.selectPath("/library"), true);
    assert.equal(library.loaded, true);
    assert.equal(store.has("user-valid"), true);
    assert.equal(store.has("nested-user"), true);
    assert.equal(library.browserFolder("nested-user"), "nested");
    assert.equal(library.browserFolder("missing-user"), "Library");
    library.files.set("outside", "/elsewhere/outside.json");
    assert.equal(library.browserFolder("outside"), "Library");
    assert.ok(errors.some((message) => message.includes("broken.json")));
    assert.ok(errors.some((message) => message.includes("conflicts with a built-in")));
    assert.ok(errors.some((message) => message.includes("duplicate motif id")));

    const changesBefore = stateChanges;
    assert.equal(library.selectPath("/library"), false);
    assert.equal(stateChanges, changesBefore + 1);
    assert.equal(library.loaded, true);

    library.load("library-refreshed");
    assert.ok(statuses.some(([status]) => status === "library-refreshed"));
  });

  it("cancels mid-scan work and reports maximum folder depth", () => {
    const mocks = installMaxMocks();
    const store = new MotifStore();
    const errors: string[] = [];
    const library = new MaxUserLibrary(store, {
      onError: (message) => errors.push(message),
      onStateChange: () => undefined,
      onStatus: () => undefined,
      onContentsChanged: () => undefined,
    });

    const deferred: Array<() => void> = [];
    class DeferredTask {
      #cancelled = false;
      callback: (...args: unknown[]) => void;
      context?: object;
      args: unknown[];
      constructor(
        callback: (...args: unknown[]) => void,
        context: object = {},
        args: unknown[] = [],
      ) {
        this.callback = callback;
        this.context = context;
        this.args = args;
      }
      cancel(): void {
        this.#cancelled = true;
      }
      freepeer(): void {
        this.#cancelled = true;
      }
      schedule(): void {
        deferred.push(() => {
          if (!this.#cancelled) {
            this.callback.apply(this.context, this.args);
          }
        });
      }
    }
    Object.assign(globalThis, { Task: DeferredTask });
    mocks.folders["/slow"] = ["a.json"];
    mocks.files["/slow/a.json"] = JSON.stringify({
      ...store.get("chromatic-turn")!,
      id: "slow-user",
      name: "Slow",
    });

    assert.equal(library.selectPath("/slow"), true);
    assert.equal(library.scanning, true);
    assert.ok(library.scanTask);
    library.cancelScan();
    assert.equal(library.scanning, false);
    assert.equal(library.scanTask, undefined);
    assert.equal(store.has("slow-user"), false);

    let path = "/deep";
    mocks.folders[path] = ["child"];
    for (let depth = 0; depth < MAX_LIBRARY_DEPTH; depth += 1) {
      const child = `${path}/child`;
      mocks.folders[child] = ["child"];
      path = child;
    }
    mocks.folders[`${path}/child`] = [];
    Object.assign(globalThis, {
      Task: class ImmediateTask {
        callback: (...args: unknown[]) => void;
        context?: object;
        args: unknown[];
        constructor(
          callback: (...args: unknown[]) => void,
          context: object = {},
          args: unknown[] = [],
        ) {
          this.callback = callback;
          this.context = context;
          this.args = args;
        }
        cancel(): void {}
        freepeer(): void {}
        schedule(): void {
          this.callback.apply(this.context, this.args);
        }
      },
    });
    errors.length = 0;
    library.selectPath("/deep");
    assert.ok(errors.some((message) => message.includes("maximum library folder depth exceeded")));
  });
});
