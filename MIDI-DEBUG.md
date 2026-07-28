# MIDI routing checklist

The device must remain audible even if `motif-device-<hash>.js` has not initialized:

```text
midiin
  → gate 2 1
      outlet 1 → midiflush → midiout       # startup fail-open path
      outlet 2 → midiselect                 # active engine path
```

After `status Ready`, the gate switches to outlet 2:

```text
midiselect @ch all @note all
  outlet 1 → note processing → v8
  outlet 7 → channel for note processing
  outlet 8 → unselected raw MIDI → midiflush → midiout
```

Checks:

1. Before `Ready`, a played note must reach the following instrument unchanged.
2. After `Ready`, a note outside the trigger zone must pass through under the default `non-triggers` policy.
3. A note inside the trigger zone must emit scheduled `event` messages and play the selected motif.
4. Sustain, bend, pressure, program changes, and unrelated controllers must continue through the raw eighth outlet.
5. `npm run verify` executes a VM smoke test for engine initialization, preview generation, motif events, and non-trigger pass-through, then validates the native Max patch graph.
