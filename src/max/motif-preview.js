/* eslint-disable -- Max supplies jsui globals and invokes named handlers dynamically. */

/*
 * Native Motif note preview for Max for Live.
 *
 * This intentionally uses jsui/mgraphics rather than jweb. Frozen Max for Live
 * devices do not reliably unpack arbitrary HTML dependencies before jweb tries
 * to load them, which can turn a relative filename into an invalid file URL.
 *
 * Max API:
 * https://docs.cycling74.com/reference/jsui/
 * https://docs.cycling74.com/apiref/js/jsthis/
 * https://docs.cycling74.com/apiref/js/maxobj/#rect
 * https://docs.cycling74.com/apiref/js/mgraphics/
 */

autowatch = 1;
inlets = 1;
outlets = 1;

mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

var currentData = null;
var debugOpen = false;
var debugLines = [];
var debugLevel = "waiting";
var lastSummary = "";

var COLORS = {
  background: [0.078, 0.078, 0.082, 1],
  row: [0.078, 0.078, 0.082, 1],
  blackRow: [0.102, 0.102, 0.11, 1],
  grid: [0.165, 0.165, 0.18, 1],
  octave: [0.25, 0.25, 0.28, 1],
  note: [1, 0.55, 0.12, 1],
  noteTop: [1, 0.69, 0.4, 1],
  text: [0.88, 0.88, 0.9, 1],
  muted: [0.42, 0.42, 0.46, 1],
  ok: [0.45, 0.78, 0.45, 1],
  error: [1, 0.42, 0.38, 1],
  overlay: [0.03, 0.03, 0.035, 0.96],
  border: [0.2, 0.2, 0.22, 1],
};

var CORNER_RADIUS = 6;
var BORDER_WIDTH = 1;

if (typeof jsarguments !== "undefined") {
  // Max reserves jsarguments[0] for the loaded JavaScript filename.
  if (jsarguments.length > 1 && isFinite(Number(jsarguments[1]))) {
    CORNER_RADIUS = Math.max(0, Number(jsarguments[1]));
  }
  if (jsarguments.length > 2 && isFinite(Number(jsarguments[2]))) {
    BORDER_WIDTH = Number(jsarguments[2]) > 0 ? 1 : 0;
  }
}

function dimensions() {
  var rect = box.rect;
  return {
    width: Math.max(1, rect[2] - rect[0]),
    height: Math.max(1, rect[3] - rect[1]),
  };
}

function setColor(color) {
  mgraphics.set_source_rgba(color[0], color[1], color[2], color[3]);
}

function velocityColor(color, velocity) {
  var normalized = Math.max(0, Math.min(1, (velocity - 1) / 126));
  // Retain enough brightness for velocity 1 to remain legible on both piano-roll rows.
  var intensity = 0.25 + normalized * 0.75;
  return [color[0] * intensity, color[1] * intensity, color[2] * intensity, color[3]];
}

function strokeRoundedRect(x, y, width, height, radius, color, lineWidth) {
  setColor(color);
  mgraphics.set_line_width(lineWidth || 1);
  mgraphics.rectangle_rounded(x, y, width, height, radius, radius);
  mgraphics.stroke();
}

function frameMetrics(width, height) {
  var inset = BORDER_WIDTH > 0 ? 0.5 : 0;
  var radius = Math.min(CORNER_RADIUS, Math.max(0, Math.min(width, height) / 2 - inset));
  return {
    inset: inset,
    radius: radius,
    innerX: inset,
    innerY: inset,
    innerWidth: Math.max(1, width - inset * 2),
    innerHeight: Math.max(1, height - inset * 2),
  };
}

function fillRect(x, y, width, height, color) {
  setColor(color);
  mgraphics.rectangle(x, y, width, height);
  mgraphics.fill();
}

function strokeLine(x1, y1, x2, y2, color, width) {
  setColor(color);
  mgraphics.set_line_width(width || 1);
  mgraphics.move_to(x1, y1);
  mgraphics.line_to(x2, y2);
  mgraphics.stroke();
}

