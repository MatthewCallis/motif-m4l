---
name: max-for-live-device
description: Build and validate Motif as a Max 9 MIDI Effect for Ableton Live using native MIDI routing, native Live Object Model observers, and a TypeScript-compiled v8 engine.
---

# Max for Live device rules

Use current official Cycling '74 and Ableton documentation as the source of truth. Do not substitute videos, forum guesses, or legacy examples when the current reference covers the API.

## Non-negotiable invariants

1. The Presentation UI must fit inside Live's fixed 169-pixel device height. Every `presentation_rect` must satisfy `y + height <= 169` and remain inside `devicewidth`.
2. Read `Song.tempo`, `Song.root_note`, `Song.scale_mode`, `Song.scale_name`, `Song.scale_intervals`, meter, transport state, and song time with native `live.path live_set` and `live.observer` objects.
3. Native observers must update visible BPM, key, scale, meter, and transport UI directly. JavaScript must not be required for those displays.
4. Host telemetry is read-only UI. Never represent Live's root, tempo, scale name, meter, or transport as editable menus or parameter controls.
5. MIDI must be fail-open while the TypeScript engine initializes: `midiin -> gate 2 1`, with outlet 1 passing raw MIDI directly to `midiflush -> midiout` until `status Ready` switches to outlet 2.
6. Once ready, use `midiselect @ch all @note all`. Selected notes go to the engine; the eighth outlet must pass unselected raw MIDI directly to `midiflush`. Do not parse and reconstruct unrelated MIDI.
7. The core preview must use a native Max UI object such as `multislider`; it must not require a second JavaScript runtime.
8. All Max-callable TypeScript handlers must compile to real top-level functions. Keep the defensive top-level `anything()` dispatcher.
9. Runtime dependency filenames are always unversioned: `Motif.maxpat` and `motif-device.js`.
10. Every interactive Presentation control must have `annotation_name`, `annotation`, and `hint` metadata.
11. Never hand-edit generated `max/Motif.maxpat`. Update `scripts/generate-max-patch.mjs`, rebuild, and test.

## Required workflow

Run after every patch, handler, observer, MIDI, or layout change:

```bash
npm run verify
```

Verification must fail when:

- any Presentation object exceeds 169 pixels;
- raw MIDI cannot pass before JavaScript is ready;
- `midiselect` does not pass unselected raw MIDI from outlet 8;
- BPM or root is represented by an editable control;
- the core preview uses `v8ui` or an extra JavaScript dependency;
- a dependency uses a versioned filename;
- `initialize()`, `note()`, `sustain()`, `song_context()`, or `anything()` is absent from the compiled bundle;
- the compiled runtime cannot initialize, consume Song context, emit preview data, schedule a motif, and pass a non-trigger note in the VM smoke test;
- any visible control lacks help text;
- the patch declares an invalid `v8` outlet connection.

When debugging, isolate the layer before editing musical logic:

1. Confirm raw MIDI reaches `midiout` while the startup gate is in bypass mode.
2. Confirm `status Ready` switches the gate to the engine path.
3. Confirm `midiselect` emits note lists and channel values, while outlet 8 passes unrelated raw MIDI.
4. Confirm native `live.observer` outputs reach the visible UI directly.
5. Only then inspect TypeScript message handling or motif compilation.
