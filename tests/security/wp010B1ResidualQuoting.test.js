'use strict';

/**
 * WP-010 B-1 RESIDUAL — quoting-safe content snapshot.
 *
 * `git status --porcelain` (newline) quote-escapes ovanliga filnamn (non-ASCII,
 * `"`, `\`). Det citerade namnet matchade inte filsystemet → contentSha256:null
 * för en existerande fil → innehållet var INTE bundet till snapshoten.
 *
 * Fix: `--porcelain=v1 -z` (NUL-separerad, unquoted) + fail-closed om en
 * non-deletion fil inte kan content-hashas.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const { createCmoRepoAdapter } = require('../../src/security/cmoRepoAdapter');
const { createApprovalRequestStore } = require('../../src/security/approvalRequestStore');
const { getContentSnapshotEntries } = require('../../src/security/repoWorktree');

function tmpdir() { return fs.mkdtempSync(path.join(os.tmpdir(), 'wp010b1q-')); }
function git(cwd, args) { return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim(); }

function makeFixtureRepo() {
  const dir = tmpdir();
  git(dir, ['init', '-q']);
  fs.writeFileSync(path.join(dir, 'index.md'), '# Rubrik X\n\nPilot.\n');
  git(dir, ['add', '.']);
  git(dir, ['-c', 'user.email=t@t.se', '-c', 'user.name=t', 'commit', '-qm', 'init']);
  return { dir, branch: git(dir, ['rev-parse', '--abbrev-ref', 'HEAD']) };
}

const FIXTURE_REPOS = (fixture) => ({
  'pilot-fixture': {
    repoId: 'pilot-fixture', gitUrl: fixture.dir, defaultBranch: fixture.branch,
    canonicalHead: null, buildCommands: [], previewCommands: [['node', '-e', "console.log('ok')"]],
  },
});

const ACTOR = { userId: 'anna', role: 'PERSONAL' };
const TENANT = 'hair-tp-clinic';

/** DRAFT index.md + skapa en untracked fil med ett speciellt filnamn, sedan propose. */
async function proposeWithSpecialFile(filename, content) {
  const fixture = makeFixtureRepo();
  const repos = FIXTURE_REPOS(fixture);
  const adapter = createCmoRepoAdapter({ canonicalRoot: tmpdir(), worktreesRoot: tmpdir(), resolveRepoFn: (id) => repos[id] || null });
  const approvalStore = await createApprovalRequestStore({ filePath: path.join(tmpdir(), 'approvals.json') });

  const draft = adapter.executeRepoTask({
    repoId: 'pilot-fixture', tool: 'cmo.content.draft',
    args: { repo_id: 'pilot-fixture', path: 'index.md', content: '# Rubrik Y\n' }, actor: ACTOR, tenantId: TENANT, taskId: 'task-q',
  });
  assert.equal(draft.ok, true);
  const worktreeDir = draft.worktree;
  fs.writeFileSync(path.join(worktreeDir, filename), content);

  const proposal = await adapter.proposeWriteCandidate({
    repoId: 'pilot-fixture', taskId: 'task-q', args: { path: 'index.md' }, actor: ACTOR, tenantId: TENANT, approvalStore,
  });
  assert.equal(proposal.status, 'pending_approval');
  return { adapter, approvalStore, approval: approvalStore.get(proposal.approvalId), worktreeDir };
}

const QUOTED_CASES = [
  { name: 'non-ASCII', filename: 'återkoppling.html' },
  { name: 'quote', filename: 'ev"il.txt' },
  { name: 'backslash', filename: 'back\\slash.txt' },
];

for (const { name, filename } of QUOTED_CASES) {
  test(`B1-QUOTED ${name}: filnamnet är content-bundet (ej null)`, async () => {
    const ctx = await proposeWithSpecialFile(filename, 'GOOD');
    const entries = getContentSnapshotEntries(ctx.worktreeDir);
    const entry = entries.find((e) => e.path === filename);
    assert.ok(entry, `förväntade entry för ${JSON.stringify(filename)}`);
    assert.ok(entry.contentSha256, `contentSha256 får inte vara null för existerande ${JSON.stringify(filename)}`);
    assert.notEqual(entry.contentSha256, null);
  });

  test(`B1-QUOTED ${name}: innehållsbyte efter propose → snapshot_mismatch`, async () => {
    const ctx = await proposeWithSpecialFile(filename, 'GOOD');
    fs.writeFileSync(path.join(ctx.worktreeDir, filename), 'EVIL');
    const check = ctx.adapter.checkCandidateSnapshot(ctx.approval);
    assert.equal(check.ok, false, `innehållsbyte på ${JSON.stringify(filename)} fick inte passera`);
    assert.equal(check.reason, 'snapshot_mismatch');
  });

  test(`B1-QUOTED ${name}: godkänd + utbytt innehåll → execute DENY (ej ok)`, async () => {
    const ctx = await proposeWithSpecialFile(filename, 'GOOD');
    await ctx.approvalStore.approve(ctx.approval.id, { approver: 'owner' });
    fs.writeFileSync(path.join(ctx.worktreeDir, filename), 'EVIL');
    const receipt = await ctx.adapter.executeApprovedWrite({ approvalId: ctx.approval.id, approvalStore: ctx.approvalStore });
    assert.equal(receipt.ok, false, 'stale approval får inte exekveras');
    assert.equal(receipt.reason, 'snapshot_mismatch');
    assert.equal(ctx.approvalStore.get(ctx.approval.id).status, 'APPROVED', 'får inte bli EXECUTED');
  });
}

test('B1 fail-closed: non-deletion fil som inte kan content-hashas → snapshot_content_unreadable', async () => {
  const fixture = makeFixtureRepo();
  const repos = FIXTURE_REPOS(fixture);
  const adapter = createCmoRepoAdapter({ canonicalRoot: tmpdir(), worktreesRoot: tmpdir(), resolveRepoFn: (id) => repos[id] || null });
  const approvalStore = await createApprovalRequestStore({ filePath: path.join(tmpdir(), 'approvals.json') });

  const draft = adapter.executeRepoTask({
    repoId: 'pilot-fixture', tool: 'cmo.content.draft',
    args: { repo_id: 'pilot-fixture', path: 'index.md', content: '# Rubrik Y\n' }, actor: ACTOR, tenantId: TENANT, taskId: 'task-fc',
  });
  const worktreeDir = draft.worktree;
  // Broken symlink (untracked, non-deletion) → readFileSync följer och ENOENT.
  fs.symlinkSync('nonexistent-target', path.join(worktreeDir, 'broken-link'));

  const proposal = await adapter.proposeWriteCandidate({
    repoId: 'pilot-fixture', taskId: 'task-fc', args: { path: 'index.md' }, actor: ACTOR, tenantId: TENANT, approvalStore,
  });
  assert.equal(proposal.ok, false, 'propose ska fail closed vid oläsbar kandidatfil');
  assert.equal(proposal.reason, 'snapshot_content_unreadable');
  assert.equal(approvalStore.listAll().length, 0, 'ingen approval-request skapas vid fail closed');
});
