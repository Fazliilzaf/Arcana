const test = require('node:test');
const assert = require('node:assert/strict');

const {
  DEFAULT_EXPECTED_REMAINING,
  buildClosureStatus,
  buildProgressSnapshot,
  buildStabilityTimeline,
} = require('../../src/ops/closureStatus');

test('progress snapshot tracks expected and unexpected remaining blockers', () => {
  const progress = buildProgressSnapshot({
    remainingIds: ['external_pentest_evidence', 'unexpected_internal_regression'],
    expectedRemainingIds: DEFAULT_EXPECTED_REMAINING,
  });

  assert.deepEqual(progress.remainingExpectedIds, ['external_pentest_evidence']);
  assert.deepEqual(progress.remainingUnexpectedIds, ['unexpected_internal_regression']);
  assert.equal(progress.totalCount, 4);
  assert.equal(progress.completedExpectedCount, 2);
  assert.equal(progress.percent, 50);
});

test('stability timeline computes remaining days and estimated ready timestamp', () => {
  const timeline = buildStabilityTimeline({
    release: { launchedAt: '2026-02-01T12:00:00.000Z' },
    stabilityWindow: { windowDays: 14, daysSinceLaunch: 3, completed: false },
  });

  assert.equal(timeline.windowDays, 14);
  assert.equal(timeline.daysSinceLaunch, 3);
  assert.equal(timeline.remainingDays, 11);
  assert.equal(timeline.completed, false);
  assert.equal(timeline.estimatedReadyAt, '2026-02-15T12:00:00.000Z');
});

test('closure status marks expected blockers with timeline-aware message', () => {
  const closure = buildClosureStatus({
    finalization: {
      summary: {
        failedSteps: [
          'check_pentest_evidence',
          'report_release_readiness',
          'report_stability_window',
          'release_go_live_gate',
        ],
      },
    },
    releaseReadiness: {
      failedChecks: ['pentestEvidenceOk'],
    },
    stability: {
      release: {
        status: 'launched',
        releaseGateClear: true,
        launchedAt: '2026-02-10T00:00:00.000Z',
      },
      stabilityWindow: {
        status: 'in_progress',
        completed: false,
        windowDays: 14,
        daysSinceLaunch: 5,
      },
      decision: {
        readyForBroadGoLive: false,
      },
    },
  });

  assert.equal(closure.done, false);
  assert.equal(closure.progress.percent, 0);
  assert.equal(closure.timeline.remainingDays, 9);
  assert.deepEqual(
    closure.remaining.map((item) => item.id),
    DEFAULT_EXPECTED_REMAINING
  );
  const stabilityEntry = closure.remaining.find((item) => item.id === 'stability_window_14_30d');
  assert.ok(stabilityEntry.reason.includes('kvar: 9 dagar'));
  assert.ok(stabilityEntry.reason.includes('2026-02-24T00:00:00.000Z'));
});

test('closure status requires explicit final live signoff lock when available', () => {
  const baseInput = {
    finalization: {
      summary: {
        failedSteps: [],
      },
    },
    releaseReadiness: {
      failedChecks: [],
    },
    stability: {
      release: {
        status: 'launched',
        releaseGateClear: true,
        launchedAt: '2026-02-10T00:00:00.000Z',
        finalLiveSignoff: {
          locked: false,
          lockedAt: null,
          lockedBy: null,
          note: '',
        },
      },
      stabilityWindow: {
        status: 'pass',
        completed: true,
        windowDays: 14,
        daysSinceLaunch: 16,
      },
      decision: {
        readyForBroadGoLive: true,
      },
    },
  };

  const pending = buildClosureStatus(baseInput);
  assert.equal(pending.formalSignoffPending, true);
  assert.ok(pending.remaining.some((item) => item.id === 'formal_live_signoff'));

  const locked = buildClosureStatus({
    ...baseInput,
    stability: {
      ...baseInput.stability,
      release: {
        ...baseInput.stability.release,
        finalLiveSignoff: {
          locked: true,
          lockedAt: '2026-02-26T12:00:00.000Z',
          lockedBy: 'owner-1',
          note: 'final lock',
        },
      },
    },
  });
  assert.equal(locked.formalSignoffPending, false);
  assert.equal(locked.done, true);
  assert.equal(locked.finalLiveSignoff.locked, true);
  assert.equal(locked.finalLiveSignoff.lockedBy, 'owner-1');
});
