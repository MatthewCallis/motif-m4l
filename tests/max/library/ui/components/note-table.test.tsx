import { render } from "preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { send } from "../../../../../src/max/library/ui/bridge.js";
import { NoteTable } from "../../../../../src/max/library/ui/components/NoteTable.js";
import { createSelected, createServer } from "./fixtures.js";

vi.mock("../../../../../src/max/library/ui/bridge.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../../../../src/max/library/ui/bridge.js")>();
  return { ...actual, send: vi.fn() };
});

describe("NoteTable", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("labels every editable note field and emits typed edits", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    render(<NoteTable server={createServer()} editing={true} />, root);

    const row = root.querySelector(".note-row") as HTMLDivElement;
    const numberInputs = row.querySelectorAll<HTMLInputElement>('input[type="number"]');
    const checkboxes = row.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    expect(row.getAttribute("aria-label")).toBe("Note 1");
    expect([...numberInputs].map((input) => input.getAttribute("aria-label"))).toEqual([
      "Pitch, note 1",
      "Accidental, note 1",
      "Start, note 1",
      "Duration, note 1",
      "Gate, note 1",
      "Velocity, note 1",
      "Velocity offset, note 1",
      "Velocity scale, note 1",
    ]);
    expect([...checkboxes].map((input) => input.getAttribute("aria-label"))).toEqual([
      "Legato, note 1",
      "Tie, note 1",
    ]);

    numberInputs[0]!.value = "3";
    numberInputs[0]!.dispatchEvent(new Event("change", { bubbles: true }));
    expect(send).toHaveBeenCalledWith({
      type: "edit_note_at",
      index: 0,
      field: "pitch",
      value: 3,
    });

    vi.mocked(send).mockClear();
    numberInputs[1]!.value = "";
    numberInputs[1]!.dispatchEvent(new Event("change", { bubbles: true }));
    expect(send).toHaveBeenCalledWith({
      type: "edit_note_at",
      index: 0,
      field: "accidental",
      value: null,
    });

    vi.mocked(send).mockClear();
    checkboxes[0]!.click();
    expect(send).toHaveBeenCalledWith({
      type: "edit_note_at",
      index: 0,
      field: "legato",
      value: true,
    });
  });

  it("supports add/remove actions and disabled empty states", () => {
    const root = document.createElement("div");
    document.body.appendChild(root);
    render(<NoteTable server={createServer()} editing={true} />, root);

    const remove = root.querySelector(".remove-btn") as HTMLButtonElement;
    expect(remove.getAttribute("aria-label")).toBe("Remove note 1");
    remove.click();
    expect(send).toHaveBeenCalledWith({ type: "remove_note", index: 0 });
    (root.querySelector("#add-note-btn") as HTMLButtonElement).click();
    expect(send).toHaveBeenCalledWith({ type: "add_note" });

    render(
      <NoteTable
        server={createServer({
          selected: createSelected({ canAddNote: false, canRemoveNote: false }),
        })}
        editing={false}
      />,
      root,
    );
    expect(
      [...root.querySelectorAll<HTMLInputElement>("input")].every((input) => input.disabled),
    ).toBe(true);
    expect((root.querySelector(".remove-btn") as HTMLButtonElement).disabled).toBe(true);
    expect((root.querySelector("#add-note-btn") as HTMLButtonElement).disabled).toBe(true);

    render(<NoteTable server={null} editing={false} />, root);
    expect(root.querySelectorAll(".note-row")).toHaveLength(0);
  });
});
