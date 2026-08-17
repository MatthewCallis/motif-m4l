/** @jsxImportSource preact */
import type { ComponentChildren } from "preact";
import {
  isFolderCollapsed,
  libraryBrowserDisplayName,
  toggleCollapsedFolder,
} from "../browser-model.js";
import { confirmDiscard, send } from "../bridge.js";
import { classNames } from "../class-names.js";
import { useLibraryStore } from "../store.js";
import type { LibraryServerState } from "../../protocol.js";

/**
 * Grouped motif browser with collapsible folders.
 * @param {{ server: LibraryServerState | null }} props Device projection.
 */
export function BrowserList({ server }: { server: LibraryServerState | null }) {
  const [state, pageStore] = useLibraryStore();

  if (!server || server.items.length === 0) {
    const emptyText =
      server?.query || (server?.tags.length ?? 0) > 0 ? "No matching motifs" : "No motifs found";
    return (
      <div id="browser-list" aria-label="Motif library">
        <div id="empty-list" role="status">
          {emptyText}
        </div>
      </div>
    );
  }

  const nodes: ComponentChildren[] = [];
  let currentFolder: string | null = null;
  let folderCollapsed = false;

  for (const item of server.items) {
    const folder = item.folder || "Library";
    if (folder !== currentFolder) {
      currentFolder = folder;
      folderCollapsed = isFolderCollapsed(
        folder,
        server.query,
        state.collapsedFolders,
        server.tags,
      );
      const collapsed = folderCollapsed;
      const folderName = folder;
      nodes.push(
        <button
          key={`folder:${folderName}`}
          type="button"
          className="browser-folder"
          aria-expanded={!collapsed}
          title={`${collapsed ? "Expand" : "Collapse"} ${folderName}`}
          onClick={() => {
            pageStore.setState({
              collapsedFolders: toggleCollapsedFolder(
                folderName,
                pageStore.getState().collapsedFolders,
              ),
            });
          }}
        >
          {`${collapsed ? "▸" : "▾"} ${folderName}`}
        </button>,
      );
    }
    if (folderCollapsed) {
      continue;
    }

    const selected = server.selected?.id === item.id;
    nodes.push(
      <button
        key={item.id}
        type="button"
        className={classNames("browser-item", { selected })}
        aria-current={selected ? "true" : undefined}
        title={item.showId ? `${item.name}\nID: ${item.id}` : item.name}
        onClick={() => {
          if (server.selected?.id === item.id) {
            return;
          }
          confirmDiscard(() =>
            send({
              type: "select_browser",
              id: item.id,
              discardChanges: true,
            }),
          );
        }}
      >
        <div className="browser-name">{libraryBrowserDisplayName(item.name, folder)}</div>
        {item.hotkeys.length > 0 ? (
          <div className="hotkey-badge">
            {item.hotkeys
              .map((mapping) => `${mapping.label} ${mapping.action === "select" ? "↦" : "▶"}`)
              .join(" ")}
          </div>
        ) : null}
        {item.showId ? <div className="browser-id">{item.id}</div> : null}
      </button>,
    );
  }

  return (
    <div id="browser-list" aria-label="Motif library">
      {nodes}
    </div>
  );
}
