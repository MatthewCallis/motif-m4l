import type { MotifStore } from "../library/store.js";
import type {
  LaunchQuantization,
  MeterMode,
  PassThroughPolicy,
  PitchMode,
  RepeatRounding,
  RepeatRoundingOverride,
  RetriggerMode,
  TriggerMode,
  TriggerModeOverride,
} from "../core/types.js";
import { LibraryCompletionStatus } from "./library/device/repository.js";

/**
 * Symbolic messages the Max patch may send to `v8` (via `prepend <name>`).
 * Please ensure this interface is kept in sync with `tests/max-handler-contract.test.ts` and the patch generator scripts.
 */
export interface MotifHandlers {
  /** Complete first-load status and UI synchronization. */
  initialize: () => void;
  /** Re-send preview data after the renderer becomes ready. */
  preview_ready: () => void;
  /** Re-send Library data after the page becomes ready. */
  library_ready: () => void;
  /** Restore engine-owned selection and hotkeys from Live's Blob parameter. */
  restore_state: (...encodedParts: unknown[]) => void;
  /** Materialize the embedded Library page for jweb. */
  library_prepare: () => void;
  /** Mirror an embedded-page diagnostic to the Max Console. */
  web_debug: (page: string, level: string, encodedMessage: string) => void;
  /** Process an incoming MIDI note. */
  note: (pitch: number, velocity: number, channel?: number) => void;
  /** Process an incoming MIDI controller value. */
  cc: (controller: number, value: number, channel?: number) => void;
  /** Process the sustain-controller convenience selector. */
  sustain: (value: number, channel?: number) => void;
  /** Select a motif by id, generated label, or display name. */
  motif: (id: string) => void;
  /** Set or clear the performance pitch-mode override. */
  pitch_mode: (mode: string) => void;
  /** Choose whether Motif uses its device-local scale instead of Live's scale. */
  scale_override: (value: string | number | boolean) => void;
  /** Set the root pitch class used by the device-local scale. */
  scale_override_root: (value: string | number) => void;
  /** Set the named scale used by the device-local scale. */
  scale_override_name: (...values: unknown[]) => void;
  /** Set non-destructive pitch inversion. */
  invert: (value: string | number | boolean) => void;
  /** Set non-destructive note-order reversal. */
  reverse: (value: string | number | boolean) => void;
  /** Select preserve or fit-bar meter behavior. */
  meter_mode: (mode: string) => void;
  /** Select replace or overlap retrigger behavior. */
  retrigger: (mode: string | number) => void;
  /** Select the keyboard trigger lifecycle. */
  trigger_mode: (mode: string) => void;
  /** Select motif-owned or overridden hold-repeat length rounding. */
  repeat_rounding: (value: string) => void;
  /** Select the launch-quantization grid. */
  launch_quantization: (value: string) => void;
  /** Select dry-MIDI pass-through behavior. */
  pass_through: (value: string) => void;
  /** Set the inclusive lower trigger-zone pitch. */
  trigger_low: (value: number) => void;
  /** Set the inclusive upper trigger-zone pitch. */
  trigger_high: (value: number) => void;
  /** Assign a MIDI pitch to a motif action. */
  map_trigger: (pitch: number | string, motifId: string, action?: string) => void;
  /** Remove one MIDI-pitch assignment. */
  unmap_trigger: (pitch: number | string) => void;
  /** Remove every MIDI-pitch assignment. */
  clear_trigger_map: () => void;
  /** Select and scan the user-library root. */
  library_path: (...pathParts: unknown[]) => void;
  /** Rescan the selected user-library root. */
  refresh_library: (discardChanges?: number | boolean) => void;
  /** Set the device-local tempo ratio. */
  tempo_multiplier: (value: string | number) => void;
  /** Set the Library browser search query. */
  filter_motifs: (...queryParts: unknown[]) => void;
  /** Import the selected Live MIDI clip. */
  import_clip: () => void;
  /** Persist the active edit session. */
  save_motif: (properties?: unknown) => void;
  /** Begin editing the selected motif. */
  begin_edit: () => void;
  /** Apply motif-level authoring fields. */
  edit_motif: (properties: unknown) => void;
  /** Select a stable id from the Library browser. */
  select_browser: (id: string, discardChanges?: number | boolean) => void;
  /** Cancel and restore the active edit session. */
  cancel_edit: () => void;
  /** Dispatch a URL-encoded Library-page action. */
  lib_action: (...encodedParts: unknown[]) => void;
  /** Flush scheduled notes and retained trigger state. */
  panic: () => void;
  /** Rebuild the Max motif menu. */
  list_motifs: () => void;
  /** Emit the current host context for diagnostics. */
  dump_context: () => void;
  /** Apply one native Live Song observer update. */
  song_context: (property: string, ...values: unknown[]) => void;
}

