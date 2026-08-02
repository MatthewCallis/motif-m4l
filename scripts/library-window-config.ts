import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export interface LibraryWindowConfig {
  width: number;
  height: number;
  sidebarMinWidth: number;
  sidebarMaxWidth: number;
  detailMinWidth: number;
  sidebarResizerWidth: number;
}

export const LIBRARY_WINDOW_LIMITS = {
  width: { min: 320, max: 1_600 },
  height: { min: 240, max: 1_200 },
  sidebarMinWidth: { min: 100, max: 600 },
  sidebarMaxWidth: { min: 100, max: 1_000 },
  detailMinWidth: { min: 200, max: 1_200 },
  sidebarResizerWidth: { min: 1, max: 32 },
} as const;

export const LIBRARY_WINDOW_CONFIG_PATH = path.resolve("config/library-window.json");

function integerInRange(value: unknown, minimum: number, maximum: number): value is number {
  return Number.isInteger(value) && Number(value) >= minimum && Number(value) <= maximum;
}

/** Validate untrusted Library workbench dimensions before using or persisting them. */
export function parseLibraryWindowConfig(value: unknown): LibraryWindowConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("Library window configuration must be an object");
  }

  const candidate = value as Record<string, unknown>;
  const keys = Object.keys(candidate);
  const expectedKeys = Object.keys(LIBRARY_WINDOW_LIMITS);
  if (keys.length !== expectedKeys.length || expectedKeys.some((key) => !keys.includes(key))) {
    throw new TypeError(
      `Library window configuration must contain only ${expectedKeys.join(", ")}`,
    );
  }

  for (const key of expectedKeys as Array<keyof LibraryWindowConfig>) {
    const limits = LIBRARY_WINDOW_LIMITS[key];
    if (!integerInRange(candidate[key], limits.min, limits.max)) {
      throw new RangeError(`Library ${key} must be an integer from ${limits.min} to ${limits.max}`);
    }
  }

  if (Number(candidate["sidebarMinWidth"]) > Number(candidate["sidebarMaxWidth"])) {
    throw new RangeError("Library sidebarMinWidth must not exceed sidebarMaxWidth");
  }

  return {
    width: Number(candidate["width"]),
    height: Number(candidate["height"]),
    sidebarMinWidth: Number(candidate["sidebarMinWidth"]),
    sidebarMaxWidth: Number(candidate["sidebarMaxWidth"]),
    detailMinWidth: Number(candidate["detailMinWidth"]),
    sidebarResizerWidth: Number(candidate["sidebarResizerWidth"]),
  };
}

/** Load and validate the source-controlled Library window dimensions. */
export async function readLibraryWindowConfig(
  filename = LIBRARY_WINDOW_CONFIG_PATH,
): Promise<LibraryWindowConfig> {
  return parseLibraryWindowConfig(JSON.parse(await readFile(filename, "utf8")) as unknown);
}

/** Persist validated window and sidebar values with deterministic source formatting. */
export async function writeLibraryWindowConfig(
  value: unknown,
  filename = LIBRARY_WINDOW_CONFIG_PATH,
): Promise<LibraryWindowConfig> {
  const config = parseLibraryWindowConfig(value);
  await writeFile(filename, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  return config;
}
