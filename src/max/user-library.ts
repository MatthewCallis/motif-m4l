import { MotifStore, uniqueMotifId } from "../library/store.js";
import { validateMotif } from "../library/validate.js";
import {
  LIBRARY_SCAN_BATCH_SIZE,
  MAX_LIBRARY_DEPTH,
  type LibraryScanState,
} from "./device-types.js";
import {
  canonicalMaxPath,
  fileExists,
  joinMaxPath,
  readJsonFile,
  writeJsonFile,
} from "./max-helpers.js";

/** Status emitted after an initial scan or explicit refresh commits. */
export type LibraryCompletionStatus = "library" | "library-refreshed" | "unavailable";

interface MaxUserLibraryCallbacks {
  /** Report a user-facing diagnostic. */
  onError: (message: string) => void;
  /** Request UI serialization without a catalog change. */
  onStateChange: () => void;
  /** Emit a Max status message. */
  onStatus: (...values: unknown[]) => void;
  /** Notify the controller after catalog replacement or loss. */
  onContentsChanged: (status: LibraryCompletionStatus) => void;
}

/**
 * Max-backed user motif repository.
 *
 * Owns filesystem identity, collision protection, and incremental scanning.
 * The supplied MotifStore remains the in-memory source of truth.
 */
export class MaxUserLibrary {
  /** Selected absolute library root. */
  path = "";
  /** Whether the selected root completed a successful scan. */
  loaded = false;
  /** Whether an incremental scan is active. */
  scanning = false;
  /** Progress and candidate state for the active scan. */
  scanState: LibraryScanState | undefined;
  /** Absolute JSON filename for every loaded user motif id. */
  files = new Map<string, string>();
  /** Case-normalized filesystem paths already traversed. */
  occupiedPaths = new Set<string>();
  /** Incremental scan generation token. */
  scanGeneration = 0;
  /** Low-priority directory-entry batch task. */
  scanTask: Task | undefined;

  /**
   * Create a repository around an in-memory motif catalog.
   * @param {MotifStore} store Catalog replaced after successful scans.
   * @param {MaxUserLibraryCallbacks} callbacks Controller integration hooks.
   */
  constructor(
    readonly store: MotifStore,
    readonly callbacks: MaxUserLibraryCallbacks,
  ) {}

  /**
   * Return the root-relative browser folder for a motif.
   * @param {string} id Stable motif id.
   * @returns {string} `Library` or a nested relative folder.
   */
  browserFolder(id: string): string {
    if (this.store.isBuiltin(id) || !this.path) {
      return "Library";
    }
    const filename = this.files.get(id);
    if (!filename) {
      return "Library";
    }

    const root = this.path.replace(/\\/g, "/").replace(/\/+$/, "");
    const normalized = filename.replace(/\\/g, "/");
    const prefix = `${root}/`;
    if (!normalized.toLowerCase().startsWith(prefix.toLowerCase())) {
      return "Library";
    }

    const relative = normalized.slice(prefix.length);
    const separator = relative.lastIndexOf("/");
    return separator < 0 ? "Library" : relative.slice(0, separator);
  }

  /**
   * Build the expected root-level JSON path for a motif id.
   * @param {string} id Stable motif id.
   * @returns {string} Absolute Max path.
   */
  filePath(id: string): string {
    const separator = this.path.endsWith("/") || this.path.endsWith(":") ? "" : "/";
    return `${this.path}${separator}${id}.json`;
  }

  /**
   * Reserve a path against future generated-id saves.
   * @param {string} filename Absolute JSON path.
   */
  reserve(filename: string): void {
    this.occupiedPaths.add(canonicalMaxPath(filename));
  }

  /**
   * Check a path against case-normalized scan reservations.
   * @param {string} filename Absolute JSON path.
   * @returns {boolean} Whether the path is reserved.
   */
  isOccupied(filename: string): boolean {
    return this.occupiedPaths.has(canonicalMaxPath(filename));
  }

