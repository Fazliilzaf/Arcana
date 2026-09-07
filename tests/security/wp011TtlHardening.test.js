'use strict';

/**
 * WP-011 — Approval TTL direct-call hardening. Behavioral coverage.
 *
 * Covers the frozen security contract: an approval is executable only while
 *   APPROVED AND fresh AND all WP-010 snapshot invariants.
 * Freshness rule (single source = approvalStore.assertFresh, fail closed):
 *   requestedAt non-finite / future  -> expired
 *   requestedAt + ttlMs <= now       -> expired  (boundary `<=`, preserved)
 *
 * Test matrix: T-001..T-026. Static guard (T-027) lives in
 * wp011TtlStaticGuard.test.js.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const { createApprovalRequestStore } = require('../../src/security/approvalRequestStore');
const { createCmoRepoAdapter } = require('../../src/security/cmoRepoAdapter');

function tmpdir() { return fs.mkdtempSync(path.join(os.tmpdir(), 'wp011-')); }
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

function repoMap(fixture) {
  return {
    'pilot-fixture': {
      repoId: 'pilot-fixture', gitUrl: fixture.dir, defaultBranch: fixture.branch,
      canonicalHead: null, buildCommands: [], previewCommands: [['node', '-e', "console.log('ok')"]],
    },
  };
}

function makeAdapter(fixture, opts = {}) {
  const repos = repoMap(fixture);
  return createCmoRepoAdapter({
    canonicalRoot: opts.canonicalRoot || tmpdir(),
    worktreesRoot: opts.worktreesRoot || tmpdir(),
    resolveRepoFn: (id) => repos[id] || null,
  });
}

async function propose(adapter, approvalStore, taskId = 'task-w1', tenantId = 'hair-tp-clinic') {
  await adapter.executeRepoTask({
    repoId: 'pilot-fixture', tool: 'cmo.content.draft',
    args: { repo_id: 'pilot-fixture', path: 'index.md', content: '# Rubrik Y\n' },
    actor: ACTOR, tenantId, taskId,
  });
  return adapter.proposeWriteCandidate({
    repoId: 'pilot-fixture', taskId, args: { repo_id: 'pilot-fixture', path: 'index.md' },
    actor: ACTOR, tenantId, approvalStore,
  });
}

/** Simulate an APPROVED record that has since aged past its TTL (no real sleep). */
function rewriteRequestedAtToPast(filePath, id, daysAgo = 3) {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const rec = raw.requests.find((r) => r.id === id);
  assert.ok(rec, 'record exists');
  rec.requestedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
  fs.writeFileSync(filePath, `${JSON.stringify(raw, null, 2)}\n`);
}

// ── TTL CORE (canonical helper, deterministic via explicit `now`) ────────────

test('T-001 fresh approval before TTL -> assertFresh ok', async () => {
  const s = await createApprovalRequestStore({ filePath: path.join(tmpdir(), 'a.json'), ttlMs: 60_000 });
  const rec = await s.create({ tenant: 't', agent: 'CMO', action: 'cmo.content.write_candidate', snapshotHash: 'h1' });
  const at = Date.parse(rec.requestedAt);
  assert.deepEqual(s.assertFresh(rec, at + 30_000), { ok: true });
});

test('T-002 exactly at expiry boundary -> DENIED (preserve <=)', async () => {
  const s = await createApprovalRequestStore({ filePath: path.join(tmpdir(), 'a.json'), ttlMs: 60_000 });
  const rec = await s.create({ tenant: 't', agent: 'CMO', action: 'cmo.content.write_candidate', snapshotHash: 'h1' });
  const at = Date.parse(rec.requestedAt);
  const res = s.assertFresh(rec, at + 60_000);
  assert.equal(res.ok, false);
  assert.equal(res.reason, 'expired');
});

test('T-003 after TTL -> DENIED', async () => {
  const s = await createApprovalRequestStore({ filePath: path.join(tmpdir(), 'a.json'), ttlMs: 60_000 });
  const rec = await s.create({ tenant: 't', agent: 'CMO', action: 'cmo.content.write_candidate', snapshotHash: 'h1' });
  const at = Date.parse(rec.requestedAt);
  assert.equal(s.assertFresh(rec, at + 60_001).ok, false);
});

test('T-004 malformed requestedAt -> DENIED (fail closed)', async () => {
  const s = await createApprovalRequestStore({ filePath: path.join(tmpdir(), 'a.json'), ttlMs: 60_000 });
  const rec = await s.create({ tenant: 't', agent: 'CMO', action: 'cmo.content.write_candidate', snapshotHash: 'h1' });
  rec.requestedAt = 'not-a-date';
  assert.equal(s.assertFresh(rec).ok, false);
  assert.equal(s.assertFresh(rec).reason, 'expired');
});

