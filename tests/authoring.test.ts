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

test('filter_motifs emits a filtered browser list', async () => {
  const engine = await createEngine();
  engine.dispatch('initialize');
  engine.outlets.length = 0;
  engine.dispatch('filter_motifs', 'mitsuda');

  const browserItems = engine.outlets.filter((args) => args[0] === 'ui' && args[1] === 'browser-item');
  assert.ok(browserItems.length >= 1);
  assert.ok(browserItems.every((args) => String(args[3]).toLowerCase().includes('mitsuda')));
});

test('clearing search restores the full browser list', async () => {
  const engine = await createEngine();
  engine.dispatch('initialize');
  engine.dispatch('filter_motifs', 'zzz-no-match');
  engine.outlets.length = 0;
  engine.dispatch('filter_motifs');
  engine.dispatch('filter_motifs', 'set');

  const browserItems = engine.outlets.filter((args) => args[0] === 'ui' && args[1] === 'browser-item');
  assert.ok(browserItems.length >= 3, 'empty/noise queries must restore builtins');
});

test('note-row-vis and note-row-data are emitted for each note', async () => {
  const engine = await createEngine();
  engine.dispatch('initialize');
  engine.dispatch('motif', 'Mitsuda Lick');

  const rowVis = engine.outlets.filter((args) => args[0] === 'ui' && args[1] === 'note-row-vis');
  const rowData = engine.outlets.filter((args) => args[0] === 'ui' && args[1] === 'note-row-data');
  // emitNoteEditorUi always emits one entry per row (0–15) per call; may be called multiple times
  assert.ok(rowVis.length >= 16, 'note-row-vis emitted for all 16 rows at least once');
  assert.ok(rowVis.length % 16 === 0, 'note-row-vis count is a multiple of 16');
  const visibleRows = rowVis.filter((args) => args[3] === 1);
  assert.ok(visibleRows.length >= 1, 'at least one note row visible');
  assert.ok(rowData.length >= 1, 'note-row-data emitted for at least one visible row');
  // data format: [ui, note-row-data, rowIndex, pitch, acc, at, dur, gate, vel]
  for (const d of rowData) {
    assert.equal(d.length, 9, 'note-row-data has 7 fields (rowIndex + 6 note fields)');
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

  const title = engine.outlets.filter((args) => args[0] === 'ui' && args[1] === 'motif-title').at(-1);
  assert.ok(title);
  assert.equal(title.slice(2).join(' '), 'My Lick');
  const description = engine.outlets.filter((args) => args[0] === 'ui' && args[1] === 'motif-description').at(-1);
  assert.ok(description);
  assert.equal(description.slice(2).join(' '), 'Edited blurb');
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

  // note-row-data for row 0 should reflect the new pitch value
  const rowData = engine.outlets
    .filter((args) => args[0] === 'ui' && args[1] === 'note-row-data' && args[2] === 0)
    .at(-1);
  assert.ok(rowData, 'note-row-data emitted for row 0');
  assert.equal(rowData[3], 7, 'pitch updated in row data');
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

  const title = engine.outlets.find((args) => args[0] === 'ui' && args[1] === 'motif-title');
  assert.ok(title);
  assert.equal(title.slice(2).join(' '), 'Clip Phrase');
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
