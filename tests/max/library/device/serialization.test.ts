import { describe, it, expect } from "vitest";
import {
  encodeLibraryStateMessages,
  toLibraryHotkeyData,
  toLibraryNoteData,
} from "../../../../src/max/library/device/serialization.js";

describe("library serialization", () => {
  it("projects notes and hotkeys into Library payload shapes", () => {
    expect(
      toLibraryNoteData({
        pitch: 2,
        accidental: -1,
        at: 10,
        duration: 20,
        legato: true,
      }),
    ).toEqual({
      pitch: 2,
      accidental: -1,
      at: 10,
      duration: 20,
      gate: null,
      velocity: null,
      velocityOffset: null,
      velocityScale: null,
      legato: true,
      tie: false,
    });
    expect(toLibraryHotkeyData({ pitch: 60, action: "select" })).toEqual({
      pitch: 60,
      action: "select",
      label: "C3",
    });
  });

  it("keeps large Library state messages below the Max atom boundary", () => {
    const state = {
      items: [],
      selected: {
        notes: Array.from({ length: 37 }, (_, index) => ({
          pitch: index % 6 === 0 ? 0 : -(index % 6),
          accidental: null,
          at: index * 240,
          duration: 240,
          gate: null,
          velocity: 80,
          velocityOffset: null,
          velocityScale: null,
          legato: false,
          tie: false,
        })),
      },
    };
    const messages = encodeLibraryStateMessages(state, 7);
    expect(messages.length > 1).toBeTruthy();
    expect(messages.every((message) => message.length < 6_000)).toBeTruthy();

    const chunks = messages.map(
      (message) =>
        JSON.parse(decodeURIComponent(message)) as {
          transferId: number;
          index: number;
          total: number;
          data: string;
        },
    );
    expect(chunks.every((chunk) => chunk.transferId === 7)).toBeTruthy();
    const encodedState = chunks
      .sort((left, right) => left.index - right.index)
      .map((chunk) => chunk.data)
      .join("");
    expect(JSON.parse(decodeURIComponent(encodedState))).toEqual(state);
  });
});
