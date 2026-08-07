/** @jsxImportSource preact */
import { midiNoteName } from "../../../../core/preview.js";
import { pushProperties } from "../bridge.js";
import { formatPreviewBarCount } from "../format.js";
import { PITCH_CLASS_NAMES, type PropertyDraft } from "../page-state.js";
import { useLibraryStore } from "../store.js";
import type { LibraryServerState } from "../../protocol.js";
import { HotkeyList } from "./HotkeyList.js";
import { MotifTags } from "./MotifTags.js";

/** Format a valid MIDI anchor while allowing incomplete numeric input. */
function sourceAnchorLabel(raw: string): string {
  const value = raw.trim() === "" ? Number.NaN : Number(raw);
  return Number.isInteger(value) && value >= 0 && value <= 127 ? midiNoteName(value) : "—";
}

/** Format a valid pitch class while allowing incomplete numeric input. */
function sourceRootLabel(raw: string): string {
  const value = raw.trim() === "" ? Number.NaN : Number(raw);
  return Number.isInteger(value) && value >= 0 && value <= 11
    ? (PITCH_CLASS_NAMES[value] ?? "—")
    : "—";
}

/**
 * Motif property panels (identity summaries, tags, hotkeys, pitch, velocity).
 * @param {{ server: LibraryServerState | null; editing: boolean }} props Form state.
 */
