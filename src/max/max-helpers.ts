/**
 * Small adapters around Max's ambient JavaScript host API.
 *
 * Keeping these in one module makes the device controller read like domain
 * logic while preserving the single-outlet protocol expected by the patch.
 */

/**
 * Open a Max host file without adopting Node's incompatible web `File` type.
 * Resolve the constructor per call so tests can install their Max host mock
 * after this module is evaluated.
 */
function openMaxFile(filename: string, access: "read" | "write" | "readwrite"): MaxFile {
  const HostFile = File as unknown as MaxFileConstructor;
  return new HostFile(filename, access);
}

/**
 * Send a list through the device's single Max outlet.
 * @param {unknown[]} values Message atoms.
 */
export function emit(...values: unknown[]): void {
  outlet(0, ...values);
}

/**
 * Emit a status message through the device's single Max outlet.
 * @param {unknown[]} values Status atoms following the selector.
 */
export function emitStatus(...values: unknown[]): void {
  emit("status", ...values);
}

/**
 * Emit an error both to the patch and the Max Console.
 * @param {string} message User-facing diagnostic.
 */
export function emitError(message: string): void {
  emit("error", message);
  error(`Motif: ${message}\n`);
}

/**
 * Flatten Max arguments that may contain nested atom arrays.
 * @param {unknown[]} values Possibly nested atoms.
 * @returns {unknown[]} One-dimensional atom list.
 */
export function flattenValues(values: unknown[]): unknown[] {
  const out: unknown[] = [];
  for (const value of values) {
    if (Array.isArray(value)) {
      out.push(...(value as unknown[]));
    } else {
      out.push(value);
    }
  }
  return out;
}

/**
 * Convert a JSON or Max atom to text without object stringification.
 * @param {unknown} value Atom to convert.
 * @param {string} fallback Value returned for arrays and objects.
 * @returns {string} Primitive text or the fallback.
 */
export function stringAtom(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
}

/**
 * Extract finite numbers from Max atoms.
 * @param {unknown[]} values Possibly nested atoms.
 * @returns {number[]} Finite numeric values.
 */
export function numbers(values: unknown[]): number[] {
  return flattenValues(values).map(Number).filter(Number.isFinite);
}

/**
 * Join an absolute Max folder path and a filename.
 * @param {string} folder Absolute parent path.
 * @param {string} filename Child filename.
 * @returns {string} Complete Max path.
 */
export function joinMaxPath(folder: string, filename: string): string {
  const separator = folder.endsWith("/") || folder.endsWith(":") ? "" : "/";
  return `${folder}${separator}${filename}`;
}

/**
 * Write text without crossing Max's per-call string limit.
 * @param {MaxFile} file Open output file.
 * @param {string} text Complete content.
 */
export function writeTextChunks(file: MaxFile, text: string): void {
  const chunkSize = 8_192;
  for (let offset = 0; offset < text.length; offset += chunkSize) {
    file.writestring(text.slice(offset, offset + chunkSize));
  }
}

/**
 * Read and parse a JSON file through Max's File API.
 * @param {string} filename Absolute Max path.
 * @returns {unknown} Parsed JSON value.
 * @throws {Error} When the file cannot be opened or parsed.
 */
export function readJsonFile(filename: string): unknown {
  const file = openMaxFile(filename, "read");
  if (!file.isopen) {
    throw new Error("could not open file");
  }
  try {
    return JSON.parse(file.readstring(file.eof));
  } finally {
    file.close();
  }
}

/**
 * Serialize a value as formatted JSON through Max's File API.
 * @param {string} filename Absolute Max path.
 * @param {unknown} value JSON-compatible value.
 * @throws {Error} When the file cannot be opened for writing.
 */
export function writeJsonFile(filename: string, value: unknown): void {
  const file = openMaxFile(filename, "write");
  if (!file.isopen) {
    throw new Error("could not open file for write");
  }
  try {
    file.writestring(`${JSON.stringify(value, null, 2)}\n`);
  } finally {
    file.close();
  }
}

