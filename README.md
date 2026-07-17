# Motif for Max for Live — v0.3.1

A scale-aware Max for Live MIDI Effect that triggers a complete phrase from one incoming note. The musical engine is written in TypeScript and bundled into one JavaScript file for Max's `v8` object. Max's native `pipe` objects schedule the phrase after TypeScript has generated the MIDI events.

## What v0.3 includes

- Reads Live's tempo, root note, current scale, scale mode, time signature, and transport through native `live.observer` objects.
- Built-in scale, chromatic, and hybrid scale-degree-plus-accidental mappings.
- Max 9-native Presentation Mode UI using `live.menu`, `live.tab`, `live.numbox`, and `live.text`.
- Trigger-note consumption by default, preventing the dry note from doubling the motif.
- Configurable trigger zone and `none`, `non-triggers`, or `all` note pass-through.
- Pass-through for CC, poly pressure, channel pressure, pitch bend, and program changes unless MIDI pass-through is set to `none`.
- One-shot, hold, toggle, latch, and release-tail trigger modes.
- Immediate, 1/16, 1/8, 1/4, and bar launch quantization.
- Replace and overlap retrigger modes with note-instance accounting.
- Sustain-pedal support for hold mode.
- Tempo-relative scheduling while Live is playing and millisecond scheduling while stopped.
- Editable JSON motif library, schema, validation, MIDI import/export, and external library loading.
- A canonical two-bar Mitsuda Lick implementation.

## Mitsuda Lick implementation

The built-in `mitsuda-lick` follows the commonly described contour:

1. A long tonic.
2. A step down.
3. A leap upward by a fourth from that lower note.
4. A quick chromatic descent back to the tonic.

Its chromatic offsets are:

```text
0, -2, +3, +2, +1, 0
```

Triggered from C, that becomes:

```text
C, B♭, E♭, D, D♭, C
```

The phrase is represented as a two-bar 4/4 motif. The contour comes directly from the linked explanation; the exact durations and articulation are a practical canonicalization rather than a transcription from one copyrighted recording.

## Build

```bash
npm install
npm run verify
```

The build:

- validates TypeScript;
- runs the automated tests;
- regenerates built-in motifs from JSON;
- regenerates `max/Motif.maxpat`;
- bundles `src/max/device.ts` into `max/motif-device.js`.

## Update an existing `.amxd`

This repository intentionally does not contain a renamed/fake `.amxd`. Max itself must save the real device container.

1. Run `npm run build`.
2. Open your existing Motif Max MIDI Effect and choose **Edit in Max**.
3. Unlock the patcher with **⌘E**.
4. Select all existing objects and delete them.
5. Open `max/Motif.maxpat`, unlock it, then select all and copy.
6. Paste into the device patcher.
7. Copy `max/motif-device.js` beside the `.amxd` while developing.
8. Save the device in Max.
9. Use **Freeze Device**, then save again when preparing a portable device.

The patch sends `presentation 1` to `thispatcher` on load, so copy/pasting the objects into an existing device no longer depends on the destination patcher preserving its Presentation setting. Set the device width once after pasting, as described in `max/INSTALL.md`.

## Default behavior

- **Selected motif:** Mitsuda Lick.
- **Trigger zone:** MIDI notes 36–84.
- **Pass-through:** `non-triggers`.
- Notes inside the trigger zone launch the motif and are consumed.
- Notes outside the zone pass through unchanged.
- Non-note MIDI passes through unchanged.

This removes the previous dry-note-plus-motif doubling. Select `all` only when deliberate layering is desired.

## UI controls

- **Motif:** built-in and externally loaded motifs.
- **Pitch:** motif-defined mode, scale, chromatic, or hybrid.
- **Meter:** preserve phrase timing or fit each source bar to Live's meter.
- **Retrigger:** replace or safely overlap phrases.
- **Trigger:** one-shot, hold, toggle, latch, or release-tail.
- **Quantize:** immediate, 1/16, 1/8, 1/4, or next bar.
- **MIDI pass-through:** none, non-trigger notes, or all notes.
- **Trigger zone:** inclusive low/high MIDI note range.
- **Choose Library / Refresh:** load a directory of motif JSON files.
- **Panic:** clear queues and release held notes.

## Per-note trigger maps

The v0.3 engine supports maps even though the graphical map editor is planned for v0.5. Send these messages to the `v8 motif-device.js` object from Max:

```text
map_trigger 60 mitsuda-lick
map_trigger 61 scale-turn
unmap_trigger 60
clear_trigger_map
```

A mapped note is always treated as a trigger even when it falls outside the trigger zone.

## External motif library

Choose a folder containing `.json` files through the UI. Each file is validated against the runtime rules. The formal schema is at:

```text
schemas/motif.schema.json
```

Example motifs are under:

```text
motifs/builtin/
```

## MIDI conversion

Export a motif to MIDI:

```bash
npm run midi:export -- motifs/builtin/mitsuda-lick.json mitsuda.mid 60
```

Import a MIDI phrase and analyze it as chromatic, scale-relative, or hybrid:

```bash
npm run midi:import -- phrase.mid phrase.json hybrid
```

## Live host synchronization

Max 9 now observes Song properties with native `live.path` and `live.observer` objects. Those values are forwarded to the TypeScript engine through explicit `host_*` messages. This avoids JavaScript observer lifecycle problems and makes tempo, scale, meter, and transport changes visible immediately. The only remaining JavaScript Live API read is the guarded song-position lookup used when a quantized phrase is triggered.

## Current limitations

- The trigger itself enters through Max's low-priority JavaScript thread, so the initial response is not sample-accurate.
- Fixed controls now use `live.*` parameter objects and are stored with the device; the dynamically populated motif menu remains a regular `umenu`.
- Per-note maps currently require Max messages rather than a graphical editor.
- Chord recognition, harmony-aware remapping, voice leading, phrase recording, and piano-roll editing begin in v0.4–v0.5.
- The generated `.maxpat` and JavaScript bundle are validated here, but the final `.amxd` must be created and tested inside Max for Live.

## Project layout

```text
motifs/builtin/  Built-in editable JSON motifs
schemas/         Formal motif JSON schema
scripts/         Build, patch generation, and MIDI conversion tools
src/core/        Host-independent motif compiler and scheduler model
src/library/     Runtime validation and motif store
src/max/         Max v8 adapter and Live API integration
src/tools/       MIDI import/export implementation
max/             Generated Max patch and JavaScript bundle
tests/           Node-based automated tests
```
