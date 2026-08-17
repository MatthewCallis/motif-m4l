import { render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DebugBar } from "../../../../../src/max/library/ui/components/DebugBar.js";
import { LibrarySidebar } from "../../../../../src/max/library/ui/components/LibrarySidebar.js";
import { Modal } from "../../../../../src/max/library/ui/components/Modal.js";
import { NoteTable } from "../../../../../src/max/library/ui/components/NoteTable.js";
import { PropertyForm } from "../../../../../src/max/library/ui/components/PropertyForm.js";
import {
  initialLibraryPageState,
  propertyDraftFromSelected,
} from "../../../../../src/max/library/ui/page-state.js";
import { pageStore } from "../../../../../src/max/library/ui/page-store.js";
import { LibraryStoreProvider } from "../../../../../src/max/library/ui/store.js";
import { createServer } from "./fixtures.js";

vi.mock("../../../../../src/max/library/ui/bridge.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../../../src/max/library/ui/bridge.js")>();
  return {
    ...actual,
    confirmDiscard: vi.fn(),
    outlet: vi.fn(),
    send: vi.fn(),
    setWorkbenchLayoutHandler: vi.fn(),
    subscribeDebug: vi.fn(() => () => undefined),
  };
});

function accessibleName(element: HTMLElement): string {
  const ariaLabel = element.getAttribute("aria-label")?.trim();
  if (ariaLabel) {
    return ariaLabel;
  }
  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy) {
    return labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent?.trim() ?? "")
      .filter(Boolean)
      .join(" ");
  }
  if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) {
    const labels = Array.from(element.labels ?? []).map((label) => label.textContent?.trim() ?? "");
    if (labels.some(Boolean)) {
      return labels.filter(Boolean).join(" ");
    }
  }
  return element.textContent?.trim() || element.getAttribute("title")?.trim() || "";
}

describe("component accessibility contract", () => {
  beforeEach(() => {
    const server = createServer();
    pageStore.setState({
      ...initialLibraryPageState(),
      server,
      editTags: [...(server.selected?.tags ?? [])],
      propertyDraft: propertyDraftFromSelected(server.selected),
      modal: {
        title: "Confirm action",
        message: "Review this action before continuing.",
      },
    });
  });

  afterEach(() => {
    for (const root of document.body.querySelectorAll(":scope > div")) {
      act(() => render(null, root));
    }
    document.body.innerHTML = "";
    pageStore.setState(initialLibraryPageState());
    vi.clearAllMocks();
  });

  it("gives every interactive control a programmatic accessible name", () => {
    const server = pageStore.getState().server;
    const root = document.createElement("div");
    document.body.appendChild(root);
    render(
      <LibraryStoreProvider>
        <LibrarySidebar />
        <main>
          <PropertyForm server={server} editing={true} hidden={false} />
          <NoteTable server={server} editing={true} />
        </main>
        <Modal />
        <DebugBar />
      </LibraryStoreProvider>,
      root,
    );

    const controls = root.querySelectorAll<HTMLElement>(
      "button, input, select, textarea, [role='separator']",
    );
    const unnamed = [...controls]
      .filter((control) => accessibleName(control).length === 0)
      .map((control) => control.id || control.outerHTML);
    expect(unnamed).toEqual([]);
  });

  it("exposes dialog, disclosure, selection, status, and range state", () => {
    const server = pageStore.getState().server;
    const root = document.createElement("div");
    document.body.appendChild(root);
    render(
      <LibraryStoreProvider>
        <LibrarySidebar />
        <PropertyForm server={server} editing={true} hidden={false} />
        <Modal />
        <DebugBar />
      </LibraryStoreProvider>,
      root,
    );

    const dialog = root.querySelector('[role="dialog"]');
    expect(dialog?.getAttribute("aria-modal")).toBe("true");
    expect(dialog?.getAttribute("aria-labelledby")).toBe("modal-title");
    expect(dialog?.getAttribute("aria-describedby")).toBe("modal-message");
    expect(root.querySelector("#debug-toggle")?.hasAttribute("aria-expanded")).toBe(true);
    expect(
      [...root.querySelectorAll(".browser-folder")].every((folder) =>
        folder.hasAttribute("aria-expanded"),
      ),
    ).toBe(true);
    expect(root.querySelector(".browser-item.selected")?.getAttribute("aria-current")).toBe("true");
    expect(
      [...root.querySelectorAll(".tag-mode-btn, #tag-filter-chips button")].every((button) =>
        button.hasAttribute("aria-pressed"),
      ),
    ).toBe(true);
    const separator = root.querySelector('[role="separator"]');
    expect(separator?.getAttribute("aria-valuemin")).toBeTruthy();
    expect(separator?.getAttribute("aria-valuemax")).toBeTruthy();
    expect(separator?.getAttribute("aria-valuenow")).toBeTruthy();
    expect(root.querySelector("#empty-list, #library-path")?.getAttribute("role")).toBe("status");
  });
});
