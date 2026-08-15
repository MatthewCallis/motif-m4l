import preact from "@preact/preset-vite";
import { defineConfig } from "vitest/config";

const compiledEngineTests = [
  "tests/max/device-runtime.test.ts",
  "tests/max/device-workflow.test.ts",
  "tests/max/max-handler-contract.test.ts",
  "tests/max/max-runtime.test.ts",
  "tests/scripts/max-patch.test.ts",
];

const unitOnly = process.env["MOTIF_UNIT_ONLY"] === "1";

const jsx = {
  plugins: [preact()],
  oxc: {
    jsx: {
      runtime: "automatic" as const,
      importSource: "preact",
    },
  },
};

export default defineConfig({
  ...jsx,
  test: {
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/generated/**", "src/**/*.d.ts"],
    },
    projects: [
      {
        ...jsx,
        test: {
          name: "node",
          include: ["tests/**/*.test.ts"],
          exclude: ["tests/max/library/ui/**", ...(unitOnly ? compiledEngineTests : [])],
          environment: "node",
        },
      },
      {
        ...jsx,
        test: {
          name: "jsdom",
          include: ["tests/max/library/ui/**/*.test.ts", "tests/max/library/ui/**/*.test.tsx"],
          environment: "jsdom",
        },
      },
    ],
  },
});
