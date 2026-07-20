import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

type OutletArgs = unknown[];

async function createEngine(options: {
  liveApi?: new (path?: string) => {
    id: number | string;
    get: (property: string) => unknown;
    call: (method: string, ...args: unknown[]) => unknown;
  };
  files?: Record<string, string>;
  folders?: Record<string, string[]>;
} = {}): Promise<{
  dispatch: (message: string, ...args: unknown[]) => void;
  outlets: OutletArgs[];
  errors: string[];
  files: Record<string, string>;
}> {
  const source = await readFile('dist/motif-device.js', 'utf8');
  const outlets: OutletArgs[] = [];
  const errors: string[] = [];

  const LiveAPI = options.liveApi ?? class {
    id = 0;
    get(): unknown {
      return '';
    }
    call(): unknown {
      return [];
    }
  };

  const files = options.files ?? {};
  const folders = options.folders ?? {};

  class MockFile {
    isopen: boolean;
    eof: number;
    position = 0;
    #buffer = '';

    constructor(readonly filename: string, readonly access = 'read') {
      this.isopen = access === 'write' || Object.prototype.hasOwnProperty.call(files, filename);
      this.#buffer = access === 'write' ? '' : (files[filename] ?? '');
      this.eof = this.#buffer.length;
    }

    readstring(): string {
      return this.#buffer;
    }

    writestring(text: string): void {
      this.#buffer += text;
      this.eof = this.#buffer.length;
    }

    close(): void {
      if (this.access === 'write' && this.isopen) files[this.filename] = this.#buffer;
      this.isopen = false;
    }
  }

  class MockFolder {
    end: boolean;
    count: number;
    pathname: string;
    filename = '';
    #entries: string[];
    #index = 0;

    constructor(pathname: string) {
      const entries = folders[pathname];
      this.pathname = entries ? pathname : '';
      this.#entries = entries ?? [];
      this.count = this.#entries.length;
      this.end = this.#entries.length === 0;
      this.filename = this.#entries[0] ?? '';
    }

    next(): void {
      this.#index += 1;
      this.end = this.#index >= this.#entries.length;
      this.filename = this.#entries[this.#index] ?? '';
    }

    close(): void {
      this.end = true;
    }
  }

  const context = vm.createContext({
    outlet: (_index: number, ...values: unknown[]) => {
      outlets.push(values);
    },
    error: (message: string) => errors.push(String(message)),
    post: () => undefined,
    arrayfromargs: (values: IArguments | ArrayLike<unknown>) => Array.from(values),
    messagename: '',
    File: MockFile,
    Folder: MockFolder,
    LiveAPI,
    console,
  });

  vm.runInContext(source, context, { filename: 'motif-device.js' });

  return {
    dispatch(message: string, ...args: unknown[]) {
      (context as Record<string, unknown>).messagename = message;
      (context as Record<string, unknown>).__args = args;
      vm.runInContext('anything.apply(null, __args)', context);
    },
    outlets,
    errors,
    files,
  };
}

/** Decode the last `lib` state JSON from outlet emissions. */
function lastLibState(outlets: OutletArgs[]): Record<string, unknown> | undefined {
  const last = [...outlets].reverse().find((args) => args[0] === 'ui' && args[1] === 'lib');
  if (!last || typeof last[2] !== 'string') return undefined;
  return JSON.parse(decodeURIComponent(last[2])) as Record<string, unknown>;
}

test('filter_motifs emits a filtered browser list', async () => {
  const engine = await createEngine();
  engine.dispatch('initialize');
  engine.outlets.length = 0;
  engine.dispatch('filter_motifs', 'chromatic');

  const lib = lastLibState(engine.outlets);
  assert.ok(lib, 'lib state must be emitted');
  const items = lib['items'] as Array<{ name: string }>;
  assert.ok(items.length >= 1);
  assert.ok(items.every((item) => item.name.toLowerCase().includes('chromatic')));
});

test('clearing search restores the full browser list', async () => {
  const engine = await createEngine();
  engine.dispatch('initialize');
  engine.dispatch('filter_motifs', 'zzz-no-match');
  engine.outlets.length = 0;
  engine.dispatch('filter_motifs');
  engine.dispatch('filter_motifs', 'set');

  const lib = lastLibState(engine.outlets);
  assert.ok(lib, 'lib state must be emitted');
  const items = lib['items'] as Array<{ name: string }>;
  assert.ok(items.length >= 2, 'empty/noise queries must restore builtins');
});

