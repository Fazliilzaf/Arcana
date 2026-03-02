const test = require('node:test');
const assert = require('node:assert/strict');

const { simulateScenarios } = require('../../src/intelligence/scenarioEngine');

test('Scenario engine returns default scenario set and computes deltas', () => {
  const result = simulateScenarios({
    baseline: {
      healthScore: 74,
      slaBreachRate: 0.09,
      complaintRate: 0.12,
      conversionSignal: 0.41,
      workloadMinutes: 52,
      volatilityIndex: 0.33,
    },
  });

  assert.equal(Array.isArray(result.scenarios), true);
  assert.equal(result.scenarios.length >= 4, true);
  assert.equal(typeof result.scenarios[0].delta.healthScore, 'number');
  assert.equal(result.worstCase !== null, true);
  assert.equal(result.bestCase !== null, true);
});