test('T-005 missing requestedAt -> DENIED (fail closed)', async () => {
  const s = await createApprovalRequestStore({ filePath: path.join(tmpdir(), 'a.json'), ttlMs: 60_000 });
  const rec = await s.create({ tenant: 't', agent: 'CMO', action: 'cmo.content.write_candidate', snapshotHash: 'h1' });
  delete rec.requestedAt;
  assert.equal(s.assertFresh(rec).ok, false);
});

test('T-006 materially future requestedAt -> DENIED (must not extend authority)', async () => {
  const s = await createApprovalRequestStore({ filePath: path.join(tmpdir(), 'a.json'), ttlMs: 60_000 });
  const rec = await s.create({ tenant: 't', agent: 'CMO', action: 'cmo.content.write_candidate', snapshotHash: 'h1' });
  rec.requestedAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year ahead
  assert.equal(s.assertFresh(rec).ok, false);
});

// ── DIRECT-CALL HARDENING (expired-but-APPROVED records) ─────────────────────

// Shared setup: real propose -> approve -> force record past its TTL -> reload store.
async function expiredApprovedSetup(opts = {}) {
  const fixture = makeFixtureRepo();
  const worktreesRoot = opts.worktreesRoot || tmpdir();
  const adapter = makeAdapter(fixture, { worktreesRoot });
  const filePath = path.join(tmpdir(), 'a.json');
  const store = await createApprovalRequestStore({ filePath, ttlMs: 60_000 });
  const prop = await propose(adapter, store, 'task-exp');
  const approved = await store.approve(prop.approvalId, { approver: 'owner' });
  assert.equal(approved.status, 'APPROVED');
  rewriteRequestedAtToPast(filePath, prop.approvalId);
  const reloaded = await createApprovalRequestStore({ filePath, ttlMs: 60_000 });
  return { adapter, store: reloaded, prop, filePath, worktreesRoot, taskId: 'task-exp' };
}

function worktreeHead(worktreesRoot, taskId) {
  const wt = path.join(worktreesRoot, taskId);
  return git(wt, ['rev-parse', 'HEAD']);
}

test('T-007 direct approvalStore.execute() after TTL -> DENIED (null)', async () => {
  const { store, prop } = await expiredApprovedSetup();
  const before = store.get(prop.approvalId);
  const res = await store.execute(prop.approvalId);
  assert.equal(res, null);
  const after = store.get(prop.approvalId);
  assert.equal(after.status, 'APPROVED'); // unchanged — no EXECUTED
  assert.equal(after.executedAt, null);   // no executedAt
  assert.equal(before.status, 'APPROVED');
});

test('T-008 direct verifyWriteSnapshot() after TTL -> DENIED (reason expired)', async () => {
  const { adapter, store, prop } = await expiredApprovedSetup();
  const r = await adapter.verifyWriteSnapshot(prop.approvalId, store);
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'expired');
});

test('T-009 direct executeApprovedWrite() after TTL -> DENIED (no commit)', async () => {
  const { adapter, store, prop, worktreesRoot, taskId } = await expiredApprovedSetup();
  const headBefore = worktreeHead(worktreesRoot, taskId);
  const receipt = await adapter.executeApprovedWrite({ approvalId: prop.approvalId, approvalStore: store });
  assert.equal(receipt.ok, false);
  assert.equal(receipt.reason, 'expired');
  assert.equal(receipt.status, undefined);
  assert.equal(receipt.candidateCommit, undefined);
  assert.equal(worktreeHead(worktreesRoot, taskId), headBefore); // zero git commit
  assert.notEqual(store.get(prop.approvalId).status, 'EXECUTED'); // not EXECUTED
});

test('T-010 snapshot-valid but TTL-expired -> DENIED', async () => {
  const { adapter, store, prop } = await expiredApprovedSetup();
  const snap = adapter.checkCandidateSnapshot(store.get(prop.approvalId));
  assert.equal(snap.ok, true, 'precondition: snapshot is still valid');
  const receipt = await adapter.executeApprovedWrite({ approvalId: prop.approvalId, approvalStore: store });
  assert.equal(receipt.ok, false);
  assert.equal(receipt.reason, 'expired');
});

// ── TOCTOU / RETRY / REPLAY ──────────────────────────────────────────────────

test('T-011 fresh at approve, expired before execution -> DENIED', async () => {
  const { adapter, store, prop } = await expiredApprovedSetup();
  const receipt = await adapter.executeApprovedWrite({ approvalId: prop.approvalId, approvalStore: store });
  assert.equal(receipt.ok, false);
  assert.equal(receipt.reason, 'expired');
});

