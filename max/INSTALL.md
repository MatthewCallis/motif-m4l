# Install into the existing Motif Max MIDI Effect

1. Open the existing `.amxd` in Live and choose **Edit in Max**.
2. Unlock the device patcher with **⌘E**.
3. Delete every old object. This matters: stale gates, JavaScript objects, and patch cords can silently block MIDI.
4. Open `Motif.maxpat`, unlock it, select all, copy, and paste into the device patcher.
5. Run `npm run clean && npm run build` and keep the generated `motif-device-<hash>.js` and `motif-preview-<hash>.js` files beside `Motif.maxpat` while copying it into the device. The patch already references the exact hashes, so do not manually replace or recompile old JavaScript dependencies. The build also bundles `library.html` inside the hashed engine; when Info opens, the engine writes a content-addressed copy to Max's temporary folder and gives its absolute path to `jweb readfile`.
6. Save the device in Max. The patch forces Presentation Mode on load.
7. Resize the device to the complete 475 px presentation, then use **View → Set Device Width**.
8. Remove and re-add the device in Live.
9. Confirm, in order:
   - BPM and key match Live; BPM × defaults to 1.
   - Status reaches `Ready`.
   - Motif/Settings tabs switch; the pitch contour and note names appear on Motif.
   - Info opens the floating Library/Info window without leaving Live fullscreen.
   - Notes outside the trigger zone pass through.
   - Notes inside the trigger zone play the motif.
10. Open Info repeatedly, including after closing and reopening the floating window, and confirm the Library UI reloads each time.
11. [Freeze and save the device](https://docs.cycling74.com/userguide/m4l/live_freezing/) to embed the two hashed JavaScript dependencies. No separate HTML runtime dependency or project Search Path is required.
12. Run `npm run validate:amxd`. Do not ship until it confirms that the frozen container embeds the same hashes as `Motif.maxpat` and contains no retired Max surfaces.
13. Cycle Live Look/Feel themes and confirm controls remain legible.

The native `live.path` / `live.observer` graph supplies tempo, root, scale, meter, transport, and song position. JavaScript `LiveAPI` is used only when the user invokes **Import Clip**; it is not used for continuous Song synchronization.

Do not rename `Motif.maxpat` to `.amxd`; only Max can write a valid Max for Live device container.
