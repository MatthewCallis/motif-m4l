# Motif for Max for Live

A scale-aware MIDI phrase trigger written in TypeScript. Ableton Live Song state is observed by native Max for Live objects; TypeScript handles motif selection, pitch mapping, preview generation, and MIDI compilation.

## Current focus

- Native `live.path live_set` and `live.observer` synchronization for tempo, scale, meter, transport, and song position.
- Fail-open native MIDI routing: raw MIDI passes while the engine starts, then `midiselect` extracts notes while preserving unrelated MIDI bytes.
- Compact 480 × 169 Presentation Mode UI with Motif/Settings tabs, Ableton Sans, and Live theme colors.
- Native `jsui` phrase contour preview plus exact note names beside the current root/scale, with a device-local BPM multiplier.
- Floating Library window: searchable browser, Live clip import, per-note editor, Save, plus description/stats/tags and library Choose/Refresh.
- Clue-window annotations and locked-patcher hints on every interactive control.
- Content-addressed runtime filenames so Max cannot silently reuse an older frozen JavaScript dependency.

## Build

```bash
npm install
npm run verify
```

`verify` type-checks the TypeScript, rebuilds generated files, runs the test suite, executes the compiled Max runtime in a VM, and validates the native MIDI graph, Song observers, dependency list, help metadata, and all 475×169 Presentation bounds.

Use `npm run build:clean` to remove and recreate every generated runtime artifact. Handwritten Library and preview sources live under `src/max`; cleaning preserves `max/Motif.amxd` and `max/INSTALL.md`.

## Development files

Keep these files together while editing the device:

```text
Motif.maxpat
motif-device-<content-hash>.js
motif-preview-<content-hash>.js
```

`npm run build` creates those content-addressed files and writes their exact names into `Motif.maxpat`. Open an existing Max MIDI Effect using **Edit in Max**, replace every old patch object with the contents of `Motif.maxpat`, and save. Max sees new JavaScript content as a new dependency instead of reusing a frozen file with the same name. Freeze the device after confirming the engine says `Ready`, BPM/key update, the preview renders, and MIDI reaches the following instrument.

## Host behavior

- Tempo, Current Scale root/name/mode, Set meter, and transport state update directly from native Song observers.
- Root and tempo are read-only text-not editable menus or parameters.
- Changing root, scale, pitch mode, meter mode, or motif recalculates the preview.
- Playing a trigger note moves the preview anchor to that note, so the displayed note names match the next phrase transposition.
- Host displays continue to work independently of the TypeScript engine.

## MIDI behavior

- Before the JavaScript engine reports `Ready`, all raw MIDI bypasses it and passes directly to `midiout`.
- After `Ready`, `midiselect @ch all @note all` extracts notes for motif processing.
- The eighth `midiselect` outlet passes controllers, bend, pressure, program changes, and other unselected raw MIDI directly to `midiout`.
- The default `non-triggers` policy consumes notes inside the trigger zone and passes notes outside it.

## Max JavaScript message boundary

The generated `motif-device-<content-hash>.js` intentionally exposes only one top-level Max function: `anything()`. It uses Max's global `messagename` and `arrayfromargs(arguments)` values, then forwards the message to the TypeScript engine's `dispatch()` function. This avoids relying on bundler-generated global functions for selectors such as `song_context`.

Do not replace JavaScript inside an open device. Rebuild and copy the regenerated patch; its new hashed dependency name forces Max to load the new engine.
