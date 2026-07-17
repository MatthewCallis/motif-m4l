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

- [x] Native Song observers for tempo, Current Scale, meter, transport, and song position.
- [x] Compact 820 × 169 Presentation Mode interface with Live-style dark panels and orange accents.
- [x] Native `multislider` pitch-contour preview plus exact resulting MIDI note names.
- [x] Preview recalculation for Live scale changes, pitch mode, meter fit, motif selection, and trigger transposition.
- [x] Selected-motif description, note count, bar length, source meter, tags, and suggested modes.
- [x] Help annotations and hover hints for every interactive control.
- [x] Stable unversioned runtime filenames.
- [x] Launch quantization, performance trigger modes, keyboard zone, sustain behavior, and pass-through policies.
- [x] External JSON libraries, MIDI import/export, validation, and canonical Mitsuda Lick preset.
- [x] Native Max `pipe` scheduling with replace/overlap behavior and panic handling.
- [x] Automated coverage for host timing, preview pitch mapping, 169px UI bounds, fail-open MIDI routing, native Song displays, compiled-runtime behavior, control help, MIDI conversion, and overlap safety.

### 0.4 validation still required in Live

- [x] Confirm the native contour preview and exact note names render correctly in the target Max 9 build.
- [x] Check text wrapping and control spacing at default and HiDPI display scaling.
- [x] Freeze the device and verify `motif-device.js` is embedded.
- [x] Smoke-test all controls, automation recall, pass-through modes, and tempo automation.

## 0.5 — Authoring UI

- [ ] Searchable browser with tags and favorites.
- [ ] Record a played phrase and convert it into a motif.
- [ ] Per-note editing of degree, accidental, timing, gate, and velocity.
- [ ] UI for assigning specific motifs to individual trigger notes.

## 1.0 — Productized device

- [ ] Polished, resizable Presentation Mode UI.
- [ ] macOS and Windows validation in supported Live versions.
- [ ] CPU and scheduling stress tests.
- [ ] Accessibility, undo behavior, automation mappings, and documentation.
- [ ] Curated original/public-domain vocabulary library with clear provenance.

## 2.0 — Harmonic adaptation

- [ ] Chord input from held notes or a side-chain/control track.
- [ ] Chord-tone targeting and avoid-note rules.
- [ ] Nearest-note and minimal-motion voice leading.
- [ ] Fixed anchor notes mixed with scale-relative notes.
- [ ] Approach tones, enclosures, and configurable chromatic alterations.
- [ ] Major/minor/modal variation sets.