function drawText(text, x, baseline, size, color) {
  setColor(color);
  mgraphics.select_font_face("Ableton Sans");
  mgraphics.set_font_size(size);
  mgraphics.move_to(x, baseline);
  mgraphics.show_text(String(text));
}

function truncateText(text, maxWidth, size) {
  var value = String(text || "");
  mgraphics.select_font_face("Ableton Sans");
  mgraphics.set_font_size(size);
  if (mgraphics.text_measure(value)[0] <= maxWidth) return value;

  var suffix = "...";
  while (value.length > 0 && mgraphics.text_measure(value + suffix)[0] > maxWidth) {
    value = value.slice(0, -1);
  }
  return value + suffix;
}

function encodeDebug(value) {
  try {
    return encodeURIComponent(String(value));
  } catch (_) {
    return String(value);
  }
}

function report(level, message) {
  var text = String(message);
  debugLevel = level;
  debugLines.push(level.toUpperCase() + "  " + text);
  if (debugLines.length > 12) debugLines.shift();

  outlet(0, "preview_debug", level, encodeDebug(text));
  if (level === "error") error("Motif preview: " + text + "\n");
  else post("Motif preview [" + level + "] " + text + "\n");
  mgraphics.redraw();
}

function normalizeData(value) {
  if (!value || typeof value !== "object") throw new TypeError("payload must be an object");
  if (!(value.notes instanceof Array)) throw new TypeError("notes must be an array");

  var notes = [];
  for (var index = 0; index < value.notes.length; index += 1) {
    var note = value.notes[index];
    if (!note || typeof note !== "object")
      throw new TypeError("note " + index + " must be an object");

    var pitch = Number(note.pitch);
    var atTicks = Number(note.atTicks);
    var durationTicks = Number(note.durationTicks);
    if (!isFinite(pitch) || !isFinite(atTicks) || !isFinite(durationTicks)) {
      throw new TypeError("note " + index + " contains a non-numeric value");
    }
    var velocity = Number(note.velocity);
    if (!isFinite(velocity)) velocity = 100;

    notes.push({
      pitch: Math.round(pitch),
      atTicks: Math.max(0, atTicks),
      durationTicks: Math.max(1, durationTicks),
      velocity: Math.max(1, Math.min(127, Math.round(velocity))),
    });
  }

  var lowPitch = Number(value.lowPitch);
  var highPitch = Number(value.highPitch);
  if (!isFinite(lowPitch) || !isFinite(highPitch)) {
    lowPitch = notes.length ? notes[0].pitch : 59;
    highPitch = lowPitch + 2;
  }
  lowPitch = Math.round(lowPitch);
  highPitch = Math.round(highPitch);
  if (highPitch < lowPitch) {
    var swap = lowPitch;
    lowPitch = highPitch;
    highPitch = swap;
  }
  if (highPitch === lowPitch) {
    lowPitch -= 1;
    highPitch += 1;
  }

  return {
    notes: notes,
    totalTicks: Math.max(1, Number(value.totalTicks) || 1),
    lowPitch: lowPitch,
    highPitch: highPitch,
    noteNames: String(value.noteNames || "-"),
  };
}

function receiveData() {
  var values = arrayfromargs(arguments);
  var encoded = values.length ? values[values.length - 1] : "";

  try {
    currentData = normalizeData(JSON.parse(decodeURIComponent(String(encoded))));
    var summary = "Rendered " + currentData.notes.length + " notes";
    if (summary !== lastSummary || debugLevel !== "ok") {
      lastSummary = summary;
      report("ok", summary + " with native jsui");
    } else {
      mgraphics.redraw();
    }
  } catch (reason) {
    currentData = null;
    report(
      "error",
      "Bad preview payload: " + (reason && reason.message ? reason.message : String(reason)),
    );
  }
}

