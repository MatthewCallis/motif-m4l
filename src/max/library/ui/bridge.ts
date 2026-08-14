/**
 * Max jweb / workbench transport for the Motif Library UI.
 *
 * Owns transport (receiveData / lib_action), chunk reassembly, and the
 * shared page store. DOM rendering lives in Preact.
 */

import {
  MAX_LIBRARY_STATE_CHUNKS,
  isLibraryStateChunk,
  type LibraryAction,
  type LibraryServerState,
  type LibraryStateChunk,
} from "../protocol.js";
import { pageStore } from "./page-store.js";
import {
  optionalNumberValue,
  propertyDraftFromSelected,
  type DebugLevel,
  type ModalState,
  type PropertyDraft,
} from "./page-state.js";

interface MaxBridge {
  outlet: (...args: unknown[]) => void;
  bindInlet?: (name: string, handler: (...values: unknown[]) => void) => void;
}

declare global {
  interface Window {
    max?: MaxBridge;
    __motifBrowserInlets?: Map<string, (...values: unknown[]) => void>;
  }
}

interface PendingStateTransfer {
  id: number;
  total: number;
  parts: string[];
  received: Set<number>;
}

/** Format an arbitrary thrown value for bridge diagnostics. */
function errorText(reason: unknown): string {
  return reason instanceof Error ? `${reason.name}: ${reason.message}` : String(reason);
}

/** Diagnostic source label forwarded to the Max console. */
export const PAGE = "library";
/** Same-origin development message used by the Vite Library workbench. */
export const WORKBENCH_STATE_MESSAGE = "motif-library-workbench-state";
/** Same-origin development message used for live sidebar layout previews. */
export const WORKBENCH_LAYOUT_MESSAGE = "motif-library-workbench-layout";

const nativeMax = typeof window !== "undefined" ? window.max : undefined;
/** Whether the page is running inside Max's jweb bridge instead of a normal browser. */
export const isMax = nativeMax !== undefined && typeof nativeMax.outlet === "function";
const browserInlets = new Map<string, (...values: unknown[]) => void>();
let maxBridge: MaxBridge;
if (isMax && nativeMax) {
  maxBridge = nativeMax;
} else {
  maxBridge = {
    outlet: (...args: unknown[]) => console.log("➜ Max:", ...args),
    bindInlet: (name, handler) => browserInlets.set(name, handler),
  };
}

if (typeof window !== "undefined") {
  window.max = maxBridge;
  if (!isMax) {
    window.__motifBrowserInlets = browserInlets;
  }
}

const debugEntries: string[] = [];
let latestDebugLevel: DebugLevel = "info";
let latestDebugMessage = "";
let stateDeadline: ReturnType<typeof setTimeout> | null = null;
let payloadErrorSignature = "";
let pendingStateTransfer: PendingStateTransfer | null = null;
let latestStateTransferId = 0;

type DebugListener = (entries: readonly string[], level: DebugLevel, message: string) => void;
const debugListeners = new Set<DebugListener>();

/**
 * Subscribe to debug log updates for the debug panel UI.
 * @param {DebugListener} listener Callback for each diagnostic.
 * @returns {() => void} Unsubscribe.
 */
export function subscribeDebug(listener: DebugListener): () => void {
  debugListeners.add(listener);
  // The bridge starts immediately after Preact mounts, while useEffect
  // subscriptions run later. Replay the current snapshot so startup messages
  // are not lost during that lifecycle gap.
  if (debugEntries.length > 0) {
    listener(debugEntries, latestDebugLevel, latestDebugMessage);
  }
  return () => debugListeners.delete(listener);
}

/**
 * Record a local diagnostic and mirror it to Max when embedded.
 * @param {DebugLevel} level Diagnostic severity.
 * @param {string} message Diagnostic text.
 */
export function debug(level: DebugLevel, message: string): void {
  const line = `${new Date().toLocaleTimeString()} [${level}] ${message}`;
  debugEntries.push(line);
  if (debugEntries.length > 80) {
    debugEntries.shift();
  }
  latestDebugLevel = level;
  latestDebugMessage = message;
  for (const listener of debugListeners) {
    listener(debugEntries, level, message);
  }
  if (isMax) {
    maxBridge.outlet("web_debug", PAGE, level, encodeURIComponent(message));
  }
}