/** Directory waiting to be opened by the incremental library scanner. */
export interface PendingLibraryFolder {
  /** Absolute Max filesystem path. */
  pathname: string;
  /** Root-relative path used in diagnostics. */
  relativePath: string;
  /** Root-relative recursion depth. */
  depth: number;
}

/** Directory currently open for one bounded scanner batch. */
export interface ActiveLibraryFolder extends PendingLibraryFolder {
  /** Open Max directory iterator. */
  folder: Folder;
}

/** Mutable candidate library assembled off-screen and committed atomically after scanning. */
export interface LibraryScanState {
  /** Generation token invalidating superseded tasks. */
  generation: number;
  /** Status emitted after the candidate catalog commits. */
  completionStatus: LibraryCompletionStatus;
  /** Breadth-first queue of discovered folders. */
  pending: PendingLibraryFolder[];
  /** Folder currently consumed by the bounded scanner. */
  current: ActiveLibraryFolder | undefined;
  /** Canonical absolute paths already traversed. */
  visited: Set<string>;
  /** Off-screen catalog committed only after a complete scan. */
  candidateStore: MotifStore;
  /** Candidate user-id-to-filename identities. */
  candidateFiles: Map<string, string>;
  /** Candidate case-normalized path reservations. */
  candidateOccupiedPaths: Set<string>;
  /** Filesystem entries examined so far. */
  processedEntries: number;
  /** Valid user motifs accepted so far. */
  loadedMotifs: number;
}

/** Built-in selected on first load and after invalid selection repair. */
export const DEFAULT_MOTIF_ID = "scale-turn";
/** Filesystem entries processed before yielding to Max's UI thread. */
export const LIBRARY_SCAN_BATCH_SIZE = 32;
/** Maximum nested folder depth below the selected library root. */
export const MAX_LIBRARY_DEPTH = 32;
/** Minimum Max Task delay preventing malformed repeat busy-loops. */
export const MIN_REPEAT_DELAY_MS = 1;
/** Lead time used to move repeat boundaries from low-priority Task into native pipe scheduling. */
export const REPEAT_SCHEDULING_LOOKAHEAD_MS = 125;
/** Tempo ratios exposed by device Settings. */
export const TEMPO_MULTIPLIERS = [0.5, 1, 1.5, 2] as const;
/** Maximum editable/importable notes in one motif. */
export const MAX_MOTIF_NOTES = 512;
/** Valid device-level motif pitch-mode overrides. */
export const PITCH_MODE_OVERRIDES = ["scale", "chromatic", "hybrid"] as const satisfies PitchMode[];
/** Valid meter scaling behaviors. */
export const METER_MODES = ["preserve", "fit-bar"] as const satisfies MeterMode[];
/** Valid retrigger collision behaviors. */
export const RETRIGGER_MODES = ["replace", "overlap"] as const satisfies RetriggerMode[];
/** Valid global trigger lifecycles. */
export const TRIGGER_MODES = [
  "one-shot",
  "hold",
  "hold-repeat",
  "toggle",
  "latch",
  "release-tail",
] as const satisfies TriggerMode[];
/** Valid device trigger-mode choices, including motif-owned behavior. */
export const TRIGGER_MODE_OVERRIDES = [
  "motif",
  ...TRIGGER_MODES,
] as const satisfies TriggerModeOverride[];
/** Valid motif-owned hold-repeat rounding grids. */
export const REPEAT_ROUNDINGS = [
  "exact",
  "1/4-bar",
  "1/2-bar",
  "1-bar",
] as const satisfies RepeatRounding[];
/** Valid device repeat-rounding choices, including motif-owned behavior. */
export const REPEAT_ROUNDING_OVERRIDES = [
  "motif",
  ...REPEAT_ROUNDINGS,
] as const satisfies RepeatRoundingOverride[];
/** Valid launch quantization grids. */
export const LAUNCH_QUANTIZATIONS = [
  "immediate",
  "1/16",
  "1/8",
  "1/4",
  "bar",
] as const satisfies LaunchQuantization[];
/** Valid dry-MIDI pass-through behaviors. */
export const PASS_THROUGH_POLICIES = [
  "none",
  "non-triggers",
  "all",
] as const satisfies PassThroughPolicy[];
