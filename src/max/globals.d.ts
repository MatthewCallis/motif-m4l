/**
 * Ambient Max `v8` globals used by the Motif device bundle.
 *
 * These match the Max JavaScript host API available inside `[v8]` / `[js]`.
 * Song tempo, key, scale, meter, and transport stay on native `live.path` /
 * `live.observer` objects in the patch - do not sync those through LiveAPI.
 *
 * @see https://docs.cycling74.com/apiref/js/jsthis/
 */

/**
 * Inlet count assigned in global code (Motif uses 1).
 * @see https://docs.cycling74.com/apiref/js/jsthis/#inlets
 */
declare let inlets: number;
/**
 * Outlet count assigned in global code (Motif uses 1).
 * @see https://docs.cycling74.com/apiref/js/jsthis/#outlets
 */
declare let outlets: number;

/**
 * Send a Max message out of the `v8` object.
 * @param {number} index The zero-based outlet index.
 * @param {unknown[]} values The message atoms to send.
 * @returns {void}
 * @see https://docs.cycling74.com/apiref/js/jsthis/#outlet
 */
declare function outlet(index: number, ...values: unknown[]): void;

/**
 * Print values to the Max Console.
 * @param {unknown[]} values The values to print.
 * @returns {void}
 * @see https://docs.cycling74.com/apiref/js/post/
 */
declare function post(...values: unknown[]): void;

/**
 * Print a red error line to the Max Console.
 * @param {unknown[]} values The values to print.
 * @returns {void}
 * @see https://docs.cycling74.com/apiref/js/error/
 */
declare function error(...values: unknown[]): void;

/**
 * Iterate files in a directory (user motif library scan).
 * Max path separators may use `:` on some platforms.
 *
 * @see https://docs.cycling74.com/apiref/js/folder/
 */
declare class Folder {
  constructor(pathname: string);
  readonly count: number;
  readonly end: boolean;
  readonly extension: string | null;
  readonly pathname: string;
  readonly filename: string;
  readonly filetype: string | null;
  next(): void;
  close(): void;
}

/** Schedule non-time-critical work on Max's low-priority thread. */
declare class Task {
  constructor(callback: (...args: unknown[]) => void, context?: object, args?: unknown[]);
  cancel(): void;
  freepeer(): void;
  schedule(delay?: number): void;
}

/**
 * Read/write text files from Max JavaScript (motif JSON load/save).
 *
 * @see https://docs.cycling74.com/apiref/js/file/
 */
declare class File {
  constructor(filename?: string, access?: "read" | "write" | "readwrite", typelist?: string[]);
  readonly isopen: boolean;
  eof: number;
  readonly foldername: string;
  position: number;
  readstring(count: number): string;
  writestring(text: string): void;
  close(text?: string): void;
}

/** HTML source injected by the build into the frozen Max engine bundle. */
declare const __MOTIF_LIBRARY_HTML__: string;

/** Content-addressed filename used for the extracted jweb page. */
declare const __MOTIF_LIBRARY_PAGE_NAME__: string;

/**
 * Live Object Model access from JavaScript.
 *
 * Motif uses this **only** for on-demand clip note import (`import_clip`).
 * Continuous Song state (tempo, scale, meter, transport) must stay on native
 * `live.path` / `live.observer` in the patcher.
 *
 * @see https://docs.cycling74.com/apiref/js/liveapi/
 * @see https://docs.cycling74.com/userguide/m4l/live_api_overview/
 */
declare class LiveAPI {
  constructor(callback?: (args: unknown[]) => void, path?: string);
  id: number;
  get(property: string): number | number[];
  getstring(property: string): string | string[];
  call(method: string, ...args: unknown[]): unknown;
}
