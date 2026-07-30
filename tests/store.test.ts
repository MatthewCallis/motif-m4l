import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MotifStore, uniqueMotifId } from '../src/library/store.js';
import { addUserCopy } from './helpers/motif-store.js';

describe('MotifStore', () => {
  it('filter matches name, id, and description', () => {
    const store = new MotifStore();
    const byName = store.filter('chromatic');
    assert.ok(byName.some((motif) => motif.id === 'chromatic-turn'));

    assert.equal(store.filter('zzz-no-such-motif').length, 0);
    assert.ok(store.filter('').length >= store.filter('chromatic').length);
  });

  it('addUserCopy stores a builtin clone under a new editable id', () => {
    const store = new MotifStore();
    assert.equal(store.isBuiltin('chromatic-turn'), true);

    const clone = addUserCopy(store, 'chromatic-turn');
    assert.ok(clone);
    assert.equal(clone.id, 'chromatic-turn-2');
    assert.equal(store.isBuiltin(clone.id), false);
    assert.equal(clone.name, 'Chromatic Turn', 'duplicate display names are allowed; ids are the identity');

    const again = addUserCopy(store, 'chromatic-turn');
    assert.ok(again);
    assert.notEqual(again.id, clone.id);
  });

  it('unique ids are deterministic and duplicate names sort stably', () => {
    const store = new MotifStore();
    const first = addUserCopy(store, 'chromatic-turn');
    const second = addUserCopy(store, 'chromatic-turn');
    assert.ok(first && second);
    assert.equal(first.id, 'chromatic-turn-2');
    assert.equal(second.id, 'chromatic-turn-3');

    const sameName = store.list().filter((motif) => motif.name === 'Chromatic Turn');
    assert.deepEqual(sameName.map((motif) => motif.id), [
      'chromatic-turn',
      'chromatic-turn-2',
      'chromatic-turn-3',
    ]);
  });

  it('built-in ids cannot be overwritten or removed', () => {
    const store = new MotifStore();
    const builtin = store.get('chromatic-turn');
    assert.ok(builtin);
    assert.deepEqual(store.add({ ...builtin, name: 'Corrupted' }), [
      'Cannot overwrite built-in motif: chromatic-turn',
    ]);
    assert.equal(store.remove('chromatic-turn'), false);
    assert.equal(store.get('chromatic-turn')?.name, 'Chromatic Turn');
  });

  it('setNotes recomputes length and validates', () => {
    const store = new MotifStore();
    const clone = addUserCopy(store, 'chromatic-turn');
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

  it('normalizes ids and safely handles unknown or invalid values', () => {
    assert.equal(uniqueMotifId('  Déjà Vu!  '), 'deja-vu');
    assert.equal(uniqueMotifId('🎵', 'fallback'), 'fallback');

    const store = new MotifStore();
    assert.equal(store.has('chromatic-turn'), true);
    assert.equal(store.get('missing'), undefined);
    assert.equal(addUserCopy(store, 'missing'), undefined);
    assert.equal(store.remove('missing'), false);
    assert.ok(store.add(null).some((error) => error.includes('object')));

    const clone = addUserCopy(store, 'chromatic-turn', 'custom');
    assert.ok(clone);
    assert.equal(store.remove(clone.id), true);
    assert.equal(store.has(clone.id), false);
    store.resetToBuiltins();
    assert.equal(store.list().length, 2);
  });
});
