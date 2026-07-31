import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  appendMotifNote,
  applyMotifProperties,
  removeMotifNote,
  updateMotifNote,
} from '../src/library/motif-authoring.js';
import { MotifStore } from '../src/library/store.js';
import {
  hasOwn,
  isRecord,
  jsonValuesEqual,
  primitiveText,
} from '../src/core/type-guards.js';
import { MotifHotkeyMap, hotkeyPitch } from '../src/max/hotkey-map.js';
import {
  encodeLibraryStateMessages,
  toLibraryHotkeyData,
  toLibraryNoteData,
} from '../src/max/library-view.js';
import {
  canonicalMaxPath,
  discardAllowed,
  emit,
  emitError,
  emitStatus,
  fileExists,
  flattenValues,
  joinMaxPath,
  mirrorWebDebug,
  numbers,
  pathFromAtoms,
  prepareLibraryPage,
  readJsonFile,
  stringAtom,
  toggleEnabled,
  writeJsonFile,
} from '../src/max/max-helpers.js';
import {
  parseClipNotesExtended,
  readClipNotes,
  resolveDetailClip,
} from '../src/max/live-api.js';
import { MaxUserLibrary } from '../src/max/user-library.js';

interface MaxMocks {
  files: Record<string, string>;
  folders: Record<string, string[]>;
  outlets: unknown[][];
  errors: string[];
  posts: string[];
}

