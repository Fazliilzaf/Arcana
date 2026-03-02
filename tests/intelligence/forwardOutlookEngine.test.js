const test = require('node:test');
const assert = require('node:assert/strict');

const { computeForwardOutlook } = require('../../src/intelligence/forwardOutlookEngine');

function point(day, values = {}) {
  return {
    ts: `2026-02-${String(day).padStart(2, '0')}T09:00:00.000Z`,
    complaintRate: values.complaintRate,
    bookingPressure: values.bookingPressure,
    slaBreachRate: values.slaBreachRate,
    healthScore: values.healthScore,
  };
}

test('Forward outlook projects risk and capacity forecast from 14 day signals', () => {
  const signals = [];
  for (let day = 10; day <= 23; day += 1) {
    const index = day - 10;
    signals.push(
      point(day, {
        complaintRate: 0.08 + index * 0.006,
        bookingPressure: 0.3 + index * 0.008,
        slaBreachRate: 0.03 + index * 0.002,
        healthScore: 84 - index * 1.1,
      })
    );
  }

  const result = computeForwardOutlook({
    dailySignals: signals,
    windowDays: 14,
    forecastDays: 7,
    nowIso: '2026-02-23T13:00:00.000Z',
  });

  assert.equal(typeof result.riskForecast.type, 'string');
  assert.equal(typeof result.capacityForecast.level, 'string');
  assert.equal(result.confidenceScore >= 0, true);
  assert.equal(result.confidenceScore <= 1, true);
  assert.equal(Array.isArray(result.recommendedPreparation), true);
  assert.equal(result.recommendedPreparation.length >= 1, true);
});

