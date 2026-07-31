((autowatch = 1),
  (inlets = 1),
  (outlets = 1),
  mgraphics.init(),
  (mgraphics.relative_coords = 0),
  (mgraphics.autofill = 0));
var currentData = null,
  debugOpen = !1,
  debugLines = [],
  debugLevel = "waiting",
  lastSummary = "",
  COLORS = {
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
  },
  CORNER_RADIUS = 6,
  BORDER_WIDTH = 1;
typeof jsarguments != "undefined" &&
  (jsarguments.length > 1 &&
    isFinite(Number(jsarguments[1])) &&
    (CORNER_RADIUS = Math.max(0, Number(jsarguments[1]))),
  jsarguments.length > 2 &&
    isFinite(Number(jsarguments[2])) &&
    (BORDER_WIDTH = Number(jsarguments[2]) > 0 ? 1 : 0));
function dimensions() {
  var r = box.rect;
  return { width: Math.max(1, r[2] - r[0]), height: Math.max(1, r[3] - r[1]) };
}
function setColor(r) {
  mgraphics.set_source_rgba(r[0], r[1], r[2], r[3]);
}
function strokeRoundedRect(r, e, t, i, a, n, s) {
  (setColor(n),
    mgraphics.set_line_width(s || 1),
    mgraphics.rectangle_rounded(r, e, t, i, a, a),
    mgraphics.stroke());
}
function frameMetrics(r, e) {
  var t = BORDER_WIDTH > 0 ? 0.5 : 0,
    i = Math.min(CORNER_RADIUS, Math.max(0, Math.min(r, e) / 2 - t));
  return {
    inset: t,
    radius: i,
    innerX: t,
    innerY: t,
    innerWidth: Math.max(1, r - t * 2),
    innerHeight: Math.max(1, e - t * 2),
  };
}
function fillRect(r, e, t, i, a) {
  (setColor(a), mgraphics.rectangle(r, e, t, i), mgraphics.fill());
}
function strokeLine(r, e, t, i, a, n) {
  (setColor(a),
    mgraphics.set_line_width(n || 1),
    mgraphics.move_to(r, e),
    mgraphics.line_to(t, i),
    mgraphics.stroke());
}
function drawText(r, e, t, i, a) {
  (setColor(a),
    mgraphics.select_font_face("Ableton Sans"),
    mgraphics.set_font_size(i),
    mgraphics.move_to(e, t),
    mgraphics.show_text(String(r)));
}
function truncateText(r, e, t) {
  var i = String(r || "");
  if (
    (mgraphics.select_font_face("Ableton Sans"),
    mgraphics.set_font_size(t),
    mgraphics.text_measure(i)[0] <= e)
  )
    return i;
  for (var a = "..."; i.length > 0 && mgraphics.text_measure(i + a)[0] > e;) i = i.slice(0, -1);
  return i + a;
}
function encodeDebug(r) {
  try {
    return encodeURIComponent(String(r));
  } catch (e) {
    return String(r);
  }
}
function report(r, e) {
  var t = String(e);
  ((debugLevel = r),
    debugLines.push(r.toUpperCase() + "  " + t),
    debugLines.length > 12 && debugLines.shift(),
    outlet(0, "preview_debug", r, encodeDebug(t)),
    r === "error"
      ? error("Motif preview: " + t + "\n")
      : post("Motif preview [" + r + "] " + t + "\n"),
    mgraphics.redraw());
}
function normalizeData(r) {
  if (!r || typeof r != "object") throw new TypeError("payload must be an object");
  if (!(r.notes instanceof Array)) throw new TypeError("notes must be an array");
  for (var e = [], t = 0; t < r.notes.length; t += 1) {
    var i = r.notes[t];
    if (!i || typeof i != "object") throw new TypeError("note " + t + " must be an object");
    var a = Number(i.pitch),
      n = Number(i.atTicks),
      s = Number(i.durationTicks);
    if (!isFinite(a) || !isFinite(n) || !isFinite(s))
      throw new TypeError("note " + t + " contains a non-numeric value");
    e.push({ pitch: Math.round(a), atTicks: Math.max(0, n), durationTicks: Math.max(1, s) });
  }
  var o = Number(r.lowPitch),
    h = Number(r.highPitch);
  if (
    ((!isFinite(o) || !isFinite(h)) && ((o = e.length ? e[0].pitch : 59), (h = o + 2)),
    (o = Math.round(o)),
    (h = Math.round(h)),
    h < o)
  ) {
    var g = o;
    ((o = h), (h = g));
  }
  return (
    h === o && ((o -= 1), (h += 1)),
    {
      notes: e,
      totalTicks: Math.max(1, Number(r.totalTicks) || 1),
      lowPitch: o,
      highPitch: h,
      noteNames: String(r.noteNames || "\u2013"),
    }
  );
}
function receiveData() {
  var r = arrayfromargs(arguments),
    e = r.length ? r[r.length - 1] : "";
  try {
    currentData = normalizeData(JSON.parse(decodeURIComponent(String(e))));
    var t = "Rendered " + currentData.notes.length + " notes";
    t !== lastSummary || debugLevel !== "ok"
      ? ((lastSummary = t), report("ok", t + " with native jsui"))
      : mgraphics.redraw();
  } catch (i) {
    ((currentData = null),
      report("error", "Bad preview payload: " + (i && i.message ? i.message : String(i))));
  }
}
function drawRows(r, e, t) {
  for (
    var i = Math.max(1, r.highPitch - r.lowPitch + 1), a = t / i, n = r.lowPitch;
    n <= r.highPitch;
    n += 1
  ) {
    var s = (r.highPitch - n) * a,
      o = ((n % 12) + 12) % 12,
      h = o === 1 || o === 3 || o === 6 || o === 8 || o === 10;
    if (
      (fillRect(0, s, e, a, h ? COLORS.blackRow : COLORS.row),
      strokeLine(0, s, e, s, o === 0 ? COLORS.octave : COLORS.grid, 1),
      o === 0 && a >= 7)
    ) {
      var g = Math.floor(n / 12) - 2;
      drawText("C" + g, 4, s + Math.min(a - 1, 8), 8, COLORS.muted);
    }
  }
  for (var m = 0; m < r.notes.length; m += 1) {
    var u = r.notes[m],
      c = Math.max(0, Math.min(e, (u.atTicks / r.totalTicks) * e)),
      v = Math.max(2, (u.durationTicks / r.totalTicks) * e),
      f = (r.highPitch - u.pitch) * a + 1,
      l = Math.max(2, a - 2);
    (fillRect(c, f, Math.min(v, e - c), l, COLORS.note),
      strokeLine(c, f, Math.min(e, c + v), f, COLORS.noteTop, 1));
  }
}
function drawStatus(r) {
  var e = debugLevel === "error" ? "UI !" : debugLevel === "ok" ? "UI \u2713" : "UI ...",
    t = debugLevel === "error" ? COLORS.error : debugLevel === "ok" ? COLORS.ok : COLORS.muted;
  (fillRect(r - 35, 2, 32, 12, [0.08, 0.08, 0.085, 0.9]), drawText(e, r - 31, 11, 8, t));
}
function drawDebug(r, e) {
  (fillRect(0, 0, r, e, COLORS.overlay),
    drawText("Motif native preview diagnostics", 6, 12, 9, COLORS.text));
  for (var t = Math.max(0, debugLines.length - 8), i = 25, a = t; a < debugLines.length; a += 1) {
    var n = debugLines[a],
      s = n.indexOf("ERROR") === 0 ? COLORS.error : COLORS.text;
    (drawText(truncateText(n, r - 12, 8), 6, i, 8, s), (i += 10));
  }
}
function paint() {
  var r = dimensions(),
    e = r.width,
    t = r.height,
    i = 18,
    a = frameMetrics(e, t),
    n = Math.max(1, t - i);
  (fillRect(0, 0, e, t, COLORS.background),
    !currentData || currentData.notes.length === 0
      ? drawText(
          debugLevel === "error"
            ? "Preview error - click UI ! for details"
            : "Waiting for motif preview...",
          8,
          n * 0.5,
          10,
          debugLevel === "error" ? COLORS.error : COLORS.muted,
        )
      : drawRows(currentData, e, n),
    strokeLine(0, n, e, n, COLORS.grid, 1));
  var s = currentData ? currentData.noteNames : "\u2013";
  (drawText(truncateText(s, e - 12, 11), 6, t - 4, 11, COLORS.text),
    drawStatus(e),
    debugOpen && drawDebug(e, t),
    BORDER_WIDTH > 0 &&
      a.radius > 0 &&
      strokeRoundedRect(
        a.innerX,
        a.innerY,
        a.innerWidth,
        a.innerHeight,
        a.radius,
        COLORS.border,
        BORDER_WIDTH,
      ));
}
function onclick(r, e) {
  var t = dimensions();
  (debugOpen || (r >= t.width - 42 && e <= 18)) && ((debugOpen = !debugOpen), mgraphics.redraw());
}
function onresize() {
  mgraphics.redraw();
}
function loadbang() {
  (report("info", "Native preview loaded; waiting for state"), outlet(0, "preview_ready"));
}
