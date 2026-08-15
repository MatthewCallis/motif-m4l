import { scanText, type ScanOptions } from "./text-unicode.ts";

const DEFAULT_OPTIONS: Required<ScanOptions> = {
  aggressive: true,
  normalizeSpaces: true,
  stripEmojiGlue: false,
};

/**
 * Flag invisible Unicode, space homoglyphs, and Latin confusables.
 * Tables match watermarks-remover `text_unicode.py` Layer A.
 */
export const noInvisible = {
  meta: {
    type: "problem" as const,
    docs: {
      description:
        "Disallow invisible Unicode, space homoglyphs, and Latin confusables (watermark / stego carriers).",
    },
    fixable: "code" as const,
    schema: [
      {
        type: "object",
        properties: {
          aggressive: { type: "boolean" },
          normalizeSpaces: { type: "boolean" },
          stripEmojiGlue: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
    defaultOptions: [DEFAULT_OPTIONS],
    messages: {
      invisible: "Invisible or homoglyph Unicode ({{kind}}): {{label}}.",
    },
  },
  create(context: {
    options: readonly unknown[];
    sourceCode: {
      text: string;
      getLocFromIndex: (index: number) => { line: number; column: number };
    };
    report: (diagnostic: {
      loc: { start: { line: number; column: number }; end: { line: number; column: number } };
      messageId: "invisible";
      data: { kind: string; label: string };
      fix: (fixer: {
        removeRange: (range: [number, number]) => unknown;
        replaceTextRange: (range: [number, number], text: string) => unknown;
      }) => unknown;
    }) => void;
  }) {
    const options = readOptions(context.options);
    return {
      Program() {
        const { sourceCode } = context;
        for (const hit of scanText(sourceCode.text, options)) {
          context.report({
            loc: {
              start: sourceCode.getLocFromIndex(hit.index),
              end: sourceCode.getLocFromIndex(hit.endIndex),
            },
            messageId: "invisible",
            data: { kind: hit.kind, label: hit.label },
            fix(fixer) {
              if (hit.action === "strip") {
                return fixer.removeRange([hit.index, hit.endIndex]);
              }
              return fixer.replaceTextRange([hit.index, hit.endIndex], hit.replacement);
            },
          });
        }
      },
    };
  },
};

/**
 * Merge rule options onto Layer A defaults.
 * @param {readonly unknown[]} options ESLint rule options.
 * @returns {Required<ScanOptions>} Resolved scan options.
 */
function readOptions(options: readonly unknown[]): Required<ScanOptions> {
  const raw = options[0];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ...DEFAULT_OPTIONS };
  }
  const obj = raw as Record<string, unknown>;
  let aggressive = DEFAULT_OPTIONS.aggressive;
  if (typeof obj["aggressive"] === "boolean") {
    aggressive = obj["aggressive"];
  }
  let normalizeSpaces = DEFAULT_OPTIONS.normalizeSpaces;
  if (typeof obj["normalizeSpaces"] === "boolean") {
    normalizeSpaces = obj["normalizeSpaces"];
  }
  let stripEmojiGlue = DEFAULT_OPTIONS.stripEmojiGlue;
  if (typeof obj["stripEmojiGlue"] === "boolean") {
    stripEmojiGlue = obj["stripEmojiGlue"];
  }
  return { aggressive, normalizeSpaces, stripEmojiGlue };
}