/**
 * Send one typed Library action through the jweb bridge.
 * @param {LibraryAction} action Device action.
 */
export function send(action: LibraryAction): void {
  try {
    maxBridge.outlet("lib_action", encodeURIComponent(JSON.stringify(action)));
    debug("info", `Action: ${action.type}`);
  } catch (reason) {
    debug("error", `Action failed: ${errorText(reason)}`);
  }
}

/** Raw Max outlet for selectors that are not `lib_action` JSON. */
export function outlet(...args: unknown[]): void {
  maxBridge.outlet(...args);
}

/**
 * Include both browser-local form changes and device edit mutations.
 * @returns {boolean} Whether discarding requires confirmation.
 */
export function hasUnsavedChanges(): boolean {
  const current = pageStore.getState();
  return Boolean(current.formDirty || current.server?.editing.dirty);
}

/**
 * Display a modal.
 * @param {ModalState} options Modal content and optional callback.
 */
export function openModal(options: ModalState): void {
  pageStore.setState({ modal: options });
}

/** Close the active modal. */
export function closeModal(): void {
  pageStore.setState({ modal: null });
}

/**
 * Run an action immediately or after the user confirms discarding edits.
 * @param {() => void} onConfirm Confirmed action.
 * @param {string} message Confirmation detail.
 */
export function confirmDiscard(
  onConfirm: () => void,
  message = "Discard the unsaved changes to this motif?",
): void {
  if (!hasUnsavedChanges()) {
    onConfirm();
    return;
  }
  openModal({
    title: "Discard unsaved changes?",
    message,
    confirmLabel: "Discard",
    onConfirm,
  });
}

/**
 * Serialize the property draft for device-side validation.
 * @param {PropertyDraft} draft Form draft.
 * @param {readonly string[]} tags Motif tags.
 * @returns {Record<string, unknown>} Submitted motif properties.
 */
export function propertiesFromDraft(
  draft: PropertyDraft,
  tags: readonly string[],
): Record<string, unknown> {
  const intervals = draft.sourceScaleIntervals
    .split(/[\s,]+/)
    .map((value) => value.trim())
    .filter(Boolean);
  return {
    name: draft.name,
    description: draft.description,
    pitchMode: draft.pitchMode,
    triggerMode: draft.triggerMode,
    repeatRounding: draft.repeatRounding,
    sourcePitchContext: {
      anchorPitch: Number(draft.sourceAnchor),
      scaleRootNote: Number(draft.sourceRoot),
      scaleName: draft.sourceScaleName,
      scaleIntervals: intervals.length > 0 ? intervals : null,
    },
    sourceMeter: {
      numerator: Number(draft.meterNumerator),
      denominator: Number(draft.meterDenominator),
    },
    defaultGate: optionalNumberValue(draft.defaultGate),
    velocityCurve: {
      inputMin: optionalNumberValue(draft.curveInputMin),
      inputMax: optionalNumberValue(draft.curveInputMax),
      outputMin: optionalNumberValue(draft.curveOutputMin),
      outputMax: optionalNumberValue(draft.curveOutputMax),
      exponent: optionalNumberValue(draft.curveExponent),
    },
    tags: [...tags],
  };
}

/** Read properties from the current page store draft. */
export function readProperties(): Record<string, unknown> {
  const { propertyDraft, editTags } = pageStore.getState();
  return propertiesFromDraft(propertyDraft, editTags);
}

/** Submit property changes when an edit session is active. */
export function pushProperties(): void {
  if (!pageStore.getState().server?.actions.editing) {
    return;
  }
  send({ type: "edit_motif", properties: readProperties() });
}

/**
 * Commit a complete authoritative device state to the local store.
 * @param {LibraryServerState} server Decoded device state.
 */
