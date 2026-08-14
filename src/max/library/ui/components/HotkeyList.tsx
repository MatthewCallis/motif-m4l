/** @jsxImportSource preact */
import { useState } from "preact/hooks";
import { send } from "../bridge.js";
import type { LibrarySelectedMotifData } from "../../protocol.js";

/**
 * Hot-key assignment controls and chips.
 * @param {{ selected: LibrarySelectedMotifData | null }} props Selected motif.
 */
export function HotkeyList({ selected }: { selected: LibrarySelectedMotifData | null }) {
  const mappings = selected?.hotkeys ?? [];
  const disabled = !selected;
  const [pitch, setPitch] = useState("C1");
  const [action, setAction] = useState("trigger");

  /** Submit the controlled hot-key fields for the current selection. */
  function assignHotkey(): void {
    if (!selected) {
      return;
    }
    send({ type: "map_trigger", pitch, motifId: selected.id, action });
  }

  return (
    <div class="property-grid">
      <label htmlFor="hotkey-input">Trigger note</label>
      <div class="wide" id="hotkey-controls">
        <input
          class="field identity"
          id="hotkey-input"
          name="hotkey-input"
          type="text"
          value={pitch}
          placeholder="C3"
          autocomplete="off"
          spellcheck={false}
          disabled={disabled}
          onInput={(event) => setPitch(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              assignHotkey();
            }
          }}
        />
        <select
          class="field"
          id="hotkey-action"
          name="hotkey-action"
          disabled={disabled}
          value={action}
          onInput={(event) => setAction(event.currentTarget.value)}
        >
          <option value="trigger">Trigger Motif</option>
          <option value="select">Select Motif</option>
        </select>
        <button
          type="button"
          class="btn"
          id="assign-hotkey-btn"
          disabled={disabled}
          onClick={assignHotkey}
        >
          Assign to Motif
        </button>
      </div>
      <label>Assigned</label>
      <div class="wide" id="hotkey-list">
        {selected && mappings.length === 0 ? <span class="help">None</span> : null}
        {selected
          ? mappings.map((mapping) => {
              const actionLabel = mapping.action === "select" ? "Select" : "Trigger";
              return (
                <button
                  type="button"
                  key={`${mapping.pitch}:${mapping.action}`}
                  class="hotkey-chip"
                  title={`Remove ${mapping.label} · ${actionLabel}`}
                  onClick={() => send({ type: "unmap_trigger", pitch: mapping.pitch })}
                >
                  {`${mapping.label} · ${actionLabel}  ×`}
                </button>
              );
            })
          : null}
      </div>
      <div class="help">
        Trigger Motif plays this motif using the device’s current Trigger Mode. Select Motif makes
        it active for later trigger-zone notes. Enter a note name such as C3, F♯2, or Bb4; click an
        assignment to remove it.
      </div>
    </div>
  );
}
