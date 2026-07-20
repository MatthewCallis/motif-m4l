import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { BUILTIN_MOTIFS } from '../src/generated/builtins.js';
import { midiBytesToMotif, motifToMidiBytes } from '../src/tools/midi.js';

test('exports and reimports a chromatic motif as relative MIDI', () => {
  const source = BUILTIN_MOTIFS.find(({ id }) => id === 'mitsuda-lick');
  assert.ok(source);
  const bytes = motifToMidiBytes(source, 60);
  const imported = midiBytesToMotif(bytes, {
    id: 'roundtrip',
    name: 'Roundtrip',
    pitchMode: 'chromatic',
    rootNote: 60,
  });

  assert.deepEqual(imported.notes.map(({ pitch }) => pitch), [0, -2, 3, 2, 1, 0]);
  assert.deepEqual(imported.notes.map(({ at }) => at), source.notes.map(({ at }) => at));
  assert.ok(imported.length <= source.length);
});


test('MIDI import defaults to exact chromatic offsets', async () => {
  const bytes = new Uint8Array(await readFile('tests/fixtures/mitsuda-secret-part-1.mid'));
  const imported = midiBytesToMotif(bytes, {
    id: 'secret-of-the-forest',
    name: 'Secret of the Forest',
  });

  assert.equal(imported.pitchMode, 'chromatic');
  assert.match(imported.description, /chromatic relative analysis/);
  assert.deepEqual(
    imported.notes.map(({ pitch, accidental }) => ({ pitch, accidental })),
    [
      { pitch: 0, accidental: undefined },
      { pitch: -2, accidental: undefined },
      { pitch: 3, accidental: undefined },
      { pitch: 2, accidental: undefined },
      { pitch: 1, accidental: undefined },
      { pitch: 0, accidental: undefined },
      { pitch: -2, accidental: undefined },
      { pitch: -4, accidental: undefined },
    ],
  );
});
