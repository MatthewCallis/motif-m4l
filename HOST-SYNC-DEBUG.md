# Host-sync checklist

The host path contains no LiveAPI JavaScript calls:

```text
live.thisdevice
  → property messages
  → live.path live_set
  → live.observer
```

Observed Song properties:

- `tempo`
- `root_note`
- `scale_mode`
- `scale_intervals`
- `scale_name`
- `signature_numerator`
- `signature_denominator`
- `is_playing`
- `current_song_time`

Tempo, root, scale name/mode, meter, and transport connect directly to read-only Presentation comments. JavaScript is not required for these displays.

Each observer value is also normalized as:

```text
song_context <property> <value...>
```

and sent through `deferlow` to the TypeScript engine. The engine uses this copy only for motif compilation and preview calculation.

If BPM or key does not update:

1. Confirm `live.path live_set` outputs a valid `id` message.
2. Confirm each observer receives its `property ...` message before the ID.
3. Inspect the direct observer-to-comment path before inspecting JavaScript.
4. Run `npm run validate:max` to verify all nine native properties and display types.
