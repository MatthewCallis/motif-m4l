/**
 * Layer A invisible Unicode / homoglyph detection.
 * Tables and keep/strip/replace rules match
 * https://github.com/guillaumemeyer/watermarks-remover/blob/main/service/scripts/text_unicode.py
 */

const FORMAT_RE = /\p{Cf}/u;
const LETTER_RE = /\p{L}/u;
const MARK_RE = /\p{M}/u;

/** Format / invisible controls commonly used for steganography or broken pastes. */
export const STRIP_CODEPOINTS: ReadonlySet<number> = new Set([
  0x00ad, // soft hyphen
  0x034f, // combining grapheme joiner
  0x061c, // Arabic letter mark
  0x115f, // Hangul choseong filler
  0x1160, // Hangul jungseong filler
  0x17b4, // Khmer vowel inherent AQ
  0x17b5, // Khmer vowel inherent AA
  0x180b, // Mongolian free variation selector-1
  0x180c,
  0x180d,
  0x180e, // Mongolian vowel separator
  0x200b, // zero width space
  0x200c, // zero width non-joiner
  0x200d, // zero width joiner
  0x200e, // LRM
  0x200f, // RLM
  0x202a, // LRE
  0x202b, // RLE
  0x202c, // PDF
  0x202d, // LRO
  0x202e, // RLO
  0x2060, // word joiner
  0x2061, // function application
  0x2062, // invisible times
  0x2063, // invisible separator
  0x2064, // invisible plus
  0x2066, // LRI
  0x2067, // RLI
  0x2068, // FSI
  0x2069, // PDI
  0x206a, // inhibit symmetric swapping
  0x206b,
  0x206c,
  0x206d,
  0x206e,
  0x206f,
  0xfeff, // BOM / ZWNBSP
  0xfe00, // variation selectors
  0xfe01,
  0xfe02,
  0xfe03,
  0xfe04,
  0xfe05,
  0xfe06,
  0xfe07,
  0xfe08,
  0xfe09,
  0xfe0a,
  0xfe0b,
  0xfe0c,
  0xfe0d,
  0xfe0e,
  0xfe0f,
  0xfff9, // interlinear annotation
  0xfffa,
  0xfffb,
]);

/** Spaces that look like (or substitute for) U+0020. */
export const SPACE_HOMOGLYPHS: ReadonlyMap<number, string> = new Map([
  [0x00a0, " "], // no-break space
  [0x1680, " "], // Ogham space mark
  [0x2000, " "], // en quad
  [0x2001, " "], // em quad
  [0x2002, " "], // en space
  [0x2003, " "], // em space
  [0x2004, " "], // three-per-em space
  [0x2005, " "], // four-per-em space
  [0x2006, " "], // six-per-em space
  [0x2007, " "], // figure space
  [0x2008, " "], // punctuation space
  [0x2009, " "], // thin space
  [0x200a, " "], // hair space
  [0x202f, " "], // narrow no-break space
  [0x205f, " "], // medium mathematical space
  [0x3000, " "], // ideographic space
]);

/** Optional confusable Latin lookalikes (aggressive mode). */
export const LATIN_CONFUSABLES: ReadonlyMap<number, string> = new Map([
  [0x0410, "A"],
  [0x0412, "B"],
  [0x0415, "E"],
  [0x041a, "K"],
  [0x041c, "M"],
  [0x041d, "H"],
  [0x041e, "O"],
  [0x0420, "P"],
  [0x0421, "C"],
  [0x0422, "T"],
  [0x0425, "X"],
  [0x0430, "a"],
  [0x0435, "e"],
  [0x043e, "o"],
  [0x0440, "p"],
  [0x0441, "c"],
  [0x0443, "y"],
  [0x0445, "x"],
  [0x0456, "i"],
  [0xff21, "A"],
  [0xff22, "B"],
  [0xff23, "C"],
  [0xff24, "D"],
  [0xff25, "E"],
  [0xff26, "F"],
  [0xff27, "G"],
  [0xff28, "H"],
  [0xff29, "I"],
  [0xff2a, "J"],
  [0xff2b, "K"],
  [0xff2c, "L"],
  [0xff2d, "M"],
  [0xff2e, "N"],
  [0xff2f, "O"],
  [0xff30, "P"],
  [0xff31, "Q"],
  [0xff32, "R"],
  [0xff33, "S"],
  [0xff34, "T"],
  [0xff35, "U"],
  [0xff36, "V"],
  [0xff37, "W"],
  [0xff38, "X"],
  [0xff39, "Y"],
  [0xff3a, "Z"],
  [0xff41, "a"],
  [0xff42, "b"],
  [0xff43, "c"],
  [0xff44, "d"],
  [0xff45, "e"],
  [0xff46, "f"],
  [0xff47, "g"],
  [0xff48, "h"],
  [0xff49, "i"],
  [0xff4a, "j"],
  [0xff4b, "k"],
  [0xff4c, "l"],
  [0xff4d, "m"],
  [0xff4e, "n"],
  [0xff4f, "o"],
  [0xff50, "p"],
  [0xff51, "q"],
  [0xff52, "r"],
  [0xff53, "s"],
  [0xff54, "t"],
  [0xff55, "u"],
  [0xff56, "v"],
  [0xff57, "w"],
  [0xff58, "x"],
  [0xff59, "y"],
  [0xff5a, "z"],
]);

