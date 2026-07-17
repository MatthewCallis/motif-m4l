import assert from 'node:assert/strict';
import test from 'node:test';
import { validateMotif } from '../src/library/validate.js';

test('reports useful errors for malformed motif files', () => {
  const result = validateMotif({ schemaVersion: 1, id: '', notes: [] });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('id')));
  assert.ok(result.errors.some((error) => error.includes('sourceMeter')));
  assert.ok(result.errors.some((error) => error.includes('notes')));
});