export function applyServerState(server: LibraryServerState): void {
  const previous = pageStore.getState();
  const selectedChanged = previous.server?.selected?.id !== server.selected?.id;
  const editingEnded = Boolean(previous.server?.editing.active && !server.editing.active);
  // Max echoes a full state after every edit action. Preserve the browser's
  // in-progress strings while dirty so a response cannot clobber the focused
  // control; selection changes and completed edit sessions reset the draft.
  const syncDraft = selectedChanged || editingEnded || !previous.formDirty;
  pageStore.setState({
    server,
    formDirty: selectedChanged || editingEnded ? false : previous.formDirty,
    editTags: syncDraft ? [...(server.selected?.tags ?? [])] : previous.editTags,
    propertyDraft: syncDraft ? propertyDraftFromSelected(server.selected) : previous.propertyDraft,
  });
  if (server.alert?.id && server.alert.id !== previous.server?.alert?.id) {
    openModal({
      title: server.alert.title,
      message: server.alert.message,
      confirmLabel: "OK",
      dismissOnly: true,
    });
  }
  payloadErrorSignature = "";
  if (stateDeadline !== null) {
    clearTimeout(stateDeadline);
    stateDeadline = null;
  }
  debug(
    "ok",
    `State: ${server.items.length} motifs${server.libraryPath ? ` · ${server.libraryPath}` : ""}`,
  );
}

/**
 * Assemble one bounded state fragment and apply the completed state.
 * @param {LibraryStateChunk} payload State fragment.
 */
function receiveStateChunk(payload: LibraryStateChunk): void {
  const transferId = Number(payload.transferId);
  const index = Number(payload.index);
  const total = Number(payload.total);
  if (
    !Number.isInteger(transferId) ||
    transferId < latestStateTransferId ||
    !Number.isInteger(index) ||
    !Number.isInteger(total) ||
    index < 0 ||
    index >= total ||
    total < 1 ||
    total > MAX_LIBRARY_STATE_CHUNKS ||
    typeof payload.data !== "string"
  ) {
    return;
  }

  if (!pendingStateTransfer || pendingStateTransfer.id !== transferId) {
    if (pendingStateTransfer && transferId < pendingStateTransfer.id) {
      return;
    }
    pendingStateTransfer = {
      id: transferId,
      total,
      parts: new Array<string>(total),
      received: new Set<number>(),
    };
  }

  if (pendingStateTransfer.total !== total) {
    return;
  }
  pendingStateTransfer.parts[index] = payload.data;
  pendingStateTransfer.received.add(index);
  if (pendingStateTransfer.received.size !== total) {
    return;
  }

  const encodedState = pendingStateTransfer.parts.join("");
  latestStateTransferId = transferId;
  pendingStateTransfer = null;
  applyServerState(JSON.parse(decodeURIComponent(encodedState)) as LibraryServerState);
}

/**
 * Decode direct or chunked state messages received from Max.
 * @param {unknown[]} values jweb inlet atoms.
 */
export function receiveData(...values: unknown[]): void {
  const encoded = values[values.length - 1];
  try {
    const payload = JSON.parse(decodeURIComponent(String(encoded))) as unknown;
    if (isLibraryStateChunk(payload)) {
      receiveStateChunk(payload);
      payloadErrorSignature = "";
      return;
    }
    pendingStateTransfer = null;
    applyServerState(payload as LibraryServerState);
  } catch (reason) {
    const detail = errorText(reason);
    if (detail === payloadErrorSignature) {
      return;
    }
    payloadErrorSignature = detail;
    debug("error", `Library data could not be displayed: ${detail}`);
  }
}

type WorkbenchLayoutHandler = (layout: unknown) => void;
let workbenchLayoutHandler: WorkbenchLayoutHandler | null = null;
let latestWorkbenchLayout: unknown;
let hasWorkbenchLayout = false;
let bridgeStarted = false;

/**
 * Register the workbench sidebar-layout handler (optional; after shell mount).
 * @param {WorkbenchLayoutHandler | null} handler Layout callback.
 */
export function setWorkbenchLayoutHandler(handler: WorkbenchLayoutHandler | null): void {
  workbenchLayoutHandler = handler;
  // Workbench messages can arrive before Preact runs the sidebar effect. Replay
  // the latest payload when the component registers, just as debug does above.
  if (handler && hasWorkbenchLayout) {
    handler(latestWorkbenchLayout);
  }
}

/**
 * Bind Max inlet or workbench postMessage and announce readiness.
 * Safe to call once at module boot (before Preact effects).
 */
