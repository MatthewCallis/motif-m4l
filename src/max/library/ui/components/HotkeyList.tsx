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
    <div className="property-grid">
      <label htmlFor="hotkey-input">Trigger note</label>
      <div className="wide" id="hotkey-controls">
        <input
          className="field identity"
          id="hotkey-input"
          name="hotkey-input"
          type="text"
          value={pitch}
          placeholder="C3"
          autoComplete="off"
          spellCheck={false}
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
          className="field"
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
          className="btn"
          id="assign-hotkey-btn"
          disabled={disabled}
          onClick={assignHotkey}
        >
          Assign to Motif
        </button>
      </div>
      <span className="field-label">Assigned</span>
      <div className="wide" id="hotkey-list">
        {selected && mappings.length === 0 ? <span className="help">None</span> : null}
        {selected
          ? mappings.map((mapping) => {
              const actionLabel = mapping.action === "select" ? "Select" : "Trigger";
              return (
                <button
                  type="button"
                  key={`${mapping.pitch}:${mapping.action}`}
                  className="hotkey-chip"
                  title={`Remove ${mapping.label} · ${actionLabel}`}
                  onClick={() => send({ type: "unmap_trigger", pitch: mapping.pitch })}
                >
                  {`${mapping.label} · ${actionLabel}  ×`}
                </button>
              );
            })
          : null}
      </div>
      <div className="help">
        Trigger Motif plays this motif using the current Trigger Mode on the device. Select Motif
        makes it active for later trigger-zone notes. Enter a note name such as C3, F♯2, or Bb4;
        click an assignment to remove it.
      </div>
    </div>
  );
}