function drawRows(data, width, rollHeight) {
  var rowCount = Math.max(1, data.highPitch - data.lowPitch + 1);
  var rowHeight = rollHeight / rowCount;

  for (var pitch = data.lowPitch; pitch <= data.highPitch; pitch += 1) {
    var top = (data.highPitch - pitch) * rowHeight;
    var pitchClass = ((pitch % 12) + 12) % 12;
    var isBlack =
      pitchClass === 1 ||
      pitchClass === 3 ||
      pitchClass === 6 ||
      pitchClass === 8 ||
      pitchClass === 10;
    fillRect(0, top, width, rowHeight, isBlack ? COLORS.blackRow : COLORS.row);
    strokeLine(0, top, width, top, pitchClass === 0 ? COLORS.octave : COLORS.grid, 1);

    if (pitchClass === 0 && rowHeight >= 7) {
      var octave = Math.floor(pitch / 12) - 2;
      drawText("C" + octave, 4, top + Math.min(rowHeight - 1, 8), 8, COLORS.muted);
    }
  }

  for (var index = 0; index < data.notes.length; index += 1) {
    var note = data.notes[index];
    var left = Math.max(0, Math.min(width, (note.atTicks / data.totalTicks) * width));
    var noteWidth = Math.max(2, (note.durationTicks / data.totalTicks) * width);
    var noteTop = (data.highPitch - note.pitch) * rowHeight + 1;
    var noteHeight = Math.max(2, rowHeight - 2);

    fillRect(
      left,
      noteTop,
      Math.min(noteWidth, width - left),
      noteHeight,
      velocityColor(COLORS.note, note.velocity),
    );
    strokeLine(
      left,
      noteTop,
      Math.min(width, left + noteWidth),
      noteTop,
      velocityColor(COLORS.noteTop, note.velocity),
      1,
    );
  }
}

function drawStatus(width) {
  var label = "UI ...";
  var color = COLORS.muted;
  if (debugLevel === "error") {
    label = "UI !";
    color = COLORS.error;
  } else if (debugLevel === "ok") {
    label = "UI ✓";
    color = COLORS.ok;
  }
  fillRect(width - 35, 2, 32, 12, [0.08, 0.08, 0.085, 0.9]);
  drawText(label, width - 31, 11, 8, color);
}

function drawDebug(width, height) {
  fillRect(0, 0, width, height, COLORS.overlay);
  drawText("Motif native preview diagnostics", 6, 12, 9, COLORS.text);
  var start = Math.max(0, debugLines.length - 8);
  var y = 25;
  for (var index = start; index < debugLines.length; index += 1) {
    var line = debugLines[index];
    var color = line.indexOf("ERROR") === 0 ? COLORS.error : COLORS.text;
    drawText(truncateText(line, width - 12, 8), 6, y, 8, color);
    y += 10;
  }
}

function paint() {
  var size = dimensions();
  var width = size.width;
  var height = size.height;
  var footerHeight = 18;
  var frame = frameMetrics(width, height);

  var rollHeight = Math.max(1, height - footerHeight);
  fillRect(0, 0, width, height, COLORS.background);

  if (!currentData || currentData.notes.length === 0) {
    drawText(
      debugLevel === "error"
        ? "Preview error - click UI ! for details"
        : "Waiting for motif preview...",
      8,
      rollHeight * 0.5,
      10,
      debugLevel === "error" ? COLORS.error : COLORS.muted,
    );
  } else {
    drawRows(currentData, width, rollHeight);
  }

  strokeLine(0, rollHeight, width, rollHeight, COLORS.grid, 1);
  var names = currentData ? currentData.noteNames : "-";
  drawText(truncateText(names, width - 12, 11), 6, height - 4, 11, COLORS.text);
  drawStatus(width);

  if (debugOpen) drawDebug(width, height);

  if (BORDER_WIDTH > 0 && frame.radius > 0) {
    strokeRoundedRect(
      frame.innerX,
      frame.innerY,
      frame.innerWidth,
      frame.innerHeight,
      frame.radius,
      COLORS.border,
      BORDER_WIDTH,
    );
  }
}

function onclick(x, y) {
  var size = dimensions();
  if (debugOpen || (x >= size.width - 42 && y <= 18)) {
    debugOpen = !debugOpen;
    mgraphics.redraw();
  }
}

function onresize() {
  mgraphics.redraw();
}

function loadbang() {
  report("info", "Native preview loaded; waiting for state");
  outlet(0, "preview_ready");
}