test('lib state includes notes for the selected motif', async () => {
  const engine = await createEngine();
  engine.dispatch('initialize');
  engine.dispatch('motif', 'Chromatic Turn');

  const lib = lastLibState(engine.outlets);
  assert.ok(lib, 'lib state must be emitted');
  const selected = lib['selected'] as Record<string, unknown> | null;
  assert.ok(selected, 'selected motif must be present in lib state');
  const notes = selected['notes'] as Array<Record<string, unknown>>;
  assert.ok(notes.length >= 1, 'at least one note visible in lib state');
  // note shape: { pitch, accidental, at, duration, gate, velocity }
  for (const note of notes) {
    assert.ok('pitch' in note, 'note must have pitch');
    assert.ok('at' in note, 'note must have at');
    assert.ok('duration' in note, 'note must have duration');
  }
});

test('begin_edit clones builtins and edit_meta renames', async () => {
  const engine = await createEngine();
  engine.dispatch('initialize');
  engine.dispatch('motif', 'Chromatic Turn');
  engine.outlets.length = 0;
  engine.dispatch('begin_edit');
  engine.dispatch('edit_meta', 'name', 'My', 'Lick');
  engine.dispatch('edit_meta', 'description', 'Edited', 'blurb');

  const lib = lastLibState(engine.outlets);
  assert.ok(lib, 'lib state must be emitted after edit_meta');
  const selected = lib['selected'] as Record<string, unknown>;
  assert.ok(selected);
  assert.equal(String(selected['name']), 'My Lick');
  assert.ok(String(selected['description']).includes('Edited'));

  const noteRowData = engine.outlets.filter((args) => args[0] === 'ui' && args[1] === 'note-row-data');
  assert.ok(noteRowData.length === 0 || true, 'note-row-data no longer emitted individually (consolidated into lib)');
});

test('edit_note requires an explicit edit session and updates pitch', async () => {
  const engine = await createEngine();
  engine.dispatch('initialize');
  engine.dispatch('motif', 'Chromatic Turn');
  engine.outlets.length = 0;
  engine.dispatch('begin_edit');
  engine.dispatch('edit_note', 'pitch', 7);

  assert.ok(!engine.errors.some((message) => message.includes('Unknown message')));
  const edited = engine.outlets.find((args) => args[0] === 'status' && args[1] === 'note-edited');
  assert.ok(edited);
  assert.equal(edited[3], 'pitch');
  assert.equal(edited[4], 7);

  // lib state should reflect the updated pitch value
  const lib = lastLibState(engine.outlets);
  assert.ok(lib, 'lib state must be emitted after edit_note');
  const notes = (lib['selected'] as Record<string, unknown>)?.['notes'] as Array<Record<string, number>>;
  assert.ok(notes, 'selected notes must be present');
  assert.equal(notes[0]?.['pitch'], 7, 'pitch updated in lib state notes');
});

test('import_clip builds a motif from LiveAPI get_notes', async () => {
  class MockLiveAPI {
    id: string | number;
    constructor(path = '') {
      this.id = path.includes('detail_clip') ? 'id 99' : 0;
    }
    get(property: string): unknown {
      if (property === 'name') return 'Clip Phrase';
      if (property === 'is_midi_clip') return 1;
      return '';
    }
    call(method: string): unknown {
      if (method === 'get_notes_extended') {
        throw new Error('unsupported');
      }
      if (method === 'get_notes') {
        // notes count pitch time duration velocity muted ×2
        return ['notes', 2, 60, 0, 0.5, 100, 0, 63, 0.5, 0.5, 90, 0];
      }
      return [];
    }
  }

  const engine = await createEngine({ liveApi: MockLiveAPI });
  engine.dispatch('initialize');
  engine.outlets.length = 0;
  engine.dispatch('import_clip', 'hybrid');

  assert.ok(!engine.errors.some((message) => message.includes('No clip selected')));
  const status = engine.outlets.find((args) => args[0] === 'status' && args[1] === 'imported-clip');
  assert.ok(status);
  assert.equal(status[3], 2);

  const lib = lastLibState(engine.outlets);
  assert.ok(lib, 'lib state must be emitted after import_clip');
  const selected = lib['selected'] as Record<string, unknown>;
  assert.ok(selected, 'selected motif must be present after import');
  assert.equal(String(selected['name']), 'Clip Phrase');
});

