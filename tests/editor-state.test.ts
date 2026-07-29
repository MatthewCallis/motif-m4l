import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MotifEditorState } from '../src/library/editor-state.js';
import { MotifStore } from '../src/library/store.js';

describe('MotifEditorState', () => {
  it('built-in editing creates a unique same-name draft and cancel removes it', () => {
    const store = new MotifStore();
    const editor = new MotifEditorState();
    const source = store.get('chromatic-turn');
    assert.ok(source);

    const draft = editor.begin(store, source.id);
    assert.ok(draft);
    assert.notEqual(draft.id, source.id);
    assert.equal(draft.name, source.name);
    assert.deepEqual(draft.metadata, source.metadata);
    assert.notEqual(draft.metadata?.tags, source.metadata?.tags);
    assert.equal(editor.snapshot().created, true);

    store.update({ ...draft, name: 'Temporary' });
    editor.markDirty();
    assert.equal(editor.cancel(store), source.id);
    assert.equal(store.get(draft.id), undefined);
    assert.equal(editor.snapshot().active, false);
  });

  it('cancel restores an existing user motif snapshot', () => {
    const store = new MotifStore();
    const editor = new MotifEditorState();
    const user = store.cloneAsUser('chromatic-turn', 'user-motif');
    assert.ok(user);

    editor.begin(store, user.id);
    store.update({ ...user, name: 'Changed' });
    editor.markDirty();
    assert.equal(editor.cancel(store), user.id);
    assert.equal(store.get(user.id)?.name, user.name);
  });

  it('new imported sessions are removed on cancel and successful save exits editing', () => {
    const store = new MotifStore();
    const editor = new MotifEditorState();
    const imported = store.cloneAsUser('chromatic-turn', 'imported');
    assert.ok(imported);

    editor.begin(store, imported.id, { created: true, dirty: true, sourceId: 'scale-turn' });
    assert.equal(editor.cancel(store), 'scale-turn');
    assert.equal(store.has(imported.id), false);

    const saved = store.cloneAsUser('chromatic-turn', 'saved-copy');
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

  it('an active session cannot silently switch targets', () => {
    const store = new MotifStore();
    const editor = new MotifEditorState();
    const first = store.cloneAsUser('chromatic-turn', 'first');
    const second = store.cloneAsUser('chromatic-turn', 'second');
    assert.ok(first && second);

    assert.equal(editor.begin(store, first.id)?.id, first.id);
    assert.equal(editor.begin(store, second.id), undefined);
    assert.equal(editor.snapshot().targetId, first.id);
  });


  it('built-in editing accepts a pre-reserved target id', () => {
    const store = new MotifStore();
    const editor = new MotifEditorState();
    const draft = editor.begin(store, 'chromatic-turn', { targetId: 'chromatic-turn-9' });
    assert.equal(draft?.id, 'chromatic-turn-9');
    assert.equal(editor.snapshot().targetId, 'chromatic-turn-9');
  });

  it('handles inactive and unknown edit transitions safely', () => {
    const store = new MotifStore();
    const editor = new MotifEditorState();
    assert.deepEqual(editor.snapshot(), {
      active: false,
      dirty: false,
      created: false,
      sourceId: null,
      targetId: null,
    });
    assert.equal(editor.isEditing(), false);
    assert.equal(editor.isDirty(), false);
    assert.equal(editor.begin(store, 'missing'), undefined);
    assert.equal(editor.cancel(store), undefined);
    assert.equal(editor.finishSave(), undefined);
    editor.markDirty();
    editor.abandon();
    assert.equal(editor.isEditing(), false);
  });

  it('returns the active motif when begin repeats the same target', () => {
    const store = new MotifStore();
    const editor = new MotifEditorState();
    const first = editor.begin(store, 'chromatic-turn');
    assert.ok(first);
    assert.equal(editor.begin(store, first.id)?.id, first.id);
    assert.equal(editor.isEditing(first.id), true);
    assert.equal(editor.isEditing('scale-turn'), false);
  });
});
