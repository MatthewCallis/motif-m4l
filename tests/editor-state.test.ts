import assert from 'node:assert/strict';
import test from 'node:test';
import { MotifEditorState } from '../src/library/editor-state.js';
import { MotifStore } from '../src/library/store.js';

test('built-in editing creates a unique same-name draft and cancel removes it', () => {
  const store = new MotifStore();
  const editor = new MotifEditorState();
  const source = store.get('mitsuda-lick');
  assert.ok(source);

  const draft = editor.begin(store, source.id);
  assert.ok(draft);
  assert.notEqual(draft.id, source.id);
  assert.equal(draft.name, source.name);
  assert.equal(editor.snapshot().created, true);

  store.update({ ...draft, name: 'Temporary' });
  editor.markDirty();
  assert.equal(editor.cancel(store), source.id);
  assert.equal(store.get(draft.id), undefined);
  assert.equal(editor.snapshot().active, false);
});

test('cancel restores an existing user motif snapshot', () => {
  const store = new MotifStore();
  const editor = new MotifEditorState();
  const user = store.cloneAsUser('mitsuda-lick', 'user-motif');
  assert.ok(user);

  editor.begin(store, user.id);
  store.update({ ...user, name: 'Changed' });
  editor.markDirty();
  assert.equal(editor.cancel(store), user.id);
  assert.equal(store.get(user.id)?.name, user.name);
});

test('new imported sessions are removed on cancel and successful save exits editing', () => {
  const store = new MotifStore();
  const editor = new MotifEditorState();
  const imported = store.cloneAsUser('mitsuda-lick', 'imported');
  assert.ok(imported);

  editor.begin(store, imported.id, { created: true, dirty: true, sourceId: 'salt-peanuts' });
  assert.equal(editor.cancel(store), 'salt-peanuts');
  assert.equal(store.has(imported.id), false);

  const saved = store.cloneAsUser('mitsuda-lick', 'saved-copy');
  assert.ok(saved);
  editor.begin(store, saved.id, { dirty: true });
  assert.equal(editor.finishSave(), saved.id);
  assert.deepEqual(editor.snapshot(), {
    active: false,
    dirty: false,
    created: false,
    sourceId: null,
    targetId: null,
  });
});

test('an active session cannot silently switch targets', () => {
  const store = new MotifStore();
  const editor = new MotifEditorState();
  const first = store.cloneAsUser('mitsuda-lick', 'first');
  const second = store.cloneAsUser('mitsuda-lick', 'second');
  assert.ok(first && second);

  assert.equal(editor.begin(store, first.id)?.id, first.id);
  assert.equal(editor.begin(store, second.id), undefined);
  assert.equal(editor.snapshot().targetId, first.id);
});


test('built-in editing accepts a pre-reserved target id', () => {
  const store = new MotifStore();
  const editor = new MotifEditorState();
  const draft = editor.begin(store, 'mitsuda-lick', { targetId: 'mitsuda-lick-9' });
  assert.equal(draft?.id, 'mitsuda-lick-9');
  assert.equal(editor.snapshot().targetId, 'mitsuda-lick-9');
});
