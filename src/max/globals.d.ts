/**
 * Ambient Max `v8` globals used by the Motif device bundle.
 *
 * These match the Max JavaScript host API available inside `[v8]` / `[js]`.
 * Song tempo, key, scale, meter, and transport stay on native `live.path` /
 * `live.observer` objects in the patch - do not sync those through LiveAPI.
 *
 * @see https://docs.cycling74.com/apiref/js/
 * @see https://docs.cycling74.com/apiref/js/jsthis/
 */

/** Inlet count assigned in global code (Motif uses 1). */
declare let inlets: number;
/** Outlet count assigned in global code (Motif uses 1). */
declare let outlets: number;

/**
 * Send a Max message out of the `v8` object.
 * @param {number} index The zero-based outlet index.
 * @param {unknown[]} values The message atoms to send.
 * @returns {void}
 * @see https://docs.cycling74.com/apiref/js/jsthis/
 */
declare function outlet(index: number, ...values: unknown[]): void;

/**
 * Print values to the Max Console.
 * @param {unknown[]} values The values to print.
 * @returns {void}
 * @see https://docs.cycling74.com/apiref/js/
 */
declare function post(...values: unknown[]): void;

/**
 * Print a red error line to the Max Console.
 * @param {unknown[]} values The values to print.
 * @returns {void}
 * @see https://docs.cycling74.com/apiref/js/
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
  end: boolean;
  count: number;
  pathname: string;
  filename: string;
  extension: string;
  next(): void;
  close(): void;
}

/**
 * Read/write text files from Max JavaScript (motif JSON load/save).
 *
 * @see https://docs.cycling74.com/apiref/js/file/
 */
declare class File {
  constructor(filename: string, access?: 'read' | 'write' | 'readwrite', typelist?: string);
  isopen: boolean;
  eof: number;
  position: number;
  readstring(count: number): string;
  writestring(text: string): void;
  close(): void;
}

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
  constructor(path?: string);
  id: number | string;
  get(property: string): unknown;
  set(property: string, value: unknown): void;
  call(method: string, ...args: unknown[]): unknown;
  goto(path: string): void;
}
