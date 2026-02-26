const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildWindowSummary,
  buildStabilityDecision,
  isReleaseGateClear,
} = require('../../src/ops/stabilityWindow');

const NOW_MS = Date.parse('2026-02-26T12:00:00.000Z');

test('stability window returns not_launched without launch timestamp', () => {
  const summary = buildWindowSummary({
    entries: [],
    windowDays: 14,
    launchedAt: null,
    nowMs: NOW_MS,
  });

  assert.equal(summary.status, 'not_launched');
  assert.equal(summary.completed, false);
  assert.equal(summary.hasNoGoTrigger, false);
  assert.ok(summary.reasons.includes('release_not_launched'));
});

test('stability window is in_progress with clean daily coverage before window completion', () => {
  const launchedAt = '2026-02-24T00:00:00.000Z';
  const summary = buildWindowSummary({
    windowDays: 14,
    launchedAt,
    nowMs: NOW_MS,
    entries: [
      {
        ts: '2026-02-24T12:00:00.000Z',
        goAllowed: true,
        triggeredNoGo: 0,
        blockingRequiredChecks: 0,
        score: 91,
      },
      {
        ts: '2026-02-25T12:00:00.000Z',
        goAllowed: true,
        triggeredNoGo: 0,
        blockingRequiredChecks: 0,
        score: 92,
      },
      {
        ts: '2026-02-26T10:00:00.000Z',
        goAllowed: true,
        triggeredNoGo: 0,
        blockingRequiredChecks: 0,
        score: 93,
      },
    ],
  });

  assert.equal(summary.status, 'in_progress');
  assert.equal(summary.completed, false);
  assert.equal(summary.daysSinceLaunch, 3);
  assert.equal(summary.expectedDays, 3);
  assert.equal(summary.daysCovered, 3);
  assert.equal(summary.coveragePercent, 100);
  assert.equal(summary.hasNoGoTrigger, false);
  assert.ok(summary.reasons.includes('window_not_complete_yet'));
});

test('stability window fails when no-go signal appears after launch', () => {
  const launchedAt = '2026-02-10T00:00:00.000Z';
  const summary = buildWindowSummary({
    windowDays: 14,
    launchedAt,
    nowMs: NOW_MS,
    entries: [
      {
        ts: '2026-02-20T12:00:00.000Z',
        goAllowed: true,
        triggeredNoGo: 0,
        blockingRequiredChecks: 0,
        score: 95,
      },
      {
        ts: '2026-02-21T12:00:00.000Z',
        goAllowed: true,
        triggeredNoGo: 1,
        blockingRequiredChecks: 0,
        score: 85,
      },
      {
        ts: '2026-02-22T12:00:00.000Z',
        goAllowed: true,
        triggeredNoGo: 0,
        blockingRequiredChecks: 0,
        score: 90,
      },
    ],
  });

  assert.equal(summary.status, 'fail');
  assert.equal(summary.hasNoGoTrigger, true);
  assert.equal(summary.maxTriggeredNoGo, 1);
  assert.ok(summary.reasons.includes('window_contains_no_go_or_blocking_checks'));
});

test('stability decision requires clear release gate and passing window', () => {
  const passDecision = buildStabilityDecision({
    releaseEvaluation: {
      releaseGatePassed: true,
      blockers: [],
    },
    windowSummary: {
      status: 'pass',
      hasNoGoTrigger: false,
    },
    requireCompleteWindow: true,
  });
  assert.equal(passDecision.overallStatus, 'pass');
  assert.equal(passDecision.readySoFar, true);
  assert.equal(passDecision.readyForBroadGoLive, true);

  const failDecision = buildStabilityDecision({
    releaseEvaluation: {
      releaseGatePassed: false,
      blockers: [{ id: 'readiness_gate_failed' }],
    },
    windowSummary: {
      status: 'in_progress',
      hasNoGoTrigger: false,
    },
    requireCompleteWindow: true,
  });
  assert.equal(failDecision.overallStatus, 'fail');
  assert.equal(failDecision.readySoFar, false);
  assert.equal(failDecision.readyForBroadGoLive, false);
  assert.ok(failDecision.reasons.includes('release_gate_or_blockers_not_clear'));
  assert.ok(failDecision.reasons.includes('complete_stability_window_required'));
});

test('isReleaseGateClear requires gate pass and zero blockers', () => {
  assert.equal(isReleaseGateClear({ releaseGatePassed: true, blockers: [] }), true);
  assert.equal(isReleaseGateClear({ releaseGatePassed: true, blockers: [{ id: 'x' }] }), false);
  assert.equal(isReleaseGateClear({ releaseGatePassed: false, blockers: [] }), false);
});
