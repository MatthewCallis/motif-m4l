# UI checklist

- Presentation dimensions are fixed at 480 × 169.
- Motif and Settings pages share that area via `live.tab` (Live mode) and `thispatcher` hide/show scripting.
- Root, scale name, BPM, and status are read-only text; BPM × is a separate device-local `live.menu`.
- The root display must never be a `umenu`; the Song BPM display must never be an editable Live parameter.
- The pitch contour uses native `multislider`; there is no `v8ui` or `motif-preview.js` dependency.
- `preview-pitches` supplies the slider list and `preview-range` supplies its maximum.
- Exact note names appear beside the Live root/scale displays under the contour.
- Motif description/stats/tags and library Choose/Refresh live in the floating `p library-info` window (`pcontrol`, float).
- Interactive controls use Ableton Sans; `live.*` keep theme defaults (do not embed `live_lcd_*` tokens in maxpat - Max reports `bad number`).
- Non-live chrome (`panel` / `comment` / `umenu` / `multislider`) uses fixed Live-like gray/orange RGBA.
- Every interactive control must include `annotation_name`, `annotation`, and `hint`.
- `live.text` buttons use Mouse Up (`outputmode` 1).

Run:

```bash
npm run verify
```

The generated-patch test fails if a Presentation object exceeds Live's 169px height or the 480px width, host telemetry becomes editable, the preview gains a second JavaScript dependency, or help metadata disappears.
