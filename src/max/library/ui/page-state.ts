/**
 * Browser-local Library page state and form draft helpers shared by the
 * Preact UI and Max jweb bridge.
 */

import type { NoteEditField } from "../../../library/note-edit-schema.js";
import type { LibrarySelectedMotifData, LibraryServerState } from "../protocol.js";

/** Detail-pane tab selected independently of the device state. */
export type PanelName = "properties" | "notes";
/** Severity levels displayed by the page-local diagnostics bar. */
export type DebugLevel = "info" | "ok" | "error";

/** Metadata for one editable note-table column. */
export interface NoteField {
  name: NoteEditField;
  type: "number" | "checkbox";
  required?: boolean;
  min?: string;
  max?: string;
  step?: string;
}

/** Content and optional continuation for the single page modal. */
export interface ModalState {
  title: string;
  message: string;
  confirmLabel?: string;
  dismissOnly?: boolean;
  onConfirm?: () => void;
}

/** String form of motif properties while editing in the browser. */
export interface PropertyDraft {
  name: string;
  description: string;
  pitchMode: string;
  sourceAnchor: string;
  sourceRoot: string;
  sourceScaleName: string;
  sourceScaleIntervals: string;
  defaultGate: string;
  meterNumerator: string;
  meterDenominator: string;
  curveInputMin: string;
  curveInputMax: string;
  curveOutputMin: string;
  curveOutputMax: string;
  curveExponent: string;
}

/** Browser-owned state layered on top of the authoritative device projection. */
export interface LibraryPageState {
  /** The current server state. */
  server: LibraryServerState | null;
  /** The current modal state. */
  modal: ModalState | null;
  /** Whether the current form has unsaved changes. */
  formDirty: boolean;
  /** The active panel in the library. */
  activePanel: PanelName;
  /** Collapsed folders in the browser. */
  collapsedFolders: Set<string>;
  /** Draft motif tags while editing; synced from the selected motif. */
  editTags: string[];
  /** Draft motif property fields while editing. */
  propertyDraft: PropertyDraft;
}

/** Canonical pitch-class labels used for the numeric source-root field. */
export const PITCH_CLASS_NAMES = [
  "C",
  "C♯",
  "D",
  "D♯",
  "E",
  "F",
  "F♯",
  "G",
  "G♯",
  "A",
  "A♯",
  "B",
] as const;

/** Editable note schema used to generate rows and coerce outgoing field values. */
export const NOTE_FIELDS: readonly NoteField[] = [
  { name: "pitch", type: "number", required: true, step: "1" },
  { name: "accidental", type: "number", step: "1" },
  { name: "at", type: "number", required: true, min: "0", step: "1" },
  { name: "duration", type: "number", required: true, min: "1", step: "1" },
  { name: "gate", type: "number", min: "0.01", step: "0.01" },
  { name: "velocity", type: "number", min: "1", max: "127", step: "1" },
  { name: "velocityOffset", type: "number", step: "1" },
  { name: "velocityScale", type: "number", min: "0", step: "0.01" },
  { name: "legato", type: "checkbox" },
  { name: "tie", type: "checkbox" },
];

/** Empty property draft used when nothing is selected. */
export function emptyPropertyDraft(): PropertyDraft {
  return {
    name: "",
    description: "",
    pitchMode: "scale",
    sourceAnchor: "",
    sourceRoot: "",
    sourceScaleName: "",
    sourceScaleIntervals: "",
    defaultGate: "",
    meterNumerator: "",
    meterDenominator: "4",
    curveInputMin: "",
    curveInputMax: "",
    curveOutputMin: "",
    curveOutputMax: "",
    curveExponent: "",
  };
}

/**
 * Project selected motif fields into editable string controls.
 * @param {LibrarySelectedMotifData | null} selected Selected motif.
 * @returns {PropertyDraft} Form draft.
 */
export function propertyDraftFromSelected(
  selected: LibrarySelectedMotifData | null,
): PropertyDraft {
  if (!selected) {
    return emptyPropertyDraft();
  }
  const curve = selected.velocityCurve;
  const source = selected.sourcePitchContext;
  return {
    name: selected.name,
    description: selected.description,
    pitchMode: selected.pitchMode || "scale",
    sourceAnchor: source?.anchorPitch == null ? "" : String(source.anchorPitch),
    sourceRoot: source?.scaleRootNote == null ? "" : String(source.scaleRootNote),
    sourceScaleName: source?.scaleName ?? "",
    sourceScaleIntervals: source?.scaleIntervals?.join(", ") ?? "",
    defaultGate: selected.defaultGate == null ? "" : String(selected.defaultGate),
    meterNumerator:
      selected.sourceMeter.numerator == null ? "" : String(selected.sourceMeter.numerator),
    meterDenominator: String(selected.sourceMeter.denominator ?? 4),
    curveInputMin: curve?.inputMin == null ? "" : String(curve.inputMin),
    curveInputMax: curve?.inputMax == null ? "" : String(curve.inputMax),
    curveOutputMin: curve?.outputMin == null ? "" : String(curve.outputMin),
    curveOutputMax: curve?.outputMax == null ? "" : String(curve.outputMax),
    curveExponent: curve?.exponent == null ? "" : String(curve.exponent),
  };
}

/** Initial browser-local page state before the first device payload. */
export function initialLibraryPageState(): LibraryPageState {
  return {
    server: null,
    modal: null,
    formDirty: false,
    activePanel: "properties",
    collapsedFolders: new Set<string>(),
    editTags: [],
    propertyDraft: emptyPropertyDraft(),
  };
}

/**
 * Parse an optional numeric form value without DOM dependencies.
 * @param {string} value Raw form value.
 * @returns {number | null} Numeric value or null for blank text.
 */
export function optionalNumberValue(value: string): number | null {
  const normalized = value.trim();
  return normalized === "" ? null : Number(normalized);
}