/**
 * Test whether Max can open a path for reading.
 * @param {string} filename Absolute Max path.
 * @returns {boolean} Whether the file exists and is readable.
 */
export function fileExists(filename: string): boolean {
  const file = openMaxFile(filename, "read");
  const exists = file.isopen;
  if (exists) {
    file.close();
  }
  return exists;
}

/**
 * Normalize a path for case-insensitive collision checks.
 * @param {string} filename Local path.
 * @returns {string} Slash-normalized lowercase path.
 */
export function canonicalMaxPath(filename: string): string {
  return filename
    .replace(/\\/g, "/")
    .replace(/\/{2,}/g, "/")
    .toLowerCase();
}

/**
 * Assemble a filesystem path from Max atoms.
 * @param {unknown[]} values Path atoms.
 * @returns {string} Trimmed path with one surrounding quote pair removed.
 */
export function pathFromAtoms(values: unknown[]): string {
  return flattenValues(values)
    .map((value) => stringAtom(value))
    .filter(Boolean)
    .join(" ")
    .trim()
    .replace(/^"|"$/g, "");
}

/**
 * Treat Max's integer and symbolic toggle representations as a boolean.
 * @param {string | number | boolean} value Toggle atom.
 * @returns {boolean} Whether the toggle is enabled.
 */
export function toggleEnabled(value: string | number | boolean): boolean {
  return value === true || value === 1 || value === "1" || value === "true" || value === "on";
}

/**
 * Check whether a dirty-edit discard was explicitly approved.
 * @param {number | boolean | undefined} value Max boolean atom.
 * @returns {boolean} Whether discard permission was explicit.
 */
export function discardAllowed(value: number | boolean | undefined): boolean {
  return value === true || value === 1;
}

/**
 * Materialize the build-injected Library page in Max's temporary folder.
 * The reopened byte count guards against Max File API per-call truncation.
 * @param {string} pageName Content-addressed output filename.
 * @param {string} html Complete Library page source.
 * @returns {string} Absolute path suitable for jweb's `readfile` message.
 * @throws {Error} When the output cannot be created, reopened, or fully written.
 * @see https://docs.cycling74.com/apiref/js/file/
 * @see https://docs.cycling74.com/userguide/search_path/#path-prefixes
 * @see https://docs.cycling74.com/reference/jweb/#readfile
 */
export function prepareLibraryPage(pageName: string, html: string): string {
  const temporaryPath = `Tempfolder:/${pageName}`;
  let output: MaxFile | undefined;

  try {
    output = openMaxFile(temporaryPath, "write");
    if (!output.isopen) {
      throw new Error(`could not create ${temporaryPath}`);
    }

    output.eof = 0;
    output.position = 0;
    writeTextChunks(output, html);
    const absolutePath = joinMaxPath(output.foldername, pageName);
    output.close();
    output = undefined;

    const verification = openMaxFile(absolutePath, "read");
    if (!verification.isopen) {
      throw new Error(`could not reopen ${absolutePath}`);
    }
    const byteLength = verification.eof;
    verification.close();
    if (byteLength < html.length) {
      throw new Error(`wrote a truncated page to ${absolutePath} (${byteLength} bytes)`);
    }
    return absolutePath;
  } finally {
    if (output?.isopen) {
      output.close();
    }
  }
}

/**
 * Decode an embedded-page diagnostic and mirror it to the Max Console.
 * @param {string} page Embedded page identifier.
 * @param {string} level Diagnostic severity; `error` uses Max's red error stream.
 * @param {string} encodedMessage URL-encoded diagnostic text.
 */
export function mirrorWebDebug(page: string, level: string, encodedMessage: string): void {
  let message = String(encodedMessage);
  try {
    message = decodeURIComponent(message);
  } catch {
    // Preserve malformed diagnostics rather than losing the original evidence.
  }

  const line = `Motif jweb ${String(page)} [${String(level)}] ${message}\n`;
  if (String(level).toLowerCase() === "error") {
    error(line);
  } else {
    post(line);
  }
}
