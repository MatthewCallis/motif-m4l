import { render } from "preact";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Modal } from "../../../../../src/max/library/ui/components/Modal.js";
import { initialLibraryPageState } from "../../../../../src/max/library/ui/page-state.js";
import { pageStore } from "../../../../../src/max/library/ui/page-store.js";
import { LibraryStoreProvider } from "../../../../../src/max/library/ui/store.js";

describe("Modal", () => {
  beforeEach(() => {
    pageStore.setState(initialLibraryPageState());
  });

  afterEach(() => {
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
});
