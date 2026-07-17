---
name: motif-max-for-live-development
description: Build and validate the Motif Max for Live MIDI Effect without breaking Max v8 message dispatch, Live Song observers, MIDI pass-through, or the 169px device layout.
---

# Motif Max for Live development

## Non-negotiable runtime boundary

Max must discover exactly one hand-written top-level JavaScript handler:

```js
function anything() {
  var message = messagename;
  var args = arrayfromargs(arguments);
  return MotifEngine.dispatch(message, args);
}
```

The bridge must appear before the generated TypeScript bundle in `motif-device.js`.

Do not expose Max handlers through:

- esbuild `footer` declarations
- functions created inside an IIFE
- `globalThis` handler tables
- one generated top-level function per message
- `this.messagename` instead of Max's global `messagename`

The TypeScript engine exports a single `dispatch(message, args)` function. Every symbolic message sent to `v8 motif-device.js` is handled by the bridge's `anything()` function.

## Adding or changing a Max message

When adding a new selector such as `prepend foo`:

1. Add a `foo` handler to `src/max/device.ts`.
2. Add it to the `handlers` table.
3. Add a valid invocation to `tests/max-handler-contract.test.ts`.
4. Run `npm run verify`.

Do not add another global Max function.

## Native Live state

Use `live.path live_set` and `live.observer` for Song properties. Keep tempo, key, scale, meter, transport, and song-position reads out of JavaScript LiveAPI.

Current observed properties:

- `tempo`
- `root_note`
- `scale_mode`
- `scale_name`
- `scale_intervals`
- `signature_numerator`
- `signature_denominator`
- `is_playing`
- `current_song_time`

The observer values may be forwarded to TypeScript for motif calculations, but the visible host-state displays should remain connected to native Max objects.

## MIDI safety

MIDI input must remain fail-open until the engine reports `Ready`. Non-note MIDI should bypass JavaScript. Do not remove the validator assertions around `midiin`, the startup gate, `midiselect`, `midiflush`, and `midiout`.

## UI constraints

- Presentation Mode must be enabled.
- Device width is fixed by the patch generator.
- Every Presentation object must fit within Live's 169px device height.
- Every interactive control requires `annotation_name`, `annotation`, and `hint`.
- Runtime filenames must remain unversioned.

## Required verification

Run before sharing any patch or JavaScript file:

```bash
npm run verify
```

The verification must cover:

- TypeScript compilation
- motif engine tests
- the Max `anything()` bridge contract
- every selector sent by the patch
- Song-context handling
- MIDI scheduling and fail-open routing
- Presentation bounds
- unversioned dependencies

When replacing `motif-device.js` while Max is open, send `compile` to the `v8` object or close and reopen the device so Max recompiles the file.
