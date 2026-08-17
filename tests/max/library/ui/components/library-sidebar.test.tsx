import { render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  confirmDiscard,
  outlet,
  send,
  setWorkbenchLayoutHandler,
} from "../../../../../src/max/library/ui/bridge.js";
import {
  LibrarySidebar,
  SIDEBAR_KEYBOARD_STEP,
  SIDEBAR_WIDTH_STORAGE_KEY,
} from "../../../../../src/max/library/ui/components/LibrarySidebar.js";
import { initialLibraryPageState } from "../../../../../src/max/library/ui/page-state.js";
import { pageStore } from "../../../../../src/max/library/ui/page-store.js";
import { LibraryStoreProvider } from "../../../../../src/max/library/ui/store.js";
import type { LibrarySidebarLayout } from "../../../../../src/max/library/ui/sidebar-layout.js";
import { createServer } from "./fixtures.js";

let layoutHandler: ((layout: unknown) => void) | null = null;
let testStorage: Storage;

function createMemoryStorage(): Storage {
  const entries = new Map<string, string>();
  return {
    get length() {
      return entries.size;
    },
    clear: () => entries.clear(),
    getItem: (key) => entries.get(key) ?? null,
    key: (index) => [...entries.keys()][index] ?? null,
    removeItem: (key) => {
      entries.delete(key);
    },
    setItem: (key, value) => {
      entries.set(key, String(value));
    },
  };
}

vi.mock("../../../../../src/max/library/ui/bridge.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../../../src/max/library/ui/bridge.js")>();
  return {
    ...actual,
    confirmDiscard: vi.fn((onConfirm: () => void) => onConfirm()),
    outlet: vi.fn(),
    send: vi.fn(),
    setWorkbenchLayoutHandler: vi.fn((handler: ((layout: unknown) => void) | null) => {
      layoutHandler = handler;
    }),
  };
});

function mount(): HTMLDivElement {
  const root = document.createElement("div");
  document.body.appendChild(root);
  act(() => {
    render(
      <div id="app-shell">
        <LibraryStoreProvider>
          <LibrarySidebar />
        </LibraryStoreProvider>
      </div>,
      root,
    );
  });
  return root;
}

function pointerEvent(type: string, { pointerId = 1, clientX = 0, button = 0 } = {}): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperties(event, {
    pointerId: { value: pointerId },
    clientX: { value: clientX },
    button: { value: button },
  });
  return event;
}