const BIDI_CPS: ReadonlySet<number> = new Set([
  0x061c, 0x200e, 0x200f, 0x202a, 0x202b, 0x202c, 0x202d, 0x202e, 0x2066, 0x2067, 0x2068, 0x2069,
]);

const ZW_FAMILY: ReadonlySet<number> = new Set([0x200b, 0x200c, 0x200d, 0x2060, 0xfeff, 0x180e]);

const EMOJI_GLUE_CODEPOINTS: ReadonlySet<number> = new Set([0x200d, 0xfe0e, 0xfe0f]);
const SCRIPT_JOINERS: ReadonlySet<number> = new Set([0x200c, 0x200d]);
const ORTHOGRAPHIC_CF: ReadonlySet<number> = new Set([
  0x0600, 0x0601, 0x0602, 0x0603, 0x0604, 0x0605, 0x06dd, 0x070f, 0x08e2, 0x110bd, 0x110cd,
]);
const MONGOLIAN_FVS: ReadonlySet<number> = new Set([0x180b, 0x180c, 0x180d]);
const KHMER_VOWELS: ReadonlySet<number> = new Set([0x17b4, 0x17b5]);
const HANGUL_FILLERS: ReadonlySet<number> = new Set([0x115f, 0x1160]);
const SCRIPT_GLUE: ReadonlySet<number> = new Set([
  ...MONGOLIAN_FVS,
  ...KHMER_VOWELS,
  ...HANGUL_FILLERS,
]);

const CODEPOINT_NAMES: ReadonlyMap<number, string> = new Map([
  [0x00a0, "NO-BREAK SPACE"],
  [0x00ad, "SOFT HYPHEN"],
  [0x034f, "COMBINING GRAPHEME JOINER"],
  [0x061c, "ARABIC LETTER MARK"],
  [0x115f, "HANGUL CHOSEONG FILLER"],
  [0x1160, "HANGUL JUNGSEONG FILLER"],
  [0x1680, "OGHAM SPACE MARK"],
  [0x17b4, "KHMER VOWEL INHERENT AQ"],
  [0x17b5, "KHMER VOWEL INHERENT AA"],
  [0x180b, "MONGOLIAN FREE VARIATION SELECTOR ONE"],
  [0x180c, "MONGOLIAN FREE VARIATION SELECTOR TWO"],
  [0x180d, "MONGOLIAN FREE VARIATION SELECTOR THREE"],
  [0x180e, "MONGOLIAN VOWEL SEPARATOR"],
  [0x2000, "EN QUAD"],
  [0x2001, "EM QUAD"],
  [0x2002, "EN SPACE"],
  [0x2003, "EM SPACE"],
  [0x2004, "THREE-PER-EM SPACE"],
  [0x2005, "FOUR-PER-EM SPACE"],
  [0x2006, "SIX-PER-EM SPACE"],
  [0x2007, "FIGURE SPACE"],
  [0x2008, "PUNCTUATION SPACE"],
  [0x2009, "THIN SPACE"],
  [0x200a, "HAIR SPACE"],
  [0x200b, "ZERO WIDTH SPACE"],
  [0x200c, "ZERO WIDTH NON-JOINER"],
  [0x200d, "ZERO WIDTH JOINER"],
  [0x200e, "LEFT-TO-RIGHT MARK"],
  [0x200f, "RIGHT-TO-LEFT MARK"],
  [0x202a, "LEFT-TO-RIGHT EMBEDDING"],
  [0x202b, "RIGHT-TO-LEFT EMBEDDING"],
  [0x202c, "POP DIRECTIONAL FORMATTING"],
  [0x202d, "LEFT-TO-RIGHT OVERRIDE"],
  [0x202e, "RIGHT-TO-LEFT OVERRIDE"],
  [0x202f, "NARROW NO-BREAK SPACE"],
  [0x205f, "MEDIUM MATHEMATICAL SPACE"],
  [0x2060, "WORD JOINER"],
  [0x2061, "FUNCTION APPLICATION"],
  [0x2062, "INVISIBLE TIMES"],
  [0x2063, "INVISIBLE SEPARATOR"],
  [0x2064, "INVISIBLE PLUS"],
  [0x2066, "LEFT-TO-RIGHT ISOLATE"],
  [0x2067, "RIGHT-TO-LEFT ISOLATE"],
  [0x2068, "FIRST STRONG ISOLATE"],
  [0x2069, "POP DIRECTIONAL ISOLATE"],
  [0x206a, "INHIBIT SYMMETRIC SWAPPING"],
  [0x206b, "ACTIVATE SYMMETRIC SWAPPING"],
  [0x206c, "INHIBIT ARABIC FORM SHAPING"],
  [0x206d, "ACTIVATE ARABIC FORM SHAPING"],
  [0x206e, "NATIONAL DIGIT SHAPES"],
  [0x206f, "NOMINAL DIGIT SHAPES"],
  [0x3000, "IDEOGRAPHIC SPACE"],
  [0xfeff, "ZERO WIDTH NO-BREAK SPACE"],
  [0xfff9, "INTERLINEAR ANNOTATION ANCHOR"],
  [0xfffa, "INTERLINEAR ANNOTATION SEPARATOR"],
  [0xfffb, "INTERLINEAR ANNOTATION TERMINATOR"],
]);

