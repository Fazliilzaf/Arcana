'use strict';

/**
 * WP-011 — Static regression guard (T-027).
 *
 * Narrowly scoped structural evidence that the active approval-consumption
 * authority boundaries are wired to the SINGLE canonical freshness helper
 * (`approvalStore.assertFresh`) and that no parallel TTL interpretation exists
 * in the adapter.
 *
 * Purpose: a future contributor must not be able to remove the execution-time
 * TTL check while the route/store tests still pass. Scoped to exactly the two
 * in-scope files; no repo-global grep, no unrelated false positives.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SRC = path.join(__dirname, '..', '..', 'src', 'security');

test('T-027 static guard: no parallel TTL implementation; execution boundaries use canonical helper', () => {
  const store = fs.readFileSync(path.join(SRC, 'approvalRequestStore.js'), 'utf8');
  const adapter = fs.readFileSync(path.join(SRC, 'cmoRepoAdapter.js'), 'utf8');

  // Store: canonical fail-closed expiry truth must exist.
  assert.match(store, /function isExpired\(rec, now = Date\.now\(\)\)/);
  assert.match(store, /if \(!Number\.isFinite\(at\)\) return true;/); // malformed/missing -> fail closed
  assert.match(store, /if \(at > now\) return true;/);                // future -> fail closed
  assert.match(store, /function assertFresh\(rec, now = Date\.now\(\)\)/);
  // Store: single source exported for consumers.
  assert.match(store, /\n\s*assertFresh,?\n/);

  // Store: execute() gates on freshness BEFORE the irreversible APPROVED->EXECUTED.
  assert.match(store, /async function execute\(id\)[\s\S]*if \(isExpired\(rec\)\) return null;/);

  // Adapter: verifyWriteSnapshot must require AND call the canonical helper
  // at the execution authority boundary.
  const verifyBlock = adapter.slice(adapter.indexOf('async function verifyWriteSnapshot'), adapter.indexOf('async function executeApprovedWrite'));
  assert.match(verifyBlock, /typeof approvalStore\.assertFresh !== 'function'/); // store without helper -> fail closed
  assert.match(verifyBlock, /approvalStore\.assertFresh\(approval\)/);           // canonical helper invoked
  assert.ok(verifyBlock.indexOf('Date.now()') === -1, 'verifyWriteSnapshot must not compute its own TTL (no Date.now)');
  assert.ok(verifyBlock.indexOf('Date.parse') === -1, 'verifyWriteSnapshot must not re-implement TTL (no Date.parse)');

  // Adapter: executeApprovedWrite must delegate via verifyWriteSnapshot, and MUST
  // NOT introduce a parallel independent freshness calculation of its own.
  const execBlock = adapter.slice(adapter.indexOf('async function executeApprovedWrite'));
  assert.match(execBlock, /verifyWriteSnapshot\(approvalId, approvalStore\)/); // delegation (single path)
  assert.ok(execBlock.indexOf('Date.now()') === -1, 'executeApprovedWrite must not compute its own TTL');
  assert.ok(execBlock.indexOf('Date.parse') === -1, 'executeApprovedWrite must not re-implement TTL');
});
