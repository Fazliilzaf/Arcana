const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { createCcoWorkspacePrefsStore } = require('../../src/ops/ccoWorkspacePrefsStore');

test('cco workspace prefs store sparar, läser och återställer panelbredder', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arcana-cco-workspace-prefs-'));
  const filePath = path.join(tempDir, 'cco-prefs.json');

  try {
    const store = await createCcoWorkspacePrefsStore({ filePath });

    const created = await store.saveWorkspacePrefs({
      tenantId: 'tenant-a',
      userId: 'owner-a',
      workspaceId: 'major-arcana-preview',
      leftWidth: 488,
      rightWidth: 404,
    });

    assert.equal(created.leftWidth, 488);
    assert.equal(created.rightWidth, 404);

    const fetched = await store.getWorkspacePrefs({
      tenantId: 'tenant-a',
      userId: 'owner-a',
      workspaceId: 'major-arcana-preview',
    });

    assert.equal(fetched.preferenceId, created.preferenceId);

    const reset = await store.resetWorkspacePrefs({
      tenantId: 'tenant-a',
      userId: 'owner-a',
      workspaceId: 'major-arcana-preview',
    });

    assert.equal(reset.reset, true);

    const afterReset = await store.getWorkspacePrefs({
      tenantId: 'tenant-a',
      userId: 'owner-a',
      workspaceId: 'major-arcana-preview',
    });

    assert.equal(afterReset, null);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});