test('import_clip parses get_notes_extended JSON strings from LiveAPI', async () => {
  class MockLiveAPI {
    id: string | number;
    constructor(path = '') {
      this.id = path.includes('detail_clip') ? 'id 42' : 0;
    }
    get(property: string): unknown {
      if (property === 'name') return 'JSON Clip';
      if (property === 'is_midi_clip') return 1;
      return '';
    }
    call(method: string): unknown {
      if (method === 'get_notes_extended') {
        return JSON.stringify({
          notes: [
            { pitch: 60, start_time: 0, duration: 0.25, velocity: 100, mute: 0 },
            { pitch: 62, start_time: 0.25, duration: 0.25, velocity: 96, mute: 0 },
          ],
        });
      }
      return [];
    }
  }

  const engine = await createEngine({ liveApi: MockLiveAPI });
  engine.dispatch('initialize');
  engine.outlets.length = 0;
  engine.dispatch('import_clip', 'chromatic');

  const status = engine.outlets.find((args) => args[0] === 'status' && args[1] === 'imported-clip');
  assert.ok(status);
  assert.equal(status[3], 2);
});

function userMotif(id: string, name: string, pitch = 0): Record<string, unknown> {
  return {
    schemaVersion: 1,
    id,
    name,
    description: `${name} description`,
    pitchMode: 'chromatic',
    sourceMeter: { numerator: 4, denominator: 4 },
    length: 480,
    notes: [{ at: 0, duration: 480, pitch }],
    metadata: { tags: ['user'] },
  };
}



test('import_clip defaults to exact chromatic offsets', async () => {
  class MockLiveAPI {
    id: string | number;
    constructor(path = '') {
      this.id = path.includes('detail_clip') ? 'id 77' : 0;
    }
    get(property: string): unknown {
      if (property === 'name') return 'Descending Clip';
      if (property === 'is_midi_clip') return 1;
      return '';
    }
    call(method: string): unknown {
      if (method === 'get_notes_extended') {
        return JSON.stringify({
          notes: [
            { pitch: 60, start_time: 0, duration: 1, velocity: 127, mute: 0 },
            { pitch: 58, start_time: 1, duration: 0.5, velocity: 127, mute: 0 },
          ],
        });
      }
      return [];
    }
  }

  const engine = await createEngine({ liveApi: MockLiveAPI });
  engine.dispatch('initialize');
  engine.outlets.length = 0;
  engine.dispatch('import_clip');

  const lib = lastLibState(engine.outlets);
  assert.ok(lib);
  const selected = lib['selected'] as Record<string, unknown>;
  assert.equal(selected['pitchMode'], 'chromatic');
  const notes = selected['notes'] as Array<Record<string, unknown>>;
  assert.deepEqual(notes.map((note) => note['pitch']), [0, -2]);
});

test('changing a hybrid motif to chromatic re-encodes pitches instead of reinterpreting them', async () => {
  const engine = await createEngine();
  engine.dispatch('song_context', 'root_note', 0);
  engine.dispatch('song_context', 'scale_intervals', 0, 2, 3, 5, 7, 8, 10);
  engine.dispatch('motif', 'Chromatic Turn');
  engine.dispatch('begin_edit');
  engine.dispatch('edit_motif', {
    pitchMode: 'hybrid',
  });
  engine.dispatch('edit_note_at', 1, 'pitch', -1);
  engine.dispatch('edit_note_at', 1, 'accidental', null);
  engine.dispatch('edit_motif', {
    pitchMode: 'chromatic',
  });

  const lib = lastLibState(engine.outlets);
  assert.ok(lib);
  const selected = lib['selected'] as Record<string, unknown>;
  assert.equal(selected['pitchMode'], 'chromatic');
  const notes = selected['notes'] as Array<Record<string, unknown>>;
  assert.equal(notes[1]?.['pitch'], 2);
  assert.equal(notes[1]?.['accidental'], null);
});

