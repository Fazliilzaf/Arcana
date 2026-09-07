# WP-011 — Approval TTL Direct-Call Hardening · CANONICAL CLOSURE RECORD

**Status:** `WP-011 — VERIFIED CLOSED / DEPLOYED` · closed 2026-09-07

Provenance: `[VERIFIED]` = reproduced from this repository / measured against
production by the Deploy Operator (DeepSeek). `[RELAYED]` = reported by another
party (Kimi Red Team) and recorded, not re-derived here.

> **Provenance honesty:** WP-011 did NOT exist as a formally defined work package
> before this point. It was assigned AFTER WP-010 closure (2026-09-07) from the
> preserved WP-010 backlog item **BK-1 — approval TTL direct-call hardening**.
> This record does not imply WP-011 existed earlier.

---

## 1. Objective

Determine whether an approval that should be **expired** could still be
**consumed / executed / accepted / receipted** through any active direct-call
path, i.e. by calling internal approval-execution functions instead of entering
via the guarded route/service path. WP-011 hardens the WP-010 Approval Center so
that TTL/expiry is enforced at the **irreversible execution authority boundary**,
not only at the approval step.

Frozen security contract: an approval is executable only while
`APPROVED AND fresh AND all WP-010 snapshot invariants`.

## 2. Source backlog item

`WP-010 BK-1 — approval TTL direct-call hardening` (preserved, not fixed, in the
WP-010 closure record §11).

## 3. Design Gate (DeepSeek Auditor / Design Gate)

Finding: **CONFIRMED.** TTL was checked only at `approve()`/`listPending()`; the
execution boundary (`execute`, `verifyWriteSnapshot`, `executeApprovedWrite`) did
not consult TTL, so an expired-but-`APPROVED` record could still execute /
receipt. Additionally `isExpired` **failed open** on malformed/missing/future
`requestedAt`. Human gates: **NONE** (TTL duration already defined, default 24h).

## 4. Builder

- Builder SHA: `2f711e43ed686dfa981c5922d3d5b5dc8790cb75`
- Branch: `wp-011-approval-ttl-builder`
- Scope (4 files): `src/security/approvalRequestStore.js`,
  `src/security/cmoRepoAdapter.js`, `tests/security/wp011TtlHardening.test.js`,
  `tests/security/wp011TtlStaticGuard.test.js`.

## 5. Independent Red Team (Kimi)

`[RELAYED]` — Direct-call PASS · TTL core PASS · TOCTOU PASS ·
retry/replay/reload PASS · zero-side-effect PASS · WP-010 composition PASS ·
independent full regression PASS · new blockers **NONE** ·
`CAN PROCEED TO DEPLOY: YES`.

## 6. Integration (controlled) `[VERIFIED]`

```
PRE-MERGE MAIN SHA  f2c6d93df27168dbbfa999478b0265dbcbc21c13  (WP-010 closure)
VERIFIED WP-011 SHA 2f711e43ed686dfa981c5922d3d5b5dc8790cb75
METHOD              git merge --no-ff origin/wp-011-approval-ttl-builder
CONFLICTS           0
MERGE SHA           52e023614210b9328df016af531a3af5332e38bb
                    (parents: f2c6d93d + 2f711e43)
FILES               4 (identical to Builder scope)
```

`main` advanced `0` commits since the WP-011 base (f2c6d93d) → no overlap, no
security conflict was resolved. Verified no `src/security/approvalRequestStore.js`
/ `src/security/cmoRepoAdapter.js` drift between Builder and merge.

## 7. TTL semantics (single source of truth) `[VERIFIED]`

- **Source timestamp:** persisted `requestedAt` (ISO, set at `create()`). NOT
  `approvedAt`.
- **TTL:** existing approval-store TTL — `createApprovalRequestStore({ ttlMs =
  24h })`; live default `24 * 60 * 60 * 1000`.
- **Boundary:** expired when `Date.parse(requestedAt) + ttlMs <= now` (`<=`
  preserved from prior semantics).
- **Fail closed:** missing/empty/malformed/non-finite `requestedAt` → expired;
  materially future `requestedAt` (`at > now`) → expired. No timestamp guessing
  (never replaced by `now`/`approvedAt`/default).
- **Canonical helper:** `approvalStore.assertFresh(rec, now = Date.now())` →
  `{ok:true}` or `{ok:false, reason:'expired'}`. Single source consumed by
  `approve`, `listPending`, `execute`, `verifyWriteSnapshot`.

