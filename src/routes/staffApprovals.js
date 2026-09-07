'use strict';

/**
 * staffApprovals.js — Approval Center backend (WP-010, DEL B/C) + WP-012 retry.
 *
 * Server-side auktoritet. Klienten kan ALDRIG skicka approved=true som bevis —
 * varje approve/reject verifieras här: approver identity, tenant, OWNER-roll
 * (staff.manage), request PENDING, ej expired, samt TOCTOU (snapshot match).
 * Approval binds till exakt action + repo + worktree + base SHA.
 *
 * WP-012 — manual retry (Human Gate A): a legitimate APPROVED execution failure
 * is manually retryable until TTL expires; no automatic retry; after TTL expiry
 * retry is denied and a new approval is required.
 */

const express = require('express');
const { requirePermission } = require('../security/ccoRbac');
const { getAuthContext } = require('../security/requireAgentEntitlement');

const APPROVABLE_CLASSES = new Set(['OWNER_APPROVAL', 'RELEASE_APPROVAL']);

/**
 * WP-012 §12 — map an execution-denial reason to an honest HTTP status so a
 * failed execution never looks like success. Sensitive filesystem/path details
 * are never forwarded.
 */
function approvalErrorStatus(reason) {
  if (!reason) return 500;
  if (reason === 'approval_not_found' || reason === 'not_found') return 404;
  if (reason === 'approval_store_unavailable' || reason === 'repo_adapter_unavailable') return 503;
  if (reason === 'expired') return 409;
  if (reason.startsWith('approval_status_')) return 409;
  if (reason === 'not_write_candidate') return 409;
  if (reason === 'snapshot_mismatch' || reason === 'snapshot_content_unreadable' ||
      reason === 'changed_files_mismatch' || reason === 'base_sha_changed' ||
      reason === 'canonical_not_clean') return 409;
  if (reason === 'invalid_task_id' || reason === 'worktree_outside_root' ||
      reason === 'symlink_escape' || reason === 'path_resolution_failed' ||
      reason === 'worktrees_root_not_found' || reason === 'worktree_is_canonical' ||
      reason === 'worktree_contains_canonical') return 400;
  // commit_failed / execution_commit_bind_failed / finalization_failed / unknown_repo /
  // canonical_drift → server-side execution failure, not a client 200.
  return 500;
}

