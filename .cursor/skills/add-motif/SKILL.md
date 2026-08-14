---
name: add-motif
description: >-
  Author and ship Motif v1 built-in or library phrases for uttori-motif-m4l.
  Use when adding a motif, lick, phrase, builtin JSON under motifs/builtin,
  importing MIDI to motif JSON, or when the user mentions pitchMode, PPQ ticks,
  contour extraction, or BUILTIN_MOTIFS.
---

# Add a Motif

## Source of truth

| Kind         | Path                       | How it ships                                                                             |
| ------------ | -------------------------- | ---------------------------------------------------------------------------------------- |
| Built-in     | `motifs/builtin/<id>.json` | `npm run generate` ➜ `src/generated/builtins.ts` ➜ bundled into `motif-device-<hash>.js` |
| User library | any `.json` Motif file     | Live Library/Info Choose path at runtime (not generated)                                 |

**Never edit `src/generated/builtins.ts` by hand.** Always add/edit JSON under `motifs/builtin/`, then regenerate.

Schema: `schemas/motif.schema.json`. Runtime types: `src/core/types.ts`. Validator: `src/library/validate.ts`.

## Workflow (built-in)

1. Choose `id` (kebab-case, unique) and `pitchMode` (`chromatic` | `scale` | `hybrid`).
2. Write `motifs/builtin/<id>.json` (template below).
3. Optionally add `tests/<id>.test.ts` asserting contour pitches/`at` and a `compileMotif` transpose check (see the current compile/import tests).
4. Changelog: one Unreleased bullet naming the motif id.
5. From repo root with Node 22+: `npm run generate && npm test` (or `npm run verify` if touching the device).
6. Reload the Max device so the menu picks up the new built-in.

### MIDI import (optional)

```bash
npm run midi:import -- input.mid motifs/builtin/<id>.json chromatic
# or: scale | hybrid
```

Then hand-edit name/description/timing; re-check `length` covers every note.

In Live, open a MIDI clip in Detail View and use **Import Clip** in the floating Library window. Exact/chromatic analysis is the default; scale and hybrid analysis are explicit choices. Save writes JSON into the chosen library folder.

## Timing (PPQ = 960)

`at` / `duration` / `length` are **source ticks**. Rests = gaps between notes.

| Grid         | Ticks |
| ------------ | ----: |
| 1/16         |   240 |
| 1/8          |   480 |
| 1/4          |   960 |
| 1/2          |  1920 |
| 1 bar (4/4)  |  3840 |
| 2 bars (4/4) |  7680 |

`length` must be **≥ max(at + duration)** for every note or validation fails.

`defaultGate` / per-note `gate` scale sounding length (0-1-ish multipliers; keep `> 0`).

## Pitch encoding

Trigger note = anchor. `pitch` is **relative**:

| `pitchMode` | `pitch` means                                   | Typical use                             |
| ----------- | ----------------------------------------------- | --------------------------------------- |
| `chromatic` | semitone offset from trigger                    | Fixed-interval phrases                  |
| `scale`     | scale-degree steps from trigger’s degree        | Diatonic turns that follow Live’s scale |
| `hybrid`    | scale degrees + optional `accidental` semitones | Imported MIDI with blue notes           |

Device UI Pitch Mode `motif` = use the phrase’s stored `pitchMode` (not an override).

## Minimal JSON template

```json
{
  "schemaVersion": 1,
  "id": "my-lick",
  "name": "My Lick",
  "description": "One sentence: contour + feel.",
  "pitchMode": "chromatic",
  "sourceMeter": { "numerator": 4, "denominator": 4 },
  "length": 3840,
  "defaultGate": 0.85,
  "notes": [
    { "at": 0, "duration": 480, "pitch": 0 },
    { "at": 480, "duration": 480, "pitch": 3, "velocityOffset": 8, "gate": 0.9 }
  ]
}
```

### Note fields (common)

- Required: `at`, `duration`, `pitch`
- Optional: `accidental`, `velocity` (absolute 1-127), `velocityOffset`, `velocityScale`, `gate`, `legato`, `tie`
- Prefer relative `velocityOffset` + motif `velocityCurve` over hard-coded `velocity` so trigger dynamics still matter

## Authoring heuristics

- **Famous lick** ➜ usually `chromatic`, trigger = first/anchor pitch, short description of rhythm + intervals.
- **Scale toy / demo** ➜ `scale`, pitches as degree steps (`0,1,2,4...`).
- Keep phrases playable as one-shots: 1-2 bars is the sweet spot unless the user asks for longer.
- Preview in Live: pick the motif, hit a trigger in-zone; contour updates from native Song observers.

## Do not

- Hand-edit `src/generated/builtins.ts` or paste motifs into `device.ts`
- Use TypeScript-only syntax in docs that feed jsdoc2md elsewhere (N/A for JSON motifs)
- Forget regenerate/tests after adding a built-in
- Set `length` shorter than the last note’s end

## Reference examples

- Chromatic intervals: `motifs/builtin/chromatic-turn.json`
- Scale degrees: `motifs/builtin/scale-turn.json`
- More field detail: [examples.md](examples.md)

## Related

Device/runtime wiring is a separate concern - see [.cursor/skills/max-for-live/SKILL.md](../max-for-live/SKILL.md).
