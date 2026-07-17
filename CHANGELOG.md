# Changelog

## 0.3.1

- Rebuilt the device interface for Max 9 with native Live UI controls and a compact 900 × 164 presentation.
- Added background grouping, host-status badges, clearer labels, and a dedicated error/status area.
- Forced Presentation Mode on device load using `thispatcher`, fixing copy/paste installations that opened in patching view.
- Replaced JavaScript property observers with native `live.path` and `live.observer` objects.
- Added explicit TypeScript `host_*` handlers for tempo, root note, scale, scale intervals, scale mode, meter, and transport.
- Exposed fixed controls as stored Max for Live parameters.

## 0.3.0

- Added a complete Presentation Mode device UI.
- Added the canonical Mitsuda Lick as the default built-in motif.
- Consumed trigger-zone notes by default to remove dry-note doubling.
- Added non-note MIDI pass-through and a full pass-through policy.
- Added transport-relative tick scheduling, quantized launch, and stopped-transport fallback.
- Added one-shot, hold, toggle, latch, and release-tail trigger modes.
- Added keyboard zones, per-note maps, sustain handling, and panic on transport stop.
- Added safe overlapping instance accounting and batch cancellation.
- Removed eager LiveAPI reads that caused `get: no valid object set` during load/save.
- Added JSON schema, runtime validation, external libraries, articulation fields, and MIDI conversion.
- Expanded automated coverage to 17 tests.
