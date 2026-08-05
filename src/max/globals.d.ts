// oxlint-disable typescript/no-explicit-any
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
 *
 * Continuous Song state (tempo, scale, meter, transport) must stay on native `live.path` / `live.observer` in the patcher.
 *
 * @see https://docs.cycling74.com/apiref/js/liveapi/
 * @see https://docs.cycling74.com/userguide/m4l/live_api_overview/
 */
declare class LiveAPI {
  constructor(callback?: (args: unknown[]) => void, path?: string);
  /**
   * An array of children of the object at the current path
   * @see https://docs.cycling74.com/apiref/js/liveapi/#children
   */
  children: string[];
  /**
   * The id of the Live object referred to by the LiveAPI object.
   * These ids are dynamic and awarded in realtime from the Live application, so should not be stored and used over multiple runs of Max for Live.
   * @see https://docs.cycling74.com/apiref/js/liveapi/#id
   */
  id: number;
  /**
   * A description of the object at the current path, including id, type, children, properties and functions
   * @readonly
   * @see https://docs.cycling74.com/apiref/js/liveapi/#info
   */
  info: string;
  /**
   * The follow mode of the LiveAPI object. 0 (default) means that LiveAPI follows the object referred to by the path, even if it is moved in the Live user interface.
   *
   * For instance, consider a Live Set with two tracks, "Track 1" and "Track 2", left and right respectively.
   * If your LiveAPI object's path is live_set tracks 0, the left-most track, it will refer to "Track 1".
   * Should the position of "Track 1" change, such that it is now to the right of "Track 2", the LiveAPI object continues to refer to "Track 1".
   * A mode of 1 means that LiveAPI updates the followed object based on its location in the Live user interface.
   * In the above example, the LiveAPI object would always refer to the left-most track, updating its id when the object at that position in the user interface changes.
   * @see https://docs.cycling74.com/apiref/js/liveapi/#mode
   */
  mode: number;
  /**
   * The patcher of the LiveAPI object, as passed into the constructor.
   * @readonly
   * @see https://docs.cycling74.com/apiref/js/liveapi/#patcher
   */
  patcher: object;
  /**
   * The path to the Live object referred to by the LiveAPI object.
   * These paths are dependent on the currently open Set in Live, but are otherwise stable:
   * `live_set tracks 0 devices 0` will always refer to the first device of the first track of the open Live Set.
   * @see https://docs.cycling74.com/apiref/js/liveapi/#path
   */
  path: string;
  /**
   * The observed property, child or child-list of the object at the current path, if desired.
   * For instance, if the LiveAPI object refers to `live_set tracks 1`, setting the property to `mute` would cause changes to the `mute` property of the 2nd track to be reported to the callback function defined in the LiveAPI Constructor.
   * @see https://docs.cycling74.com/apiref/js/liveapi/#property
   */
  property: string;
  /**
   * The type of the currently observed property or child
   * The types of the properties and children are given in the Live Object Model.
   * @readonly
   * @see https://docs.cycling74.com/apiref/js/liveapi/#proptype
   */
  proptype: string;
  /**
   * The type of the object at the current path
   * Please see the Live API Overview and Live Object Model documents for more information.
   * @readonly
   * @see https://docs.cycling74.com/apiref/js/liveapi/#type
   */
  type: string;
  /**
   * The path to the Live object referred to by the LiveAPI object, without any quoting (the path property contains a quoted path)
   * These paths are dependent on the currently open Set in Live, but are otherwise stable:
   * `live_set tracks 0 devices 0` will always refer to the first device of the first track of the open Live Set.
   * @see https://docs.cycling74.com/apiref/js/liveapi/#unquotedpath
   */
  unquotedpath: string;
  /**
   * Whether the LiveAPI object refers to a valid Live object
   * @readonly
   * @see https://docs.cycling74.com/apiref/js/liveapi/#valid
   */
  valid: number;
  /**
   * Calls the given function of the current object, optionally with a list of arguments.
   * @param {string} method The method name.
   * @param {unknown[]} args The method arguments.
   * @returns {unknown} The method return value.
   * @see https://docs.cycling74.com/apiref/js/liveapi/#call
   */
  call(method: string, ...args: unknown[]): unknown;
  /**
   * Returns the value or list of values of the specified property of the current object.
   * @param {string} property The property name.
   * @returns {number | number[]} The property value.
   * @see https://docs.cycling74.com/apiref/js/liveapi/#get
   */
  get(property: string): number | number[];
  /**
   * The count of children of the object at the current path.
   * @param {string} child The child to count children of.
   * @returns {number} The number of children.
   * @see https://docs.cycling74.com/apiref/js/liveapi/#getcount
   */
  getcount(child: string): number;
  /**
   * Returns the value or list of values of the specified property of the current object as a String object.
   * @param {string} property The property name.
   * @returns {string | string[]} The property value.
   * @see https://docs.cycling74.com/apiref/js/liveapi/#getstring
   */
  getstring(property: string): string | string[];
  /**
   * Navigates to the path and causes the id of the object at that path out be sent to the callback function defined in the Constructor.
   * If there is no object at the path, id 0 is sent.
   * @param {string} path The path to navigate to.
   * @see https://docs.cycling74.com/apiref/js/liveapi/#goto
   */
  goto(path: string): void;
  /**
   * Sets the value or list of values of the specified property of the current object.
   * @param {string} property The object's property to set.
   * @param {any} value The new value or values of the property.
   * @see https://docs.cycling74.com/apiref/js/liveapi/#set
   */
  set(property: string, value: any): void;
}