const VS_SUPPLEMENT_START = 0xe0100;
const VS_SUPPLEMENT_END = 0xe01ef;
const TAG_START = 0xe0001;
const TAG_END = 0xe007f;
const FLAG_TAG_START = 0xe0020;
const FLAG_TAG_END = 0xe007f;

/** Inspect classification from the Python Layer A kinds. */
export type UnicodeKind =
  | "strip"
  | "bidi"
  | "tag_chars"
  | "variation_selector"
  | "zwj_family"
  | "private_use"
  | "space"
  | "confusable"
  | "other_cf";

/** Options for {@link scanText} / {@link decide}. */
export interface ScanOptions {
  /** Flag Cyrillic / fullwidth Latin lookalikes. Default true. */
  aggressive?: boolean;
  /** Flag space homoglyphs. Default true. */
  normalizeSpaces?: boolean;
  /** Also strip load-bearing emoji/script glue. Default false. */
  stripEmojiGlue?: boolean;
}

/** Per-character keep / strip / replace decision. */
export type CharDecision =
  | { action: "keep"; outChar: string; kind: null }
  | { action: "strip"; outChar: ""; kind: UnicodeKind }
  | { action: "replace"; outChar: string; kind: UnicodeKind };

/** One flagged character in source text. */
export interface UnicodeHit {
  index: number;
  endIndex: number;
  codepoint: number;
  char: string;
  kind: UnicodeKind;
  action: "strip" | "replace";
  replacement: string;
  label: string;
}

/**
 * Human-readable U+XXXX label for a codepoint.
 * @param {number} cp Codepoint.
 * @returns {string} Label.
 */
export function charLabel(cp: number): string {
  const hex = cp.toString(16).toUpperCase().padStart(4, "0");
  const name = codepointName(cp);
  if (name) {
    return `U+${hex} ${name}`;
  }
  return `U+${hex}`;
}

/**
 * Classify one input character.
 * @param {string} ch Current character (one codepoint).
 * @param {string | null} prevKept Previous kept non-glue character.
 * @param {ScanOptions} options Scan options.
 * @returns {CharDecision} Decision.
 */
