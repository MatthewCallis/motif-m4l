import { render } from "preact";
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
});