  /**
   * Allocate an id that cannot overwrite a loaded motif or scanned JSON path.
   * @param {string} baseValue Preferred id or display name.
   * @param {string} fallback Fallback when normalization is empty.
   * @returns {string} Available stable id.
   */
  uniqueId(baseValue: string, fallback = "motif"): string {
    return this.store.uniqueId(uniqueMotifId(baseValue, fallback), undefined, (candidate) =>
      Boolean(this.path && this.isOccupied(this.filePath(candidate))),
    );
  }

  /**
   * Persist one motif and update repository identity only after success.
   * @param {string} id Stable motif id.
   * @returns {string} Absolute saved filename.
   * @throws {Error} For unknown motifs, collisions, or Max File failures.
   */
  save(id: string): string {
    const motif = this.store.get(id);
    if (!motif) {
      throw new Error(`Unknown motif: ${id}`);
    }

    // Check if the motif already exists in the library.
    const existingFilename = this.files.get(id);
    const filename = existingFilename ?? this.filePath(id);
    if (!existingFilename && (this.isOccupied(filename) || fileExists(filename))) {
      this.reserve(filename);
      throw new Error(`${id}.json already exists; refresh the library and try again`);
    }

    // Write the motif to the filesystem.
    writeJsonFile(filename, motif);
    // Update the library with the new motif.
    this.files.set(id, filename);
    // Reserve the filename for future use.
    this.reserve(filename);

    return filename;
  }

  /**
   * Change the selected root and start its initial scan.
   * @param {string} path Absolute Max folder path.
   * @returns {boolean} Whether a new scan started.
   */
  selectPath(path: string): boolean {
    if (path === this.path && (this.loaded || this.scanning)) {
      this.callbacks.onStateChange();
      return false;
    }
    this.path = path;
    return this.load("library");
  }

  /**
   * Close and discard any active asynchronous library scan.
   */
  cancelScan(): void {
    this.scanGeneration += 1;
    if (this.scanTask) {
      this.scanTask.cancel();
      this.scanTask.freepeer();
      this.scanTask = undefined;
    }
    if (this.scanState?.current) {
      this.scanState.current.folder.close();
    }
    this.scanState = undefined;
    this.scanning = false;
  }

  /**
   * Begin loading the selected root in bounded low-priority batches.
   * @param {LibraryCompletionStatus} completionStatus Completion status selector.
   * @returns {boolean} Whether the root opened and scanning began.
   */
  load(completionStatus: LibraryCompletionStatus): boolean {
    this.cancelScan();
    this.loaded = false;
    if (!this.path) return false;

    const root = new Folder(this.path);
    if (!root.pathname) {
      root.close();
      this.store.resetToBuiltins();
      this.files.clear();
      this.occupiedPaths.clear();
      this.callbacks.onError(`Library folder not found: ${this.path}`);
      this.callbacks.onContentsChanged("unavailable");
      this.callbacks.onStatus("library-unavailable", this.path);
      return false;
    }

    this.scanGeneration += 1;
    this.scanning = true;
    this.scanState = {
      generation: this.scanGeneration,
      completionStatus,
      pending: [],
      current: { pathname: this.path, relativePath: "", depth: 0, folder: root },
      visited: new Set<string>([canonicalMaxPath(this.path).replace(/\/+$/, "")]),
      candidateStore: new MotifStore(),
      candidateFiles: new Map<string, string>(),
      candidateOccupiedPaths: new Set<string>(),
      processedEntries: 0,
      loadedMotifs: 0,
    };
    this.callbacks.onStateChange();
    this.callbacks.onStatus("library-scanning", this.path);
    this.scanTask = new Task(() => this.processBatch());
    this.scanTask.schedule(0);
    return true;
  }