function createStaffApprovalsRouter({ requireAuth, approvalStore, repoAdapter } = {}) {
  const router = express.Router();
  const auth = typeof requireAuth === 'function' ? requireAuth : (_req, _res, next) => next();

  function resolveStore(req, res) {
    if (!approvalStore || typeof approvalStore.get !== 'function') {
      res.status(503).json({ error: 'approval_store_unavailable' });
      return null;
    }
    return approvalStore;
  }

  /** WP-012 §12 — never wrap an execution failure in HTTP 200. */
  function sendReceipt(res, receipt) {
    if (receipt && receipt.ok === false) {
      return res.status(approvalErrorStatus(receipt.reason)).json({ error: receipt.reason });
    }
    return res.json({ receipt });
  }

  // Lista pending approvals för aktörens tenant (endast approvable classes).
  router.get('/staff/approvals', auth, requirePermission('staff.manage'), (req, res) => {
    const s = resolveStore(req, res);
    if (!s) return;
    const actor = getAuthContext(req);
    const all = s.listPending({ tenant: actor.tenantId });
    const visible = all.filter((a) => APPROVABLE_CLASSES.has(a.approvalClass));
    res.json({ approvals: visible });
  });

  // WP-012 §13 — operator visibility: read one approval (any status) so an
  // authorized operator can distinguish PENDING / APPROVED(retryable) / EXPIRED /
  // EXECUTED and inspect attempt metadata. Terminalizes an expired APPROVED → EXPIRED.
  router.get('/staff/approvals/:id', auth, requirePermission('staff.manage'), async (req, res) => {
    const s = resolveStore(req, res);
    if (!s) return;
    const actor = getAuthContext(req);
    let approval = s.get(req.params.id);

    if (!approval) return res.status(404).json({ error: 'not_found' });
    if (approval.tenant !== actor.tenantId) return res.status(403).json({ error: 'cross_tenant' });
    if (!APPROVABLE_CLASSES.has(approval.approvalClass)) return res.status(403).json({ error: 'approval_class_not_allowed' });

    if (approval.status === 'APPROVED' && typeof s.terminalizeExpiredApproved === 'function') {
      approval = (await s.terminalizeExpiredApproved(approval.id)) || approval;
    }
    return res.json({ approval });
  });

  // Godkänn + exekvera exakt den registrerade WRITE-operationen.
  router.post('/staff/approvals/:id/approve', auth, requirePermission('staff.manage'), async (req, res) => {
    const s = resolveStore(req, res);
    if (!s) return;
    const actor = getAuthContext(req);
    const approval = s.get(req.params.id);

    if (!approval) return res.status(404).json({ error: 'not_found' });
    if (approval.tenant !== actor.tenantId) return res.status(403).json({ error: 'cross_tenant' });
    if (!APPROVABLE_CLASSES.has(approval.approvalClass)) return res.status(403).json({ error: 'approval_class_not_allowed' });
    if (approval.status !== 'PENDING') return res.status(409).json({ error: `not_pending_${String(approval.status).toLowerCase()}` });

    // TOCTOU (DEL F/G): snapshot måste matcha INNAN godkännandet.
    if (repoAdapter && typeof repoAdapter.checkCandidateSnapshot === 'function') {
      const check = repoAdapter.checkCandidateSnapshot(approval);
      if (!check.ok) return res.status(409).json({ error: check.reason, detail: 'Kandidaten har ändrats — kräver nytt approval.' });
    }

    const approved = await s.approve(approval.id, { approver: actor.userId });
    if (!approved) {
      const current = s.get(approval.id);
      return res.status(409).json({ error: current?.status === 'EXPIRED' ? 'expired' : 'approve_failed' });
    }

    if (!repoAdapter || typeof repoAdapter.executeApprovedWrite !== 'function') {
      return res.status(503).json({ error: 'repo_adapter_unavailable' });
    }
    try {
      const receipt = await repoAdapter.executeApprovedWrite({ approvalId: approval.id, approvalStore: s });
      return sendReceipt(res, receipt);
    } catch (err) {
      // Execution threw (commit/store failure): an APPROVED record remains and is
      // manually retryable via /retry. Never report this as a success.
      return res.status(500).json({ error: 'execution_failure' });
    }
  });

  // WP-012 §10 — manual retry of a legitimate, still-valid APPROVED execution
  // failure. Only APPROVED is retryable; PENDING/REJECTED/EXPIRED/EXECUTED are denied.
  router.post('/staff/approvals/:id/retry', auth, requirePermission('staff.manage'), async (req, res) => {
    const s = resolveStore(req, res);
    if (!s) return;
    const actor = getAuthContext(req);
    const approval = s.get(req.params.id);

    if (!approval) return res.status(404).json({ error: 'not_found' });
    if (approval.tenant !== actor.tenantId) return res.status(403).json({ error: 'cross_tenant' });
    if (!APPROVABLE_CLASSES.has(approval.approvalClass)) return res.status(403).json({ error: 'approval_class_not_allowed' });

    // WP-012 §11 — honest lifecycle cleanup on the retry path: an expired APPROVED
    // is terminalized to EXPIRED (no execution, no retry), then denied as expired.
    if (approval.status === 'APPROVED' && typeof s.terminalizeExpiredApproved === 'function') {
      const terminalized = await s.terminalizeExpiredApproved(approval.id);
      if (terminalized && terminalized.status === 'EXPIRED') {
        return res.status(409).json({ error: 'expired' });
      }
    }

    // A client must not be able to turn PENDING/REJECTED/EXPIRED/EXECUTED into a
    // retryable approval improperly.
    if (approval.status !== 'APPROVED') {
      return res.status(409).json({ error: `approval_status_${String(approval.status).toLowerCase()}` });
    }

    if (!repoAdapter || typeof repoAdapter.executeApprovedWrite !== 'function') {
      return res.status(503).json({ error: 'repo_adapter_unavailable' });
    }
    try {
      const receipt = await repoAdapter.executeApprovedWrite({ approvalId: approval.id, approvalStore: s });
      return sendReceipt(res, receipt);
    } catch (err) {
      return res.status(500).json({ error: 'execution_failure' });
    }
  });

  // Avvisa (historik behålls).
  router.post('/staff/approvals/:id/reject', auth, requirePermission('staff.manage'), async (req, res) => {
    const s = resolveStore(req, res);
    if (!s) return;
    const actor = getAuthContext(req);
    const approval = s.get(req.params.id);

    if (!approval) return res.status(404).json({ error: 'not_found' });
    if (approval.tenant !== actor.tenantId) return res.status(403).json({ error: 'cross_tenant' });
    if (approval.status !== 'PENDING') return res.status(409).json({ error: `not_pending_${String(approval.status).toLowerCase()}` });

    const rejected = await s.reject(approval.id, { approver: actor.userId, reason: req.body?.reason });
    return res.json({ ok: true, status: 'REJECTED', approval: rejected });
  });

  return router;
}

module.exports = { createStaffApprovalsRouter, APPROVABLE_CLASSES };
