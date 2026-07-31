var inlets = 1;
var outlets = 1;
function anything() {
  var message = messagename,
    args = arrayfromargs(arguments);
  if (typeof MotifEngine === "undefined" || typeof MotifEngine.dispatch !== "function") {
    error("Motif: engine dispatcher is unavailable for " + message + "\n");
    return;
  }
  return MotifEngine.dispatch(message, args);
}
("use strict");
var MotifEngine = (() => {
  var Ae = Object.defineProperty;
  var gn = Object.getOwnPropertyDescriptor;
  var bn = Object.getOwnPropertyNames;
  var yn = Object.prototype.hasOwnProperty;
  var We = (e) => {
    throw TypeError(e);
  };
  var Mn = (e, t) => {
      for (var n in t) Ae(e, n, { get: t[n], enumerable: !0 });
    },
    vn = (e, t, n, r) => {
      if ((t && typeof t == "object") || typeof t == "function")
        for (let i of bn(t))
          !yn.call(e, i) &&
            i !== n &&
            Ae(e, i, { get: () => t[i], enumerable: !(r = gn(t, i)) || r.enumerable });
      return e;
    };
  var kn = (e) => vn(Ae({}, "__esModule", { value: !0 }), e);
  var Xe = (e, t, n) => t.has(e) || We("Cannot " + n);
  var I = (e, t, n) => (Xe(e, t, "read from private field"), n ? n.call(e) : t.get(e)),
    Ze = (e, t, n) =>
      t.has(e)
        ? We("Cannot add the same private member more than once")
        : t instanceof WeakSet
          ? t.add(e)
          : t.set(e, n),
    W = (e, t, n, r) => (Xe(e, t, "write to private field"), r ? r.call(e, n) : t.set(e, n), n);
  var fr = {};
  Mn(fr, { dispatch: () => lr });
  function v(e, t, n) {
    return Math.min(n, Math.max(t, e));
  }
  function G(e, t) {
    return ((e % t) + t) % t;
  }
  function Pe(e, t) {
    return Math.floor(e / t);
  }
  function Sn(e) {
    let t = [...new Set(e.map((n) => G(Math.round(n), 12)))].sort((n, r) => n - r);
    return (t.includes(0) || t.unshift(0), t);
  }
  function X(e, t, n, r) {
    let i = Sn(r),
      o = G(n, 12),
      s = G(e, 12),
      a = G(s - o, 12),
      c = i.indexOf(a);
    if (c === -1) {
      let T = Pe(t, i.length),
        F = G(t, i.length);
      return T * 12 + (i[F] ?? 0);
    }
    let u = c + t,
      f = Pe(u, i.length),
      y = G(u, i.length);
    return f * 12 + (i[y] ?? 0) - a;
  }
  function et(e, t, n, r) {
    return v(e + X(e, t, n, r), 0, 127);
  }
  function tt(e, t) {
    return v(e + t, 0, 127);
  }
  function nt(e, t, n, r, i) {
    return v(e + X(e, t, r, i) + n, 0, 127);
  }
  function xn(e, t, n = 60, r = 0) {
    let i = Math.max(1, new Set(t.map((u) => ((Math.round(u) % 12) + 12) % 12)).size),
      o = Math.round((e / 12) * i),
      s = i * 2 + 2,
      a = o,
      c = e - X(n, o, r, t);
    for (let u = o - s; u <= o + s; u += 1) {
      let f = e - X(n, u, r, t),
        y = Math.abs(f),
        w = Math.abs(c);
      (y < w ||
        (y === w && Math.abs(u) < Math.abs(a)) ||
        (y === w && Math.abs(u) === Math.abs(a) && u < a)) &&
        ((a = u), (c = f));
    }
    return { degree: a, accidental: c };
  }
  function rt(e, t, n) {
    if (t === "chromatic") return { pitch: e };
    let r = xn(e, n.scaleIntervals, n.triggerPitch, n.rootNote);
    return t === "hybrid" && r.accidental !== 0
      ? { pitch: r.degree, accidental: r.accidental }
      : { pitch: r.degree };
  }
  function In(e, t, n) {
    return t === "chromatic"
      ? e.pitch + (e.accidental ?? 0)
      : X(n.triggerPitch, e.pitch, n.rootNote, n.scaleIntervals) +
          (t === "hybrid" ? (e.accidental ?? 0) : 0);
  }
  function it(e, t, n) {
    if (e.pitchMode === t) return e;
    let r = e.notes.map((i) => {
      let o = In(i, e.pitchMode, n),
        s = rt(o, t, n),
        { pitch: a, accidental: c, ...u } = i;
      return { ...u, ...s };
    });
    return { ...e, pitchMode: t, notes: r };
  }
  function ot(e, t) {
    let n = [...e]
      .map((a) => ({
        at: a.at,
        duration: Math.max(1, a.duration),
        pitch: a.pitch,
        velocity: a.velocity,
      }))
      .sort((a, c) => a.at - c.at || a.pitch - c.pitch);
    if (n.length === 0) throw new Error("No completed notes to import");
    let r = t.rootNote ?? n[0]?.pitch ?? 60,
      i = {
        triggerPitch: r,
        rootNote: t.scaleRootNote ?? 0,
        scaleIntervals: t.scaleIntervals ?? [0, 2, 4, 5, 7, 9, 11],
      },
      o = n.map((a) => {
        let c = a.pitch - r;
        return { at: a.at, duration: a.duration, ...rt(c, t.pitchMode, i), velocity: a.velocity };
      }),
      s = Math.max(...o.map((a) => a.at + a.duration));
    return {
      schemaVersion: 1,
      id: t.id,
      name: t.name,
      description: t.description ?? `Imported using ${t.pitchMode} relative analysis.`,
      pitchMode: t.pitchMode,
      sourceMeter: t.sourceMeter ?? { numerator: 4, denominator: 4 },
      length: s,
      notes: o,
    };
  }
  function $(e) {
    return e.numerator * 960 * (4 / e.denominator);
  }
  function q(e, t) {
    let n = Number.isFinite(t) && t > 0 ? t : 120;
    return (e / 960) * (6e4 / n);
  }
  function st(e, t) {
    switch (e) {
      case "1/16":
        return 960 / 4;
      case "1/8":
        return 960 / 2;
      case "1/4":
        return 960;
      case "bar":
        return $(t);
      default:
        return 0;
    }
  }
  function at(e, t) {
    if (!Number.isFinite(e) || !Number.isFinite(t) || t <= 0) return 0;
    let n = ((e % t) + t) % t;
    return n === 0 ? 0 : t - n;
  }
  function wn(e, t) {
    if (!t) return e;
    let n = t.inputMin ?? 1,
      r = t.inputMax ?? 127,
      i = t.outputMin ?? 1,
      o = t.outputMax ?? 127,
      s = Math.max(0.01, t.exponent ?? 1),
      a = v((e - n) / Math.max(1, r - n), 0, 1);
    return i + (o - i) * a ** s;
  }
  function _n(e, t, n) {
    let r = wn(n, t.velocityCurve),
      o = (e.velocity ?? r) * (e.velocityScale ?? 1);
    return Math.round(v(o + (e.velocityOffset ?? 0), 1, 127));
  }
  function Ee(e, t, n, r) {
    switch (r.pitchMode ?? t.pitchMode) {
      case "chromatic":
        return tt(r.triggerPitch, e.pitch + (e.accidental ?? 0));
      case "hybrid":
        return nt(r.triggerPitch, e.pitch, e.accidental ?? 0, n.rootNote, n.scaleIntervals);
      default:
        return et(r.triggerPitch, e.pitch, n.rootNote, n.scaleIntervals);
    }
  }
  function Nn(e, t, n) {
    let r = Math.max(0.01, e.gate ?? n.defaultGate ?? 1),
      i = e.duration * r;
    return (
      e.legato && t && t.at > e.at && (i = Math.max(i, t.at - e.at)),
      e.tie &&
        t &&
        t.at <= e.at + e.duration &&
        t.pitch === e.pitch &&
        (t.accidental ?? 0) === (e.accidental ?? 0) &&
        (i = Math.max(i, t.at + t.duration - e.at)),
      i
    );
  }
  function ct(e, t, n) {
    let r = $(t.timeSignature),
      i = $(e.sourceMeter),
      o = n.meterMode === "fit-bar" ? r / i : 1,
      s = Math.round(v(n.channel, 1, 16)),
      a = Math.max(0, n.launchOffsetTicks ?? 0),
      c = n.instanceId ?? 0,
      u = [];
    for (let f = 0; f < e.notes.length; f += 1) {
      let y = e.notes[f];
      if (!y) continue;
      let w = e.notes[f + 1],
        T = Ee(y, e, t, n),
        F = _n(y, e, n.triggerVelocity),
        p = a + Math.max(0, y.at * o),
        _ = Nn(y, w, e) * o,
        N = Math.max(p, p + _);
      (u.push({
        pitch: T,
        velocity: F,
        channel: s,
        offsetTicks: p,
        offsetMs: q(p, t.tempo),
        instanceId: c,
      }),
        u.push({
          pitch: T,
          velocity: 0,
          channel: s,
          offsetTicks: N,
          offsetMs: q(N, t.tempo),
          instanceId: c,
        }));
    }
    return u.sort((f, y) =>
      f.offsetTicks !== y.offsetTicks ? f.offsetTicks - y.offsetTicks : f.velocity - y.velocity,
    );
  }
  function $e(e) {
    let t = Math.max(0, Math.min(127, Math.round(e))),
      n = [
        "C",
        "C\u266F",
        "D",
        "D\u266F",
        "E",
        "F",
        "F\u266F",
        "G",
        "G\u266F",
        "A",
        "A\u266F",
        "B",
      ],
      r = Math.floor(t / 12) - 2;
    return `${n[t % 12] ?? "C"}${r}`;
  }
  function ut(e) {
    let t = e.trim().match(/^([A-Ga-g])([#♯b♭]?)(-2|-1|[0-8])$/);
    if (!t) return;
    let n = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 },
      r = t[1]?.toUpperCase() ?? "",
      i = t[2],
      o = Number(t[3]),
      s = i === "#" || i === "\u266F" ? 1 : i === "b" || i === "\u266D" ? -1 : 0,
      a = (o + 2) * 12 + (n[r] ?? 0) + s;
    return a >= 0 && a <= 127 ? a : void 0;
  }
  function Re(e, t, n, r, i, o = 64) {
    let s = r ?? e.pitchMode,
      a = $(e.sourceMeter),
      c = $(t.timeSignature),
      u = i === "fit-bar" ? c / a : 1,
      f = e.notes
        .slice(0, o)
        .map((C) => ({
          pitch: Ee(C, e, t, {
            channel: 1,
            meterMode: i,
            pitchMode: s,
            triggerPitch: n,
            triggerVelocity: 100,
          }),
          atTicks: Math.max(0, C.at * u),
          durationTicks: Math.max(1, C.duration * u),
        })),
      y = f.map((C) => C.pitch),
      w = y.length > 0 ? Math.min(...y) : n,
      T = y.length > 0 ? Math.max(...y) : n,
      F = w === T ? w - 1 : w,
      p = w === T ? T + 1 : T,
      N = Math.max(1, e.length * u) / Math.max(1, i === "fit-bar" ? c : a);
    return {
      notes: f,
      noteNames: f.map((C) => $e(C.pitch)),
      lowPitch: F,
      highPitch: p,
      bars: N,
      effectivePitchMode: s,
      triggerPitch: n,
    };
  }
  function dt(e) {
    return e === 0 ? 0 : -e;
  }
  function be(e, t) {
    if (!t.invert && !t.reverse) return e;
    let r = (t.reverse ? [...e.notes].reverse() : e.notes).map((i) => {
      let o = { ...i };
      return (
        t.invert &&
          ((o.pitch = dt(i.pitch)), i.accidental !== void 0 && (o.accidental = dt(i.accidental))),
        t.reverse && (o.at = Math.max(0, e.length - i.at - i.duration)),
        o
      );
    });
    return (t.reverse && r.sort((i, o) => i.at - o.at), { ...e, notes: r });
  }
  var ye = [
    {
      schemaVersion: 1,
      id: "chromatic-turn",
      name: "Chromatic Turn",
      description: "Fixed-interval phrase that ignores the selected scale.",
      pitchMode: "chromatic",
      sourceMeter: { numerator: 4, denominator: 4 },
      length: 3360,
      defaultGate: 0.82,
      notes: [
        { at: 0, duration: 480, pitch: 0 },
        { at: 480, duration: 480, pitch: 2 },
        { at: 960, duration: 480, pitch: 3 },
        { at: 1440, duration: 480, pitch: 7, velocityOffset: 6 },
        { at: 1920, duration: 480, pitch: 5 },
        { at: 2400, duration: 480, pitch: 2 },
        { at: 2880, duration: 480, pitch: 0, gate: 0.95 },
      ],
    },
    {
      schemaVersion: 1,
      id: "scale-turn",
      name: "Scale Turn",
      description: "Compact scale-aware turn used to validate one-key phrase triggering.",
      pitchMode: "scale",
      sourceMeter: { numerator: 4, denominator: 4 },
      length: 3360,
      defaultGate: 0.82,
      notes: [
        { at: 0, duration: 480, pitch: 0, velocityOffset: 4 },
        { at: 480, duration: 480, pitch: 1 },
        { at: 960, duration: 480, pitch: 2, velocityOffset: 3 },
        { at: 1440, duration: 480, pitch: 4, velocityOffset: 7 },
        { at: 1920, duration: 480, pitch: 3 },
        { at: 2400, duration: 480, pitch: 1, velocityOffset: -3 },
        { at: 2880, duration: 480, pitch: 0, velocityOffset: 2, gate: 0.95 },
      ],
    },
  ];
  function se(e) {
    return typeof e == "object" && e !== null && !Array.isArray(e);
  }
  function B(e) {
    return typeof e == "number" && Number.isFinite(e);
  }
  function Cn(e) {
    return e === "scale" || e === "chromatic" || e === "hybrid";
  }
  function Tn(e, t, n) {
    if (!se(e)) return (n.push(`${t} must be an object`), !1);
    let r = !0;
    return (
      (!Number.isInteger(e.numerator) || Number(e.numerator) < 1) &&
        (n.push(`${t}.numerator must be a positive integer`), (r = !1)),
      [1, 2, 4, 8, 16, 32].includes(Number(e.denominator)) ||
        (n.push(`${t}.denominator must be 1, 2, 4, 8, 16, or 32`), (r = !1)),
      r
    );
  }
  function H(e, t, n, r, i = () => !0, o = "a finite number") {
    let s = e[t];
    s !== void 0 && (!B(s) || !i(s)) && r.push(`${n}.${t} must be ${o}`);
  }
  function Ln(e, t, n) {
    let r = `notes[${t}]`;
    if (!se(e)) return (n.push(`${r} must be an object`), !1);
    ((!B(e.at) || e.at < 0) && n.push(`${r}.at must be a non-negative number`),
      (!B(e.duration) || e.duration <= 0) && n.push(`${r}.duration must be greater than zero`),
      B(e.pitch) || n.push(`${r}.pitch must be a number`),
      H(e, "accidental", r, n),
      H(e, "velocity", r, n, (i) => i >= 1 && i <= 127, "between 1 and 127"),
      H(e, "velocityOffset", r, n),
      H(e, "velocityScale", r, n, (i) => i >= 0, "zero or greater"),
      H(e, "gate", r, n, (i) => i > 0, "greater than zero"));
    for (let i of ["legato", "tie"]) {
      let o = e[i];
      o !== void 0 && typeof o != "boolean" && n.push(`${r}.${i} must be a boolean`);
    }
    return !0;
  }
  function An(e, t) {
    if (e !== void 0) {
      if (!se(e)) {
        t.push("velocityCurve must be an object");
        return;
      }
      for (let n of ["inputMin", "inputMax", "outputMin", "outputMax"]) H(e, n, "velocityCurve", t);
      H(e, "exponent", "velocityCurve", t, (n) => n > 0, "greater than zero");
    }
  }
  function Me(e) {
    let t = [];
    if (!se(e)) return { valid: !1, errors: ["motif must be an object"] };
    e.schemaVersion !== 1 && t.push(`schemaVersion must be ${1}`);
    for (let n of ["id", "name", "description"])
      (typeof e[n] != "string" || e[n].trim().length === 0) &&
        t.push(`${n} must be a non-empty string`);
    if (
      (Cn(e.pitchMode) || t.push("pitchMode must be scale, chromatic, or hybrid"),
      Tn(e.sourceMeter, "sourceMeter", t),
      (!B(e.length) || e.length <= 0) && t.push("length must be greater than zero"),
      H(e, "defaultGate", "motif", t, (n) => n > 0, "greater than zero"),
      An(e.velocityCurve, t),
      !Array.isArray(e.notes) || e.notes.length === 0)
    )
      t.push("notes must be a non-empty array");
    else {
      e.notes.forEach((r, i) => Ln(r, i, t));
      let n = e.length;
      B(n) &&
        e.notes.forEach((r, i) => {
          se(r) &&
            B(r.at) &&
            B(r.duration) &&
            r.at + r.duration > n &&
            t.push(`notes[${i}] extends beyond motif length`);
        });
    }
    return t.length > 0 ? { valid: !1, errors: t } : { valid: !0, errors: t, motif: e };
  }
  function ae(e, t = "motif") {
    return (
      e
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 72) || t
    );
  }
  var Z = class {
    constructor(t) {
      this.motifs = new Map();
      this.builtinIds = new Set(ye.map((t) => t.id));
      this.sortedList = null;
      ((this.currentId = t ?? ye[0]?.id ?? ""), this.resetToBuiltins(), this.ensureCurrent());
    }
    invalidateSortedList() {
      this.sortedList = null;
    }
    list() {
      return this.sortedList
        ? this.sortedList
        : ((this.sortedList = [...this.motifs.values()].sort(
            (t, n) => t.name.localeCompare(n.name) || t.id.localeCompare(n.id),
          )),
          this.sortedList);
    }
    resetToBuiltins() {
      this.motifs.clear();
      for (let t of ye) this.motifs.set(t.id, t);
      this.invalidateSortedList();
    }
    isBuiltin(t) {
      return this.builtinIds.has(t);
    }
    has(t) {
      return this.motifs.has(t);
    }
    uniqueId(t, n, r = () => !1) {
      let i = ae(t),
        o = i,
        s = 2;
      for (; (this.motifs.has(o) && o !== n) || (this.builtinIds.has(o) && o !== n) || r(o);)
        ((o = `${i}-${s}`), (s += 1));
      return o;
    }
    add(t) {
      let n = Me(t);
      return !n.valid || !n.motif
        ? n.errors
        : this.isBuiltin(n.motif.id)
          ? [`Cannot overwrite built-in motif: ${n.motif.id}`]
          : (this.motifs.set(n.motif.id, n.motif), this.invalidateSortedList(), []);
    }
    update(t) {
      return this.add(t);
    }
    get(t) {
      return this.motifs.get(t);
    }
    get current() {
      return this.get(this.currentId);
    }
    select(t) {
      let n = this.get(t);
      return (n && (this.currentId = n.id), n);
    }
    ensureCurrent(t) {
      let n = this.current;
      if (n) return n;
      let i = (t ? this.get(t) : void 0) ?? this.list()[0];
      return (i && (this.currentId = i.id), i);
    }
    labels() {
      let t = this.list(),
        n = new Map();
      for (let r of t) n.set(r.name, (n.get(r.name) ?? 0) + 1);
      return new Map(
        t.map((r) => [r.id, (n.get(r.name) ?? 0) > 1 ? `${r.name} \xB7 ${r.id}` : r.name]),
      );
    }
    resolve(t) {
      let n = String(t).trim(),
        r = this.get(n);
      if (r) return r;
      let i = [...this.labels()].find(([, o]) => o === n);
      return i ? this.get(i[0]) : this.list().find((o) => o.name === n);
    }
    replaceUsersFrom(t) {
      this.resetToBuiltins();
      for (let n of t.list()) t.isBuiltin(n.id) || this.add(n);
    }
    remove(t) {
      if (this.isBuiltin(t)) return !1;
      let n = this.motifs.delete(t);
      return (n && (this.invalidateSortedList(), this.ensureCurrent()), n);
    }
    filter(t) {
      let n = t.trim().toLowerCase(),
        r = this.list();
      return n
        ? r.filter(
            (i) =>
              i.id.toLowerCase().includes(n) ||
              i.name.toLowerCase().includes(n) ||
              i.description.toLowerCase().includes(n),
          )
        : r;
    }
    setNotes(t, n) {
      let r = this.motifs.get(t);
      if (!r) return [`Unknown motif: ${t}`];
      if (n.length === 0) return ["notes must be a non-empty array"];
      let i = Math.max(...n.map((o) => o.at + o.duration));
      return this.update({ ...r, notes: n, length: i });
    }
  };
  function Oe(e) {
    return {
      ...e,
      sourceMeter: { ...e.sourceMeter },
      notes: e.notes.map((t) => ({ ...t })),
      ...(e.velocityCurve ? { velocityCurve: { ...e.velocityCurve } } : {}),
    };
  }
  var k,
    ve = class {
      constructor() {
        Ze(this, k);
      }
      snapshot() {
        let t = I(this, k);
        return t
          ? {
              active: !0,
              dirty: t.dirty,
              created: t.created,
              sourceId: t.sourceId,
              targetId: t.targetId,
            }
          : { active: !1, dirty: !1, created: !1, sourceId: null, targetId: null };
      }
      isEditing(t) {
        return I(this, k) !== void 0 && (t === void 0 || I(this, k).targetId === t);
      }
      isDirty() {
        return I(this, k)?.dirty ?? !1;
      }
      current(t) {
        let n = I(this, k)?.targetId;
        return n ? t.get(n) : void 0;
      }
      begin(t, n, r = {}) {
        if (I(this, k)) return I(this, k).targetId === n ? t.get(I(this, k).targetId) : void 0;
        let i = t.get(n);
        if (i) {
          if (t.isBuiltin(n)) {
            let o = t.uniqueId(r.targetId ?? ae(i.name, `${i.id}-copy`)),
              s = { ...Oe(i), id: o };
            return t.add(s).length > 0
              ? void 0
              : (W(this, k, {
                  sourceId: n,
                  targetId: o,
                  original: Oe(i),
                  created: !0,
                  dirty: r.dirty ?? !1,
                }),
                s);
          }
          return (
            W(this, k, {
              sourceId: r.sourceId ?? n,
              targetId: n,
              original: Oe(i),
              created: r.created ?? !1,
              dirty: r.dirty ?? !1,
            }),
            i
          );
        }
      }
      markDirty() {
        I(this, k) && (I(this, k).dirty = !0);
      }
      cancel(t) {
        let n = I(this, k);
        if (n)
          return (
            n.created ? t.remove(n.targetId) : t.update(n.original), W(this, k, void 0), n.sourceId
          );
      }
      finishSave() {
        let t = I(this, k)?.targetId;
        return (W(this, k, void 0), t);
      }
      abandon() {
        W(this, k, void 0);
      }
    };
  k = new WeakMap();
  function O(e) {
    return typeof e == "object" && e !== null && !Array.isArray(e);
  }
  function L(e, t) {
    return Object.prototype.hasOwnProperty.call(e, t);
  }
  function Se(e, t = "") {
    return typeof e == "string" ? e : typeof e == "number" || typeof e == "boolean" ? String(e) : t;
  }
  function ke(e, t) {
    if (e === t) return !0;
    if (Array.isArray(e) || Array.isArray(t))
      return (
        Array.isArray(e) &&
        Array.isArray(t) &&
        e.length === t.length &&
        e.every((i, o) => ke(i, t[o]))
      );
    if (!O(e) || !O(t)) return !1;
    let n = Object.keys(e),
      r = Object.keys(t);
    return n.length === r.length && n.every((i) => L(t, i) && ke(e[i], t[i]));
  }
  var Pn = [
    "pitch",
    "accidental",
    "at",
    "duration",
    "gate",
    "velocity",
    "velocityOffset",
    "velocityScale",
    "legato",
    "tie",
  ];
  function ft(e, t) {
    if (!["string", "number", "boolean"].includes(typeof e))
      return { ok: !1, error: `${t} must be text` };
    let n = Se(e).trim();
    return n ? { ok: !0, value: n, changed: !1 } : { ok: !1, error: `${t} cannot be empty` };
  }
  function De(e, t, n = () => !0, r = "a finite number") {
    if (e == null || e === "") return { ok: !0, value: void 0, changed: !1 };
    let i = Number(e);
    return Number.isFinite(i) && n(i)
      ? { ok: !0, value: i, changed: !1 }
      : { ok: !1, error: `${t} must be ${r}` };
  }
  function mt(e, t, n) {
    let r = O(t) ? t : void 0;
    if (!r) return { ok: !1, error: "Motif properties must be an object" };
    if (L(r, "id") && Se(r.id) !== e.id)
      return { ok: !1, error: "Motif ID is generated and cannot be changed" };
    if (L(r, "schemaVersion") && Number(r.schemaVersion) !== e.schemaVersion)
      return { ok: !1, error: "schemaVersion is read-only" };
    if (L(r, "length") && Number(r.length) !== e.length)
      return {
        ok: !1,
        error: "Motif length is derived from note timing and cannot be changed directly",
      };
    let i = e.name;
    if (L(r, "name")) {
      let p = ft(r.name, "Motif name");
      if (!p.ok) return p;
      i = p.value;
    }
    let o = e.description;
    if (L(r, "description")) {
      let p = ft(r.description, "Motif description");
      if (!p.ok) return p;
      o = p.value;
    }
    let s = e.pitchMode;
    if (L(r, "pitchMode")) {
      let p = Se(r.pitchMode);
      if (p !== "scale" && p !== "chromatic" && p !== "hybrid")
        return { ok: !1, error: "pitchMode must be scale, chromatic, or hybrid" };
      s = p;
    }
    let a = e.sourceMeter;
    if (L(r, "sourceMeter")) {
      let p = O(r.sourceMeter) ? r.sourceMeter : void 0;
      if (!p) return { ok: !1, error: "sourceMeter must be an object" };
      let _ = Number(p.numerator),
        N = Number(p.denominator);
      if (!Number.isInteger(_) || _ < 1)
        return { ok: !1, error: "sourceMeter.numerator must be a positive integer" };
      if (![1, 2, 4, 8, 16, 32].includes(N))
        return { ok: !1, error: "sourceMeter.denominator must be 1, 2, 4, 8, 16, or 32" };
      a = { numerator: _, denominator: N };
    }
    let c = e.defaultGate;
    if (L(r, "defaultGate")) {
      let p = De(r.defaultGate, "defaultGate", (_) => _ > 0, "greater than zero");
      if (!p.ok) return p;
      c = p.value;
    }
    let u = e.velocityCurve;
    if (L(r, "velocityCurve")) {
      let p = r.velocityCurve;
      if (p == null) u = void 0;
      else {
        let _ = O(p) ? p : void 0;
        if (!_) return { ok: !1, error: "velocityCurve must be an object" };
        let N = {};
        for (let oe of ["inputMin", "inputMax", "outputMin", "outputMax"]) {
          let ge = De(_[oe], `velocityCurve.${oe}`);
          if (!ge.ok) return ge;
          ge.value !== void 0 && (N[oe] = ge.value);
        }
        let C = De(_.exponent, "velocityCurve.exponent", (oe) => oe > 0, "greater than zero");
        if (!C.ok) return C;
        (C.value !== void 0 && (N.exponent = C.value),
          (u = Object.keys(N).length > 0 ? N : void 0));
      }
    }
    let f =
        s === e.pitchMode
          ? e
          : it(e, s, {
              triggerPitch: n.triggerPitch,
              rootNote: n.host.rootNote,
              scaleIntervals: n.host.scaleIntervals,
            }),
      { defaultGate: y, velocityCurve: w, ...T } = f,
      F = {
        ...T,
        name: i,
        description: o,
        pitchMode: s,
        sourceMeter: a,
        ...(c !== void 0 ? { defaultGate: c } : {}),
        ...(u !== void 0 ? { velocityCurve: u } : {}),
      };
    return { ok: !0, value: F, changed: !ke(F, e) };
  }
  function pt(e, t, n, r) {
    if (!Pn.includes(n)) return { ok: !1, error: `Unknown note field: ${n}` };
    if (!Number.isInteger(t) || t < 0 || t >= e.notes.length)
      return { ok: !1, error: `Unknown note row: ${t}` };
    let i = e.notes[t];
    if (!i) return { ok: !1, error: `Unknown note row: ${t}` };
    let o = { ...i },
      s = r;
    if (n === "legato" || n === "tie") {
      let a = r === !0 || r === 1 || r === "1" || r === "true";
      (a ? (o[n] = !0) : delete o[n], (s = a));
    } else {
      let c = r == null || r === "" ? void 0 : Number(r);
      if (c !== void 0 && !Number.isFinite(c)) return { ok: !1, error: `Invalid ${n} value` };
      switch (n) {
        case "pitch":
          if (c === void 0) return { ok: !1, error: "pitch cannot be empty" };
          ((o.pitch = Math.round(c)), (s = o.pitch));
          break;
        case "accidental":
          (c === void 0 || c === 0 ? delete o.accidental : (o.accidental = Math.round(c)),
            (s = o.accidental ?? null));
          break;
        case "at":
          if (c === void 0 || c < 0) return { ok: !1, error: "at must be zero or greater" };
          ((o.at = Math.round(c)), (s = o.at));
          break;
        case "duration":
          if (c === void 0 || c <= 0)
            return { ok: !1, error: "duration must be greater than zero" };
          ((o.duration = Math.round(c)), (s = o.duration));
          break;
        case "gate":
          if (c === void 0) delete o.gate;
          else {
            if (c <= 0) return { ok: !1, error: "gate must be greater than zero" };
            o.gate = c;
          }
          s = o.gate ?? null;
          break;
        case "velocity":
          if (c === void 0) delete o.velocity;
          else {
            if (!Number.isInteger(c) || c < 1 || c > 127)
              return { ok: !1, error: "velocity must be an integer between 1 and 127" };
            o.velocity = c;
          }
          s = o.velocity ?? null;
          break;
        case "velocityOffset":
          (c === void 0 || c === 0 ? delete o.velocityOffset : (o.velocityOffset = c),
            (s = o.velocityOffset ?? null));
          break;
        case "velocityScale":
          if (c === void 0) delete o.velocityScale;
          else {
            if (c < 0) return { ok: !1, error: "velocityScale must be zero or greater" };
            o.velocityScale = c;
          }
          s = o.velocityScale ?? null;
          break;
      }
    }
    return { ok: !0, notes: e.notes.map((a, c) => (c === t ? o : a)), statusValue: s };
  }
  function ht(e, t) {
    if (e.notes.length >= t) return { ok: !1, error: `Maximum ${t} notes per motif` };
    let n = e.notes.at(-1)?.at ?? 0,
      r = e.notes.at(-1)?.duration ?? 240;
    return {
      ok: !0,
      notes: [...e.notes, { pitch: 0, at: n + r, duration: 240 }],
      statusValue: null,
    };
  }
  function gt(e, t) {
    return t < 0 || t >= e.notes.length
      ? { ok: !1, error: `Unknown note row: ${t}` }
      : { ok: !0, notes: e.notes.filter((n, r) => r !== t), statusValue: null };
  }
  var U = "scale-turn",
    bt = 32,
    yt = 32,
    xe = 1,
    Mt = [0.5, 1, 1.5, 2],
    ee = 512,
    vt = ["scale", "chromatic", "hybrid"],
    kt = ["preserve", "fit-bar"],
    Ie = ["replace", "overlap"],
    St = ["one-shot", "hold", "hold-repeat", "toggle", "latch", "release-tail"],
    xt = ["immediate", "1/16", "1/8", "1/4", "bar"],
    It = ["none", "non-triggers", "all"];
  function x(...e) {
    outlet(0, ...e);
  }
  function m(...e) {
    x("status", ...e);
  }
  function l(e) {
    (x("error", e),
      error(`Motif: ${e}
`));
  }
  function Q(e) {
    let t = [];
    for (let n of e) Array.isArray(n) ? t.push(...n) : t.push(n);
    return t;
  }
  function A(e, t = "") {
    return typeof e == "string" ? e : typeof e == "number" || typeof e == "boolean" ? String(e) : t;
  }
  function wt(e) {
    return Q(e).map(Number).filter(Number.isFinite);
  }
  function Fe(e, t) {
    let n = e.endsWith("/") || e.endsWith(":") ? "" : "/";
    return `${e}${n}${t}`;
  }
  function En(e, t) {
    for (let r = 0; r < t.length; r += 8192) e.writestring(t.slice(r, r + 8192));
  }
  function _t(e) {
    let t = new File(e, "read");
    if (!t.isopen) throw new Error("could not open file");
    try {
      return JSON.parse(t.readstring(t.eof));
    } finally {
      t.close();
    }
  }
  function Nt(e, t) {
    let n = new File(e, "write");
    if (!n.isopen) throw new Error("could not open file for write");
    try {
      n.writestring(`${JSON.stringify(t, null, 2)}
`);
    } finally {
      n.close();
    }
  }
  function Ct(e) {
    let t = new File(e, "read"),
      n = t.isopen;
    return (n && t.close(), n);
  }
  function te(e) {
    return e
      .replace(/\\/g, "/")
      .replace(/\/{2,}/g, "/")
      .toLowerCase();
  }
  function Tt(e) {
    return Q(e)
      .map((t) => A(t))
      .filter(Boolean)
      .join(" ")
      .trim()
      .replace(/^"|"$/g, "");
  }
  function He(e) {
    return e === !0 || e === 1 || e === "1" || e === "true" || e === "on";
  }
  function Be(e) {
    return e === !0 || e === 1;
  }
  function Lt(e, t) {
    let n = `Tempfolder:/${e}`,
      r;
    try {
      if (((r = new File(n, "write")), !r.isopen)) throw new Error(`could not create ${n}`);
      ((r.eof = 0), (r.position = 0), En(r, t));
      let i = Fe(r.foldername, e);
      (r.close(), (r = void 0));
      let o = new File(i, "read");
      if (!o.isopen) throw new Error(`could not reopen ${i}`);
      let s = o.eof;
      if ((o.close(), s < t.length)) throw new Error(`wrote a truncated page to ${i} (${s} bytes)`);
      return i;
    } finally {
      r?.isopen && r.close();
    }
  }
  function At(e, t, n) {
    let r = String(n);
    try {
      r = decodeURIComponent(r);
    } catch {}
    let i = `Motif jweb ${String(e)} [${String(t)}] ${r}
`;
    String(t).toLowerCase() === "error" ? error(i) : post(i);
  }
  function Y(e, t) {
    return t.some((n) => n === e);
  }
  function Pt(e, t) {
    let n = `${t.numerator}/${t.denominator}`,
      r = Number.isInteger(e.bars) ? String(e.bars) : e.bars.toFixed(1).replace(/\.0$/, ""),
      i = `${e.notes.length} ${e.notes.length === 1 ? "note" : "notes"}`,
      o = `${r} ${e.bars === 1 ? "bar" : "bars"}`;
    return `${i}  \u2022  ${o}  \u2022  ${n} source  \u2022  ${e.effectivePitchMode}`;
  }
  function Ue(e, t) {
    if (!e.isPlaying || t === "immediate") return 0;
    let n = st(t, e.timeSignature);
    return at(Math.max(0, e.currentSongTime * 960), n);
  }
  function ze(e, t, n, r) {
    let i = t === "preserve" ? e.length : e.length * ($(n.timeSignature) / $(e.sourceMeter));
    return Math.max(xe, q(i, n.tempo * r));
  }
  function Et(e) {
    return Q(e)
      .map(String)
      .map((t) => t.trim())
      .filter(Boolean)
      .join(" ")
      .trim();
  }
  function $t(e) {
    let t = typeof e == "number" ? e : Number(String(e).replace(/x$/i, ""));
    return Mt.some((n) => n === t) ? t : void 0;
  }
  function Rt(e) {
    return e === 1 ? Ie[0] : e === 0 ? Ie[1] : typeof e == "string" && Y(e, Ie) ? e : void 0;
  }
  function Ot(e) {
    if (typeof e == "string") {
      let t = ut(e);
      if (t !== void 0) return t;
      let n = Number(e);
      return Number.isFinite(n) ? Math.round(v(n, 0, 127)) : void 0;
    }
    return Number.isFinite(e) ? Math.round(v(e, 0, 127)) : void 0;
  }
  var we = class {
    constructor(t) {
      this.store = t;
      this.mappings = new Map();
    }
    get(t) {
      return this.mappings.get(t);
    }
    has(t) {
      return this.mappings.has(t);
    }
    assign(t, n, r = "trigger") {
      let i = Ot(t);
      if (i === void 0) return { ok: !1, error: `Cannot map invalid MIDI note: ${String(t)}` };
      let o = this.store.resolve(n);
      if (!o) return { ok: !1, error: `Cannot map ${i}: unknown motif ${n}` };
      if (r !== "trigger" && r !== "select")
        return { ok: !1, error: `Cannot map ${i}: unknown hot-key action ${r}` };
      let s = r,
        a = { pitch: i, motifId: o.id, action: s };
      return (this.mappings.set(i, { motifId: o.id, action: s }), { ok: !0, assignment: a });
    }
    remove(t) {
      let n = Ot(t);
      if (n !== void 0) return (this.mappings.delete(n), n);
    }
    clear() {
      let t = [...this.mappings.keys()];
      return (this.mappings.clear(), t);
    }
    prune() {
      let t = [];
      for (let [n, r] of this.mappings)
        this.store.has(r.motifId) || (this.mappings.delete(n), t.push(n));
      return t;
    }
    forMotif(t) {
      return [...this.mappings]
        .filter(([, n]) => n.motifId === t)
        .map(([n, r]) => ({ pitch: n, action: r.action }))
        .sort((n, r) => n.pitch - r.pitch);
    }
  };
  var Dt = "state-chunk";
  function Ft(e) {
    return {
      pitch: e.pitch,
      accidental: e.accidental ?? null,
      at: e.at,
      duration: e.duration,
      gate: e.gate ?? null,
      velocity: e.velocity ?? null,
      velocityOffset: e.velocityOffset ?? null,
      velocityScale: e.velocityScale ?? null,
      legato: e.legato ?? !1,
      tie: e.tie ?? !1,
    };
  }
  function Ve(e) {
    return { ...e, label: $e(e.pitch) };
  }
  function Ht(e, t) {
    let n = encodeURIComponent(JSON.stringify(e));
    if (n.length <= 6e3) return [n];
    let r = Math.ceil(n.length / 3e3);
    return Array.from({ length: r }, (i, o) => {
      let s = {
        kind: Dt,
        transferId: t,
        index: o,
        total: r,
        data: n.slice(o * 3e3, (o + 1) * 3e3),
      };
      return encodeURIComponent(JSON.stringify(s));
    });
  }
  function Ge(e) {
    return e !== void 0 && e.id !== 0;
  }
  function _e(e) {
    if (Array.isArray(e)) return _e(e[0]);
    if (typeof e == "boolean") return e;
    if (typeof e == "number") return e !== 0;
    if (typeof e == "string") {
      let t = e.trim().toLowerCase();
      return t !== "" && t !== "0" && t !== "false" && t !== "id 0";
    }
    return !!e;
  }
  function Bt(e) {
    try {
      if (_e(e.get("is_midi_clip"))) return !0;
      if (_e(e.get("is_audio_clip"))) return !1;
    } catch {}
    return !0;
  }
  function Ut() {
    if (!(typeof LiveAPI > "u")) {
      try {
        let e = new LiveAPI(void 0, "live_set view detail_clip");
        if (Ge(e) && Bt(e)) return e;
      } catch {}
      try {
        let e = new LiveAPI(void 0, "live_set view highlighted_clip_slot");
        if (!Ge(e) || !_e(e.get("has_clip"))) return;
        let t = new LiveAPI(void 0, "live_set view highlighted_clip_slot clip");
        if (Ge(t) && Bt(t)) return t;
      } catch {}
    }
  }
  function Rn(e) {
    if (typeof e == "string") {
      let n = e.trim();
      if (!n) return;
      try {
        return JSON.parse(n);
      } catch {
        return;
      }
    }
    let t = e;
    if (t && typeof t.stringify == "function")
      try {
        return JSON.parse(t.stringify());
      } catch {
        return;
      }
    return e;
  }
  function On(e) {
    let t = Rn(e),
      r = (O(t) ? t : void 0)?.notes;
    if (!Array.isArray(r)) return [];
    let i = [];
    for (let o of r) {
      let s = O(o) ? o : void 0;
      if (!s) continue;
      let a = Number(s.pitch),
        c = Number(s.start_time ?? s.startTime),
        u = Number(s.duration),
        f = Number(s.velocity ?? 100);
      !Number.isFinite(a) ||
        !Number.isFinite(c) ||
        !Number.isFinite(u) ||
        s.mute === 1 ||
        s.muted === 1 ||
        s.mute === !0 ||
        i.push({
          at: Math.round(c * 960),
          duration: Math.max(1, Math.round(u * 960)),
          pitch: Math.round(a),
          velocity: Math.round(v(f, 1, 127)),
        });
    }
    return i;
  }
  function zt(e) {
    let t = e.call("get_notes_extended", 0, 128, 0, 4096);
    return On(t);
  }
  var Ne = class {
    constructor(t, n) {
      this.store = t;
      this.callbacks = n;
      this.path = "";
      this.loaded = !1;
      this.scanning = !1;
      this.files = new Map();
      this.occupiedPaths = new Set();
      this.scanGeneration = 0;
    }
    browserFolder(t) {
      if (this.store.isBuiltin(t)) return "Built-ins";
      let n = this.files.get(t);
      if (!n || !this.path) return "Library";
      let r = this.path.replace(/\\/g, "/").replace(/\/+$/, ""),
        i = n.replace(/\\/g, "/"),
        o = `${r}/`;
      if (!i.toLowerCase().startsWith(o.toLowerCase())) return "Library";
      let s = i.slice(o.length),
        a = s.lastIndexOf("/");
      return a < 0 ? "Library" : s.slice(0, a);
    }
    filePath(t) {
      let n = this.path.endsWith("/") || this.path.endsWith(":") ? "" : "/";
      return `${this.path}${n}${t}.json`;
    }
    reserve(t) {
      this.occupiedPaths.add(te(t));
    }
    isOccupied(t) {
      return this.occupiedPaths.has(te(t));
    }
    uniqueId(t, n = "motif") {
      return this.store.uniqueId(
        ae(t, n),
        void 0,
        (r) => !!(this.path && this.isOccupied(this.filePath(r))),
      );
    }
    save(t) {
      let n = this.store.get(t);
      if (!n) throw new Error(`Unknown motif: ${t}`);
      let r = this.files.get(t),
        i = r ?? this.filePath(t);
      if (!r && (this.isOccupied(i) || Ct(i)))
        throw (
          this.reserve(i), new Error(`${t}.json already exists; refresh the library and try again`)
        );
      return (Nt(i, n), this.files.set(t, i), this.reserve(i), i);
    }
    selectPath(t) {
      return t === this.path && (this.loaded || this.scanning)
        ? (this.callbacks.onStateChange(), !1)
        : ((this.path = t), this.load("library"));
    }
    cancelScan() {
      ((this.scanGeneration += 1),
        this.scanTask &&
          (this.scanTask.cancel(), this.scanTask.freepeer(), (this.scanTask = void 0)),
        this.scanState?.current && this.scanState.current.folder.close(),
        (this.scanState = void 0),
        (this.scanning = !1));
    }
    load(t) {
      if ((this.cancelScan(), (this.loaded = !1), !this.path)) return !1;
      let n = new Folder(this.path);
      return n.pathname
        ? ((this.scanGeneration += 1),
          (this.scanning = !0),
          (this.scanState = {
            generation: this.scanGeneration,
            completionStatus: t,
            pending: [],
            current: { pathname: this.path, relativePath: "", depth: 0, folder: n },
            visited: new Set([te(this.path).replace(/\/+$/, "")]),
            candidateStore: new Z(),
            candidateFiles: new Map(),
            candidateOccupiedPaths: new Set(),
            processedEntries: 0,
            loadedMotifs: 0,
          }),
          this.callbacks.onStateChange(),
          this.callbacks.onStatus("library-scanning", this.path),
          (this.scanTask = new Task(() => this.processBatch())),
          this.scanTask.schedule(0),
          !0)
        : (n.close(),
          this.store.resetToBuiltins(),
          this.files.clear(),
          this.occupiedPaths.clear(),
          this.callbacks.onError(`Library folder not found: ${this.path}`),
          this.callbacks.onContentsChanged("unavailable"),
          this.callbacks.onStatus("library-unavailable", this.path),
          !1);
    }
    loadMotifFile(t, n, r) {
      r.candidateOccupiedPaths.add(te(t));
      try {
        let i = Me(_t(t));
        if (!i.valid || !i.motif) this.callbacks.onError(`${n}: ${i.errors.join("; ")}`);
        else if (r.candidateStore.isBuiltin(i.motif.id))
          this.callbacks.onError(
            `${n}: id \u201C${i.motif.id}\u201D conflicts with a built-in and was skipped`,
          );
        else if (r.candidateFiles.has(i.motif.id))
          this.callbacks.onError(`${n}: duplicate motif id \u201C${i.motif.id}\u201D was skipped`);
        else {
          let o = r.candidateStore.add(i.motif);
          o.length > 0
            ? this.callbacks.onError(`${n}: ${o.join("; ")}`)
            : (r.candidateFiles.set(i.motif.id, t), (r.loadedMotifs += 1));
        }
      } catch (i) {
        this.callbacks.onError(`${n}: ${i instanceof Error ? i.message : String(i)}`);
      }
    }
    finish(t) {
      if (!(t.generation !== this.scanGeneration || this.scanState !== t)) {
        (this.store.replaceUsersFrom(t.candidateStore), this.files.clear());
        for (let [n, r] of t.candidateFiles) this.files.set(n, r);
        this.occupiedPaths.clear();
        for (let n of t.candidateOccupiedPaths) this.occupiedPaths.add(n);
        ((this.scanState = void 0),
          (this.scanning = !1),
          (this.loaded = !0),
          this.scanTask &&
            (this.scanTask.cancel(), this.scanTask.freepeer(), (this.scanTask = void 0)),
          this.callbacks.onContentsChanged(t.completionStatus),
          t.completionStatus === "library"
            ? this.callbacks.onStatus("library", this.path)
            : this.callbacks.onStatus("library-refreshed", this.store.list().length));
      }
    }
    processBatch() {
      let t = this.scanState;
      if (!t || t.generation !== this.scanGeneration) return;
      let n = 0;
      for (; n < bt;) {
        if (!t.current) {
          let s = t.pending.shift();
          if (!s) {
            this.finish(t);
            return;
          }
          let a = te(s.pathname).replace(/\/+$/, "");
          if (t.visited.has(a)) continue;
          t.visited.add(a);
          let c = new Folder(s.pathname);
          if (((n += 1), !c.pathname)) {
            c.close();
            continue;
          }
          t.current = { ...s, folder: c };
        }
        let r = t.current;
        if (r.folder.end) {
          (r.folder.close(), (t.current = void 0));
          continue;
        }
        let i = r.folder.filename,
          o = r.folder.filetype;
        if (i && i !== "." && i !== "..") {
          let s = Fe(r.folder.pathname, i),
            a = r.relativePath ? `${r.relativePath}/${i}` : i;
          (o === "fold"
            ? r.depth < yt
              ? t.pending.push({ pathname: s, relativePath: a, depth: r.depth + 1 })
              : this.callbacks.onError(`${a}: maximum library folder depth exceeded`)
            : i.toLowerCase().endsWith(".json") && this.loadMotifFile(s, a, t),
            (t.processedEntries += 1));
        }
        (r.folder.next(), (n += 1));
      }
      this.scanTask && t.generation === this.scanGeneration && this.scanTask.schedule(0);
    }
  };
  var d = new Z(U),
    b = new ve(),
    g = new Ne(d, {
      onError: l,
      onStateChange: () => M(),
      onStatus: m,
      onContentsChanged: () => {
        (an(), d.ensureCurrent(U), P());
      },
    }),
    j = new we(d),
    ce = new Set(),
    Ce = new Set(),
    re,
    J = !1,
    K = !1,
    ie = "preserve",
    qe = "replace",
    R = "one-shot",
    Te = "immediate",
    de = "non-triggers",
    le = 36,
    fe = 84,
    ne = !1,
    jt = !1,
    Dn = 1,
    pe = 60,
    Qt = !1,
    z = 1,
    ue = "",
    Yt,
    Vt = 0,
    Gt = 0,
    h = {
      tempo: 120,
      rootNote: 0,
      scaleName: "Major",
      scaleIntervals: [0, 2, 4, 5, 7, 9, 11],
      scaleMode: !0,
      timeSignature: { numerator: 4, denominator: 4 },
      isPlaying: !1,
      currentSongTime: 0,
    },
    D = new Map(),
    me = new Set();
  function M() {
    let e = ue.trim().toLowerCase(),
      t = new Set(d.filter(ue).map((u) => u.id)),
      n = d
        .list()
        .filter((u) => !e || t.has(u.id) || g.browserFolder(u.id).toLowerCase().includes(e))
        .sort(
          (u, f) =>
            g.browserFolder(u.id).localeCompare(g.browserFolder(f.id)) ||
            u.name.localeCompare(f.name) ||
            u.id.localeCompare(f.id),
        ),
      r = d.current,
      i = r ? n.findIndex((u) => u.id === r.id) : -1,
      o = r ? b.isEditing(r.id) : !1,
      s = new Map();
    for (let u of n) s.set(u.name, (s.get(u.name) ?? 0) + 1);
    let a = null;
    if (r) {
      let u = r.notes.map(Ft),
        f = Re(be(r, { invert: J, reverse: K }), { ...h, tempo: h.tempo * z }, pe, re, ie),
        y = Pt(f, r.sourceMeter);
      a = {
        schemaVersion: r.schemaVersion,
        id: r.id,
        name: r.name,
        description: r.description ?? "",
        pitchMode: r.pitchMode,
        sourceMeter: { ...r.sourceMeter },
        length: r.length,
        defaultGate: r.defaultGate ?? null,
        velocityCurve: {
          inputMin: r.velocityCurve?.inputMin ?? null,
          inputMax: r.velocityCurve?.inputMax ?? null,
          outputMin: r.velocityCurve?.outputMin ?? null,
          outputMax: r.velocityCurve?.outputMax ?? null,
          exponent: r.velocityCurve?.exponent ?? null,
        },
        stats: y,
        isBuiltin: d.isBuiltin(r.id),
        isPersisted: g.files.has(r.id),
        folder: g.browserFolder(r.id),
        hotkeys: j.forMotif(r.id).map(Ve),
        noteCount: r.notes.length,
        noteLimit: ee,
        canAddNote: o && r.notes.length < ee,
        canRemoveNote: o && r.notes.length > 1,
        notes: u,
      };
    }
    let c = {
      query: ue,
      items: n.map((u) => ({
        id: u.id,
        name: u.name,
        showId: (s.get(u.name) ?? 0) > 1,
        folder: g.browserFolder(u.id),
        hotkeys: j.forMotif(u.id).map(Ve),
      })),
      selectedIndex: i,
      selected: a,
      editing: b.snapshot(),
      libraryPath: g.path,
      libraryLoaded: g.loaded,
      libraryScanning: g.scanning,
      actions: {
        editing: o,
        canEdit: !!r && !g.scanning,
        canSave: o && g.loaded,
        canImportClip: !g.scanning,
        canRefreshLibrary: !!g.path && !g.scanning,
      },
      alert: Yt ?? null,
      scanProgress: g.scanState
        ? { processedEntries: g.scanState.processedEntries, loadedMotifs: g.scanState.loadedMotifs }
        : null,
    };
    Gt += 1;
    for (let u of Ht(c, Gt)) x("ui", "lib", u);
  }
  function Jt(e, t) {
    ((Vt += 1), (Yt = { id: Vt, title: e, message: t }), l(t), M());
  }
  function Kt() {
    let e = d.current;
    if (!e) return;
    let t = Re(be(e, { invert: J, reverse: K }), { ...h, tempo: h.tempo * z }, pe, re, ie),
      n = t.notes.reduce((i, o) => Math.max(i, o.atTicks + o.durationTicks), 1),
      r = {
        notes: t.notes.map((i) => ({
          pitch: i.pitch,
          atTicks: i.atTicks,
          durationTicks: i.durationTicks,
        })),
        totalTicks: n,
        lowPitch: t.lowPitch,
        highPitch: t.highPitch,
        noteNames: t.noteNames.join("  \xB7  "),
      };
    x("ui", "preview", encodeURIComponent(JSON.stringify(r)));
  }
  function S() {
    (M(), Kt());
  }
  function he() {
    (x("clear"), x("panic"), ce.clear(), Ce.clear());
  }
  function Fn(e, ...t) {
    e = String(e);
    let n = wt(t);
    switch (e) {
      case "tempo": {
        let r = n[0];
        r !== void 0 && r > 0 && (h.tempo = r);
        break;
      }
      case "root_note": {
        let r = n[0];
        r !== void 0 && ((h.rootNote = Math.round(r)), Qt || (pe = 60 + h.rootNote), S());
        break;
      }
      case "scale_mode": {
        ((h.scaleMode = (n[0] ?? 0) !== 0), S());
        break;
      }
      case "scale_intervals": {
        n.length > 0 && ((h.scaleIntervals = n.map(Math.round)), S());
        break;
      }
      case "scale_name": {
        let r = Q(t).map(String).join(" ").trim();
        r && ((h.scaleName = r), S());
        break;
      }
      case "signature_numerator": {
        let r = n[0];
        r !== void 0 && r > 0 && ((h.timeSignature.numerator = Math.round(r)), S());
        break;
      }
      case "signature_denominator": {
        let r = n[0];
        r !== void 0 && r > 0 && ((h.timeSignature.denominator = Math.round(r)), S());
        break;
      }
      case "is_playing": {
        let r = h.isPlaying;
        ((h.isPlaying = (n[0] ?? 0) !== 0), r && !h.isPlaying && (Ye(), he()));
        break;
      }
      case "current_song_time": {
        let r = n[0];
        r !== void 0 && r >= 0 && (h.currentSongTime = r);
        break;
      }
      default:
        l(`Unknown Song property: ${e}`);
        return;
    }
  }
  function P() {
    d.ensureCurrent(U);
    let e = d.labels();
    x("motifs-reset");
    for (let t of d.list()) x("motif-item", e.get(t.id) ?? t.name);
    (x("motif-selected", e.get(d.currentId) ?? d.current?.name ?? d.currentId), S());
  }
  function Wt() {
    x("midi-pass", de === "none" ? 0 : 1);
  }
  function Hn() {
    (jt || ((jt = !0), m("Ready"), Wt()), P(), Je());
  }
  function Bn() {
    try {
      let e = Lt(
        "uttori-motif-library-a5cf486b1de9.html",
        '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Motif Library</title><style>*,*:before,*:after{box-sizing:border-box;margin:0;padding:0}:root{--bg:#141415;--surface:#1c1c1e;--surface2:#18181a;--border:#2e2e32;--accent:#ff8c1f;--text:#e0e0e6;--muted:#7a7a82;--input:#0e0e10;--btn:#2a2a2e;--btn-hover:#363638;--danger:#d55549;--note-alt:#1a1a1c}html,body{height:100%;background:var(--bg);color:var(--text);font:11px Ableton Sans,system-ui,-apple-system,sans-serif;overflow:hidden}button,input,textarea,select{font:inherit}button:disabled,input:disabled,textarea:disabled,select:disabled{opacity:.42;cursor:not-allowed!important}.hidden{display:none!important}#app{display:flex;height:calc(100% - 20px)}#left{width:clamp(170px,30vw,240px);min-width:150px;flex-shrink:0;display:flex;flex-direction:column;border-right:1px solid var(--border)}#right{flex:1;min-width:0;display:flex;flex-direction:column}#search-row{display:flex;align-items:center;gap:4px;padding:6px 6px 4px}#search{flex:1;min-width:0;background:var(--input);border:1px solid var(--border);color:var(--text);padding:3px 6px;outline:none}#clear-search{background:none;border:0;color:var(--muted);cursor:pointer;font-size:13px;padding:0 2px}#browser-list{flex:1;overflow-y:auto;border-top:1px solid var(--border)}.browser-folder{position:sticky;top:0;z-index:1;width:100%;padding:4px 8px 3px;background:var(--surface2);border:0;border-bottom:1px solid var(--border);color:var(--muted);cursor:pointer;font-size:9px;font-weight:600;text-align:left;text-transform:uppercase;letter-spacing:.05em}.browser-folder:hover{background:var(--btn);color:var(--text)}.browser-item{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 5px;padding:5px 8px;cursor:pointer;border-bottom:1px solid transparent}.browser-item:hover{background:var(--btn)}.browser-item.selected{background:var(--accent);color:#000}.browser-name{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.browser-id{grid-column:1 / -1;margin-top:1px;color:var(--muted);font:9px ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.hotkey-badge{align-self:center;color:var(--accent);font:9px ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap}.browser-item.selected .browser-id{color:#0000009e}.browser-item.selected .hotkey-badge{color:#000}#empty-list{padding:12px 8px;color:var(--muted);text-align:center}#browser-actions{border-top:1px solid var(--border);display:flex;gap:4px;padding:5px}#library-path{padding:0 6px 5px;color:var(--muted);font:9px ui-monospace,SFMono-Regular,Menlo,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.btn{background:var(--btn);border:1px solid var(--border);color:var(--text);cursor:pointer;padding:3px 7px;text-align:center;white-space:nowrap}.btn:hover:not(:disabled){background:var(--btn-hover)}.btn:active:not(:disabled),.btn.accent{background:var(--accent);color:#000;border-color:transparent}#meta{padding:6px 8px 4px;border-bottom:1px solid var(--border);display:flex;flex-direction:column;gap:3px}#meta-row-1{display:flex;align-items:center;gap:4px}#name-edit{flex:1;min-width:0;font-size:12px;font-weight:600}.field{background:var(--input);border:1px solid var(--border);color:var(--text);padding:3px 5px;outline:none;min-width:0}.field:focus{border-color:var(--accent)}.field[readonly],.field:disabled{background:transparent;border-color:transparent;color:var(--muted)}#description-edit{resize:none;height:34px;width:100%}#stats-line{color:var(--muted);font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#edit-state{color:var(--accent);font-size:10px;min-height:12px}#detail-actions{display:flex;gap:4px;padding:4px 8px;border-bottom:1px solid var(--border)}#detail-actions .btn{flex:1}#import-mode{width:104px;flex:0 0 auto}#panel-tabs{display:flex;border-bottom:1px solid var(--border);background:var(--surface2)}.panel-tab{flex:1;border:0;border-right:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;padding:4px 8px}.panel-tab:last-child{border-right:0}.panel-tab.active{background:var(--surface);color:var(--text);box-shadow:inset 0 -2px var(--accent)}.panel{flex:1;min-height:0;overflow:auto}#properties-panel{padding:7px 8px 12px}.section{margin-bottom:9px}.section-title{color:var(--muted);font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px}.property-grid{display:grid;grid-template-columns:92px minmax(0,1fr) 92px minmax(0,1fr);gap:4px 6px;align-items:center}.property-grid .wide{grid-column:2 / 5}.property-grid label{color:var(--muted);font-size:10px;text-align:right}.property-grid input,.property-grid select,.property-grid textarea{width:100%}.property-grid textarea{min-height:38px;resize:vertical}#source-meter-controls{display:flex;gap:4px}.identity{font:9px ui-monospace,SFMono-Regular,Menlo,monospace}.help{grid-column:2 / 5;color:var(--muted);font-size:9px;line-height:1.25}#hotkey-controls{display:flex;gap:4px}#hotkey-input{width:72px}#hotkey-action{width:112px}#hotkey-list{display:flex;flex-wrap:wrap;gap:4px}.hotkey-chip{background:var(--btn);border:1px solid var(--border);color:var(--text);cursor:pointer;padding:2px 5px}.hotkey-chip:hover{background:var(--danger);border-color:var(--danger);color:#fff}#notes-panel{overflow:auto}#note-table{min-width:780px;display:flex;flex-direction:column;min-height:100%}#note-header,.note-row{display:grid;grid-template-columns:28px 48px 38px 48px 54px 44px 48px 50px 50px 42px 42px 26px}#note-header{position:sticky;top:0;z-index:2;background:var(--surface);border-bottom:1px solid var(--border);color:var(--muted);font-size:9px;font-weight:600}#note-header span{padding:3px 2px;text-align:right;border-right:1px solid var(--border)}#note-header span:first-child,#note-header span:nth-last-child(-n+3){text-align:center}#note-rows{flex:1}.note-row{border-bottom:1px solid var(--border);align-items:center}.note-row:nth-child(2n){background:var(--note-alt)}.note-row>span{color:var(--muted);font-size:10px;text-align:center;padding:2px}.note-row input[type=number]{background:transparent;border:0;border-left:1px solid var(--border);color:var(--text);font-size:10px;padding:2px 3px;text-align:right;width:100%;outline:none;-moz-appearance:textfield}.note-row input[type=number]::-webkit-inner-spin-button,.note-row input[type=number]::-webkit-outer-spin-button{display:none}.note-row input[type=number]:focus{background:var(--input)}.check-cell{display:flex;justify-content:center;border-left:1px solid var(--border)}.check-cell input{accent-color:var(--accent)}.remove-btn{background:none;border:0;border-left:1px solid var(--border);color:var(--danger);cursor:pointer;font-size:13px;width:100%;height:100%}.remove-btn:hover:not(:disabled){background:var(--danger);color:#fff}#add-row{position:sticky;bottom:0;border-top:1px solid var(--border);padding:4px 8px;background:var(--bg)}#add-note-btn{width:100%}#modal-backdrop{position:fixed;top:0;right:0;bottom:0;left:0;z-index:100;display:flex;align-items:center;justify-content:center;background:#000000ad}#modal{width:330px;max-width:calc(100% - 32px);background:var(--surface);border:1px solid #4a4a50;box-shadow:0 12px 40px #0000008c;padding:12px}#modal-title{font-size:13px;margin-bottom:7px}#modal-message{color:var(--muted);line-height:1.4;white-space:pre-wrap}#modal-actions{display:flex;justify-content:flex-end;gap:6px;margin-top:12px}#debug-bar{position:fixed;left:0;right:0;bottom:0;height:20px;z-index:30;display:flex;align-items:center;gap:5px;padding:0 6px;border-top:1px solid var(--border);background:#101012;color:var(--muted);font-size:9px}#debug-indicator{color:#b0a050}#debug-indicator.ok{color:#70c070}#debug-indicator.error{color:#ff7066}#debug-summary{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#debug-toggle{border:0;background:transparent;color:var(--muted);cursor:pointer}#debug-panel{position:fixed;left:0;right:0;bottom:20px;z-index:29;display:none;max-height:160px;overflow:auto;padding:6px;border-top:1px solid var(--border);background:#080809f7;color:#c8c8ce;font:9px ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;user-select:text}#debug-panel.open{display:block}#debug-panel.has-error{color:#ff8b82}@media(max-width:520px){#app{flex-direction:column}#left{width:100%;min-width:0;height:140px;border-right:0;border-bottom:1px solid var(--border)}#right{min-height:0}.property-grid{grid-template-columns:80px minmax(0,1fr)}.property-grid .wide{grid-column:2}.help{grid-column:1 / -1}}*{scrollbar-width:thin;scrollbar-color:#7a7a82 #141415}*::-webkit-scrollbar{width:16px}*::-webkit-scrollbar-track{background:#141415}*::-webkit-scrollbar-thumb{background-color:#7a7a82;border-radius:10px;border:3px none #000}\n</style></head><body><div id="app"><div id="left"><div id="search-row"><input id="search" type="text" placeholder="Search..." autocomplete="off" spellcheck="false"><button id="clear-search" title="Clear search">\u2715</button></div><div id="browser-list"></div><div id="browser-actions"><button class="btn" id="choose-btn" title="Choose and remember a library folder">Choose</button><button class="btn" id="refresh-btn" title="Reload the chosen library folder">Refresh</button></div><div id="library-path" title="No user library selected">Built-ins only</div></div><div id="right"><div id="meta"><div id="meta-row-1"><input class="field" id="name-edit" type="text" placeholder="(no motif selected)" readonly><button class="btn" id="edit-btn">Edit</button><button class="btn hidden" id="cancel-edit-btn">Cancel Edit</button></div><textarea class="field" id="description-edit" placeholder="Description" readonly></textarea><div id="stats-line">\u2013</div><div id="edit-state"></div></div><div id="detail-actions"><select class="field" id="import-mode" title="Chromatic preserves the MIDI exactly; Scale and Hybrid encode relative scale degrees"><option value="chromatic">Exact / Chromatic</option><option value="hybrid">Hybrid</option><option value="scale">Scale</option></select><button class="btn accent" id="import-clip-btn">Import Clip</button><button class="btn" id="save-motif-btn">Save &amp; Finish</button></div><div id="panel-tabs"><button class="panel-tab active" data-panel="properties">Properties</button><button class="panel-tab" data-panel="notes">Notes</button></div><div class="panel" id="properties-panel"><div class="section"><div class="section-title">Identity</div><div class="property-grid"><label for="id-display">ID</label><input class="field identity" id="id-display" readonly><label for="schema-display">Schema</label><input class="field identity" id="schema-display" readonly><label for="length-display">Length</label><input class="field identity" id="length-display" readonly><div class="help">ID is generated once and remains stable. Length is recalculated from the final note end.</div></div></div><div class="section"><div class="section-title">MIDI Hot Keys</div><div class="property-grid"><label for="hotkey-input">Trigger note</label><div class="wide" id="hotkey-controls"><input class="field identity" id="hotkey-input" type="text" value="C1" placeholder="C3" autocomplete="off" spellcheck="false"><select class="field" id="hotkey-action"><option value="trigger">Trigger Motif</option><option value="select">Select Motif</option></select><button class="btn" id="assign-hotkey-btn">Assign to Motif</button></div><label>Assigned</label><div class="wide" id="hotkey-list"></div><div class="help">Trigger Motif plays this motif using the device\u2019s current Trigger Mode. Select Motif makes it active for later trigger-zone notes. Enter a note name such as C3, F\u266F2, or Bb4; click an assignment to remove it.</div></div></div><div class="section"><div class="section-title">Pitch &amp; Timing</div><div class="property-grid"><label for="pitch-mode-edit">Pitch mode</label><select class="field editable-property" id="pitch-mode-edit" disabled><option value="scale">Scale</option><option value="chromatic">Chromatic</option><option value="hybrid">Hybrid</option></select><label for="default-gate-edit">Default gate</label><input class="field editable-property" id="default-gate-edit" type="number" min="0.01" step="0.01" placeholder="1" disabled><label for="meter-numerator-edit">Source meter</label><div id="source-meter-controls"><input class="field editable-property" id="meter-numerator-edit" type="number" min="1" step="1" disabled><select class="field editable-property" id="meter-denominator-edit" disabled><option>1</option><option>2</option><option>4</option><option>8</option><option>16</option><option>32</option></select></div></div></div><div class="section"><div class="section-title">Velocity Curve</div><div class="property-grid"><label for="curve-input-min">Input min</label><input class="field editable-property" id="curve-input-min" type="number" placeholder="default" disabled><label for="curve-input-max">Input max</label><input class="field editable-property" id="curve-input-max" type="number" placeholder="default" disabled><label for="curve-output-min">Output min</label><input class="field editable-property" id="curve-output-min" type="number" placeholder="default" disabled><label for="curve-output-max">Output max</label><input class="field editable-property" id="curve-output-max" type="number" placeholder="default" disabled><label for="curve-exponent">Exponent</label><input class="field editable-property" id="curve-exponent" type="number" min="0.01" step="0.01" placeholder="1" disabled></div></div></div><div class="panel hidden" id="notes-panel"><div id="note-table"><div id="note-header"><span>#</span><span>Pitch</span><span>Acc</span><span>Start</span><span>Duration</span><span>Gate</span><span>Vel</span><span>Vel +</span><span>Vel \xD7</span><span>Legato</span><span>Tie</span><span></span></div><div id="note-rows"></div><div id="add-row"><button class="btn" id="add-note-btn">+ Add Note</button></div></div></div></div></div><div id="modal-backdrop" class="hidden" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div id="modal"><div id="modal-title"></div><div id="modal-message"></div><div id="modal-actions"><button class="btn" id="modal-cancel">Cancel</button><button class="btn" id="modal-confirm">Continue</button></div></div></div><div id="debug-panel" aria-live="polite"></div><div id="debug-bar"><span id="debug-indicator">\u25CF</span><span id="debug-summary">Loading jweb bridge...</span><button id="debug-toggle" type="button">Debug</button></div><script>"use strict";(()=>{var B="state-chunk";function A(e){let t=e,n=new Set;return{getState:()=>t,setState(a){t=typeof a=="function"?a(t):{...t,...a};for(let d of n)d(t)},subscribe(a){return n.add(a),()=>n.delete(a)}}}function k(e){return e instanceof Error?`${e.name}: ${e.message}`:String(e)}function $(e,t,n){return t.trim()===""&&n.has(e)}function R(e,t){let n=new Set(t);return n.has(e)?n.delete(e):n.add(e),n}function E(e){let t=e.trim();return t===""?null:Number(t)}function P(e){return typeof e=="object"&&e!==null&&e.kind===B}var ee="library",te=[{name:"pitch",type:"number",required:!0,step:"1"},{name:"accidental",type:"number",step:"1"},{name:"at",type:"number",required:!0,min:"0",step:"1"},{name:"duration",type:"number",required:!0,min:"1",step:"1"},{name:"gate",type:"number",min:"0.01",step:"0.01"},{name:"velocity",type:"number",min:"1",max:"127",step:"1"},{name:"velocityOffset",type:"number",step:"1"},{name:"velocityScale",type:"number",min:"0",step:"0.01"},{name:"legato",type:"checkbox"},{name:"tie",type:"checkbox"}],G=["name-edit","description-edit","pitch-mode-edit","default-gate-edit","meter-numerator-edit","meter-denominator-edit","curve-input-min","curve-input-max","curve-output-min","curve-output-max","curve-exponent"];function i(e){let t=document.getElementById(e);if(!t)throw new Error(`Library element is missing: ${e}`);return t}var w=window.max,C=w!==void 0&&typeof w.outlet=="function",J=new Map,S=C?w:{outlet:(...e)=>console.log("\\u2192 Max:",...e),bindInlet:(e,t)=>J.set(e,t)};window.max=S;C||(window.__motifBrowserInlets=J);var u=A({server:null,modal:null,formDirty:!1,activePanel:"properties",collapsedFolders:new Set}),M=[],H=null,I="",f=null,F=0,ne=i("debug-indicator"),ie=i("debug-summary"),D=i("debug-panel");function L(e,t){let n=`${new Date().toLocaleTimeString()} [${e}] ${t}`;M.push(n),M.length>80&&M.shift(),ie.textContent=t,ne.className=e==="error"?"error":e==="ok"?"ok":"",D.classList.toggle("has-error",M.some(a=>a.includes("[error]"))),D.textContent=M.join(`\n`),C&&S.outlet("web_debug",ee,e,encodeURIComponent(t))}window.addEventListener("error",e=>{L("error",`${e.message} @ ${e.filename}:${e.lineno}`)});window.addEventListener("unhandledrejection",e=>{L("error",`Unhandled promise: ${k(e.reason)}`)});i("debug-toggle").addEventListener("click",()=>{D.classList.toggle("open")});function p(e){try{S.outlet("lib_action",encodeURIComponent(JSON.stringify(e))),L("info",`Action: ${e.type}`)}catch(t){L("error",`Action failed: ${k(t)}`)}}function ae(){var t;let e=u.getState();return!!(e.formDirty||(t=e.server)!=null&&t.editing.dirty)}function X(e){u.setState({modal:e})}function N(){u.setState({modal:null})}function x(e,t="Discard the unsaved changes to this motif?"){if(!ae()){e();return}X({title:"Discard unsaved changes?",message:t,confirmLabel:"Discard",onConfirm:e})}function oe(e){var n;let t=i("modal-backdrop");if(!e){t.classList.add("hidden");return}t.classList.remove("hidden"),i("modal-title").textContent=e.title,i("modal-message").textContent=e.message,i("modal-confirm").textContent=(n=e.confirmLabel)!=null?n:"Continue",i("modal-cancel").classList.toggle("hidden",!!e.dismissOnly)}function re(e){var c;let t=i("browser-list");if(t.innerHTML="",!e||e.items.length===0){let o=document.createElement("div");o.id="empty-list",o.textContent=e!=null&&e.query?"No matching motifs":"No motifs found",t.append(o);return}let n=null,a=!1,d=u.getState().collapsedFolders;for(let o of e.items){let l=o.folder||"Library";if(l!==n){n=l,a=$(l,e.query,d);let r=document.createElement("button");r.type="button",r.className="browser-folder",r.textContent=`${a?"\\u25B8":"\\u25BE"} ${l}`,r.setAttribute("aria-expanded",String(!a)),r.title=`${a?"Expand":"Collapse"} ${l}`,r.addEventListener("click",()=>{u.setState({collapsedFolders:R(l,u.getState().collapsedFolders)})}),t.append(r)}if(a)continue;let s=document.createElement("div");s.className=`browser-item${((c=e.selected)==null?void 0:c.id)===o.id?" selected":""}`;let b=document.createElement("div");if(b.className="browser-name",b.textContent=o.name,s.append(b),o.hotkeys.length>0){let r=document.createElement("div");r.className="hotkey-badge",r.textContent=o.hotkeys.map(T=>`${T.label} ${T.action==="select"?"\\u21A6":"\\u25B6"}`).join(" "),s.append(r)}if(o.showId){let r=document.createElement("div");r.className="browser-id",r.textContent=o.id,s.append(r)}s.title=o.showId?`${o.name}\nID: ${o.id}`:o.name,s.addEventListener("click",()=>{var r;((r=e.selected)==null?void 0:r.id)!==o.id&&x(()=>p({type:"select_browser",id:o.id,discardChanges:!0}))}),t.append(s)}}function U(e){var o;let t=i("hotkey-input"),n=i("hotkey-action"),a=i("assign-hotkey-btn"),d=i("hotkey-list"),c=(o=e==null?void 0:e.hotkeys)!=null?o:[];if(t.disabled=!e,n.disabled=!e,a.disabled=!e,d.innerHTML="",!!e){if(c.length===0){let l=document.createElement("span");l.className="help",l.textContent="None",d.append(l);return}for(let l of c){let s=document.createElement("button");s.className="hotkey-chip";let b=l.action==="select"?"Select":"Trigger";s.title=`Remove ${l.label} \\xB7 ${b}`,s.textContent=`${l.label} \\xB7 ${b}  \\xD7`,s.addEventListener("click",()=>{p({type:"unmap_trigger",pitch:l.pitch})}),d.append(s)}}}function O(e,t){var d,c;let n=(c=(d=e==null?void 0:e.selected)==null?void 0:d.notes)!=null?c:[],a=i("note-rows");a.innerHTML="",n.forEach((o,l)=>{var T;let s=document.createElement("div");s.className="note-row";let b=document.createElement("span");b.textContent=String(l+1),s.append(b);for(let y of te){if(y.type==="checkbox"){let h=document.createElement("label");h.className="check-cell";let v=document.createElement("input");v.type="checkbox",v.checked=!!o[y.name],v.disabled=!t,v.addEventListener("change",()=>{p({type:"edit_note_at",index:l,field:y.name,value:v.checked})}),h.append(v),s.append(h);continue}let g=document.createElement("input");g.type="number";let _=o[y.name];g.value=_==null?"":String(_),g.disabled=!t,y.min!==void 0&&(g.min=y.min),y.max!==void 0&&(g.max=y.max),y.step!==void 0&&(g.step=y.step),g.addEventListener("change",()=>{let h=g.value===""?null:Number(g.value);h!==null&&!Number.isFinite(h)||p({type:"edit_note_at",index:l,field:y.name,value:h})}),s.append(g)}let r=document.createElement("button");r.className="remove-btn",r.textContent="\\u2715",r.title="Remove note",r.disabled=!((T=e==null?void 0:e.selected)!=null&&T.canRemoveNote),r.addEventListener("click",()=>p({type:"remove_note",index:l})),s.append(r),a.append(s)})}function m(e,t,n){let a=i(e);document.activeElement===a&&n||(typeof t=="string"?a.value=t:typeof t=="number"||typeof t=="boolean"?a.value=String(t):a.value="")}function q(e){for(let t of G){let n=i(t);if((n instanceof HTMLInputElement||n instanceof HTMLTextAreaElement)&&(t==="name-edit"||t==="description-edit")){n.readOnly=!e;continue}n.disabled=!e}}function V(e,t){var a,d,c,o;let n=e==null?void 0:e.velocityCurve;m("id-display",(a=e==null?void 0:e.id)!=null?a:"",!1),m("schema-display",e?`v${e.schemaVersion}`:"",!1),m("length-display",e?`${e.length} ticks`:"",!1),m("pitch-mode-edit",(d=e==null?void 0:e.pitchMode)!=null?d:"scale",t),m("default-gate-edit",e==null?void 0:e.defaultGate,t),m("meter-numerator-edit",(c=e==null?void 0:e.sourceMeter.numerator)!=null?c:"",t),m("meter-denominator-edit",(o=e==null?void 0:e.sourceMeter.denominator)!=null?o:4,t),m("curve-input-min",n==null?void 0:n.inputMin,t),m("curve-input-max",n==null?void 0:n.inputMax,t),m("curve-output-min",n==null?void 0:n.outputMin,t),m("curve-output-max",n==null?void 0:n.outputMax,t),m("curve-exponent",n==null?void 0:n.exponent,t)}function le(e,t){var s;let n=(s=e==null?void 0:e.selected)!=null?s:null,a=!!(e!=null&&e.actions.editing),d=i("edit-btn"),c=i("cancel-edit-btn"),o=i("save-motif-btn"),l=i("add-note-btn");if(i("import-clip-btn").disabled=!(e!=null&&e.actions.canImportClip),!n||!e){m("name-edit","",!1),m("description-edit","",!1),q(!1),V(null,!1),i("stats-line").textContent="\\u2013",i("edit-state").textContent="",d.disabled=!0,c.classList.add("hidden"),o.disabled=!0,l.disabled=!0,O(e,!1),U(null);return}m("name-edit",n.name,a),m("description-edit",n.description,a),q(a),V(n,a),i("stats-line").textContent=n.stats,i("edit-state").textContent=a?`${e.editing.dirty||t.formDirty?"Unsaved changes":"Editing"} \\xB7 ${n.id}`:n.isBuiltin?"Built-in \\xB7 Edit creates a user copy":`${n.isPersisted?"Saved":"Not yet saved"} \\xB7 ${n.id}`,d.classList.toggle("hidden",a),d.disabled=!e.actions.canEdit,c.classList.toggle("hidden",!a),c.disabled=!1,o.disabled=!e.actions.canSave,o.title=e.libraryLoaded?"Save changes and exit editing":"Choose a valid library folder before saving",l.disabled=!n.canAddNote,O(e,a),U(n)}function se(e){i("properties-panel").classList.toggle("hidden",e!=="properties"),i("notes-panel").classList.toggle("hidden",e!=="notes"),document.querySelectorAll(".panel-tab").forEach(t=>{t.classList.toggle("active",t.dataset.panel===e)})}function z(e){let{server:t}=e;re(t),le(t,e),oe(e.modal),se(e.activePanel);let n=i("search");t&&document.activeElement!==n&&(n.value=t.query);let a=i("library-path");a.textContent=t!=null&&t.libraryPath?`${t.libraryScanning?"Scanning \\xB7 ":t.libraryLoaded?"":"Unavailable \\xB7 "}${t.libraryPath}`:"Built-ins only",a.title=(t==null?void 0:t.libraryPath)||"No user library selected";let d=i("refresh-btn");d.disabled=!(t!=null&&t.actions.canRefreshLibrary),d.textContent=t!=null&&t.libraryScanning?"Scanning...":"Refresh"}function W(){return{name:i("name-edit").value,description:i("description-edit").value,pitchMode:i("pitch-mode-edit").value,sourceMeter:{numerator:Number(i("meter-numerator-edit").value),denominator:Number(i("meter-denominator-edit").value)},defaultGate:E(i("default-gate-edit").value),velocityCurve:{inputMin:E(i("curve-input-min").value),inputMax:E(i("curve-input-max").value),outputMin:E(i("curve-output-min").value),outputMax:E(i("curve-output-max").value),exponent:E(i("curve-exponent").value)}}}function K(){var e;(e=u.getState().server)!=null&&e.actions.editing&&p({type:"edit_motif",properties:W()})}function Q(e){var d,c,o,l,s,b,r;let t=u.getState(),n=((c=(d=t.server)==null?void 0:d.selected)==null?void 0:c.id)!==((o=e.selected)==null?void 0:o.id),a=!!((l=t.server)!=null&&l.editing.active&&!e.editing.active);u.setState({...t,server:e,formDirty:n||a?!1:t.formDirty}),(s=e.alert)!=null&&s.id&&e.alert.id!==((r=(b=t.server)==null?void 0:b.alert)==null?void 0:r.id)&&X({title:e.alert.title,message:e.alert.message,confirmLabel:"OK",dismissOnly:!0}),I="",H!==null&&(clearTimeout(H),H=null),L("ok",`State: ${e.items.length} motifs${e.libraryPath?` \\xB7 ${e.libraryPath}`:""}`)}function de(e){let t=Number(e.transferId),n=Number(e.index),a=Number(e.total);if(!Number.isInteger(t)||t<F||!Number.isInteger(n)||!Number.isInteger(a)||n<0||n>=a||a<1||a>1e4||typeof e.data!="string")return;if(!f||f.id!==t){if(f&&t<f.id)return;f={id:t,total:a,parts:new Array(a),received:new Set}}if(f.total!==a||(f.parts[n]=e.data,f.received.add(n),f.received.size!==a))return;let d=f.parts.join("");F=t,f=null,Q(JSON.parse(decodeURIComponent(d)))}function Y(...e){let t=e[e.length-1];try{let n=JSON.parse(decodeURIComponent(String(t)));if(P(n)){de(n),I="";return}f=null,Q(n)}catch(n){let a=k(n);if(a===I)return;I=a,L("error",`Library data could not be displayed: ${a}`)}}u.subscribe(z);z(u.getState());document.querySelectorAll(".panel-tab").forEach(e=>{e.addEventListener("click",()=>{let t=e.dataset.panel;(t==="properties"||t==="notes")&&u.setState({activePanel:t})})});var j=i("search");j.addEventListener("input",()=>{p({type:"filter_motifs",query:j.value})});i("clear-search").addEventListener("click",()=>{p({type:"filter_motifs",query:""})});i("choose-btn").addEventListener("click",()=>{x(()=>{var e;(e=u.getState().server)!=null&&e.editing.active&&p({type:"cancel_edit"}),S.outlet("choose_library")},"Discard the current edits and choose another library folder?")});i("refresh-btn").addEventListener("click",()=>{x(()=>p({type:"refresh_library",discardChanges:!0}),"Discard the current edits and reload the library folder?")});i("edit-btn").addEventListener("click",()=>{p({type:"begin_edit"})});i("cancel-edit-btn").addEventListener("click",()=>{x(()=>p({type:"cancel_edit"}))});i("import-clip-btn").addEventListener("click",()=>{x(()=>p({type:"import_clip",pitchMode:i("import-mode").value}),"Discard the current edits and import the selected Live clip?")});i("save-motif-btn").addEventListener("click",()=>{p({type:"save_motif",properties:W()})});i("add-note-btn").addEventListener("click",()=>{p({type:"add_note"})});i("assign-hotkey-btn").addEventListener("click",()=>{var t;let e=(t=u.getState().server)==null?void 0:t.selected;e&&p({type:"map_trigger",pitch:i("hotkey-input").value,motifId:e.id,action:i("hotkey-action").value})});i("hotkey-input").addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),i("assign-hotkey-btn").click())});for(let e of G){let t=i(e);t.addEventListener("input",()=>u.setState({formDirty:!0})),t.addEventListener("change",K),(t.tagName==="TEXTAREA"||t instanceof HTMLInputElement&&t.type==="text")&&t.addEventListener("blur",K)}i("modal-cancel").addEventListener("click",N);i("modal-backdrop").addEventListener("click",e=>{e.target===e.currentTarget&&N()});i("modal-confirm").addEventListener("click",()=>{var t;let e=u.getState().modal;N(),(t=e==null?void 0:e.onConfirm)==null||t.call(e)});document.addEventListener("keydown",e=>{e.key==="Escape"&&u.getState().modal&&N()});C?typeof S.bindInlet!="function"?L("error","Max jweb bridge is missing bindInlet"):(S.bindInlet("receiveData",Y),L("info",`Bridge ready; waiting for library state (${location.href})`),S.outlet("library_ready"),H=setTimeout(()=>{u.getState().server||L("error","No library state received within 2 seconds")},2e3)):Y(encodeURIComponent(JSON.stringify({query:"",libraryPath:"/Users/example/Motifs",libraryLoaded:!0,libraryScanning:!1,scanProgress:null,editing:{active:!1,dirty:!1,created:!1,sourceId:null,targetId:null},actions:{editing:!1,canEdit:!0,canSave:!1,canImportClip:!0,canRefreshLibrary:!0},items:[{id:"chromatic-turn",name:"Chromatic Turn",showId:!1,folder:"Library",hotkeys:[]},{id:"scale-turn",name:"Scale Turn",showId:!1,folder:"Library",hotkeys:[]}],selectedIndex:0,selected:{schemaVersion:1,id:"chromatic-turn",name:"Chromatic Turn",description:"Fixed-interval phrase that ignores the selected scale.",pitchMode:"chromatic",sourceMeter:{numerator:4,denominator:4},length:3360,defaultGate:.82,velocityCurve:{inputMin:null,inputMax:null,outputMin:null,outputMax:null,exponent:null},stats:"7 notes \\u2022 0.88 bars \\u2022 4/4 source \\u2022 chromatic",isBuiltin:!0,isPersisted:!1,folder:"Built-ins",hotkeys:[],noteCount:2,noteLimit:512,canAddNote:!1,canRemoveNote:!1,notes:[{pitch:0,accidental:null,at:0,duration:480,gate:null,velocity:null,velocityOffset:null,velocityScale:null,legato:!1,tie:!1},{pitch:2,accidental:null,at:480,duration:480,gate:null,velocity:null,velocityOffset:null,velocityScale:null,legato:!1,tie:!1}]},alert:null})));})();\n</script></body></html>',
      );
      x("library-page", e);
    } catch (e) {
      l(`Library page preparation failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  function Xt(e, t, n, r) {
    x("event", e, t, n, Math.max(0, r));
  }
  function Zt(e) {
    let t = j.get(e);
    return t?.action === "trigger" ? t.motifId : d.currentId;
  }
  function Qe(e, t, n, r = {}) {
    let i = r.motifId ?? Zt(e),
      o = d.resolve(i);
    if (!o) {
      l(`Unknown motif: ${i}`);
      return;
    }
    ((qe === "replace" || R === "latch") && he(), (pe = e), (Qt = !0), S());
    let s = Dn++,
      a = {
        channel: Math.round(v(n, 1, 16)),
        meterMode: ie,
        triggerPitch: Math.round(e),
        triggerVelocity: Math.round(t),
        launchOffsetTicks: r.launchOffsetTicks ?? Ue(h, Te),
        instanceId: s,
      };
    re !== void 0 && (a.pitchMode = re);
    for (let c of ct(be(o, { invert: J, reverse: K }), { ...h, tempo: h.tempo * z }, a))
      Xt(c.pitch, c.velocity, c.channel, c.offsetMs);
    return (m("trigger", i, e, s), s);
  }
  function V(e, t = !0) {
    let n = D.get(e);
    n &&
      (n.task.cancel(),
      n.task.freepeer(),
      D.delete(e),
      me.delete(e),
      t && m("repeat-stopped", n.motifId, e));
  }
  function Ye(e = !1) {
    for (let t of [...D.keys()]) V(t, e);
    me.clear();
  }
  function Un(e, t, n) {
    if (D.has(e)) return;
    let r = Zt(e),
      i = d.resolve(r);
    if (!i) {
      l(`Unknown motif: ${r}`);
      return;
    }
    let o = Ue(h, Te);
    if (Qe(e, t, n, { motifId: i.id, launchOffsetTicks: o }) === void 0) return;
    let a,
      c = new Task(() => {
        if (D.get(e) !== a) return;
        let f = d.resolve(a.motifId);
        if (!f) {
          V(e);
          return;
        }
        Qe(e, a.velocity, a.channel, { motifId: a.motifId, launchOffsetTicks: 0 }) === void 0 ||
          D.get(e) !== a ||
          a.task.schedule(ze(f, ie, h, z));
      });
    ((a = { motifId: i.id, velocity: t, channel: n, task: c }), D.set(e, a));
    let u = q(o, h.tempo * z) + ze(i, ie, h, z);
    (c.schedule(Math.max(xe, u)), m("repeat-started", i.id, e));
  }
  function qt(e) {
    ce.has(e) && (he(), m("release", e));
  }
  function zn(e, t, n = 1) {
    let r = Math.round(v(e, 0, 127)),
      i = Math.round(v(t, 0, 127)),
      o = Math.round(v(n, 1, 16)),
      s = j.get(r),
      a = !!s || D.has(r) || (r >= le && r <= fe);
    if (((de === "all" || (de === "non-triggers" && !a)) && Xt(r, i, o, 0), !!a)) {
      if (s?.action === "select") {
        i > 0 && (Ke(s.motifId), d.currentId === s.motifId && m("selected", s.motifId, r));
        return;
      }
      if (R === "hold-repeat" || D.has(r)) {
        i > 0 ? R === "hold-repeat" && Un(r, i, o) : ne ? me.add(r) : V(r);
        return;
      }
      if (i > 0) {
        if (R === "toggle" && ce.has(r)) {
          qt(r);
          return;
        }
        Qe(r, i, o) !== void 0 && R !== "one-shot" && ce.add(r);
        return;
      }
      R === "hold" ? (ne ? Ce.add(r) : qt(r)) : R === "release-tail" && ce.delete(r);
    }
  }
  function en(e, t, n = 1) {
    let r = Math.round(v(e, 0, 127)),
      i = Math.round(v(t, 0, 127));
    if (r !== 64) return;
    let o = ne;
    if (((ne = i >= 64), o && !ne)) {
      for (let s of [...me]) V(s);
      (me.clear(), Ce.size > 0 && he(), Ce.clear());
    }
    m("sustain", ne ? "on" : "off");
  }
  function jn(e, t = 1) {
    en(64, e, t);
  }
  function Vn(e) {
    let t = d.resolve(e);
    if (!t) {
      l(`Unknown motif: ${e}`);
      return;
    }
    if (t.id !== d.currentId) {
      if (b.isEditing()) {
        if (b.isDirty()) {
          (l("Save or cancel the current edits before selecting another motif"),
            x("motif-selected", d.labels().get(d.currentId) ?? d.current?.name ?? d.currentId),
            M());
          return;
        }
        if ((b.cancel(d), (t = d.resolve(e)), !t)) {
          (l(`Unknown motif after cancelling edit: ${e}`), P());
          return;
        }
      }
      (d.select(t.id),
        x("motif-selected", d.labels().get(t.id) ?? t.name),
        S(),
        m("Motif", t.name));
    }
  }
  function Gn(e) {
    if (e === "motif") re = void 0;
    else if (Y(e, vt)) re = e;
    else {
      l(`Unknown pitch mode: ${e}`);
      return;
    }
    (S(), m("Pitch", e));
  }
  function Je() {
    x("ui", "transforms", J ? 1 : 0, K ? 1 : 0);
  }
  function tn(e) {
    ((J = He(e)), Je(), S(), m("invert", J ? "on" : "off"));
  }
  function qn() {
    tn(!J);
  }
  function nn(e) {
    ((K = He(e)), Je(), S(), m("reverse", K ? "on" : "off"));
  }
  function Qn() {
    nn(!K);
  }
  function Yn(e) {
    if (!Y(e, kt)) {
      l(`Unknown meter mode: ${e}`);
      return;
    }
    ((ie = e), S(), m("Meter", e));
  }
  function Jn(e) {
    let t = Rt(e);
    if (!t) {
      l(`Unknown retrigger mode: ${String(e)}`);
      return;
    }
    ((qe = t), m("retrigger", qe));
  }
  function Kn(e) {
    if (!Y(e, St)) {
      l(`Unknown trigger mode: ${e}`);
      return;
    }
    let t = e;
    (R === "hold-repeat" && t !== "hold-repeat" && Ye(), (R = t), m("trigger-mode", R));
  }
  function Wn(e) {
    if (!Y(e, xt)) {
      l(`Unknown launch quantization: ${e}`);
      return;
    }
    ((Te = e), m("quantization", Te));
  }
  function Xn(e) {
    if (!Y(e, It)) {
      l(`Unknown pass-through policy: ${e}`);
      return;
    }
    ((de = e), Wt(), m("pass-through", de));
  }
  function Zn(e) {
    ((le = Math.min(fe, Math.round(v(e, 0, 127)))), m("trigger-zone", le, fe));
  }
  function er(e) {
    ((fe = Math.max(le, Math.round(v(e, 0, 127)))), m("trigger-zone", le, fe));
  }
  function rn(e, t, n = "trigger") {
    let r = j.assign(e, t, n);
    if (!r.ok) {
      Jt("Invalid MIDI hot key", r.error);
      return;
    }
    let { pitch: i, motifId: o, action: s } = r.assignment;
    (V(i, !1), M(), m("mapped", i, o, s));
  }
  function on(e) {
    let t = j.remove(e);
    if (t === void 0) {
      l(`Cannot unmap invalid MIDI note: ${String(e)}`);
      return;
    }
    (V(t, !1), M(), m("unmapped", t));
  }
  function sn() {
    for (let e of j.clear()) V(e, !1);
    (M(), m("map-cleared"));
  }
  function an() {
    for (let e of j.prune()) V(e, !1);
  }
  function tr(...e) {
    let t = Tt(e);
    if (t) {
      if (b.isDirty()) {
        (l("Finish or cancel editing before changing the library folder"), M());
        return;
      }
      if (t === g.path && (g.loaded || g.scanning)) {
        M();
        return;
      }
      (b.abandon(), g.selectPath(t));
    }
  }
  function cn(e) {
    if (b.isDirty() && !Be(e)) {
      (l("Unsaved edits must be saved or discarded before refreshing"), M());
      return;
    }
    (b.abandon(), g.load("library-refreshed"));
  }
  function nr(e) {
    let t = $t(e);
    if (t === void 0) {
      l(`Unknown tempo multiplier: ${String(e)}`);
      return;
    }
    ((z = t), S(), m("tempo-multiplier", z));
  }
  function un(...e) {
    ((ue = Et(e)), M(), m("filter", ue || "(all)"));
  }
  function dn(e = "chromatic") {
    if (g.scanning) {
      (l("Wait for the library scan to finish before importing a clip"), M());
      return;
    }
    if (b.isDirty()) {
      (l("Save or cancel the current edits before importing a clip"), M());
      return;
    }
    let t = String(e || "chromatic");
    if (t !== "scale" && t !== "chromatic" && t !== "hybrid") {
      l(`Unknown import pitch mode: ${t}`);
      return;
    }
    let n = Ut();
    if (!n) {
      l("No clip selected - open a MIDI clip in Detail View, then Import Clip");
      return;
    }
    let r = [];
    try {
      r = zt(n);
    } catch (u) {
      l(`Clip import failed: ${u instanceof Error ? u.message : String(u)}`);
      return;
    }
    if (r.length === 0) {
      l("Selected clip has no notes");
      return;
    }
    if (r.length > ee) {
      Jt(
        "MIDI file is too long",
        `The selected MIDI clip contains ${r.length} notes. Motif can import up to ${ee} editable notes. Shorten the clip or split it into smaller phrases, then import it again.`,
      );
      return;
    }
    let i = n.getstring("name"),
      o = String(Array.isArray(i) ? i[0] : i || "Imported Clip").trim() || "Imported Clip",
      s;
    try {
      s = ot(r, {
        id: "pending-import",
        name: o,
        pitchMode: t,
        scaleRootNote: h.rootNote,
        scaleIntervals: h.scaleIntervals,
        sourceMeter: { ...h.timeSignature },
        description: `Imported from Live clip \u201C${o}\u201D using ${t} relative analysis.`,
      });
    } catch (u) {
      l(`Clip import failed: ${u instanceof Error ? u.message : String(u)}`);
      return;
    }
    let a = d.currentId;
    b.isEditing() && ((a = b.cancel(d) ?? a), d.select(a));
    let c = g.uniqueId(o, `clip-${Date.now()}`);
    try {
      let u = { ...s, id: c },
        f = d.add(u);
      if (f.length > 0) {
        (d.select(a) || d.ensureCurrent(U), P(), l(f.join("; ")));
        return;
      }
      if (!b.begin(d, c, { dirty: !0, created: !0, sourceId: a })) {
        (d.remove(c),
          d.select(a) || d.ensureCurrent(U),
          l("Could not start editing the imported motif"),
          P());
        return;
      }
      (d.select(c), P(), m("imported-clip", c, r.length));
    } catch (u) {
      (d.remove(c),
        d.select(a) || d.ensureCurrent(U),
        b.abandon(),
        P(),
        l(`Clip import failed: ${u instanceof Error ? u.message : String(u)}`));
    }
  }
  function ln(e) {
    let t = Le();
    if (!t) return !1;
    let n = mt(t, e, { triggerPitch: pe, host: h });
    if (!n.ok) return (l(n.error), M(), !1);
    if (!n.changed) return !0;
    let r = d.update(n.value);
    return r.length > 0 ? (l(r.join("; ")), M(), !1) : (b.markDirty(), !0);
  }
  function fn(e) {
    if (e !== void 0 && !ln(e)) return;
    if (!g.path || !g.loaded) {
      l("Choose a valid library folder before saving");
      return;
    }
    let t = d.current;
    if (!t) {
      l("No motif selected");
      return;
    }
    if (!b.isEditing(t.id)) {
      (l("Start editing before saving"), M());
      return;
    }
    try {
      let n = g.save(t.id);
      (b.finishSave(), P(), m("saved", t.id, n));
    } catch (n) {
      let r = n instanceof Error ? n.message : String(n);
      (l(r.includes("already exists") ? `Save refused because ${r}` : `Save failed: ${r}`), M());
    }
  }
  function Le() {
    if (!d.current) {
      l("No motif selected");
      return;
    }
    let e = b.current(d);
    if (!e || e.id !== d.currentId) {
      (l("Start editing before changing this motif"), M());
      return;
    }
    return e;
  }
  function mn() {
    if (g.scanning) {
      (l("Wait for the library scan to finish before editing a motif"), M());
      return;
    }
    if (b.isEditing(d.currentId)) {
      M();
      return;
    }
    let e = d.current,
      t = e && d.isBuiltin(e.id) ? g.uniqueId(e.name, `${e.id}-copy`) : void 0,
      n = b.begin(d, d.currentId, t ? { targetId: t } : {});
    if (!n) {
      l("Could not start editing the selected motif");
      return;
    }
    (d.select(n.id), P(), m("editing", n.id, n.name));
  }
  function pn() {
    let e = b.cancel(d);
    if (!e) {
      M();
      return;
    }
    (d.select(e) || d.ensureCurrent(U), an(), P(), m("editing-cancelled", d.currentId));
  }
  function hn(e) {
    ln(e) && (S(), m("motif-edited", d.currentId));
  }
  function Ke(e, t) {
    let n = d.get(String(e));
    if (!n || n.id === d.currentId) return;
    if (b.isEditing()) {
      if (b.isDirty() && !Be(t)) {
        (l("Unsaved edits must be saved or discarded before selecting another motif"), M());
        return;
      }
      b.cancel(d);
    }
    let r = d.get(n.id);
    r &&
      (d.select(r.id),
      x("motif-selected", d.labels().get(r.id) ?? r.name),
      S(),
      m("Motif", r.name));
  }
  function rr(e, t, n) {
    let r = Le();
    if (!r) return !1;
    let i = pt(r, e, t, n);
    if (!i.ok) return (l(i.error), !1);
    let o = d.setNotes(r.id, i.notes);
    return o.length > 0
      ? (l(o.join("; ")), !1)
      : (b.markDirty(), S(), m("note-edited", e, t, i.statusValue ?? "unset"), !0);
  }
  function ir(e, t, n) {
    rr(Math.round(e), String(t), n);
  }
  function or() {
    let e = Le();
    if (!e) return;
    let t = ht(e, ee);
    if (!t.ok) {
      l(t.error);
      return;
    }
    let n = d.setNotes(e.id, t.notes);
    if (n.length > 0) {
      l(n.join("; "));
      return;
    }
    (b.markDirty(), S());
  }
  function sr(e) {
    let t = Le();
    if (!t) return;
    let n = Math.round(e);
    if (n < 0 || n >= t.notes.length) return;
    let r = gt(t, n);
    if (!r.ok) {
      l(r.error);
      return;
    }
    let i = d.setNotes(t.id, r.notes);
    if (i.length > 0) {
      l(i.join("; "));
      return;
    }
    (b.markDirty(), S());
  }
  function ar(...e) {
    let t = Q(e)
        .map((o) => A(o))
        .filter(Boolean),
      n = t[t.length - 1];
    if (!n) {
      l("lib_action: missing JSON payload");
      return;
    }
    let r;
    try {
      r = JSON.parse(decodeURIComponent(n));
    } catch {
      l(`lib_action: invalid JSON (${n.slice(0, 48)})`);
      return;
    }
    let i = A(r.type);
    switch (i) {
      case "select_browser":
        Ke(A(r.id), r.discardChanges);
        break;
      case "filter_motifs":
        un(r.query);
        break;
      case "import_clip":
        dn(r.pitchMode !== void 0 ? A(r.pitchMode) : void 0);
        break;
      case "save_motif":
        fn(r.properties);
        break;
      case "refresh_library":
        cn(r.discardChanges);
        break;
      case "map_trigger":
        rn(typeof r.pitch == "number" ? r.pitch : A(r.pitch), A(r.motifId), A(r.action, "trigger"));
        break;
      case "unmap_trigger":
        on(typeof r.pitch == "number" ? r.pitch : A(r.pitch));
        break;
      case "clear_trigger_map":
        sn();
        break;
      case "begin_edit":
        mn();
        break;
      case "cancel_edit":
        pn();
        break;
      case "edit_motif":
        hn(r.properties);
        break;
      case "add_note":
        or();
        break;
      case "remove_note":
        sr(Number(r.index));
        break;
      case "edit_note_at":
        ir(Number(r.index), A(r.field), r.value);
        break;
      default:
        l(`lib_action: unknown type ${i}`);
    }
  }
  function cr() {
    (Ye(), he(), m("panic"));
  }
  function ur() {
    x("context", h.tempo, h.rootNote, h.scaleName, ...h.scaleIntervals);
  }
  var dr = {
    initialize: Hn,
    preview_ready: Kt,
    library_ready: M,
    library_prepare: Bn,
    web_debug: At,
    note: zn,
    cc: en,
    sustain: jn,
    motif: Vn,
    pitch_mode: Gn,
    invert: tn,
    invert_toggle: qn,
    reverse: nn,
    reverse_toggle: Qn,
    meter_mode: Yn,
    retrigger: Jn,
    trigger_mode: Kn,
    launch_quantization: Wn,
    pass_through: Xn,
    trigger_low: Zn,
    trigger_high: er,
    map_trigger: rn,
    unmap_trigger: on,
    clear_trigger_map: sn,
    library_path: tr,
    refresh_library: cn,
    tempo_multiplier: nr,
    filter_motifs: un,
    import_clip: dn,
    save_motif: fn,
    begin_edit: mn,
    cancel_edit: pn,
    edit_motif: hn,
    select_browser: Ke,
    lib_action: ar,
    panic: cr,
    list_motifs: P,
    dump_context: ur,
    song_context: Fn,
  };
  function lr(e, t) {
    let n = dr[e];
    if (!n) {
      l(`Unknown message: ${e}`);
      return;
    }
    n(...t);
  }
  return kn(fr);
})();
