import { RuleTester } from "oxlint/plugins-dev";
import { describe, it } from "vitest";
import { noInvisible } from "../../scripts/eslint-plugin-unicode/no-invisible.js";

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({ languageOptions: { parserOptions: { lang: "ts" } } });

const zwsp = String.fromCodePoint(0x200b);
const nbsp = String.fromCodePoint(0x00a0);
const cyrillicA = String.fromCodePoint(0x0430);
const zwj = String.fromCodePoint(0x200d);
const man = String.fromCodePoint(0x1f468);

ruleTester.run("no-invisible", noInvisible as Parameters<RuleTester["run"]>[1], {
  valid: [
    "const name = 'hello world';",
    `const family = '${man}${zwj}${man}';`,
    {
      name: "confusables allowed when aggressive is off",
      code: `const name = '${cyrillicA}';`,
      options: [{ aggressive: false }],
    },
    {
      name: "nbsp allowed when normalizeSpaces is off",
      code: `const name = 'hello${nbsp}world';`,
      options: [{ normalizeSpaces: false }],
    },
  ],
  invalid: [
    {
      name: "zero-width space",
      code: `const name = 'hello${zwsp}world';`,
      output: "const name = 'helloworld';",
      errors: [
        {
          messageId: "invisible",
          data: { kind: "zwj_family", label: "U+200B ZERO WIDTH SPACE" },
          line: 1,
          column: 19,
        },
      ],
    },
    {
      name: "no-break space",
      code: `const name = 'hello${nbsp}world';`,
      output: "const name = 'hello world';",
      errors: [
        {
          messageId: "invisible",
          data: { kind: "space", label: "U+00A0 NO-BREAK SPACE" },
        },
      ],
    },
    {
      name: "Cyrillic lookalike",
      code: `const name = '${cyrillicA}pple';`,
      output: "const name = 'apple';",
      errors: [
        {
          messageId: "invisible",
          data: { kind: "confusable", label: "U+0430" },
        },
      ],
    },
    {
      name: "free-floating ZWJ",
      code: `const name = 'a${zwj}b';`,
      output: "const name = 'ab';",
      errors: [
        { messageId: "invisible", data: { kind: "zwj_family", label: "U+200D ZERO WIDTH JOINER" } },
      ],
    },
  ],
});
