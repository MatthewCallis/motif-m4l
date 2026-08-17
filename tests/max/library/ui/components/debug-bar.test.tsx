import { render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { subscribeDebug } from "../../../../../src/max/library/ui/bridge.js";
import { DebugBar } from "../../../../../src/max/library/ui/components/DebugBar.js";
import type { DebugLevel } from "../../../../../src/max/library/ui/page-state.js";

let subscriber: ((entries: string[], level: DebugLevel, message: string) => void) | undefined;
const unsubscribe = vi.fn();

vi.mock("../../../../../src/max/library/ui/bridge.js", () => ({
  subscribeDebug: vi.fn(
    (listener: (entries: string[], level: DebugLevel, message: string) => void) => {
      subscriber = listener;
      return unsubscribe;
    },
  ),
}));

describe("DebugBar", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    subscriber = undefined;
    vi.clearAllMocks();
  });

  it("subscribes, reports diagnostics, and exposes its expanded state", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    act(() => render(<DebugBar />, root));

    expect(subscribeDebug).toHaveBeenCalledOnce();
    act(() => subscriber?.(["[info] Ready", "[error] Failed"], "error", "Failed"));

    const panel = root.querySelector("#debug-panel") as HTMLDivElement;
    const toggle = root.querySelector("#debug-toggle") as HTMLButtonElement;
    expect(panel.textContent).toBe("[info] Ready\n[error] Failed");
    expect(panel.classList.contains("has-error")).toBe(true);
    expect(root.querySelector("#debug-indicator")?.classList.contains("error")).toBe(true);
    expect(toggle.getAttribute("aria-controls")).toBe("debug-panel");
    expect(toggle.getAttribute("aria-expanded")).toBe("false");

    act(() => toggle.click());
    expect(panel.classList.contains("open")).toBe(true);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");

    act(() => subscriber?.(["[ok] Connected"], "ok", "Connected"));
    expect(panel.classList.contains("has-error")).toBe(false);
    expect(root.querySelector("#debug-indicator")?.classList.contains("ok")).toBe(true);

    act(() => render(null, root));
    expect(unsubscribe).toHaveBeenCalledOnce();
  });
});