export function PropertyForm({
  server,
  editing,
  hidden,
}: {
  server: LibraryServerState | null;
  editing: boolean;
  hidden: boolean;
}) {
  const [state, pageStore] = useLibraryStore();
  const draft = state.propertyDraft;
  const selected = server?.selected ?? null;
  const controlsDisabled = !editing;

  /** Merge one control change into the local string draft and mark it dirty. */
  function updateDraft(patch: Partial<PropertyDraft>): void {
    const current = pageStore.getState();
    pageStore.setState({
      propertyDraft: { ...current.propertyDraft, ...patch },
      formDirty: true,
    });
  }

  return (
    <div class={`panel${hidden ? " hidden" : ""}`} id="properties-panel">
      <div class="section">
        <div class="section-title">Motif</div>
        <div class="property-grid">
          <label for="notes-summary">Notes</label>
          <input
            class="field"
            id="notes-summary"
            type="text"
            readonly
            disabled
            value={selected ? String(selected.noteCount) : ""}
          />
          <label for="bars-summary">Bars</label>
          <input
            class="field"
            id="bars-summary"
            type="text"
            readonly
            disabled
            value={selected ? formatPreviewBarCount(selected.previewBars) : ""}
          />
        </div>
      </div>

      <div class="section">
        <div class="section-title">Tags</div>
        <div class="property-grid">
          <label>Labels</label>
          <MotifTags server={server} editing={editing} />
          <div class="help">
            Click a library tag to add it, or type a new name and press Enter or comma. Click a chip
            to remove it while editing.
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">MIDI Hot Keys</div>
        <HotkeyList selected={selected} />
      </div>

      <div class="section">
        <div class="section-title">Pitch &amp; Timing</div>
        <div class="property-grid">
          <label for="pitch-mode-edit">Pitch mode</label>
          <select
            class="field editable-property"
            id="pitch-mode-edit"
            disabled={controlsDisabled}
            value={draft.pitchMode}
            onInput={(event) => updateDraft({ pitchMode: event.currentTarget.value })}
            onChange={pushProperties}
          >
            <option value="scale">Scale</option>
            <option value="chromatic">Chromatic</option>
            <option value="hybrid">Hybrid</option>
          </select>
          <label for="source-anchor-edit">Source anchor</label>
          <div class="source-pitch-controls" id="source-anchor-controls">
            <input
              class="field editable-property"
              id="source-anchor-edit"
              type="number"
              min="0"
              max="127"
              step="1"
              aria-describedby="source-anchor-name"
              disabled={controlsDisabled}
              value={draft.sourceAnchor}
              onInput={(event) => updateDraft({ sourceAnchor: event.currentTarget.value })}
              onChange={pushProperties}
            />
            <output id="source-anchor-name" for="source-anchor-edit" aria-live="polite">
              {sourceAnchorLabel(draft.sourceAnchor)}
            </output>
          </div>
          <label for="source-root-edit">Source root</label>
          <div class="source-pitch-controls" id="source-root-controls">
            <input
              class="field editable-property"
              id="source-root-edit"
              type="number"
              min="0"
              max="11"
              step="1"
              aria-describedby="source-root-name"
              disabled={controlsDisabled}
              value={draft.sourceRoot}
              onInput={(event) => updateDraft({ sourceRoot: event.currentTarget.value })}
              onChange={pushProperties}
            />
            <output id="source-root-name" for="source-root-edit" aria-live="polite">
              {sourceRootLabel(draft.sourceRoot)}
            </output>
          </div>
          <label for="source-scale-name-edit">Source scale</label>
          <input
            class="field editable-property"
            id="source-scale-name-edit"
            type="text"
            disabled={controlsDisabled}
            value={draft.sourceScaleName}
            onInput={(event) => updateDraft({ sourceScaleName: event.currentTarget.value })}
            onChange={pushProperties}
            onBlur={pushProperties}
          />
          <label for="source-scale-intervals-edit">Source intervals</label>
          <input
            class="field editable-property"
            id="source-scale-intervals-edit"
            type="text"
            placeholder="0, 2, 4, 5, 7, 9, 11"
            disabled={controlsDisabled}
            value={draft.sourceScaleIntervals}
            onInput={(event) =>
              updateDraft({
                sourceScaleIntervals: event.currentTarget.value,
              })
            }
            onChange={pushProperties}
            onBlur={pushProperties}
          />
          <div class="help wide">
            Imports are exact Chromatic motifs. Changing Pitch Mode analyzes notes against this
            saved source scale; Live&apos;s current scale is the playback target.
          </div>
          <label for="default-gate-edit">Default gate</label>
          <input
            class="field editable-property"
            id="default-gate-edit"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="1"
            disabled={controlsDisabled}
            value={draft.defaultGate}
            onInput={(event) => updateDraft({ defaultGate: event.currentTarget.value })}
            onChange={pushProperties}
          />
          <label for="meter-numerator-edit">Source meter</label>
          <div id="source-meter-controls">
            <input
              class="field editable-property"
              id="meter-numerator-edit"
              type="number"
              min="1"
              step="1"
              disabled={controlsDisabled}
              value={draft.meterNumerator}
              onInput={(event) => updateDraft({ meterNumerator: event.currentTarget.value })}
              onChange={pushProperties}
            />
            <select
              class="field editable-property"
              id="meter-denominator-edit"
              disabled={controlsDisabled}
              value={draft.meterDenominator}
              onInput={(event) =>
                updateDraft({
                  meterDenominator: event.currentTarget.value,
                })
              }
              onChange={pushProperties}
            >
              <option>1</option>
              <option>2</option>
              <option>4</option>
              <option>8</option>
              <option>16</option>
              <option>32</option>
            </select>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Velocity Curve</div>
        <div class="property-grid">
          <label for="curve-input-min">Input min</label>
          <input
            class="field editable-property"
            id="curve-input-min"
            type="number"
            placeholder="default"
            disabled={controlsDisabled}
            value={draft.curveInputMin}
            onInput={(event) => updateDraft({ curveInputMin: event.currentTarget.value })}
            onChange={pushProperties}
          />
          <label for="curve-input-max">Input max</label>
          <input
            class="field editable-property"
            id="curve-input-max"
            type="number"
            placeholder="default"
            disabled={controlsDisabled}
            value={draft.curveInputMax}
            onInput={(event) => updateDraft({ curveInputMax: event.currentTarget.value })}
            onChange={pushProperties}
          />
          <label for="curve-output-min">Output min</label>
          <input
            class="field editable-property"
            id="curve-output-min"
            type="number"
            placeholder="default"
            disabled={controlsDisabled}
            value={draft.curveOutputMin}
            onInput={(event) => updateDraft({ curveOutputMin: event.currentTarget.value })}
            onChange={pushProperties}
          />
          <label for="curve-output-max">Output max</label>
          <input
            class="field editable-property"
            id="curve-output-max"
            type="number"
            placeholder="default"
            disabled={controlsDisabled}
            value={draft.curveOutputMax}
            onInput={(event) => updateDraft({ curveOutputMax: event.currentTarget.value })}
            onChange={pushProperties}
          />
          <label for="curve-exponent">Exponent</label>
          <input
            class="field editable-property"
            id="curve-exponent"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="1"
            disabled={controlsDisabled}
            value={draft.curveExponent}
            onInput={(event) => updateDraft({ curveExponent: event.currentTarget.value })}
            onChange={pushProperties}
          />
        </div>
      </div>
    </div>
  );
}
