import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

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
  ['pitch_mode', 'auto'],
  ['meter_mode', 'preserve'],
  ['retrigger', 'replace'],
  ['trigger_mode', 'one-shot'],
  ['launch_quantization', 'immediate'],
  ['pass_through', 'non-triggers'],
  ['trigger_low', 36],
  ['trigger_high', 84],
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
    File: class {},
    Folder: class {},
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
