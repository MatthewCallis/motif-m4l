# Changelog

## Unreleased

- MIDI preview sends `preview-size` before `setlist` so multislider columns match motifs with more than 6 notes.
- Added built-in `salt-peanuts` motif (Gillespie shout figure: paired sixteenths + minor-third kick on beats 1 and 3).
- Top row: tabs + motif + `BPM ×` + multiplier + Info/Panic; one bottom row: `Pitch` menu + `Scale` root/name.
- Scale menus use theme-default `live.menu` (`ignoreclick`); `active` follows Song.scale_mode (no ♭♯ chip).
- Pitch Mode `auto` renamed to `motif` (legacy `auto` still accepted).
- Keep `parameter_enable` on Scale `live.menu`s so Max loads `parameter_enum` (avoids “there's no enum”).
- Removed BPM readout and the anchor/debug metadata line from Presentation.
- Theme-default `live.text` pills; unlocked patcher section comments (`§ MIDI`, `§ Engine`, …).

## 0.3.8 — Theme-compliant Motif/Settings UI

- Rebuilt Presentation Mode to 480 × 169 with Motif and Settings tabs (`live.tab` Live mode).
- Enlarged the native `multislider` contour (bar style); moved key/scale next to the preview note names.
- Moved Zone, Meter, Retrigger, MIDI Pass, Launch, and Trigger into the Settings tab.
- Moved motif description/stats/tags and library Choose/Refresh into a floating Library/Info window (`pcontrol`, float, Presentation Mode).
- Added a device-local BPM multiplier (`0.5` / `1` / `1.5` / `2`, default `1`) that scales motif scheduling without changing Song tempo.
- Switched UI chrome to Ableton Sans; `live.*` keep theme defaults; non-live chrome uses fixed Live-like gray/orange RGBA (no invalid `live_lcd_*` tokens).
- Tab hide/show uses short per-object `script sendbox` messages (avoids Max message truncation).
- Spread patching layout so Presentation UI and logic no longer overlap.
- Updated patch validation, handler contract, and timing tests for the new layout and multiplier.

## 0.3.7

- Added oxlint with type-aware TypeScript rules (`npm run lint` / `lint:fix`), wired into `verify`.
- Replaced generated top-level Max handlers with one hand-written `anything()` bridge.
- The TypeScript bundle now exports a single `dispatch(message, args)` entry point.
- Added a complete patch-message contract test, including `song_context`.
- Added bridge validation and a Max for Live development skill to prevent handler regressions.
- Removed stale JavaScript source-map files from the Max runtime folder.

## 0.3.6 — MIDI and host-display stabilization

- Replaced the startup-blocking MIDI path with a fail-open `gate 2 1`: all raw MIDI passes directly to `midiout` until the TypeScript engine reports `Ready`.
- Switched the active MIDI path to the documented `midiselect @ch all @note all` pattern. Notes are processed by Motif while the eighth outlet passes unrelated raw MIDI unchanged.
- Changed Live scale root and tempo from UI controls to read-only text displays updated directly by native Song observers.
- Replaced the `v8ui` preview and second JavaScript dependency with a native `multislider` contour preview.
- Added a top-level `sustain()` Max handler and native sustain observation without removing CC64 from raw pass-through.
- Added a compiled-runtime VM smoke test proving initialization, Song-context updates, preview output, motif scheduling, and non-trigger note pass-through.
- Expanded patch validation to verify fail-open MIDI routing, the `midiselect` outlet graph, native host displays, native preview, and unversioned dependencies.
- Updated the repository Max for Live skill to prevent regressions in MIDI routing, host telemetry, and preview dependencies.

## 0.3.5 — Startup safety and 169px layout

- Reduced the Presentation UI to 820 × 169 pixels, matching Live’s fixed Max for Live device height.
- Added hard layout validation for every Presentation rectangle so generated controls cannot be cropped vertically or horizontally.
- Added a closed `gate 1 0` between all native Song observers and the TypeScript `v8` engine.
- The gate opens only after the engine emits `status Ready`; all nine observers are then banged to send a fresh, complete Song snapshot.
- Renamed the JavaScript entry point from `host` to `song_context` and added a defensive top-level `anything()` dispatcher.
- Added regression tests proving that no Song observer bypasses the startup gate or connects directly to `v8`.
- Added `scripts/validate-max-device.mjs` and `npm run validate:max` for standalone patch validation.
- Added a Max for Live repository skill at `.cursor/skills/max-for-live/SKILL.md` documenting the required lifecycle and UI invariants.
- Adapted the Max 9 `v8ui` renderer for the shorter preview area.

## 0.3.4 — Preview and interface pass

- Rebuilt the Presentation Mode interface as a compact 860 × 238 device using a dark panel and orange-accent visual language.
- Added a Max 9 `v8ui` renderer for phrase timing, duration, bar boundaries, pitch contour, and current-scale root highlighting.
- Added exact note-name output using Ableton's octave naming convention.
- Preview now follows the selected motif, Live root/scale, effective pitch mode, meter mode, and most recently played trigger note.
- Added selected-motif title, description, note count, effective bars, source meter, pitch mode, tags, and suggested modes.
- Motif menus now display human-readable motif names while retaining stable internal IDs.
- Added `annotation_name`, `annotation`, and `hint` help metadata to every interactive control.
- Removed release numbers from generated patch and JavaScript filenames. Runtime dependencies are now always `Motif.maxpat`, `motif-device.js`, and `motif-preview.js`.
- Preserved the native Song observer graph and direct host-display wiring.
- Added preview, UI metadata, help-text, and unversioned-filename regression tests.

## 0.3.3 — Host-sync stabilization

- Rebuilt Live Set synchronization around native `live.path live_set` and `live.observer` objects.
- Added explicit Song property messages before assigning the Live Set ID.
- Connected tempo, key, scale mode, meter, and transport observers directly to the Presentation UI.
- Replaced individual JavaScript host handlers with one normalized `host <property> <value...>` entry point.
- Fixed Max-visible handler functions at true global scope and reduced the engine to one outlet.
- Replaced the stateful runtime queue with direct immutable event emission to Max's native `pipe` scheduler.

## 0.3.2

- Rebuilt Song-property initialization to match the working `BigTempo.amxd` pattern.
- Each plain `live.observer` now receives the `live_set` id first, followed by an explicit `property <name>` message.
- Added native observation of `tempo`, `root_note`, `scale_mode`, `scale_intervals`, `scale_name`, `signature_numerator`, `signature_denominator`, `is_playing`, and `current_song_time`.
- Removed the remaining JavaScript `LiveAPI.get()` path.
- Removed transport-relative `pipe` scheduling and the mixed tick/millisecond runtime clock.
- All pending motif events now use one monotonic millisecond queue derived from the observed Song tempo.
- Quantized launch offsets use the observed `current_song_time`, converted into the engine's internal PPQ only for grid calculations.
- Fixed a transport/unit state transition that could rebuild pending events with invalid delays and cause clustered note playback.

## 0.3.1

- Rebuilt Live Set synchronization around native `live.path live_set` and `live.observer` objects.
- Added explicit Song property messages before assigning the Live Set ID.
- Connected tempo, key, scale mode, meter, and transport observers directly to the Presentation UI.
- Replaced individual JavaScript host handlers with one normalized `host <property> <value...>` entry point.
- Fixed Max-visible handler functions at true global scope and reduced the engine to one outlet.
- Replaced the stateful runtime queue with direct immutable event emission to Max's native `pipe` scheduler.
