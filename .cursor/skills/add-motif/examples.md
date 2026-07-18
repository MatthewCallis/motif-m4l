# Motif examples (copy patterns, not pitches blindly)

## Chromatic: Salt Peanuts (1 bar, beats 1 & 3)

`0 0 +3` as 16th–16th–8th, twice. Trigger = repeated pitch.

```text
at:        0,  240,  480, 1920, 2160, 2400
pitch:     0,    0,    3,    0,    0,    3
duration: 240, 240,  480,  240,  240,  480
length: 3840
```

## Chromatic: Mitsuda (2 bars)

Long tonic → −2 → +3 → chromatic walk 2,1 → tonic.

```text
at:        0, 2880, 3840, 4800, 5280, 5760
pitch:     0,   -2,    3,    2,    1,    0
length: 7680
```

## Scale: degree turn

`pitch` = scale steps from the trigger’s degree (not MIDI semitones).

```text
pitch: 0, 1, 2, 4, 3, 1, 0
```

## Test sketch

```ts
test('ships <Name> as a built-in motif', () => {
  const motif = BUILTIN_MOTIFS.find(({ id }) => id === 'my-lick');
  assert.ok(motif);
  assert.equal(motif.length, /* ticks */);
  assert.deepEqual(motif.notes.map(({ pitch }) => pitch), [/* … */]);
  assert.deepEqual(motif.notes.map(({ at }) => at), [/* … */]);
});

test('transposes <Name> from the trigger note', () => {
  const motif = BUILTIN_MOTIFS.find(({ id }) => id === 'my-lick');
  assert.ok(motif);
  const noteOns = compileMotif(motif, HOST, {
    channel: 1,
    meterMode: 'preserve',
    triggerPitch: 60,
    triggerVelocity: 100,
  }).filter(({ velocity }) => velocity > 0);
  assert.deepEqual(noteOns.map(({ pitch }) => pitch), [/* absolute MIDI */]);
});
```

Reuse `HOST` from `tests/mitsuda.test.ts` / `tests/salt-peanuts.test.ts`.