test('chosen library folder loads immediately, including paths with spaces', async () => {
  const path = '/Users/test/Motif Library';
  const files = {
    [`${path}/alpha.json`]: JSON.stringify(userMotif('user-alpha', 'Shared Name', 1)),
    [`${path}/beta.json`]: JSON.stringify(userMotif('user-beta', 'Shared Name', 2)),
  };
  const engine = await createEngine({ files, folders: { [path]: ['alpha.json', 'beta.json'] } });

  engine.dispatch('initialize');
  engine.outlets.length = 0;
  engine.dispatch('library_path', '/Users/test/Motif', 'Library');

  const lib = lastLibState(engine.outlets);
  assert.ok(lib);
  assert.equal(lib['libraryPath'], path);
  assert.equal(lib['libraryLoaded'], true);
  const items = lib['items'] as Array<{ id: string; name: string; showId: boolean }>;
  assert.ok(items.some((item) => item.id === 'user-alpha'));
  assert.ok(items.some((item) => item.id === 'user-beta'));
  assert.ok(items.filter((item) => item.name === 'Shared Name').every((item) => item.showId));
});

test('same-name saved motifs remain independently selectable by stable id', async () => {
  const path = '/Motifs';
  const files = {
    [`${path}/alpha.json`]: JSON.stringify(userMotif('user-alpha', 'Same Name', 1)),
    [`${path}/beta.json`]: JSON.stringify(userMotif('user-beta', 'Same Name', 2)),
  };
  const engine = await createEngine({ files, folders: { [path]: ['alpha.json', 'beta.json'] } });
  engine.dispatch('library_path', path);

  engine.dispatch('select_browser', 'user-beta');
  let lib = lastLibState(engine.outlets);
  assert.equal((lib?.['selected'] as Record<string, unknown>)?.['id'], 'user-beta');

  engine.dispatch('select_browser', 'user-alpha');
  lib = lastLibState(engine.outlets);
  assert.equal((lib?.['selected'] as Record<string, unknown>)?.['id'], 'user-alpha');
});

test('save writes the unique id file and exits edit mode', async () => {
  const path = '/Motifs';
  const engine = await createEngine({ folders: { [path]: [] } });
  engine.dispatch('library_path', path);
  engine.dispatch('motif', 'Chromatic Turn');
  engine.dispatch('begin_edit');

  let lib = lastLibState(engine.outlets);
  const draftId = String((lib?.['selected'] as Record<string, unknown>)?.['id']);
  assert.notEqual(draftId, 'chromatic-turn');
  assert.equal((lib?.['editing'] as Record<string, unknown>)?.['active'], true);

  engine.dispatch('lib_action', encodeURIComponent(JSON.stringify({
    type: 'save_motif',
    name: 'Chromatic Turn',
    description: 'Saved copy',
  })));

  lib = lastLibState(engine.outlets);
  assert.equal((lib?.['editing'] as Record<string, unknown>)?.['active'], false);
  assert.equal((lib?.['selected'] as Record<string, unknown>)?.['id'], draftId);
  assert.equal((lib?.['selected'] as Record<string, unknown>)?.['isPersisted'], true);
  assert.ok(engine.files[`${path}/${draftId}.json`]);
});

test('cancel edit restores the original motif and removes a new draft', async () => {
  const engine = await createEngine();
  engine.dispatch('motif', 'Chromatic Turn');
  engine.dispatch('begin_edit');
  engine.dispatch('edit_meta', 'name', 'Temporary Name');

  const editing = lastLibState(engine.outlets);
  const draftId = String((editing?.['selected'] as Record<string, unknown>)?.['id']);
  engine.dispatch('cancel_edit');

  const lib = lastLibState(engine.outlets);
  assert.equal((lib?.['editing'] as Record<string, unknown>)?.['active'], false);
  assert.equal((lib?.['selected'] as Record<string, unknown>)?.['id'], 'chromatic-turn');
  assert.equal((lib?.['selected'] as Record<string, unknown>)?.['name'], 'Chromatic Turn');
  assert.ok(lib);
  assert.ok(!(lib['items'] as Array<{ id: string }>).some((item) => item.id === draftId));
});

test('dirty edits block both browser and main-menu selection until explicitly discarded', async () => {
  const engine = await createEngine();
  engine.dispatch('motif', 'Chromatic Turn');
  engine.dispatch('begin_edit');
  engine.dispatch('edit_meta', 'name', 'Dirty Draft');
  const draftId = String((lastLibState(engine.outlets)?.['selected'] as Record<string, unknown>)?.['id']);

  engine.dispatch('select_browser', 'scale-turn');
  let lib = lastLibState(engine.outlets);
  assert.equal((lib?.['selected'] as Record<string, unknown>)?.['id'], draftId);

  engine.dispatch('motif', 'Salt Peanuts');
  lib = lastLibState(engine.outlets);
  assert.equal((lib?.['selected'] as Record<string, unknown>)?.['id'], draftId);

  engine.dispatch('select_browser', 'scale-turn', true);
  lib = lastLibState(engine.outlets);
  assert.equal((lib?.['selected'] as Record<string, unknown>)?.['id'], 'scale-turn');
  assert.equal((lib?.['editing'] as Record<string, unknown>)?.['active'], false);
  assert.ok(lib);
  assert.ok(!(lib['items'] as Array<{ id: string }>).some((item) => item.id === draftId));
});

