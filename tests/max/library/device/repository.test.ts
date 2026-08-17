import { afterEach, describe, expect, it, vi } from "vitest";
import { installMaxMocks } from "../../../helpers/max-mocks.js";
import { MotifStore } from "../../../../src/library/store.js";
import { MAX_LIBRARY_DEPTH } from "../../../../src/max/device-types.js";
import { MaxUserLibrary } from "../../../../src/max/library/device/repository.js";

describe("Max user library", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

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

    expect(library.selectPath("/library")).toBe(true);
    expect(library.loaded).toBe(true);
    expect(store.has("user-one")).toBe(true);
    expect(library.browserFolder("scale-turn")).toBe("Library");
    expect(library.browserFolder("user-one")).toBe("Library");
    expect(library.uniqueId("User One")).toBe("user-one-2");
    expect(library.save("user-one")).toBe("/library/user-one.json");
    expect(changes > 0).toBeTruthy();
    expect(statuses.some(([status]) => status === "library")).toBeTruthy();
    expect(errors.length).toBe(0);

    mocks.files["/library/collision.json"] = "{}";
    const collision = { ...userMotif, id: "collision" };
    expect(store.add(collision)).toEqual([]);
    expect(() => library.save("collision")).toThrow(/already exists/);
    expect(library.isOccupied("/LIBRARY/collision.json")).toBe(true);
    expect(() => library.save("missing")).toThrow(/Unknown motif/);

    expect(library.selectPath("/missing")).toBe(false);
    expect(library.loaded).toBe(false);
    expect(errors.some((message) => message.includes("not found"))).toBeTruthy();
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

    expect(library.selectPath("/library")).toBe(true);
    expect(library.loaded).toBe(true);
    expect(store.has("user-valid")).toBe(true);
    expect(store.has("nested-user")).toBe(true);
    expect(library.browserFolder("nested-user")).toBe("nested");
    expect(library.browserFolder("missing-user")).toBe("Library");
    library.files.set("outside", "/elsewhere/outside.json");
    expect(library.browserFolder("outside")).toBe("Library");
    expect(errors.some((message) => message.includes("broken.json"))).toBeTruthy();
    expect(errors.some((message) => message.includes("conflicts with a built-in"))).toBeTruthy();
    expect(errors.some((message) => message.includes("duplicate motif id"))).toBeTruthy();

    const changesBefore = stateChanges;
    expect(library.selectPath("/library")).toBe(false);
    expect(stateChanges).toBe(changesBefore + 1);
    expect(library.loaded).toBe(true);

    library.load("library-refreshed");
    expect(statuses.some(([status]) => status === "library-refreshed")).toBeTruthy();
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
    vi.stubGlobal("Task", DeferredTask);
    mocks.folders["/slow"] = ["a.json"];
    mocks.files["/slow/a.json"] = JSON.stringify({
      ...store.get("chromatic-turn")!,
      id: "slow-user",
      name: "Slow",
    });

    expect(library.selectPath("/slow")).toBe(true);
    expect(library.scanning).toBe(true);
    expect(library.scanTask).toBeTruthy();
    library.cancelScan();
    expect(library.scanning).toBe(false);
    expect(library.scanTask).toBe(undefined);
    expect(store.has("slow-user")).toBe(false);

    let path = "/deep";
    mocks.folders[path] = ["child"];
    for (let depth = 0; depth < MAX_LIBRARY_DEPTH; depth += 1) {
      const child = `${path}/child`;
      mocks.folders[child] = ["child"];
      path = child;
    }
    mocks.folders[`${path}/child`] = [];
    vi.stubGlobal(
      "Task",
      class ImmediateTask {
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
    );
    errors.length = 0;
    library.selectPath("/deep");
    expect(
      errors.some((message) => message.includes("maximum library folder depth exceeded")),
    ).toBeTruthy();
  });

  it("isolates malformed files, stale scans, visited roots, and vanished folders", () => {
    const mocks = installMaxMocks();
    const store = new MotifStore();
    const errors: string[] = [];
    class DeferredTask {
      callback: (...args: unknown[]) => void;
      constructor(callback: (...args: unknown[]) => void) {
        this.callback = callback;
      }
      cancel(): void {}
      freepeer(): void {}
      schedule(): void {}
    }
    vi.stubGlobal("Task", DeferredTask);
    mocks.folders["/library"] = [];
    mocks.files["/library/malformed.json"] = "{invalid";
    mocks.files["/library/rejected.json"] = JSON.stringify({
      ...store.get("chromatic-turn")!,
      id: "rejected",
      name: "Rejected",
    });
    const library = new MaxUserLibrary(store, {
      onError: (message) => errors.push(message),
      onStateChange: () => undefined,
      onStatus: () => undefined,
      onContentsChanged: () => undefined,
    });

    expect(library.selectPath("/library")).toBe(true);
    const staleScan = library.scanState!;
    library.loadMotifFile("/library/malformed.json", "malformed.json", staleScan);
    const add = staleScan.candidateStore.add.bind(staleScan.candidateStore);
    staleScan.candidateStore.add = () => ["forced candidate rejection"];
    library.loadMotifFile("/library/rejected.json", "rejected.json", staleScan);
    staleScan.candidateStore.add = add;
    expect(errors.some((message) => message.startsWith("malformed.json:"))).toBe(true);
    expect(errors.some((message) => message.includes("forced candidate rejection"))).toBe(true);

    library.scanGeneration += 1;
    library.finish(staleScan);
    expect(library.loaded).toBe(false);
    library.cancelScan();
    library.processBatch();

    expect(library.selectPath("/library")).toBe(true);
    const visitedScan = library.scanState!;
    visitedScan.current = undefined;
    visitedScan.pending.push({ pathname: "/library/", relativePath: "", depth: 0 });
    library.processBatch();
    expect(library.loaded).toBe(true);

    expect(library.load("library-refreshed")).toBe(true);
    const missingFolderScan = library.scanState!;
    missingFolderScan.current = undefined;
    missingFolderScan.pending.push({
      pathname: "/library/vanished",
      relativePath: "vanished",
      depth: 1,
    });
    library.processBatch();
    expect(library.loaded).toBe(true);
  });
});
