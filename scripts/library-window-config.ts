import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export interface LibraryWindowConfig {
  width: number;
  height: number;
}

export const LIBRARY_WINDOW_LIMITS = {
  minWidth: 320,
  maxWidth: 1_600,
  minHeight: 240,
  maxHeight: 1_200,
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
  if (keys.length !== 2 || !keys.includes("width") || !keys.includes("height")) {
    throw new TypeError("Library window configuration must contain only width and height");
  }

  if (
    !integerInRange(
      candidate["width"],
      LIBRARY_WINDOW_LIMITS.minWidth,
      LIBRARY_WINDOW_LIMITS.maxWidth,
    )
  ) {
    throw new RangeError(
      `Library width must be an integer from ${LIBRARY_WINDOW_LIMITS.minWidth} to ${LIBRARY_WINDOW_LIMITS.maxWidth}`,
    );
  }

  if (
    !integerInRange(
      candidate["height"],
      LIBRARY_WINDOW_LIMITS.minHeight,
      LIBRARY_WINDOW_LIMITS.maxHeight,
    )
  ) {
    throw new RangeError(
      `Library height must be an integer from ${LIBRARY_WINDOW_LIMITS.minHeight} to ${LIBRARY_WINDOW_LIMITS.maxHeight}`,
    );
  }

  return { width: candidate["width"], height: candidate["height"] };
}

/** Load and validate the source-controlled Library window dimensions. */
export async function readLibraryWindowConfig(
  filename = LIBRARY_WINDOW_CONFIG_PATH,
): Promise<LibraryWindowConfig> {
  return parseLibraryWindowConfig(JSON.parse(await readFile(filename, "utf8")) as unknown);
}

/** Persist validated dimensions with deterministic source formatting. */
export async function writeLibraryWindowConfig(
  value: unknown,
  filename = LIBRARY_WINDOW_CONFIG_PATH,
): Promise<LibraryWindowConfig> {
  const config = parseLibraryWindowConfig(value);
  await writeFile(filename, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  return config;
}
