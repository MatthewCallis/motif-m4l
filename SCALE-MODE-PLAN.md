# Source-Aware Scale Mode Plan

Status: source implementation complete; packaged AMXD freeze pending  
Last updated: 2026-08-01

## Goal

Make Scale mode reinterpret a motif's original pitches as scale degrees in Live's current target scale. A motif authored in C major should therefore be able to play in C minor, D Dorian, or another selected Live scale while preserving its diatonic contour.

Keep Chromatic mode exact and scale-independent. Keep Hybrid mode scale-relative while preserving chromatic alterations.

## Decisions

1. Keep `schemaVersion: 1`. Add the source pitch context to the existing motif schema without changing the version.
2. Backfill every known motif with source pitch context. The repository currently contains two built-ins: `chromatic-turn` and `scale-turn`.
3. Import all Live clips and MIDI files as Chromatic. Remove the Scale/Hybrid import choice from the Library UI and command boundary.
4. Capture source key and scale information at import time even though the imported note representation is chromatic. This allows a later explicit conversion to Scale or Hybrid.
5. Use Live's observed scale interval list as authoritative. A built-in name-to-interval registry is only a defensive fallback.
6. Do not mutate saved notes when Live's current target scale changes. Target-scale mapping happens during playback and preview.
7. Preserve detected per-note accidentals when converting to Scale, but ignore them during Scale playback. Hybrid applies them and may choose a bounded, source-equivalent adjacent spelling at target playback when it better preserves the imported chromatic contour. The canonical stored spelling remains unchanged, keeping Scale ↔ Hybrid and Scale/Hybrid → Chromatic conversions reversible.
8. Preserve the existing trigger-relative phrase model: the trigger selects the target anchor for the motif. Source key data controls source analysis; it does not silently change a trigger into a target-key tonic.

## Confirmed Live capabilities

Live exposes the required current-scale properties on `Song`:

- `root_note`: observable pitch class from 0 through 11.
- `scale_name`: observable displayed scale name.
- `scale_intervals`: read-only observable list of integer semitone intervals for the current scale.
- `scale_mode`: observable enabled state.

The generated Max patch already observes all four properties and forwards them through `song_context`. The runtime already stores them in `HostContext`.

Primary references:

