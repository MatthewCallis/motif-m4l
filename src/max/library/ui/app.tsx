/** @jsxImportSource preact */
/**
 * Preact root for the Motif Library jweb page.
 */

import { useEffect, useRef } from "preact/hooks";
import { confirmDiscard, pushProperties, readProperties, send } from "./bridge.js";
import { classNames } from "./class-names.js";
import { renderLibraryPreview } from "./preview.js";
import { LibraryStoreProvider, useLibraryStore } from "./store.js";
import { DebugBar } from "./components/DebugBar.js";
import { LibrarySidebar } from "./components/LibrarySidebar.js";
import { Modal } from "./components/Modal.js";
import { NoteTable } from "./components/NoteTable.js";
import { PropertyForm } from "./components/PropertyForm.js";
import type { PanelName } from "./page-state.js";

/** Coordinate bridge-backed page state with the Library's Preact controls. */
function LibraryShell() {
  const [state, pageStore] = useLibraryStore();
  const server = state.server;
  const selected = server?.selected ?? null;
  const editing = Boolean(server?.actions.editing);
  const draft = state.propertyDraft;
  const previewHostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const paint = () => {
      if (!canvasRef.current) {
        return;
      }
      renderLibraryPreview(canvasRef.current, selected?.preview ?? null);
    };
    paint();
    const onResize = () => paint();
    window.addEventListener("resize", onResize);
    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver === "function" && previewHostRef.current) {
      observer = new ResizeObserver(paint);
      observer.observe(previewHostRef.current);
    }
    return () => {
      window.removeEventListener("resize", onResize);
      observer?.disconnect();
    };
  }, [selected?.preview]);

  let importTitle = "Choose a valid Library folder before importing a clip";
  if (editing) {
    importTitle = "Finish or cancel editing before importing a clip";
  } else if (server?.libraryScanning) {
    importTitle = "Wait for the Library scan to finish";
  } else if (server?.libraryLoaded) {
    importTitle = "Import the selected clip as exact chromatic offsets";
  }

  let editState = "";
  if (selected && server) {
    editState = selected.isPersisted ? `Saved · ${selected.id}` : `Not yet saved · ${selected.id}`;
    if (selected.isBuiltin) {
      editState = "Built-in · Edit creates a user copy";
    }
    if (editing) {
      const phase = server.editing.dirty || state.formDirty ? "Unsaved changes" : "Editing";
      editState = `${phase} · ${selected.id}`;
      if (!server.libraryLoaded) {
        editState += " · Library folder required";
      }
    }
  }

  const libraryRequired = editing && !server?.libraryLoaded;
  const activePanel: PanelName = state.activePanel;

  return (
    <>
      <div id="app">
        <LibrarySidebar />

        <div id="right">
          <div id="detail-actions">
            <button
              type="button"
              className="btn"
              id="import-clip-btn"
              title={importTitle}
              disabled={!server?.actions.canImportClip || editing}
              onClick={() => {
                confirmDiscard(
                  () => send({ type: "import_clip" }),
                  "Discard the current edits and import the selected Live clip?",
                );
              }}
            >
              Import Clip
            </button>
            <button
              type="button"
              className={classNames("btn", { accent: editing })}
              id="save-motif-btn"
              disabled={!server?.actions.canSave}
              title={
                server?.libraryLoaded
                  ? "Save changes and exit editing"
                  : "Choose a valid library folder before saving"
              }
              onClick={() => send({ type: "save_motif", properties: readProperties() })}
            >
              {libraryRequired ? "Library Folder Required" : "Save & Finish"}
            </button>
          </div>

          <div id="meta">
            <div id="meta-row-1">
              <input
                className="field"
                id="name-edit"
                type="text"
                placeholder="(no motif selected)"
                readOnly={!editing}
                value={draft.name}
                onInput={(event) => {
                  pageStore.setState({
                    propertyDraft: {
                      ...pageStore.getState().propertyDraft,
                      name: event.currentTarget.value,
                    },
                    formDirty: true,
                  });
                }}
                onChange={pushProperties}
                onBlur={pushProperties}
              />
              <button
                type="button"
                className={classNames("btn", { accent: !editing, hidden: editing })}
                id="edit-btn"
                disabled={!selected || !server?.actions.canEdit}
                onClick={() => send({ type: "begin_edit" })}
              >
                Edit
              </button>
              <button
                type="button"
                className={classNames("btn", { hidden: !editing })}
                id="cancel-edit-btn"
                onClick={() => confirmDiscard(() => send({ type: "cancel_edit" }))}
              >
                Cancel Edit
              </button>
            </div>
            <textarea
              className="field"
              id="description-edit"
              placeholder="Description"
              readOnly={!editing}
              value={draft.description}
              onInput={(event) => {
                pageStore.setState({
                  propertyDraft: {
                    ...pageStore.getState().propertyDraft,
                    description: event.currentTarget.value,
                  },
                  formDirty: true,
                });
              }}
              onChange={pushProperties}
              onBlur={pushProperties}
            />
            <div id="edit-state">{editState}</div>
          </div>

          <div id="motif-preview" aria-label="Motif note preview" ref={previewHostRef}>
            <canvas id="motif-preview-canvas" ref={canvasRef} />
          </div>

          <div id="panel-tabs">
            <button
              type="button"
              className={classNames("panel-tab", { active: activePanel === "properties" })}
              data-panel="properties"
              onClick={() => pageStore.setState({ activePanel: "properties" })}
            >
              Properties
            </button>
            <button
              type="button"
              className={classNames("panel-tab", { active: activePanel === "notes" })}
              data-panel="notes"
              onClick={() => pageStore.setState({ activePanel: "notes" })}
            >
              Notes
            </button>
          </div>

          <PropertyForm server={server} editing={editing} hidden={activePanel !== "properties"} />
          <div
            className={classNames("panel", { hidden: activePanel !== "notes" })}
            id="notes-panel"
          >
            <NoteTable server={server} editing={editing} />
          </div>
        </div>
      </div>
      <Modal />
      <DebugBar />
    </>
  );
}

/** Library page root with store provider. */
export function LibraryApp() {
  return (
    <LibraryStoreProvider>
      <LibraryShell />
    </LibraryStoreProvider>
  );
}
