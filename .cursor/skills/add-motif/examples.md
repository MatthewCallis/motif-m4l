# Motif examples (copy patterns, not pitches blindly)

## Chromatic turn

Fixed semitone offsets from the trigger note.

```text
at:       0, 480, 960, 1440, 1920, 2400, 2880
pitch:    0,   2,   3,    7,    5,    2,    0
length: 3360
```

## Scale: degree turn

`pitch` = scale steps from the trigger’s degree (not MIDI semitones).

```text
pitch: 0, 1, 2, 4, 3, 1, 0
length: 3360
```

## Test sketch

```ts
test("ships <Name> as a built-in motif", () => {
  const motif = BUILTIN_MOTIFS.find(({ id }) => id === "my-lick");
  assert.ok(motif);
  assert.equal(motif.length /* ticks */);
  assert.deepEqual(
    motif.notes.map(({ pitch }) => pitch),
    [/* ... */],
  );
  assert.deepEqual(
    motif.notes.map(({ at }) => at),
    [/* ... */],
  );
});

test("transposes <Name> from the trigger note", () => {
  const motif = BUILTIN_MOTIFS.find(({ id }) => id === "my-lick");
  assert.ok(motif);
  const noteOns = compileMotif(motif, HOST, {
    channel: 1,
    meterMode: "preserve",
    triggerPitch: 60,
    triggerVelocity: 100,
  }).filter(({ velocity }) => velocity > 0);
  assert.deepEqual(
    noteOns.map(({ pitch }) => pitch),
    [/* absolute MIDI */],
  );
});
```

Reuse the host-context fixtures in `tests/compile-motif.test.ts` / `tests/import-notes.test.ts`.
