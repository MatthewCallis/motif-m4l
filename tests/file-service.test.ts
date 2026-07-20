import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

type DeleteHandler = (requestId: unknown, encodedPath: unknown) => Promise<void>;

async function loadService(unlink: (filename: string) => Promise<void>): Promise<{
  handler: DeleteHandler;
  outlets: unknown[][];
}> {
  const source = await readFile('max/motif-file-service.cjs', 'utf8');
  const outlets: unknown[][] = [];
  let handler: DeleteHandler | undefined;
  const maxApi = {
    addHandler(selector: string, next: DeleteHandler) {
      if (selector === 'delete_file') handler = next;
    },
    outlet(...values: unknown[]) {
      outlets.push(values);
    },
  };

  vm.runInNewContext(source, {
    require(id: string): unknown {
      if (id === 'max-api') return maxApi;
      if (id === 'node:fs/promises') return { unlink };
      throw new Error(`Unexpected require: ${id}`);
    },
    module: { exports: {} },
    exports: {},
    decodeURIComponent,
    encodeURIComponent,
    Error,
    Object,
    String,
  }, { filename: 'motif-file-service.cjs' });

  assert.ok(handler, 'delete_file handler must be registered');
  return { handler, outlets };
}

test('file service decodes and deletes the requested path', async () => {
  const deleted: string[] = [];
  const service = await loadService((filename) => { deleted.push(filename); return Promise.resolve(); });
  await service.handler('request-1', encodeURIComponent('/Motif Library/my motif.json'));
  assert.deepEqual(deleted, ['/Motif Library/my motif.json']);
  assert.deepEqual(service.outlets, [['file_delete_result', 'request-1', 1, '']]);
});

test('file service treats an already missing file as successful deletion', async () => {
  const service = await loadService(() => Promise.reject(Object.assign(new Error('missing'), { code: 'ENOENT' })));
  await service.handler('request-2', encodeURIComponent('/missing.json'));
  assert.equal(service.outlets[0]?.[0], 'file_delete_result');
  assert.equal(service.outlets[0]?.[2], 1);
});

test('file service returns encoded filesystem errors without deleting engine state', async () => {
  const service = await loadService(() => Promise.reject(Object.assign(new Error('permission denied'), { code: 'EACCES' })));
  await service.handler('request-3', encodeURIComponent('/protected.json'));
  assert.deepEqual(service.outlets, [[
    'file_delete_result',
    'request-3',
    0,
    encodeURIComponent('permission denied'),
  ]]);
});
