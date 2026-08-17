import { render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { send } from "../../../../../src/max/library/ui/bridge.js";
import { MotifTags } from "../../../../../src/max/library/ui/components/MotifTags.js";
import { initialLibraryPageState } from "../../../../../src/max/library/ui/page-state.js";
import { pageStore } from "../../../../../src/max/library/ui/page-store.js";
import { LibraryStoreProvider } from "../../../../../src/max/library/ui/store.js";
import type { LibraryServerState } from "../../../../../src/max/library/protocol.js";

vi.mock("../../../../../src/max/library/ui/bridge.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../../../src/max/library/ui/bridge.js")>();
  return { ...actual, send: vi.fn() };
});

const server = {
  availableTags: ["demo", "scale", "lick"],
  selected: { id: "browser-test", tags: ["demo"] },
  actions: { editing: true },
} as unknown as LibraryServerState;

describe("MotifTags", () => {
  beforeEach(() => {
    pageStore.setState({
      ...initialLibraryPageState(),
      editTags: ["demo"],
      server,
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

  it("suggests unused tags and adds one without mutating the original list", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const original = pageStore.getState().editTags;
    render(
      <LibraryStoreProvider>
        <MotifTags server={server} editing={true} />
      </LibraryStoreProvider>,
      root,
    );

    const input = root.querySelector("#tag-edit-input") as HTMLInputElement;
    input.focus();
    input.dispatchEvent(new Event("focus", { bubbles: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(
      [...root.querySelectorAll("#tag-suggestions button")].map((button) => button.textContent),
    ).toEqual(["scale", "lick"]);

    (root.querySelector("#tag-suggestions button") as HTMLButtonElement).dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true }),
    );
    expect(pageStore.getState().editTags).toEqual(["demo", "scale"]);
    expect(original).toEqual(["demo"]);
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "edit_motif",
        properties: expect.objectContaining({ tags: ["demo", "scale"] }),
      }),
    );
  });

  it("removes an applied tag from the draft", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    render(
      <LibraryStoreProvider>
        <MotifTags server={server} editing={true} />
      </LibraryStoreProvider>,
      root,
    );

    (root.querySelector("#motif-tags .tag-chip.applied") as HTMLButtonElement).click();
    expect(pageStore.getState().editTags).toEqual([]);
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "edit_motif",
        properties: expect.objectContaining({ tags: [] }),
      }),
    );
  });

  it("adds typed tags with Enter or comma and exposes suggestion state", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    render(
      <LibraryStoreProvider>
        <MotifTags server={server} editing={true} />
      </LibraryStoreProvider>,
      root,
    );
    const input = root.querySelector("#tag-edit-input") as HTMLInputElement;
    input.focus();
    act(() => {
      input.value = "new-tag";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    act(() => {
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }),
      );
    });
    expect(pageStore.getState().editTags).toEqual(["demo", "new-tag"]);
    expect(input.value).toBe("");

    act(() => {
      input.value = "lick,";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    act(() => {
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: ",", bubbles: true, cancelable: true }),
      );
    });
    expect(pageStore.getState().editTags).toEqual(["demo", "new-tag", "lick"]);

    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    input.focus();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(input.getAttribute("aria-controls")).toBe("tag-suggestions");
    expect(root.querySelector("#tag-suggestions")?.classList.contains("hidden")).toBe(false);
    input.blur();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(root.querySelector("#tag-suggestions")?.classList.contains("hidden")).toBe(true);
  });

  it("renders disabled and non-editing states without sending edits", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    render(
      <LibraryStoreProvider>
        <MotifTags server={null} editing={false} />
      </LibraryStoreProvider>,
      root,
    );
    expect((root.querySelector("#tag-edit-input") as HTMLInputElement).disabled).toBe(true);

    render(
      <LibraryStoreProvider>
        <MotifTags server={server} editing={false} />
      </LibraryStoreProvider>,
      root,
    );
    expect(root.querySelector("#motif-tags .tag-chip")?.textContent).toBe("demo");
    expect((root.querySelector("#motif-tags .tag-chip") as HTMLButtonElement).disabled).toBe(true);
    expect(send).not.toHaveBeenCalled();
  });

  it("keeps a local draft when the device edit session is inactive", () => {
    const inactive = {
      ...server,
      actions: { ...server.actions, editing: false },
    };
    pageStore.setState({ server: inactive });
    const root = document.createElement("div");
    document.body.appendChild(root);
    render(
      <LibraryStoreProvider>
        <MotifTags server={inactive} editing={true} />
      </LibraryStoreProvider>,
      root,
    );
    (root.querySelector("#motif-tags .tag-chip") as HTMLButtonElement).click();
    expect(pageStore.getState().editTags).toEqual([]);
    expect(send).not.toHaveBeenCalled();
  });
});
