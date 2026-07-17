# Motif Max for Live Roadmap

## 0.1 — Working trigger prototype

- TypeScript motif compiler.
- Live scale, root, tempo, and meter observation.
- Scale-degree and chromatic mappings.
- Native Max event scheduling.
- Replace/overlap retrigger behavior and panic.
- Generic test motifs and unit tests.

## 0.2 — Editable motif format

- Versioned JSON schema.
- Validation with useful Max Console errors.
- User-library directory and refresh command.
- Phrase metadata: author, source, tags, meter, pickup, suggested modes.
- Articulation: gate, accents, velocity curves, legato, rests, ties.
- MIDI import and export utility.
- Relative-analysis modes: chromatic intervals, scale degrees, and hybrid accidentals.

## 0.3 — Better performance behavior

- Launch quantization: immediate, 1/16, 1/8, 1/4, bar.
- Hold, toggle, one-shot, latch, and release-tail trigger modes.
- Per-note trigger maps and keyboard zones.
- Sustain-pedal behavior.
- Pass-through policy for non-trigger notes and other MIDI messages.
- Tempo-relative native scheduling that follows tempo automation.
- Note-instance accounting for safe overlapping retriggers.

## 0.4 — Harmonic adaptation

- Chord input from held notes or a side-chain/control track.
- Chord-tone targeting and avoid-note rules.
- Nearest-note and minimal-motion voice leading.
- Fixed anchor notes mixed with scale-relative notes.
- Approach tones, enclosures, and configurable chromatic alterations.
- Major/minor/modal variation sets.

## 0.5 — Authoring UI

- Searchable browser with tags and favorites.
- Piano-roll phrase preview.
- Record a played phrase and convert it into a motif.
- Per-note editing of degree, accidental, timing, gate, and velocity.
- Variation controls for density, direction, octave, and rhythmic displacement.
- Preset/state persistence using Live parameters and `pattr` where appropriate.

## 1.0 — Productized device

- Polished Presentation Mode UI.
- Frozen `.amxd` with embedded dependencies.
- macOS and Windows validation in supported Live versions.
- CPU and scheduling stress tests.
- Accessibility, undo behavior, automation mappings, and documentation.
- Curated original/public-domain vocabulary library with clear provenance.
