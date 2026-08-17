/** @jsxImportSource preact */
import { useEffect, useRef } from "preact/hooks";
import { closeModal } from "../bridge.js";
import { classNames } from "../class-names.js";
import { useLibraryStore } from "../store.js";

/** Confirm / dismiss modal overlay. */
export function Modal() {
  const [state] = useLibraryStore();
  const modal = state.modal;
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!modal) {
      return undefined;
    }
    const previouslyFocused = document.activeElement as HTMLElement | null;
    confirmRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }
      if (event.key !== "Tab") {
        return;
      }
      const focusable = [
        ...(dialogRef.current?.querySelectorAll<HTMLButtonElement>("button:not([hidden])") ?? []),
      ].filter((element) => !element.disabled && !element.classList.contains("hidden"));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [modal]);

  if (!modal) {
    return <div id="modal-backdrop" className="hidden" />;
  }

  return (
    <div id="modal-backdrop">
      <button
        type="button"
        id="modal-dismiss"
        tabIndex={-1}
        aria-label="Dismiss dialog"
        onClick={closeModal}
      />
      <div
        id="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-message"
        ref={dialogRef}
      >
        <h2 id="modal-title">{modal.title}</h2>
        <div id="modal-message">{modal.message}</div>
        <div id="modal-actions">
          <button
            type="button"
            className={classNames("btn", { hidden: modal.dismissOnly })}
            id="modal-cancel"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn"
            id="modal-confirm"
            ref={confirmRef}
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
