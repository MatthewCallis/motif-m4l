/** Read-only display formatting used by Library UI components. */

/** Format a preview bar count without redundant decimal zeros. */
export function formatPreviewBarCount(bars: number): string {
  return Number.isInteger(bars) ? String(bars) : bars.toFixed(1).replace(/\.0$/, "");
}