export function startLibraryBridge(): void {
  if (bridgeStarted) {
    return;
  }
  bridgeStarted = true;

  window.addEventListener("error", (event) => {
    debug("error", `${event.message} @ ${event.filename}:${event.lineno}`);
  });
  window.addEventListener("unhandledrejection", (event) => {
    debug("error", `Unhandled promise: ${errorText(event.reason)}`);
  });

  if (isMax) {
    if (typeof maxBridge.bindInlet !== "function") {
      debug("error", "Max jweb bridge is missing bindInlet");
      return;
    }
    maxBridge.bindInlet("receiveData", receiveData);
    debug("info", `Bridge ready; waiting for library state (${location.href})`);
    maxBridge.outlet("library_ready");
    stateDeadline = setTimeout(() => {
      if (!pageStore.getState().server) {
        debug("error", "No library state received within 2 seconds");
      }
    }, 2_000);
    return;
  }

  window.addEventListener("message", (event) => {
    if (event.source !== window.parent || event.origin !== location.origin) {
      return;
    }
    if (!event.data || typeof event.data !== "object") {
      return;
    }
    const message = event.data as { type?: unknown; payload?: unknown };
    if (message.type === WORKBENCH_STATE_MESSAGE && typeof message.payload === "string") {
      receiveData(message.payload);
    } else if (message.type === WORKBENCH_LAYOUT_MESSAGE) {
      latestWorkbenchLayout = message.payload;
      hasWorkbenchLayout = true;
      workbenchLayoutHandler?.(message.payload);
    }
  });
  receiveData(encodeURIComponent(JSON.stringify(demoLibraryState())));
}

/** Demo payload shown when the page is opened outside Max / workbench. */
function demoLibraryState(): LibraryServerState {
  return {
    query: "",
    tags: [],
    tagMode: "or",
    availableTags: [],
    libraryPath: "/Users/example/Motifs",
    libraryLoaded: true,
    libraryScanning: false,
    scanProgress: null,
    editing: {
      active: false,
      dirty: false,
      created: false,
      sourceId: null,
      targetId: null,
    },
    actions: {
      editing: false,
      canEdit: true,
      canSave: false,
      canImportClip: true,
      canRefreshLibrary: true,
    },
    items: [
      {
        id: "chromatic-turn",
        name: "Chromatic Turn",
        showId: false,
        isBuiltin: true,
        folder: "Library",
        hotkeys: [],
      },
      {
        id: "scale-turn",
        name: "Scale Turn",
        showId: false,
        isBuiltin: true,
        folder: "Library",
        hotkeys: [],
      },
    ],
    selectedIndex: 0,
    selected: {
      schemaVersion: 1,
      id: "chromatic-turn",
      name: "Chromatic Turn",
      description: "Fixed-interval phrase that ignores the selected scale.",
      pitchMode: "chromatic",
      triggerMode: "one-shot",
      repeatRounding: "exact",
      sourcePitchContext: {
        anchorPitch: 60,
        scaleRootNote: 0,
        scaleName: "Major",
        scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
      },
      sourceMeter: { numerator: 4, denominator: 4 },
      length: 3360,
      defaultGate: 0.82,
      velocityCurve: {
        inputMin: null,
        inputMax: null,
        outputMin: null,
        outputMax: null,
        exponent: null,
      },
      previewBars: 0.88,
      effectivePitchMode: "chromatic",
      isBuiltin: true,
      isPersisted: false,
      folder: "Library",
      hotkeys: [],
      tags: [],
      noteCount: 2,
      noteLimit: 512,
      canAddNote: false,
      canRemoveNote: false,
      notes: [
        {
          pitch: 0,
          accidental: null,
          at: 0,
          duration: 480,
          gate: null,
          velocity: null,
          velocityOffset: null,
          velocityScale: null,
          legato: false,
          tie: false,
        },
        {
          pitch: 2,
          accidental: null,
          at: 480,
          duration: 480,
          gate: null,
          velocity: null,
          velocityOffset: null,
          velocityScale: null,
          legato: false,
          tie: false,
        },
      ],
      preview: {
        notes: [
          { pitch: 60, atTicks: 0, durationTicks: 394, velocity: 100 },
          { pitch: 62, atTicks: 480, durationTicks: 394, velocity: 100 },
        ],
        totalTicks: 874,
        lowPitch: 59,
        highPitch: 63,
        noteNames: "C3 ·  D3",
      },
    },
    alert: null,
  };
}
