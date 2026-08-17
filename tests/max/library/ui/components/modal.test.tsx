import { render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Modal } from "../../../../../src/max/library/ui/components/Modal.js";
import { initialLibraryPageState } from "../../../../../src/max/library/ui/page-state.js";
import { pageStore } from "../../../../../src/max/library/ui/page-store.js";
import { LibraryStoreProvider } from "../../../../../src/max/library/ui/store.js";

describe("Modal", () => {
  beforeEach(() => {
    pageStore.setState(initialLibraryPageState());
  });

  afterEach(() => {
    for (const root of document.body.querySelectorAll(":scope > div")) {
      act(() => render(null, root));
    }
    document.body.innerHTML = "";
    pageStore.setState(initialLibraryPageState());
  });

  it("hides cancel when the alert is dismiss-only", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    pageStore.setState({
      modal: {
        title: "Source scale required",
        message: "Enter intervals first.",
        dismissOnly: true,
        confirmLabel: "OK",
      },
    });
    render(
      <LibraryStoreProvider>
        <Modal />
      </LibraryStoreProvider>,
      root,
    );

    expect(root.querySelector("#modal-title")?.textContent).toBe("Source scale required");
    expect(root.querySelector("#modal-cancel")?.classList.contains("hidden")).toBe(true);
    expect(root.querySelector("#modal-confirm")?.textContent).toBe("OK");
  });

  it("keeps cancel visible for confirm/cancel dialogs", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    pageStore.setState({
      modal: {
        title: "Discard changes?",
        message: "Unsaved edits will be lost.",
      },
    });
    render(
      <LibraryStoreProvider>
        <Modal />
      </LibraryStoreProvider>,
      root,
    );

    expect(root.querySelector("#modal-cancel")?.classList.contains("hidden")).toBe(false);
    expect(root.querySelector("#modal-confirm")?.textContent).toBe("Continue");
  });

  it("labels the dialog, traps focus, confirms, and restores prior focus", async () => {
    const prior = document.createElement("button");
    prior.textContent = "Before";
    document.body.appendChild(prior);
    prior.focus();
    const onConfirm = vi.fn();
    const root = document.createElement("div");
    document.body.appendChild(root);
    pageStore.setState({
      modal: {
        title: "Discard changes?",
        message: "Unsaved edits will be lost.",
        onConfirm,
      },
    });
    act(() => {
      render(
        <LibraryStoreProvider>
          <Modal />
        </LibraryStoreProvider>,
        root,
      );
    });
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    const dialog = root.querySelector('[role="dialog"]') as HTMLDivElement;
    const cancel = root.querySelector("#modal-cancel") as HTMLButtonElement;
    const confirm = root.querySelector("#modal-confirm") as HTMLButtonElement;
    expect(dialog.getAttribute("aria-labelledby")).toBe("modal-title");
    expect(dialog.getAttribute("aria-describedby")).toBe("modal-message");
    expect(document.activeElement).toBe(confirm);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    expect(document.activeElement).toBe(confirm);

    confirm.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true }),
    );
    expect(document.activeElement).toBe(cancel);
    cancel.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(document.activeElement).toBe(confirm);

    act(() => confirm.click());
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(pageStore.getState().modal).toBeNull();
    expect(document.activeElement).toBe(prior);
  });

  it("closes with Escape, cancel, and backdrop dismissal", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const show = () => {
      act(() => {
        pageStore.setState({ modal: { title: "Notice", message: "Details" } });
        render(
          <LibraryStoreProvider>
            <Modal />
          </LibraryStoreProvider>,
          root,
        );
      });
    };

    show();
    const escape = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });
    act(() => {
      document.dispatchEvent(escape);
    });
    expect(escape.defaultPrevented).toBe(true);
    expect(pageStore.getState().modal).toBeNull();

    show();
    (root.querySelector("#modal-cancel") as HTMLButtonElement).click();
    expect(pageStore.getState().modal).toBeNull();

    show();
    const dismiss = root.querySelector("#modal-dismiss") as HTMLButtonElement;
    expect(dismiss.tabIndex).toBe(-1);
    dismiss.click();
    expect(pageStore.getState().modal).toBeNull();
  });
});
