'use strict';

/**
 * approvalRequestStore.js — Approval Request backend (WP-010, DEL A).
 *
 * Fullständig approval-state-machine för CMO-tool WRITE-candidate. Statusar:
 *   PENDING → APPROVED → EXECUTED
 *   PENDING → REJECTED
 *   PENDING → EXPIRED   (TTL)
 * Historik raderas ALDRIG vid reject — posten står kvar med rejectedBy/rejectedAt.
 *
 * Store: JSON + atomisk write (samma idiomatiska mönster som övriga stores).
 */

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

const STATUSES = Object.freeze(['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'EXECUTED']);

function nowIso() { return new Date().toISOString(); }
function normalizeText(v) { return typeof v === 'string' ? v.trim() : ''; }
function normalizeStatus(v) {
  const s = normalizeText(v).toUpperCase();
  return STATUSES.includes(s) ? s : 'PENDING';
}

/**
 * WP-012 — additive lifecycle/attempt metadata. Old records predating these
 * fields stay readable; reading one yields safe defaults instead of `undefined`.
 * Purely additive — does not change the state-machine shape (no new STATUS).
 */
function normalizeApprovalRecord(rec) {
  if (!rec || typeof rec !== 'object') return rec;
  const attemptCount = Number(rec.attemptCount);
  return {
    ...rec,
    attemptCount: Number.isFinite(attemptCount) ? attemptCount : 0,
    lastAttemptAt: normalizeText(rec.lastAttemptAt) || null,
    lastError: normalizeText(rec.lastError) || null,
    executionCommitSha: normalizeText(rec.executionCommitSha) || null,
  };
}

function emptyState() {
  return { version: 2, createdAt: nowIso(), updatedAt: nowIso(), requests: [] };
}

async function readJson(filePath, fallback) {
  try { return JSON.parse(await fs.readFile(filePath, 'utf8')); }
  catch (e) { if (e && e.code === 'ENOENT') return fallback; throw e; }
}

async function writeJsonAtomic(filePath, data) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  const tmp = `${filePath}.${process.pid}.${crypto.randomUUID()}.tmp`;
  await fs.writeFile(tmp, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  await fs.rename(tmp, filePath);
}

async function createApprovalRequestStore({ filePath, ttlMs = 24 * 60 * 60 * 1000 } = {}) {
  if (!normalizeText(filePath)) throw new Error('filePath krävs för approvalRequestStore.');
  let state = await readJson(filePath, emptyState());
  state = {
    ...emptyState(),
    ...(state && typeof state === 'object' ? state : {}),
    requests: Array.isArray(state?.requests) ? state.requests : [],
  };

  async function save() { state.updatedAt = nowIso(); await writeJsonAtomic(filePath, state); }

  /**
   * WP-011 — canonical expiry truth (fail CLOSED).
   * An approval is fresh only while its persisted requestedAt is a provable,
   * non-future timestamp AND requestedAt + ttlMs is still in the future.
   *
   * Fail-closed rules (unprovable/impossible freshness ⇒ expired ⇒ deniable):
   *   - missing / empty requestedAt        → not finite  → EXPIRED
   *   - malformed / non-finite requestedAt → not finite  → EXPIRED
   *   - materially future requestedAt      → at > now    → EXPIRED
   *     (a future timestamp must never extend approval authority)
   * Boundary semantics preserved from prior code: `<=` (requestedAt + ttlMs <= now ⇒ expired).
   */
  function isExpired(rec, now = Date.now()) {
    const at = Date.parse(rec?.requestedAt || '');
    if (!Number.isFinite(at)) return true;
    if (at > now) return true;
    return at + (Number(ttlMs) || 0) <= now;
  }

  /**
   * WP-011 — canonical freshness helper. Single source of truth for TTL validity,
   * used by every active approval-consumption authority boundary (approve /
   * listPending / execute / verifyWriteSnapshot). Returns {ok:true} or
   * {ok:false, reason:'expired'}.
   */
  function assertFresh(rec, now = Date.now()) {
    if (isExpired(rec, now)) return { ok: false, reason: 'expired' };
    return { ok: true };
  }

  function get(id) {
    const rec = state.requests.find((r) => r.id === normalizeText(id));
    return rec ? normalizeApprovalRecord(rec) : null;
  }

  /**
   * Skapar en PENDING approval-request med full kontext + snapshot (base SHA,
   * worktree/task id, changed files, diffstat, tests/build, preview, summary).
   * action/resource binds approval till exakt den ändringen.
   */
  async function create(input = {}) {
    const rec = {
      id: crypto.randomUUID(),
      taskId: normalizeText(input.taskId) || null,
      actor: normalizeText(input.actor) || null,
      tenant: normalizeText(input.tenant),
      agent: normalizeText(input.agent),
      action: normalizeText(input.action),
      actionLevel: normalizeText(input.actionLevel) || 'WRITE',
      repoId: normalizeText(input.repoId) || null,
      resource: normalizeText(input.resource) || null,
      baseSha: normalizeText(input.baseSha) || null,
      worktreeTaskId: normalizeText(input.worktreeTaskId) || null,
      summary: normalizeText(input.summary) || null,
      changedFiles: Array.isArray(input.changedFiles) ? input.changedFiles.map(normalizeText).filter(Boolean) : [],
      diffstat: normalizeText(input.diffstat) || '',
      testsBuildStatus: normalizeText(input.testsBuildStatus) || '',
      previewRef: normalizeText(input.previewRef) || null,
      approvalClass: normalizeText(input.approvalClass) || 'OWNER_APPROVAL',
      snapshotHash: normalizeText(input.snapshotHash) || null,
      requestedAt: nowIso(),
      status: 'PENDING',
      approvedBy: null,
      rejectedBy: null,
      approvedAt: null,
      rejectedAt: null,
      executedAt: null,
      // WP-012 — additive attempt/lifecycle metadata (safe defaults for old JSON).
      attemptCount: 0,
      lastAttemptAt: null,
      lastError: null,
      executionCommitSha: null,
    };
    state.requests.push(rec);
    await save();
    return normalizeApprovalRecord(rec);
  }

  function listAll() { return state.requests.map(normalizeApprovalRecord); }

  /** Pending, ej utgångna, filterbara på tenant + approvalClass. */
  function listPending({ tenant = '', approvalClass = '' } = {}) {
    const now = Date.now();
    return state.requests
      .filter((r) => {
        if (r.status !== 'PENDING') return false;
        if (isExpired(r, now)) return false;
        if (tenant && normalizeText(r.tenant) !== normalizeText(tenant)) return false;
        if (approvalClass && normalizeText(r.approvalClass) !== normalizeText(approvalClass)) return false;
        return true;
      })
      .map(normalizeApprovalRecord);
  }

  function listForTenant(tenant) {
    const t = normalizeText(tenant);
    return state.requests.filter((r) => normalizeText(r.tenant) === t).map(normalizeApprovalRecord);
  }

  /** Övergång: PENDING → godkänt. Returnerar null vid ogiltig/utgången status. */
  async function approve(id, { approver } = {}) {
    const rec = state.requests.find((r) => r.id === normalizeText(id));
    if (!rec || rec.status !== 'PENDING') return null;
    if (isExpired(rec)) { rec.status = 'EXPIRED'; await save(); return null; }
    rec.status = 'APPROVED';
    rec.approvedBy = normalizeText(approver) || null;
    rec.approvedAt = nowIso();
    await save();
    return normalizeApprovalRecord(rec);
  }

  /** Övergång: PENDING → REJECTED. Historik behålls. */
  async function reject(id, { approver, reason } = {}) {
    const rec = state.requests.find((r) => r.id === normalizeText(id));
    if (!rec || rec.status !== 'PENDING') return null;
    rec.status = 'REJECTED';
    rec.rejectedBy = normalizeText(approver) || null;
    rec.rejectedAt = nowIso();
    rec.rejectReason = normalizeText(reason) || null;
    await save();
    return normalizeApprovalRecord(rec);
  }

  /** Övergång: APPROVED → EXECUTED. Endast giltig om snapshot redan verifierats. */
  async function execute(id) {
    const rec = state.requests.find((r) => r.id === normalizeText(id));
    if (!rec || rec.status !== 'APPROVED') return null;
    // WP-011: freshness must hold BEFORE the irreversible APPROVED→EXECUTED
    // transition. On deny: no status change, no executedAt, no side effect.
    if (isExpired(rec)) return null;
    rec.status = 'EXECUTED';
    rec.executedAt = nowIso();
    await save();
    return normalizeApprovalRecord(rec);
  }

  /** Markera utgångna PENDING → EXPIRED (sweep; returnerar antal). */
  async function expirePending() {
    const now = Date.now();
    let count = 0;
    for (const rec of state.requests) {
      if (rec.status === 'PENDING' && isExpired(rec, now)) {
        rec.status = 'EXPIRED';
        count += 1;
      }
    }
    if (count > 0) await save();
    return count;
  }

  /**
   * WP-012 — deterministic attempt recording. Every legitimate execution attempt
   * increments attemptCount and stamps lastAttemptAt. `error` (when given)
   * records a truthful failure; when omitted the attempt is clean and any prior
   * lastError is cleared. Never sets executionCommitSha / status.
   */
  async function recordAttempt(id, { error = null } = {}) {
    const rec = state.requests.find((r) => r.id === normalizeText(id));
    if (!rec) return null;
    rec.attemptCount = (Number.isFinite(Number(rec.attemptCount)) ? Number(rec.attemptCount) : 0) + 1;
    rec.lastAttemptAt = nowIso();
    const err = normalizeText(error);
    rec.lastError = err || null;
    await save();
    return normalizeApprovalRecord(rec);
  }

  /**
   * WP-012 — bind the ACTUAL execution commit SHA to the approval. The SHA must
   * be a real git SHA-1/SHA-256 hex string (it is only ever set from the value
   * returned by commitCandidate); a value is never fabricated here.
   */
  async function bindExecutionCommit(id, sha) {
    const rec = state.requests.find((r) => r.id === normalizeText(id));
    if (!rec) return null;
    const s = normalizeText(sha);
    if (!/^[0-9a-f]{40,64}$/i.test(s)) return { ok: false, reason: 'invalid_execution_sha' };
    rec.executionCommitSha = s.toLowerCase();
    await save();
    return normalizeApprovalRecord(rec);
  }

  /**
   * WP-012 §11 — honest lifecycle cleanup. An APPROVED record that has aged past
   * its TTL is terminalized to EXPIRED (no execution, no retry) when encountered
   * by the canonical lifecycle/read/retry path. Execution authority was already
   * denied by WP-011; this only makes the durable authorization state honest.
   * WP-011 freshness enforcement is NOT weakened.
   */
  async function terminalizeExpiredApproved(id) {
    const rec = state.requests.find((r) => r.id === normalizeText(id));
    if (!rec) return null;
    if (rec.status === 'APPROVED' && isExpired(rec)) {
      rec.status = 'EXPIRED';
      await save();
    }
    return normalizeApprovalRecord(rec);
  }

  return {
    STATUSES,
    create,
    get,
    listAll,
    listPending,
    listForTenant,
    approve,
    reject,
    execute,
    expirePending,
    assertFresh,
    recordAttempt,
    bindExecutionCommit,
    terminalizeExpiredApproved,
  };
}

module.exports = { createApprovalRequestStore, STATUSES };
