const fs = require('node:fs/promises');
const path = require('node:path');

const { pruneBackups } = require('./stateBackup');
const { pruneSchedulerPilotReports } = require('./pilotReports');

const TMP_FILE_PATTERN = /\.tmp$/i;

function asDirectory(value) {
  if (typeof value !== 'string') return '';
  const normalized = value.trim();
  return normalized ? path.resolve(normalized) : '';
}

function buildDirectorySet(config = {}) {
  const unique = new Set();
  const candidates = [config.stateRoot, config.backupDir, config.reportsDir];
  for (const candidate of candidates) {
    const absolute = asDirectory(candidate);
    if (absolute) unique.add(absolute);
  }
  return [...unique];
}

async function pruneTempFilesInDirectory({
  directoryPath,
  olderThanMs = 5 * 60 * 1000,
}) {
  const nowMs = Date.now();
  const deleted = [];
  await fs.mkdir(directoryPath, { recursive: true });
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!TMP_FILE_PATTERN.test(entry.name)) continue;
    const filePath = path.join(directoryPath, entry.name);
    let stat = null;
    try {
      stat = await fs.stat(filePath);
    } catch {
      continue;
    }
    if (!stat) continue;
    const ageMs = nowMs - Number(stat.mtimeMs || 0);
    if (ageMs < olderThanMs) continue;
    try {
      await fs.unlink(filePath);
      deleted.push({
        directoryPath,
        fileName: entry.name,
        filePath,
        sizeBytes: Number(stat.size || 0),
      });
    } catch {
      // Ignore in startup guard; a concurrent process may have removed the file.
    }
  }
  return deleted;
}

async function runStartupDiskGuard({ config, logger = console } = {}) {
  const summary = {
    startedAt: new Date().toISOString(),
    backupPrune: null,
    reportPrune: null,
    tempFiles: {
      scannedDirectories: [],
      deletedCount: 0,
      reclaimedBytes: 0,
      deleted: [],
    },
    reclaimedBytes: 0,
    errors: [],
  };
  if (!config || typeof config !== 'object') {
    summary.errors.push({ scope: 'startup_disk_guard', message: 'config saknas' });
    return summary;
  }

  try {
    summary.backupPrune = await pruneBackups({
      backupDir: config.backupDir,
      maxFiles: config.backupRetentionMaxFiles,
      maxAgeDays: config.backupRetentionMaxAgeDays,
      dryRun: false,
    });
    summary.reclaimedBytes += (summary.backupPrune.deleted || []).reduce(
      (acc, item) => acc + Number(item?.sizeBytes || 0),
      0
    );
  } catch (error) {
    summary.errors.push({
      scope: 'backup_prune',
      message: error?.message || 'backup prune failed',
      code: error?.code || null,
    });
  }

  try {
    summary.reportPrune = await pruneSchedulerPilotReports({
      reportsDir: config.reportsDir,
      maxFiles: config.reportRetentionMaxFiles,
      maxAgeDays: config.reportRetentionMaxAgeDays,
      dryRun: false,
    });
    summary.reclaimedBytes += (summary.reportPrune.deleted || []).reduce(
      (acc, item) => acc + Number(item?.sizeBytes || 0),
      0
    );
  } catch (error) {
    summary.errors.push({
      scope: 'report_prune',
      message: error?.message || 'report prune failed',
      code: error?.code || null,
    });
  }

  const directories = buildDirectorySet(config);
  for (const directoryPath of directories) {
    try {
      const deleted = await pruneTempFilesInDirectory({ directoryPath });
      summary.tempFiles.scannedDirectories.push(directoryPath);
      summary.tempFiles.deleted.push(...deleted);
      summary.tempFiles.deletedCount += deleted.length;
      summary.tempFiles.reclaimedBytes += deleted.reduce(
        (acc, item) => acc + Number(item?.sizeBytes || 0),
        0
      );
    } catch (error) {
      summary.errors.push({
        scope: 'temp_prune',
        directoryPath,
        message: error?.message || 'temp prune failed',
        code: error?.code || null,
      });
    }
  }

  summary.reclaimedBytes += Number(summary.tempFiles.reclaimedBytes || 0);
  summary.finishedAt = new Date().toISOString();

  if (
    Number(summary.reclaimedBytes || 0) > 0 ||
    Number(summary.tempFiles.deletedCount || 0) > 0 ||
    summary.errors.length > 0
  ) {
    const reclaimedMb = Number((Number(summary.reclaimedBytes || 0) / (1024 * 1024)).toFixed(2));
    logger?.warn?.(
      `[startup-disk-guard] reclaimed=${reclaimedMb}MB backupsDeleted=${
        summary.backupPrune?.deletedCount || 0
      } reportsDeleted=${summary.reportPrune?.deletedCount || 0} tmpDeleted=${
        summary.tempFiles.deletedCount
      } errors=${summary.errors.length}`
    );
  }

  return summary;
}

module.exports = {
  runStartupDiskGuard,
};
