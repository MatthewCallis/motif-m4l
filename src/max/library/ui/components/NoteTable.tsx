/** @jsxImportSource preact */
import { send } from "../bridge.js";
import { NOTE_FIELDS } from "../page-state.js";
import type { LibraryServerState } from "../../protocol.js";

/**
 * Editable note rows for the selected motif.
 * @param {{ server: LibraryServerState | null; editing: boolean }} props Note table state.
 */
export function NoteTable({
  server,
  editing,
}: {
  server: LibraryServerState | null;
  editing: boolean;
}) {
  const notes = server?.selected?.notes ?? [];
  const canAdd = Boolean(server?.selected?.canAddNote);
  const canRemove = Boolean(server?.selected?.canRemoveNote);

  return (
    <div id="note-table">
      <div id="note-header">
        <span>#</span>
        <span>Pitch</span>
        <span>Acc</span>
        <span>Start</span>
        <span>Duration</span>
        <span>Gate</span>
        <span>Vel</span>
        <span>Vel +</span>
        <span>Vel ×</span>
        <span>Legato</span>
        <span>Tie</span>
        <span />
      </div>
      <div id="note-rows">
        {notes.map((note, index) => (
          // Notes have no stable IDs: the device protocol intentionally
          // addresses every edit and removal by its current array index.
          // oxlint-disable-next-line react/no-array-index-key
          <div className="note-row" key={index}>
            <span>{index + 1}</span>
            {NOTE_FIELDS.map((field) => {
              if (field.type === "checkbox") {
                const controlId = `note-${index}-${field.name}`;
                return (
                  <label className="check-cell" key={field.name} htmlFor={controlId}>
                    <span className="visually-hidden">
                      {field.name === "legato" ? "Legato" : "Tie"}
                    </span>
                    <input
                      id={controlId}
                      type="checkbox"
                      name={field.name}
                      checked={Boolean(note[field.name])}
                      disabled={!editing}
                      onChange={(event) => {
                        send({
                          type: "edit_note_at",
                          index,
                          field: field.name,
                          value: event.currentTarget.checked,
                        });
                      }}
                    />
                  </label>
                );
              }
              const fieldValue = note[field.name];
              return (
                <input
                  key={`${index}-${field.name}-${fieldValue ?? ""}`}
                  type="number"
                  value={fieldValue == null ? "" : String(fieldValue)}
                  disabled={!editing}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  onChange={(event) => {
                    const raw = event.currentTarget.value;
                    const value = raw === "" ? null : Number(raw);
                    if (value !== null && !Number.isFinite(value)) {
                      return;
                    }
                    send({ type: "edit_note_at", index, field: field.name, value });
                  }}
                />
              );
            })}
            <button
              type="button"
              className="remove-btn"
              title="Remove note"
              disabled={!canRemove}
              onClick={() => send({ type: "remove_note", index })}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div id="add-row">
        <button
          type="button"
          className="btn"
          id="add-note-btn"
          disabled={!canAdd}
          onClick={() => send({ type: "add_note" })}
        >
          + Add Note
        </button>
      </div>
    </div>
  );
}
