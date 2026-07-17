# Install into the existing Motif Max MIDI Effect

1. Open the existing `.amxd` in Live and choose **Edit in Max**.
2. Unlock the device patcher with **⌘E**.
3. Delete every old object so obsolete JavaScript objects and patch cords cannot remain connected.
4. Open `Motif.maxpat`, unlock it, select all, copy, and paste into the device patcher.
5. Keep `motif-device.js` and `motif-preview.js` beside the `.amxd` while testing.
6. Save the device in Max. The patch forces Presentation Mode on load.
7. Resize the device to the complete 860 px presentation, then use **View → Set Device Width**.
8. Remove and re-add the device in Live.
9. Confirm tempo/scale updates, `Ready` status, preview rendering, and MIDI output.
10. Freeze and save the device to embed both JavaScript dependencies.

The native `live.path` / `live.observer` graph supplies tempo, root, scale, meter, transport, and song position. JavaScript is not used to query the Live Object Model.

Do not rename `Motif.maxpat` to `.amxd`; only Max can write a valid Max for Live device container.
