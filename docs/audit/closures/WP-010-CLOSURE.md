# WP-010 — Approval Center + Controlled Write · CANONICAL CLOSURE RECORD

**Status:** `WP-010 — VERIFIED CLOSED / DEPLOYED` · closed 2026-09-07

Provenance: `[VERIFIED]` = reproduced from this repository / measured against
production by the Deploy Operator (DeepSeek). `[RELAYED]` = reported by another
party (Kimi Red Team) and recorded, not re-derived here.

---

## 1. Objective

WP-010 (Approval Center + Controlled Write) — ett controlled-write-flöde där en
CMO-agent kan föreslå WRITE-candidates mot ett allowlistat repo, men aldrig
exekvera utan ett server-verifierat OWNER-godkännande som binder till EXAKT
kandidat-innehåll. Två säkerhetsblockers hittades i red team och åtgärdades:

- **B-1** — approval-snapshot var inte bunden till kandidatens CONTENT
  (bara baseSha + changedFiles + diffstat).
- **B-2** — client-styrd `task_id` kunde traversera ut ur task-worktree-roten
  och peka på canonical checkout (`CANONICAL MUST NEVER MUTATE` bruten).
- **B-1 residual** — `git status --porcelain` (newline) quote-escapes ovanliga
  filnamn → filen tappade content-bindning.

## 2. Findings

**B-1** — snapshot band `baseSha + changedFiles + diffstat` (linjantal), inte
filinnehåll. Untracked filers bytes och tracked filers innehåll kunde ändras
efter proposal medan hashen förblev giltig → stale approval exekverar annat
innehåll.

**B-2** — `_resolveWorktree`/`createTaskWorktree` körde `path.join(worktreesRoot,
taskId)` med client-styrd task_id; `../cmo-canonical-repos/test-web` löste
canonical checkout som task-worktree → ordinary DRAFT skrev rakt in i canonical
utan approval.

**B-1 residual** — porcelain (newline) citerar `"`, `\`, non-ASCII → det citerade
namnet matchade inte filsystemet → `contentSha256:null` för en existerande fil.

## 3. History (Builder + Red Team)

| Step | Artefact | Verdict |
| ---- | -------- | ------- |
| Builder (DeepSeek) B-1/B-2 | `a2822c3514c2d7ab9394fe3e5076c15a20d53d99` | Kimi **FAIL** — B-1, B-2 `[RELAYED]` |
| Builder (DeepSeek) B-1 residual | `9c32b383b8f3a1578a958ee4ca89a0cd4b76dc06` | Kimi **PASS** — B-1/B-2/B-1-residual CLOSED `[RELAYED]` |
| Controlled deploy | merge `fa86c66db7f370db3e5910061a9751a0d26e6b5f` | **PASS** `[VERIFIED]` |

Kimi final: `BLOCKER RE-CHECK: PASS` · `NEW BLOCKERS: NONE` ·
`CAN PROCEED TO WP-010 CLOSURE: YES` `[RELAYED]`.

## 4. Integration `[VERIFIED]`

```
PRE-MERGE MAIN SHA  3fe015145945d93c2a3ef3410feb62375ec29847
VERIFIED WP-010 SHA 9c32b383b8f3a1578a958ee4ca89a0cd4b76dc06
                    (ancestor: a2822c3514c2d7ab9394fe3e5076c15a20d53d99)
METHOD              git merge --no-ff origin/wp-010-b1-b2-remediation
CONFLICTS           0
MERGE SHA           fa86c66db7f370db3e5910061a9751a0d26e6b5f
                    (parents: 3fe01514 + 9c32b383)
FILES               4
  src/security/cmoRepoAdapter.js
  src/security/repoWorktree.js
  tests/security/wp010B1B2Remediation.test.js
  tests/security/wp010B1ResidualQuoting.test.js
