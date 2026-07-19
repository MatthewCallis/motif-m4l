import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

type Emission = unknown[];

function lastEmission(emissions: Emission[], prefix: readonly unknown[]): Emission | undefined {
  return [...emissions].reverse().find((entry) =>
    prefix.every((value, index) => entry[index] === value),
  );
}

test('compiled Max runtime initializes, receives Song context, previews, and schedules MIDI', async () => {
  const source = await readFile('dist/motif-device.js', 'utf8');
  const emissions: Emission[] = [];
  const errors: string[] = [];
  const context = vm.createContext({
    outlet: (_index: number, ...values: unknown[]) => emissions.push(values),
    error: (message: string) => errors.push(String(message)),
    post: () => undefined,
    arrayfromargs: (values: IArguments | ArrayLike<unknown>) => Array.from(values),
    messagename: '',
    File: class {},
    Folder: class {},
    console,
  });

  vm.runInContext(source, context, { filename: 'motif-device.js' });
  const send = (message: string, ...args: unknown[]) => {
    (context as Record<string, unknown>).messagename = message;
    (context as Record<string, unknown>).__args = args;
    vm.runInContext('anything.apply(null, __args)', context);
  };

  send('initialize');

  assert.ok(lastEmission(emissions, ['status', 'Ready']));

  // Preview is now a piano roll encoded as JSON in `ui preview encodedJson`.
  const initialPreviewRaw = lastEmission(emissions, ['ui', 'preview']);
  assert.ok(initialPreviewRaw, 'preview state must be emitted on initialize');
  const initialPreview = JSON.parse(decodeURIComponent(String(initialPreviewRaw?.[2] ?? ''))) as {
    notes: Array<{ pitch: number; atTicks: number; durationTicks: number }>;
    totalTicks: number;
    lowPitch: number;
    highPitch: number;
    noteNames: string;
  };
  assert.ok(Array.isArray(initialPreview.notes) && initialPreview.notes.length > 0, 'preview must include notes');
  assert.ok(typeof initialPreview.totalTicks === 'number' && initialPreview.totalTicks > 0);

  send('song_context', 'tempo', 96);
  send('song_context', 'root_note', 5);
  send('song_context', 'scale_name', 'Minor');
  send('song_context', 'scale_intervals', 0, 2, 3, 5, 7, 8, 10);

  // After song context update, a new preview JSON must arrive with updated note names.
  const updatedPreviewRaw = lastEmission(emissions, ['ui', 'preview']);
  const updatedPreview = JSON.parse(decodeURIComponent(String(updatedPreviewRaw?.[2] ?? ''))) as typeof initialPreview;
  assert.ok(typeof updatedPreview.noteNames === 'string' && updatedPreview.noteNames.length > 0);

  const beforeTrigger = emissions.length;
  send('note', 60, 100, 1);
  const triggerEmissions = emissions.slice(beforeTrigger);
  const noteEvents = triggerEmissions.filter((entry) => entry[0] === 'event');
  assert.ok(noteEvents.length >= 12, 'trigger must emit note-on and note-off events');
  assert.ok(noteEvents.some((entry) => entry[1] === 60 && Number(entry[2]) > 0));

  const beforeDryNote = emissions.length;
  send('note', 20, 90, 1);
  assert.ok(
    emissions.slice(beforeDryNote).some((entry) =>
      entry[0] === 'event' && entry[1] === 20 && entry[2] === 90 && entry[4] === 0),
    'a non-trigger note must pass through with the default policy',
  );

  assert.deepEqual(errors, []);
});
