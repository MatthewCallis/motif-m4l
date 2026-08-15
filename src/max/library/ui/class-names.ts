/** Values accepted by {@link classNames}. */
export type ClassNameInput =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassNameInput[]
  | { [className: string]: unknown };

/**
 * Join class names from strings, arrays, and `{ name: condition }` maps.
 * Falsy tokens are skipped.
 * @param {...ClassNameInput} values Mixed class tokens.
 * @returns {string} Space-separated class list.
 */
export function classNames(...values: ClassNameInput[]): string {
  const names: string[] = [];
  for (const value of values) {
    collectClassNames(names, value);
  }
  return names.join(" ");
}

/**
 * Flatten one class-name token into `names`.
 * @param {string[]} names Accumulator.
 * @param {ClassNameInput} value Token to flatten.
 */
function collectClassNames(names: string[], value: ClassNameInput): void {
  if (!value) {
    return;
  }
  if (typeof value === "string" || typeof value === "number") {
    names.push(String(value));
    return;
  }
  if (typeof value === "boolean") {
    return;
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      collectClassNames(names, entry);
    }
    return;
  }
  for (const [name, enabled] of Object.entries(value)) {
    if (enabled && name) {
      names.push(name);
    }
  }
}
