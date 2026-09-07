'use strict';

/**
 * WP-012 — Stuck APPROVED lifecycle. Behavioral + static coverage.
 *
 * Frozen failure policy (Human Gate A): a legitimate APPROVED execution failure
 * remains manually retryable while WP-011 freshness holds; no automatic retry;
 * after TTL expiry retry is denied and a new approval is required.
 *
 * Idempotency invariant: one approval + one approved snapshot → at most one
 * candidate commit, keyed on the durable executionCommitSha.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const express = require('express');
const { execFileSync } = require('node:child_process');

const { createApprovalRequestStore, STATUSES } = require('../../src/security/approvalRequestStore');
const { createCmoRepoAdapter } = require('../../src/security/cmoRepoAdapter');
const { createStaffApprovalsRouter } = require('../../src/routes/staffApprovals');

function tmpdir() { return fs.mkdtempSync(path.join(os.tmpdir(), 'wp012-')); }
function git(cwd, args) { return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim(); }

function makeFixtureRepo() {
  const dir = tmpdir();
  git(dir, ['init', '-q']);
  fs.writeFileSync(path.join(dir, 'index.md'), '# Rubrik X\n\nPilot.\n');
  git(dir, ['add', '.']);
  git(dir, ['-c', 'user.email=t@t.se', '-c', 'user.name=t', 'commit', '-qm', 'init']);
  return { dir, branch: git(dir, ['rev-parse', '--abbrev-ref', 'HEAD']) };
}

const ACTOR = { userId: 'anna', role: 'PERSONAL' };
const TENANT = 'hair-tp-clinic';

function repoMap(fixture) {
  return {
    'pilot-fixture': {
      repoId: 'pilot-fixture', gitUrl: fixture.dir, defaultBranch: fixture.branch,
      canonicalHead: null, buildCommands: [], previewCommands: [['node', '-e', "console.log('ok')"]],
    },
  };
}

function makeEnv() {
  const fixture = makeFixtureRepo();
  const canonicalRoot = tmpdir();
  const worktreesRoot = tmpdir();
  const adapter = createCmoRepoAdapter({
    canonicalRoot, worktreesRoot, resolveRepoFn: (id) => repoMap(fixture)[id] || null,
  });
  const filePath = path.join(tmpdir(), 'approvals.json');
  const storePromise = createApprovalRequestStore({ filePath, ttlMs: 60_000 });
  return { fixture, canonicalRoot, worktreesRoot, adapter, filePath, storePromise };
}

async function propose(env, store, taskId) {
  await env.adapter.executeRepoTask({
    repoId: 'pilot-fixture', tool: 'cmo.content.draft',
    args: { repo_id: 'pilot-fixture', path: 'index.md', content: '# Rubrik Y\n' },
    actor: ACTOR, tenantId: TENANT, taskId,
  });
  return env.adapter.proposeWriteCandidate({
    repoId: 'pilot-fixture', taskId, args: { repo_id: 'pilot-fixture', path: 'index.md' },
    actor: ACTOR, tenantId: TENANT, approvalStore: store,
  });
}

function worktreeHead(worktreesRoot, taskId) {
  return git(path.join(worktreesRoot, taskId), ['rev-parse', 'HEAD']);
}

function rewriteRequestedAtToPast(filePath, id, daysAgo = 3) {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const rec = raw.requests.find((r) => r.id === id);
  assert.ok(rec, 'record exists');
  rec.requestedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
  fs.writeFileSync(filePath, `${JSON.stringify(raw, null, 2)}\n`);
}

const SHA_RE = /^[0-9a-f]{40,64}$/i;

// ────────────────────────────────────────────────────────────────────────────

test('T-001 normal approval → one commit → EXECUTED', async () => {
  const env = makeEnv();
  const store = await env.storePromise;
  const prop = await propose(env, store, 'task-t1');
  const approved = await store.approve(prop.approvalId, { approver: 'owner' });
  assert.equal(approved.status, 'APPROVED');

  const headBefore = worktreeHead(env.worktreesRoot, 'task-t1');
  const receipt = await env.adapter.executeApprovedWrite({ approvalId: prop.approvalId, approvalStore: store });

  assert.equal(receipt.ok, true);
  assert.equal(receipt.status, 'executed');
  assert.ok(receipt.candidateCommit);
  assert.equal(receipt.approvedSnapshotHash, prop.snapshotHash);
  assert.equal(store.get(prop.approvalId).status, 'EXECUTED');
  // one commit (candidate HEAD advanced from base)
  assert.notEqual(worktreeHead(env.worktreesRoot, 'task-t1'), headBefore);
});

test('T-009/T-010 successful commit records executionCommitSha == actual HEAD', async () => {
  const env = makeEnv();
  const store = await env.storePromise;
  const prop = await propose(env, store, 'task-t9');
  await store.approve(prop.approvalId, { approver: 'owner' });
  const receipt = await env.adapter.executeApprovedWrite({ approvalId: prop.approvalId, approvalStore: store });

  const rec = store.get(prop.approvalId);
  assert.match(rec.executionCommitSha, SHA_RE);
  assert.equal(rec.executionCommitSha, receipt.executionCommitSha);
  assert.equal(rec.executionCommitSha, worktreeHead(env.worktreesRoot, 'task-t9'));
});

test('T-002 commit failure before commit → APPROVED + lastError + retryable', async () => {
  const env = makeEnv();
  const store = await env.storePromise;
  const prop = await propose(env, store, 'task-t2');
  await store.approve(prop.approvalId, { approver: 'owner' });

  // Deterministic git-commit failure: a pre-commit hook in the canonical checkout
  // (shared by the task worktree) exits non-zero for every commit.
  const hookPath = path.join(env.canonicalRoot, 'pilot-fixture', '.git', 'hooks', 'pre-commit');
  fs.writeFileSync(hookPath, '#!/bin/sh\nexit 1\n', { mode: 0o755 });

  const headBefore = worktreeHead(env.worktreesRoot, 'task-t2');
  const res = await env.adapter.executeApprovedWrite({ approvalId: prop.approvalId, approvalStore: store });

  assert.equal(res.ok, false);
  assert.equal(res.reason, 'commit_failed');
  const rec = store.get(prop.approvalId);
  assert.equal(rec.status, 'APPROVED');
  assert.equal(rec.lastError, 'commit_failed');
  assert.equal(rec.executionCommitSha, null);
  assert.equal(rec.executedAt, null);
  assert.equal(worktreeHead(env.worktreesRoot, 'task-t2'), headBefore); // no commit
  assert.equal(store.assertFresh(rec).ok, true); // retryable while fresh

  // T-003 — manual retry after transient pre-commit failure → succeeds.
  fs.rmSync(hookPath, { force: true });
  const retry = await env.adapter.executeApprovedWrite({ approvalId: prop.approvalId, approvalStore: store });
  assert.equal(retry.ok, true);
  assert.equal(retry.status, 'executed');
  assert.equal(store.get(prop.approvalId).status, 'EXECUTED');
  assert.notEqual(worktreeHead(env.worktreesRoot, 'task-t2'), headBefore);
});

test('T-007/T-008 snapshot mismatch → no commit + lastError (WP-010 denies)', async () => {
  const env = makeEnv();
  const store = await env.storePromise;
  const prop = await propose(env, store, 'task-t7');
  await store.approve(prop.approvalId, { approver: 'owner' });

  const headBefore = worktreeHead(env.worktreesRoot, 'task-t7');
  fs.writeFileSync(path.join(env.worktreesRoot, 'task-t7', 'extra.md'), 'stale');

  const res = await env.adapter.executeApprovedWrite({ approvalId: prop.approvalId, approvalStore: store });
  assert.equal(res.ok, false);
  assert.equal(res.reason, 'snapshot_mismatch');
  assert.equal(worktreeHead(env.worktreesRoot, 'task-t7'), headBefore); // no commit

  const rec = store.get(prop.approvalId);
  assert.equal(rec.status, 'APPROVED');
  assert.equal(rec.lastError, 'snapshot_mismatch');
  assert.equal(rec.executionCommitSha, null);

  // A further retry (still stale) is also denied — no commit accumulates.
  const res2 = await env.adapter.executeApprovedWrite({ approvalId: prop.approvalId, approvalStore: store });
  assert.equal(res2.ok, false);
  assert.equal(res2.reason, 'snapshot_mismatch');
  assert.equal(worktreeHead(env.worktreesRoot, 'task-t7'), headBefore);
});

test('T-005 retry after TTL expiry → denied (status unchanged at the authority boundary)', async () => {
  const env = makeEnv();
  let store = await env.storePromise;
  const prop = await propose(env, store, 'task-t5');
  await store.approve(prop.approvalId, { approver: 'owner' });
  rewriteRequestedAtToPast(env.filePath, prop.approvalId);
  store = await createApprovalRequestStore({ filePath: env.filePath, ttlMs: 60_000 }); // reload

  const res = await env.adapter.executeApprovedWrite({ approvalId: prop.approvalId, approvalStore: store });
  assert.equal(res.ok, false);
  assert.equal(res.reason, 'expired');
  assert.equal(res.candidateCommit, undefined);
  // WP-011 frozen zero-side-effect: the direct-call boundary does not mutate status.
  assert.equal(store.get(prop.approvalId).status, 'APPROVED');
});

test('T-006 expired APPROVED → EXPIRED (canonical read/retry terminalization)', async () => {
  const env = makeEnv();
  let store = await env.storePromise;
  const prop = await propose(env, store, 'task-t6');
  await store.approve(prop.approvalId, { approver: 'owner' });
  rewriteRequestedAtToPast(env.filePath, prop.approvalId);
  store = await createApprovalRequestStore({ filePath: env.filePath, ttlMs: 60_000 });

  assert.equal(store.get(prop.approvalId).status, 'APPROVED'); // still APPROVED before encounter
  const terminalized = await store.terminalizeExpiredApproved(prop.approvalId);
  assert.equal(terminalized.status, 'EXPIRED');
  assert.equal(store.get(prop.approvalId).status, 'EXPIRED');
});

test('T-011 finalization failure after commit → executionCommitSha recoverable', async () => {
  const env = makeEnv();
  const store = await env.storePromise;
  const prop = await propose(env, store, 'task-t11');
  await store.approve(prop.approvalId, { approver: 'owner' });

  const headBefore = worktreeHead(env.worktreesRoot, 'task-t11');
  // Simulate EXECUTED persistence/finalization failure (save throws) while the
  // commit itself succeeds. The store's other methods remain real.
  const failingStore = { ...store, execute: async () => { throw new Error('finalize save failed'); } };
  await assert.rejects(
    env.adapter.executeApprovedWrite({ approvalId: prop.approvalId, approvalStore: failingStore })
  );

  // The commit is durable and bound; the record stays APPROVED (recoverable).
  const headAfter = worktreeHead(env.worktreesRoot, 'task-t11');
  assert.notEqual(headAfter, headBefore); // commit happened
  const rec = store.get(prop.approvalId);
  assert.equal(rec.status, 'APPROVED');
  assert.match(rec.executionCommitSha, SHA_RE);
  assert.equal(rec.executionCommitSha, headAfter);

  // T-012/T-013 — manual retry does NOT recommit; reuses the same SHA.
  const retry = await env.adapter.executeApprovedWrite({ approvalId: prop.approvalId, approvalStore: store });
  assert.equal(retry.ok, true);
  assert.equal(retry.status, 'executed');
  assert.equal(retry.executionCommitSha, headAfter);
  assert.equal(worktreeHead(env.worktreesRoot, 'task-t11'), headAfter); // zero new commit
  assert.equal(store.get(prop.approvalId).status, 'EXECUTED');
  assert.equal(store.get(prop.approvalId).executionCommitSha, headAfter);
});

test('T-014/T-015/T-016 attempt metadata is deterministic and truthful', async () => {
  const env = makeEnv();
  const store = await env.storePromise;
  const prop = await propose(env, store, 'task-t14');
  await store.approve(prop.approvalId, { approver: 'owner' });
  assert.equal(store.get(prop.approvalId).attemptCount, 0);
  assert.equal(store.get(prop.approvalId).lastAttemptAt, null);

  // Failure attempt.
  fs.writeFileSync(path.join(env.worktreesRoot, 'task-t14', 'extra.md'), 'stale');
  await env.adapter.executeApprovedWrite({ approvalId: prop.approvalId, approvalStore: store });
  let rec = store.get(prop.approvalId);
  assert.equal(rec.attemptCount, 1);
  assert.ok(rec.lastAttemptAt);
  assert.equal(rec.lastError, 'snapshot_mismatch');

  // Fix the snapshot and retry successfully.
  fs.rmSync(path.join(env.worktreesRoot, 'task-t14', 'extra.md'));
  const ok = await env.adapter.executeApprovedWrite({ approvalId: prop.approvalId, approvalStore: store });
  assert.equal(ok.ok, true);
  rec = store.get(prop.approvalId);
  assert.equal(rec.attemptCount, 2);
  assert.ok(rec.lastAttemptAt);
  assert.equal(rec.lastError, null); // cleared on success
  assert.equal(rec.status, 'EXECUTED');
});

test('T-021 EXECUTED cannot create another commit (idempotent read)', async () => {
  const env = makeEnv();
  const store = await env.storePromise;
  const prop = await propose(env, store, 'task-t21');
  await store.approve(prop.approvalId, { approver: 'owner' });
  const first = await env.adapter.executeApprovedWrite({ approvalId: prop.approvalId, approvalStore: store });
  const head = worktreeHead(env.worktreesRoot, 'task-t21');

  const again = await env.adapter.executeApprovedWrite({ approvalId: prop.approvalId, approvalStore: store });
  assert.equal(again.ok, true);
  assert.equal(again.executionCommitSha, first.executionCommitSha);
  assert.equal(worktreeHead(env.worktreesRoot, 'task-t21'), head); // no new commit
});

test('T-022 process reload preserves executionCommitSha and attempt metadata', async () => {
  const env = makeEnv();
  let store = await env.storePromise;
  const prop = await propose(env, store, 'task-t22');
  await store.approve(prop.approvalId, { approver: 'owner' });
  await env.adapter.executeApprovedWrite({ approvalId: prop.approvalId, approvalStore: store });
  const before = store.get(prop.approvalId);
  assert.ok(before.executionCommitSha);

  store = await createApprovalRequestStore({ filePath: env.filePath, ttlMs: 60_000 }); // reload
  const after = store.get(prop.approvalId);
  assert.equal(after.executionCommitSha, before.executionCommitSha);
  assert.equal(after.attemptCount, before.attemptCount);
  assert.equal(after.lastAttemptAt, before.lastAttemptAt);
  assert.equal(after.status, 'EXECUTED');
});

test('T-023 receipt binds approval + snapshot + executionCommitSha', async () => {
  const env = makeEnv();
  const store = await env.storePromise;
  const prop = await propose(env, store, 'task-t23');
  await store.approve(prop.approvalId, { approver: 'owner' });
  const receipt = await env.adapter.executeApprovedWrite({ approvalId: prop.approvalId, approvalStore: store });

  assert.equal(receipt.approvalId, prop.approvalId);
  assert.equal(receipt.approvedSnapshotHash, prop.snapshotHash);
  assert.equal(receipt.executionCommitSha, worktreeHead(env.worktreesRoot, 'task-t23'));
});

// ── Route-level: error contract + retry entrypoint + visibility ──────────────

function buildApp(env, store, requireAuth) {
  const app = express();
  app.use(express.json());
  app.use('/api/v1', createStaffApprovalsRouter({ requireAuth, approvalStore: store, repoAdapter: env.adapter }));
  return app;
}

async function listen(app) {
  const server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  return { server, base: `http://127.0.0.1:${server.address().port}` };
}

const ownerAuth = (req, _res, next) => { req.auth = { userId: 'owner', tenantId: TENANT, role: 'OWNER' }; next(); };

test('T-017 failed execution never reports HTTP success', async () => {
  const env = makeEnv();
  const store = await env.storePromise;
  const prop = await propose(env, store, 'task-t17');
  await store.approve(prop.approvalId, { approver: 'owner' });
  // Stale snapshot → retry must be a non-200 (snapshot_mismatch), never 200.
  fs.writeFileSync(path.join(env.worktreesRoot, 'task-t17', 'extra.md'), 'stale');

  const { server, base } = await listen(buildApp(env, store, ownerAuth));
  try {
    const res = await fetch(`${base}/api/v1/staff/approvals/${prop.approvalId}/retry`, { method: 'POST' });
    assert.notEqual(res.status, 200);
    assert.equal(res.status, 409);
    const body = await res.json();
    assert.equal(body.error, 'snapshot_mismatch');
  } finally {
    await new Promise((r) => server.close(r));
  }
});

test('retry route terminalizes expired APPROVED → EXPIRED and denies as expired', async () => {
  const env = makeEnv();
  let store = await env.storePromise;
  const prop = await propose(env, store, 'task-tretry-exp');
  await store.approve(prop.approvalId, { approver: 'owner' });
  rewriteRequestedAtToPast(env.filePath, prop.approvalId);
  store = await createApprovalRequestStore({ filePath: env.filePath, ttlMs: 60_000 });

  const { server, base } = await listen(buildApp(env, store, ownerAuth));
  try {
    const res = await fetch(`${base}/api/v1/staff/approvals/${prop.approvalId}/retry`, { method: 'POST' });
    assert.equal(res.status, 409);
    assert.equal((await res.json()).error, 'expired');
    assert.equal(store.get(prop.approvalId).status, 'EXPIRED'); // terminalized
  } finally {
    await new Promise((r) => server.close(r));
  }
});

test('T-018/T-019/T-020 denied retry states (PENDING/REJECTED/EXPIRED)', async () => {
  const env = makeEnv();
  const store = await env.storePromise;
  const pending = await propose(env, store, 'task-t18a');

  // REJECTED
  const rejectedProp = await propose(env, store, 'task-t18b');
  await store.reject(rejectedProp.approvalId, { approver: 'owner' });

  // EXPIRED (terminal state — already terminalized)
  const expiredProp = await propose(env, store, 'task-t18c');
  await store.approve(expiredProp.approvalId, { approver: 'owner' });
  rewriteRequestedAtToPast(env.filePath, expiredProp.approvalId);
  const reloaded = await createApprovalRequestStore({ filePath: env.filePath, ttlMs: 60_000 });
  await reloaded.terminalizeExpiredApproved(expiredProp.approvalId);
  assert.equal(reloaded.get(expiredProp.approvalId).status, 'EXPIRED');

  const { server, base } = await listen(buildApp(env, reloaded, ownerAuth));
  try {
    const rPending = await fetch(`${base}/api/v1/staff/approvals/${pending.approvalId}/retry`, { method: 'POST' });
    assert.equal(rPending.status, 409);
    assert.equal((await rPending.json()).error, 'approval_status_pending');

    const rRejected = await fetch(`${base}/api/v1/staff/approvals/${rejectedProp.approvalId}/retry`, { method: 'POST' });
    assert.equal(rRejected.status, 409);
    assert.equal((await rRejected.json()).error, 'approval_status_rejected');

    const rExpired = await fetch(`${base}/api/v1/staff/approvals/${expiredProp.approvalId}/retry`, { method: 'POST' });
    assert.equal(rExpired.status, 409);
    assert.equal((await rExpired.json()).error, 'approval_status_expired');
  } finally {
    await new Promise((r) => server.close(r));
  }
});

test('T-013a retry entrypoint finalizes a legitimate APPROVED failure', async () => {
  const env = makeEnv();
  const store = await env.storePromise;
  const prop = await propose(env, store, 'task-t13a');
  await store.approve(prop.approvalId, { approver: 'owner' });

  const { server, base } = await listen(buildApp(env, store, ownerAuth));
  try {
    const res = await fetch(`${base}/api/v1/staff/approvals/${prop.approvalId}/retry`, { method: 'POST' });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.receipt.ok, true);
    assert.equal(body.receipt.status, 'executed');
    assert.equal(store.get(prop.approvalId).status, 'EXECUTED');
  } finally {
    await new Promise((r) => server.close(r));
  }
});

test('operator visibility: GET /staff/approvals/:id exposes lifecycle + attempt metadata', async () => {
  const env = makeEnv();
  const store = await env.storePromise;
  const prop = await propose(env, store, 'task-tvis');
  await store.approve(prop.approvalId, { approver: 'owner' });

  const { server, base } = await listen(buildApp(env, store, ownerAuth));
  try {
    const res = await fetch(`${base}/api/v1/staff/approvals/${prop.approvalId}`, { headers: {} });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.approval.id, prop.approvalId);
    assert.equal(body.approval.status, 'APPROVED');
    assert.ok('attemptCount' in body.approval);
    assert.ok('lastAttemptAt' in body.approval);
    assert.ok('lastError' in body.approval);
    assert.ok('executionCommitSha' in body.approval);
  } finally {
    await new Promise((r) => server.close(r));
  }
});

// ── T-004 / T-028 — no automatic retry, no parallel lifecycle implementation ──

test('T-004/T-028 no automatic retry and no parallel lifecycle/retry engine', () => {
  const files = [
    'src/security/approvalRequestStore.js',
    'src/security/cmoRepoAdapter.js',
    'src/routes/staffApprovals.js',
  ];
  for (const f of files) {
    const src = fs.readFileSync(path.join(__dirname, '..', '..', f), 'utf8');
    // No timer-driven/background automatic retry.
    assert.ok(!/setInterval\s*\(/.test(src), `${f} must not setInterval`);
    assert.ok(!/setTimeout\s*\(/.test(src), `${f} must not setTimeout (auto-retry)`);
    assert.ok(!/retryWorker|retryQueue|scheduleRetry|autoRetry/.test(src), `${f} must not define a retry worker`);
  }
  // No new lifecycle status — the vocabulary is unchanged (5 statuses).
  assert.deepEqual(STATUSES, ['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'EXECUTED']);
});
