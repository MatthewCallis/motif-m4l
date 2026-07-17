# Presentation UI checklist

- `openinpresentation` is enabled in `Motif.maxpat`.
- The device forces `presentation 1` through `thispatcher` at load.
- The intended device width is 860 px.
- The `v8ui` preview has identical patching and presentation rectangles; this is required for correct Max 9 redraw and mouse geometry.
- `motif-preview.js` must be beside the device during development and embedded by freezing before distribution.
- Hovering controls in a locked patcher shows a popup hint; the same description is available in Max's Clue window.

If the preview is blank but text details update, open the Max Console and inspect errors from `motif-preview.js`. The engine sends the preview object a message shaped as:

```text
data lowPitch highPitch bars rootPitchClass totalTicks at duration pitch ...
```
