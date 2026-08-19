# Host-Sync Checklist

Song host sync contains no LiveAPI JavaScript calls:

```text
live.thisdevice
  ➜ property messages
  ➜ live.path live_set
  ➜ live.observer
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

While the Scale button is off, root and scale name feed disabled Presentation `live.menu` displays and the engine follows the observed Song context. Enabling Scale activates the dropdowns and switches playback and previews to parameter-restored, device-local root/name values. Song observation continues in the background so disabling Scale immediately returns to the latest Live context.

Each observer value is also normalized as:

```text
song_context <property> <value...>
```

and sent through `deferlow` to the TypeScript engine. The engine uses this copy only for motif compilation and preview calculation.

## Clip Import (LiveAPI Exception)

On-demand **Import Clip** is the only intentional JavaScript LiveAPI path:

```text
Import Clip ➜ import_clip
  ➜ new LiveAPI(undefined, "live_set view detail_clip")
    or new LiveAPI(undefined, "live_set view highlighted_clip_slot clip")
  ➜ get_notes_extended
  ➜ absoluteNotesToMotif (chromatic by default; scale/hybrid are explicit choices)
```

Do not move Song tempo/key/scale/meter/transport onto this path.

If BPM or key does not update:

1. Confirm `live.path live_set` outputs a valid `id` message.
2. Confirm each observer receives its `property ...` message before the ID.
3. Inspect the direct observer-to-comment path before inspecting JavaScript.
4. Run `npm run validate:max` to verify all nine native properties and display types.

If the Scale controls report a Max object error:

1. For `live.menu: Something bad happened, there's no enum, is there?`, confirm both visible proxy menus have Parameter Mode enabled and `parameter_invisible 2`. The hidden backing menus remain the stored override parameters.
2. For `gate: doesn't understand "<scale name>"`, confirm `!- 1` enters gate inlet `0` and the `live.observer` value enters inlet `1`.
3. Regenerate `max/Motif.maxpat`; do not repair only the packaged patch by hand.
4. Run `npm run validate:max` before pasting the patch into Live.

If Import Clip fails:

1. Open a MIDI clip in Detail View (or highlight a clip slot with a MIDI clip).
2. Confirm Max Console for `Motif: No clip selected...` / empty-clip errors.
3. Confirm the generated patch references the latest `motif-device-<hash>.js`.
