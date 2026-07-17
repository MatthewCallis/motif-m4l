# Motif for Max for Live

A scale-aware MIDI phrase trigger written in TypeScript. Ableton Live Song state is observed by native Max for Live objects; TypeScript handles motif selection, pitch mapping, preview generation, and MIDI compilation.

## Current focus

- Native `live.path live_set` and `live.observer` synchronization for tempo, scale, meter, transport, and song position.
- Fail-open native MIDI routing: raw MIDI passes while the engine starts, then `midiselect` extracts notes while preserving unrelated MIDI bytes.
- Compact 820 × 169 Presentation Mode interface styled around Live's device view.
- Native `multislider` phrase contour preview plus exact note names for the current root, scale, pitch mode, meter mode, and trigger anchor.
- Human-readable motif details: description, note count, bars, source meter, pitch interpretation, tags, and suggested modes.
- Clue-window annotations and locked-patcher hints on every interactive control.
- Stable, unversioned runtime filenames so updates can replace files in place.

## Build

```bash
npm install
npm run verify
```

`verify` type-checks the TypeScript, rebuilds generated files, runs 25 tests, executes the compiled Max runtime in a VM, and validates the native MIDI graph, Song observers, dependency list, help metadata, and all 169px Presentation bounds.

## Development files

Keep these files together while editing the device:

```text
Motif.maxpat
motif-device.js
```

Open an existing Max MIDI Effect using **Edit in Max**, replace every old patch object with the contents of `Motif.maxpat`, and save. Freeze the device after confirming the engine says `Ready`, BPM/key update, the preview renders, and MIDI reaches the following instrument.

## Host behavior

- Tempo, Current Scale root/name/mode, Set meter, and transport state update directly from native Song observers.
- Root and tempo are read-only text—not editable menus or parameters.
- Changing root, scale, pitch mode, meter mode, or motif recalculates the preview.
- Playing a trigger note moves the preview anchor to that note, so the displayed note names match the next phrase transposition.
- Host displays continue to work independently of the TypeScript engine.

## MIDI behavior

- Before the JavaScript engine reports `Ready`, all raw MIDI bypasses it and passes directly to `midiout`.
- After `Ready`, `midiselect @ch all @note all` extracts notes for motif processing.
- The eighth `midiselect` outlet passes controllers, bend, pressure, program changes, and other unselected raw MIDI directly to `midiout`.
- The default `non-triggers` policy consumes notes inside the trigger zone and passes notes outside it.