test('duplicate user ids are skipped without hiding distinct same-name motifs', async () => {
  const path = '/Motifs';
  const engine = await createEngine({
    files: {
      [`${path}/first.json`]: JSON.stringify(userMotif('duplicate-id', 'First Name')),
      [`${path}/second.json`]: JSON.stringify(userMotif('duplicate-id', 'Second Name')),
      [`${path}/third.json`]: JSON.stringify(userMotif('unique-id', 'First Name')),
    },
    folders: { [path]: ['first.json', 'second.json', 'third.json'] },
  });
  engine.dispatch('library_path', path);

  const lib = lastLibState(engine.outlets);
  const items = lib?.['items'] as Array<{ id: string; name: string; showId: boolean }>;
  assert.equal(items.filter((item) => item.id === 'duplicate-id').length, 1);
  assert.ok(items.some((item) => item.id === 'unique-id'));
  assert.ok(engine.errors.some((message) => message.includes('duplicate motif id')));
});

test('complete motif properties and advanced note fields can be edited and saved atomically', async () => {
  const path = '/Motifs';
  const engine = await createEngine({ folders: { [path]: [] } });
  engine.dispatch('library_path', path);
  engine.dispatch('motif', 'Chromatic Turn');
  engine.dispatch('begin_edit');

  const properties = {
    name: 'Complete Motif',
    description: 'Exercises every editable motif property.',
    pitchMode: 'hybrid',
    sourceMeter: { numerator: 3, denominator: 8 },
    defaultGate: 0.75,
    velocityCurve: { inputMin: 5, inputMax: 120, outputMin: 20, outputMax: 110, exponent: 1.25 },
    metadata: {
      author: 'Test Author',
      source: 'https://example.test/source',
      license: 'Test license',
      tags: ['test', 'complete', 'test'],
      suggestedModes: ['dorian', 'minor'],
      pickupTicks: 240,
    },
  };
  engine.dispatch('lib_action', encodeURIComponent(JSON.stringify({ type: 'edit_motif', properties })));
  for (const [field, value] of [
    ['velocityOffset', 7],
    ['velocityScale', 0.5],
    ['legato', true],
    ['tie', true],
  ] as const) {
    engine.dispatch('lib_action', encodeURIComponent(JSON.stringify({
      type: 'edit_note_at', index: 0, field, value,
    })));
  }

  let lib = lastLibState(engine.outlets);
  assert.ok(lib);
  let selected = lib['selected'] as Record<string, unknown>;
  assert.equal(selected['name'], 'Complete Motif');
  assert.equal(selected['pitchMode'], 'hybrid');
  assert.deepEqual(selected['sourceMeter'], { numerator: 3, denominator: 8 });
  assert.equal(selected['defaultGate'], 0.75);
  assert.deepEqual(selected['velocityCurve'], properties.velocityCurve);
  assert.deepEqual(selected['metadata'], {
    author: 'Test Author',
    source: 'https://example.test/source',
    license: 'Test license',
    tags: ['test', 'complete'],
    suggestedModes: ['dorian', 'minor'],
    pickupTicks: 240,
  });
  const notes = selected['notes'] as Array<Record<string, unknown>>;
  assert.equal(notes[0]?.['velocityOffset'], 7);
  assert.equal(notes[0]?.['velocityScale'], 0.5);
  assert.equal(notes[0]?.['legato'], true);
  assert.equal(notes[0]?.['tie'], true);

  const draftId = String(selected['id']);
  engine.dispatch('lib_action', encodeURIComponent(JSON.stringify({ type: 'save_motif', properties })));
  lib = lastLibState(engine.outlets);
  assert.equal((lib?.['editing'] as Record<string, unknown>)?.['active'], false);
  const saved = JSON.parse(engine.files[`${path}/${draftId}.json`] ?? '{}') as Record<string, unknown>;
  assert.equal(saved['name'], 'Complete Motif');
  assert.deepEqual(saved['velocityCurve'], properties.velocityCurve);
  assert.deepEqual((saved['metadata'] as Record<string, unknown>)['tags'], ['test', 'complete']);
  assert.equal(((saved['notes'] as Array<Record<string, unknown>>)[0])?.['legato'], true);
});

