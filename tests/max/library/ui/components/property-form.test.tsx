import { render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { pushProperties } from "../../../../../src/max/library/ui/bridge.js";
import {
  formatPreviewBarCount,
  PropertyForm,
} from "../../../../../src/max/library/ui/components/PropertyForm.js";
import {
  initialLibraryPageState,
  propertyDraftFromSelected,
} from "../../../../../src/max/library/ui/page-state.js";
import { pageStore } from "../../../../../src/max/library/ui/page-store.js";
import { LibraryStoreProvider } from "../../../../../src/max/library/ui/store.js";
import { createSelected, createServer } from "./fixtures.js";

vi.mock("../../../../../src/max/library/ui/bridge.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../../../src/max/library/ui/bridge.js")>();
  return { ...actual, pushProperties: vi.fn(), send: vi.fn() };
});

function mount(
  server: ReturnType<typeof createServer> | null,
  editing = true,
  hidden = false,
): HTMLDivElement {
  const root = document.createElement("div");
  document.body.appendChild(root);
  act(() => {
    render(
      <LibraryStoreProvider>
        <PropertyForm server={server} editing={editing} hidden={hidden} />
      </LibraryStoreProvider>,
      root,
    );
  });
  return root;
}

describe("PropertyForm", () => {
  beforeEach(() => {
    const server = createServer();
    pageStore.setState({
      ...initialLibraryPageState(),
      server,
      editTags: [...(server.selected?.tags ?? [])],
      propertyDraft: propertyDraftFromSelected(server.selected),
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

  it("formats summaries and pitch context labels", () => {
    expect(formatPreviewBarCount(2)).toBe("2");
    expect(formatPreviewBarCount(1.25)).toBe("1.3");

    const server = createServer({ selected: createSelected({ previewBars: 1.5 }) });
    pageStore.setState({
      server,
      propertyDraft: propertyDraftFromSelected(server.selected),
    });
    const root = mount(server);
    expect((root.querySelector("#notes-summary") as HTMLInputElement).value).toBe("1");
    expect((root.querySelector("#bars-summary") as HTMLInputElement).value).toBe("1.5");
    expect(root.querySelector("#source-anchor-name")?.textContent).toBe("C3");
    expect(root.querySelector("#source-root-name")?.textContent).toBe("C");
    expect(root.querySelector("#meter-denominator-edit")?.getAttribute("aria-label")).toBe(
      "Source meter denominator",
    );
  });

  it("updates every editable property and pushes completed changes", async () => {
    const server = createServer();
    const root = mount(server);
    const changes: Record<string, string> = {
      "pitch-mode-edit": "scale",
      "trigger-mode-edit": "hold",
      "repeat-rounding-edit": "1-bar",
      "source-anchor-edit": "61",
      "source-root-edit": "2",
      "source-scale-name-edit": "Dorian",
      "source-scale-intervals-edit": "0, 2, 3, 5, 7, 9, 10",
      "default-gate-edit": "0.8",
      "meter-numerator-edit": "3",
      "meter-denominator-edit": "8",
      "curve-input-min": "1",
      "curve-input-max": "127",
      "curve-output-min": "20",
      "curve-output-max": "110",
      "curve-exponent": "1.2",
    };

    for (const [id, value] of Object.entries(changes)) {
      const control = root.querySelector(`#${id}`) as HTMLInputElement | HTMLSelectElement;
      act(() => {
        control.value = value;
        control.dispatchEvent(new Event("input", { bubbles: true }));
      });
      control.dispatchEvent(new Event("change", { bubbles: true }));
    }
    await new Promise((resolve) => setTimeout(resolve, 0));

    const draft = pageStore.getState().propertyDraft;
    expect(draft).toMatchObject({
      pitchMode: "scale",
      triggerMode: "hold",
      repeatRounding: "1-bar",
      sourceAnchor: "61",
      sourceRoot: "2",
      sourceScaleName: "Dorian",
      meterNumerator: "3",
      meterDenominator: "8",
      curveExponent: "1.2",
    });
    expect(pageStore.getState().formDirty).toBe(true);
    expect(pushProperties).toHaveBeenCalled();
    expect(root.querySelector("#source-anchor-name")?.textContent).not.toBe("—");
    expect(root.querySelector("#source-root-name")?.textContent).toBe("D");

    const anchor = root.querySelector("#source-anchor-edit") as HTMLInputElement;
    act(() => {
      anchor.value = "128";
      anchor.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const sourceRoot = root.querySelector("#source-root-edit") as HTMLInputElement;
    act(() => {
      sourceRoot.value = "";
      sourceRoot.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(root.querySelector("#source-anchor-name")?.textContent).toBe("—");
    expect(root.querySelector("#source-root-name")?.textContent).toBe("—");

    const scaleName = root.querySelector("#source-scale-name-edit") as HTMLInputElement;
    scaleName.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
    expect(pushProperties).toHaveBeenCalled();
  });

  it("disables and hides the form when it cannot be edited", () => {
    const root = mount(null, false, true);
    const panel = root.querySelector("#properties-panel") as HTMLDivElement;
    expect(panel.classList.contains("hidden")).toBe(true);
    expect(panel.getAttribute("aria-hidden")).toBe("true");
    expect((root.querySelector("#notes-summary") as HTMLInputElement).value).toBe("");
    expect(
      [...root.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select")].every(
        (control) => control.disabled,
      ),
    ).toBe(true);
  });
});
