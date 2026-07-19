/**
 * Contract: every selector the Max patch may send must resolve through
 * `MotifEngine.dispatch` (via the top-level `anything()` bridge).
 * When adding a handler in `src/max/device.ts`, add a valid invocation here.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

/** Representative messages the generated patch (or UI) can send to `v8`. */
const PATCH_MESSAGES: ReadonlyArray<readonly [string, ...unknown[]]> = [
  ['initialize'],
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
  ['motif', 'Mitsuda Lick'],
  ['pitch_mode', 'motif'],
  ['meter_mode', 'preserve'],
  ['retrigger', 'replace'],
  ['trigger_mode', 'one-shot'],
  ['launch_quantization', 'immediate'],
  ['pass_through', 'non-triggers'],
  ['trigger_low', 36],
  ['trigger_high', 84],
  ['tempo_multiplier', 1],
  ['tempo_multiplier', 0.5],
  ['tempo_multiplier', 2],
  ['filter_motifs', 'mitsuda'],
  ['filter_motifs'],
  ['import_clip'],
  ['import_clip', 'hybrid'],
  ['begin_edit'],
  ['edit_meta', 'name', 'Test Name'],
  ['edit_meta', 'description', 'Test', 'description'],
  ['select_browser', 0],
  ['select_note', 0],
  ['edit_note', 'pitch', 1],
  ['edit_note_at', 0, 'pitch', 2],
  ['add_note'],
  ['remove_note', 0],
  ['save_motif'],
  ['panic'],
  ['list_motifs'],
  ['dump_context'],
];

test('every patch message is accepted through the single Max anything() bridge', async () => {
  const source = await readFile('dist/motif-device.js', 'utf8');
  const errors: string[] = [];
  const context = vm.createContext({
    outlet: () => undefined,
    error: (message: string) => errors.push(String(message)),
    post: () => undefined,
    arrayfromargs: (values: IArguments | ArrayLike<unknown>) => Array.from(values),
    messagename: '',
    File: class {
      isopen = false;
      eof = 0;
      constructor() {
        this.isopen = false;
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
      get(): unknown {
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