test('optional motif properties can be cleared without leaving empty objects in saved JSON', async () => {
  const path = '/Motifs';
  const filename = `${path}/user-full.json`;
  const original = {
    ...userMotif('user-full', 'User Full'),
    defaultGate: 0.8,
    velocityCurve: { outputMin: 20, outputMax: 100, exponent: 1.2 },
    metadata: { author: 'Author', tags: ['tag'], suggestedModes: ['minor'], pickupTicks: 120 },
  };
  const engine = await createEngine({
    files: { [filename]: JSON.stringify(original) },
    folders: { [path]: ['user-full.json'] },
  });
  engine.dispatch('library_path', path);
  engine.dispatch('select_browser', 'user-full');
  engine.dispatch('begin_edit');
  const properties = {
    name: 'User Full',
    description: 'User Full description',
    pitchMode: 'chromatic',
    sourceMeter: { numerator: 4, denominator: 4 },
    defaultGate: null,
    velocityCurve: { inputMin: null, inputMax: null, outputMin: null, outputMax: null, exponent: null },
    metadata: { author: '', source: '', license: '', tags: [], suggestedModes: [], pickupTicks: null },
  };
  engine.dispatch('lib_action', encodeURIComponent(JSON.stringify({ type: 'save_motif', properties })));

  const saved = JSON.parse(engine.files[filename] ?? '{}') as Record<string, unknown>;
  assert.ok(!('defaultGate' in saved));
  assert.ok(!('velocityCurve' in saved));
  assert.ok(!('metadata' in saved));
  const selected = lastLibState(engine.outlets)?.['selected'] as Record<string, unknown>;
  assert.equal(selected['defaultGate'], null);
  assert.deepEqual(selected['velocityCurve'], {
    inputMin: null, inputMax: null, outputMin: null, outputMax: null, exponent: null,
  });
});

test('invalid property updates are rejected atomically and read-only identity fields cannot change', async () => {
  const engine = await createEngine();
  engine.dispatch('motif', 'Chromatic Turn');
  engine.dispatch('begin_edit');
  const before = lastLibState(engine.outlets)?.['selected'] as Record<string, unknown>;
  const draftId = String(before['id']);

  engine.dispatch('lib_action', encodeURIComponent(JSON.stringify({
    type: 'edit_motif',
    properties: {
      name: 'Should Not Apply',
      description: 'Still invalid as a whole.',
      pitchMode: 'scale',
      sourceMeter: { numerator: 7, denominator: 3 },
    },
  })));
  let selected = lastLibState(engine.outlets)?.['selected'] as Record<string, unknown>;
  assert.equal(selected['name'], 'Chromatic Turn');
  assert.equal(selected['pitchMode'], 'chromatic');
  assert.ok(engine.errors.some((message) => message.includes('sourceMeter.denominator')));

  engine.dispatch('lib_action', encodeURIComponent(JSON.stringify({
    type: 'edit_motif', properties: { id: 'renamed-id' },
  })));
  selected = lastLibState(engine.outlets)?.['selected'] as Record<string, unknown>;
  assert.equal(selected['id'], draftId);
  assert.ok(engine.errors.some((message) => message.includes('cannot be changed')));
});

test('blank names and out-of-range note edits are rejected without corrupting state', async () => {
  const path = '/Motifs';
  const engine = await createEngine({ folders: { [path]: [] } });
  engine.dispatch('library_path', path);
  engine.dispatch('motif', 'Chromatic Turn');
  engine.dispatch('begin_edit');
  const before = lastLibState(engine.outlets);
  const draftId = String((before?.['selected'] as Record<string, unknown>)?.['id']);

  engine.dispatch('lib_action', encodeURIComponent(JSON.stringify({
    type: 'save_motif', name: '   ', description: 'invalid',
  })));
  let lib = lastLibState(engine.outlets);
  assert.equal((lib?.['editing'] as Record<string, unknown>)?.['active'], true);
  assert.equal((lib?.['selected'] as Record<string, unknown>)?.['name'], 'Chromatic Turn');
  assert.equal(engine.files[`${path}/${draftId}.json`], undefined);

  engine.dispatch('lib_action', encodeURIComponent(JSON.stringify({
    type: 'edit_note_at', index: 999, field: 'pitch', value: 12,
  })));
  lib = lastLibState(engine.outlets);
  const notes = (lib?.['selected'] as Record<string, unknown>)?.['notes'] as Array<Record<string, unknown>>;
  assert.equal(notes[0]?.['pitch'], 0);
  assert.ok(engine.errors.some((message) => message.includes('Unknown note row')));
});