function installMaxMocks(): MaxMocks {
  const mocks: MaxMocks = {
    files: {},
    folders: {},
    outlets: [],
    errors: [],
    posts: [],
  };

  class MockFile {
    isopen: boolean;
    eof: number;
    foldername = '/tmp';
    position = 0;
    #buffer: string;

    constructor(
      readonly filename = '',
      readonly access: 'read' | 'write' | 'readwrite' = 'read',
    ) {
      this.isopen = access !== 'read'
        || Object.prototype.hasOwnProperty.call(mocks.files, filename);
      this.#buffer = access === 'write' ? '' : (mocks.files[filename] ?? '');
      this.eof = this.#buffer.length;
    }

    readstring(): string {
      return this.#buffer;
    }

    writestring(value: string): void {
      this.#buffer += value;
      this.eof = this.#buffer.length;
    }

    close(): void {
      if (this.access !== 'read' && this.isopen) {
        mocks.files[this.filename] = this.#buffer;
        const basename = this.filename.split('/').at(-1) ?? this.filename;
        mocks.files[`/tmp/${basename}`] = this.#buffer;
      }
      this.isopen = false;
    }
  }

  class MockFolder {
    pathname: string;
    filename = '';
    #entries: string[];
    #index = 0;

    constructor(pathname: string) {
      const entries = mocks.folders[pathname];
      this.pathname = entries ? pathname : '';
      this.#entries = entries ?? [];
      this.filename = this.#entries[0] ?? '';
    }

    get count(): number {
      return this.#entries.length;
    }

    get end(): boolean {
      return this.#index >= this.#entries.length;
    }

    get extension(): string | null {
      const index = this.filename.lastIndexOf('.');
      return index < 0 ? null : this.filename.slice(index);
    }

    get filetype(): string | null {
      if (!this.pathname || !this.filename) return null;
      const fullPath = joinMaxPath(this.pathname, this.filename);
      if (Object.prototype.hasOwnProperty.call(mocks.folders, fullPath)) return 'fold';
      return this.filename.toLowerCase().endsWith('.json') ? 'JSON' : null;
    }

    next(): void {
      this.#index += 1;
      this.filename = this.#entries[this.#index] ?? '';
    }

    close(): void {
      this.#index = this.#entries.length;
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

    schedule(): void {
      if (!this.#cancelled) this.callback.apply(this.context, this.args);
    }
  }

  Object.assign(globalThis, {
    File: MockFile,
    Folder: MockFolder,
    Task: MockTask,
    outlet: (_index: number, ...values: unknown[]) => mocks.outlets.push(values),
    error: (value: unknown) => mocks.errors.push(String(value)),
    post: (value: unknown) => mocks.posts.push(String(value)),
  });
  return mocks;
}

describe('extracted type and authoring helpers', () => {
  it('narrows records and converts only primitive text', () => {
    assert.equal(isRecord({ value: 1 }), true);
    assert.equal(isRecord([]), false);
    assert.equal(isRecord(null), false);
    assert.equal(hasOwn({ value: undefined }, 'value'), true);
    assert.equal(hasOwn({}, 'value'), false);
    assert.equal(primitiveText(12), '12');
    assert.equal(primitiveText(false), 'false');
    assert.equal(primitiveText({}, 'fallback'), 'fallback');
    assert.equal(jsonValuesEqual({ one: 1, two: [2] }, { two: [2], one: 1 }), true);
    assert.equal(jsonValuesEqual({ one: 1 }, { one: 2 }), false);
  });

  it('applies motif properties without mutating the source', () => {
    const motif = new MotifStore().get('chromatic-turn');
    assert.ok(motif);
    const result = applyMotifProperties(motif, {
      name: 'Edited',
      description: 'Description',
      pitchMode: 'hybrid',
      sourceMeter: { numerator: 3, denominator: 4 },
      defaultGate: 0.75,
      velocityCurve: { inputMin: 1, exponent: 2 },
    }, {
      triggerPitch: 60,
      host: { rootNote: 0, scaleIntervals: [0, 2, 4, 5, 7, 9, 11] },
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.changed, true);
    assert.equal(result.value.name, 'Edited');
    assert.equal(result.value.pitchMode, 'hybrid');
    assert.equal(motif.name, 'Chromatic Turn');

    const unchanged = applyMotifProperties(motif, {}, {
      triggerPitch: 60,
      host: { rootNote: 0, scaleIntervals: [0, 2, 4, 5, 7, 9, 11] },
    });
    assert.equal(unchanged.ok && unchanged.changed, false);
  });

  it('rejects invalid motif properties atomically', () => {
    const motif = new MotifStore().get('chromatic-turn');
    assert.ok(motif);
    const context = {
      triggerPitch: 60,
      host: { rootNote: 0, scaleIntervals: [0, 2, 4, 5, 7, 9, 11] },
    };
    for (const [value, message] of [
      [null, 'object'],
      [{ id: 'changed' }, 'generated'],
      [{ schemaVersion: 99 }, 'read-only'],
      [{ length: 99 }, 'derived'],
      [{ name: '' }, 'cannot be empty'],
      [{ pitchMode: 'invalid' }, 'pitchMode'],
      [{ sourceMeter: null }, 'sourceMeter'],
      [{ sourceMeter: { numerator: 0, denominator: 4 } }, 'numerator'],
      [{ sourceMeter: { numerator: 4, denominator: 3 } }, 'denominator'],
      [{ defaultGate: 0 }, 'greater than zero'],
      [{ velocityCurve: 'invalid' }, 'velocityCurve'],
      [{ velocityCurve: { exponent: 0 } }, 'greater than zero'],
    ] as const) {
      const result = applyMotifProperties(motif, value, context);
      assert.equal(result.ok, false);
      if (!result.ok) assert.match(result.error, new RegExp(message));
    }
  });

  it('edits, appends, removes, and serializes motif notes', () => {
    const motif = new MotifStore().get('chromatic-turn');
    assert.ok(motif);
    const pitch = updateMotifNote(motif, 0, 'pitch', -3);
    assert.equal(pitch.ok, true);
    if (!pitch.ok) return;
    assert.equal(pitch.notes[0]?.pitch, -3);
    assert.notEqual(pitch.notes, motif.notes);

    const legato = updateMotifNote(motif, 0, 'legato', true);
    assert.equal(legato.ok && legato.notes[0]?.legato, true);
    assert.equal(updateMotifNote(motif, -1, 'pitch', 1).ok, false);
    assert.equal(updateMotifNote(motif, 0, 'velocity', 128).ok, false);

    const appended = appendMotifNote(motif, 512);
    assert.equal(appended.ok, true);
    if (!appended.ok) return;
    assert.equal(appended.notes.length, motif.notes.length + 1);
    assert.equal(appendMotifNote(motif, motif.notes.length).ok, false);
    assert.equal(removeMotifNote(motif, -1).ok, false);
    assert.equal(removeMotifNote(motif, 0).ok, true);

    assert.deepEqual(toLibraryNoteData({
      pitch: 2,
      accidental: -1,
      at: 10,
      duration: 20,
      legato: true,
    }), {
      pitch: 2,
      accidental: -1,
      at: 10,
      duration: 20,
      gate: null,
      velocity: null,
      velocityOffset: null,
      velocityScale: null,
      legato: true,
      tie: false,
    });
    assert.deepEqual(toLibraryHotkeyData({ pitch: 60, action: 'select' }), {
      pitch: 60,
      action: 'select',
      label: 'C3',
    });
  });

  it('keeps large Library state messages below the Max atom boundary', () => {
    const state = {
      items: [],
      selected: {
        notes: Array.from({ length: 37 }, (_, index) => ({
          pitch: index % 6 === 0 ? 0 : -(index % 6),
          accidental: null,
          at: index * 240,
          duration: 240,
          gate: null,
          velocity: 80,
          velocityOffset: null,
          velocityScale: null,
          legato: false,
          tie: false,
        })),
      },
    };
    const messages = encodeLibraryStateMessages(state, 7);
    assert.ok(messages.length > 1);
    assert.ok(messages.every((message) => message.length < 6_000));

    const chunks = messages.map((message) =>
      JSON.parse(decodeURIComponent(message)) as {
        transferId: number;
        index: number;
        total: number;
        data: string;
      });
    assert.ok(chunks.every((chunk) => chunk.transferId === 7));
    const encodedState = chunks
      .sort((left, right) => left.index - right.index)
      .map((chunk) => chunk.data)
      .join('');
    assert.deepEqual(JSON.parse(decodeURIComponent(encodedState)), state);
  });

  it('normalizes every editable note field and rejects invalid numeric values', () => {
    const motif = new MotifStore().get('chromatic-turn');
    assert.ok(motif);
    const accepted: Array<readonly [Parameters<typeof updateMotifNote>[2], unknown]> = [
      ['accidental', 1],
      ['accidental', null],
      ['at', 120],
      ['duration', 120],
      ['gate', 0.5],
      ['gate', null],
      ['velocity', 64],
      ['velocity', null],
      ['velocityOffset', -5],
      ['velocityOffset', 0],
      ['velocityScale', 0.5],
      ['velocityScale', null],
      ['tie', true],
      ['tie', false],
    ];
    for (const [field, value] of accepted) {
      assert.equal(updateMotifNote(motif, 0, field, value).ok, true, field);
    }

    for (const [field, value] of [
      ['pitch', null],
      ['pitch', 'invalid'],
      ['at', -1],
      ['duration', 0],
      ['gate', 0],
      ['velocity', 1.5],
      ['velocityScale', -1],
    ] as const) {
      assert.equal(updateMotifNote(motif, 0, field, value).ok, false, field);
    }
  });
});

describe('extracted Max helpers', () => {
  it('normalizes atoms, paths, toggles, and outlet messages', () => {
    const mocks = installMaxMocks();
    assert.deepEqual(flattenValues([1, [2, 3], 'four']), [1, 2, 3, 'four']);
    assert.deepEqual(numbers([1, ['2', 'bad']]), [1, 2]);
    assert.equal(stringAtom(true), 'true');
    assert.equal(stringAtom({}, 'fallback'), 'fallback');
    assert.equal(pathFromAtoms(['/tmp/My', 'Library']), '/tmp/My Library');
    assert.equal(joinMaxPath('/tmp', 'file.json'), '/tmp/file.json');
    assert.equal(joinMaxPath('Volume:', 'file.json'), 'Volume:file.json');
    assert.equal(canonicalMaxPath('C:\\Foo//Bar'), 'c:/foo/bar');
    assert.equal(toggleEnabled('on'), true);
    assert.equal(toggleEnabled(0), false);
    assert.equal(discardAllowed(true), true);
    assert.equal(discardAllowed(0), false);

    emit('value', 1);
    emitStatus('ready');
    emitError('broken');
    assert.deepEqual(mocks.outlets, [
      ['value', 1],
      ['status', 'ready'],
      ['error', 'broken'],
    ]);
    assert.match(mocks.errors[0] ?? '', /Motif: broken/);
  });

  it('reads, writes, checks, and materializes Max files', () => {
    const mocks = installMaxMocks();
    mocks.files['/tmp/input.json'] = '{"value":1}';
    assert.deepEqual(readJsonFile('/tmp/input.json'), { value: 1 });
    assert.equal(fileExists('/tmp/input.json'), true);
    assert.equal(fileExists('/tmp/missing.json'), false);

    writeJsonFile('/tmp/output.json', { value: 2 });
    assert.match(mocks.files['/tmp/output.json'] ?? '', /"value": 2/);
    assert.equal(
      prepareLibraryPage('library.html', '<!doctype html><p>ready</p>'),
      '/tmp/library.html',
    );
    assert.match(mocks.files['/tmp/library.html'] ?? '', /ready/);
    assert.throws(() => readJsonFile('/tmp/missing.json'), /could not open/);
  });

  it('routes decoded and malformed web diagnostics to the correct console stream', () => {
    const mocks = installMaxMocks();
    mirrorWebDebug('library', 'info', encodeURIComponent('ready now'));
    mirrorWebDebug('preview', 'error', '%invalid');
    assert.match(mocks.posts[0] ?? '', /ready now/);
    assert.match(mocks.errors[0] ?? '', /%invalid/);
  });
});

describe('LiveAPI adapter', () => {
  it('parses strings, Dict-like payloads, filters muted notes, and clamps velocity', () => {
    const payload = {
      notes: [
        { pitch: 64, start_time: 1.5, duration: 0.5, velocity: 200 },
        { pitch: 65, start_time: 2, duration: 1, mute: true },
        { pitch: 'bad', start_time: 0, duration: 1 },
      ],
    };
    assert.deepEqual(parseClipNotesExtended(JSON.stringify(payload)), [
      { pitch: 64, at: 1440, duration: 480, velocity: 127 },
    ]);
    assert.deepEqual(parseClipNotesExtended({ stringify: () => JSON.stringify(payload) }), [
      { pitch: 64, at: 1440, duration: 480, velocity: 127 },
    ]);
    assert.deepEqual(parseClipNotesExtended('{invalid'), []);
    assert.deepEqual(parseClipNotesExtended(null), []);
  });

  it('resolves Detail View and highlighted-slot clips and reads their notes', () => {
    installMaxMocks();
    class DetailLiveApi {
      id: number;
      constructor(_callback?: (args: unknown[]) => void, readonly path = '') {
        this.id = path.includes('detail_clip') ? 1 : 0;
      }
      get(property: string): number {
        return property === 'is_midi_clip' ? 1 : 0;
      }
      getstring(): string {
        return 'Clip';
      }
      call(): unknown {
        return JSON.stringify({
          notes: [{ pitch: 60, start_time: 0, duration: 1, velocity: 100 }],
        });
      }
    }
    Object.assign(globalThis, { LiveAPI: DetailLiveApi });
    const detail = resolveDetailClip();
    assert.ok(detail);
    assert.equal(readClipNotes(detail).length, 1);

    class SlotLiveApi extends DetailLiveApi {
      constructor(callback?: (args: unknown[]) => void, path = '') {
        super(callback, path);
        this.id = path.endsWith('detail_clip') ? 0 : 1;
      }
      override get(property: string): number {
        if (property === 'has_clip' || property === 'is_midi_clip') return 1;
        return 0;
      }
    }
    Object.assign(globalThis, { LiveAPI: SlotLiveApi });
    assert.ok(resolveDetailClip());

    class AudioLiveApi extends DetailLiveApi {
      override get(property: string): number {
        return property === 'is_audio_clip' ? 1 : 0;
      }
    }
    Object.assign(globalThis, { LiveAPI: AudioLiveApi });
    assert.equal(resolveDetailClip(), undefined);

    Object.assign(globalThis, { LiveAPI: undefined });
    assert.equal(resolveDetailClip(), undefined);
  });
});

describe('hotkey and user-library owners', () => {
  it('validates, sorts, removes, clears, and prunes hotkeys', () => {
    const store = new MotifStore();
    const hotkeys = new MotifHotkeyMap(store);
    assert.equal(hotkeyPitch('C3'), 60);
    assert.equal(hotkeyPitch(200), 127);
    assert.equal(hotkeyPitch('invalid'), undefined);
    assert.equal(hotkeys.assign('invalid', 'scale-turn').ok, false);
    assert.equal(hotkeys.assign(60, 'missing').ok, false);
    assert.equal(hotkeys.assign(60, 'scale-turn', 'invalid').ok, false);
    assert.equal(hotkeys.assign(62, 'scale-turn', 'select').ok, true);
    assert.equal(hotkeys.assign(60, 'scale-turn').ok, true);
    assert.equal(hotkeys.has(60), true);
    assert.deepEqual(hotkeys.forMotif('scale-turn').map(({ pitch }) => pitch), [60, 62]);
    assert.equal(hotkeys.remove('C3'), 60);
    assert.equal(hotkeys.remove('invalid'), undefined);

    const user = { ...store.get('chromatic-turn')!, id: 'temporary' };
    assert.deepEqual(store.add(user), []);
    assert.equal(hotkeys.assign(64, 'temporary').ok, true);
    store.remove('temporary');
    assert.deepEqual(hotkeys.prune(), [64]);
    assert.deepEqual(hotkeys.clear(), [62]);
  });

  it('scans, groups, saves, and collision-protects a Max user library', () => {
    const mocks = installMaxMocks();
    const store = new MotifStore();
    const userMotif = { ...store.get('chromatic-turn')!, id: 'user-one', name: 'User One' };
    mocks.folders['/library'] = ['nested', 'user-one.json'];
    mocks.folders['/library/nested'] = ['ignored.txt'];
    mocks.files['/library/user-one.json'] = JSON.stringify(userMotif);
    const errors: string[] = [];
    const statuses: unknown[][] = [];
    let changes = 0;
    const library = new MaxUserLibrary(store, {
      onError: (message) => errors.push(message),
      onStateChange: () => {
        changes += 1;
      },
      onStatus: (...values) => statuses.push(values),
      onContentsChanged: () => {
        changes += 1;
      },
    });

    assert.equal(library.selectPath('/library'), true);
    assert.equal(library.loaded, true);
    assert.equal(store.has('user-one'), true);
    assert.equal(library.browserFolder('scale-turn'), 'Built-ins');
    assert.equal(library.browserFolder('user-one'), 'Library');
    assert.equal(library.uniqueId('User One'), 'user-one-2');
    assert.equal(library.save('user-one'), '/library/user-one.json');
    assert.ok(changes > 0);
    assert.ok(statuses.some(([status]) => status === 'library'));
    assert.equal(errors.length, 0);

    mocks.files['/library/collision.json'] = '{}';
    const collision = { ...userMotif, id: 'collision' };
    assert.deepEqual(store.add(collision), []);
    assert.throws(() => library.save('collision'), /already exists/);
    assert.equal(library.isOccupied('/LIBRARY/collision.json'), true);
    assert.throws(() => library.save('missing'), /Unknown motif/);

    assert.equal(library.selectPath('/missing'), false);
    assert.equal(library.loaded, false);
    assert.ok(errors.some((message) => message.includes('not found')));
  });
});

describe('TypeScript device dispatcher', () => {
  it('executes source handlers directly in addition to compiled-bundle contract tests', async () => {
    const mocks = installMaxMocks();
    class EmptyLiveApi {
      id = 0;
      get(): number {
        return 0;
      }
      getstring(): string {
        return '';
      }
      call(): unknown {
        return { notes: [] };
      }
    }
    Object.assign(globalThis, {
      LiveAPI: EmptyLiveApi,
      __MOTIF_LIBRARY_HTML__: '<!doctype html><p>Motif</p>',
      __MOTIF_LIBRARY_PAGE_NAME__: 'motif-library-test.html',
    });

    const { dispatch } = await import('../src/max/device.js');
    const messages: ReadonlyArray<readonly [string, ...unknown[]]> = [
      ['initialize'],
      ['preview_ready'],
      ['library_ready'],
      ['library_prepare'],
      ['web_debug', 'library', 'info', encodeURIComponent('ready')],
      ['song_context', 'tempo', 128],
      ['song_context', 'root_note', 2],
      ['song_context', 'scale_mode', 1],
      ['song_context', 'scale_name', 'D Major'],
      ['song_context', 'scale_intervals', 0, 2, 4, 5, 7, 9, 11],
      ['song_context', 'signature_numerator', 3],
      ['song_context', 'signature_denominator', 4],
      ['song_context', 'is_playing', 1],
      ['song_context', 'current_song_time', 2],
      ['motif', 'Chromatic Turn'],
      ['pitch_mode', 'hybrid'],
      ['invert', 1],
      ['invert_toggle'],
      ['reverse', 1],
      ['reverse_toggle'],
      ['meter_mode', 'fit-bar'],
      ['retrigger', 'overlap'],
      ['trigger_mode', 'hold'],
      ['launch_quantization', '1/4'],
      ['pass_through', 'all'],
      ['trigger_low', 40],
      ['trigger_high', 80],
      ['map_trigger', 'C3', 'scale-turn'],
      ['note', 60, 100, 1],
      ['note', 60, 0, 1],
      ['sustain', 127, 1],
      ['sustain', 0, 1],
      ['unmap_trigger', 'C3'],
      ['clear_trigger_map'],
      ['tempo_multiplier', 2],
      ['filter_motifs', 'scale'],
      ['begin_edit'],
      ['edit_motif', { name: 'Direct Source Draft' }],
      ['edit_note_at', 0, 'pitch', 2],
      ['lib_action', encodeURIComponent(JSON.stringify({ type: 'add_note' }))],
      ['lib_action', encodeURIComponent(JSON.stringify({
        type: 'edit_note_at',
        index: 0,
        field: 'velocity',
        value: 90,
      }))],
      ['lib_action', encodeURIComponent(JSON.stringify({ type: 'remove_note', index: 999 }))],
      ['lib_action', encodeURIComponent(JSON.stringify({
        type: 'map_trigger',
        pitch: 62,
        motifId: 'scale-turn',
        action: 'select',
      }))],
      ['lib_action', encodeURIComponent(JSON.stringify({ type: 'unmap_trigger', pitch: 62 }))],
      ['lib_action', encodeURIComponent(JSON.stringify({ type: 'clear_trigger_map' }))],
      ['cancel_edit'],
      ['lib_action', encodeURIComponent(JSON.stringify({
        type: 'select_browser',
        id: 'scale-turn',
      }))],
      ['lib_action', encodeURIComponent(JSON.stringify({ type: 'filter_motifs', query: '' }))],
      ['lib_action', encodeURIComponent(JSON.stringify({ type: 'unknown-action' }))],
      ['refresh_library'],
      ['import_clip'],
      ['panic'],
      ['list_motifs'],
      ['dump_context'],
    ];

    for (const [message, ...args] of messages) dispatch(message, args);
    dispatch('unknown-source-message', []);

    assert.ok(mocks.outlets.some(([selector]) => selector === 'event'));
    assert.ok(mocks.outlets.some(([selector]) => selector === 'context'));
    assert.ok(mocks.errors.some((message) => message.includes('Unknown message')));
  });
});
