import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

const EXTRACTED_PUBLIC_MODULES = [
  "src/core/type-guards.ts",
  "src/library/motif-authoring.ts",
  "src/max/device-types.ts",
  "src/max/device-state.ts",
  "src/max/device-logic.ts",
  "src/max/hotkey-map.ts",
  "src/max/library/ui/browser-model.ts",
  "src/max/library/ui/format.ts",
  "src/max/library/ui/page-store.ts",
  "src/max/library/ui/sidebar-layout.ts",
  "src/max/library/protocol.ts",
  "src/max/library/device/serialization.ts",
  "src/max/live-api.ts",
  "src/max/max-helpers.ts",
  "src/max/library/device/repository.ts",
] as const;

const EXPORT_AT_LINE_START = /^export\s/gm;
const ATTACHED_JSDOC = /\/\*\*[\s\S]*\*\/\s*$/;

describe("extracted module documentation", () => {
  it("keeps JSDoc attached to every exported declaration", async () => {
    for (const filename of EXTRACTED_PUBLIC_MODULES) {
      const text = await readFile(filename, "utf8");
      for (const match of text.matchAll(EXPORT_AT_LINE_START)) {
        const index = match.index ?? 0;
        const leadingText = text.slice(0, index);
        const line = leadingText.split("\n").length;
        assert.match(
          leadingText,
          ATTACHED_JSDOC,
          `${filename}:${line} export is missing attached JSDoc`,
        );
      }
    }
  });
});
