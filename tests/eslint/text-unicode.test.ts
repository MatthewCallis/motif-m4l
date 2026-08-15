import { describe, expect, it } from "vitest";
import {
  LATIN_CONFUSABLES,
  SPACE_HOMOGLYPHS,
  STRIP_CODEPOINTS,
  decide,
  scanText,
} from "../../scripts/eslint-plugin-unicode/text-unicode.js";

function hits(text: string, options?: Parameters<typeof scanText>[1]) {
  return [...scanText(text, options)];
}

describe("scanText tables", () => {
  it("flags every STRIP_CODEPOINTS entry when isolated", () => {
    for (const cp of STRIP_CODEPOINTS) {
      const ch = String.fromCodePoint(cp);
      const found = hits(`x${ch}y`);
      expect(found, `U+${cp.toString(16)}`).toHaveLength(1);
      expect(found[0]!.action).toBe("strip");
    }
  });

  it("replaces every SPACE_HOMOGLYPHS entry with a normal space", () => {
    for (const [cp, replacement] of SPACE_HOMOGLYPHS) {
      const ch = String.fromCodePoint(cp);
      const found = hits(`a${ch}b`);
      expect(found, `U+${cp.toString(16)}`).toHaveLength(1);
      expect(found[0]!.kind).toBe("space");
      expect(found[0]!.action).toBe("replace");
      expect(found[0]!.replacement).toBe(replacement);
    }
  });

  it("replaces every LATIN_CONFUSABLES entry when aggressive", () => {
    for (const [cp, replacement] of LATIN_CONFUSABLES) {
      const ch = String.fromCodePoint(cp);
      const found = hits(`x${ch}y`, { aggressive: true });
      expect(found, `U+${cp.toString(16)}`).toHaveLength(1);
      expect(found[0]!.kind).toBe("confusable");
      expect(found[0]!.replacement).toBe(replacement);
    }
  });

  it("keeps Latin confusables when aggressive is off", () => {
    const ch = String.fromCodePoint(0x0430);
    expect(hits(`x${ch}y`, { aggressive: false })).toEqual([]);
  });
});

describe("scanText kinds and glue", () => {
  it("classifies zero-width, bidi, and variation selectors", () => {
    expect(hits(`a${String.fromCodePoint(0x200b)}b`)[0]!.kind).toBe("zwj_family");
    expect(hits(`a${String.fromCodePoint(0x200e)}b`)[0]!.kind).toBe("bidi");
    expect(hits(`a${String.fromCodePoint(0xfe0f)}b`)[0]!.kind).toBe("variation_selector");
    expect(hits(`a${String.fromCodePoint(0x00ad)}b`)[0]!.kind).toBe("strip");
  });

  it("flags private-use, tag chars, and VS17+", () => {
    expect(hits(`a${String.fromCodePoint(0xe000)}b`)[0]!.kind).toBe("private_use");
    expect(hits(`a${String.fromCodePoint(0xe0001)}b`)[0]!.kind).toBe("tag_chars");
    expect(hits(`a${String.fromCodePoint(0xe0100)}b`)[0]!.kind).toBe("variation_selector");
  });

  it("keeps ZWJ after an emoji base and flags a free-floating ZWJ", () => {
    const zwj = String.fromCodePoint(0x200d);
    const man = String.fromCodePoint(0x1f468);
    expect(hits(`${man}${zwj}${man}`)).toEqual([]);
    expect(hits(`a${zwj}b`)).toHaveLength(1);
  });

  it("keeps orthographic Arabic Cf marks", () => {
    expect(hits(`n${String.fromCodePoint(0x0600)}1`)).toEqual([]);
  });

  it("strips remaining format characters as other_cf", () => {
    const found = hits(`a${String.fromCodePoint(0x00ad)}b`);
    expect(found[0]!.kind).toBe("strip");
    const other = decide(String.fromCodePoint(0x13430), null);
    expect(other).toMatchObject({ action: "strip", kind: "other_cf" });
  });

  it("tracks UTF-16 offsets across a supplementary-plane emoji", () => {
    const man = String.fromCodePoint(0x1f468);
    const zwsp = String.fromCodePoint(0x200b);
    const text = `${man}${zwsp}`;
    const found = hits(text);
    expect(found).toHaveLength(1);
    expect(found[0]!.index).toBe(man.length);
    expect(found[0]!.endIndex).toBe(text.length);
  });
});
