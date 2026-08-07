/**
 * Narrow an unknown JSON value to a plain record.
 * @param {unknown} value Candidate value.
 * @returns {boolean} Whether the value is a non-null, non-array object.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Check for an own record property without prototype surprises.
 * @param {Record<string, unknown>} record Record to inspect.
 * @param {string} key Property name.
 * @returns {boolean} Whether the record owns the property.
 */
export function hasOwn(record: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key);
}

/**
 * Convert a primitive JSON value to text without object stringification.
 * @param {unknown} value Candidate primitive.
 * @param {string} fallback Value returned for objects, arrays, null, and undefined.
 * @returns {string} Primitive text or fallback.
 */
export function primitiveText(value: unknown, fallback = ""): string {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return fallback;
}

/**
 * Compare JSON-compatible values without treating object key order as data.
 * @param {unknown} left First value.
 * @param {unknown} right Second value.
 * @returns {boolean} Whether both values have the same JSON structure and primitives.
 */
export function jsonValuesEqual(left: unknown, right: unknown): boolean {
  if (left === right) {
    return true;
  }
  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => jsonValuesEqual(value, right[index]))
    );
  }
  if (!isRecord(left) || !isRecord(right)) {
    return false;
  }

  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every((key) => hasOwn(right, key) && jsonValuesEqual(left[key], right[key]))
  );
}
