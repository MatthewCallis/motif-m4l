# Production Optimization Plan

This plan starts from the production build measured on July 29, 2026. It prioritizes work that can reduce MIDI-path latency and Max UI traffic before lower-impact code-size tuning.

## Current baseline

| Artifact | Before production minification | Current | Change |
| --- | ---: | ---: | ---: |
| Max engine | 193,418 bytes | 89,078 bytes | -53.9% |
| Native preview | 9,830 bytes | 5,764 bytes | -41.4% |
| Total shipped JavaScript | 203,248 bytes | 94,842 bytes | -53.3% |

The current build emits one stable engine in `dist/` for VM tests and only the two content-addressed, minified runtimes referenced by `Motif.maxpat` in `max/`.

An esbuild contribution report attributes 73.5 KB of the 86.7 KB generated engine body to `src/max/device.ts`. That number includes the injected 46.6 KB Library HTML page, so the embedded authoring surface is the largest known size contributor. The next largest individual modules are validation (2.8 KB), store/import/compile/editor state (1.4–1.6 KB each), and preview (1.0 KB).

## Phase 1: Measure the real-time path

Add a repeatable performance harness before changing scheduling code.

- Measure `note` dispatch-to-outlet time for 8, 64, and 512-note motifs.
- Measure one-shot, replace, overlap, and hold-repeat scenarios at representative trigger rates.
- Record outlet message count and encoded UI payload bytes separately from MIDI event compilation.
- Add large-library scenarios (100, 1,000, and 5,000 motifs) for load, filter, selection, and edit-state updates.
- Capture startup time, first preview time, and first Library-open time in Max/Live, not only Node.
- Establish regression budgets from several Max/Live runs; keep CI thresholds generous enough to avoid timing flakes.

Deliverable: `tests/performance.test.ts` for deterministic operation/message budgets plus a short manual Max/Live profiling checklist.

## Phase 2: Remove Library work from the MIDI hot path

This is the highest-confidence runtime optimization found in the audit.

`triggerMotif()` currently calls `emitSelectedMotifUi()`, which rebuilds and URL-encodes the complete Library state before compiling every trigger. Hold-repeat runs the same path for every cycle. The Library work includes repeated sorting, filtering, folder calculation, hot-key scans, preview calculation, note serialization, and potentially chunked transfer of hundreds of notes.

- On a trigger, update the native preview without rebuilding Library browser/editor state.
- On hold-repeat, update the preview only for the first cycle; subsequent cycles should emit MIDI and minimal status only.
- Gate Library payloads on Library readiness/visibility and on actual Library-relevant state changes.
- Add contract tests asserting that a normal trigger emits no `ui lib` payload and that held-repeat cycles do not retransmit unchanged UI.

Acceptance: MIDI output and preview behavior remain identical while Library payload bytes per trigger fall to zero.

## Phase 3: Cache derived motif and Library data

- Cache `performanceMotif()` by motif identity plus Invert/Reverse state so preview and compilation share one transformed motif.
- Build each Library update from one `store.list()` snapshot.
- Cache browser folder and hot-key summaries for that snapshot instead of recalculating them inside filters and sort comparators.
- Cache motif labels until the store changes.
- Debounce search-only Library updates to one render per UI turn.
- Replace whole-state retransmission with small deltas for note edits if profiling shows serialization remains material.

Acceptance: identical state payloads and ordering, with lower allocation counts and improved 1,000/5,000-motif benchmark results.

## Phase 4: Reduce startup and bundle weight

- Minify the embedded Library HTML, CSS, and inline JavaScript before hashing and injecting it into the engine.
- Hash the exact transformed HTML bytes that `library_prepare()` writes.
- Avoid rewriting and reopening the same content-addressed temporary page after it has already been materialized successfully.
- Add production size budgets with initial ceilings of 95 KB for the engine and 6.5 KB for the preview; adjust only with an explicit size report.
- Re-run the contribution report after each authoring feature. Consider a separately loaded authoring runtime only if HTML minification and hot-path isolation do not meet startup targets.

Acceptance: smaller engine/startup I/O with the Library page still loading through the documented `readfile` bridge and passing the VM/Max validators.

## Phase 5: Optimize compilation only if profiling requires it

- Cache tick-domain event templates for unchanged motif, pitch mode, scale, meter mode, and transforms.
- Apply trigger velocity, channel, launch offset, and tempo-to-millisecond conversion as the final lightweight step.
- Validate whether event sorting is measurable before replacing it; note-off ordering must remain stable for simultaneous events.
- Stress overlapping triggers, sustain, panic, tempo changes, and backward transport jumps in Live after any scheduler optimization.

Acceptance: improved high-note-count trigger latency without changing event order, retrigger safety, or host-timing behavior.

## Release gates

Every optimization must keep these checks green:

```bash
npm run verify
npm run verify:release
```

The `.amxd` must then be frozen and smoke-tested on supported macOS/Windows and Live/Max versions. Record CPU use, trigger latency, stuck-note behavior, Library responsiveness, and artifact sizes with each release candidate.