describe("LibrarySidebar", () => {
  beforeEach(() => {
    layoutHandler = null;
    testStorage = createMemoryStorage();
    vi.stubGlobal("localStorage", testStorage);
    pageStore.setState({ ...initialLibraryPageState(), server: createServer() });
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function (this: HTMLElement) {
        let width = 0;
        if (this.id === "app-shell") {
          width = 800;
        } else if (this.id === "left") {
          width = Number.parseFloat(this.style.width) || 240;
        }
        return {
          x: this.id === "app-shell" ? 10 : 0,
          y: 0,
          width,
          height: 640,
          top: 0,
          right: width,
          bottom: 640,
          left: this.id === "app-shell" ? 10 : 0,
          toJSON: () => ({}),
        };
      },
    );
  });

  afterEach(() => {
    for (const root of document.body.querySelectorAll(":scope > div")) {
      act(() => render(null, root));
    }
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.clearAllMocks();
    document.body.innerHTML = "";
    vi.unstubAllGlobals();
    pageStore.setState(initialLibraryPageState());
  });

  it("supports persisted, keyboard, pointer, and workbench resizing", () => {
    testStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, "300");
    const root = mount();
    const sidebar = root.querySelector("#left") as HTMLDivElement;
    const resizer = root.querySelector("#library-resizer") as HTMLDivElement & {
      setPointerCapture: (pointerId: number) => void;
      hasPointerCapture: (pointerId: number) => boolean;
      releasePointerCapture: (pointerId: number) => void;
    };
    let captured: number | null = null;
    resizer.setPointerCapture = vi.fn((pointerId) => {
      captured = pointerId;
    });
    resizer.hasPointerCapture = vi.fn((pointerId) => captured === pointerId);
    resizer.releasePointerCapture = vi.fn(() => {
      captured = null;
    });

    expect(sidebar.style.width).toBe("300px");
    expect(resizer.getAttribute("aria-valuemin")).toBe("160");
    expect(resizer.getAttribute("aria-valuemax")).toBe("420");
    expect(resizer.getAttribute("aria-valuenow")).toBe("300");
    expect(resizer.getAttribute("aria-label")).toBe("Resize Library browser");

    const right = new KeyboardEvent("keydown", {
      key: "ArrowRight",
      bubbles: true,
      cancelable: true,
    });
    resizer.dispatchEvent(right);
    expect(right.defaultPrevented).toBe(true);
    expect(sidebar.style.width).toBe(`${300 + SIDEBAR_KEYBOARD_STEP}px`);
    expect(testStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY)).toBe("312");

    resizer.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    expect(sidebar.style.width).toBe("300px");
    resizer.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    expect(sidebar.style.width).toBe("160px");
    resizer.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    expect(sidebar.style.width).toBe("420px");
    const ignored = new KeyboardEvent("keydown", {
      key: "Enter",
      bubbles: true,
      cancelable: true,
    });
    resizer.dispatchEvent(ignored);
    expect(ignored.defaultPrevented).toBe(false);

    resizer.dispatchEvent(pointerEvent("pointerdown", { pointerId: 2, button: 1 }));
    expect(captured).toBeNull();
    const down = pointerEvent("pointerdown", { pointerId: 2 });
    resizer.dispatchEvent(down);
    expect(down.defaultPrevented).toBe(true);
    expect(resizer.classList.contains("dragging")).toBe(true);
    resizer.dispatchEvent(pointerEvent("pointermove", { pointerId: 3, clientX: 200 }));
    expect(sidebar.style.width).toBe("420px");
    resizer.dispatchEvent(pointerEvent("pointermove", { pointerId: 2, clientX: 350 }));
    expect(sidebar.style.width).toBe("340px");
    resizer.dispatchEvent(pointerEvent("pointerup", { pointerId: 2 }));
    expect(captured).toBeNull();
    expect(resizer.classList.contains("dragging")).toBe(false);
    expect(testStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY)).toBe("340");
    resizer.dispatchEvent(pointerEvent("pointercancel", { pointerId: 9 }));

    const nextLayout: LibrarySidebarLayout = {
      sidebarMinWidth: 200,
      sidebarMaxWidth: 350,
      detailMinWidth: 300,
      sidebarResizerWidth: 4,
    };
    layoutHandler?.({ invalid: true });
    layoutHandler?.(nextLayout);
    expect(sidebar.style.minWidth).toBe("200px");
    expect(sidebar.style.maxWidth).toBe("350px");
    expect(resizer.style.width).toBe("4px");
    window.dispatchEvent(new Event("resize"));
    expect(resizer.getAttribute("aria-valuenow")).toBe("340");

    act(() => render(null, root));
    expect(setWorkbenchLayoutHandler).toHaveBeenLastCalledWith(null);
  });

  it("debounces search, clears stale searches, and runs folder actions", () => {
    vi.useFakeTimers();
    const root = mount();
    const search = root.querySelector("#search") as HTMLInputElement;
    expect(search.getAttribute("aria-label")).toBe("Search motifs");
    act(() => {
      search.value = "bass";
      search.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(send).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(80);
    });
    expect(send).toHaveBeenCalledWith({
      type: "filter_motifs",
      query: "bass",
      tags: [],
      tagMode: "or",
    });

    vi.mocked(send).mockClear();
    act(() => {
      search.value = "stale";
      search.dispatchEvent(new Event("input", { bubbles: true }));
    });
    act(() => (root.querySelector("#clear-search") as HTMLButtonElement).click());
    expect(search.value).toBe("");
    expect(send).toHaveBeenCalledWith({
      type: "filter_motifs",
      query: "",
      tags: [],
      tagMode: "or",
    });
    act(() => {
      vi.advanceTimersByTime(80);
    });
    expect(send).toHaveBeenCalledOnce();

    vi.clearAllMocks();
    (root.querySelector("#choose-btn") as HTMLButtonElement).click();
    expect(confirmDiscard).toHaveBeenCalled();
    expect(send).toHaveBeenCalledWith({ type: "cancel_edit" });
    expect(outlet).toHaveBeenCalledWith("choose_library");

    vi.clearAllMocks();
    (root.querySelector("#refresh-btn") as HTMLButtonElement).click();
    expect(confirmDiscard).toHaveBeenCalledWith(
      expect.any(Function),
      expect.stringContaining("reload"),
    );
    expect(send).toHaveBeenCalledWith({ type: "refresh_library", discardChanges: true });
  });

  it("syncs authoritative queries and announces library availability", async () => {
    const root = mount();
    await new Promise((resolve) => setTimeout(resolve, 0));

    act(() =>
      pageStore.setState({
        server: createServer({ query: "lead", libraryScanning: true }),
      }),
    );
    expect((root.querySelector("#search") as HTMLInputElement).value).toBe("lead");
    expect(root.querySelector("#library-path")?.textContent).toBe("Scanning · /Motifs");
    expect(root.querySelector("#library-path")?.getAttribute("role")).toBe("status");
    expect(root.querySelector("#refresh-btn")?.textContent).toBe("Scanning...");

    act(() =>
      pageStore.setState({
        server: createServer({ libraryLoaded: false, libraryScanning: false }),
      }),
    );
    expect(root.querySelector("#library-path")?.textContent).toBe("Unavailable · /Motifs");

    act(() => pageStore.setState({ server: null }));
    expect(root.querySelector("#library-path")?.textContent).toBe("Built-ins only");
    expect((root.querySelector("#refresh-btn") as HTMLButtonElement).disabled).toBe(true);
  });
});
