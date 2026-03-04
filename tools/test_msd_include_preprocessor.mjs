import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { preprocessMsdIncludes, MsdIncludeError } from '../msdIncludePreprocessor.mjs';

async function withFixture(files, callback) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'msd-include-'));
  try {
    for (const [rel, content] of Object.entries(files)) {
      const abs = path.join(root, rel);
      await fs.mkdir(path.dirname(abs), { recursive: true });
      await fs.writeFile(abs, content, 'utf8');
    }
    const readFile = (target) => fs.readFile(path.join(root, target), 'utf8');
    await callback({ root, readFile });
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
}

test('単純 include', async () => {
  await withFixture({
    'main.msd': 'meta:\n  title: Main\n#include "parts/common.msd"\npanel:\n  id: p1\n',
    'parts/common.msd': 'actor:\n  id: hero\n  panel: p1\n',
  }, async ({ readFile }) => {
    const expanded = await preprocessMsdIncludes('main.msd', { readFile, projectRoot: '.' });
    assert.match(expanded, /title: Main/);
    assert.match(expanded, /actor:/);
  });
});

test('多段 include', async () => {
  await withFixture({
    'main.msd': '#include "a.msd"\n',
    'a.msd': '#include "b.msd"\n',
    'b.msd': 'meta:\n  title: nested\n',
  }, async ({ readFile }) => {
    const expanded = await preprocessMsdIncludes('main.msd', { readFile, projectRoot: '.' });
    assert.match(expanded, /title: nested/);
  });
});

test('存在しない include でエラー', async () => {
  await withFixture({
    'main.msd': '#include "missing/file.msd"\n',
  }, async ({ readFile }) => {
    await assert.rejects(
      () => preprocessMsdIncludes('main.msd', { readFile, projectRoot: '.' }),
      (error) => {
        assert.ok(error instanceof MsdIncludeError);
        assert.equal(error.details.type, 'not_found');
        assert.match(error.message, /includeチェーン/);
        return true;
      }
    );
  });
});

test('循環 include でエラー', async () => {
  await withFixture({
    'main.msd': '#include "a.msd"\n',
    'a.msd': '#include "main.msd"\n',
  }, async ({ readFile }) => {
    await assert.rejects(
      () => preprocessMsdIncludes('main.msd', { readFile, projectRoot: '.' }),
      (error) => {
        assert.ok(error instanceof MsdIncludeError);
        assert.equal(error.details.type, 'cycle');
        assert.match(error.message, /循環 include/);
        return true;
      }
    );
  });
});

test('相対パス優先、その次に projectRoot', async () => {
  await withFixture({
    'root/common.msd': 'meta:\n  title: root\n',
    'scenes/main.msd': '#include "common.msd"\n',
    'scenes/common.msd': 'meta:\n  title: local\n',
  }, async ({ readFile }) => {
    const expanded = await preprocessMsdIncludes('scenes/main.msd', { readFile, projectRoot: 'root' });
    assert.match(expanded, /title: local/);
    assert.doesNotMatch(expanded, /title: root/);
  });
});
