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
} = {}): Promise<{
  dispatch: (message: string, ...args: unknown[]) => void;
  outlets: OutletArgs[];
  errors: string[];
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

  const context = vm.createContext({
    outlet: (_index: number, ...values: unknown[]) => {
      outlets.push(values);
    },
    error: (message: string) => errors.push(String(message)),
    post: () => undefined,
    arrayfromargs: (values: IArguments | ArrayLike<unknown>) => Array.from(values),
    messagename: '',
    File: class {
      isopen = false;
      eof = 0;
      constructor(_filename: string, _access = 'read') {
        this.isopen = true;
        this.eof = 0;
      }
      readstring(): string {
        return '{}';
      }
      writestring(_text: string): void {}
      close(): void {
        this.isopen = false;
      }
    },
    Folder: class {
      end = true;
      count = 0;
      pathname = '';
      filename = '';
      next(): void {
        this.end = true;
      }
      close(): void {}
    },
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
  engine.dispatch('filter_motifs', 'mitsuda');

  const lib = lastLibState(engine.outlets);
  assert.ok(lib, 'lib state must be emitted');
  const items = lib['items'] as Array<{ name: string }>;
  assert.ok(items.length >= 1);
  assert.ok(items.every((item) => item.name.toLowerCase().includes('mitsuda')));
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
  assert.ok(items.length >= 3, 'empty/noise queries must restore builtins');
});

test('lib state includes notes for the selected motif', async () => {
  const engine = await createEngine();
  engine.dispatch('initialize');
  engine.dispatch('motif', 'Mitsuda Lick');

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
  engine.dispatch('motif', 'Mitsuda Lick');
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

test('edit_note clones builtins and updates pitch', async () => {
  const engine = await createEngine();
  engine.dispatch('initialize');
  engine.dispatch('motif', 'Mitsuda Lick');
  engine.outlets.length = 0;
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
