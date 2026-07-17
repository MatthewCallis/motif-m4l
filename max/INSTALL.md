# Install into the existing Motif Max MIDI Effect

1. Open the existing `.amxd` in Live and choose **Edit in Max**.
2. Unlock the device patcher with **⌘E**.
3. Delete the old objects.
4. Open `Motif.maxpat`, unlock it, select all, copy, and paste into the device patcher.
5. Keep `motif-device.js` beside the `.amxd` while testing.
6. Save the device in Max. The patch forces Presentation Mode on load.
7. In Max, choose **View → Clear Device Width**, resize the presentation to the orange 900 px layout, then choose **View → Set Device Width**.
8. Save again. Freeze the device and save once more when preparing a portable device.

The native `live.path` / `live.observer` graph now supplies tempo, key, scale, meter, and transport state to the TypeScript engine.

Do not rename `Motif.maxpat` to `.amxd`; only Max can write a valid Max for Live device container.
