import { afterEach, describe, expect, it, vi } from "vitest";

describe("Library bridge edge cases", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    delete window.max;
    delete window.__motifBrowserInlets;
    vi.resetModules();
  });

  it("runs the browser workbench transport and rejects malformed chunk sequences", async () => {
    delete window.max;
    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const bridge = await import("../../../../src/max/library/ui/bridge.js");
    const { pageStore } = await import("../../../../src/max/library/ui/page-store.js");

    bridge.startLibraryBridge();
    bridge.startLibraryBridge();
    expect(bridge.isMax).toBe(false);
    expect(pageStore.getState().server?.items).toHaveLength(2);
    const browserMax = (
      window as unknown as {
        max?: { bindInlet?: (name: string, handler: (...values: unknown[]) => void) => void };
      }
    ).max;
    browserMax?.bindInlet?.("receiveData", bridge.receiveData);
    expect(window.__motifBrowserInlets?.has("receiveData")).toBe(true);

    for (let index = 0; index < 85; index += 1) {
      bridge.debug("info", `entry ${index}`);
    }
    let replay: { entries: string[]; message: string } | undefined;
    const unsubscribe = bridge.subscribeDebug((entries, _level, message) => {
      replay = { entries: [...entries], message };
    });
    unsubscribe();
    expect(replay?.entries).toHaveLength(80);
    expect(replay?.message).toBe("entry 84");

    bridge.outlet("browser-selector", 1);
    expect(consoleLog).toHaveBeenCalled();
    window.max!.outlet = () => {
      throw new Error("bridge offline");
    };
    bridge.send({ type: "refresh_library" });
    let sendFailure = "";
    const unsubscribeFailure = bridge.subscribeDebug((_entries, _level, message) => {
      sendFailure = message;
    });
    unsubscribeFailure();
    expect(sendFailure).toContain("Action failed: Error: bridge offline");

    let confirmations = 0;
    pageStore.setState({ formDirty: false });
    bridge.confirmDiscard(() => {
      confirmations += 1;
    });
    expect(confirmations).toBe(1);
    pageStore.setState({ formDirty: true });
    bridge.confirmDiscard(() => {
      confirmations += 1;
    }, "Discard this draft?");
    expect(pageStore.getState().modal?.message).toBe("Discard this draft?");
    bridge.closeModal();
    bridge.pushProperties();

    const encode = (value: unknown) => encodeURIComponent(JSON.stringify(value));
    bridge.receiveData(
      encode({ kind: "state-chunk", transferId: -1, index: 0, total: 1, data: "x" }),
    );
    bridge.receiveData(
      encode({ kind: "state-chunk", transferId: 10, index: 0, total: 2, data: "first" }),
    );
    bridge.receiveData(
      encode({ kind: "state-chunk", transferId: 9, index: 0, total: 2, data: "stale" }),
    );
    bridge.receiveData(
      encode({ kind: "state-chunk", transferId: 10, index: 1, total: 3, data: "mismatch" }),
    );

    const state = pageStore.getState().server!;
    const encodedState = encodeURIComponent(JSON.stringify({ ...state, query: "chunked" }));
    const split = Math.ceil(encodedState.length / 2);
    bridge.receiveData(
      encode({
        kind: "state-chunk",
        transferId: 11,
        index: 1,
        total: 2,
        data: encodedState.slice(split),
      }),
    );
    bridge.receiveData(
      encode({
        kind: "state-chunk",
        transferId: 11,
        index: 0,
        total: 2,
        data: encodedState.slice(0, split),
      }),
    );
    expect(pageStore.getState().server?.query).toBe("chunked");

    bridge.receiveData("%broken");
    bridge.receiveData("%broken");

    window.dispatchEvent(
      new MessageEvent("message", {
        source: null,
        origin: location.origin,
        data: { type: bridge.WORKBENCH_STATE_MESSAGE, payload: encode(state) },
      }),
    );
    window.dispatchEvent(
      new MessageEvent("message", {
        source: window.parent,
        origin: location.origin,
        data: null,
      }),
    );
    window.dispatchEvent(
      new MessageEvent("message", {
        source: window.parent,
        origin: location.origin,
        data: {
          type: bridge.WORKBENCH_STATE_MESSAGE,
          payload: encode({ ...state, query: "posted" }),
        },
      }),
    );
    expect(pageStore.getState().server?.query).toBe("posted");

    window.dispatchEvent(
      new MessageEvent("message", {
        source: window.parent,
        origin: location.origin,
        data: { type: bridge.WORKBENCH_LAYOUT_MESSAGE, payload: { sidebarMinWidth: 180 } },
      }),
    );
    const layouts: unknown[] = [];
    bridge.setWorkbenchLayoutHandler((layout) => layouts.push(layout));
    expect(layouts).toEqual([{ sidebarMinWidth: 180 }]);
    window.dispatchEvent(
      new MessageEvent("message", {
        source: window.parent,
        origin: location.origin,
        data: { type: bridge.WORKBENCH_LAYOUT_MESSAGE, payload: { sidebarMinWidth: 200 } },
      }),
    );
    expect(layouts).toHaveLength(2);
    bridge.setWorkbenchLayoutHandler(null);

    const rejection = new Event("unhandledrejection");
    Object.defineProperty(rejection, "reason", { value: "promise failed" });
    window.dispatchEvent(rejection);
  });

  it("reports missing native inlet support and a native state timeout", async () => {
    const missingOutlet = vi.fn();
    window.max = { outlet: missingOutlet };
    let bridge = await import("../../../../src/max/library/ui/bridge.js");
    bridge.startLibraryBridge();
    expect(missingOutlet).toHaveBeenCalledWith(
      "web_debug",
      "library",
      "error",
      encodeURIComponent("Max jweb bridge is missing bindInlet"),
    );

    vi.resetModules();
    vi.useFakeTimers();
    const outlet = vi.fn();
    const bindInlet = vi.fn();
    window.max = { outlet, bindInlet };
    bridge = await import("../../../../src/max/library/ui/bridge.js");
    bridge.startLibraryBridge();
    bridge.startLibraryBridge();
    expect(bindInlet).toHaveBeenCalledWith("receiveData", expect.any(Function));
    vi.advanceTimersByTime(2_001);
    expect(
      outlet.mock.calls.some(
        (args) =>
          args[0] === "web_debug" &&
          decodeURIComponent(String(args[3])).includes("No library state received"),
      ),
    ).toBe(true);
  });
});
