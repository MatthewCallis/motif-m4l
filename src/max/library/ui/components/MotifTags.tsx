/** @jsxImportSource preact */
import { useState } from "preact/hooks";
import { propertiesFromDraft, send } from "../bridge.js";
import { addTagSelection, removeTagSelection, suggestTags } from "../browser-model.js";
import { useLibraryStore } from "../store.js";
import type { LibraryServerState } from "../../protocol.js";

/**
 * Motif tag chips and add-tag autocomplete.
 * @param {{ server: LibraryServerState | null; editing: boolean }} props Tag editor state.
 */
export function MotifTags({
  server,
  editing,
}: {
  server: LibraryServerState | null;
  editing: boolean;
}) {
  const [state, pageStore] = useLibraryStore();
  const [query, setQuery] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const editTags = state.editTags;
  const available = server?.availableTags ?? [];
  const matches = editing && suggestionsOpen ? suggestTags(available, editTags, query) : [];

  /** Keep the local tag draft and the device-side edit session in lockstep. */
  function commitEditTags(tags: string[]): void {
    pageStore.setState({ editTags: tags, formDirty: true });
    const current = pageStore.getState();
    if (!current.server?.actions.editing) {
      return;
    }
    send({
      type: "edit_motif",
      properties: propertiesFromDraft(current.propertyDraft, tags),
    });
  }

  if (!server?.selected) {
    return (
      <>
        <div class="wide" id="motif-tags" />
        <label htmlFor="tag-edit-input">Add tag</label>
        <div class="wide" id="tag-edit-controls">
          <input
            class="field"
            id="tag-edit-input"
            name="tag-edit-input"
            type="text"
            placeholder="Existing or new tag"
            autocomplete="off"
            spellcheck={false}
            disabled
          />
          <div id="tag-suggestions" class="hidden" />
        </div>
      </>
    );
  }

  return (
    <>
      <div class="wide" id="motif-tags">
        {editTags.length === 0 ? (
          <span class="tag-chip empty">{editing ? "None" : "No tags"}</span>
        ) : (
          editTags.map((tag) => (
            <button
              key={tag}
              type="button"
              class="tag-chip applied"
              disabled={!editing}
              title={editing ? `Remove ${tag}` : tag}
              onClick={() => {
                if (!editing) {
                  return;
                }
                commitEditTags(removeTagSelection(pageStore.getState().editTags, tag));
              }}
            >
              {editing ? `${tag} ×` : tag}
            </button>
          ))
        )}
      </div>
      <label htmlFor="tag-edit-input">Add tag</label>
      <div class="wide" id="tag-edit-controls">
        <input
          class="field"
          id="tag-edit-input"
          name="tag-edit-input"
          type="text"
          placeholder="Existing or new tag"
          autocomplete="off"
          spellcheck={false}
          disabled={!editing}
          value={query}
          onFocus={() => setSuggestionsOpen(true)}
          onInput={(event) => {
            setQuery(event.currentTarget.value);
            setSuggestionsOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== ",") {
              return;
            }
            event.preventDefault();
            const next = addTagSelection(pageStore.getState().editTags, query.replace(/,/g, ""));
            commitEditTags(next);
            setQuery("");
            setSuggestionsOpen(true);
          }}
          onBlur={() => setSuggestionsOpen(false)}
        />
        <div id="tag-suggestions" class={matches.length === 0 ? "hidden" : undefined}>
          {matches.map((tag) => (
            <button
              key={tag}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                commitEditTags(addTagSelection(pageStore.getState().editTags, tag));
                setQuery("");
                setSuggestionsOpen(true);
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
