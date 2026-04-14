function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeMailboxIds(values = []) {
  return Array.from(
    new Set(
      asArray(values)
        .map((item) => normalizeText(item).toLowerCase())
        .filter(Boolean)
    )
  );
}

function normalizeFolderTypes(values = []) {
  return Array.from(
    new Set(
      asArray(values)
        .map((item) => normalizeText(item).toLowerCase())
        .filter((item) => ['inbox', 'sent', 'drafts', 'deleted'].includes(item))
    )
  );
}

function clampInt(value, min, max, fallback) {
  const parsed = Math.floor(Number(value));
  if (!Number.isFinite(parsed)) return fallback;
  if (parsed < min) return min;
  if (parsed > max) return max;
  return parsed;
}

function nowIso() {
  return new Date().toISOString();
}

function toAccountStatus(statusByFolderType = {}) {
  const values = Object.values(statusByFolderType || {});
  if (values.includes('BROKEN')) return 'BROKEN';
  if (values.includes('PARTIAL')) return 'PARTIAL';
  if (values.includes('NOT VERIFIED')) return 'NOT VERIFIED';
  return values.length > 0 ? 'VERIFIED' : 'NOT VERIFIED';
}

function createMicrosoftGraphMailboxTruthBackfill({
  connectorFactory,
  store,
  now = () => Date.now(),
} = {}) {
  if (typeof connectorFactory !== 'function') {
    throw new Error('microsoftGraphMailboxTruthBackfill connectorFactory saknas.');
  }
  if (!store || typeof store.startBackfillRun !== 'function' || typeof store.recordFolderPage !== 'function') {
    throw new Error('microsoftGraphMailboxTruthBackfill kräver ett giltigt mailbox truth store.');
  }

  async function runBackfill(options = {}) {
    const mailboxIds = normalizeMailboxIds(options.mailboxIds);
    const folderTypes = normalizeFolderTypes(options.folderTypes || ['inbox', 'sent', 'drafts', 'deleted']);
    if (mailboxIds.length === 0) {
      throw new Error('microsoftGraphMailboxTruthBackfill kräver minst ett mailboxId.');
    }
    const includeRead = options.includeRead !== false;
    const sinceIso = normalizeText(options.sinceIso) || '2000-01-01T00:00:00.000Z';
    const untilIso = normalizeText(options.untilIso) || '';
    const pageSize = clampInt(options.pageSize, 1, 500, 500);
    const maxPagesPerFolder = clampInt(options.maxPagesPerFolder, 1, 10000, 1000);
    const mailboxTimeoutMs = clampInt(options.mailboxTimeoutMs, 1000, 15000, 15000);
    const requestMaxRetries = clampInt(options.requestMaxRetries, 0, 6, 2);
    const retryBaseDelayMs = clampInt(options.retryBaseDelayMs, 100, 10000, 500);
    const retryMaxDelayMs = clampInt(options.retryMaxDelayMs, 200, 30000, 5000);
    const resume = options.resume === true;

    const run = await store.startBackfillRun({
      mailboxIds,
      folderTypes,
      mode: 'mailbox_truth_backfill',
    });

    const perMailbox = [];

    try {
      for (const mailboxId of mailboxIds) {
        const connector = connectorFactory(mailboxId);
        const mailboxStatus = {
          mailboxId,
          startedAt: nowIso(),
          folderReports: [],
        };

        for (const folderType of folderTypes) {
          if (!resume) {
            await store.resetFolder(mailboxId, folderType);
          }
          let folderState = resume ? store.getFolderState(mailboxId, folderType) : null;
          let nextPageUrl = normalizeText(folderState?.nextPageUrl) || null;
          let folderMetadata =
            folderState && folderState.folderId
              ? {
                  folderId: folderState.folderId,
                  folderName: folderState.folderName,
                  wellKnownName: folderState.wellKnownName,
                  totalItemCount: folderState.totalItemCount,
                  unreadItemCount: folderState.unreadItemCount,
                }
              : null;

          let pagesFetched = 0;
          let lastPersistedFolder = folderState || null;
          let lastError = null;

          while (pagesFetched < maxPagesPerFolder) {
            try {
              const payload = await connector.fetchMailboxTruthFolderPage({
                userId: mailboxId,
                mailboxId,
                mailboxAddress: mailboxId,
                userPrincipalName: mailboxId,
                folderType,
                nextPageUrl,
                folderMetadata,
                includeRead,
                sinceIso,
                untilIso,
                pageSize,
                mailboxTimeoutMs,
                requestMaxRetries,
                retryBaseDelayMs,
                retryMaxDelayMs,
              });
              pagesFetched += 1;
              folderMetadata = payload.folder;
              nextPageUrl = normalizeText(payload?.page?.nextPageUrl) || null;
              lastPersistedFolder = await store.recordFolderPage({
                runId: run.runId,
                account: payload.account,
                folder: payload.folder,
                messages: payload.messages,
                nextPageUrl,
                sourcePageUrl: payload?.page?.sourcePageUrl,
                pageSize,
                complete: payload?.page?.complete === true,
              });
              if (payload?.page?.complete === true) break;
            } catch (error) {
              lastError = error;
              lastPersistedFolder = await store.recordFolderError({
                runId: run.runId,
                account: {
                  mailboxId,
                  mailboxAddress: mailboxId,
                  userPrincipalName: mailboxId,
                },
                folderType,
                errorCode: normalizeText(error?.code) || 'fetch_error',
                errorMessage: normalizeText(error?.message) || 'request_failed',
              });
              break;
            }
          }

          if (!lastError && pagesFetched >= maxPagesPerFolder && normalizeText(nextPageUrl)) {
            lastPersistedFolder = await store.recordFolderPage({
              runId: run.runId,
              account: {
                mailboxId,
                mailboxAddress: mailboxId,
                userPrincipalName: mailboxId,
              },
              folder: {
                ...(folderMetadata || {}),
                folderType,
              },
              messages: [],
              nextPageUrl,
              sourcePageUrl: '',
              pageSize,
              complete: false,
            });
          }

          mailboxStatus.folderReports.push({
            folderType,
            pagesFetched,
            status: normalizeText(lastPersistedFolder?.completenessStatus) || 'NOT VERIFIED',
            reasonCode: normalizeText(lastPersistedFolder?.completenessReason) || 'unknown',
            detail: normalizeText(lastPersistedFolder?.completenessDetail) || '',
            materializedMessageCount: Number(lastPersistedFolder?.materializedMessageCount || 0),
            totalItemCount: Number(lastPersistedFolder?.totalItemCount || 0),
          });
        }

        mailboxStatus.completedAt = nowIso();
        mailboxStatus.accountStatus = toAccountStatus(
          Object.fromEntries(
            mailboxStatus.folderReports.map((entry) => [entry.folderType, entry.status])
          )
        );
        perMailbox.push(mailboxStatus);
      }

      await store.finishBackfillRun(run.runId, { status: 'completed' });
    } catch (error) {
      await store.finishBackfillRun(run.runId, {
        status: 'failed',
        error: normalizeText(error?.message) || 'unknown_backfill_error',
      });
      throw error;
    }

    return {
      runId: run.runId,
      startedAt: run.startedAt,
      completedAt: nowIso(),
      mailboxIds,
      folderTypes,
      pageSize,
      maxPagesPerFolder,
      perMailbox,
      elapsedMs: Math.max(0, Number(now()) - Date.parse(run.startedAt)),
      completeness: store.getCompletenessReport({ mailboxIds }),
    };
  }

  return {
    runBackfill,
  };
}

module.exports = {
  createMicrosoftGraphMailboxTruthBackfill,
};