```

`main` advanced `0` commits since the WP-010 base (3fe01514) — no overlap, no
security conflict was resolved.

## 5. Merged implementation contains `[VERIFIED]`

- content-bound snapshot (`computeContentSnapshotHash` + `getContentSnapshotEntries`)
- quoting-safe filename handling (`git status --porcelain=v1 -z`)
- fail-closed unreadable snapshot (`snapshot_content_unreadable`)
- task-id/path-traversal protection (`isValidTaskId` + `resolveTaskWorktreeDir`)
- execution re-check (`checkCandidateSnapshot` + `verifyWriteSnapshot`)
- receipt binding (`approvedSnapshotHash`)

## 6. Pre-deploy test gate `[VERIFIED]`

Run on Node v26.8.1 against the merge commit `fa86c66d`.

```
WP-010 targeted/security suite   110/110
check:syntax                    exit 0
lint:no-bypass                  exit 0
FULL REGRESSION                 8679 total · 8678 pass · 1 fail
pre-existing failure            1  (tests/tenant/tenantIdCanonical.test.js — orelaterad)
new failures                    0
```

## 7. Deploy `[VERIFIED]`

```
EXPECTED (merge) SHA  fa86c66db7f370db3e5910061a9751a0d26e6b5f
ACTUAL LIVE SHA       fa86c66db7f370db3e5910061a9751a0d26e6b5f
```

Live SHA measured via canonical build evidence:

```
$ curl -sD - -o /dev/null https://arcana.hairtpclinic.com/major-arcana-preview/
HTTP/2 200
x-arcana-preview-build: fa86c66db7f370db3e5910061a9751a0d26e6b5f
x-arcana-preview-integrity: verified
```

## 8. Production-safe verification `[VERIFIED]`

No destructive/unsafe repo operation was executed to prove the attack. Live
artifact SHA matches the verified merge SHA (byte-identical artifact).

- **B-1** — content-bound snapshot + quoting-safe + fail-closed present in the
  deployed artifact (verified statically against `fa86c66d`; behavioral proof at
  test level 110/110 + Kimi 100/100 `[RELAYED]`).
- **B-2** — `isValidTaskId`/`resolveTaskWorktreeDir` present in the deployed
  artifact. Unauthenticated probe → `401` (route mounted, auth middleware intact;
  no claim of full behavioral B-2 from an unauthenticated probe).
- **Receipt/execution binding** — `checkCandidateSnapshot` + `approvedSnapshotHash`
  present in the deployed artifact.
- **Health** — `GET /healthz` → `200`, `GET /readyz` → `200`. No startup/security 5xx.

## 9. Production safety during this deploy `[VERIFIED]`

```
REAL CUSTOMER/PATIENT DATA ACCESSED   NO
REAL CUSTOMER/PATIENT DATA MUTATED    NO
CUSTOMER COMMUNICATION SENT           NO
REPOSITORY CONTENT MUTATED BY SMOKE   NO
ENVIRONMENT CHANGED                   NO
ROLLBACK REQUIRED                     NO
```

## 10. Known pre-existing regression (not a WP-010 blocker)

`tests/tenant/tenantIdCanonical.test.js` — "varje Hair TP-variant är grundad i
data" fails identically on the pre-WP-010 base (3fe01514). Unrelated to WP-010.

## 11. Backlog — preserved, not fixed

BK-1 approval TTL direct-call hardening · BK-2 stuck APPROVED lifecycle ·
BK-3 global task-map scoping · BK-4 multi-process race · BK-5 empty candidate
robustness · BK-6 chat prefix matching. None was touched; scope was not expanded.

## 12. No self-verification claim

Security correctness was verified independently by **Kimi (Red Team)**
`[RELAYED]` — DeepSeek's role here is integration + test gate + controlled
deploy + production-safe verification + closure record, not independent
re-approval of its own implementation.

## 13. Verdict

```
FINAL VERDICT      PASS
WP-010             VERIFIED CLOSED / DEPLOYED
NEW BLOCKERS       NONE
```
