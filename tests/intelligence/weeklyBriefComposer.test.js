const test = require('node:test');
const assert = require('node:assert/strict');

const { composeWeeklyBrief } = require('../../src/intelligence/weeklyBriefComposer');

test('Weekly brief switches to focus mode and limits recommendations to 3', () => {
  const result = composeWeeklyBrief({
    focusContext: {
      isActive: true,
      primaryDrivers: ['sla_breach', 'complaint_spike', 'conversion_drop', 'volatility'],
      severity: 'high',
    },
    usageMetrics: {
      slaBreachTrendPercent: 21,
      complaintTrendPercent: 18,
      conversionTrendPercent: -12,
    },
  });

  assert.equal(result.mode, 'focus');
  assert.equal(result.priorityOrder[0], 'stabilization');
  assert.equal(result.recommendations.length <= 3, true);
  assert.equal(result.sections[0].title.includes('Stabiliserings'), true);
});

test('Weekly brief keeps normal structure when focus is inactive', () => {
  const result = composeWeeklyBrief({
    focusContext: { isActive: false },
    usageMetrics: {
      slaBreachTrendPercent: 2,
      complaintTrendPercent: -4,
      conversionTrendPercent: 3,
      avgResponseTimeHours: 4.5,
      ccoUsageRate: 0.8,
      systemRecommendationFollowRate: 0.72,
      volatilityIndex: 0.2,
    },
  });

  assert.equal(result.mode, 'normal');
  assert.equal(result.priorityOrder[0], 'strategic_signals');
  assert.equal(result.sections.length >= 4, true);
  assert.equal(result.recommendations.length >= 1, true);
});
