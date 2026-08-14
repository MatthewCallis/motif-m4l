import { readFile } from "node:fs/promises";
import vm from "node:vm";

const COMPILED_ENGINE_NAME = /^motif-device-[a-f0-9]{12}\.js$/;

/**
 * Load the content-addressed Max engine referenced by Motif.maxpat.
 * @returns {Promise<{ filename: string; source: string }>} Hashed filename and compiled source.
 */
export async function loadCompiledEngine(): Promise<{ filename: string; source: string }> {
  const patch = JSON.parse(await readFile("max/Motif.maxpat", "utf8")) as {
    patcher: { dependency_cache: Array<{ name: string }> };
  };
  const filename = patch.patcher.dependency_cache
    .map(({ name }) => name)
    .find((name) => COMPILED_ENGINE_NAME.test(name));
  if (!filename) {
    throw new Error("Motif.maxpat is missing a content-addressed motif-device runtime");
  }
  return { filename, source: await readFile(`max/${filename}`, "utf8") };
}

export type OutletArgs = unknown[];

export interface EngineOptions {
  liveApi?: new (
    callback?: (args: unknown[]) => void,
    path?: string,
  ) => {
    id: number;
    get: (property: string) => number | number[];
    getstring: (property: string) => string | string[];
    call: (method: string, ...args: unknown[]) => unknown;
  };
  files?: Record<string, string>;
  folders?: Record<string, string[]>;
  deferTasks?: boolean;
}

export interface TestMaxEngine {
  dispatch: (message: string, ...args: unknown[]) => void;
  outlets: OutletArgs[];
  errors: string[];
  files: Record<string, string>;
  folderOpenPaths: string[];
  scheduledTaskDelays: number[];
  runScheduledTasks: (limit?: number) => number;
}

/**
 * Load the compiled Max bundle into a VM with deterministic File, Folder, Task,
 * LiveAPI, outlet, and Console doubles.
 * @param {EngineOptions} options Runtime adapter overrides.
 * @returns {Promise<TestMaxEngine>} Dispatchable isolated device runtime.
 */
