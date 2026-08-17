import { render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { send } from "../../../../../src/max/library/ui/bridge.js";
import { HotkeyList } from "../../../../../src/max/library/ui/components/HotkeyList.js";
import type { LibrarySelectedMotifData } from "../../../../../src/max/library/protocol.js";

vi.mock("../../../../../src/max/library/ui/bridge.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../../../src/max/library/ui/bridge.js")>();
  return { ...actual, send: vi.fn() };
});

describe("HotkeyList", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("renders None when the selected motif has no assignments", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const selected = {
      id: "browser-test",
      hotkeys: [],
    } as unknown as LibrarySelectedMotifData;
    render(<HotkeyList selected={selected} />, root);
    expect(root.querySelector("#hotkey-list")?.textContent).toContain("None");
  });

  it("emits unmap_trigger when an assignment chip is clicked", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const selected = {
      id: "browser-test",
      hotkeys: [{ pitch: 60, label: "C3", action: "trigger" }],
    } as unknown as LibrarySelectedMotifData;
    render(<HotkeyList selected={selected} />, root);
    (root.querySelector(".hotkey-chip") as HTMLButtonElement).click();
    expect(send).toHaveBeenCalledWith({ type: "unmap_trigger", pitch: 60 });
  });

  it("assigns controlled pitch and action values by button or Enter", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const selected = {
      id: "browser-test",
      hotkeys: [],
    } as unknown as LibrarySelectedMotifData;
    render(<HotkeyList selected={selected} />, root);

    const input = root.querySelector("#hotkey-input") as HTMLInputElement;
    const action = root.querySelector("#hotkey-action") as HTMLSelectElement;
    act(() => {
      input.value = "F#2";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    act(() => {
      action.value = "select";
      action.dispatchEvent(new Event("input", { bubbles: true }));
    });
    (root.querySelector("#assign-hotkey-btn") as HTMLButtonElement).click();
    expect(send).toHaveBeenLastCalledWith({
      type: "map_trigger",
      pitch: "F#2",
      motifId: "browser-test",
      action: "select",
    });

    vi.mocked(send).mockClear();
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(send).not.toHaveBeenCalled();
    const enter = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    input.dispatchEvent(enter);
    expect(enter.defaultPrevented).toBe(true);
    expect(send).toHaveBeenCalledWith({
      type: "map_trigger",
      pitch: "F#2",
      motifId: "browser-test",
      action: "select",
    });
    expect(input.getAttribute("aria-describedby")).toBe("hotkey-help");
    expect(action.getAttribute("aria-label")).toBe("Hot-key action");
  });

  it("disables assignment when no motif is selected", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    render(<HotkeyList selected={null} />, root);
    expect(
      [
        ...root.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>(
          "input, select, button",
        ),
      ].every((control) => control.disabled),
    ).toBe(true);
    expect(root.querySelector("#hotkey-list")?.getAttribute("aria-labelledby")).toBe(
      "hotkey-list-label",
    );
    const input = root.querySelector("#hotkey-input") as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(send).not.toHaveBeenCalled();
  });
});
