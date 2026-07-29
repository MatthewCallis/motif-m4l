# Motif for Max for Live

A scale-aware MIDI phrase trigger written in TypeScript. Ableton Live Song state is observed by native Max for Live objects; TypeScript handles motif selection, pitch mapping, preview generation, and MIDI compilation.

## Current focus

- Native `live.path live_set` and `live.observer` synchronization for tempo, scale, meter, transport, and song position.
- Fail-open native MIDI routing: raw MIDI passes while the engine starts, then `midiselect` extracts notes while preserving unrelated MIDI bytes.
- Compact 475 × 169 Presentation Mode UI with Motif/Settings tabs, Ableton Sans, and Live theme colors.
- Native `jsui` phrase contour preview plus exact note names beside the current root/scale, with a device-local BPM multiplier.
- Floating Library window: recursively grouped/searchable folders, MIDI hot-key assignments, Live clip import, per-note editor, Save, plus description/stats/tags and library Choose/Refresh.
- Clue-window annotations and locked-patcher hints on every interactive control.
- Content-addressed runtime filenames so Max cannot silently reuse an older frozen JavaScript dependency.

## Build

```bash
npm install
npm run verify
```

`verify` type-checks the TypeScript, rebuilds generated files, runs the test suite, executes the compiled Max runtime in a VM, and validates the native MIDI graph, Song observers, dependency list, help metadata, and all 475×169 Presentation bounds.

Every Max object, JavaScript runtime call, jweb bridge method, and Live Object Model call is inventoried against its official Cycling ’74 reference in [`MAX-DOCUMENTATION.md`](MAX-DOCUMENTATION.md). The verification suite fails if the generated patch introduces an undocumented surface.

Production performance work is tracked in [`OPTIMIZATION-PLAN.md`](OPTIMIZATION-PLAN.md), including the current artifact-size baseline, MIDI hot-path findings, and release gates.

Use `npm run clean && npm run build` to remove and recreate every generated runtime artifact. A normal build already removes stale content-addressed runtimes. Handwritten Library and preview sources live under `src/max`; cleaning preserves `max/Motif.amxd` and `max/INSTALL.md`.

Before distribution, freeze and save the device in Max, then run `npm run verify:release`. The release check inspects the packaged `.amxd` as well as the generated patch and refuses stale embedded hashes, retired handlers, or obsolete Live API calls.

## Development files

Keep these files together while editing the device:

```text
Motif.maxpat
motif-device-<content-hash>.js
motif-preview-<content-hash>.js
```

`npm run build` minifies both JavaScript runtimes, creates content-addressed files, and writes their exact names into `Motif.maxpat`. The `max/` output intentionally contains no stable-name JavaScript or standalone HTML copies: only the two files referenced by the generated patch belong beside it. Open an existing Max MIDI Effect using **Edit in Max**, replace every old patch object with the contents of `Motif.maxpat`, and save. Max sees new JavaScript content as a new dependency instead of reusing a frozen file with the same name. Freeze the device after confirming the engine says `Ready`, Live scale updates, the preview renders, and MIDI reaches the following instrument.

## Host behavior

- Tempo, Current Scale root/name/mode, Set meter, and transport state update directly from native Song observers.
- Root and scale name are Song-driven, non-clickable `live.menu` displays; the device has no BPM readout.
- Changing root, scale, pitch mode, meter mode, motif, Invert, or Reverse recalculates the preview.
- The latched Invert button mirrors relative pitch offsets around zero; Reverse mirrors note spans across the phrase length. Both affect playback and preview without modifying saved motif JSON.
- Playing a trigger note moves the preview anchor to that note, so the displayed note names match the next phrase transposition.
- Host displays continue to work independently of the TypeScript engine.

## MIDI behavior

- Before the JavaScript engine reports `Ready`, all raw MIDI bypasses it and passes directly to `midiout`.
- After `Ready`, `midiselect @ch all @note all` extracts notes for motif processing.
- The eighth `midiselect` outlet passes controllers, bend, pressure, program changes, and other unselected raw MIDI directly to `midiout`.
- The default `non-triggers` policy consumes notes inside the trigger zone and passes notes outside it.
- Library MIDI hot keys map individual trigger notes to specific motifs. A mapped note remains a trigger even when it is outside the global trigger zone.
- The Settings tab’s Trigger Mode includes `hold-repeat`, which loops the resolved motif at motif-length boundaries while any trigger-zone note or Trigger hot key remains held.

## User library

- Choose a root library folder from the floating Library window. Every `.json` motif beneath it is discovered recursively in bounded background batches so large folder trees do not lock the Max UI.
- Relative folders are shown as browser groups and are searchable (for example, searching `Bass/Fills` finds motifs in that folder).
- Folder groups can be collapsed to keep large libraries compact; active searches temporarily expand matching groups.
- Editing an existing motif saves it back to its original subfolder. New motifs are saved at the chosen library root.
- Motif ids must remain unique across the entire folder tree; duplicate ids are skipped with an error naming the conflicting relative path.
- MIDI hot keys are entered and displayed as Ableton-style note names such as `C3`, `F♯2`, or `Bb4` rather than raw MIDI numbers. Each mapping either triggers its motif using the device-wide Trigger Mode or selects that motif for subsequent trigger-zone notes.
- Motifs and Live clip imports support up to 512 editable notes. The Notes panel is one scrollable table; large note lists are transported to jweb in bounded internal chunks and assembled before rendering so they remain editable without exceeding Max’s message capacity. Longer clips receive an actionable warning to shorten or split the phrase.

## Max JavaScript message boundary

The generated `motif-device-<content-hash>.js` intentionally exposes only one top-level Max function: `anything()`. It uses Max's global `messagename` and `arrayfromargs(arguments)` values, then forwards the message to the TypeScript engine's `dispatch()` function. This avoids relying on bundler-generated global functions for selectors such as `song_context`.

Do not replace JavaScript inside an open device. Rebuild and copy the regenerated patch; its new hashed dependency name forces Max to load the new engine.
