# UI checklist

- Presentation dimensions are fixed at 820 × 169.
- Root, scale name, BPM, meter, transport, and status are read-only text.
- The root display must never be a `umenu`; the BPM display must never be an editable Live parameter.
- The pitch contour uses native `multislider`; there is no `v8ui` or `motif-preview.js` dependency.
- `preview-pitches` supplies the slider list and `preview-range` supplies its maximum.
- Exact note names appear directly below the contour.
- Every interactive control must include `annotation_name`, `annotation`, and `hint`.

Run:

```bash
npm run verify
```

The generated-patch test fails if a Presentation object exceeds Live's 169px height, host telemetry becomes editable, the preview gains a second JavaScript dependency, or help metadata disappears.