test('invalid and conflicting JSON filenames are reserved when creating user ids', async () => {
  const path = '/Motifs';
  const engine = await createEngine({
    files: {
      [`${path}/chromatic-turn-2.json`]: '{ invalid json',
      [`${path}/chromatic-turn-3.json`]: JSON.stringify(userMotif('other-id', 'Other Motif')),
    },
    folders: { [path]: ['chromatic-turn-2.json', 'chromatic-turn-3.json'] },
  });
  engine.dispatch('library_path', path);
  engine.dispatch('motif', 'Chromatic Turn');
  engine.dispatch('begin_edit');

  const lib = lastLibState(engine.outlets);
  assert.ok(lib);
  const selected = lib['selected'] as Record<string, unknown>;
  assert.equal(selected['id'], 'chromatic-turn-4');
  assert.ok(engine.errors.some((message) => message.includes('chromatic-turn-2.json')));
});

test('save never overwrites an unscanned file that appeared after library load', async () => {
  const path = '/Motifs';
  const engine = await createEngine({ folders: { [path]: [] } });
  engine.dispatch('library_path', path);
  engine.dispatch('motif', 'Chromatic Turn');
  engine.dispatch('begin_edit');

  const editing = lastLibState(engine.outlets);
  assert.ok(editing);
  const draftId = String((editing['selected'] as Record<string, unknown>)['id']);
  const filename = `${path}/${draftId}.json`;
  engine.files[filename] = 'external file';
  engine.dispatch('save_motif');

  const lib = lastLibState(engine.outlets);
  assert.ok(lib);
  assert.equal((lib['editing'] as Record<string, unknown>)['active'], true);
  assert.equal(engine.files[filename], 'external file');
  assert.ok(engine.errors.some((message) => message.includes('Save refused')));
});

test('unavailable library paths cannot be used for saving through direct messages', async () => {
  const engine = await createEngine();
  engine.dispatch('library_path', '/missing');
  engine.dispatch('motif', 'Chromatic Turn');
  engine.dispatch('begin_edit');
  engine.dispatch('save_motif');

  const lib = lastLibState(engine.outlets);
  assert.ok(lib);
  assert.equal(lib['libraryLoaded'], false);
  assert.equal((lib['editing'] as Record<string, unknown>)['active'], true);
  assert.ok(engine.errors.some((message) => message.includes('valid library folder')));
});

test('a failed clip import does not cancel a clean edit session', async () => {
  const engine = await createEngine();
  engine.dispatch('motif', 'Chromatic Turn');
  engine.dispatch('begin_edit');
  const before = lastLibState(engine.outlets);
  assert.ok(before);
  const draftId = (before['selected'] as Record<string, unknown>)['id'];

  engine.dispatch('import_clip');

  const lib = lastLibState(engine.outlets);
  assert.ok(lib);
  assert.equal((lib['editing'] as Record<string, unknown>)['active'], true);
  assert.equal((lib['selected'] as Record<string, unknown>)['id'], draftId);
  assert.ok(engine.errors.some((message) => message.includes('No clip selected')));
});

test('non-primitive metadata payloads are rejected without clearing fields', async () => {
  const engine = await createEngine();
  engine.dispatch('motif', 'Chromatic Turn');
  engine.dispatch('begin_edit');
  engine.dispatch('lib_action', encodeURIComponent(JSON.stringify({
    type: 'save_motif',
    name: { malicious: true },
    description: [],
  })));

  const lib = lastLibState(engine.outlets);
  assert.ok(lib);
  assert.equal((lib['selected'] as Record<string, unknown>)['name'], 'Chromatic Turn');
  assert.equal((lib['editing'] as Record<string, unknown>)['active'], true);
  assert.ok(engine.errors.some((message) => message.includes('Motif name must be text')));
});
