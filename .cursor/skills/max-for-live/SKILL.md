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

The observer values may be forwarded to TypeScript for motif calculations, but the visible host-state displays should remain connected to native Max objects. Live key/scale use theme-default `live.menu` (read-only, `ignoreclick`) with a `live.comment` “Scale” label on one bottom row with Pitch; `active` follows Song.scale_mode. Pitch Mode enum starts with `motif`. There is no BPM readout - only a `BPM ×` label + multiplier menu.

**Exception - clip import only:** `import_clip` may use JavaScript `LiveAPI` to read the selected Detail View clip (`detail_clip` / `highlighted_clip_slot clip`) via `get_notes_extended` or `get_notes`. Do not use LiveAPI for Song tempo/key/scale/meter/transport sync.

## MIDI safety

MIDI input must remain fail-open until the engine reports `Ready`. Non-note MIDI should bypass JavaScript. Do not remove the validator assertions around `midiin`, the startup gate, `midiselect`, `midiflush`, and `midiout`.

## UI constraints

- Presentation Mode must be enabled.
- Device width is fixed at 480px by the patch generator.
- Every Presentation object must fit within Live's 169px device height.
- Prefer theme-default / dynamic Live colors on `live.*` controls; use Ableton Sans.
- Motif vs Settings pages use `live.tab` with `livemode` and `thispatcher` hide/show.
- Library/authoring UI opens via a floating `pcontrol` subpatcher (~640×460): searchable browser, Import Clip, note editor, Save. Send only `open`/`close`-style patcher-control messages to `pcontrol`; send `window flags`, `window size`, `window exec`, and title messages through the subpatch inlet to its internal `thispatcher`.
- A jweb inlet selector must be prepended exactly once. The parent emits `receiveData <encoded-json>`; a `send`/`receive` hop must forward that message directly rather than prepending `receiveData` again.
- Browser-to-Max actions require an explicit selector such as `lib_action <encoded-json>`. Never treat the unmatched outlet of `route ... url title` as executable JSON because jweb may emit additional lifecycle messages.
- Embedded Live previews use `jweb @rendermode 0`, load after `live.thisdevice`, and keep `ignoreclick 0` so the diagnostic control remains usable. Prefer DOM/CSS rendering over canvas for the compact Live device preview.
- Do not embed Jitter (`jit.*`) in the device maxpat - it can make the patch unloadable in Max/M4L. Use `umenu` for dynamic lists.
- No Presentation `status-display` for engine debug (`trigger …`); Ready still gates MIDI via `route Ready`.
- Unlocked patcher should keep `§ …` section comments for MIDI / engine / Song / tabs / library / controls.
- Every interactive control requires `annotation_name`, `annotation`, and `hint`.
- Runtime filenames must remain unversioned.

## Adding built-in motifs

Phrase JSON under `motifs/builtin/` - follow [add-motif](../add-motif/SKILL.md). Do not hand-edit `src/generated/builtins.ts`.

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
