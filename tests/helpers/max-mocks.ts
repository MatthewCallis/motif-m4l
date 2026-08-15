import { vi } from "vitest";
import { joinMaxPath } from "../../src/max/max-helpers.js";

export interface MaxMocks {
  files: Record<string, string>;
  folders: Record<string, string[]>;
  outlet: ReturnType<typeof vi.fn<(index: number, ...values: unknown[]) => void>>;
  error: ReturnType<typeof vi.fn<(value: unknown) => void>>;
  post: ReturnType<typeof vi.fn<(value: unknown) => void>>;
}

/**
 * Stub Max host globals with an in-memory File/Folder FS and `vi.fn` I/O.
 * @returns {MaxMocks} Mutable FS buffers and spy handles.
 */
export function installMaxMocks(): MaxMocks {
  const files: Record<string, string> = {};
  const folders: Record<string, string[]> = {};
  const outlet = vi.fn<(index: number, ...values: unknown[]) => void>();
  const error = vi.fn<(value: unknown) => void>();
  const post = vi.fn<(value: unknown) => void>();

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
      this.isopen = access !== "read" || Object.prototype.hasOwnProperty.call(files, filename);
      this.#buffer = access === "write" ? "" : (files[filename] ?? "");
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
        files[this.filename] = this.#buffer;
        const basename = this.filename.split("/").pop() ?? this.filename;
        files[`/tmp/${basename}`] = this.#buffer;
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
      const entries = folders[pathname];
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
      if (Object.prototype.hasOwnProperty.call(folders, fullPath)) {
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

  vi.stubGlobal("File", MockFile);
  vi.stubGlobal("Folder", MockFolder);
  vi.stubGlobal("Task", MockTask);
  vi.stubGlobal("outlet", outlet);
  vi.stubGlobal("error", error);
  vi.stubGlobal("post", post);

  return { files, folders, outlet, error, post };
}

/**
 * Collect string arguments passed to a Max console spy.
 * @param {ReturnType<typeof vi.fn>} spy `error` or `post` mock.
 * @returns {string[]} Stringified first arguments.
 */
export function mockMessages(spy: ReturnType<typeof vi.fn<(value: unknown) => void>>): string[] {
  return spy.mock.calls.map(([value]) => String(value));
}

/**
 * Outlet payloads without the Max outlet index.
 * @param {MaxMocks["outlet"]} outlet Stubbed `outlet`.
 * @returns {unknown[][]} Message atoms.
 */
export function outletLists(outlet: MaxMocks["outlet"]): unknown[][] {
  return outlet.mock.calls.map(([, ...values]) => values);
}
