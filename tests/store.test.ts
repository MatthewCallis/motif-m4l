import assert from 'node:assert/strict';
import test from 'node:test';
import { MotifStore } from '../src/library/store.js';

test('filter matches name, id, tags, and description', () => {
  const store = new MotifStore();
  const byName = store.filter('mitsuda');
  assert.ok(byName.some((motif) => motif.id === 'mitsuda-lick'));

  const byTag = store.filter('chromatic');
  assert.ok(byTag.length >= 1);

  assert.equal(store.filter('zzz-no-such-motif').length, 0);
  assert.ok(store.filter('').length >= store.filter('mitsuda').length);
});

test('cloneAsUser copies a builtin under a new editable id', () => {
  const store = new MotifStore();
  assert.equal(store.isBuiltin('mitsuda-lick'), true);

  const clone = store.cloneAsUser('mitsuda-lick');
  assert.ok(clone);
  assert.equal(clone.id, 'mitsuda-lick-edit');
  assert.equal(store.isBuiltin(clone.id), false);
  assert.ok(clone.metadata?.tags?.includes('edited'));
  assert.ok(clone.name.includes('(edit)'));

  const again = store.cloneAsUser('mitsuda-lick');
  assert.ok(again);
  assert.notEqual(again.id, clone.id);
});

test('setNotes recomputes length and validates', () => {
  const store = new MotifStore();
  const clone = store.cloneAsUser('mitsuda-lick');
  assert.ok(clone);

  const errors = store.setNotes(clone.id, [
    { at: 0, duration: 480, pitch: 0 },
    { at: 480, duration: 960, pitch: 2 },
  ]);
  assert.deepEqual(errors, []);

  const updated = store.get(clone.id);
  assert.ok(updated);
  assert.equal(updated.notes.length, 2);
  assert.equal(updated.length, 1440);

  assert.deepEqual(store.setNotes(clone.id, [
    { at: 0, duration: 240, pitch: 0 },
  ]), []);
  assert.equal(store.get(clone.id)?.length, 240, 'shortening notes must shrink motif length');

  assert.deepEqual(store.setNotes(clone.id, []), ['notes must be a non-empty array']);
  assert.equal(store.get(clone.id)?.length, 240, 'invalid empty updates must preserve the motif');
});
