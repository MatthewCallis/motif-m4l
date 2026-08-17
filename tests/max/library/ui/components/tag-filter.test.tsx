import { render } from "preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { send } from "../../../../../src/max/library/ui/bridge.js";
import { TagFilter } from "../../../../../src/max/library/ui/components/TagFilter.js";
import type { LibraryServerState } from "../../../../../src/max/library/protocol.js";

vi.mock("../../../../../src/max/library/ui/bridge.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../../../src/max/library/ui/bridge.js")>();
  return { ...actual, send: vi.fn() };
});

describe("TagFilter", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("toggles AND/OR and chip selection through filter_motifs", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const server = {
      availableTags: ["demo", "scale"],
      tags: ["demo"],
      tagMode: "or",
      query: "bass",
    } as LibraryServerState;
    render(<TagFilter server={server} searchQuery="bass" />, root);

    expect(root.querySelector('[data-tag-mode="or"]')?.classList.contains("active")).toBe(true);
    expect(root.querySelector('[data-tag-mode="or"]')?.getAttribute("aria-pressed")).toBe("true");
    expect(root.querySelector('[data-tag-mode="and"]')?.getAttribute("aria-pressed")).toBe("false");
    (root.querySelector('[data-tag-mode="and"]') as HTMLButtonElement).click();
    expect(send).toHaveBeenCalledWith({
      type: "filter_motifs",
      query: "bass",
      tags: ["demo"],
      tagMode: "and",
    });

    vi.mocked(send).mockClear();
    const demo = [...root.querySelectorAll("#tag-filter-chips .tag-chip")].find(
      (button) => button.textContent === "demo",
    ) as HTMLButtonElement;
    demo.click();
    expect(demo.getAttribute("aria-pressed")).toBe("true");
    expect(send).toHaveBeenCalledWith({
      type: "filter_motifs",
      query: "bass",
      tags: [],
      tagMode: "or",
    });
  });

  it("shows an empty chip when the library has no tags", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    render(<TagFilter server={null} searchQuery="" />, root);
    expect(root.querySelector(".tag-chip.empty")?.textContent).toBe("No tags yet");
  });

  it("falls back to the local search query and adds an unselected tag", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    const server = {
      availableTags: ["Scale"],
      tags: ["demo"],
      tagMode: "and",
    } as LibraryServerState;
    render(<TagFilter server={server} searchQuery="lead" />, root);
    const scale = root.querySelector("#tag-filter-chips .tag-chip") as HTMLButtonElement;
    expect(scale.getAttribute("aria-pressed")).toBe("false");
    scale.click();
    expect(send).toHaveBeenCalledWith({
      type: "filter_motifs",
      query: "lead",
      tags: ["demo", "Scale"],
      tagMode: "and",
    });
  });
});
