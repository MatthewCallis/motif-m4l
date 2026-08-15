import { joinMaxPath } from "../../src/max/max-helpers.js";

export interface MaxMocks {
  files: Record<string, string>;
  folders: Record<string, string[]>;
  outlets: unknown[][];
  errors: string[];
  posts: string[];
}

/**
 * Install deterministic Max globals (File, Folder, Task, outlet, error, post)
 * onto globalThis and return the mutable capture buffers used to assert behavior.
 * @returns {MaxMocks} Capture buffers for files, folders, outlets, errors, and posts.
 */
export function installMaxMocks(): MaxMocks {
  const mocks: MaxMocks = {
    files: {},
    folders: {},
    outlets: [],
    errors: [],
    posts: [],
  };

  class MockFile {
    isopen: boolean;
    eof: number;
    foldername = "/tmp";
    position = 0;
    filename: string;
    access: "read" | "write" | "readwrite";
    #buffer: string;

    constructor(filename = "", access: "read" | "write" | "readwrite" = "read") {
      this.filename = filename;
      this.access = access;
      this.isopen =
        access !== "read" || Object.prototype.hasOwnProperty.call(mocks.files, filename);
      this.#buffer = access === "write" ? "" : (mocks.files[filename] ?? "");
      this.eof = this.#buffer.length;
    }

    readstring(): string {
      return this.#buffer;
    }

    writestring(value: string): void {
      this.#buffer += value;
      this.eof = this.#buffer.length;
    }

    close(): void {
      if (this.access !== "read" && this.isopen) {
        mocks.files[this.filename] = this.#buffer;
        const basename = this.filename.split("/").pop() ?? this.filename;
        mocks.files[`/tmp/${basename}`] = this.#buffer;
      }
      this.isopen = false;
    }
  }

  class MockFolder {
    pathname: string;
    filename = "";
    #entries: string[];
    #index = 0;

    constructor(pathname: string) {
      const entries = mocks.folders[pathname];
      this.pathname = entries ? pathname : "";
      this.#entries = entries ?? [];
      this.filename = this.#entries[0] ?? "";
    }

    get count(): number {
      return this.#entries.length;
    }

    get end(): boolean {
      return this.#index >= this.#entries.length;
    }

    get extension(): string | null {
      const index = this.filename.lastIndexOf(".");
      return index < 0 ? null : this.filename.slice(index);
    }

    get filetype(): string | null {
      if (!this.pathname || !this.filename) {
        return null;
      }
      const fullPath = joinMaxPath(this.pathname, this.filename);
      if (Object.prototype.hasOwnProperty.call(mocks.folders, fullPath)) {
        return "fold";
      }
      return this.filename.toLowerCase().endsWith(".json") ? "JSON" : null;
    }

    next(): void {
      this.#index += 1;
      this.filename = this.#entries[this.#index] ?? "";
    }

    close(): void {
      this.#index = this.#entries.length;
    }
  }

  class MockTask {
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
      if (!this.#cancelled) {
        this.callback.apply(this.context, this.args);
      }
    }
  }

  Object.assign(globalThis, {
    File: MockFile,
    Folder: MockFolder,
    Task: MockTask,
    outlet: (_index: number, ...values: unknown[]) => mocks.outlets.push(values),
    error: (value: unknown) => mocks.errors.push(String(value)),
    post: (value: unknown) => mocks.posts.push(String(value)),
  });
  return mocks;
}
