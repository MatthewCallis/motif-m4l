/** @jsxImportSource preact */
import { useEffect } from "preact/hooks";
import { closeModal } from "../bridge.js";
import { useLibraryStore } from "../store.js";

/** Confirm / dismiss modal overlay. */
export function Modal() {
  const [state] = useLibraryStore();
  const modal = state.modal;

  useEffect(() => {
    if (!modal) {
      return undefined;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [modal]);

  if (!modal) {
    return <div id="modal-backdrop" class="hidden" />;
  }

  return (
    <div id="modal-backdrop">
      <button type="button" id="modal-dismiss" aria-label="Dismiss dialog" onClick={closeModal} />
      <div id="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div id="modal-title">{modal.title}</div>
        <div id="modal-message">{modal.message}</div>
        <div id="modal-actions">
          <button
            type="button"
            class={`btn${modal.dismissOnly ? " hidden" : ""}`}
            id="modal-cancel"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            type="button"
            class="btn"
            id="modal-confirm"
            onClick={() => {
              const onConfirm = modal.onConfirm;
              closeModal();
              onConfirm?.();
            }}
          >
            {modal.confirmLabel ?? "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
