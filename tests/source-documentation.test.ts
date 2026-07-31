import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';
import * as ts from 'typescript';

const EXTRACTED_PUBLIC_MODULES = [
  'src/core/type-guards.ts',
  'src/library/motif-authoring.ts',
  'src/max/device-types.ts',
  'src/max/device-logic.ts',
  'src/max/hotkey-map.ts',
  'src/max/library-logic.ts',
  'src/max/library-protocol.ts',
  'src/max/library-view.ts',
  'src/max/live-api.ts',
  'src/max/max-helpers.ts',
  'src/max/user-library.ts',
] as const;

describe('extracted module documentation', () => {
  it('keeps JSDoc attached to every exported declaration', async () => {
    for (const filename of EXTRACTED_PUBLIC_MODULES) {
      const text = await readFile(filename, 'utf8');
      const source = ts.createSourceFile(
        filename,
        text,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TS,
      );

      for (const statement of source.statements) {
        const modifiers = ts.canHaveModifiers(statement)
          ? ts.getModifiers(statement)
          : undefined;
        const exported = modifiers?.some(
          (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
        );
        if (!exported) continue;

        const leadingText = text.slice(statement.getFullStart(), statement.getStart(source));
        assert.match(
          leadingText,
          /\/\*\*[\s\S]*\*\/\s*$/,
          `${filename}:${source.getLineAndCharacterOfPosition(statement.getStart(source)).line + 1} `
          + 'export is missing attached JSDoc',
        );
      }
    }
  });
});
