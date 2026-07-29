/**
 * Contract: every selector the Max patch may send must resolve through
 * `MotifEngine.dispatch` (via the top-level `anything()` bridge).
 * When adding a handler in `src/max/device.ts`, add a valid invocation here.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';
import vm from 'node:vm';

/** Representative messages the generated patch (or UI) can send to `v8`. */
const PATCH_MESSAGES: ReadonlyArray<readonly [string, ...unknown[]]> = [
  ['initialize'],
  ['preview_ready'],
  ['library_ready'],
  ['library_prepare'],
  ['web_debug', 'preview', 'ok', encodeURIComponent('bridge ready')],
  ['song_context', 'tempo', 120],
  ['song_context', 'root_note', 0],
  ['song_context', 'scale_mode', 1],
  ['song_context', 'scale_name', 'Major'],
  ['song_context', 'scale_intervals', 0, 2, 4, 5, 7, 9, 11],
  ['song_context', 'signature_numerator', 4],
  ['song_context', 'signature_denominator', 4],
  ['song_context', 'is_playing', 0],
  ['song_context', 'current_song_time', 0],
  ['note', 60, 100, 1],
  ['sustain', 0, 1],
  ['motif', 'Chromatic Turn'],
  ['pitch_mode', 'motif'],
  ['meter_mode', 'preserve'],
  ['retrigger', 'replace'],
  ['trigger_mode', 'one-shot'],
  ['trigger_mode', 'hold-repeat'],
  ['launch_quantization', 'immediate'],
  ['pass_through', 'non-triggers'],
  ['trigger_low', 36],
  ['trigger_high', 84],
  ['map_trigger', 36, 'chromatic-turn'],
  ['map_trigger', 'C3', 'scale-turn'],
  ['map_trigger', 'D3', 'chromatic-turn', 'select'],
  ['unmap_trigger', 36],
  ['unmap_trigger', 'C3'],
  ['clear_trigger_map'],
  ['tempo_multiplier', 1],
  ['tempo_multiplier', 0.5],
  ['tempo_multiplier', 2],
  ['filter_motifs', 'chromatic'],
  ['filter_motifs'],
  ['library_path', '/tmp/Motif Library'],
  ['refresh_library'],
  ['refresh_library', 1],
  ['import_clip'],
  ['import_clip', 'hybrid'],
  ['begin_edit'],
  ['cancel_edit'],
  ['edit_motif', { pitchMode: 'chromatic' }],
  ['select_browser', 'chromatic-turn'],
  ['lib_action', encodeURIComponent(JSON.stringify({ type: 'add_note' }))],
  ['lib_action', encodeURIComponent(JSON.stringify({ type: 'remove_note', index: 0 }))],
  ['lib_action', encodeURIComponent(JSON.stringify({ type: 'edit_note_at', index: 0, field: 'legato', value: true }))],
  ['lib_action', encodeURIComponent(JSON.stringify({ type: 'map_trigger', pitch: 36, motifId: 'chromatic-turn' }))],
  ['lib_action', encodeURIComponent(JSON.stringify({
    type: 'map_trigger', pitch: 'C3', motifId: 'scale-turn', action: 'select',
  }))],
  ['lib_action', encodeURIComponent(JSON.stringify({ type: 'unmap_trigger', pitch: 36 }))],
  ['lib_action', encodeURIComponent(JSON.stringify({ type: 'clear_trigger_map' }))],
  ['save_motif'],
  ['panic'],
  ['list_motifs'],
  ['dump_context'],
];

describe('Max handler contract', () => {
  it('every patch message is accepted through the single Max anything() bridge', async () => {
    const source = await readFile('dist/motif-device.js', 'utf8');
    const errors: string[] = [];
    const context = vm.createContext({
      outlet: () => undefined,
      error: (message: string) => errors.push(String(message)),
      post: () => undefined,
      arrayfromargs: (values: IArguments | ArrayLike<unknown>) => Array.from(values),
      messagename: '',
      File: class {
        isopen = true;
        eof = 1;
        filename = 'uttori-motif-library-test.html';
        foldername = '/tmp';
        constructor(filename: string) {
          this.filename = filename.split('/').pop() ?? filename;
        }
        readstring(): string {
          return '{}';
        }
        writestring(): void {}
        close(): void {}
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
      LiveAPI: class {
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
      },
      console,
    });

    vm.runInContext(source, context, { filename: 'motif-device.js' });

    for (const [message, ...args] of PATCH_MESSAGES) {
      (context as Record<string, unknown>).messagename = message;
      (context as Record<string, unknown>).__args = args;
      vm.runInContext('anything.apply(null, __args)', context);
    }

    assert.deepEqual(
      errors.filter((message) => message.includes('Unknown message') || message.includes('dispatcher is unavailable')),
      [],
    );
  });
});
