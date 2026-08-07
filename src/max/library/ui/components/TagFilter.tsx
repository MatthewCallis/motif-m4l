/** @jsxImportSource preact */
import { normalizeTagFilterMode, type TagFilterMode } from "../../../../library/tags.js";
import type { LibraryServerState } from "../../protocol.js";
import { send } from "../bridge.js";
import { toggleTagSelection } from "../browser-model.js";

/** Submit one complete filter snapshot to avoid partially applied controls. */
function sendBrowserFilter(query: string, tags: readonly string[], tagMode: TagFilterMode): void {
  send({ type: "filter_motifs", query, tags: [...tags], tagMode });
}

/**
 * Sidebar tag filter chips and AND/OR mode controls.
 * @param {{ server: LibraryServerState | null; searchQuery: string }} props Filter state.
 */
export function TagFilter({
  server,
  searchQuery,
}: {
  server: LibraryServerState | null;
  searchQuery: string;
}) {
  const available = server?.availableTags ?? [];
  const selected = server?.tags ?? [];
  const tagMode = server?.tagMode ?? "or";

  return (
    <div id="tag-filter">
      <div id="tag-filter-mode" role="group" aria-label="Tag filter mode">
        <button
          type="button"
          class={`tag-mode-btn${tagMode === "or" ? " active" : ""}`}
          data-tag-mode="or"
          title="Match any selected tag"
          onClick={() => {
            sendBrowserFilter(
              server?.query ?? searchQuery,
              selected,
              normalizeTagFilterMode("or", "or"),
            );
          }}
        >
          OR
        </button>
        <button
          type="button"
          class={`tag-mode-btn${tagMode === "and" ? " active" : ""}`}
          data-tag-mode="and"
          title="Match all selected tags"
          onClick={() => {
            sendBrowserFilter(
              server?.query ?? searchQuery,
              selected,
              normalizeTagFilterMode("and", "or"),
            );
          }}
        >
          AND
        </button>
      </div>
      <div id="tag-filter-chips">
        {available.length === 0 ? (
          <span class="tag-chip empty">No tags yet</span>
        ) : (
          available.map((tag) => {
            const isSelected = selected.some((entry) => entry.toLowerCase() === tag.toLowerCase());
            return (
              <button
                key={tag}
                type="button"
                class={`tag-chip${isSelected ? " selected" : ""}`}
                title={isSelected ? `Remove filter: ${tag}` : `Filter by ${tag}`}
                onClick={() => {
                  const nextTags = toggleTagSelection(tag, selected);
                  sendBrowserFilter(server?.query ?? searchQuery, nextTags, tagMode);
                }}
              >
                {tag}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export { sendBrowserFilter };
