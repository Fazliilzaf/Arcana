'use strict';

/**
 * cmoRepoAdapter.js — repo-aware CMO-tool-execution + Receipt v2 (WP-009, DEL D/E/J).
 *
 * Ersätter den syntetiska stateRoot/cmo-content-piloten med en explicit allowlistad
 * repo-adapter: CMO → explicit approved repo ID → canonical GitHub source → isolerad
 * task-worktree. toolExecutor körs med readRoot=canonical, scratchRoot=worktree, så
 * canonical checkout förblir byte-identisk medan alla ändringar sker i worktreen.
 *
 * Ingen generell repo-discovery, ingen generisk shell, ingen commit/push/merge/deploy.
 */

const crypto = require('node:crypto');
const path = require('node:path');
const { resolveRepo: defaultResolveRepo, isAllowedCommand } = require('./cmoRepoRegistry');
const {
  ensureCanonicalCheckout,
  createTaskWorktree,
  getHeadSha,
  getChanges,
  getChangesDetailed,
  getContentSnapshotEntries,
  resolveTaskWorktreeDir,
  commitCandidate,
  isClean,
  isGitRepo,
} = require('./repoWorktree');
const { executeCmoTool } = require('./toolExecutor');
const { evaluateAction } = require('./actionGate');

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * WP-010 B-1 — content-bunden snapshot-hash. Bindar EXAKT kandidat-innehåll
 * (SHA-256 per fil + status + rename-source), inte bara changedFiles/diffstat.
 * Två materiellt olika kandidat-tillstånd får aldrig samma hash.
 */
