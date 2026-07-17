# Motif v0.3.1 UI and host-sync smoke test

## Install

1. Open the working `.amxd` in Live and choose **Edit in Max**.
2. Unlock with **⌘E**, delete the old objects, then paste all objects from `max/Motif.maxpat`.
3. Put `max/motif-device.js` beside the `.amxd`.
4. Save. The patch sends `presentation 1` to `thispatcher` automatically.
5. In Max, use **View → Clear Device Width**, resize to the 900 px presentation, then **View → Set Device Width** and save again.
6. Freeze and save once the dependency is resolving correctly.

## Host synchronization

1. Change Live tempo while stopped: the BPM badge should update immediately.
2. Automate tempo and play: the badge should follow automation.
3. Select a MIDI clip and change the Current Scale chooser: the key badge should update.
4. Toggle Live Scale Mode: the badge should append `Scale Off` when disabled.
5. Change the Set time signature: the meter badge should update.
6. Start/stop transport: the transport badge should switch between Playing and Stopped.

## Debugging

Open **Window → Max Console** and verify that there are no `get: no valid object set` or `live.observer` errors.

In patching view, each of these objects should receive values:

- `live.observer tempo`
- `live.observer root_note`
- `live.observer scale_name`
- `live.observer scale_intervals`
- `live.observer scale_mode`
- `live.observer signature_numerator`
- `live.observer signature_denominator`
- `live.observer is_playing`

Temporarily attach a `print motif-host` object to an observer's left outlet if a single value is not updating.
