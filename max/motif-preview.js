"use strict";
(() => {
  // src/max/preview.ts
  var COLORS = {
    background: [0.055, 0.058, 0.062, 1],
    grid: [0.4, 0.25, 0.1, 0.72],
    bar: [0.66, 0.39, 0.13, 0.88],
    root: [1, 0.55, 0.12, 0.13],
    note: [1, 0.55, 0.12, 1],
    noteBorder: [1, 0.71, 0.3, 0.9]
  };
  var lowPitch = 59;
  var highPitch = 61;
  var bars = 1;
  var rootPitchClass = 0;
  var totalTicks = 1;
  var notes = [];
  mgraphics.init();
  mgraphics.relative_coords = 0;
  mgraphics.autofill = 0;
  function setColor(color) {
    mgraphics.set_source_rgba(color[0], color[1], color[2], color[3]);
  }
  function drawLine(x1, y1, x2, y2, width) {
    mgraphics.set_line_width(width);
    mgraphics.move_to(x1, y1);
    mgraphics.line_to(x2, y2);
    mgraphics.stroke();
  }
  function pitchY(pitch, top, height) {
    const range = Math.max(1, highPitch - lowPitch);
    return top + (highPitch - pitch) / range * height;
  }
  function data(...values) {
    const [low, high, barCount, root, ticks, ...noteValues] = values.map(Number);
    if (![low, high, barCount, root, ticks].every(Number.isFinite)) return;
    lowPitch = Math.round(low ?? 59);
    highPitch = Math.max(lowPitch + 1, Math.round(high ?? 61));
    bars = Math.max(0.25, barCount ?? 1);
    rootPitchClass = (Math.round(root ?? 0) % 12 + 12) % 12;
    totalTicks = Math.max(1, ticks ?? 1);
    notes = [];
    for (let index = 0; index + 2 < noteValues.length; index += 3) {
      const at = Number(noteValues[index]);
      const duration = Number(noteValues[index + 1]);
      const pitch = Number(noteValues[index + 2]);
      if (![at, duration, pitch].every(Number.isFinite)) continue;
      notes.push({ at: Math.max(0, at), duration: Math.max(1, duration), pitch: Math.round(pitch) });
    }
    mgraphics.redraw();
  }
  function clear() {
    notes = [];
    mgraphics.redraw();
  }
  function paint() {
    const [width, height] = mgraphics.size;
    const left = 10;
    const right = Math.max(left + 1, width - 10);
    const top = 8;
    const bottom = Math.max(top + 1, height - 8);
    const innerWidth = right - left;
    const innerHeight = bottom - top;
    setColor(COLORS.background);
    mgraphics.rectangle(0, 0, width, height);
    mgraphics.fill();
    for (let line = 0; line < 5; line += 1) {
      const y = top + innerHeight * line / 4;
      setColor(COLORS.grid);
      drawLine(left, y, right, y, 1);
    }
    const wholeBars = Math.max(1, Math.ceil(bars));
    for (let bar = 1; bar < wholeBars; bar += 1) {
      const x = left + innerWidth * bar / bars;
      setColor(COLORS.bar);
      drawLine(x, top, x, bottom, 1);
    }
    for (let pitch = lowPitch; pitch <= highPitch; pitch += 1) {
      if ((pitch % 12 + 12) % 12 !== rootPitchClass) continue;
      const y = pitchY(pitch, top, innerHeight);
      setColor(COLORS.root);
      mgraphics.rectangle(left, y - 5, innerWidth, 10);
      mgraphics.fill();
    }
    for (const note of notes) {
      const x = left + Math.min(totalTicks, note.at) / totalTicks * innerWidth;
      const rawWidth = Math.min(totalTicks, note.duration) / totalTicks * innerWidth;
      const noteWidth = Math.max(7, Math.min(right - x, rawWidth - 2));
      const y = pitchY(note.pitch, top, innerHeight);
      const noteHeight = 10;
      setColor(COLORS.note);
      if (noteWidth <= 10) {
        mgraphics.ellipse(x - 1, y - noteHeight / 2, noteHeight, noteHeight);
      } else {
        mgraphics.rectangle(x, y - noteHeight / 2, noteWidth, noteHeight);
      }
      mgraphics.fill_preserve();
      setColor(COLORS.noteBorder);
      mgraphics.set_line_width(1);
      mgraphics.stroke();
    }
  }
  var handlers = { data, clear, paint };
  globalThis.__motifPreviewHandlers = handlers;
})();
function data() { return globalThis.__motifPreviewHandlers.data.apply(null, arguments); }
function clear() { return globalThis.__motifPreviewHandlers.clear.apply(null, arguments); }
function paint() { return globalThis.__motifPreviewHandlers.paint.apply(null, arguments); }
//# sourceMappingURL=motif-preview.js.map
