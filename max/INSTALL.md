# Install into the existing Motif Max MIDI Effect

1. Open the existing `.amxd` in Live and choose **Edit in Max**.
2. Unlock the device patcher with **⌘E**.
3. Delete every old object. This matters: stale gates, JavaScript objects, and patch cords can silently block MIDI.
4. Open `Motif.maxpat`, unlock it, select all, copy, and paste into the device patcher.
5. Keep `motif-device.js` beside the `.amxd` while testing.
6. Save the device in Max. The patch forces Presentation Mode on load.
7. Resize the device to the complete 480 px presentation, then use **View → Set Device Width**.
8. Remove and re-add the device in Live.
9. Confirm, in order:
   - BPM and key match Live; BPM × defaults to 1.
   - Status reaches `Ready`.
   - Motif/Settings tabs switch; the pitch contour and note names appear on Motif.
   - Info opens the floating Library/Info window without leaving Live fullscreen.
   - Notes outside the trigger zone pass through.
   - Notes inside the trigger zone play the motif.
10. Freeze and save the device to embed `motif-device.js`.
11. Cycle Live Look/Feel themes and confirm controls remain legible.

The native `live.path` / `live.observer` graph supplies tempo, root, scale, meter, transport, and song position. JavaScript is not used to query the Live Object Model.

Do not rename `Motif.maxpat` to `.amxd`; only Max can write a valid Max for Live device container.
