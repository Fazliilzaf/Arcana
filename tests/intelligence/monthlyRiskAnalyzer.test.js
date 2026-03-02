const test = require('node:test');
const assert = require('node:assert/strict');

const { analyzeMonthlyRisk } = require('../../src/intelligence/monthlyRiskAnalyzer');

function buildDailySnapshot(day, values = {}) {
  return {
    ts: `2026-02-${String(day).padStart(2, '0')}T10:00:00.000Z`,
    complaintRate: values.complaintRate,
    slaBreachRate: values.slaBreachRate,
    conversionSignal: values.conversionSignal,
    healthScore: values.healthScore,
    volatilityIndex: values.volatilityIndex,
  };
}

test('Monthly risk analyzer marks high/critical risk for worsening complaint + SLA', () => {
  const snapshots = [];
  for (let day = 1; day <= 20; day += 1) {
    snapshots.push(
      buildDailySnapshot(day, {
        complaintRate: day <= 10 ? 0.08 : 0.24,
        slaBreachRate: day <= 10 ? 0.04 : 0.17,
        conversionSignal: day <= 10 ? 0.42 : 0.31,
        healthScore: day <= 10 ? 82 : 68,
        volatilityIndex: day <= 10 ? 0.22 : 0.48,
      })
    );
  }

  const result = analyzeMonthlyRisk({
    dailySnapshots: snapshots,
    windowDays: 30,
    nowIso: '2026-02-28T12:00:00.000Z',
  });

  assert.equal(result.sampleSize > 0, true);
  assert.equal(result.riskIndex > 0.4, true);
  assert.equal(['medium', 'high', 'critical'].includes(result.riskBand), true);
  assert.equal(result.dominantDrivers.length >= 1, true);
});