  /**
   * Validate one discovered JSON file into the off-screen scan candidate.
   * @param {string} fullPath Absolute JSON path.
   * @param {string} displayPath Root-relative diagnostic path.
   * @param {LibraryScanState} scan Active candidate scan.
   */
  loadMotifFile(fullPath: string, displayPath: string, scan: LibraryScanState): void {
    scan.candidateOccupiedPaths.add(canonicalMaxPath(fullPath));
    try {
      const result = validateMotif(readJsonFile(fullPath));
      if (!result.valid || !result.motif) {
        this.callbacks.onError(`${displayPath}: ${result.errors.join("; ")}`);
      } else if (scan.candidateStore.isBuiltin(result.motif.id)) {
        this.callbacks.onError(
          `${displayPath}: id “${result.motif.id}” conflicts with a built-in and was skipped`,
        );
      } else if (scan.candidateFiles.has(result.motif.id)) {
        this.callbacks.onError(
          `${displayPath}: duplicate motif id “${result.motif.id}” was skipped`,
        );
      } else {
        const errors = scan.candidateStore.add(result.motif);
        if (errors.length > 0) {
          this.callbacks.onError(`${displayPath}: ${errors.join("; ")}`);
        } else {
          scan.candidateFiles.set(result.motif.id, fullPath);
          scan.loadedMotifs += 1;
        }
      }
    } catch (reason) {
      this.callbacks.onError(
        `${displayPath}: ${reason instanceof Error ? reason.message : String(reason)}`,
      );
    }
  }

  /**
   * Atomically replace live catalog and filesystem identity after a complete scan.
   * @param {LibraryScanState} scan Completed candidate scan.
   */
  finish(scan: LibraryScanState): void {
    if (scan.generation !== this.scanGeneration || this.scanState !== scan) {
      return;
    }

    this.store.replaceUsersFrom(scan.candidateStore);
    this.files.clear();
    for (const [id, filename] of scan.candidateFiles) {
      this.files.set(id, filename);
    }
    this.occupiedPaths.clear();
    for (const filename of scan.candidateOccupiedPaths) {
      this.occupiedPaths.add(filename);
    }

    this.scanState = undefined;
    this.scanning = false;
    this.loaded = true;
    if (this.scanTask) {
      this.scanTask.cancel();
      this.scanTask.freepeer();
      this.scanTask = undefined;
    }

    this.callbacks.onContentsChanged(scan.completionStatus);
    if (scan.completionStatus === "library") {
      this.callbacks.onStatus("library", this.path);
    } else {
      this.callbacks.onStatus("library-refreshed", this.store.list().length);
    }
  }

  /**
   * Consume a bounded directory-entry batch, then yield through Max Task.
   */
  processBatch(): void {
    const scan = this.scanState;
    if (!scan || scan.generation !== this.scanGeneration) {
      return;
    }

    let operations = 0;
    while (operations < LIBRARY_SCAN_BATCH_SIZE) {
      if (!scan.current) {
        const next = scan.pending.shift();
        if (!next) {
          this.finish(scan);
          return;
        }

        const canonical = canonicalMaxPath(next.pathname).replace(/\/+$/, "");
        if (scan.visited.has(canonical)) {
          continue;
        }
        scan.visited.add(canonical);

        const folder = new Folder(next.pathname);
        operations += 1;
        if (!folder.pathname) {
          folder.close();
          continue;
        }
        // Update the current scan state with the new folder.
        scan.current = { ...next, folder };
      }

      const active = scan.current;
      if (active.folder.end) {
        active.folder.close();
        scan.current = undefined;
        continue;
      }

      const filename = active.folder.filename;
      const filetype = active.folder.filetype;
      if (filename && filename !== "." && filename !== "..") {
        const fullPath = joinMaxPath(active.folder.pathname, filename);
        const displayPath = active.relativePath ? `${active.relativePath}/${filename}` : filename;
        if (filetype === "fold") {
          if (active.depth < MAX_LIBRARY_DEPTH) {
            scan.pending.push({
              pathname: fullPath,
              relativePath: displayPath,
              depth: active.depth + 1,
            });
          } else {
            this.callbacks.onError(`${displayPath}: maximum library folder depth exceeded`);
          }
        } else if (filename.toLowerCase().endsWith(".json")) {
          this.loadMotifFile(fullPath, displayPath, scan);
        }
        scan.processedEntries += 1;
      }
      active.folder.next();
      operations += 1;
    }

    if (this.scanTask && scan.generation === this.scanGeneration) {
      this.scanTask.schedule(0);
    }
  }
}
