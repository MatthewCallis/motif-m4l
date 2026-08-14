# UI Checklist

- Presentation dimensions are fixed at 475 × 169.
- Motif and Settings pages share that area via `live.tab` (Live mode) and `thispatcher` hide/show scripting.
- Root and scale name are Song-driven, non-clickable `live.menu` displays; BPM and status readouts are absent. BPM × is a separate device-local `live.menu`.
- The pitch contour uses the content-addressed native `jsui` / MGraphics renderer; there is no `v8ui`, Jitter, or HTML preview dependency in the device view.
- Encoded `receiveData` payloads provide note timing, duration, pitch range, and exact note names to the renderer.
- Exact note names appear in the renderer footer above the Live root/scale row.
- Motif description/stats/tags and library Choose/Refresh live in the floating Library jweb window (`pcontrol`, float).
- Tags support AND/OR browser filtering and chip editing.
- Interactive controls use Ableton Sans; `live.*` keep theme defaults (do not embed `live_lcd_*` tokens in maxpat - Max reports `bad number`).
- Non-live chrome (`comment` / `umenu` / `jsui`) uses fixed Live-like gray/orange RGBA.
- Every interactive control must include `annotation_name`, `annotation`, and `hint`.
- `live.text` buttons use Mouse Up (`outputmode` 1).

Run:

```bash
npm run verify
```

The generated-patch test fails if a Presentation object exceeds Live's 169px height or the 475px width, host telemetry becomes editable, runtime dependencies stop being content-addressed, or help metadata disappears.
