const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { runStartupDiskGuard } = require('../../src/ops/startupDiskGuard');

async function createFile(filePath, content = '{}') {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, 'utf8');
}

test('startup disk guard prunes backups/reports and clears stale tmp files', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'arcana-startup-disk-guard-'));
  const stateRoot = path.join(tempDir, 'state');
  const backupDir = path.join(stateRoot, 'backups');
  const reportsDir = path.join(stateRoot, 'reports');
  const authTmpPath = path.join(stateRoot, 'auth.json.1234.test.tmp');

  await createFile(path.join(backupDir, 'arcana-state-20260101-000001.json'));
  await createFile(path.join(backupDir, 'arcana-state-20260101-000002.json'));
  await createFile(path.join(backupDir, 'arcana-state-20260101-000003.json'));

  await createFile(path.join(reportsDir, 'Pilot_Scheduler_20260101-000001.json'));
  await createFile(path.join(reportsDir, 'Pilot_Scheduler_20260101-000002.json'));
  await createFile(path.join(reportsDir, 'Pilot_Scheduler_20260101-000003.json'));

  await createFile(authTmpPath, 'temporary');
  const staleAt = new Date(Date.now() - 10 * 60 * 1000);
  await fs.utimes(authTmpPath, staleAt, staleAt);

  const summary = await runStartupDiskGuard({
    config: {
      stateRoot,
      backupDir,
      reportsDir,
      backupRetentionMaxFiles: 1,
      backupRetentionMaxAgeDays: 365,
      reportRetentionMaxFiles: 1,
      reportRetentionMaxAgeDays: 365,
    },
    logger: {
      warn() {},
    },
  });

  assert.equal(summary.backupPrune.deletedCount, 2);
  assert.equal(summary.reportPrune.deletedCount, 2);
  assert.equal(summary.tempFiles.deletedCount >= 1, true);

  await assert.rejects(fs.stat(authTmpPath), (error) => error && error.code === 'ENOENT');
  await fs.rm(tempDir, { recursive: true, force: true });
});
