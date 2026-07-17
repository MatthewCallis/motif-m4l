import assert from 'node:assert/strict';
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
