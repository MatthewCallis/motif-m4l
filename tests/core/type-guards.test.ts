import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hasOwn, isRecord, jsonValuesEqual, primitiveText } from "../../src/core/type-guards.js";

describe("type guards", () => {
  it("narrows records and converts only primitive text", () => {
    assert.equal(isRecord({ value: 1 }), true);
    assert.equal(isRecord([]), false);
    assert.equal(isRecord(null), false);
    assert.equal(hasOwn({ value: undefined }, "value"), true);
    assert.equal(hasOwn({}, "value"), false);
    assert.equal(primitiveText(12), "12");
    assert.equal(primitiveText(false), "false");
    assert.equal(primitiveText({}, "fallback"), "fallback");
    assert.equal(jsonValuesEqual({ one: 1, two: [2] }, { two: [2], one: 1 }), true);
    assert.equal(jsonValuesEqual({ one: 1 }, { one: 2 }), false);
  });
});
