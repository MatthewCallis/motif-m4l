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
  const initialSize = lastEmission(emissions, ['ui', 'preview-size']);
  const initialPreview = lastEmission(emissions, ['ui', 'preview-pitches']);
  assert.deepEqual(initialPreview?.slice(2), [2, 0, 5, 4, 3, 2]);
  assert.equal(initialSize?.[2], initialPreview?.slice(2).length, 'preview-size must match pitch column count');

  send('song_context', 'tempo', 96);
  send('song_context', 'root_note', 5);
  send('song_context', 'scale_name', 'Minor');
  send('song_context', 'scale_intervals', 0, 2, 3, 5, 7, 8, 10);

  const updatedContext = lastEmission(emissions, ['ui', 'preview-root']);
  const previewRoot = String(updatedContext?.slice(2).join(' '));
  assert.ok(previewRoot.includes('F3 anchor'));
  assert.ok(previewRoot.includes('chromatic') || previewRoot.includes('scale'), 'preview context keeps effective pitch mode');
  assert.ok(!previewRoot.includes('Minor'), 'Live scale name belongs in the Scale strip, not preview-root');

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