export async function createEngine(options: EngineOptions = {}): Promise<TestMaxEngine> {
  const { filename, source } = await loadCompiledEngine();
  const outlets: OutletArgs[] = [];
  const errors: string[] = [];

  const LiveAPI =
    options.liveApi ??
    class {
      id = 0;
      get(): number {
        return 0;
      }
      getstring(): string {
        return "";
      }
      call(): unknown {
        return [];
      }
    };

  const files = options.files ?? {};
  const folders = options.folders ?? {};
  const folderOpenPaths: string[] = [];
  const scheduledTasks: Array<{ delay: number; execute: () => void }> = [];
  const scheduledTaskDelays: number[] = [];
  let currentMilliseconds = 1_000_000;

  class MockFile {
    isopen: boolean;
    eof: number;
    position = 0;
    #buffer = "";

    constructor(
      readonly filename: string,
      readonly access = "read",
    ) {
      this.isopen = access === "write" || Object.prototype.hasOwnProperty.call(files, filename);
      this.#buffer = access === "write" ? "" : (files[filename] ?? "");
      this.eof = this.#buffer.length;
    }

    readstring(): string {
      return this.#buffer;
    }

    writestring(text: string): void {
      this.#buffer += text;
      this.eof = this.#buffer.length;
    }

    close(): void {
      if (this.access === "write" && this.isopen) {
        files[this.filename] = this.#buffer;
      }
      this.isopen = false;
    }
  }

  class MockFolder {
    end: boolean;
    count: number;
    pathname: string;
    filename = "";
    #entries: string[];
    #index = 0;

    constructor(pathname: string) {
      folderOpenPaths.push(pathname);
      const entries = folders[pathname];
      this.pathname = entries ? pathname : "";
      this.#entries = entries ?? [];
      this.count = this.#entries.length;
      this.end = this.#entries.length === 0;
      this.filename = this.#entries[0] ?? "";
    }

    get extension(): string | null {
      const separator = this.filename.lastIndexOf(".");
      return separator < 0 ? null : this.filename.slice(separator);
    }

    get filetype(): string | null {
      if (!this.pathname || !this.filename) {
        return null;
      }
      const separator = this.pathname.endsWith("/") ? "" : "/";
      if (
        Object.prototype.hasOwnProperty.call(
          folders,
          `${this.pathname}${separator}${this.filename}`,
        )
      ) {
        return "fold";
      }
      return this.filename.toLowerCase().endsWith(".json") ? "JSON" : null;
    }

    next(): void {
      this.#index += 1;
      this.end = this.#index >= this.#entries.length;
      this.filename = this.#entries[this.#index] ?? "";
    }

    close(): void {
      this.end = true;
    }
  }

  class MockTask {
    #cancelled = false;

    constructor(
      readonly callback: (...args: unknown[]) => void,
      readonly context?: object,
      readonly args: unknown[] = [],
    ) {}

    cancel(): void {
      this.#cancelled = true;
    }

    freepeer(): void {
      this.#cancelled = true;
    }

    schedule(delay = 0): void {
      scheduledTaskDelays.push(delay);
      const execute = () => {
        if (!this.#cancelled) {
          this.callback.apply(this.context, this.args);
        }
      };
      if (options.deferTasks) {
        scheduledTasks.push({ delay, execute });
      } else {
        execute();
      }
    }
  }

  class MockDate extends Date {
    static override now(): number {
      return currentMilliseconds;
    }
  }

  const context = vm.createContext({
    outlet: (_index: number, ...values: unknown[]) => {
      outlets.push(values);
    },
    error: (message: string) => errors.push(String(message)),
    post: () => undefined,
    arrayfromargs: (values: IArguments | ArrayLike<unknown>) => Array.from(values),
    messagename: "",
    File: MockFile,
    Folder: MockFolder,
    Task: MockTask,
    LiveAPI,
    Date: MockDate,
    console,
  });

  vm.runInContext(source, context, { filename });

  return {
    dispatch(message: string, ...args: unknown[]) {
      (context as Record<string, unknown>).messagename = message;
      (context as Record<string, unknown>).__args = args;
      vm.runInContext("anything.apply(null, __args)", context);
    },
    outlets,
    errors,
    files,
    folderOpenPaths,
    scheduledTaskDelays,
    runScheduledTasks(limit = Number.POSITIVE_INFINITY) {
      let count = 0;
      while (scheduledTasks.length > 0 && count < limit) {
        const scheduled = scheduledTasks.shift();
        if (scheduled) {
          currentMilliseconds += Math.max(0, scheduled.delay);
          scheduled.execute();
        }
        count += 1;
      }
      return count;
    },
  };
}

/**
 * Decode the last Library state from direct or chunked outlet emissions.
 * @param {OutletArgs[]} outlets Captured Max outlet messages.
 * @returns {Record<string, unknown> | undefined} Latest complete state.
 */
export function lastLibState(outlets: OutletArgs[]): Record<string, unknown> | undefined {
  let latest: Record<string, unknown> | undefined;
  const transfers = new Map<
    number,
    {
      total: number;
      parts: string[];
      received: Set<number>;
    }
  >();
  for (const args of outlets) {
    if (args[0] !== "ui" || args[1] !== "lib" || typeof args[2] !== "string") {
      continue;
    }
    const payload = JSON.parse(decodeURIComponent(args[2])) as Record<string, unknown>;
    if (payload["kind"] !== "state-chunk") {
      latest = payload;
      continue;
    }
    const transferId = Number(payload["transferId"]);
    const index = Number(payload["index"]);
    const total = Number(payload["total"]);
    let transfer = transfers.get(transferId);
    if (!transfer) {
      transfer = {
        total,
        parts: new Array<string>(total),
        received: new Set<number>(),
      };
      transfers.set(transferId, transfer);
    }
    transfer.parts[index] = String(payload["data"]);
    transfer.received.add(index);
    if (transfer.received.size === transfer.total) {
      latest = JSON.parse(decodeURIComponent(transfer.parts.join(""))) as Record<string, unknown>;
      transfers.delete(transferId);
    }
  }
  return latest;
}

/**
 * Read the last encoded engine-owned state sent to the persistence parameter.
 * @param {OutletArgs[]} outlets Captured Max outlet messages.
 * @returns {string | undefined} Encoded snapshot.
 */
export function lastPersistedState(outlets: OutletArgs[]): string | undefined {
  const message = [...outlets]
    .reverse()
    .find((args) => args[0] === "persist" && typeof args[1] === "string");
  return message?.[1] as string | undefined;
}