export function decide(
  ch: string,
  prevKept: string | null,
  options: ScanOptions = {},
): CharDecision {
  const aggressive = options.aggressive !== false;
  const normalizeSpaces = options.normalizeSpaces !== false;
  const stripEmojiGlue = options.stripEmojiGlue === true;
  const cp = ch.codePointAt(0);
  if (cp === undefined) {
    return { action: "keep", outChar: ch, kind: null };
  }

  if (
    !stripEmojiGlue &&
    isEmojiGlue(cp) &&
    prevKept !== null &&
    isEmojiBase(prevKept.codePointAt(0) ?? -1)
  ) {
    return { action: "keep", outChar: ch, kind: null };
  }

  if (!stripEmojiGlue) {
    if (SCRIPT_JOINERS.has(cp) && prevKept !== null && isJoiningLetter(prevKept)) {
      return { action: "keep", outChar: ch, kind: null };
    }
    if (isFlagTag(cp) && prevKept !== null && isEmojiBase(prevKept.codePointAt(0) ?? -1)) {
      return { action: "keep", outChar: ch, kind: null };
    }
    if (MONGOLIAN_FVS.has(cp) && prevKept !== null && isMongolianLetter(prevKept)) {
      return { action: "keep", outChar: ch, kind: null };
    }
    if (KHMER_VOWELS.has(cp) && prevKept !== null && isKhmerLetter(prevKept)) {
      return { action: "keep", outChar: ch, kind: null };
    }
    if (
      HANGUL_FILLERS.has(cp) &&
      prevKept !== null &&
      isHangulJamo(prevKept.codePointAt(0) ?? -1)
    ) {
      return { action: "keep", outChar: ch, kind: null };
    }
    if (ORTHOGRAPHIC_CF.has(cp)) {
      return { action: "keep", outChar: ch, kind: null };
    }
  }

  if (isStripCp(cp)) {
    return { action: "strip", outChar: "", kind: stripKind(cp) };
  }

  const space = SPACE_HOMOGLYPHS.get(cp);
  if (normalizeSpaces && space !== undefined) {
    return { action: "replace", outChar: space, kind: "space" };
  }

  const latin = LATIN_CONFUSABLES.get(cp);
  if (aggressive && latin !== undefined) {
    return { action: "replace", outChar: latin, kind: "confusable" };
  }

  if (FORMAT_RE.test(ch) && !SPACE_HOMOGLYPHS.has(cp)) {
    return { action: "strip", outChar: "", kind: "other_cf" };
  }

  return { action: "keep", outChar: ch, kind: null };
}

/**
 * Yield every suspicious character in `text`.
 * @param {string} text Source text.
 * @param {ScanOptions} [options] Scan options.
 * @yields {UnicodeHit} Hits in source order.
 * @returns {Generator<UnicodeHit>} Hits in source order.
 */
export function* scanText(text: string, options: ScanOptions = {}): Generator<UnicodeHit> {
  let prevKept: string | null = null;
  let index = 0;
  for (const ch of text) {
    const decision = decide(ch, prevKept, options);
    const cp = ch.codePointAt(0) ?? 0;
    if (decision.action === "keep") {
      if (!isGlue(cp)) {
        prevKept = decision.outChar;
      }
    } else if (decision.action === "replace") {
      yield {
        index,
        endIndex: index + ch.length,
        codepoint: cp,
        char: ch,
        kind: decision.kind,
        action: "replace",
        replacement: decision.outChar,
        label: charLabel(cp),
      };
      prevKept = decision.outChar;
    } else {
      yield {
        index,
        endIndex: index + ch.length,
        codepoint: cp,
        char: ch,
        kind: decision.kind,
        action: "strip",
        replacement: "",
        label: charLabel(cp),
      };
    }
    index += ch.length;
  }
}

/**
 * Resolve a Unicode name for known watermark / homoglyph codepoints.
 * @param {number} cp Codepoint.
 * @returns {string | undefined} Official-style name when known.
 */
function codepointName(cp: number): string | undefined {
  const named = CODEPOINT_NAMES.get(cp);
  if (named) {
    return named;
  }
  if (cp >= 0xfe00 && cp <= 0xfe0f) {
    return `VARIATION SELECTOR-${cp - 0xfe00 + 1}`;
  }
  if (cp >= VS_SUPPLEMENT_START && cp <= VS_SUPPLEMENT_END) {
    return `VARIATION SELECTOR-${cp - VS_SUPPLEMENT_START + 17}`;
  }
  if (cp >= TAG_START && cp <= TAG_END) {
    return "TAG CHARACTER";
  }
  if (isPrivateUse(cp)) {
    return "PRIVATE USE";
  }
  return undefined;
}

/**
 * Whether `cp` is a strip-class codepoint (tables + ranges).
 * @param {number} cp Codepoint.
 * @returns {boolean} True when the character is contraband unless glue-kept.
 */
function isStripCp(cp: number): boolean {
  if (STRIP_CODEPOINTS.has(cp)) {
    return true;
  }
  if (cp >= VS_SUPPLEMENT_START && cp <= VS_SUPPLEMENT_END) {
    return true;
  }
  if (cp >= TAG_START && cp <= TAG_END) {
    return true;
  }
  return isPrivateUse(cp);
}

/**
 * Finer inspect kind for a strip-class codepoint.
 * @param {number} cp Codepoint.
 * @returns {UnicodeKind} Kind label.
 */
