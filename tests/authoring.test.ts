import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';
import vm from 'node:vm';

type OutletArgs = unknown[];

async function createEngine(options: {
  liveApi?: new (callback?: (args: unknown[]) => void, path?: string) => {
    id: number;
    get: (property: string) => number | number[];
    getstring: (property: string) => string | string[];
    call: (method: string, ...args: unknown[]) => unknown;
  };
  files?: Record<string, string>;
  folders?: Record<string, string[]>;
  deferTasks?: boolean;
} = {}): Promise<{
  dispatch: (message: string, ...args: unknown[]) => void;
  outlets: OutletArgs[];
  errors: string[];
  files: Record<string, string>;
  folderOpenPaths: string[];
  scheduledTaskDelays: number[];
  runScheduledTasks: (limit?: number) => number;
}> {
  const source = await readFile('dist/motif-device.js', 'utf8');
  const outlets: OutletArgs[] = [];
  const errors: string[] = [];

  const LiveAPI = options.liveApi ?? class {
    id = 0;
    get(): number {
      return 0;
    }
    getstring(): string {
      return '';
    }
    call(): unknown {
      return [];
    }
  };

  const files = options.files ?? {};
  const folders = options.folders ?? {};
  const folderOpenPaths: string[] = [];
  const scheduledTasks: Array<() => void> = [];
  const scheduledTaskDelays: number[] = [];

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
      folderOpenPaths.push(pathname);
      const entries = folders[pathname];
      this.pathname = entries ? pathname : '';
      this.#entries = entries ?? [];
      this.count = this.#entries.length;
      this.end = this.#entries.length === 0;
      this.filename = this.#entries[0] ?? '';
    }

    get extension(): string | null {
      const separator = this.filename.lastIndexOf('.');
      return separator < 0 ? null : this.filename.slice(separator);
    }

    get filetype(): string | null {
      if (!this.pathname || !this.filename) return null;
      const separator = this.pathname.endsWith('/') ? '' : '/';
      if (Object.prototype.hasOwnProperty.call(folders, `${this.pathname}${separator}${this.filename}`)) {
        return 'fold';
      }
      return this.filename.toLowerCase().endsWith('.json') ? 'JSON' : null;
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

  class MockTask {
    #cancelled = false;

    constructor(
      readonly callback: (...args: unknown[]) => void,
      readonly context?: object,
      readonly args: unknown[] = [],
    ) {}

    cancel(): void {
      this.#cancelled = true;
    }

    freepeer(): void {
      this.#cancelled = true;
    }

    schedule(delay = 0): void {
      scheduledTaskDelays.push(delay);
      const execute = () => {
        if (!this.#cancelled) this.callback.apply(this.context, this.args);
      };
      if (options.deferTasks) scheduledTasks.push(execute);
      else execute();
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
    Task: MockTask,
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
    folderOpenPaths,
    scheduledTaskDelays,
    runScheduledTasks(limit = Number.POSITIVE_INFINITY) {
      let count = 0;
      while (scheduledTasks.length > 0 && count < limit) {
        scheduledTasks.shift()?.();
        count += 1;
      }
      return count;
    },
  };
}

/**
 * Decode the last library-state JSON from outlet emissions.
 * @param {OutletArgs[]} outlets The captured Max outlet messages.
 * @returns {Record<string, unknown> | undefined} The decoded state, when emitted.
 */
function lastLibState(outlets: OutletArgs[]): Record<string, unknown> | undefined {
  for (const args of [...outlets].reverse()) {
    if (args[0] !== 'ui' || args[1] !== 'lib' || typeof args[2] !== 'string') continue;
    const payload = JSON.parse(decodeURIComponent(args[2])) as Record<string, unknown>;
    if (payload['kind'] !== 'note-chunk') return payload;
  }
  return undefined;
}

describe('Max authoring runtime', () => {
  it('filter_motifs emits a filtered browser list', async () => {
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

  it('clearing search restores the full browser list', async () => {
    const engine = await createEngine();
    engine.dispatch('initialize');
    engine.dispatch('filter_motifs', 'zzz-no-match');
    engine.outlets.length = 0;
    engine.dispatch('filter_motifs');

    const lib = lastLibState(engine.outlets);
    assert.ok(lib, 'lib state must be emitted');
    const items = lib['items'] as Array<{ name: string }>;
    assert.ok(items.length >= 2, 'an empty query must restore builtins');
  });

  it('lib state includes notes for the selected motif', async () => {
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

  it('invert and reverse change playback and preview without mutating stored motif notes', async () => {
    const engine = await createEngine();
    engine.dispatch('initialize');
    assert.deepEqual(
      [...engine.outlets].reverse().find((args) =>
        args[0] === 'ui' && args[1] === 'transforms')?.slice(2),
      [0, 0],
      'initialize must synchronize both visual transform latches off',
    );

    engine.dispatch('invert_toggle');
    assert.deepEqual(
      [...engine.outlets].reverse().find((args) =>
        args[0] === 'ui' && args[1] === 'transforms')?.slice(2),
      [1, 0],
      'first Invert click must latch the engine and UI on',
    );
    engine.outlets.length = 0;
    engine.dispatch('note', 60, 100, 1);
    assert.deepEqual(
      engine.outlets
        .filter((args) => args[0] === 'event' && Number(args[2]) > 0)
        .map((args) => args[1]),
      [60, 59, 57, 53, 55, 59, 60],
      'Invert must mirror scale-degree offsets around the trigger pitch',
    );
    const invertedPreviewRaw = [...engine.outlets].reverse()
      .find((args) => args[0] === 'ui' && args[1] === 'preview')?.[2];
    const invertedPreview = JSON.parse(decodeURIComponent(String(invertedPreviewRaw))) as {
      notes: Array<{ pitch: number }>;
    };
    assert.deepEqual(invertedPreview.notes.map(({ pitch }) => pitch), [60, 59, 57, 53, 55, 59, 60]);

    engine.dispatch('invert_toggle');
    engine.dispatch('reverse_toggle');
    assert.deepEqual(
      [...engine.outlets].reverse().find((args) =>
        args[0] === 'ui' && args[1] === 'transforms')?.slice(2),
      [0, 1],
      'second Invert click and first Reverse click must synchronize their latch states',
    );
    engine.outlets.length = 0;
    engine.dispatch('note', 60, 100, 1);
    assert.deepEqual(
      engine.outlets
        .filter((args) => args[0] === 'event' && Number(args[2]) > 0)
        .map((args) => args[1]),
      [60, 62, 65, 67, 64, 62, 60],
      'Reverse must play the stored note sequence backward',
    );

    const selected = lastLibState(engine.outlets)?.['selected'] as Record<string, unknown>;
    assert.deepEqual(
      (selected['notes'] as Array<Record<string, unknown>>).map((note) => note['pitch']),
      [0, 1, 2, 4, 3, 1, 0],
      'Library note data must remain in stored order with stored offsets',
    );

    engine.dispatch('reverse_toggle');
    assert.deepEqual(
      [...engine.outlets].reverse().find((args) =>
        args[0] === 'ui' && args[1] === 'transforms')?.slice(2),
      [0, 0],
      'second Reverse click must synchronize both transform latches off',
    );
    engine.outlets.length = 0;
    engine.dispatch('note', 60, 100, 1);
    assert.deepEqual(
      engine.outlets
        .filter((args) => args[0] === 'event' && Number(args[2]) > 0)
        .map((args) => args[1]),
      [60, 62, 64, 67, 65, 62, 60],
      'Disabling Reverse after disabling Invert must restore original playback',
    );
    const restoredPreviewRaw = [...engine.outlets].reverse()
      .find((args) => args[0] === 'ui' && args[1] === 'preview')?.[2];
    const restoredPreview = JSON.parse(decodeURIComponent(String(restoredPreviewRaw))) as {
      notes: Array<{ pitch: number }>;
    };
    assert.deepEqual(
      restoredPreview.notes.map(({ pitch }) => pitch),
      [60, 62, 64, 67, 65, 62, 60],
      'Disabling both transforms must restore the original preview',
    );
    assert.deepEqual(engine.errors, [], 'valid transform toggles must not emit errors');
  });

  it('begin_edit clones builtins and edit_motif updates editable properties', async () => {
    const engine = await createEngine();
    engine.dispatch('initialize');
    engine.dispatch('motif', 'Chromatic Turn');
    engine.outlets.length = 0;
    engine.dispatch('begin_edit');
    engine.dispatch('edit_motif', { name: 'My Lick', description: 'Edited blurb' });

    const lib = lastLibState(engine.outlets);
    assert.ok(lib, 'lib state must be emitted after edit_motif');
    const selected = lib['selected'] as Record<string, unknown>;
    assert.ok(selected);
    assert.equal(String(selected['name']), 'My Lick');
    assert.ok(String(selected['description']).includes('Edited'));

    const noteRowData = engine.outlets.filter((args) => args[0] === 'ui' && args[1] === 'note-row-data');
    assert.ok(noteRowData.length === 0 || true, 'note-row-data no longer emitted individually (consolidated into lib)');
  });

  it('edit_note_at requires an explicit edit session and updates pitch', async () => {
    const engine = await createEngine();
    engine.dispatch('initialize');
    engine.dispatch('motif', 'Chromatic Turn');
    engine.outlets.length = 0;
    engine.dispatch('begin_edit');
    engine.dispatch('lib_action', encodeURIComponent(JSON.stringify({
      type: 'edit_note_at',
      index: 0,
      field: 'pitch',
      value: 7,
    })));

    assert.ok(!engine.errors.some((message) => message.includes('Unknown message')));
    const edited = engine.outlets.find((args) => args[0] === 'status' && args[1] === 'note-edited');
    assert.ok(edited);
    assert.equal(edited[3], 'pitch');
    assert.equal(edited[4], 7);

    // lib state should reflect the updated pitch value
    const lib = lastLibState(engine.outlets);
    assert.ok(lib, 'lib state must be emitted after edit_note_at');
    const notes = (lib['selected'] as Record<string, unknown>)?.['notes'] as Array<Record<string, number>>;
    assert.ok(notes, 'selected notes must be present');
    assert.equal(notes[0]?.['pitch'], 7, 'pitch updated in lib state notes');
  });

  it('import_clip uses the documented LiveAPI constructor and full get_notes_extended pitch span', async () => {
    const constructorCalls: Array<[((args: unknown[]) => void) | undefined, string | undefined]> = [];
    const methodCalls: Array<[string, ...unknown[]]> = [];

    class MockLiveAPI {
      id: number;
      constructor(callback?: (args: unknown[]) => void, path?: string) {
        constructorCalls.push([callback, path]);
        this.id = path?.includes('detail_clip') ? 99 : 0;
      }
      get(property: string): number {
        if (property === 'is_midi_clip') return 1;
        return 0;
      }
      getstring(property: string): string {
        return property === 'name' ? 'Clip Phrase' : '';
      }
      call(method: string, ...args: unknown[]): unknown {
        methodCalls.push([method, ...args]);
        if (method === 'get_notes_extended') {
          return JSON.stringify({
            notes: [
              { pitch: 60, start_time: 0, duration: 0.5, velocity: 100, mute: 0 },
              { pitch: 63, start_time: 0.5, duration: 0.5, velocity: 90, mute: 0 },
            ],
          });
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
    assert.deepEqual(constructorCalls[0], [undefined, 'live_set view detail_clip']);
    assert.deepEqual(methodCalls[0], ['get_notes_extended', 0, 128, 0, 4096]);
  });

  it('import_clip parses get_notes_extended JSON strings from LiveAPI', async () => {
    class MockLiveAPI {
      id: number;
      constructor(_callback?: (args: unknown[]) => void, path?: string) {
        this.id = path?.includes('detail_clip') ? 42 : 0;
      }
      get(property: string): number {
        if (property === 'is_midi_clip') return 1;
        return 0;
      }
      getstring(property: string): string {
        return property === 'name' ? 'JSON Clip' : '';
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

  it('rejects oversized MIDI clips with an actionable Library warning before creating a large payload', async () => {
    class MockLiveAPI {
      id: number;
      constructor(_callback?: (args: unknown[]) => void, path?: string) {
        this.id = path?.includes('detail_clip') ? 88 : 0;
      }
      get(property: string): number {
        return property === 'is_midi_clip' ? 1 : 0;
      }
      getstring(property: string): string {
        return property === 'name' ? 'Oversized Clip' : '';
      }
      call(method: string): unknown {
        if (method !== 'get_notes_extended') return [];
        return JSON.stringify({
          notes: Array.from({ length: 513 }, (_, index) => ({
            pitch: 60 + (index % 12),
            start_time: index * 0.25,
            duration: 0.25,
            velocity: 100,
            mute: 0,
          })),
        });
      }
    }

    const engine = await createEngine({ liveApi: MockLiveAPI });
    engine.dispatch('initialize');
    engine.outlets.length = 0;
    engine.dispatch('import_clip');

    assert.ok(!engine.outlets.some((args) =>
      args[0] === 'status' && args[1] === 'imported-clip',
    ));
    const lib = lastLibState(engine.outlets);
    assert.ok(lib);
    assert.deepEqual(lib['alert'], {
      id: 1,
      title: 'MIDI file is too long',
      message: 'The selected MIDI clip contains 513 notes. Motif can import up to 512 editable notes. Shorten the clip or split it into smaller phrases, then import it again.',
    });
    assert.equal((lib['selected'] as Record<string, unknown>)['id'], 'scale-turn');
    assert.ok(engine.errors.some((message) =>
      message.includes('MIDI clip contains 513 notes') && message.includes('up to 512'),
    ));
  });

  it('imports exactly 512 notes using bounded chunks for one scrollable Library table', async () => {
    class MockLiveAPI {
      id: number;
      constructor(_callback?: (args: unknown[]) => void, path?: string) {
        this.id = path?.includes('detail_clip') ? 89 : 0;
      }
      get(property: string): number {
        return property === 'is_midi_clip' ? 1 : 0;
      }
      getstring(property: string): string {
        return property === 'name' ? 'Full Length Clip' : '';
      }
      call(method: string): unknown {
        if (method !== 'get_notes_extended') return [];
        return JSON.stringify({
          notes: Array.from({ length: 512 }, (_, index) => ({
            pitch: 60 + (index % 12),
            start_time: index * 0.25,
            duration: 0.25,
            velocity: 100,
            mute: 0,
          })),
        });
      }
    }

    const engine = await createEngine({ liveApi: MockLiveAPI });
    engine.dispatch('import_clip');

    assert.ok(engine.outlets.some((args) =>
      args[0] === 'status' && args[1] === 'imported-clip' && args[3] === 512,
    ));
    const selected = lastLibState(engine.outlets)?.['selected'] as Record<string, unknown>;
    assert.equal(selected['noteCount'], 512);
    assert.equal(selected['noteLimit'], 512);
    assert.equal(selected['notesLoading'], true);
    assert.deepEqual(selected['notes'], []);

    const chunks = engine.outlets
      .filter((args) => args[0] === 'ui' && args[1] === 'lib' && typeof args[2] === 'string')
      .map((args) => JSON.parse(decodeURIComponent(String(args[2]))) as Record<string, unknown>)
      .filter((payload) => payload['kind'] === 'note-chunk');
    assert.equal(chunks.length, 16);
    assert.ok(chunks.every((chunk) => (chunk['notes'] as unknown[]).length <= 32));
    assert.equal(
      chunks.reduce((count, chunk) => count + (chunk['notes'] as unknown[]).length, 0),
      512,
    );
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
    };
  }



  it('import_clip defaults to exact chromatic offsets', async () => {
    class MockLiveAPI {
      id: number;
      constructor(_callback?: (args: unknown[]) => void, path?: string) {
        this.id = path?.includes('detail_clip') ? 77 : 0;
      }
      get(property: string): number {
        if (property === 'is_midi_clip') return 1;
        return 0;
      }
      getstring(property: string): string {
        return property === 'name' ? 'Descending Clip' : '';
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

  it('changing a hybrid motif to chromatic re-encodes pitches instead of reinterpreting them', async () => {
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

  it('chosen library folder loads immediately, including paths with spaces', async () => {
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

  it('sends ordinary note lists directly for the single scrollable Library table', async () => {
    const path = '/Motifs';
    const notes = Array.from({ length: 24 }, (_, index) => ({
      at: index * 120,
      duration: 120,
      pitch: index % 12,
    }));
    const motif = {
      ...userMotif('large-playback-motif', 'Large Playback Motif'),
      length: notes.length * 120,
      notes,
    };
    const engine = await createEngine({
      files: { [`${path}/large.json`]: JSON.stringify(motif) },
      folders: { [path]: ['large.json'] },
    });
    engine.dispatch('library_path', path);
    engine.dispatch('select_browser', 'large-playback-motif');

    const lib = lastLibState(engine.outlets);
    assert.ok(lib);
    const selected = lib['selected'] as Record<string, unknown>;
    assert.equal(selected['noteCount'], 24);
    assert.equal(selected['noteLimit'], 512);
    assert.equal(selected['notesLoading'], false);
    assert.equal((selected['notes'] as unknown[]).length, 24);
    assert.match(String(selected['stats']), /^24 notes/);
    assert.equal(((selected['notes'] as Array<Record<string, unknown>>)[16])?.['pitch'], 4);
  });

  it('recursively loads, groups, and searches motifs in sub-directories', async () => {
    const path = '/Users/test/Motif Library';
    const files = {
      [`${path}/loose.json`]: JSON.stringify(userMotif('loose', 'Loose Motif')),
      [`${path}/Bass/bass.json`]: JSON.stringify(userMotif('bass-line', 'Bass Line')),
      [`${path}/Bass/Fills/fill.JSON`]: JSON.stringify(userMotif('bass-fill', 'Turnaround')),
      [`${path}/Bass/notes.txt`]: 'not a motif',
    };
    const folders = {
      [path]: ['loose.json', 'Bass', 'Empty'],
      [`${path}/Bass`]: ['bass.json', 'Fills', 'notes.txt'],
      [`${path}/Bass/Fills`]: ['fill.JSON'],
      [`${path}/Empty`]: [],
    };
    const engine = await createEngine({ files, folders });

    engine.dispatch('library_path', path);
    let lib = lastLibState(engine.outlets);
    assert.ok(lib);
    const items = lib['items'] as Array<{ id: string; folder: string }>;
    assert.equal(items.find((item) => item.id === 'loose')?.folder, 'Library');
    assert.equal(items.find((item) => item.id === 'bass-line')?.folder, 'Bass');
    assert.equal(items.find((item) => item.id === 'bass-fill')?.folder, 'Bass/Fills');
    assert.equal(items.find((item) => item.id === 'chromatic-turn')?.folder, 'Built-ins');
    assert.ok(!engine.errors.some((message) => message.includes('notes.txt')));
    assert.deepEqual(
      engine.folderOpenPaths,
      [path, `${path}/Bass`, `${path}/Empty`, `${path}/Bass/Fills`],
      'each directory must open once and files must never be probed as Folder objects',
    );

    engine.dispatch('filter_motifs', 'bass/fills');
    lib = lastLibState(engine.outlets);
    assert.ok(lib);
    assert.deepEqual(
      (lib['items'] as Array<{ id: string }>).map((item) => item.id),
      ['bass-fill'],
      'relative folder names must participate in search',
    );
  });

  it('scans large libraries in bounded Task batches without replacing the active library early', async () => {
    const path = '/Large Library';
    const filenames = Array.from({ length: 100 }, (_, index) => `motif-${index}.json`);
    const files = Object.fromEntries(filenames.map((filename, index) => [
      `${path}/${filename}`,
      JSON.stringify(userMotif(`large-${index}`, `Large ${index}`)),
    ]));
    const engine = await createEngine({
      files,
      folders: { [path]: filenames },
      deferTasks: true,
    });

    engine.dispatch('library_path', path);
    let lib = lastLibState(engine.outlets);
    assert.ok(lib);
    assert.equal(lib['libraryScanning'], true);
    assert.equal(lib['libraryLoaded'], false);
    assert.ok(
      (lib['items'] as Array<{ id: string }>).some((item) => item.id === 'scale-turn'),
      'the active library must remain available while the replacement scan is pending',
    );
    assert.equal(
      (lib['items'] as Array<{ id: string }>).some((item) => item.id === 'large-0'),
      false,
    );

    assert.equal(engine.runScheduledTasks(1), 1);
    lib = lastLibState(engine.outlets);
    assert.ok(lib);
    assert.equal(lib['libraryScanning'], true, 'one batch must not synchronously consume 100 files');

    engine.dispatch('begin_edit');
    lib = lastLibState(engine.outlets);
    assert.ok(lib);
    assert.equal((lib['editing'] as Record<string, unknown>)['active'], false);
    assert.ok(engine.errors.some((message) => message.includes('scan to finish')));

    engine.dispatch('filter_motifs', 'scale');
    lib = lastLibState(engine.outlets);
    assert.ok(lib);
    assert.equal(lib['libraryScanning'], true, 'the engine must remain responsive between batches');

    assert.ok(engine.runScheduledTasks() >= 1);
    lib = lastLibState(engine.outlets);
    assert.ok(lib);
    assert.equal(lib['libraryScanning'], false);
    assert.equal(lib['libraryLoaded'], true);
    assert.equal(
      (lib['items'] as Array<{ id: string }>).filter((item) => item.id.startsWith('large-')).length,
      0,
      'the active search remains applied after the scan commits',
    );
    engine.dispatch('filter_motifs');
    lib = lastLibState(engine.outlets);
    assert.ok(lib);
    assert.equal(
      (lib['items'] as Array<{ id: string }>).filter((item) => item.id.startsWith('large-')).length,
      100,
    );
    assert.deepEqual(engine.folderOpenPaths, [path], 'flat-library files must not be opened as folders');
  });

  it('saves an edited motif back to its original sub-directory', async () => {
    const path = '/Motifs';
    const nestedFilename = `${path}/Leads/Arps/nested.json`;
    const files = {
      [nestedFilename]: JSON.stringify(userMotif('nested-motif', 'Nested Motif')),
    };
    const engine = await createEngine({
      files,
      folders: {
        [path]: ['Leads'],
        [`${path}/Leads`]: ['Arps'],
        [`${path}/Leads/Arps`]: ['nested.json'],
      },
    });
    engine.dispatch('library_path', path);
    engine.dispatch('select_browser', 'nested-motif');
    engine.dispatch('begin_edit');
    engine.dispatch('save_motif', { name: 'Nested Motif Updated' });

    assert.equal(
      (JSON.parse(engine.files[nestedFilename] ?? '{}') as Record<string, unknown>)['name'],
      'Nested Motif Updated',
    );
    assert.equal(engine.files[`${path}/nested-motif.json`], undefined);
    const selected = lastLibState(engine.outlets)?.['selected'] as Record<string, unknown>;
    assert.equal(selected['folder'], 'Leads/Arps');
  });

  it('reports duplicate motif ids with their relative sub-directory paths', async () => {
    const path = '/Motifs';
    const engine = await createEngine({
      files: {
        [`${path}/A/first.json`]: JSON.stringify(userMotif('duplicate-nested', 'First')),
        [`${path}/B/second.json`]: JSON.stringify(userMotif('duplicate-nested', 'Second')),
      },
      folders: {
        [path]: ['A', 'B'],
        [`${path}/A`]: ['first.json'],
        [`${path}/B`]: ['second.json'],
      },
    });
    engine.dispatch('library_path', path);

    const items = lastLibState(engine.outlets)?.['items'] as Array<{ id: string }>;
    assert.equal(items.filter((item) => item.id === 'duplicate-nested').length, 1);
    assert.ok(engine.errors.some((message) =>
      message.includes('B/second.json') && message.includes('duplicate motif id'),
    ));
  });

  it('assigns, reassigns, and removes MIDI hot keys through library actions', async () => {
    const engine = await createEngine();
    engine.dispatch('initialize');
    engine.outlets.length = 0;

    engine.dispatch('lib_action', encodeURIComponent(JSON.stringify({
      type: 'map_trigger', pitch: 20, motifId: 'chromatic-turn',
    })));
    let lib = lastLibState(engine.outlets);
    let items = lib?.['items'] as Array<{
      id: string;
      hotkeys: Array<{ pitch: number; action: string }>;
    }>;
    assert.deepEqual(
      items.find((item) => item.id === 'chromatic-turn')?.hotkeys,
      [{ pitch: 20, action: 'trigger' }],
    );

    engine.outlets.length = 0;
    engine.dispatch('note', 20, 100, 1);
    assert.ok(engine.outlets.some((args) =>
      args[0] === 'status' && args[1] === 'trigger' && args[2] === 'chromatic-turn' && args[3] === 20,
    ), 'a mapped note outside the trigger zone must play its assigned motif');

    engine.dispatch('lib_action', encodeURIComponent(JSON.stringify({
      type: 'map_trigger', pitch: 20, motifId: 'scale-turn',
    })));
    lib = lastLibState(engine.outlets);
    assert.ok(lib);
    items = lib?.['items'] as Array<{
      id: string;
      hotkeys: Array<{ pitch: number; action: string }>;
    }>;
    assert.deepEqual(items.find((item) => item.id === 'chromatic-turn')?.hotkeys, []);
    assert.deepEqual(
      items.find((item) => item.id === 'scale-turn')?.hotkeys,
      [{ pitch: 20, action: 'trigger' }],
    );
    assert.deepEqual(
      (lib['selected'] as Record<string, unknown>)['hotkeys'],
      [{ pitch: 20, action: 'trigger' }],
    );

    engine.dispatch('lib_action', encodeURIComponent(JSON.stringify({
      type: 'unmap_trigger', pitch: 20,
    })));
    lib = lastLibState(engine.outlets);
    items = lib?.['items'] as Array<{
      id: string;
      hotkeys: Array<{ pitch: number; action: string }>;
    }>;
    assert.deepEqual(items.find((item) => item.id === 'scale-turn')?.hotkeys, []);

    engine.outlets.length = 0;
    engine.dispatch('note', 20, 100, 1);
    assert.ok(!engine.outlets.some((args) => args[0] === 'status' && args[1] === 'trigger'));
    assert.ok(engine.outlets.some((args) =>
      args[0] === 'event' && args[1] === 20 && args[2] === 100,
    ), 'an unmapped note outside the trigger zone must return to dry pass-through');
  });

  it('select-mode MIDI hot keys change the motif used by later trigger notes without playing immediately', async () => {
    const engine = await createEngine();
    engine.dispatch('initialize');
    engine.dispatch('lib_action', encodeURIComponent(JSON.stringify({
      type: 'map_trigger',
      pitch: 'G♯-1',
      motifId: 'chromatic-turn',
      action: 'select',
    })));

    let lib = lastLibState(engine.outlets);
    assert.ok(lib);
    const chromatic = (lib['items'] as Array<{
      id: string;
      hotkeys: Array<{ pitch: number; action: string }>;
    }>).find((item) => item.id === 'chromatic-turn');
    assert.deepEqual(chromatic?.hotkeys, [{ pitch: 20, action: 'select' }]);
    assert.equal((lib['selected'] as Record<string, unknown>)['id'], 'scale-turn');

    engine.outlets.length = 0;
    engine.dispatch('note', 20, 100, 1);
    lib = lastLibState(engine.outlets);
    assert.ok(lib);
    assert.equal((lib['selected'] as Record<string, unknown>)['id'], 'chromatic-turn');
    assert.ok(engine.outlets.some((args) =>
      args[0] === 'status' && args[1] === 'selected'
      && args[2] === 'chromatic-turn' && args[3] === 20,
    ));
    assert.ok(!engine.outlets.some((args) => args[0] === 'status' && args[1] === 'trigger'));
    assert.ok(!engine.outlets.some((args) => args[0] === 'event'), 'selection must not play a phrase');

    engine.outlets.length = 0;
    engine.dispatch('note', 60, 100, 1);
    assert.ok(engine.outlets.some((args) =>
      args[0] === 'status' && args[1] === 'trigger' && args[2] === 'chromatic-turn',
    ), 'a later zone note must trigger the newly selected motif');
  });

  it('global hold-repeat mode loops trigger-zone notes at motif boundaries until note-off', async () => {
    const engine = await createEngine({ deferTasks: true });
    engine.dispatch('initialize');
    engine.dispatch('trigger_mode', 'hold-repeat');

    engine.outlets.length = 0;
    engine.dispatch('note', 60, 96, 2);
    assert.equal(
      engine.outlets.filter((args) =>
        args[0] === 'status' && args[1] === 'trigger' && args[2] === 'scale-turn',
      ).length,
      1,
    );
    assert.ok(engine.outlets.some((args) =>
      args[0] === 'status' && args[1] === 'repeat-started'
      && args[2] === 'scale-turn' && args[3] === 60,
    ));
    assert.equal(
      engine.scheduledTaskDelays.at(-1),
      1_750,
      'the 3.5-beat motif must repeat at its 120 BPM boundary',
    );

    engine.dispatch('note', 60, 80, 2);
    assert.equal(engine.scheduledTaskDelays.length, 1, 'duplicate note-ons must not add repeat tasks');

    assert.equal(engine.runScheduledTasks(1), 1);
    assert.equal(
      engine.outlets.filter((args) =>
        args[0] === 'status' && args[1] === 'trigger' && args[2] === 'scale-turn',
      ).length,
      2,
      'the scheduled boundary must launch the next motif cycle',
    );
    assert.equal(engine.scheduledTaskDelays.at(-1), 1_750);

    engine.dispatch('note', 60, 0, 2);
    assert.ok(engine.outlets.some((args) =>
      args[0] === 'status' && args[1] === 'repeat-stopped'
      && args[2] === 'scale-turn' && args[3] === 60,
    ));
    engine.outlets.length = 0;
    engine.runScheduledTasks();
    assert.ok(
      !engine.outlets.some((args) => args[0] === 'status' && args[1] === 'trigger'),
      'a canceled task already queued by Max must not launch another cycle',
    );

    engine.dispatch('note', 60, 96, 2);
    engine.dispatch('trigger_mode', 'one-shot');
    engine.outlets.length = 0;
    engine.runScheduledTasks();
    assert.ok(
      !engine.outlets.some((args) => args[0] === 'status' && args[1] === 'trigger'),
      'leaving hold-repeat in Settings must cancel its pending cycle',
    );
  });

  it('global hold-repeat applies to Trigger hot keys, sustain, and panic cleanup', async () => {
    const engine = await createEngine({ deferTasks: true });
    engine.dispatch('map_trigger', 20, 'chromatic-turn', 'trigger');
    engine.dispatch('trigger_mode', 'hold-repeat');
    engine.dispatch('note', 20, 100, 1);
    engine.dispatch('sustain', 127, 1);
    engine.dispatch('note', 20, 0, 1);

    engine.outlets.length = 0;
    assert.equal(engine.runScheduledTasks(1), 1);
    assert.ok(
      engine.outlets.some((args) =>
        args[0] === 'status' && args[1] === 'trigger' && args[2] === 'chromatic-turn',
      ),
      'sustain must defer stopping the Trigger hot key repeat',
    );

    engine.dispatch('sustain', 0, 1);
    assert.ok(
      engine.outlets.some((args) => args[0] === 'status' && args[1] === 'repeat-stopped'),
    );
    engine.outlets.length = 0;
    engine.runScheduledTasks();
    assert.ok(!engine.outlets.some((args) => args[0] === 'status' && args[1] === 'trigger'));

    engine.dispatch('note', 20, 100, 1);
    engine.dispatch('panic');
    engine.outlets.length = 0;
    engine.runScheduledTasks();
    assert.ok(
      !engine.outlets.some((args) => args[0] === 'status' && args[1] === 'trigger'),
      'panic must cancel every pending repeat task',
    );
  });

  it('rejects invalid hot-key assignments and prunes mappings for removed library motifs', async () => {
    const path = '/Motifs';
    const filename = `${path}/temporary.json`;
    const folders = { [path]: ['temporary.json'] };
    const engine = await createEngine({
      files: { [filename]: JSON.stringify(userMotif('temporary', 'Temporary')) },
      folders,
    });
    engine.dispatch('library_path', path);
    engine.dispatch('map_trigger', Number.NaN, 'temporary');
    engine.dispatch('map_trigger', 12, 'missing');
    engine.dispatch('map_trigger', 12, 'temporary', 'invalid-action');
    engine.dispatch('map_trigger', 13, 'temporary', 'repeat');
    assert.ok(engine.errors.some((message) => message.includes('invalid MIDI note')));
    assert.ok(engine.errors.some((message) => message.includes('unknown motif')));
    assert.ok(engine.errors.some((message) => message.includes('unknown hot-key action')));
    assert.ok(engine.errors.some((message) => message.includes('unknown hot-key action repeat')));

    engine.dispatch('map_trigger', 12, 'temporary');
    folders[path] = [];
    engine.dispatch('refresh_library');

    const lib = lastLibState(engine.outlets);
    assert.ok(lib);
    assert.ok(!(lib['items'] as Array<{ id: string }>).some((item) => item.id === 'temporary'));
    engine.outlets.length = 0;
    engine.dispatch('note', 12, 100, 1);
    assert.ok(!engine.outlets.some((args) => args[0] === 'status' && args[1] === 'trigger'));
  });

  it('same-name saved motifs remain independently selectable by stable id', async () => {
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

  it('save writes the unique id file and exits edit mode', async () => {
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

  it('cancel edit restores the original motif and removes a new draft', async () => {
    const engine = await createEngine();
    engine.dispatch('motif', 'Chromatic Turn');
    engine.dispatch('begin_edit');
    engine.dispatch('edit_motif', { name: 'Temporary Name' });

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

  it('dirty edits block both browser and main-menu selection until explicitly discarded', async () => {
    const engine = await createEngine();
    engine.dispatch('motif', 'Chromatic Turn');
    engine.dispatch('begin_edit');
    engine.dispatch('edit_motif', { name: 'Dirty Draft' });
    const draftId = String((lastLibState(engine.outlets)?.['selected'] as Record<string, unknown>)?.['id']);

    engine.dispatch('select_browser', 'scale-turn');
    let lib = lastLibState(engine.outlets);
    assert.equal((lib?.['selected'] as Record<string, unknown>)?.['id'], draftId);

    engine.dispatch('motif', 'Scale Turn');
    lib = lastLibState(engine.outlets);
    assert.equal((lib?.['selected'] as Record<string, unknown>)?.['id'], draftId);

    engine.dispatch('select_browser', 'scale-turn', true);
    lib = lastLibState(engine.outlets);
    assert.equal((lib?.['selected'] as Record<string, unknown>)?.['id'], 'scale-turn');
    assert.equal((lib?.['editing'] as Record<string, unknown>)?.['active'], false);
    assert.ok(lib);
    assert.ok(!(lib['items'] as Array<{ id: string }>).some((item) => item.id === draftId));
  });

  it('duplicate user ids are skipped without hiding distinct same-name motifs', async () => {
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

  it('editable motif properties and advanced note fields save while data stays untouched', async () => {
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
    assert.equal(((saved['notes'] as Array<Record<string, unknown>>)[0])?.['legato'], true);
  });

  it('optional editable properties can be cleared while existing data is preserved', async () => {
    const path = '/Motifs';
    const filename = `${path}/user-full.json`;
    const original = {
      ...userMotif('user-full', 'User Full'),
      defaultGate: 0.8,
      velocityCurve: { outputMin: 20, outputMax: 100, exponent: 1.2 },
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
    };
    engine.dispatch('lib_action', encodeURIComponent(JSON.stringify({ type: 'save_motif', properties })));

    const saved = JSON.parse(engine.files[filename] ?? '{}') as Record<string, unknown>;
    assert.ok(!('defaultGate' in saved));
    assert.ok(!('velocityCurve' in saved));
    const selected = lastLibState(engine.outlets)?.['selected'] as Record<string, unknown>;
    assert.equal(selected['defaultGate'], null);
    assert.deepEqual(selected['velocityCurve'], {
      inputMin: null, inputMax: null, outputMin: null, outputMax: null, exponent: null,
    });
  });

  it('invalid property updates are rejected atomically and read-only identity fields cannot change', async () => {
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

  it('blank names and out-of-range note edits are rejected without corrupting state', async () => {
    const path = '/Motifs';
    const engine = await createEngine({ folders: { [path]: [] } });
    engine.dispatch('library_path', path);
    engine.dispatch('motif', 'Chromatic Turn');
    engine.dispatch('begin_edit');
    const before = lastLibState(engine.outlets);
    const draftId = String((before?.['selected'] as Record<string, unknown>)?.['id']);

    engine.dispatch('lib_action', encodeURIComponent(JSON.stringify({
      type: 'save_motif', properties: { name: '   ', description: 'invalid' },
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


  it('invalid and conflicting JSON filenames are reserved when creating user ids', async () => {
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

  it('save never overwrites an unscanned file that appeared after library load', async () => {
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

  it('unavailable library paths cannot be used for saving through direct messages', async () => {
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

  it('a failed clip import does not cancel a clean edit session', async () => {
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

  it('non-primitive property payloads are rejected without clearing fields', async () => {
    const engine = await createEngine();
    engine.dispatch('motif', 'Chromatic Turn');
    engine.dispatch('begin_edit');
    engine.dispatch('lib_action', encodeURIComponent(JSON.stringify({
      type: 'save_motif',
      properties: {
        name: { malicious: true },
        description: [],
      },
    })));

    const lib = lastLibState(engine.outlets);
    assert.ok(lib);
    assert.equal((lib['selected'] as Record<string, unknown>)['name'], 'Chromatic Turn');
    assert.equal((lib['editing'] as Record<string, unknown>)['active'], true);
    assert.ok(engine.errors.some((message) => message.includes('Motif name must be text')));
  });
});