function computeContentSnapshotHash({ baseSha, repoId, worktreeTaskId, action, resource, entries }) {
  const canonical = JSON.stringify({
    baseSha,
    repoId,
    worktreeTaskId,
    action,
    resource: resource || null,
    files: entries,
  });
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

// Säker preview-körning: exakt allowlist-match (argv-array) + execFile (INGEN shell).
function defaultPreviewRunner({ repo, worktreeDir, command }) {
  if (!isAllowedCommand(repo, command)) {
    return { ok: false, reason: 'command_not_allowed' };
  }
  try {
    const { execFileSync } = require('node:child_process');
    const [bin, ...cmdArgs] = command;
    const stdout = execFileSync(bin, cmdArgs, {
      cwd: worktreeDir,
      encoding: 'utf8',
      timeout: 120000,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { ok: true, command: command.join(' '), artifact: stdout.slice(0, 4000) };
  } catch (error) {
    return { ok: false, reason: 'preview_failed', detail: error?.message || 'okänt fel' };
  }
}

/**
 * WP-012 — receipt for an approval that is already EXECUTED (or was committed and
 * is being reconciled). The receipt binds approval id + approved snapshot hash +
 * the recorded execution commit SHA (never fabricated). Used by the idempotent
 * reconcile path and by the already-executed path.
 */
function receiptForExecuted(approval) {
  const sha = normalizeText(approval?.executionCommitSha) || null;
  return {
    ok: true,
    status: 'executed',
    approvalId: approval.id,
    approvalDecision: 'APPROVED',
    approver: approval.approvedBy || null,
    approvedSnapshotHash: approval.snapshotHash,
    executedAction: approval.action,
    executedAt: approval.executedAt || null,
    candidateCommit: sha,
    executionCommitSha: sha,
    repo: { repoId: approval.repoId, baseSha: approval.baseSha },
    taskId: approval.worktreeTaskId,
    changedFiles: Array.isArray(approval.changedFiles) ? approval.changedFiles : [],
    diffstat: approval.diffstat || '',
    diffstatLabel: approval.diffstat || '',
    canonicalIntegrity: 'PRISTINE',
  };
}

function createCmoRepoAdapter({
  canonicalRoot,
  worktreesRoot,
  resolveRepoFn = defaultResolveRepo,
  previewRunner = defaultPreviewRunner,
} = {}) {
  if (!canonicalRoot || !worktreesRoot) {
    throw new Error('canonicalRoot och worktreesRoot krävs för cmoRepoAdapter.');
  }

  function newTaskId() {
    return crypto.randomUUID();
  }

  const _tasks = new Map(); // taskId → { worktreeDir, baseSha, canonicalDir }

  /**
   * Kör ett repo-pilotjobb: resolve → canonical checkout → worktree → toolExecutor
   * → diffstat → Receipt v2. Returnerar receipt (ej HTTP) — routen ansvarar för svar.
   * Samma taskId återanvänder samma worktree (READ→DRAFT→PREVIEW i ett jobb).
   */
  function executeRepoTask({ repoId, tool, args = {}, actor = {}, tenantId = '', taskId = null } = {}) {
    const repo = resolveRepoFn(repoId);
    if (!repo) {
      return { ok: false, reason: 'unknown_repo', repoId: String(repoId || '') };
    }

    const canonicalDir = path.join(canonicalRoot, repo.repoId);
    const id = String(taskId || newTaskId());

    // B-2: validera + containa task-worktreen INNAN någon fs-mutation.
    const resolved = resolveTaskWorktreeDir({ worktreesRoot, canonicalDir, taskId: id });
    if (!resolved.ok) {
      return { ok: false, reason: resolved.reason, repoId: repo.repoId, taskId: id };
    }

    ensureCanonicalCheckout({ repo, canonicalDir });
    const baseSha = getHeadSha(canonicalDir);
    if (repo.canonicalHead && repo.canonicalHead !== baseSha) {
      // Fail-closed: canonical checkout har drivit från den verifierade HEAD:en.
      return { ok: false, reason: 'canonical_drift', repoId: repo.repoId, baseSha, expected: repo.canonicalHead };
    }

    let worktreeDir = _tasks.get(id)?.worktreeDir || null;
    if (!worktreeDir) {
      worktreeDir = createTaskWorktree({ canonicalDir, worktreesRoot, taskId: id, baseSha });
      _tasks.set(id, { worktreeDir, baseSha, canonicalDir });
    }

    const toolReceipt = executeCmoTool({
      context: {
        userId: actor.userId,
        tenantId,
        role: actor.role,
        agent: 'CMO',
        hasEntitlement: true,
        isDisabled: false,
      },
      tool,
      args,
      roots: { readRoot: canonicalDir, scratchRoot: worktreeDir },
    });

    let preview = toolReceipt.preview;
    if (tool === 'cmo.website.preview') {
      preview = previewRunner({ repo, worktreeDir, command: repo.previewCommands?.[0] || '' });
    }

    const changes = getChanges(worktreeDir, baseSha);
    const canonicalPristine = isClean(canonicalDir);
    const ok = toolReceipt.result?.ok !== false;

    return {
      ok,
      actor: actor.userId || null,
      tenant: tenantId || null,
      agent: 'CMO',
      repo: { repoId: repo.repoId, baseSha, canonicalHead: repo.canonicalHead || baseSha },
      taskId: id,
      worktree: worktreeDir,
      tools: toolReceipt.tools_requested,
      gateDecisions: toolReceipt.gate_decisions,
      filesRead: toolReceipt.resources_read,
      filesChanged: changes.changedFiles,
      diffstat: changes.diffstat,
      testsBuild: preview && preview.ok ? preview : null,
      preview,
      approvals: toolReceipt.approvals_requested,
      canonicalIntegrity: canonicalPristine ? 'PRISTINE' : 'MODIFIED',
      result: toolReceipt.result,
      status: !ok ? 'denied' : canonicalPristine ? 'ok' : 'canonical_modified',
    };
  }

  /** Resolver repo + worktree (återanvänder _tasks, fallback till disk). */
  function _resolveWorktree({ repoId, taskId }) {
    const repo = resolveRepoFn(repoId);
    if (!repo) return { error: 'unknown_repo' };
    const canonicalDir = path.join(canonicalRoot, repo.repoId);
    const id = String(taskId || newTaskId());

    // B-2: strikt task-id-validering + realpath-containment (fail closed) INNAN
    // någon git/fs-mutation — task_id får aldrig peka på canonical/utanför root.
    const resolved = resolveTaskWorktreeDir({ worktreesRoot, canonicalDir, taskId: id });
    if (!resolved.ok) return { error: resolved.reason };

    ensureCanonicalCheckout({ repo, canonicalDir });
    const baseSha = getHeadSha(canonicalDir);
    if (repo.canonicalHead && repo.canonicalHead !== baseSha) {
      return { error: 'canonical_drift', baseSha, expected: repo.canonicalHead };
    }
    let worktreeDir = _tasks.get(id)?.worktreeDir || null;
    if (!worktreeDir) {
      const diskCandidate = resolved.worktreeDir;
      if (isGitRepo(diskCandidate)) {
        worktreeDir = diskCandidate;
        _tasks.set(id, { worktreeDir, baseSha, canonicalDir });
      } else {
        worktreeDir = createTaskWorktree({ canonicalDir, worktreesRoot, taskId: id, baseSha });
        _tasks.set(id, { worktreeDir, baseSha, canonicalDir });
      }
    }
    return { repo, canonicalDir, baseSha, worktreeDir, taskId: id };
  }

  /**
   * WP-010 (DEL D/E): föreslå WRITE-candidate. Action Gate → REQUIRE_APPROVAL,
   * skapar en PENDING approval-request bunden till snapshot. Ingen execution här.
   */
  async function proposeWriteCandidate({ repoId, taskId, args = {}, actor = {}, tenantId = '', approvalStore = null } = {}) {
    const rt = _resolveWorktree({ repoId, taskId });
    if (rt.error) return { ok: false, reason: rt.error };

    const gate = evaluateAction({
      userId: actor.userId, tenantId, role: actor.role, agent: 'CMO',
      action: 'cmo.content.write_candidate', resource: args.path,
      hasEntitlement: true, isDisabled: false,
    });
    if (gate.decision !== 'REQUIRE_APPROVAL') {
      return { ok: false, reason: 'gate_not_require_approval', gate };
    }

    const changes = getChangesDetailed(rt.worktreeDir, rt.baseSha);
    let contentEntries;
    try {
      contentEntries = getContentSnapshotEntries(rt.worktreeDir);
    } catch (error) {
      // B-1 fail closed: en existerande kandidatfil kunde inte content-hashas.
      return { ok: false, reason: 'snapshot_content_unreadable', detail: error?.message || '' };
    }
    const snapshotHash = computeContentSnapshotHash({
      baseSha: rt.baseSha,
      repoId: rt.repo.repoId,
      worktreeTaskId: rt.taskId,
      action: 'cmo.content.write_candidate',
      resource: normalizeText(args.path) || null,
      entries: contentEntries,
    });

    let approvalId = null;
    if (approvalStore && typeof approvalStore.create === 'function') {
      const approval = await approvalStore.create({
        taskId: rt.taskId,
        actor: actor.userId,
        tenant: tenantId,
        agent: 'CMO',
        action: 'cmo.content.write_candidate',
        actionLevel: 'WRITE',
        repoId: rt.repo.repoId,
        resource: args.path,
        baseSha: rt.baseSha,
        worktreeTaskId: rt.taskId,
        summary: args.summary || 'Candidate draft redo för godkännande.',
        changedFiles: changes.changedFiles,
        diffstat: changes.diffstatLabel || changes.diffstat,
        approvalClass: gate.approval,
        snapshotHash,
      });
      approvalId = approval.id;
    }

    return {
      ok: false,
      status: 'pending_approval',
      approvalId,
      approvalClass: gate.approval,
      gate,
      repo: { repoId: rt.repo.repoId, baseSha: rt.baseSha },
      taskId: rt.taskId,
      changedFiles: changes.changedFiles,
      diffstat: changes.diffstat,
      diffstatLabel: changes.diffstatLabel,
      snapshotHash,
    };
  }

  /** Kärnkontroll: base SHA + snapshot-hash + changed files + canonical clean. */
  function checkCandidateSnapshot(approval) {
    const rt = _resolveWorktree({ repoId: approval.repoId, taskId: approval.worktreeTaskId });
    if (rt.error) return { ok: false, reason: rt.error };
    if (rt.baseSha !== approval.baseSha) return { ok: false, reason: 'base_sha_changed' };
    const changes = getChangesDetailed(rt.worktreeDir, rt.baseSha);
    let contentEntries;
    try {
      contentEntries = getContentSnapshotEntries(rt.worktreeDir);
    } catch {
      // B-1 fail closed: en existerande kandidatfil kunde inte content-hashas.
      return { ok: false, reason: 'snapshot_content_unreadable' };
    }
    const snapshotHash = computeContentSnapshotHash({
      baseSha: rt.baseSha,
      repoId: approval.repoId,
      worktreeTaskId: approval.worktreeTaskId,
      action: approval.action,
      resource: approval.resource,
      entries: contentEntries,
    });
    if (snapshotHash !== approval.snapshotHash) return { ok: false, reason: 'snapshot_mismatch' };
    if (JSON.stringify([...changes.changedFiles].sort()) !== JSON.stringify([...approval.changedFiles].sort())) {
      return { ok: false, reason: 'changed_files_mismatch' };
    }
    if (!isClean(rt.canonicalDir)) return { ok: false, reason: 'canonical_not_clean' };
    return { ok: true, rt, changes };
  }

  /**
   * WP-010 (DEL F/G) + WP-011: verifiera att ett APPROVED write_candidate fortfarande
   * är giltigt (TOCTOU) INNAN den irreversibla exekveringen. Returnerar
   * {ok, reason, context} utan att mutera något.
   *
   * WP-011 — freshness (canonical TTL) must hold AT THIS authority boundary,
   * i.e. immediately before commitCandidate. Authorization is NOT
   * status==='APPROVED' alone; it is APPROVED AND fresh AND snapshot-valid.
   * Single source: approvalStore.assertFresh (same helper as store.execute).
   */
  async function verifyWriteSnapshot(approvalId, approvalStore = null) {
    if (!approvalStore || typeof approvalStore.get !== 'function' || typeof approvalStore.assertFresh !== 'function') {
      return { ok: false, reason: 'approval_store_unavailable' };
    }
    const approval = await approvalStore.get(approvalId);
    if (!approval) return { ok: false, reason: 'approval_not_found' };
    if (approval.status !== 'APPROVED') return { ok: false, reason: `approval_status_${String(approval.status).toLowerCase()}` };
    if (approval.action !== 'cmo.content.write_candidate') return { ok: false, reason: 'not_write_candidate' };

    // WP-011 — fail-closed freshness check (expired/unprovable ⇒ deny).
    const fresh = approvalStore.assertFresh(approval);
    if (!fresh.ok) return fresh;

    const check = checkCandidateSnapshot(approval);
    if (!check.ok) return check;
    return { ok: true, approval, rt: check.rt, changes: check.changes };
  }

  /**
   * WP-012 (rebuilt on WP-010/WP-011): execute an APPROVED write_candidate with a
   * manual-retry-until-TTL lifecycle and idempotency by execution commit SHA.
   *
   * Frozen failure policy (Human Gate A):
   *   - a legitimate execution failure leaves the approval APPROVED and manually
   *     retryable while WP-011 freshness holds; NO automatic retry;
   *   - once TTL expires, retry is denied and a new approval is required.
   *
   * Idempotency invariant: one approval + one approved snapshot → at most one
   * candidate commit. commitCandidate is only reachable through verifyWriteSnapshot
   * (WP-010 snapshot re-validation + WP-011 freshness) and only when no
   * executionCommitSha is recorded yet.
   *
   * Ordering: verify → record attempt → commitCandidate → bind executionCommitSha
   * → finalize EXECUTED → success receipt. A failure after commit keeps the bound
   * SHA durable so a later manual retry reconciles instead of re-committing.
   */
  async function executeApprovedWrite({ approvalId, approvalStore = null }) {
    if (!approvalStore || typeof approvalStore.get !== 'function' || typeof approvalStore.assertFresh !== 'function') {
      return { ok: false, reason: 'approval_store_unavailable' };
    }

    const approval = await approvalStore.get(approvalId);
    if (!approval) return { ok: false, reason: 'approval_not_found' };

    // WP-012 §10 — only an APPROVED execution failure is retryable. EXECUTED is
    // already finalized (return the recorded commit as durable truth, no new
    // attempt, no new commit).
    if (approval.status === 'EXECUTED') {
      return receiptForExecuted(approval);
    }
    if (approval.status !== 'APPROVED') {
      return { ok: false, reason: `approval_status_${String(approval.status).toLowerCase()}` };
    }

    // WP-011 — canonical freshness at the execution authority boundary (fail closed).
    // Frozen WP-011 zero-side-effect contract: an expired direct-call attempt yields
    // no state mutation here (no attempt recording, no terminalization). Expired
    // APPROVED terminalization (WP-012 §11) happens on the route retry/read path.
    const fresh = approvalStore.assertFresh(approval);
    if (!fresh.ok) {
      return fresh;
    }

    // WP-012 §5/§8 — idempotency: if an execution commit is already recorded,
    // do NOT recommit. Reconcile/finalize the existing outcome and reuse the SHA.
    if (approval.executionCommitSha) {
      if (typeof approvalStore.recordAttempt === 'function') {
        await approvalStore.recordAttempt(approvalId, {});
      }
      const executed = await approvalStore.execute(approvalId);
      if (executed) return receiptForExecuted(executed);
      const recheck = await approvalStore.get(approvalId);
      if (recheck && recheck.status === 'EXECUTED') return receiptForExecuted(recheck);
      return { ok: false, reason: 'finalization_failed' };
    }

    // WP-010 + WP-011 — full authority verification (snapshot + worktree + canonical
    // clean) BEFORE any irreversible mutation. commitCandidate is only reachable here.
    const verified = await verifyWriteSnapshot(approvalId, approvalStore);
    if (!verified.ok) {
      // WP-012 §7 — failure BEFORE commit: record failure, remain retryable while
      // fresh, no EXECUTED / executedAt / executionCommitSha.
      if (typeof approvalStore.recordAttempt === 'function') {
        await approvalStore.recordAttempt(approvalId, { error: verified.reason });
      }
      return verified;
    }
    const { approval: a, rt } = verified;

    let candidateCommit;
    try {
      candidateCommit = commitCandidate(
        rt.worktreeDir,
        `candidate ${a.worktreeTaskId} approved by ${a.approvedBy || 'owner'}`
      );
    } catch (error) {
      // WP-012 §7 — commit failure is a failure BEFORE commit: truthful lastError,
      // no executionCommitSha, no EXECUTED, approval stays manually retryable.
      if (typeof approvalStore.recordAttempt === 'function') {
        await approvalStore.recordAttempt(approvalId, { error: 'commit_failed' });
      }
      return { ok: false, reason: 'commit_failed' };
    }

    // WP-012 §4 — record the (successful) attempt deterministically: clear any
    // previous error; increment is done exactly once per attempt.
    if (typeof approvalStore.recordAttempt === 'function') {
      await approvalStore.recordAttempt(approvalId, {});
    }

    // WP-012 §5 — bind the ACTUAL commit SHA to the approval BEFORE finalizing as
    // fully reconciled, so a later finalization failure stays recoverable.
    if (typeof approvalStore.bindExecutionCommit === 'function') {
      const bindRes = await approvalStore.bindExecutionCommit(approvalId, candidateCommit);
      if (!bindRes || bindRes.ok === false) {
        return { ok: false, reason: 'execution_commit_bind_failed' };
      }
    }

    // WP-012 §6 — finalize APPROVED → EXECUTED.
    const executed = await approvalStore.execute(approvalId);
    if (executed) return receiptForExecuted(executed);
    const recheck = await approvalStore.get(approvalId);
    if (recheck && recheck.status === 'EXECUTED') return receiptForExecuted(recheck);

    return {
      ok: false,
      reason: 'finalization_failed',
      executionCommitSha: normalizeText(candidateCommit) || null,
    };
  }

  return { executeRepoTask, proposeWriteCandidate, checkCandidateSnapshot, verifyWriteSnapshot, executeApprovedWrite, newTaskId };
}

module.exports = { createCmoRepoAdapter, defaultPreviewRunner };