function stripKind(cp: number): UnicodeKind {
  if (cp >= TAG_START && cp <= TAG_END) {
    return "tag_chars";
  }
  if (
    (cp >= VS_SUPPLEMENT_START && cp <= VS_SUPPLEMENT_END) ||
    (cp >= 0xfe00 && cp <= 0xfe0f) ||
    (cp >= 0x180b && cp <= 0x180d)
  ) {
    return "variation_selector";
  }
  if (BIDI_CPS.has(cp)) {
    return "bidi";
  }
  if (ZW_FAMILY.has(cp)) {
    return "zwj_family";
  }
  if (isPrivateUse(cp)) {
    return "private_use";
  }
  return "strip";
}

/**
 * BMP and supplementary private-use planes (Co: no portable meaning).
 * @param {number} cp Codepoint.
 * @returns {boolean} True for private-use.
 */
function isPrivateUse(cp: number): boolean {
  return (
    (cp >= 0xe000 && cp <= 0xf8ff) ||
    (cp >= 0xf0000 && cp <= 0xffffd) ||
    (cp >= 0x100000 && cp <= 0x10fffd)
  );
}

/**
 * Zero-width joiner and text/emoji variation selectors.
 * @param {number} cp Codepoint.
 * @returns {boolean} True for emoji glue.
 */
function isEmojiGlue(cp: number): boolean {
  return EMOJI_GLUE_CODEPOINTS.has(cp);
}

/**
 * Characters that can start or continue an emoji sequence.
 * @param {number} cp Codepoint.
 * @returns {boolean} True for an emoji base.
 */
function isEmojiBase(cp: number): boolean {
  if (cp >= 0x1f000 && cp <= 0x1faff) {
    return true;
  }
  if (cp >= 0x2600 && cp <= 0x27bf) {
    return true;
  }
  if (cp >= 0x2b00 && cp <= 0x2bff) {
    return true;
  }
  if (
    cp === 0x00a9 ||
    cp === 0x00ae ||
    cp === 0x2122 ||
    cp === 0x3030 ||
    cp === 0x303d ||
    cp === 0x3297 ||
    cp === 0x3299
  ) {
    return true;
  }
  if (cp === 0x0023 || cp === 0x002a || (cp >= 0x0030 && cp <= 0x0039)) {
    return true;
  }
  return false;
}

/**
 * Load-bearing invisible: emoji glue, script joiner, flag tag, or same-script filler.
 * @param {number} cp Codepoint.
 * @returns {boolean} True when this char should not become `prevKept`.
 */
function isGlue(cp: number): boolean {
  return isEmojiGlue(cp) || SCRIPT_JOINERS.has(cp) || isFlagTag(cp) || SCRIPT_GLUE.has(cp);
}

/**
 * Flag-emoji tag characters (U+E0020–U+E007F).
 * @param {number} cp Codepoint.
 * @returns {boolean} True for a flag tag.
 */
function isFlagTag(cp: number): boolean {
  return cp >= FLAG_TAG_START && cp <= FLAG_TAG_END;
}

/**
 * Non-ASCII letter/mark — the neighbour that makes a joiner orthographic.
 * @param {string} ch Previous kept character.
 * @returns {boolean} True for a joining letter.
 */
function isJoiningLetter(ch: string): boolean {
  const cp = ch.codePointAt(0);
  if (cp === undefined || cp <= 0x7f) {
    return false;
  }
  return LETTER_RE.test(ch) || MARK_RE.test(ch);
}

/**
 * Mongolian letter (for FVS glue).
 * @param {string} ch Previous kept character.
 * @returns {boolean} True for a Mongolian letter.
 */
function isMongolianLetter(ch: string): boolean {
  const cp = ch.codePointAt(0);
  if (cp === undefined || cp < 0x1800 || cp > 0x18af) {
    return false;
  }
  return LETTER_RE.test(ch);
}

/**
 * Khmer letter (for inherent-vowel glue).
 * @param {string} ch Previous kept character.
 * @returns {boolean} True for a Khmer letter.
 */
function isKhmerLetter(ch: string): boolean {
  const cp = ch.codePointAt(0);
  if (cp === undefined || cp < 0x1780 || cp > 0x17ff) {
    return false;
  }
  return LETTER_RE.test(ch);
}

/**
 * Hangul jamo (including extended blocks).
 * @param {number} cp Codepoint.
 * @returns {boolean} True for a Hangul jamo.
 */
function isHangulJamo(cp: number): boolean {
  return (
    (cp >= 0x1100 && cp <= 0x11ff) ||
    (cp >= 0xa960 && cp <= 0xa97c) ||
    (cp >= 0xd7b0 && cp <= 0xd7c6)
  );
}
