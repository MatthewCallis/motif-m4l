# Motif Max for Live Roadmap

Status reflects the TypeScript engine and generated Max patch in this repository. A release is not considered distribution-ready until the generated patch is saved and frozen as a real `.amxd` inside Max for Live and smoke-tested in Live.

## 0.1 — Working trigger prototype ✅

- [x] TypeScript motif compiler.
- [x] Live scale, root, tempo, and meter observation.
- [x] Scale-degree and chromatic mappings.
- [x] Native Max event scheduling.
- [x] Replace/overlap retrigger behavior and panic.
- [x] Generic test motifs and unit tests.

## 0.2 — Editable motif format ✅

- [x] Versioned JSON schema.
- [x] Validation with useful Max Console errors.
- [x] User-library directory and refresh command.
- [x] Phrase metadata: author, source, tags, meter, pickup, suggested modes.
- [x] Articulation: gate, accents, velocity curves, legato, rests, and ties.
- [x] MIDI import and export utilities.
- [x] Relative-analysis modes: chromatic intervals, scale degrees, and hybrid accidentals.
- [x] Generated built-in library compiled from JSON rather than handwritten TypeScript.

## 0.3 — Performance device ✅

- [x] Presentation Mode UI with motif and performance controls.
- [x] Launch quantization: immediate, 1/16, 1/8, 1/4, and bar.
- [x] Hold, toggle, one-shot, latch, and release-tail trigger modes.
- [x] Per-note trigger-map API and configurable keyboard zone.
- [x] Sustain-pedal behavior for held triggers.
- [x] Pass-through policies: none, non-trigger notes, or all notes.
- [x] Non-note MIDI pass-through for CC, pitch bend, pressure, and program changes.
- [x] Trigger notes consumed by default to prevent doubled dry + motif playback.
- [x] Tempo-relative native scheduling while Live is playing.
- [x] Millisecond fallback while transport is stopped.
- [x] Note-instance accounting for overlapping retriggers and cancellation.
- [x] Panic on transport stop to avoid hanging scheduled notes.
- [x] Deferred LiveAPI initialization and no eager `get()` calls during device load/save.
- [x] Canonical Mitsuda Lick built-in motif.
- [x] Automated tests for compilation, pitch mapping, quantization, MIDI conversion, validation, overlap safety, and the Mitsuda contour.

### 0.3 validation still required in Live

- [ ] Open the generated patch in a real Max MIDI Effect and save as `.amxd`.
- [ ] Freeze the device and confirm `motif-device.js` is embedded.
- [ ] Smoke-test all menus and pass-through modes in the current Live release.
- [ ] Confirm transport-relative `pipe` behavior across tempo automation and transport stop/start.

## 0.4 — Harmonic adaptation

- [ ] Chord input from held notes or a side-chain/control track.
- [ ] Chord-tone targeting and avoid-note rules.
- [ ] Nearest-note and minimal-motion voice leading.
- [ ] Fixed anchor notes mixed with scale-relative notes.
- [ ] Approach tones, enclosures, and configurable chromatic alterations.
- [ ] Major/minor/modal variation sets.

## 0.5 — Authoring UI

- [ ] Searchable browser with tags and favorites.
- [ ] Piano-roll phrase preview.
- [ ] Record a played phrase and convert it into a motif.
- [ ] Per-note editing of degree, accidental, timing, gate, and velocity.
- [ ] Variation controls for density, direction, octave, and rhythmic displacement.
- [ ] Preset/state persistence using Live parameters and `pattr` where appropriate.
- [ ] UI for assigning specific motifs to individual trigger notes.

## 1.0 — Productized device

- [ ] Polished, resizable Presentation Mode UI.
- [ ] Frozen `.amxd` with embedded dependencies.
- [ ] macOS and Windows validation in supported Live versions.
- [ ] CPU and scheduling stress tests.
- [ ] Accessibility, undo behavior, automation mappings, and documentation.
- [ ] Curated original/public-domain vocabulary library with clear provenance.
