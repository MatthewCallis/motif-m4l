# Motif for Max for Live

A scale-aware MIDI phrase trigger written in TypeScript. Ableton Live Song state is observed by native Max for Live objects; TypeScript handles motif selection, pitch mapping, preview generation, and MIDI compilation.

## Current focus

- Native `live.path live_set` and `live.observer` synchronization for tempo, scale, meter, transport, and song position.
- Compact Presentation Mode interface styled around Live's dark device aesthetic.
- Max 9 `v8ui` phrase preview showing the actual notes produced by the current root, scale, pitch mode, meter mode, and trigger anchor.
- Human-readable motif details: description, note count, bars, source meter, pitch interpretation, tags, and suggested modes.
- Clue-window annotations and locked-patcher hints on every interactive control.
- Stable, unversioned runtime filenames so updates can replace files in place.

## Build

```bash
npm install
npm run verify
```

## Development files

Keep these files together while editing the device:

```text
Motif.maxpat
motif-device.js
motif-preview.js
```

Open an existing Max MIDI Effect using **Edit in Max**, replace the old patch contents with `Motif.maxpat`, and save. Freeze the device after confirming the engine says `Ready` and the graphical preview renders.

## Host behavior

- Tempo, Current Scale root/name/mode, Set meter, and transport state update from native Song observers.
- Changing root, scale, pitch mode, meter mode, or motif recalculates the preview.
- Playing a trigger note moves the preview anchor to that note, so the displayed note names match the next phrase transposition.
- Host displays continue to work independently of the TypeScript engine, making host-sync and engine-loading failures easy to isolate.
