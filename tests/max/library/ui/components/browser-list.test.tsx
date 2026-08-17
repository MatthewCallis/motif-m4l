import { render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { confirmDiscard, send } from "../../../../../src/max/library/ui/bridge.js";
import { BrowserList } from "../../../../../src/max/library/ui/components/BrowserList.js";
import { initialLibraryPageState } from "../../../../../src/max/library/ui/page-state.js";
import { pageStore } from "../../../../../src/max/library/ui/page-store.js";
import { LibraryStoreProvider } from "../../../../../src/max/library/ui/store.js";
import { createServer } from "./fixtures.js";

vi.mock("../../../../../src/max/library/ui/bridge.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../../../src/max/library/ui/bridge.js")>();
  return {
    ...actual,
    confirmDiscard: vi.fn((onConfirm: () => void) => onConfirm()),
    send: vi.fn(),
  };
});

function mount(server = createServer()): HTMLDivElement {
  const root = document.createElement("div");
  document.body.appendChild(root);
  act(() => {
    render(
      <LibraryStoreProvider>
        <BrowserList server={server} />
      </LibraryStoreProvider>,
      root,
    );
  });
  return root;
}

describe("BrowserList", () => {
  beforeEach(() => pageStore.setState(initialLibraryPageState()));

  afterEach(() => {
    for (const root of document.body.querySelectorAll(":scope > div")) {
      act(() => render(null, root));
    }
    document.body.innerHTML = "";
    pageStore.setState(initialLibraryPageState());
    vi.clearAllMocks();
  });

  it("announces empty and filtered results", () => {
    const root = mount(null as unknown as ReturnType<typeof createServer>);
    expect(root.querySelector('[role="status"]')?.textContent).toBe("No motifs found");

    render(
      <LibraryStoreProvider>
        <BrowserList server={createServer({ items: [], query: "bass" })} />
      </LibraryStoreProvider>,
      root,
    );
    expect(root.querySelector('[role="status"]')?.textContent).toBe("No matching motifs");
  });

  it("renders folder, selection, hot-key, and duplicate-id metadata", () => {
    const server = createServer();
    server.items[0] = {
      ...server.items[0]!,
      folder: "",
      hotkeys: [{ pitch: 62, label: "D3", action: "select" }],
    };
    const root = mount(server);
    const folders = root.querySelectorAll<HTMLButtonElement>(".browser-folder");
    const items = root.querySelectorAll<HTMLButtonElement>(".browser-item");

    expect([...folders].map((folder) => folder.getAttribute("aria-expanded"))).toEqual([
      "true",
      "true",
    ]);
    expect(items[1]?.getAttribute("aria-current")).toBe("true");
    expect(items[0]?.querySelector(".hotkey-badge")?.textContent).toBe("D3 ↦");
    expect(items[1]?.title).toContain("ID: test-motif");
    expect(items[1]?.querySelector(".hotkey-badge")?.textContent).toBe("C3 ▶");
    expect(items[1]?.querySelector(".browser-id")?.textContent).toBe("test-motif");
  });

  it("collapses folders and selects only a different item", () => {
    const server = createServer();
    pageStore.setState({ ...initialLibraryPageState(), server });
    const root = mount(server);

    act(() => (root.querySelectorAll(".browser-folder")[1] as HTMLButtonElement).click());
    expect(pageStore.getState().collapsedFolders.has("Tests")).toBe(true);
    expect(root.querySelectorAll(".browser-item")).toHaveLength(1);

    (root.querySelector(".browser-item") as HTMLButtonElement).click();
    expect(confirmDiscard).toHaveBeenCalledOnce();
    expect(send).toHaveBeenCalledWith({
      type: "select_browser",
      id: "builtin",
      discardChanges: true,
    });

    vi.clearAllMocks();
    act(() => pageStore.setState({ collapsedFolders: new Set() }));
    (root.querySelectorAll(".browser-item")[1] as HTMLButtonElement).click();
    expect(confirmDiscard).not.toHaveBeenCalled();
  });
});