## 8. Direct-call closure `[VERIFIED]`

- `approvalStore.execute(id)` — freshness required before `APPROVED → EXECUTED`;
  on deny returns `null`, no `executedAt`, no `EXECUTED`.
- `cmoRepoAdapter.verifyWriteSnapshot(...)` — enforces `approvalStore.assertFresh`
  at the execution authority boundary (before `commitCandidate`); requires the
  helper on the store (else `approval_store_unavailable`, fail closed); no
  independent `Date.now()`/`Date.parse` TTL calc.
- `cmoRepoAdapter.executeApprovedWrite(...)` — reaches `commitCandidate` only via
  `verifyWriteSnapshot`; an expired approval cannot reach `commitCandidate`.

## 9. TOCTOU closure `[VERIFIED]`

Snapshot re-check (WP-010) and freshness re-check (WP-011) both run at the
execution authority boundary. An approval fresh at approve-time but expired
before execution is denied (`T-011`). Retry/replay/reload all re-check via the
persisted `requestedAt` (`T-012…T-014`).

## 10. Zero-side-effect contract `[VERIFIED]`

An expired/unprovable approval yields ZERO irreversible side effects: no repo
mutation, no commit, no `EXECUTED`, no `executedAt`, no success receipt, no
success audit (`T-015…T-019`).

## 11. WP-010 composition `[VERIFIED]`

WP-010 invariants remain intact and are **additive** to WP-011:
1. content-bound snapshot (`computeContentSnapshotHash`)
2. quoting-safe filename (`git status --porcelain=v1 -z`)
3. unreadable-content fail-closed (`snapshot_content_unreadable`)
4. task-id validation (`isValidTaskId`)
5. realpath/worktree containment (`resolveTaskWorktreeDir`)
6. execution snapshot re-check (`checkCandidateSnapshot` + `verifyWriteSnapshot`)
7. receipt snapshot binding (`approvedSnapshotHash`)

Combinations verified: TTL-valid + snapshot-stale → DENY via WP-010
(`snapshot_mismatch`); TTL-expired + snapshot-valid → DENY via WP-011
(`expired`); both valid → legitimate execution allowed.

## 12. Tests `[VERIFIED]`

WP-011 `wp011TtlHardening.test.js` (T-001…T-026) +
`wp011TtlStaticGuard.test.js` (T-027) — 19/19.
WP-010 + approval/adapter — 75/75 (incl. WP-011 targeted).
Full `tests/security/*` — 401/401.
`check:syntax` exit 0 · `lint:no-bypass` exit 0.
Full regression (integrated merge 52e02361): **8698 total, 8697 pass, 1
pre-existing fail** (`tests/tenant/tenantIdCanonical.test.js` — unrelated,
matches documented WP-010 baseline). **0 new WP-011 failures.**

## 13. Deploy + production-safe evidence `[VERIFIED]`

```
EXPECTED (merge) SHA  52e023614210b9328df016af531a3af5332e38bb
ACTUAL LIVE SHA       52e023614210b9328df016af531a3af5332e38bb   (x-arcana-preview-build, integrity: verified)
```

Health: `GET /healthz` → 200, `GET /readyz` → 200. No new startup/security 5xx.
Production-safe TTL verification via deployed-artifact structural inspection +
pre-deploy behavioral tests + byte-identical deployed artifact. **No real
customer/patient/repository work was mutated; no real production approval was
created for smoke.**

## 14. Real side effects

```
REAL CUSTOMER/PATIENT DATA ACCESSED   NO
REAL CUSTOMER/PATIENT DATA MUTATED    NO
CUSTOMER COMMUNICATION SENT           NO
REAL PRODUCTION REPOSITORY MUTATED    NO
REAL APPROVAL CREATED FOR SMOKE       NO
ENVIRONMENT CHANGED                   NO
ROLLBACK REQUIRED                     NO
```

## 15. Known backlog (preserved, NOT fixed)

BK-2 stuck APPROVED lifecycle · BK-3 global task-map scoping · BK-4 multi-process
race · BK-5 empty-candidate robustness · BK-6 chat prefix matching. Unrelated
approval systems (e.g. `ccoTemplateVersionApprovalStore`, CFO/patientIdentity
approvals) are separate concepts and out of scope.

## 16. Verdict

```
FINAL VERDICT      PASS
WP-011             VERIFIED CLOSED / DEPLOYED
NEW BLOCKERS       NONE
```
