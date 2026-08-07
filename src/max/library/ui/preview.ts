/**
 * Canvas2D piano-roll renderer for the floating Library jweb.
 *
 * Shares paint payload shape with the device jsui via {@link MotifPreviewPaintData}.
 * Drawing stays here; Max MGraphics remains in `motif-preview.js`.
 */

import type { MotifPreviewPaintData } from "../../../core/preview.js";

/** Footer reserved for the note-name strip. */
const FOOTER_HEIGHT = 18;

/** Palette aligned with Library CSS tokens (`library.css` :root). */
const COLORS = {
  background: "#141415",
  row: "#141415",
  blackRow: "#1a1a1c",
  grid: "#2e2e32",
  octave: "#404046",
  note: "#ff8c1f",
  noteTop: "#ffb066",
  text: "#e0e0e6",
  muted: "#7a7a82",
  border: "#2e2e32",
} as const;

/**
 * Scale note fill brightness by MIDI velocity (matches native preview).
 * @param {string} hex Base CSS hex color.
 * @param {number} velocity MIDI velocity 1–127.
 * @returns {string} `rgb(...)` fill.
 */
function velocityColor(hex: string, velocity: number): string {
  const normalized = Math.max(0, Math.min(1, (velocity - 1) / 126));
  const intensity = 0.25 + normalized * 0.75;
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r * intensity)}, ${Math.round(g * intensity)}, ${Math.round(b * intensity)})`;
}

/**
 * Truncate a label so it fits the available pixel width.
 * @param {CanvasRenderingContext2D} ctx Active 2D context.
 * @param {string} text Source label.
 * @param {number} maxWidth Maximum text width in CSS pixels.
 * @returns {string} Possibly truncated label.
 */
function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) {
    return text;
  }
  let value = text;
  const suffix = "...";
  while (value.length > 0 && ctx.measureText(value + suffix).width > maxWidth) {
    value = value.slice(0, -1);
  }
  return value + suffix;
}

/**
 * Paint a piano-roll into an existing 2D context at the given CSS size.
 * @param {CanvasRenderingContext2D} ctx Drawing context.
 * @param {MotifPreviewPaintData | null} data Resolved preview geometry, or null when empty.
 * @param {number} width CSS pixel width.
 * @param {number} height CSS pixel height.
 */
export function paintLibraryPreview(
  ctx: CanvasRenderingContext2D,
  data: MotifPreviewPaintData | null,
  width: number,
  height: number,
): void {
  const w = Math.max(1, Math.floor(width));
  const h = Math.max(1, Math.floor(height));
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, w, h);

  const rollHeight = Math.max(1, h - FOOTER_HEIGHT);
  const hasNotes = Boolean(data && data.notes.length > 0);

  if (!hasNotes || !data) {
    ctx.fillStyle = COLORS.muted;
    ctx.font = '10px "Ableton Sans", system-ui, sans-serif';
    ctx.textBaseline = "middle";
    ctx.fillText("Select a motif to preview…", 8, rollHeight * 0.5);
  } else {
    const rowCount = Math.max(1, data.highPitch - data.lowPitch + 1);
    const rowHeight = rollHeight / rowCount;

    for (let pitch = data.lowPitch; pitch <= data.highPitch; pitch += 1) {
      const top = (data.highPitch - pitch) * rowHeight;
      const pitchClass = ((pitch % 12) + 12) % 12;
      const isBlack =
        pitchClass === 1 ||
        pitchClass === 3 ||
        pitchClass === 6 ||
        pitchClass === 8 ||
        pitchClass === 10;
      ctx.fillStyle = isBlack ? COLORS.blackRow : COLORS.row;
      ctx.fillRect(0, top, w, rowHeight);
      ctx.strokeStyle = pitchClass === 0 ? COLORS.octave : COLORS.grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, top + 0.5);
      ctx.lineTo(w, top + 0.5);
      ctx.stroke();

      if (pitchClass === 0 && rowHeight >= 7) {
        const octave = Math.floor(pitch / 12) - 2;
        ctx.fillStyle = COLORS.muted;
        ctx.font = '8px "Ableton Sans", system-ui, sans-serif';
        ctx.textBaseline = "alphabetic";
        ctx.fillText(`C${octave}`, 4, top + Math.min(rowHeight - 1, 8));
      }
    }

    for (const note of data.notes) {
      const left = Math.max(0, Math.min(w, (note.atTicks / data.totalTicks) * w));
      const noteWidth = Math.max(2, (note.durationTicks / data.totalTicks) * w);
      const noteTop = (data.highPitch - note.pitch) * rowHeight + 1;
      const noteHeight = Math.max(2, rowHeight - 2);
      ctx.fillStyle = velocityColor(COLORS.note, note.velocity);
      ctx.fillRect(left, noteTop, Math.min(noteWidth, w - left), noteHeight);
      ctx.strokeStyle = velocityColor(COLORS.noteTop, note.velocity);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(left, noteTop + 0.5);
      ctx.lineTo(Math.min(w, left + noteWidth), noteTop + 0.5);
      ctx.stroke();
    }
  }

  ctx.strokeStyle = COLORS.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, rollHeight + 0.5);
  ctx.lineTo(w, rollHeight + 0.5);
  ctx.stroke();

  ctx.fillStyle = COLORS.text;
  ctx.font = '11px "Ableton Sans", system-ui, sans-serif';
  ctx.textBaseline = "alphabetic";
  const names = data?.noteNames || "—";
  ctx.fillText(truncateText(ctx, names, w - 12), 6, h - 4);

  ctx.strokeStyle = COLORS.border;
  ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
}

/**
 * Size a canvas to its parent and paint the current preview payload.
 * @param {HTMLCanvasElement} canvas Target canvas element.
 * @param {MotifPreviewPaintData | null} data Resolved preview, or null when none selected.
 */
export function renderLibraryPreview(
  canvas: HTMLCanvasElement,
  data: MotifPreviewPaintData | null,
): void {
  const getContext = canvas.getContext?.bind(canvas);
  if (typeof getContext !== "function") {
    return;
  }
  const parent = canvas.parentElement;
  const cssWidth = Math.max(1, parent?.clientWidth || canvas.clientWidth || 1);
  const cssHeight = Math.max(1, parent?.clientHeight || canvas.clientHeight || 1);
  const dpr =
    typeof window !== "undefined" && window.devicePixelRatio ? window.devicePixelRatio : 1;
  const pixelWidth = Math.max(1, Math.round(cssWidth * dpr));
  const pixelHeight = Math.max(1, Math.round(cssHeight * dpr));
  if (canvas.width !== pixelWidth) {
    canvas.width = pixelWidth;
  }
  if (canvas.height !== pixelHeight) {
    canvas.height = pixelHeight;
  }
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;

  const ctx = getContext("2d");
  if (!ctx) {
    return;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  paintLibraryPreview(ctx, data, cssWidth, cssHeight);
}