test('T-012 execution retry after TTL -> DENIED', async () => {
  const { adapter, store, prop } = await expiredApprovedSetup();
  for (let i = 0; i < 3; i += 1) {
    const r = await adapter.executeApprovedWrite({ approvalId: prop.approvalId, approvalStore: store });
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'expired');
  }
});

test('T-013 process reload does not revive expired APPROVED', async () => {
  const { adapter, filePath, prop } = await expiredApprovedSetup();
  const s2 = await createApprovalRequestStore({ filePath, ttlMs: 60_000 }); // second restart
  assert.equal(s2.get(prop.approvalId).status, 'APPROVED'); // stale state preserved
  const r = await adapter.executeApprovedWrite({ approvalId: prop.approvalId, approvalStore: s2 });
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'expired');
});

test('T-014 replay approval id after TTL -> DENIED', async () => {
  const { adapter, store, prop } = await expiredApprovedSetup();
  const r = await adapter.executeApprovedWrite({ approvalId: prop.approvalId, approvalStore: store });
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'expired');
});

// ── SIDE EFFECT SAFETY ───────────────────────────────────────────────────────

test('T-015..T-019 expired -> zero side effects', async () => {
  const { adapter, store, prop, worktreesRoot, taskId } = await expiredApprovedSetup();
  const headBefore = worktreeHead(worktreesRoot, taskId);
  const receipt = await adapter.executeApprovedWrite({ approvalId: prop.approvalId, approvalStore: store });
  assert.equal(receipt.ok, false);
  // T-015 zero worktree mutation / T-016 zero git commit
  assert.equal(worktreeHead(worktreesRoot, taskId), headBefore);
  // T-017 not EXECUTED
  assert.notEqual(store.get(prop.approvalId).status, 'EXECUTED');
  // T-018 no executedAt
  assert.equal(store.get(prop.approvalId).executedAt, null);
  // T-019 no success receipt
  assert.equal(receipt.status, undefined);
  assert.equal(receipt.candidateCommit, undefined);
  assert.equal(receipt.executedAt, undefined);
});

// ── WP-010 COMPOSITION ───────────────────────────────────────────────────────

test('T-020 TTL-valid + stale snapshot -> DENY via WP-010 (snapshot_mismatch)', async () => {
  const fixture = makeFixtureRepo();
  const worktreesRoot = tmpdir();
  const adapter = makeAdapter(fixture, { worktreesRoot });
  const filePath = path.join(tmpdir(), 'a.json');
  const store = await createApprovalRequestStore({ filePath, ttlMs: 60_000 });
  const prop = await propose(adapter, store, 'task-t20');
  await store.approve(prop.approvalId, { approver: 'owner' });
  const wt = path.join(worktreesRoot, 'task-t20');
  fs.writeFileSync(path.join(wt, 'extra.md'), 'ny fil'); // snapshot stale, still fresh
  const receipt = await adapter.executeApprovedWrite({ approvalId: prop.approvalId, approvalStore: store });
  assert.equal(receipt.ok, false);
  assert.equal(receipt.reason, 'snapshot_mismatch'); // WP-010 denies (fresh but stale)
});

test('T-021 TTL-expired + valid snapshot -> DENY via WP-011 (expired)', async () => {
  const { adapter, store, prop } = await expiredApprovedSetup();
  assert.equal(adapter.checkCandidateSnapshot(store.get(prop.approvalId)).ok, true);
  const receipt = await adapter.executeApprovedWrite({ approvalId: prop.approvalId, approvalStore: store });
  assert.equal(receipt.ok, false);
  assert.equal(receipt.reason, 'expired');
});

// ── LEGITIMATE FLOW ──────────────────────────────────────────────────────────

test('T-025/T-026 fresh valid approval + valid snapshot -> executes with success receipt', async () => {
  const fixture = makeFixtureRepo();
  const adapter = makeAdapter(fixture);
  const store = await createApprovalRequestStore({ filePath: path.join(tmpdir(), 'a.json'), ttlMs: 60_000 });
  const prop = await propose(adapter, store, 'task-ok');
  await store.approve(prop.approvalId, { approver: 'owner' });
  assert.equal(store.assertFresh(store.get(prop.approvalId)).ok, true); // still fresh
  const receipt = await adapter.executeApprovedWrite({ approvalId: prop.approvalId, approvalStore: store });
  assert.equal(receipt.ok, true);
  assert.equal(receipt.status, 'executed');
  assert.equal(receipt.approver, 'owner');
  assert.equal(receipt.approvedSnapshotHash, store.get(prop.approvalId).snapshotHash); // receipt bound
  assert.ok(receipt.candidateCommit);
  assert.equal(store.get(prop.approvalId).status, 'EXECUTED');
});