- [Cycling '74 Song Live Object Model](https://docs.cycling74.com/apiref/lom/song/)
- [Ableton Live 12 scale awareness](https://www.ableton.com/en/live-manual/12/live-concepts/#scale-awareness)

`scale_intervals` means we do not need to maintain a complete table of Live-supported scales for normal operation. Live's intervals remain authoritative even if a name is unfamiliar or a future Live release adds a scale.

The Library imports the clip currently shown in Detail View. Live's Clip API does not expose scale properties directly, so import must snapshot the current observed Song scale context when the user invokes Import. Live's current-scale controls reflect the currently or most recently selected clip, which matches this interaction under normal use.

## Motif source pitch context

Add this required top-level object to the version 1 motif format:

```json
{
  "sourcePitchContext": {
    "anchorPitch": 60,
    "scaleRootNote": 0,
    "scaleName": "Major",
    "scaleIntervals": [0, 2, 4, 5, 7, 9, 11]
  }
}
```

Field semantics:

- `anchorPitch`: absolute MIDI note used as offset zero during import or authoring. Use the lowest note at the earliest onset, matching the current deterministic import ordering.
- `scaleRootNote`: original scale root pitch class, 0 through 11.
- `scaleName`: original Live scale label for display and provenance. It is not authoritative for pitch calculations.
- `scaleIntervals`: normalized original scale intervals. This is authoritative for converting Chromatic notes into scale degrees and for decoding stored degrees back to their original chromatic offsets.

The full anchor MIDI note is required, rather than only its pitch class, so descending intervals and octave-crossing phrases can be analyzed and reconstructed without ambiguity.

### Missing Live interval fallback

The expected path is to receive `scale_intervals` from Live. Handle unexpected missing or invalid data as follows:

1. Try a bundled interval registry keyed by the known Live scale names already used by the Max scale menu.
2. If the name is unknown or represents a custom scale, complete the import as exact Chromatic data, record the root and name, and mark the source intervals unresolved.
3. Disable conversion to Scale/Hybrid until the user assigns valid source intervals. Never silently substitute Major for an unknown scale.

The schema may represent unresolved intervals as `null`; all repository motifs and normal Live imports must contain a non-empty normalized interval list.

## Pitch mode contract

| Mode      | Stored note representation                                   | Playback behavior                                                                                          |
| --------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Chromatic | Exact semitone offset from `sourcePitchContext.anchorPitch`  | Adds the stored semitone offset to the trigger and ignores Live's scale                                    |
| Scale     | Scale-degree offset plus retained source accidental metadata | Maps the degree through Live's current target intervals; ignores the accidental so output remains in scale |
| Hybrid    | Scale-degree offset plus accidental                          | Maps a source-equivalent degree spelling through Live's target intervals, then applies its accidental      |

The `accidental` field is therefore valid metadata on both Scale and Hybrid notes:

- Scale stores it but does not sound it.
- Hybrid stores and sounds it.
- Chromatic normally clears it because the complete semitone offset is already in `pitch`.

MIDI contains pitches but no enharmonic spelling. The analyzer can determine that a pitch is outside the source scale, but cannot know whether the author intended a spelling such as D-sharp or E-flat. Store the existing deterministic nearest-degree spelling and retain the exact signed semitone alteration. During Hybrid playback, also consider the neighboring source degrees when they reconstruct the source pitch with no more than one accidental; choose the target result closest to the original chromatic offset and keep the stored spelling on ties.

## Import behavior

All imports become lossless and mode-neutral:

1. Read and sort the absolute notes.
2. Select and store the explicit anchor MIDI note.
3. Store the supplied source root, scale name, and scale intervals. Live clip import supplies the observed Song context; standalone MIDI callers may supply context and otherwise receive the documented C Major default.
4. Encode every note as an exact chromatic semitone offset from the anchor.
5. Create the motif with `pitchMode: "chromatic"`.
6. Let the user explicitly change the motif to Scale or Hybrid after import.

This is safe because Chromatic retains every original MIDI pitch. The saved source context supplies everything required for later scale analysis:

- The anchor identifies offset zero.
- The source root and intervals identify source scale degrees.
- Each exact chromatic offset reveals whether a note is in the scale and, if not, its alteration.

Remove the following import choices:

- The `#import-mode` selector in the Library page.
- `pitchMode` from the `import_clip` Library action.
- The optional pitch-mode argument on the Max `import_clip` handler.
- The mode argument from the standalone MIDI import CLI, so all external-note import paths follow the same policy.

Retain Scale/Chromatic/Hybrid as editable motif properties and as playback overrides. Only import-time mode selection is removed.

## Mode conversion behavior

Mode conversion must use the motif's saved source pitch context, never Live's current target scale.

### Chromatic to Scale or Hybrid

For every chromatic semitone offset:

1. Resolve it against `sourcePitchContext.anchorPitch`, `scaleRootNote`, and `scaleIntervals`.
2. Select the nearest source scale-degree offset with the existing deterministic tie-breaking rule.
3. Store the scale degree in `pitch`.
4. Store any signed semitone difference in `accidental` for both Scale and Hybrid.
5. Scale ignores the stored accidental during playback; Hybrid applies it.

### Scale and Hybrid

Scale → Hybrid and Hybrid → Scale change only `pitchMode`. They do not re-encode notes or delete accidentals.

### Scale or Hybrid to Chromatic

Decode each scale degree through the saved source context, add its retained accidental, write the exact semitone offset to `pitch`, and remove `accidental`.

If source intervals are unresolved, reject the conversion with an actionable Library message. Never use the current Live target scale as a substitute.

## Target-scale playback

Playback and preview continue to use the current observed Live root and interval list as the target context.

Example:

```text
Imported C-major notes: C  E  G
Chromatic offsets:      0  4  7
Scale degrees:          0  2  4

Target C minor:         C  Eb G
Target D major:         D  F# A   (when triggered from D)
```

Pure Scale mode should guarantee target-scale pitches. Before applying degree offsets, resolve an off-scale trigger to a deterministic target-scale anchor. Use nearest-note quantization with a documented tie rule. Hybrid uses the same scale anchor and may then leave the scale through a retained or bounded source-equivalent accidental.

This changes the current off-scale-trigger fallback, which preserves an off-scale trigger and can consequently produce notes outside the target scale. Update the existing tests that explicitly enforce that behavior.

## Schema and motif updates

Keep the schema constant and literal at version 1 while updating its shape:

- Extend `Motif` and the JSON schema with `sourcePitchContext`.
- Validate anchor range, root range, scale name, normalized intervals, and the explicit unresolved state.
- Update both built-in JSON motifs with known source contexts.
- Regenerate `src/generated/builtins.ts` through the normal build.
- Inventory any maintained external/user-library motifs and backfill them before enabling strict validation.

Suggested built-in provenance:

- `scale-turn`: C Major, anchor C3/MIDI 60.
- `chromatic-turn`: C Major, anchor C3/MIDI 60. Its source context is provenance and future conversion context; Chromatic playback still ignores it.

Because all maintained motifs can be updated, no schema-version migration layer is required. Do not infer missing source context from Live's current scale while loading a motif.

## Library UI changes

1. Remove the import pitch-mode selector; retain a single **Import Clip** button.
2. Display Source Root, Source Scale, Source Intervals, and Source Anchor in motif properties.
3. Make source fields editable during a motif edit so unresolved or manually authored motifs can be corrected.
4. Label source metadata separately from Live's current target scale.
5. Explain that importing is exact/chromatic and changing Pitch Mode performs the scale analysis.
6. Show an actionable warning when source intervals are unresolved and Scale/Hybrid conversion is requested.

## Implementation areas

### Data model and validation

- `src/core/types.ts`
- `schemas/motif.schema.json`
- `src/library/validate.ts`
- `src/library/motif-authoring.ts`

### Pitch analysis, conversion, and playback

- `src/core/import-notes.ts`
- `src/core/pitch.ts`
- `src/core/compile-motif.ts`
- `src/core/preview.ts`

### Live import and Library protocol

- `src/max/authoring-controller.ts`
- `src/max/library-action.ts`
- `src/max/library-protocol.ts`
- `src/max/device-types.ts`
- `src/max/device.ts`
- `src/max/library-state.ts`
- `src/max/library.html`
- `src/max/library.ts`
- `src/max/library.css`

### MIDI tools, built-ins, and documentation

- `scripts/midi-conversion.ts`
- `scripts/midi-to-motif.ts`
- `motifs/builtin/*.json`
- `README.md`
- `MAX-DOCUMENTATION.md`

Generated and packaged files must be regenerated with the existing build; do not edit them as source.

## Implementation sequence

1. Add and validate `sourcePitchContext` without changing `schemaVersion`.
2. Backfill built-ins and maintained motif files, then regenerate built-ins.
3. Change all import paths to exact Chromatic and capture the observed Live source context.
4. Remove import-mode fields from the browser protocol, handler types, UI, and CLI.
5. Change mode conversion to use saved source context and retain Scale accidentals.
6. Add target-anchor quantization so Scale output remains in Live's target scale.
7. Add Library source-context display/editing and unresolved-context diagnostics.
8. Update documentation and run the complete verification pipeline.

## Test plan

### Live context

- `root_note`, `scale_name`, and `scale_intervals` observer updates reach `HostContext`.
- Source context is snapshotted on import and does not change when Live's current scale changes later.
- Invalid or missing intervals use a known-name fallback when available.
- Unknown/custom scales never silently fall back to Major.

### Import

- Library import has no mode selector or pitch-mode payload.
- Live clip and MIDI file imports always create Chromatic motifs.
- Imported pitches reproduce the source MIDI exactly.
- Earliest-onset/lowest-pitch anchor selection is deterministic for chords.
- Descending and multi-octave offsets preserve exact pitches.

### Conversion

- C-major C-E-G Chromatic offsets convert to Scale degrees 0-2-4.
- The same Scale motif plays C-Eb-G under C minor.
- A phrase whose first note is not the tonic uses the saved anchor and source scale correctly.
- Source accidentals are detected and retained in Scale.
- Scale ignores retained accidentals; Hybrid applies them.
- Scale ↔ Hybrid does not rewrite notes.
- Scale/Hybrid → Chromatic reconstructs exact original semitone offsets.
- Conversion results do not depend on Live's current target scale.
- Conversion is rejected when source intervals are unresolved.

### Playback and preview

- Changing Live's root or intervals immediately changes Scale/Hybrid output and preview without mutating motif JSON.
- Chromatic output does not change with Live's scale.
- Pure Scale output is always in the target scale, including with an off-scale trigger.
- Hybrid output uses the target scale plus a retained or bounded source-equivalent alteration, preferring the result closest to the imported chromatic contour.

### Validation and integration

- All maintained motif files pass the updated version 1 validator.
- Built-in generation includes the new source context.
- Library edit/save round-trips every source context field.
- Handler-contract and browser tests confirm removal of the import-mode argument and control.
- MIDI export uses the motif's source context by default rather than hard-coded C Major.
- `npm run verify` passes after rebuilding generated source and patch artifacts.
- After freezing the updated patch in Max, the packaged `.amxd` passes the release validator.

## Acceptance criteria

- Every maintained motif contains a valid source pitch context while remaining `schemaVersion: 1`.
- Every external note import is exact Chromatic and the Library offers no import-time mode choice.
- A user can import C-major MIDI, change the motif to Scale, select C minor in Live, and hear the diatonic C-minor result.
- Changing Live's target scale never rewrites the saved motif.
- Scale output contains only target-scale notes.
- Hybrid retains source chromatic alterations and may respell them at playback without mutating the motif when that better preserves the imported contour.
- Mode conversion uses saved source context and is independent of the currently selected Live scale.
- No unknown scale is silently analyzed as Major.

## Verification status

- `npm run verify`: passed on 2026-08-01, including formatting, lint, three TypeScript checks, 200 tests, build output, and `Motif.maxpat` validation.
- Packaged AMXD: pending. `max/Motif.amxd` has not been overwritten because packaging requires opening and freezing the generated patch in Max. The repository currently references `npm run validate:amxd` from `verify:release`, but does not define that script; this must be restored or replaced before the packaged device can be release-validated.
